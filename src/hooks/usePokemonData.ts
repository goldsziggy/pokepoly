import { useEffect, useMemo, useState, useRef } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useBoardStore } from '@/store'
import {
  ensureAllPokemonCached,
  searchPokemonByName,
} from '@/services/pokeapi'
import type { Pokemon } from '@/types'

export function usePokemonData() {
  const { selectedRegions, setAvailablePokemon, availablePokemon } = useBoardStore()
  const [isInitialized, setIsInitialized] = useState(false)
  const lastPokemonCountRef = useRef(0)

  useEffect(() => {
    setIsInitialized(true)
  }, [])

  // Fetch the full dex once (via the list endpoint + batching)
  // Store ALL Pokemon in availablePokemon - filtering happens in randomizer
  const { data: allPokemon, isLoading: isLoadingAll, isFetching } = useQuery({
    queryKey: ['pokemon', 'all'],
    queryFn: async () => {
      const pokemon = await ensureAllPokemonCached()
      if (pokemon.length === 0) {
        throw new Error('No Pokemon data available. Please check your internet connection and try again.')
      }
      console.log('[usePokemonData] Fetched allPokemon:', {
        count: pokemon.length,
        regions: [...new Set(pokemon.map(p => p.region))],
        regionCounts: Object.fromEntries(
          [...new Set(pokemon.map(p => p.region))].map(region => [
            region,
            pokemon.filter(p => p.region === region).length
          ])
        ),
      })
      return pokemon
    },
    enabled: isInitialized,
    staleTime: Infinity,
    retry: 2,
    retryDelay: 1000,
  })

  // Update store with ALL Pokemon (not filtered) - only update if we have new data
  useEffect(() => {
    if (allPokemon && allPokemon.length > 0) {
      // Only update if we don't have data yet, or if the count changed (new Pokemon loaded)
      if (lastPokemonCountRef.current !== allPokemon.length) {
        console.log('[usePokemonData] Setting availablePokemon (all Pokemon):', {
          previousCount: lastPokemonCountRef.current,
          newCount: allPokemon.length,
          regions: [...new Set(allPokemon.map(p => p.region))],
        })
        setAvailablePokemon(allPokemon)
        lastPokemonCountRef.current = allPokemon.length
      }
    }
  }, [allPokemon, setAvailablePokemon])

  // Filter Pokemon by selected regions for display purposes only
  const regionPokemon = useMemo(
    () => {
      // Prefer the largest dataset available to avoid UI getting "stuck" if any flow
      // ever temporarily narrows `availablePokemon` in the store.
      const pokemonToFilter =
        allPokemon && allPokemon.length > availablePokemon.length
          ? allPokemon
          : availablePokemon.length > 0
            ? availablePokemon
            : (allPokemon || [])
      const filtered = pokemonToFilter.filter((p) => selectedRegions.includes(p.region))
      console.log('[usePokemonData] Filtered Pokemon for display:', {
        totalCount: pokemonToFilter.length,
        selectedRegions,
        filteredCount: filtered.length,
        filteredRegions: [...new Set(filtered.map(p => p.region))],
      })
      return filtered
    },
    [availablePokemon, allPokemon, selectedRegions]
  )

  // Only show full loading on initial load (no data yet)
  // For region changes, show subtle fetching indicator
  const hasData = availablePokemon.length > 0 || (allPokemon && allPokemon.length > 0)
  const isInitialLoading = !isInitialized || (isLoadingAll && !hasData)

  return {
    isLoading: isInitialLoading,
    isFetching: isFetching && !isInitialLoading,
    pokemonCount: regionPokemon.length,
    // Return filtered Pokemon for display
    pokemon: regionPokemon,
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
