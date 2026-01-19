import seedrandom from 'seedrandom'
import type { Pokemon, Region } from '@/types'
import { TIER_COLORS, type BSTTier, type BoardColor } from '@/types/board'
import { getEvolutionFamily } from '@/data/evolutionFamilies'
import { getPrimaryType } from '@/lib/typeIcons'

export interface BoardSlot {
  color: BoardColor
  tier: BSTTier
  pokemon?: Pokemon
}

export interface RandomizerConfig {
  regions: Region[]
  favorites: Pokemon[]
  seed: string
}

export interface BoardAssignment {
  properties: BoardSlot[]
  seed: string
}

// Property slots per color (matching Monopoly layout)
// Very Common: 2 + 2 = 4 properties
// Common: 3 + 3 = 6 properties
// Rare: 3 + 3 = 6 properties
// Ultra Rare: 3 + 3 = 6 properties
// Total: 22 properties
const BOARD_LAYOUT: { tier: BSTTier; colorIndex: 0 | 1; count: number }[] = [
  { tier: 'very-common', colorIndex: 0, count: 2 },  // Brown (2)
  { tier: 'very-common', colorIndex: 1, count: 2 },  // Light Blue (2)
  { tier: 'common', colorIndex: 0, count: 3 },       // Pink (3)
  { tier: 'common', colorIndex: 1, count: 3 },       // Orange (3)
  { tier: 'rare', colorIndex: 0, count: 3 },         // Red (3)
  { tier: 'rare', colorIndex: 1, count: 3 },         // Yellow (3)
  { tier: 'ultra-rare', colorIndex: 0, count: 3 },   // Green (3)
  { tier: 'ultra-rare', colorIndex: 1, count: 3 },   // Dark Blue (3)
]

export function getBSTTier(bst: number): BSTTier {
  if (bst <= 300) return 'very-common'
  if (bst <= 420) return 'common'
  if (bst <= 520) return 'rare'
  return 'ultra-rare'
}

export function generateSeed(): string {
  return Math.random().toString(36).substring(2, 10)
}

function shuffleArray<T>(array: T[], rng: () => number): T[] {
  const result = [...array]
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1))
    ;[result[i], result[j]] = [result[j], result[i]]
  }
  return result
}

/**
 * Groups Pokemon by evolution family and returns them in order where
 * family members are adjacent. Maintains some randomness in the order
 * of families while keeping family members together.
 */
function groupByEvolutionFamily(pokemon: Pokemon[], rng: () => number): Pokemon[] {
  // Group by evolution family
  const familyGroups = new Map<number, Pokemon[]>()
  for (const p of pokemon) {
    const familyId = p.evolutionFamily ?? getEvolutionFamily(p.id)
    if (!familyGroups.has(familyId)) {
      familyGroups.set(familyId, [])
    }
    familyGroups.get(familyId)!.push(p)
  }

  // Sort members within each family by ID (evolution order)
  for (const members of familyGroups.values()) {
    members.sort((a, b) => a.id - b.id)
  }

  // Convert to array of family groups and shuffle the order of families
  const familyArrays = Array.from(familyGroups.values())
  const shuffledFamilies = shuffleArray(familyArrays, rng)

  // Flatten back to a single array with family members adjacent
  return shuffledFamilies.flat()
}

