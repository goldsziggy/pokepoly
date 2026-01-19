/**
 * Script to pre-fetch Pokémon data and generate a manifest
 * Run with: npx ts-node scripts/fetch-pokemon-manifest.ts
 */

interface PokemonManifestEntry {
  id: number
  name: string
  bst: number
  types: string[]
}

async function fetchPokemon(id: number): Promise<PokemonManifestEntry | null> {
  try {
    const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}`)
    if (!response.ok) return null

    const data = await response.json()
    const bst = data.stats.reduce((sum: number, stat: { base_stat: number }) => sum + stat.base_stat, 0)

    return {
      id: data.id,
      name: data.name,
      bst,
      types: data.types.map((t: { type: { name: string } }) => t.type.name),
    }
  } catch (error) {
    console.error(`Failed to fetch Pokémon ${id}:`, error)
    return null
  }
}

async function fetchAllPokemon() {
  const TOTAL_POKEMON = 1025
  const BATCH_SIZE = 50
  const manifest: PokemonManifestEntry[] = []

  for (let i = 1; i <= TOTAL_POKEMON; i += BATCH_SIZE) {
    const batch = Array.from({ length: Math.min(BATCH_SIZE, TOTAL_POKEMON - i + 1) }, (_, j) => i + j)
    const results = await Promise.all(batch.map(fetchPokemon))

    results.forEach(result => {
      if (result) manifest.push(result)
    })

    console.log(`Fetched ${Math.min(i + BATCH_SIZE - 1, TOTAL_POKEMON)}/${TOTAL_POKEMON}`)

    // Rate limiting
    await new Promise(resolve => setTimeout(resolve, 1000))
  }

  return manifest
}

async function main() {
  console.log('Fetching Pokémon manifest...')
  const manifest = await fetchAllPokemon()

  const output = `// Auto-generated Pokémon manifest
// Generated on: ${new Date().toISOString()}
// Total Pokémon: ${manifest.length}

import type { Pokemon, Region, REGION_RANGES } from '@/types'

export interface ManifestEntry {
  id: number
  name: string
  bst: number
  types: string[]
}

export const POKEMON_MANIFEST: ManifestEntry[] = ${JSON.stringify(manifest, null, 2)}

export function getRegion(id: number): Region {
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
`

  console.log(output)
  console.log('\nCopy the above to src/lib/pokemon-manifest.ts')
}

main().catch(console.error)
