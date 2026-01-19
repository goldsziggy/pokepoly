import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { fileURLToPath } from 'url'
import { dirname } from 'path'
import { getEvolutionFamily } from '../src/data/evolutionFamilies.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const POKEAPI_BASE = 'https://pokeapi.co/api/v2'
const MAX_POKEDEX_ID = 1025
const DATA_DIR = join(__dirname, '..', 'public', 'data', 'pokemon')

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

type Region =
  | 'kanto'
  | 'johto'
  | 'hoenn'
  | 'sinnoh'
  | 'unova'
  | 'kalos'
  | 'alola'
  | 'galar'
  | 'paldea'

interface Pokemon {
  id: number
  name: string
  sprite: string
  bst: number
  types: string[]
  region: Region
  evolutionFamily?: number
}

const REGION_RANGES: Record<Region, [number, number]> = {
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

// Evolution family mapping is imported from src/data/evolutionFamilies.ts

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

async function fetchPokemon(id: number): Promise<Pokemon | null> {
  try {
    const response = await fetch(`${POKEAPI_BASE}/pokemon/${id}`)
    if (!response.ok) {
      console.error(`Failed to fetch Pokémon ${id}: ${response.statusText}`)
      return null
    }

    const data: PokeAPIResponse = await response.json()
    return transformPokemonResponse(data)
  } catch (error) {
    console.error(`Error fetching Pokémon ${id}:`, error)
    return null
  }
}

async function downloadAllPokemon() {
  console.log('Creating data directory...')
  await mkdir(DATA_DIR, { recursive: true })

  console.log(`Starting download of ${MAX_POKEDEX_ID} Pokémon...`)
  const BATCH_SIZE = 20
  let downloaded = 0
  let failed = 0

  for (let i = 1; i <= MAX_POKEDEX_ID; i += BATCH_SIZE) {
    const batch = Array.from({ length: Math.min(BATCH_SIZE, MAX_POKEDEX_ID - i + 1) }, (_, j) => i + j)
    
    const results = await Promise.all(
      batch.map(async (id) => {
        const pokemon = await fetchPokemon(id)
        if (pokemon) {
          const filePath = join(DATA_DIR, `${id}.json`)
          await writeFile(filePath, JSON.stringify(pokemon, null, 2), 'utf-8')
          downloaded++
          return { id, success: true }
        } else {
          failed++
          return { id, success: false }
        }
      })
    )

    // Show progress
    const progress = ((i + batch.length - 1) / MAX_POKEDEX_ID) * 100
    console.log(
      `Progress: ${i + batch.length - 1}/${MAX_POKEDEX_ID} (${progress.toFixed(1)}%) - ` +
      `Downloaded: ${downloaded}, Failed: ${failed}`
    )

    // Small delay to avoid rate limiting
    if (i + BATCH_SIZE <= MAX_POKEDEX_ID) {
      await new Promise(resolve => setTimeout(resolve, 100))
    }
  }

  console.log(`\nDownload complete!`)
  console.log(`Successfully downloaded: ${downloaded} Pokémon`)
  console.log(`Failed: ${failed} Pokémon`)
  console.log(`Data saved to: ${DATA_DIR}`)
}

downloadAllPokemon().catch((error) => {
  console.error('Fatal error:', error)
  process.exit(1)
})
