import type { Pokemon, Region } from '@/types'
import { REGION_RANGES } from '@/types'
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
const CACHE_VERSION = '2.0.0'

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

interface PokeAPIListResponse {
  results: Array<{ name: string; url: string }>
}

const MAX_POKEDEX_ID = Math.max(...Object.values(REGION_RANGES).map(([, end]) => end))

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

function getIdFromPokemonUrl(url: string): number | null {
  const match = url.match(/\/pokemon\/(\d+)\/?$/)
  if (!match) return null
  const id = parseInt(match[1], 10)
  return Number.isFinite(id) ? id : null
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

  // Check cache for each (in parallel for better performance)
  const cacheCheckPromises = ids.map(async (id) => {
    try {
      const cached = await getCachedPokemon(id)
      return { id, cached }
    } catch (error) {
      // If cache check fails, assume not cached and fetch from API
      console.warn(`Cache check failed for Pokemon ${id}, will fetch from API:`, error)
      return { id, cached: undefined }
    }
  })

  const cacheResults = await Promise.all(cacheCheckPromises)
  for (const { id, cached } of cacheResults) {
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
    
    // Cache in background (don't block on cache write)
    cacheManyPokemon(validPokemon).catch(error => {
      console.warn('Failed to cache Pokemon (non-critical):', error)
    })

    // Small delay to avoid rate limiting
    if (i + BATCH_SIZE < toFetch.length) {
      await new Promise(resolve => setTimeout(resolve, 100))
    }
  }

  return results.sort((a, b) => a.id - b.id)
}

export async function fetchAllPokemonIds(): Promise<number[]> {
  const response = await fetch(`${POKEAPI_BASE}/pokemon/?limit=1500`)
  if (!response.ok) {
    throw new Error(`Failed to fetch Pokémon list: ${response.statusText}`)
  }
  const data: PokeAPIListResponse = await response.json()

  const ids = data.results
    .map((item) => getIdFromPokemonUrl(item.url))
    .filter((id): id is number => typeof id === 'number' && id >= 1 && id <= MAX_POKEDEX_ID)

  // De-dupe and sort for stable batching/caching
  return Array.from(new Set(ids)).sort((a, b) => a - b)
}

export async function fetchAllPokemon(): Promise<Pokemon[]> {
  const ids = await fetchAllPokemonIds()
  return fetchPokemonBatch(ids)
}

export async function ensureBasicPokemonCached(): Promise<void> {
  try {
    const metadata = await getCacheMetadata()

    // If cache exists and is same version, skip
    if (metadata?.version === CACHE_VERSION) {
      const cached = await getAllCachedPokemon()
      if (cached.length >= 151) {
        console.log('Pokémon cache already initialized')
        return // At least Kanto cached
      }
    }

    // Fetch at minimum Kanto (1-151) for a good user experience
    console.log('Initializing Pokémon cache...')
    const pokemon = await fetchPokemonBatch(Array.from({ length: 151 }, (_, i) => i + 1))
    
    if (pokemon.length === 0) {
      console.warn('No Pokemon fetched during cache initialization')
      // Don't throw - allow the app to continue and fetch on demand
      return
    }

    await setCacheMetadata({
      lastFetch: Date.now(),
      version: CACHE_VERSION,
    })

    console.log(`Pokémon cache initialized with ${pokemon.length} Pokemon`)
  } catch (error) {
    console.error('Error initializing Pokemon cache:', error)
    // Don't throw - allow the app to continue and fetch on demand
    // The cache is a performance optimization, not a requirement
  }
}

export async function ensureAllPokemonCached(): Promise<Pokemon[]> {
  try {
    const metadata = await getCacheMetadata()
    const ids = await fetchAllPokemonIds()

    // If cache exists and is same version, skip when we have enough cached
    if (metadata?.version === CACHE_VERSION) {
      const cached = await getAllCachedPokemon()
      if (cached.length >= ids.length) {
        console.log('Pokémon cache already initialized')
        return cached
      }
    }

    console.log('Initializing full Pokémon cache...')
    const pokemon = await fetchPokemonBatch(ids)

    if (pokemon.length === 0) {
      console.warn('No Pokemon fetched during cache initialization')
      return []
    }

    await setCacheMetadata({
      lastFetch: Date.now(),
      version: CACHE_VERSION,
    })

    console.log(`Pokémon cache initialized with ${pokemon.length} Pokemon`)
    return pokemon
  } catch (error) {
    console.error('Error initializing Pokemon cache:', error)
    return []
  }
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

  try {
    const pokemon = await fetchPokemonBatch(ids)
    if (pokemon.length === 0) {
      throw new Error(`No Pokemon fetched for region ${region}`)
    }
    return pokemon
  } catch (error) {
    console.error(`Error fetching Pokemon for region ${region}:`, error)
    throw error
  }
}
