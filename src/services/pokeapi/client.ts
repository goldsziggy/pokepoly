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
const LOCAL_DATA_BASE = '/data/pokemon'
const PALWORLD_DATA_URL = '/data/palworld/palworld.json'
const PALWORLD_ID_OFFSET = 2000
const [PALWORLD_ID_MIN, PALWORLD_ID_MAX] = (() => {
  const [start, end] = REGION_RANGES.palworld
  return [start, end]
})()

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

interface PalworldEntry {
  id: number
  name: string
  key: string
  image: string
  types: string[]
}

const MAX_POKEDEX_ID = Math.max(...Object.values(REGION_RANGES).map(([, end]) => end))

function getRegionFromId(id: number): Region {
  if (id >= PALWORLD_ID_MIN && id <= PALWORLD_ID_MAX) return 'palworld'
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

function transformPalworldEntry(entry: PalworldEntry): Pokemon {
  const id = PALWORLD_ID_OFFSET + (entry.id - 1)
  return {
    id,
    name: entry.name.toLowerCase(),
    sprite: `/images/${entry.image}`,
    bst: 400,
    types: entry.types.map(t => t.toLowerCase()),
    region: 'palworld',
    evolutionFamily: id,
  }
}

let palworldListCache: Pokemon[] | null = null

async function loadPalworldList(): Promise<Pokemon[]> {
  if (palworldListCache) return palworldListCache
  const response = await fetch(PALWORLD_DATA_URL)
  if (!response.ok) {
    throw new Error(`Failed to load Palworld data: ${response.statusText}`)
  }
  const data: PalworldEntry[] = await response.json()
  palworldListCache = data.map(transformPalworldEntry)
  return palworldListCache
}

function isPalworldId(id: number): boolean {
  return id >= PALWORLD_ID_MIN && id <= PALWORLD_ID_MAX
}

async function loadPokemonFromLocal(id: number): Promise<Pokemon | null> {
  try {
    const response = await fetch(`${LOCAL_DATA_BASE}/${id}.json`)
    if (!response.ok) {
      return null
    }
    const pokemon: Pokemon = await response.json()
    return pokemon
  } catch {
    return null
  }
}

export async function fetchPokemon(id: number): Promise<Pokemon> {
  // Check cache first
  const cached = await getCachedPokemon(id)
  if (cached) return cached

  // Palworld: load from palworld.json
  if (isPalworldId(id)) {
    const list = await loadPalworldList()
    const pal = list.find(p => p.id === id)
    if (pal) {
      await cachePokemon(pal)
      return pal
    }
    throw new Error(`Pal not found: ${id}`)
  }

  // Try loading from local JSON file
  const local = await loadPokemonFromLocal(id)
  if (local) {
    // Cache the result for future use
    await cachePokemon(local)
    return local
  }

  // Fall back to API
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
  // Try to find by searching cached/local data first
  // This is a fallback - we'd need to know the ID to load from local files
  // For now, fall back to API
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
  const palworldIds = ids.filter(isPalworldId)
  const pokemonIds = ids.filter(id => !isPalworldId(id))

  // Resolve Palworld IDs from palworld.json
  if (palworldIds.length > 0) {
    const palworldList = await loadPalworldList()
    const pals = palworldList.filter(p => palworldIds.includes(p.id))
    results.push(...pals)
    cacheManyPokemon(pals).catch(() => {})
  }

  const toFetch: number[] = []

  // Check cache for Pokémon IDs
  const cacheCheckPromises = pokemonIds.map(async (id) => {
    try {
      const cached = await getCachedPokemon(id)
      return { id, cached }
    } catch (error) {
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

  // Try loading missing ones from local files first
  const localLoadPromises = toFetch.map(async (id) => {
    const local = await loadPokemonFromLocal(id)
    if (local) {
      await cachePokemon(local).catch(() => {})
      return { id, pokemon: local }
    }
    return { id, pokemon: null }
  })

  const localResults = await Promise.all(localLoadPromises)
  const stillToFetch: number[] = []

  for (const { id, pokemon } of localResults) {
    if (pokemon) {
      results.push(pokemon)
    } else {
      stillToFetch.push(id)
    }
  }

  // Fetch remaining missing ones from API in batches
  const BATCH_SIZE = 20
  for (let i = 0; i < stillToFetch.length; i += BATCH_SIZE) {
    const batch = stillToFetch.slice(i, i + BATCH_SIZE)
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

    cacheManyPokemon(validPokemon).catch(error => {
      console.warn('Failed to cache Pokemon (non-critical):', error)
    })

    if (i + BATCH_SIZE < stillToFetch.length) {
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

    // Pre-cache Palworld so customization search finds Pals
    try {
      const pals = await loadPalworldList()
      if (pals.length > 0) {
        await cacheManyPokemon(pals)
        console.log(`Palworld cache: ${pals.length} Pals`)
      }
    } catch (e) {
      console.warn('Pre-caching Palworld failed (non-critical):', e)
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
  if (region === 'palworld') {
    try {
      const pokemon = await loadPalworldList()
      if (pokemon.length === 0) throw new Error('No Pals loaded')
      await cacheManyPokemon(pokemon)
      return pokemon
    } catch (error) {
      console.error(`Error fetching Palworld:`, error)
      throw error
    }
  }

  const ranges: Record<Exclude<Region, 'palworld'>, [number, number]> = {
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
