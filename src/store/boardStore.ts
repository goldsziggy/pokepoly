import { create } from 'zustand'
import type { Pokemon, Region, PaperSize, BoardSpace, CardSize } from '@/types'
import { randomizeBoard, generateSeed, type BoardSlot } from '@/lib/randomizer'
import { buildBoardSpaces } from '@/lib/board'

interface BoardState {
  // Configuration
  selectedRegions: Region[]
  favoritePokemon: Pokemon[]
  paperSize: PaperSize
  cardSize: CardSize
  seed: string

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
  setCardSize: (size: CardSize) => void
  setSeed: (seed: string) => void
  setAvailablePokemon: (pokemon: Pokemon[]) => void
  regenerateBoard: () => void
  newRandomSeed: () => void
  setIsGenerating: (generating: boolean) => void
  setIsPdfGenerating: (generating: boolean) => void

  // State restoration (from URL)
  restoreState: (state: Partial<{
    regions: Region[]
    favorites: Pokemon[]
    paperSize: PaperSize
    cardSize: CardSize
    seed: string
  }>) => void
}

export const useBoardStore = create<BoardState>((set, get) => ({
  // Initial state
  selectedRegions: ['kanto'],
  favoritePokemon: [],
  paperSize: 'letter',
  cardSize: 'small',
  seed: generateSeed(),
  properties: [],
  boardSpaces: [],
  availablePokemon: [],
  isGenerating: false,
  isPdfGenerating: false,

  // Actions
  setSelectedRegions: (regions) => {
    set({ selectedRegions: regions })
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
    get().regenerateBoard()
  },

  addFavorite: (pokemon) => {
    const current = get().favoritePokemon
    if (current.some(p => p.id === pokemon.id)) return
    if (current.length >= 22) return // Max 22 properties

    set({ favoritePokemon: [...current, pokemon] })
    get().regenerateBoard()
  },

  removeFavorite: (id) => {
    set({ favoritePokemon: get().favoritePokemon.filter(p => p.id !== id) })
    get().regenerateBoard()
  },

  setPaperSize: (size) => set({ paperSize: size }),
  setCardSize: (size) => set({ cardSize: size }),

  setSeed: (seed) => {
    set({ seed })
    get().regenerateBoard()
  },

  setAvailablePokemon: (pokemon) => {
    set({ availablePokemon: pokemon })
    get().regenerateBoard()
  },

  regenerateBoard: () => {
    const { availablePokemon, selectedRegions, favoritePokemon, seed } = get()

    if (availablePokemon.length === 0) return

    set({ isGenerating: true })

    const result = randomizeBoard(availablePokemon, {
      regions: selectedRegions,
      favorites: favoritePokemon,
      seed,
    })

    const boardSpaces = buildBoardSpaces(result.properties)

    set({
      properties: result.properties,
      boardSpaces,
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
    if (state.cardSize) updates.cardSize = state.cardSize
    if (state.seed) updates.seed = state.seed

    set(updates)
    get().regenerateBoard()
  },
}))
