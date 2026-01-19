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

  // Load all Pokemon for questionnaire mode (always load all)
  const { data: allPokemon, isLoading: isLoadingAll } = useQuery({
    queryKey: ['pokemon', 'all'],
    queryFn: async () => {
      return await getAllCachedPokemon()
    },
    enabled: isInitialized,
    staleTime: Infinity,
  })

  // Fetch Pokémon for selected regions (for backward compatibility)
  const { data: regionPokemon, isLoading: isLoadingRegions } = useQuery({
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
    staleTime: Infinity,
  })

  // Update store - prefer all Pokemon, fallback to region Pokemon
  useEffect(() => {
    if (allPokemon && allPokemon.length > 0) {
      setAvailablePokemon(allPokemon)
    } else if (regionPokemon && regionPokemon.length > 0) {
      setAvailablePokemon(regionPokemon)
    }
  }, [allPokemon, regionPokemon, setAvailablePokemon])

  return {
    isLoading: !isInitialized || (isLoadingAll && isLoadingRegions),
    pokemonCount: allPokemon?.length ?? regionPokemon?.length ?? 0,
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
