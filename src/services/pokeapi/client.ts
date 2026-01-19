import type { Pokemon, Region, REGION_RANGES } from '@/types'
import {
  getCachedPokemon,
  cachePokemon,
  cacheManyPokemon,
  getAllCachedPokemon,
  getCacheMetadata,
  setCacheMetadata,
} from './cache'
import { getEvolutionFamily } from '@/data/evolutionFamilies'

const POKEAPI_BASE = 'https://pokeapi.co/api/v2'
const CACHE_VERSION = '1.0.0'

interface PokeAPIResponse {
  id: number
  name: string
  sprites: {
    front_default: string
    other?: {
      'official-artwork'?: {
        front_default?: string
      }
    }
  }
  stats: Array<{ base_stat: number; stat: { name: string } }>
  types: Array<{ type: { name: string } }>
}

function getRegionFromId(id: number): Region {
  const ranges: [Region, [number, number]][] = [
    ['kanto', [1, 151]],
    ['johto', [152, 251]],
    ['hoenn', [252, 386]],
    ['sinnoh', [387, 493]],
    ['unova', [494, 649]],
    ['kalos', [650, 721]],
    ['alola', [722, 809]],
    ['galar', [810, 905]],
    ['paldea', [906, 1025]],
  ]

  for (const [region, [start, end]] of ranges) {
    if (id >= start && id <= end) return region
  }
  return 'kanto'
}

function transformPokemonResponse(data: PokeAPIResponse): Pokemon {
  const bst = data.stats.reduce((sum, stat) => sum + stat.base_stat, 0)
  const sprite =
    data.sprites.other?.['official-artwork']?.front_default ||
    data.sprites.front_default ||
    ''

  return {
    id: data.id,
    name: data.name,
    sprite,
    bst,
    types: data.types.map(t => t.type.name),
    region: getRegionFromId(data.id),
    evolutionFamily: getEvolutionFamily(data.id),
  }
}

export async function fetchPokemon(id: number): Promise<Pokemon> {
  // Check cache first
  const cached = await getCachedPokemon(id)
  if (cached) return cached

  const response = await fetch(`${POKEAPI_BASE}/pokemon/${id}`)
  if (!response.ok) {
    throw new Error(`Failed to fetch Pokémon ${id}: ${response.statusText}`)
  }

  const data: PokeAPIResponse = await response.json()
  const pokemon = transformPokemonResponse(data)

  // Cache the result
  await cachePokemon(pokemon)

  return pokemon
}

export async function fetchPokemonByName(name: string): Promise<Pokemon> {
  const response = await fetch(`${POKEAPI_BASE}/pokemon/${name.toLowerCase()}`)
  if (!response.ok) {
    throw new Error(`Failed to fetch Pokémon ${name}: ${response.statusText}`)
  }

  const data: PokeAPIResponse = await response.json()
  const pokemon = transformPokemonResponse(data)

  await cachePokemon(pokemon)

  return pokemon
}

export async function fetchPokemonBatch(ids: number[]): Promise<Pokemon[]> {
  const results: Pokemon[] = []
  const toFetch: number[] = []

  // Check cache for each
  for (const id of ids) {
    const cached = await getCachedPokemon(id)
    if (cached) {
      results.push(cached)
    } else {
      toFetch.push(id)
    }
  }

  // Fetch missing ones in batches
  const BATCH_SIZE = 20
  for (let i = 0; i < toFetch.length; i += BATCH_SIZE) {
    const batch = toFetch.slice(i, i + BATCH_SIZE)
    const fetched = await Promise.all(
      batch.map(async id => {
        try {
          const response = await fetch(`${POKEAPI_BASE}/pokemon/${id}`)
          if (!response.ok) return null
          const data: PokeAPIResponse = await response.json()
          return transformPokemonResponse(data)
        } catch {
          return null
        }
      })
    )

    const validPokemon = fetched.filter((p): p is Pokemon => p !== null)
    results.push(...validPokemon)
    await cacheManyPokemon(validPokemon)

    // Small delay to avoid rate limiting
    if (i + BATCH_SIZE < toFetch.length) {
      await new Promise(resolve => setTimeout(resolve, 100))
    }
  }

  return results.sort((a, b) => a.id - b.id)
}

export async function ensureBasicPokemonCached(): Promise<void> {
  const metadata = await getCacheMetadata()

  // If cache exists and is same version, skip
  if (metadata?.version === CACHE_VERSION) {
    const cached = await getAllCachedPokemon()
    if (cached.length >= 151) return // At least Kanto cached
  }

  // Fetch at minimum Kanto (1-151) for a good user experience
  console.log('Initializing Pokémon cache...')
  await fetchPokemonBatch(Array.from({ length: 151 }, (_, i) => i + 1))

  await setCacheMetadata({
    lastFetch: Date.now(),
    version: CACHE_VERSION,
  })

  console.log('Pokémon cache initialized')
}

export async function fetchRegionPokemon(region: Region): Promise<Pokemon[]> {
  const ranges: Record<Region, [number, number]> = {
    kanto: [1, 151],
    johto: [152, 251],
    hoenn: [252, 386],
    sinnoh: [387, 493],
    unova: [494, 649],
    kalos: [650, 721],
    alola: [722, 809],
    galar: [810, 905],
    paldea: [906, 1025],
  }

  const [start, end] = ranges[region]
  const ids = Array.from({ length: end - start + 1 }, (_, i) => start + i)

  return fetchPokemonBatch(ids)
}
