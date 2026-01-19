import { useQueryState, parseAsArrayOf, parseAsString } from 'nuqs'
import { useEffect, useCallback } from 'react'
import { useBoardStore } from '@/store'
import type { Region, PaperSize, Pokemon, BoardSize, CardSize } from '@/types'
import { REGIONS } from '@/types'
import { fetchPokemonBatch } from '@/services/pokeapi'

// NOTE: Do not set defaults here. Defaults cause "missing" URL params to be treated
// as real values (e.g. regions defaulting to kanto), which can overwrite store state
// when this hook mounts in unrelated UI (like the Share button).
const parseAsRegions = parseAsArrayOf(parseAsString)
const parseAsFavoriteIds = parseAsArrayOf(parseAsString)
const parseAsPaperSize = parseAsString
const parseAsSeed = parseAsString
const parseAsBoardSize = parseAsString
const parseAsCardSize = parseAsString

type UrlStateOptions = {
  restoreOnMount?: boolean
}

export function useUrlState(options: UrlStateOptions = {}) {
  const store = useBoardStore()

  // URL state
  const [urlRegions, setUrlRegions] = useQueryState('r', parseAsRegions)
  const [urlFavoriteIds, setUrlFavoriteIds] = useQueryState('f', parseAsFavoriteIds)
  const [urlPaperSize, setUrlPaperSize] = useQueryState('p', parseAsPaperSize)
  const [urlSeed, setUrlSeed] = useQueryState('s', parseAsSeed)
  const [urlBoardSize, setUrlBoardSize] = useQueryState('b', parseAsBoardSize)
  const [urlCardSize, setUrlCardSize] = useQueryState('c', parseAsCardSize)

  // Restore state from URL on mount
  useEffect(() => {
    if (!options.restoreOnMount) return

    const restoreFromUrl = async () => {
      const updates: Partial<{
        regions: Region[]
        favorites: Pokemon[]
        paperSize: PaperSize
        boardSize: BoardSize
        cardSize: CardSize
        seed: string
      }> = {}

      // Parse regions (only if param exists)
      if (urlRegions && urlRegions.length > 0) {
        const regions = urlRegions.filter((r): r is Region => REGIONS.includes(r as Region))
        if (regions.length > 0) updates.regions = regions
      }

      // Parse paper size (only if param exists and valid)
      if (urlPaperSize) {
        const paperSize = (urlPaperSize === 'a4' ? 'a4' : urlPaperSize === 'letter' ? 'letter' : null) as PaperSize | null
        if (paperSize) updates.paperSize = paperSize
      }

      // Parse board size (only if param exists and valid)
      if (urlBoardSize) {
        const validBoardSizes: BoardSize[] = ['small', 'medium', 'large']
        if (validBoardSizes.includes(urlBoardSize as BoardSize)) {
          updates.boardSize = urlBoardSize as BoardSize
        }
      }

      // Parse card size (only if param exists and valid)
      if (urlCardSize) {
        const validCardSizes: CardSize[] = ['small', 'medium', 'large']
        if (validCardSizes.includes(urlCardSize as CardSize)) {
          updates.cardSize = urlCardSize as CardSize
        }
      }

      // Parse seed (only if param exists)
      if (urlSeed) updates.seed = urlSeed

      // Fetch favorite Pokémon if IDs are provided
      let favorites: Pokemon[] = []
      if (urlFavoriteIds && urlFavoriteIds.length > 0) {
        const ids = urlFavoriteIds.map(id => parseInt(id, 10)).filter(id => !isNaN(id))
        if (ids.length > 0) {
          try {
            favorites = await fetchPokemonBatch(ids)
          } catch (error) {
            console.error('Failed to fetch favorites from URL:', error)
          }
        }
      }

      if (favorites.length > 0) updates.favorites = favorites

      if (Object.keys(updates).length > 0) {
        store.restoreState(updates)
      }
    }

    restoreFromUrl()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // Only run on mount

  // Sync store changes to URL
  const syncToUrl = useCallback(() => {
    const { selectedRegions, favoritePokemon, paperSize, boardSize, cardSize, seed } = store

    setUrlRegions(selectedRegions)
    setUrlFavoriteIds(favoritePokemon.map(p => p.id.toString()))
    setUrlPaperSize(paperSize)
    setUrlBoardSize(boardSize)
    setUrlCardSize(cardSize)
    setUrlSeed(seed)
  }, [store, setUrlRegions, setUrlFavoriteIds, setUrlPaperSize, setUrlBoardSize, setUrlCardSize, setUrlSeed])

  // Generate shareable URL
  const getShareableUrl = useCallback(() => {
    const { selectedRegions, favoritePokemon, paperSize, boardSize, cardSize, seed } = store
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
    if (boardSize !== 'small') {
      params.set('b', boardSize)
    }
    if (cardSize !== 'medium') {
      params.set('c', cardSize)
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
