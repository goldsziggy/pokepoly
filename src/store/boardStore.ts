import { create } from 'zustand'
import type { Pokemon, Region, PaperSize, BoardSpace, CardSize, BoardSize } from '@/types'
import { randomizeBoard, generateSeed, type BoardSlot } from '@/lib/randomizer'
import { buildBoardSpaces } from '@/lib/board'

import type { BoardColor } from '@/types/board'

interface BoardState {
  // Configuration
  selectedRegions: Region[]
  favoritePokemon: Pokemon[]
  paperSize: PaperSize
  boardSize: BoardSize
  cardSize: CardSize
  players: number
  seed: string
  typeColorMapping: Record<BoardColor, string | null> | null

  // Generated board
  properties: BoardSlot[]
  boardSpaces: BoardSpace[]

  // Available Pokémon (loaded from cache/API)
  availablePokemon: Pokemon[]

  // UI state
  isGenerating: boolean
  isPdfGenerating: boolean

  // Actions
  setSelectedRegions: (regions: Region[]) => void
  toggleRegion: (region: Region) => void
  addFavorite: (pokemon: Pokemon) => void
  removeFavorite: (id: number) => void
  setPaperSize: (size: PaperSize) => void
  setBoardSize: (size: BoardSize) => void
  setCardSize: (size: CardSize) => void
  setPlayers: (players: number) => void
  setSeed: (seed: string) => void
  setAvailablePokemon: (pokemon: Pokemon[]) => void
  setTypeColorMapping: (mapping: Record<BoardColor, string | null>) => void
  regenerateBoard: () => void
  newRandomSeed: () => void
  setIsGenerating: (generating: boolean) => void
  setIsPdfGenerating: (generating: boolean) => void
  resetQuestionnaire: () => void
  generateRandomBoard: (pokemon?: Pokemon[]) => void

  // State restoration (from URL)
  restoreState: (state: Partial<{
    regions: Region[]
    favorites: Pokemon[]
    paperSize: PaperSize
    boardSize: BoardSize
    cardSize: CardSize
    seed: string
  }>) => void
}

