import seedrandom from 'seedrandom'
import type { Pokemon, Region } from '@/types'
import { type BSTTier, type BoardColor } from '@/types/board'
import { getEvolutionFamily } from '@/data/evolutionFamilies'
import { getPrimaryType } from '@/lib/typeIcons'

export interface BoardSlot {
  color: BoardColor
  pokemon?: Pokemon
}

export interface RandomizerConfig {
  regions: Region[]
  favorites: Pokemon[]
  seed: string
  typeColorMapping?: Record<BoardColor, string | null>
}

export interface BoardAssignment {
  properties: BoardSlot[]
  seed: string
}

// Property slots per color (matching standard Monopoly layout)
// Total: 22 properties
const BOARD_LAYOUT: { color: BoardColor; count: number }[] = [
  { color: 'brown', count: 2 },        // Brown (2)
  { color: 'lightblue', count: 3 },    // Light Blue (3)
  { color: 'pink', count: 3 },         // Pink (3)
  { color: 'orange', count: 3 },       // Orange (3)
  { color: 'red', count: 3 },          // Red (3)
  { color: 'yellow', count: 3 },       // Yellow (3)
  { color: 'green', count: 3 },        // Green (3)
  { color: 'darkblue', count: 2 },     // Dark Blue (2)
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

  // Log input state
  console.log('[Randomizer] Input state:', {
    availablePokemonCount: availablePokemon.length,
    selectedRegions: config.regions,
    availablePokemonRegions: [...new Set(availablePokemon.map(p => p.region))],
    regionCounts: Object.fromEntries(
      [...new Set(availablePokemon.map(p => p.region))].map(region => [
        region,
        availablePokemon.filter(p => p.region === region).length
      ])
    ),
  })

  // Filter by selected regions
  const filteredPokemon = availablePokemon.filter(p =>
    config.regions.length === 0 || config.regions.includes(p.region)
  )

  console.log('[Randomizer] After region filter:', {
    filteredCount: filteredPokemon.length,
    filteredRegions: [...new Set(filteredPokemon.map(p => p.region))],
    filteredRegionCounts: Object.fromEntries(
      [...new Set(filteredPokemon.map(p => p.region))].map(region => [
        region,
        filteredPokemon.filter(p => p.region === region).length
      ])
    ),
    sampleIds: filteredPokemon.slice(0, 5).map(p => ({ id: p.id, name: p.name, region: p.region })),
  })

  // Create slots based on board layout
  const properties: BoardSlot[] = []

  // Process favorites - group by their assigned color (if type mapping exists)
  const usedFavoriteIds = new Set<number>()
  const favoritesByColor = new Map<BoardColor, Pokemon[]>()
  
  // If we have type mapping, assign favorites to colors based on their type
  if (config.typeColorMapping) {
    for (const fav of config.favorites) {
      const primaryType = getPrimaryType(fav.types)
      if (primaryType) {
        // Find which color this type is assigned to
        for (const [color, type] of Object.entries(config.typeColorMapping)) {
          if (type === primaryType) {
            if (!favoritesByColor.has(color as BoardColor)) {
              favoritesByColor.set(color as BoardColor, [])
            }
            favoritesByColor.get(color as BoardColor)!.push(fav)
            usedFavoriteIds.add(fav.id)
            break
          }
        }
      }
    }
  }

  // Track types already assigned to colors for diversity
  const usedTypes = new Set<string>()
  
  // Count favorites by type to handle cases where we have too many favorites of one type
  // This helps us determine if we need to allow type reuse
  const favoritesByType = new Map<string, Pokemon[]>()
  for (const fav of config.favorites) {
    const primaryType = getPrimaryType(fav.types)
    if (primaryType) {
      if (!favoritesByType.has(primaryType)) {
        favoritesByType.set(primaryType, [])
      }
      favoritesByType.get(primaryType)!.push(fav)
    }
  }
  
  // Pre-calculate which types might need to be reused due to too many favorites
  // A type needs reuse if it has more favorites than the largest color group can hold
  const maxColorGroupSize = Math.max(...BOARD_LAYOUT.map(l => l.count))
  const typesRequiringReuse = new Set<string>()
  for (const [type, favs] of favoritesByType) {
    if (favs.length > maxColorGroupSize) {
      typesRequiringReuse.add(type)
    }
  }

  // Fill each color group
  for (const { color, count } of BOARD_LAYOUT) {
    // Get available Pokémon (excluding already used)
    const available = filteredPokemon.filter(p => !usedFavoriteIds.has(p.id))
    
    console.log(`[Randomizer] Processing color group "${color}" (need ${count}):`, {
      availableCount: available.length,
      availableRegions: [...new Set(available.map(p => p.region))],
      usedFavoriteIdsCount: usedFavoriteIds.size,
    })

    // Get favorites for this color
    const favoritesForThisColor = favoritesByColor.get(color) || []
    // Limit to count
    const favoritesToUse = favoritesForThisColor.slice(0, count)
    favoritesToUse.forEach(fav => usedFavoriteIds.add(fav.id))

    // Determine the primary type for this color group
    // Use explicit mapping if provided, otherwise auto-determine
    let targetType: string | null = null
    
    if (config.typeColorMapping && config.typeColorMapping[color] !== null) {
      // Use explicit type-to-color mapping (only if not null)
      targetType = config.typeColorMapping[color]!
      usedTypes.add(targetType)
    } else if (favoritesToUse.length > 0) {
      // Use the primary type of the first favorite
      targetType = getPrimaryType(favoritesToUse[0].types)
      if (targetType) {
        // Only mark as used if this type doesn't require reuse
        // (i.e., if we don't have too many favorites of this type)
        if (!typesRequiringReuse.has(targetType)) {
          usedTypes.add(targetType)
        }
        // If it requires reuse, we allow it to be used in multiple colors
      }
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
      
      // Prioritize types that haven't been used yet (for diversity)
      const unusedTypes: Array<[string, number]> = []
      const usedTypesList: Array<[string, number]> = []
      
      for (const [type, typeCount] of typeCounts) {
        if (usedTypes.has(type)) {
          usedTypesList.push([type, typeCount])
        } else {
          unusedTypes.push([type, typeCount])
        }
      }
      
      const slotsNeeded = count
      
      // First, try to find an unused type that can fill this color group
      let maxCount = 0
      for (const [type, typeCount] of unusedTypes) {
        if (typeCount >= slotsNeeded && typeCount > maxCount) {
          maxCount = typeCount
          targetType = type
        }
      }
      
      // If no unused type has enough, check if any unused type exists (even if not enough)
      if (!targetType && unusedTypes.length > 0) {
        // Sort by count descending and pick the most common unused type
        unusedTypes.sort((a, b) => b[1] - a[1])
        targetType = unusedTypes[0][0]
      }
      
      // If still no type (all types used or not enough Pokemon), allow reusing types
      // but only if necessary (e.g., too many favorites of one type, or we've exhausted unique types)
      if (!targetType) {
        // First, check if any type requiring reuse is available and not yet used in this iteration
        // (types requiring reuse can be used multiple times)
        for (const [type, typeCount] of usedTypesList) {
          if (typesRequiringReuse.has(type) && typeCount >= slotsNeeded) {
            targetType = type
            // Don't mark as used since it can be reused
            break
          }
        }
        
        // If still no type, check unused types that require reuse
        for (const [type, typeCount] of unusedTypes) {
          if (typesRequiringReuse.has(type) && typeCount >= slotsNeeded) {
            targetType = type
            // Don't mark as used since it can be reused
            break
          }
        }
        
        // If we've exhausted all unique types and don't have types requiring reuse,
        // we need to reuse a type. Prefer types that require reuse, otherwise pick the most common.
        if (!targetType) {
          if (usedTypesList.length > 0) {
            // Sort by count descending
            usedTypesList.sort((a, b) => b[1] - a[1])
            targetType = usedTypesList[0][0]
            // Mark as used since we're reusing it (but it's okay, we've exhausted unique types)
            usedTypes.add(targetType)
          } else if (typeCounts.size > 0) {
            // Last resort: pick the most common type overall
            targetType = Array.from(typeCounts.entries()).sort((a, b) => b[1] - a[1])[0][0]
            usedTypes.add(targetType)
          }
        }
      } else {
        // Mark type as used if we selected one (unless it requires reuse)
        if (targetType && !typesRequiringReuse.has(targetType)) {
          usedTypes.add(targetType)
        }
      }
    }

    // Filter available Pokemon to only those matching the target type
    const typeFilteredAvailable = targetType
      ? available.filter(p => getPrimaryType(p.types) === targetType)
      : available

    console.log(`[Randomizer] Color "${color}" type filtering:`, {
      targetType,
      typeFilteredCount: typeFilteredAvailable.length,
      typeFilteredRegions: [...new Set(typeFilteredAvailable.map(p => p.region))],
      typeFilteredRegionCounts: Object.fromEntries(
        [...new Set(typeFilteredAvailable.map(p => p.region))].map(region => [
          region,
          typeFilteredAvailable.filter(p => p.region === region).length
        ])
      ),
    })

    // Fill remaining slots, preferring evolution family members of favorites
    const remaining = count - favoritesToUse.length
    const selectedPokemon = [...favoritesToUse]

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
        favoritesToUse.map(p => p.evolutionFamily ?? getEvolutionFamily(p.id))
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

    // Sort by BST so higher BST Pokemon go to higher-priced property slots
    // Higher index = higher price, so sort ascending by BST
    const sortedByBST = [...groupedByFamily].sort((a, b) => (a.bst || 0) - (b.bst || 0))

    for (let i = 0; i < count; i++) {
      properties.push({
        color,
        pokemon: sortedByBST[i],
      })
    }

    console.log(`[Randomizer] Color "${color}" final selection:`, {
      selectedCount: sortedByBST.length,
      selectedPokemon: sortedByBST.map(p => ({ id: p.id, name: p.name, region: p.region })),
    })
  }

  console.log('[Randomizer] Final board assignment:', {
    totalProperties: properties.length,
    propertiesByRegion: Object.fromEntries(
      [...new Set(properties.map(p => p.pokemon?.region).filter(Boolean))].map(region => [
        region,
        properties.filter(p => p.pokemon?.region === region).length
      ])
    ),
    allSelectedRegions: [...new Set(properties.map(p => p.pokemon?.region).filter(Boolean))],
  })

  return {
    properties,
    seed: config.seed,
  }
}