export function randomizeBoard(
  availablePokemon: Pokemon[],
  config: RandomizerConfig
): BoardAssignment {
  const rng = seedrandom(config.seed)

  // Group Pokémon by BST tier
  const pokemonByTier: Record<BSTTier, Pokemon[]> = {
    'very-common': [],
    'common': [],
    'rare': [],
    'ultra-rare': [],
  }

  // Filter by selected regions
  const filteredPokemon = availablePokemon.filter(p =>
    config.regions.length === 0 || config.regions.includes(p.region)
  )

  // Categorize all available Pokémon
  for (const pokemon of filteredPokemon) {
    const tier = getBSTTier(pokemon.bst)
    pokemonByTier[tier].push(pokemon)
  }

  // Create slots based on board layout
  const properties: BoardSlot[] = []

  // Process favorites first - lock them into their tiers
  const usedFavoriteIds = new Set<number>()
  const favoritesByTier: Record<BSTTier, Pokemon[]> = {
    'very-common': [],
    'common': [],
    'rare': [],
    'ultra-rare': [],
  }

  for (const fav of config.favorites) {
    const tier = getBSTTier(fav.bst)
    favoritesByTier[tier].push(fav)
    usedFavoriteIds.add(fav.id)
  }

  // Fill each color group
  for (const { tier, colorIndex, count } of BOARD_LAYOUT) {
    const color = TIER_COLORS[tier][colorIndex]

    // Get available Pokémon for this tier (excluding already used)
    const available = pokemonByTier[tier].filter(p => !usedFavoriteIds.has(p.id))

    // Take favorites for this tier first
    const favoritesForThisTier = favoritesByTier[tier].splice(0, count)

    // Determine the primary type for this color group
    // Use the type from the first favorite, or pick the most common type among favorites
    let targetType: string | null = null
    if (favoritesForThisTier.length > 0) {
      // Use the primary type of the first favorite
      targetType = getPrimaryType(favoritesForThisTier[0].types)
    } else {
      // If no favorites, we'll determine type from available Pokemon
      // Count types in available Pokemon
      const typeCounts = new Map<string, number>()
      for (const p of available) {
        const primaryType = getPrimaryType(p.types)
        if (primaryType) {
          typeCounts.set(primaryType, (typeCounts.get(primaryType) || 0) + 1)
        }
      }
      // Find the type with the most Pokemon that can fill this color group
      let maxCount = 0
      const slotsNeeded = count
      for (const [type, typeCount] of typeCounts) {
        if (typeCount >= slotsNeeded && typeCount > maxCount) {
          maxCount = typeCount
          targetType = type
        }
      }
      // If no type has enough, pick the most common type
      if (!targetType && typeCounts.size > 0) {
        targetType = Array.from(typeCounts.entries()).sort((a, b) => b[1] - a[1])[0][0]
      }
    }

    // Filter available Pokemon to only those matching the target type
    const typeFilteredAvailable = targetType
      ? available.filter(p => getPrimaryType(p.types) === targetType)
      : available

    // Fill remaining slots, preferring evolution family members of favorites
    const remaining = count - favoritesForThisTier.length
    const selectedPokemon = [...favoritesForThisTier]

    if (remaining > 0) {
      // Group available Pokemon by evolution family
      const familyGroups = new Map<number, Pokemon[]>()
      for (const p of typeFilteredAvailable) {
        const familyId = p.evolutionFamily ?? getEvolutionFamily(p.id)
        if (!familyGroups.has(familyId)) {
          familyGroups.set(familyId, [])
        }
        familyGroups.get(familyId)!.push(p)
      }

      // Get families that already have members in favorites (for this color)
      const favoritesFamilies = new Set(
        favoritesForThisTier.map(p => p.evolutionFamily ?? getEvolutionFamily(p.id))
      )

      // Prioritize: 1) family members of favorites, 2) families with multiple members, 3) random
      const prioritizedFamilies: Pokemon[][] = []
      const otherFamilies: Pokemon[][] = []

      for (const [familyId, members] of familyGroups) {
        if (favoritesFamilies.has(familyId)) {
          // Family members of favorites get highest priority
          prioritizedFamilies.unshift(shuffleArray(members, rng))
        } else if (members.length > 1) {
          // Families with multiple members get medium priority
          prioritizedFamilies.push(shuffleArray(members, rng))
        } else {
          otherFamilies.push(members)
        }
      }

      // Shuffle the family groups (but keep members together)
      const shuffledPrioritized = shuffleArray(prioritizedFamilies, rng)
      const shuffledOther = shuffleArray(otherFamilies, rng)
      const allFamilies = [...shuffledPrioritized, ...shuffledOther]

      // Fill remaining slots from family groups
      let slotsToFill = remaining
      for (const familyMembers of allFamilies) {
        if (slotsToFill <= 0) break
        for (const pokemon of familyMembers) {
          if (slotsToFill <= 0) break
          if (!usedFavoriteIds.has(pokemon.id)) {
            selectedPokemon.push(pokemon)
            usedFavoriteIds.add(pokemon.id)
            slotsToFill--
          }
        }
      }

      // If we still don't have enough Pokemon of the target type, fall back to any type
      // but still try to keep evolution families together
      if (slotsToFill > 0) {
        const fallbackAvailable = available.filter(
          p => !usedFavoriteIds.has(p.id) && getPrimaryType(p.types) === targetType
        )
        
        // Group fallback by evolution family
        const fallbackFamilies = new Map<number, Pokemon[]>()
        for (const p of fallbackAvailable) {
          const familyId = p.evolutionFamily ?? getEvolutionFamily(p.id)
          if (!fallbackFamilies.has(familyId)) {
            fallbackFamilies.set(familyId, [])
          }
          fallbackFamilies.get(familyId)!.push(p)
        }

        const fallbackFamilyArrays = Array.from(fallbackFamilies.values())
        const shuffledFallback = shuffleArray(fallbackFamilyArrays, rng)

        for (const familyMembers of shuffledFallback) {
          if (slotsToFill <= 0) break
          for (const pokemon of familyMembers) {
            if (slotsToFill <= 0) break
            if (!usedFavoriteIds.has(pokemon.id)) {
              selectedPokemon.push(pokemon)
              usedFavoriteIds.add(pokemon.id)
              slotsToFill--
            }
          }
        }
      }
    }

    // Verify all selected Pokemon have the same primary type (or handle edge case)
    const selectedTypes = new Set(selectedPokemon.map(p => getPrimaryType(p.types)).filter(Boolean))
    if (selectedTypes.size > 1 && targetType) {
      // If we have mixed types, prioritize the target type
      const targetTypePokemon = selectedPokemon.filter(p => getPrimaryType(p.types) === targetType)
      const otherTypePokemon = selectedPokemon.filter(p => getPrimaryType(p.types) !== targetType)
      
      // Try to replace other types with target type if possible
      const replacementCandidates = typeFilteredAvailable.filter(
        p => !usedFavoriteIds.has(p.id) && !selectedPokemon.includes(p)
      )
      
      if (replacementCandidates.length > 0) {
        // Replace other types with target type
        for (let i = 0; i < otherTypePokemon.length && replacementCandidates.length > 0; i++) {
          const toReplace = otherTypePokemon[i]
          const replacement = replacementCandidates.shift()!
          const index = selectedPokemon.indexOf(toReplace)
          if (index !== -1) {
            usedFavoriteIds.delete(toReplace.id)
            selectedPokemon[index] = replacement
            usedFavoriteIds.add(replacement.id)
          }
        }
      }
    }

    // Group the selected Pokemon by evolution family for adjacent placement
    const groupedByFamily = groupByEvolutionFamily(selectedPokemon, rng)

    for (let i = 0; i < count; i++) {
      properties.push({
        color,
        tier,
        pokemon: groupedByFamily[i],
      })
    }
  }

  return {
    properties,
    seed: config.seed,
  }
}

// Calculate property values based on tier
export function getPropertyValues(tier: BSTTier): {
  price: number
  rent: number[]
  houseCost: number
} {
  const values: Record<BSTTier, { price: number; baseRent: number; houseCost: number }> = {
    'very-common': { price: 60, baseRent: 4, houseCost: 50 },
    'common': { price: 140, baseRent: 10, houseCost: 100 },
    'rare': { price: 260, baseRent: 22, houseCost: 150 },
    'ultra-rare': { price: 350, baseRent: 35, houseCost: 200 },
  }

  const { price, baseRent, houseCost } = values[tier]

  // Rent array: [no houses, 1 house, 2 houses, 3 houses, 4 houses, hotel]
  const rent = [
    baseRent,
    baseRent * 5,
    baseRent * 15,
    baseRent * 45,
    baseRent * 80,
    baseRent * 125,
  ]

  return { price, rent, houseCost }
}
