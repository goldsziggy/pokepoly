import { useEffect, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useBoardStore } from '@/store'
import {
  ensureBasicPokemonCached,
  fetchRegionPokemon,
  getAllCachedPokemon,
  searchPokemonByName,
} from '@/services/pokeapi'
import type { Pokemon, Region } from '@/types'

export function usePokemonData() {
  const { selectedRegions, setAvailablePokemon } = useBoardStore()
  const [isInitialized, setIsInitialized] = useState(false)

  // Initialize cache on mount
  useEffect(() => {
    const init = async () => {
      await ensureBasicPokemonCached()
      setIsInitialized(true)
    }
    init()
  }, [])

  // Fetch Pokémon for selected regions
  const { data: regionPokemon, isLoading } = useQuery({
    queryKey: ['pokemon', 'regions', selectedRegions],
    queryFn: async () => {
      const results: Pokemon[] = []

      for (const region of selectedRegions) {
        const pokemon = await fetchRegionPokemon(region)
        results.push(...pokemon)
      }

      return results
    },
    enabled: isInitialized && selectedRegions.length > 0,
    staleTime: Infinity, // Data doesn't change
  })

  // Update store when data changes
  useEffect(() => {
    if (regionPokemon && regionPokemon.length > 0) {
      setAvailablePokemon(regionPokemon)
    }
  }, [regionPokemon, setAvailablePokemon])

  return {
    isLoading: !isInitialized || isLoading,
    pokemonCount: regionPokemon?.length ?? 0,
  }
}

export function usePokemonSearch(query: string) {
  const [results, setResults] = useState<Pokemon[]>([])
  const [isSearching, setIsSearching] = useState(false)

  useEffect(() => {
    if (!query || query.length < 2) {
      setResults([])
      return
    }

    const search = async () => {
      setIsSearching(true)
      try {
        const found = await searchPokemonByName(query)
        setResults(found)
      } catch (error) {
        console.error('Search failed:', error)
        setResults([])
      } finally {
        setIsSearching(false)
      }
    }

    const debounce = setTimeout(search, 200)
    return () => clearTimeout(debounce)
  }, [query])

  return { results, isSearching }
}