// Calculate property values based on color (standard Monopoly pricing)
export function getPropertyValues(color: BoardColor, indexInColor: number): {
  price: number
  rent: number[]
  houseCost: number
} {
  // Standard Monopoly prices per color group
  const colorPrices: Record<BoardColor, number[]> = {
    brown: [60, 60],                    // 2 properties
    lightblue: [100, 100, 120],         // 3 properties
    pink: [140, 140, 160],              // 3 properties
    orange: [180, 180, 200],            // 3 properties
    red: [220, 220, 240],               // 3 properties
    yellow: [260, 260, 280],            // 3 properties
    green: [300, 300, 320],             // 3 properties
    darkblue: [350, 400],               // 2 properties
  }

  const price = colorPrices[color][indexInColor] || colorPrices[color][0]
  
  // Standard Monopoly rent values by price range
  // Rent array: [no houses, 1 house, 2 houses, 3 houses, 4 houses, hotel]
  let rent: number[]
  let houseCost: number

  if (price <= 60) {
    // Brown properties
    rent = [2, 10, 30, 90, 160, 250]
    houseCost = 50
  } else if (price <= 120) {
    // Light Blue properties
    rent = [6, 30, 90, 270, 400, 550]
    houseCost = 50
  } else if (price <= 160) {
    // Pink properties
    rent = [10, 50, 150, 450, 625, 750]
    houseCost = 100
  } else if (price <= 200) {
    // Orange properties
    rent = [14, 70, 200, 550, 750, 950]
    houseCost = 100
  } else if (price <= 240) {
    // Red properties
    rent = [18, 90, 250, 700, 875, 1050]
    houseCost = 150
  } else if (price <= 280) {
    // Yellow properties
    rent = [22, 110, 330, 800, 975, 1150]
    houseCost = 150
  } else if (price <= 320) {
    // Green properties
    rent = [26, 130, 390, 900, 1100, 1275]
    houseCost = 200
  } else {
    // Dark Blue properties ($350 or $400)
    if (price === 400) {
      rent = [50, 200, 600, 1400, 1700, 2000]
    } else {
      rent = [35, 175, 500, 1100, 1300, 1500]
    }
    houseCost = 200
  }

  return { price, rent, houseCost }
}