export const useBoardStore = create<BoardState>((set, get) => ({
  // Initial state
  selectedRegions: ['kanto'],
  favoritePokemon: [],
  paperSize: 'letter',
  boardSize: 'small',
  cardSize: 'medium',
  players: 4,
  seed: generateSeed(),
  typeColorMapping: null,
  properties: [],
  boardSpaces: [],
  availablePokemon: [],
  isGenerating: false,
  isPdfGenerating: false,

  // Actions
  setSelectedRegions: (regions) => {
    set({ selectedRegions: regions })
    // Regenerate board immediately - availablePokemon contains all Pokemon, randomizer will filter
    get().regenerateBoard()
  },

  toggleRegion: (region) => {
    const current = get().selectedRegions
    const newRegions = current.includes(region)
      ? current.filter(r => r !== region)
      : [...current, region]

    // Ensure at least one region is selected
    if (newRegions.length === 0) return

    set({ selectedRegions: newRegions })
    // Regenerate board immediately - availablePokemon contains all Pokemon, randomizer will filter
    get().regenerateBoard()
  },

  addFavorite: (pokemon) => {
    const current = get().favoritePokemon
    if (current.some(p => p.id === pokemon.id)) return
    if (current.length >= 22) return // Max 22 properties

    set({ favoritePokemon: [...current, pokemon] })
    // Don't auto-regenerate in questionnaire mode
  },

  removeFavorite: (id) => {
    set({ favoritePokemon: get().favoritePokemon.filter(p => p.id !== id) })
    // Don't auto-regenerate in questionnaire mode
  },

  setPaperSize: (size) => set({ paperSize: size }),
  setBoardSize: (size) => set({ boardSize: size }),
  setCardSize: (size) => set({ cardSize: size }),
  setPlayers: (players) => {
    const normalized = Number.isFinite(players) ? Math.max(1, Math.floor(players)) : 1
    set({ players: normalized })
  },

  setSeed: (seed) => {
    set({ seed })
    get().regenerateBoard()
  },

  setAvailablePokemon: (pokemon) => {
    const previousCount = get().availablePokemon.length
    const dataChanged = previousCount !== pokemon.length
    
    set({ availablePokemon: pokemon })
    
    console.log('[BoardStore] setAvailablePokemon called:', {
      previousCount,
      newCount: pokemon.length,
      dataChanged,
      regions: [...new Set(pokemon.map(p => p.region))],
    })
    
    // Auto-regenerate if we have new Pokemon data (initial load or new Pokemon fetched)
    // availablePokemon now contains ALL Pokemon, so we can regenerate immediately
    if (pokemon.length > 0 && dataChanged) {
      console.log('[BoardStore] setAvailablePokemon: New data loaded, triggering regenerateBoard')
      // Use setTimeout to avoid calling during render
      setTimeout(() => {
        get().regenerateBoard()
      }, 0)
    }
  },

  setTypeColorMapping: (mapping) => {
    set({ typeColorMapping: mapping })
    get().regenerateBoard()
  },

  regenerateBoard: () => {
    const { availablePokemon, selectedRegions, favoritePokemon, seed, typeColorMapping, isGenerating } = get()

    // Prevent concurrent regenerations
    if (isGenerating) {
      console.log('[BoardStore] regenerateBoard: Already generating, skipping')
      return
    }

    console.log('[BoardStore] regenerateBoard called:', {
      availablePokemonCount: availablePokemon.length,
      selectedRegions,
      availablePokemonRegions: [...new Set(availablePokemon.map(p => p.region))],
    })

    if (availablePokemon.length === 0) {
      console.warn('[BoardStore] regenerateBoard: No available Pokemon, skipping')
      return
    }

    if (selectedRegions.length === 0) {
      console.warn('[BoardStore] regenerateBoard: No regions selected, skipping')
      return
    }

    set({ isGenerating: true })

    // Pass ALL Pokemon to randomizer - it will filter by selectedRegions
    // This eliminates race conditions since availablePokemon never changes when regions change
    const result = randomizeBoard(availablePokemon, {
      regions: selectedRegions,
      favorites: favoritePokemon,
      seed,
      typeColorMapping: typeColorMapping || undefined,
    })

    const boardSpaces = buildBoardSpaces(result.properties)

    set({
      properties: result.properties,
      boardSpaces,
      isGenerating: false,
    })
  },

  resetQuestionnaire: () => {
    set({
      favoritePokemon: [],
      typeColorMapping: null,
      seed: generateSeed(),
      properties: [],
      boardSpaces: [],
      players: 4,
    })
  },

  generateRandomBoard: (pokemon?: Pokemon[]) => {
    const { availablePokemon, selectedRegions } = get()
    // Use passed pokemon array if provided, otherwise fall back to store
    const pokemonToUse = pokemon && pokemon.length > 0 ? pokemon : availablePokemon
    if (pokemonToUse.length === 0) return

    const newSeed = generateSeed()
    set({
      isGenerating: true,
      favoritePokemon: [],
      typeColorMapping: null,
      seed: newSeed,
    })

    const result = randomizeBoard(pokemonToUse, {
      regions: selectedRegions,
      favorites: [],
      seed: newSeed,
    })

    const boardSpaces = buildBoardSpaces(result.properties)

    set({
      properties: result.properties,
      boardSpaces,
      seed: newSeed,
      isGenerating: false,
    })
  },

  newRandomSeed: () => {
    const newSeed = generateSeed()
    set({ seed: newSeed })
    get().regenerateBoard()
  },

  setIsGenerating: (generating) => set({ isGenerating: generating }),
  setIsPdfGenerating: (generating) => set({ isPdfGenerating: generating }),

  restoreState: (state) => {
    const updates: Partial<BoardState> = {}

    if (state.regions) updates.selectedRegions = state.regions
    if (state.favorites) updates.favoritePokemon = state.favorites
    if (state.paperSize) updates.paperSize = state.paperSize
    if (state.boardSize) updates.boardSize = state.boardSize
    if (state.cardSize) updates.cardSize = state.cardSize
    if (state.seed) updates.seed = state.seed

    set(updates)
    get().regenerateBoard()
  },
}))
