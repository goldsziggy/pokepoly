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
const DB_VERSION = 2

let dbInstance: IDBPDatabase<PokeDBSchema> | null = null

export async function getDB(): Promise<IDBPDatabase<PokeDBSchema> | null> {
  if (dbInstance) return dbInstance

  try {
    dbInstance = await openDB<PokeDBSchema>(DB_NAME, DB_VERSION, {
      upgrade(db, _oldVersion, _newVersion, transaction) {
        // Pokemon store + indexes
        let pokemonStore
        if (!db.objectStoreNames.contains('pokemon')) {
          pokemonStore = db.createObjectStore('pokemon', { keyPath: 'id' })
        } else {
          pokemonStore = transaction.objectStore('pokemon')
        }
        if (!pokemonStore.indexNames.contains('by-region')) {
          pokemonStore.createIndex('by-region', 'region')
        }
        if (!pokemonStore.indexNames.contains('by-name')) {
          pokemonStore.createIndex('by-name', 'name')
        }

        // Sprites store (for offline use)
        if (!db.objectStoreNames.contains('sprites')) {
          db.createObjectStore('sprites', { keyPath: 'id' })
        }

        // Metadata store
        if (!db.objectStoreNames.contains('metadata')) {
          db.createObjectStore('metadata')
        }
      },
    })
    return dbInstance
  } catch (error) {
    console.error('Failed to open IndexedDB:', error)
    // Return null to indicate cache is unavailable
    // The app can continue without cache
    return null
  }
}

export async function getCachedPokemon(id: number): Promise<Pokemon | undefined> {
  const db = await getDB()
  if (!db) return undefined
  if (!db.objectStoreNames.contains('pokemon')) return undefined
  return db.get('pokemon', id)
}

export async function cachePokemon(pokemon: Pokemon): Promise<void> {
  const db = await getDB()
  if (!db) return // Cache unavailable, skip caching
  if (!db.objectStoreNames.contains('pokemon')) return
  await db.put('pokemon', pokemon)
}

export async function getCachedPokemonByRegion(region: Region): Promise<Pokemon[]> {
  const db = await getDB()
  if (!db) return []
  if (!db.objectStoreNames.contains('pokemon')) return []
  return db.getAllFromIndex('pokemon', 'by-region', region)
}

export async function getAllCachedPokemon(): Promise<Pokemon[]> {
  const db = await getDB()
  if (!db) return []
  if (!db.objectStoreNames.contains('pokemon')) return []
  return db.getAll('pokemon')
}

export async function cacheManyPokemon(pokemonList: Pokemon[]): Promise<void> {
  const db = await getDB()
  if (!db || pokemonList.length === 0) return // Cache unavailable or nothing to cache
  if (!db.objectStoreNames.contains('pokemon')) return
  const tx = db.transaction('pokemon', 'readwrite')
  await Promise.all([
    ...pokemonList.map(p => tx.store.put(p)),
    tx.done,
  ])
}

export async function searchPokemonByName(query: string): Promise<Pokemon[]> {
  const db = await getDB()
  if (!db) return []
  if (!db.objectStoreNames.contains('pokemon')) return []
  const all = await db.getAll('pokemon')
  const lowerQuery = query.toLowerCase()
  return all.filter(p => p.name.toLowerCase().includes(lowerQuery)).slice(0, 10)
}

export async function getCacheMetadata(): Promise<{ lastFetch: number; version: string } | undefined> {
  const db = await getDB()
  if (!db) return undefined
  if (!db.objectStoreNames.contains('metadata')) return undefined
  return db.get('metadata', 'cache-info')
}

export async function setCacheMetadata(metadata: { lastFetch: number; version: string }): Promise<void> {
  const db = await getDB()
  if (!db) return // Cache unavailable, skip
  if (!db.objectStoreNames.contains('metadata')) return
  await db.put('metadata', metadata, 'cache-info')
}

export async function clearCache(): Promise<void> {
  const db = await getDB()
  if (!db) return // Cache unavailable, nothing to clear
  const tasks: Array<Promise<void>> = []
  if (db.objectStoreNames.contains('pokemon')) tasks.push(db.clear('pokemon'))
  if (db.objectStoreNames.contains('sprites')) tasks.push(db.clear('sprites'))
  if (db.objectStoreNames.contains('metadata')) tasks.push(db.clear('metadata'))
  await Promise.all(tasks)
}
