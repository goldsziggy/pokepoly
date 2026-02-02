import { useQueryState, parseAsArrayOf, parseAsString } from 'nuqs'
import { useEffect, useCallback, useRef } from 'react'
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
  const restoreState = useBoardStore(s => s.restoreState)
  const selectedRegions = useBoardStore(s => s.selectedRegions)
  const favoritePokemon = useBoardStore(s => s.favoritePokemon)
  const paperSize = useBoardStore(s => s.paperSize)
  const boardSize = useBoardStore(s => s.boardSize)
  const cardSize = useBoardStore(s => s.cardSize)
  const seed = useBoardStore(s => s.seed)
  const didRestoreRef = useRef(false)

  // URL state
  const [urlRegions, setUrlRegions] = useQueryState('r', parseAsRegions)
  const [urlFavoriteIds, setUrlFavoriteIds] = useQueryState('f', parseAsFavoriteIds)
  const [urlPaperSize, setUrlPaperSize] = useQueryState('p', parseAsPaperSize)
  const [urlSeed, setUrlSeed] = useQueryState('s', parseAsSeed)
  const [urlBoardSize, setUrlBoardSize] = useQueryState('b', parseAsBoardSize)
  const [urlCardSize, setUrlCardSize] = useQueryState('c', parseAsCardSize)
  const restoringInFlightRef = useRef(false)

  // Restore state from URL on mount (and when URL params hydrate, e.g. favorites)
  useEffect(() => {
    if (!options.restoreOnMount) return
    if (didRestoreRef.current) return
    if (restoringInFlightRef.current) return

    // If the URL has no recognized params yet, don't restore anything.
    // (nuqs can hydrate after first render in some deployments.)
    const hasAnyParam =
      (urlRegions && urlRegions.length > 0) ||
      (urlFavoriteIds && urlFavoriteIds.length > 0) ||
      !!urlPaperSize ||
      !!urlBoardSize ||
      !!urlCardSize ||
      !!urlSeed

    if (!hasAnyParam) return

    restoringInFlightRef.current = true

    const restoreFromUrl = async () => {
      try {
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
          // Normalize: nuqs may return array of strings or single comma-separated string
          const raw = urlRegions.flatMap(s => (typeof s === 'string' && s.includes(',') ? s.split(',') : [s]))
          const regions = raw.filter((r): r is Region => REGIONS.includes(r as Region))
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

        // Fetch favorite Pokémon/Pals if IDs are provided
        // Normalize: nuqs may return array of strings or single comma-separated string
        let favorites: Pokemon[] = []
        if (urlFavoriteIds && urlFavoriteIds.length > 0) {
          const raw = urlFavoriteIds.flatMap(s => (typeof s === 'string' && s.includes(',') ? s.split(',') : [s]))
          const ids = raw.map(s => parseInt(String(s).trim(), 10)).filter(id => !isNaN(id))
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
          restoreState(updates)
        }

        // Only mark "fully restored" when we had favorite IDs in the URL, so we don't block
        // a second run when nuqs hydrates f=... after the first run (which had empty favorites).
        if (urlFavoriteIds && urlFavoriteIds.length > 0) {
          didRestoreRef.current = true
        }
      } finally {
        restoringInFlightRef.current = false
      }
    }

    void restoreFromUrl()
  }, [options.restoreOnMount, restoreState, urlBoardSize, urlCardSize, urlFavoriteIds, urlPaperSize, urlRegions, urlSeed])

  // Sync store changes to URL
  const syncToUrl = useCallback(() => {
    setUrlRegions(selectedRegions)
    setUrlFavoriteIds(favoritePokemon.map(p => p.id.toString()))
    setUrlPaperSize(paperSize)
    setUrlBoardSize(boardSize)
    setUrlCardSize(cardSize)
    setUrlSeed(seed)
  }, [boardSize, cardSize, favoritePokemon, paperSize, seed, selectedRegions, setUrlBoardSize, setUrlCardSize, setUrlFavoriteIds, setUrlPaperSize, setUrlRegions, setUrlSeed])

  // Generate shareable URL
  const getShareableUrl = useCallback(() => {
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
    params.set('ready', '1')

    // Prefer Vite BASE_URL so subpath deployments (GitHub/GitLab Pages) share correct links.
    const basePath = (import.meta as ImportMeta & { env?: { BASE_URL?: string } }).env?.BASE_URL || window.location.pathname
    const normalizedBasePath = basePath.endsWith('/') ? basePath : `${basePath}/`
    const baseUrl = window.location.origin + normalizedBasePath
    return `${baseUrl}?${params.toString()}`
  }, [boardSize, cardSize, favoritePokemon, paperSize, seed, selectedRegions])

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
