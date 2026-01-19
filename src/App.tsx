import { useEffect, useState } from 'react'
import { Card, Spinner } from '@/components/ui'
import {
  RegionSelector,
  FavoriteSelector,
  PaperSizeSelector,
  SeedControl,
  ShareButton,
  GeneratePdfButton,
} from '@/components/configurator'
import { BoardPreview, CollageGenerator } from '@/components/board'
import { usePokemonData, useUrlState } from '@/hooks'
import { useBoardStore } from '@/store'

type ViewMode = 'board' | 'collage'

function Header() {
  return (
    <header className="mb-8 text-center">
      <h1 className="font-pixel text-xl md:text-2xl text-poke-yellow mb-2">
        POKE-POLY
      </h1>
      <p className="font-pixel text-xs text-pixel-text">
        The Master League
      </p>
      <p className="font-pixel text-[8px] text-gray-500 mt-2">
        Generate a custom Pokemon Monopoly board
      </p>
    </header>
  )
}

function LoadingScreen() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center">
      <Spinner size="lg" />
      <p className="font-pixel text-xs text-pixel-text mt-4">
        Loading Pokemon data...
      </p>
      <p className="font-pixel text-[8px] text-gray-500 mt-2">
        First load may take a moment
      </p>
    </div>
  )
}

function Configurator() {
  return (
    <div className="space-y-6">
      <Card title="Regions">
        <RegionSelector />
      </Card>

      <Card title="Favorites">
        <FavoriteSelector />
      </Card>

      <Card title="Settings">
        <div className="space-y-6">
          <PaperSizeSelector />
          <SeedControl />
        </div>
      </Card>

      <Card title="Export">
        <div className="space-y-6">
          <GeneratePdfButton />
          <ShareButton />
        </div>
      </Card>
    </div>
  )
}

function PreviewSection() {
  const { boardSpaces, selectedRegions, favoritePokemon, seed } = useBoardStore()
  const [viewMode, setViewMode] = useState<ViewMode>('board')

  return (
    <Card title="Board Preview">
      <div className="space-y-4">
        {/* View toggle */}
        <div className="flex items-center justify-between">
          <div className="flex flex-wrap gap-2 text-[8px] font-pixel text-gray-500">
            <span>Regions: {selectedRegions.join(', ')}</span>
            <span>•</span>
            <span>Favorites: {favoritePokemon.length}</span>
            <span>•</span>
            <span>Seed: {seed}</span>
          </div>

          <div className="flex gap-1">
            <button
              onClick={() => setViewMode('board')}
              className={`px-2 py-1 text-[8px] font-pixel rounded border transition-colors ${
                viewMode === 'board'
                  ? 'bg-green-600 text-white border-green-700'
                  : 'bg-white text-gray-600 border-gray-300 hover:border-green-500'
              }`}
            >
              Board
            </button>
            <button
              onClick={() => setViewMode('collage')}
              className={`px-2 py-1 text-[8px] font-pixel rounded border transition-colors ${
                viewMode === 'collage'
                  ? 'bg-green-600 text-white border-green-700'
                  : 'bg-white text-gray-600 border-gray-300 hover:border-green-500'
              }`}
            >
              Collage
            </button>
          </div>
        </div>

        <div className="overflow-auto max-h-[calc(100vh-300px)]">
          <div className="flex justify-center">
            {viewMode === 'board' ? <BoardPreview /> : <CollageGenerator />}
          </div>
        </div>

        {boardSpaces.length > 0 && viewMode === 'board' && (
          <p className="font-pixel text-[8px] text-gray-500 text-center">
            {boardSpaces.filter(s => s.type === 'property').length} properties generated
          </p>
        )}
      </div>
    </Card>
  )
}

function Footer() {
  return (
    <footer className="mt-8 py-4 border-t border-pixel-border text-center">
      <p className="font-pixel text-[8px] text-gray-500">
        Pokemon data from PokeAPI • Not affiliated with Nintendo or The Pokemon Company
      </p>
      <p className="font-pixel text-[8px] text-gray-500 mt-1">
        Monopoly is a trademark of Hasbro
      </p>
    </footer>
  )
}

export default function App() {
  const { isLoading, pokemonCount } = usePokemonData()
  const { syncToUrl } = useUrlState()
  const { boardSpaces } = useBoardStore()

  // Sync state to URL when board changes
  useEffect(() => {
    if (boardSpaces.length > 0) {
      syncToUrl()
    }
  }, [boardSpaces, syncToUrl])

  if (isLoading) {
    return <LoadingScreen />
  }

  return (
    <div className="min-h-screen bg-pixel-bg">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <Header />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left column: Configurator */}
          <div className="lg:col-span-1">
            <Configurator />
          </div>

          {/* Right column: Preview */}
          <div className="lg:col-span-2">
            <PreviewSection />
          </div>
        </div>

        <Footer />
      </div>
    </div>
  )
}
