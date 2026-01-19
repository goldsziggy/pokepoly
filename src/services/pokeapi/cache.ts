import { openDB, DBSchema, IDBPDatabase } from 'idb'
import type { Pokemon, Region } from '@/types'

interface PokeDBSchema extends DBSchema {
  pokemon: {
    key: number
    value: Pokemon
    indexes: { 'by-region': Region; 'by-name': string }
  }
  sprites: {
    key: number
    value: { id: number; dataUrl: string }
  }
  metadata: {
    key: string
    value: { lastFetch: number; version: string }
  }
}

const DB_NAME = 'poke-poly-cache'
const DB_VERSION = 1

let dbInstance: IDBPDatabase<PokeDBSchema> | null = null

export async function getDB(): Promise<IDBPDatabase<PokeDBSchema>> {
  if (dbInstance) return dbInstance

  dbInstance = await openDB<PokeDBSchema>(DB_NAME, DB_VERSION, {
    upgrade(db) {
      // Pokemon store
      const pokemonStore = db.createObjectStore('pokemon', { keyPath: 'id' })
      pokemonStore.createIndex('by-region', 'region')
      pokemonStore.createIndex('by-name', 'name')

      // Sprites store (for offline use)
      db.createObjectStore('sprites', { keyPath: 'id' })

      // Metadata store
      db.createObjectStore('metadata')
    },
  })

  return dbInstance
}

export async function getCachedPokemon(id: number): Promise<Pokemon | undefined> {
  const db = await getDB()
  return db.get('pokemon', id)
}

export async function cachePokemon(pokemon: Pokemon): Promise<void> {
  const db = await getDB()
  await db.put('pokemon', pokemon)
}

export async function getCachedPokemonByRegion(region: Region): Promise<Pokemon[]> {
  const db = await getDB()
  return db.getAllFromIndex('pokemon', 'by-region', region)
}

export async function getAllCachedPokemon(): Promise<Pokemon[]> {
  const db = await getDB()
  return db.getAll('pokemon')
}

export async function cacheManyPokemon(pokemonList: Pokemon[]): Promise<void> {
  const db = await getDB()
  const tx = db.transaction('pokemon', 'readwrite')
  await Promise.all([
    ...pokemonList.map(p => tx.store.put(p)),
    tx.done,
  ])
}

export async function searchPokemonByName(query: string): Promise<Pokemon[]> {
  const db = await getDB()
  const all = await db.getAll('pokemon')
  const lowerQuery = query.toLowerCase()
  return all.filter(p => p.name.toLowerCase().includes(lowerQuery)).slice(0, 10)
}

export async function getCacheMetadata(): Promise<{ lastFetch: number; version: string } | undefined> {
  const db = await getDB()
  return db.get('metadata', 'cache-info')
}

export async function setCacheMetadata(metadata: { lastFetch: number; version: string }): Promise<void> {
  const db = await getDB()
  await db.put('metadata', metadata, 'cache-info')
}

export async function clearCache(): Promise<void> {
  const db = await getDB()
  await Promise.all([
    db.clear('pokemon'),
    db.clear('sprites'),
    db.clear('metadata'),
  ])
}
