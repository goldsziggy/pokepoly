import { useEffect, useMemo, useState, useRef } from 'react'
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
  const { selectedRegions, setAvailablePokemon, availablePokemon } = useBoardStore()
  const [isInitialized, setIsInitialized] = useState(false)
  const lastPokemonCountRef = useRef(0)

  useEffect(() => {
    setIsInitialized(true)
  }, [])

  const { data: cachedPokemon, isLoading: isLoadingCached, isFetching: isFetchingCached } = useQuery({
    queryKey: ['pokemon', 'cached'],
    queryFn: getAllCachedPokemon,
    enabled: isInitialized,
    staleTime: Infinity,
    retry: 0,
  })

  // Ensure at least Kanto is cached (fastest first-run experience) and then read back.
  const { data: basicPokemon, isLoading: isLoadingBasic, isFetching: isFetchingBasic } = useQuery({
    queryKey: ['pokemon', 'basic'],
    queryFn: async () => {
      await ensureBasicPokemonCached()
      return getAllCachedPokemon()
    },
    enabled: isInitialized,
    staleTime: Infinity,
    retry: 1,
    retryDelay: 750,
  })

  const loadedRegions = useMemo(() => {
    const set = new Set<Region>()
    for (const p of availablePokemon) set.add(p.region)
    return set
  }, [availablePokemon])

  const missingRegions = useMemo(
    () => selectedRegions.filter((r) => !loadedRegions.has(r)),
    [loadedRegions, selectedRegions]
  )

  // Fetch missing regions on-demand (mobile-friendly; avoids fetching the entire dex eagerly).
  const { data: fetchedRegionPokemon, isFetching: isFetchingRegions } = useQuery({
    queryKey: ['pokemon', 'regions', ...missingRegions],
    queryFn: async () => {
      const lists = await Promise.all(missingRegions.map(fetchRegionPokemon))
      return lists.flat()
    },
    enabled: isInitialized && missingRegions.length > 0,
    staleTime: Infinity,
    retry: 2,
    retryDelay: 750,
  })

  const mergePokemon = (existing: Pokemon[], incoming: Pokemon[]) => {
    if (incoming.length === 0) return existing
    const map = new Map<number, Pokemon>()
    for (const p of existing) map.set(p.id, p)
    let changed = false
    for (const p of incoming) {
      if (!map.has(p.id)) {
        map.set(p.id, p)
        changed = true
      }
    }
    if (!changed) return existing
    return Array.from(map.values()).sort((a, b) => a.id - b.id)
  }

  // Update store with cached data - only update if we have new data.
  useEffect(() => {
    const candidates = [basicPokemon, cachedPokemon].filter(Boolean) as Pokemon[][]
    if (candidates.length === 0) return

    const best = candidates.reduce((acc, cur) => (cur.length > acc.length ? cur : acc))
    if (best.length === 0) return

    if (lastPokemonCountRef.current !== best.length) {
      setAvailablePokemon(best)
      lastPokemonCountRef.current = best.length
    }
  }, [basicPokemon, cachedPokemon, setAvailablePokemon])

  // Merge region fetches into the store to expand availability as the user selects more regions.
  useEffect(() => {
    if (!fetchedRegionPokemon || fetchedRegionPokemon.length === 0) return
    const merged = mergePokemon(availablePokemon, fetchedRegionPokemon)
    if (merged.length !== availablePokemon.length) {
      setAvailablePokemon(merged)
      lastPokemonCountRef.current = merged.length
    }
  }, [availablePokemon, fetchedRegionPokemon, setAvailablePokemon])

  // Filter Pokemon by selected regions for display purposes only
  const regionPokemon = useMemo(
    () => {
      const pokemonToFilter = availablePokemon.length > 0
        ? availablePokemon
        : basicPokemon && basicPokemon.length > 0
          ? basicPokemon
          : (cachedPokemon || [])

      const filtered = pokemonToFilter.filter((p) => selectedRegions.includes(p.region))
      console.log('[usePokemonData] Filtered Pokemon for display:', {
        totalCount: pokemonToFilter.length,
        selectedRegions,
        filteredCount: filtered.length,
        filteredRegions: [...new Set(filtered.map(p => p.region))],
      })
      return filtered
    },
    [availablePokemon, basicPokemon, cachedPokemon, selectedRegions]
  )

  // Only show full loading on initial load (no data yet)
  // For region changes, show subtle fetching indicator
  const hasData =
    availablePokemon.length > 0 ||
    (basicPokemon && basicPokemon.length > 0) ||
    (cachedPokemon && cachedPokemon.length > 0)
  const isInitialLoading = !isInitialized || ((!hasData) && (isLoadingBasic || isLoadingCached))

  return {
    isLoading: isInitialLoading,
    isFetching: (isFetchingCached || isFetchingBasic || isFetchingRegions) && !isInitialLoading,
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
