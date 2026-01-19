import { useQueryState, parseAsArrayOf, parseAsString } from 'nuqs'
import { useEffect, useCallback } from 'react'
import { useBoardStore } from '@/store'
import type { Region, PaperSize, Pokemon } from '@/types'
import { REGIONS } from '@/types'
import { fetchPokemonBatch } from '@/services/pokeapi'

// Custom parser for regions
const parseAsRegions = parseAsArrayOf(parseAsString).withDefault(['kanto'])

// Custom parser for favorite IDs
const parseAsFavoriteIds = parseAsArrayOf(parseAsString).withDefault([])

// Paper size parser
const parseAsPaperSize = parseAsString.withDefault('letter')

// Seed parser
const parseAsSeed = parseAsString.withDefault('')

export function useUrlState() {
  const store = useBoardStore()

  // URL state
  const [urlRegions, setUrlRegions] = useQueryState('r', parseAsRegions)
  const [urlFavoriteIds, setUrlFavoriteIds] = useQueryState('f', parseAsFavoriteIds)
  const [urlPaperSize, setUrlPaperSize] = useQueryState('p', parseAsPaperSize)
  const [urlSeed, setUrlSeed] = useQueryState('s', parseAsSeed)

  // Restore state from URL on mount
  useEffect(() => {
    const restoreFromUrl = async () => {
      // Parse regions
      const regions = (urlRegions as string[])
        .filter((r): r is Region => REGIONS.includes(r as Region))

      // Parse paper size
      const paperSize = (urlPaperSize === 'a4' ? 'a4' : 'letter') as PaperSize

      // Parse seed
      const seed = urlSeed || undefined

      // Fetch favorite Pokémon if IDs are provided
      let favorites: Pokemon[] = []
      if (urlFavoriteIds.length > 0) {
        const ids = urlFavoriteIds.map(id => parseInt(id, 10)).filter(id => !isNaN(id))
        if (ids.length > 0) {
          try {
            favorites = await fetchPokemonBatch(ids)
          } catch (error) {
            console.error('Failed to fetch favorites from URL:', error)
          }
        }
      }

      // Restore to store
      store.restoreState({
        regions: regions.length > 0 ? regions : undefined,
        favorites: favorites.length > 0 ? favorites : undefined,
        paperSize,
        seed,
      })
    }

    restoreFromUrl()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // Only run on mount

  // Sync store changes to URL
  const syncToUrl = useCallback(() => {
    const { selectedRegions, favoritePokemon, paperSize, seed } = store

    setUrlRegions(selectedRegions)
    setUrlFavoriteIds(favoritePokemon.map(p => p.id.toString()))
    setUrlPaperSize(paperSize)
    setUrlSeed(seed)
  }, [store, setUrlRegions, setUrlFavoriteIds, setUrlPaperSize, setUrlSeed])

  // Generate shareable URL
  const getShareableUrl = useCallback(() => {
    const { selectedRegions, favoritePokemon, paperSize, seed } = store
    const params = new URLSearchParams()

    if (selectedRegions.length > 0) {
      params.set('r', selectedRegions.join(','))
    }
    if (favoritePokemon.length > 0) {
      params.set('f', favoritePokemon.map(p => p.id).join(','))
    }
    if (paperSize !== 'letter') {
      params.set('p', paperSize)
    }
    if (seed) {
      params.set('s', seed)
    }

    const baseUrl = window.location.origin + window.location.pathname
    return `${baseUrl}?${params.toString()}`
  }, [store])

  const copyShareableUrl = useCallback(async () => {
    const url = getShareableUrl()
    try {
      await navigator.clipboard.writeText(url)
      return true
    } catch {
      return false
    }
  }, [getShareableUrl])

  return {
    syncToUrl,
    getShareableUrl,
    copyShareableUrl,
  }
}
