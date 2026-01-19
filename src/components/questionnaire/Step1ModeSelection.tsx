import { Card, Spinner } from '@/components/ui'
import { RegionSelector } from '@/components/configurator'
import { usePokemonData } from '@/hooks'
import { useBoardStore } from '@/store'
import type { QuestionnaireMode } from './Questionnaire'
import type { Pokemon } from '@/types'

interface Step1ModeSelectionProps {
  onSelect: (mode: QuestionnaireMode, pokemon?: Pokemon[]) => void
}

export function Step1ModeSelection({ onSelect }: Step1ModeSelectionProps) {
  const { isLoading, isFetching, pokemonCount, pokemon } = usePokemonData()
  const { selectedRegions } = useBoardStore()

  // Disable buttons while fetching new region data
  const isDisabled = isLoading || isFetching

  return (
    <div className="space-y-6">
      <Card title="Select Pokemon Regions">
        <div className="space-y-2">
          <p className="font-pixel text-[8px] text-gray-600 text-center mb-4">
            Choose which Pokemon generations to include on your board
          </p>
          <RegionSelector />
          <div className="flex items-center justify-center gap-2 mt-4 min-h-[20px]">
            {isFetching ? (
              <>
                <Spinner size="sm" />
                <p className="font-pixel text-[8px] text-gray-500">
                  Loading Pokemon for {selectedRegions.length} region{selectedRegions.length !== 1 ? 's' : ''}...
                </p>
              </>
            ) : pokemonCount > 0 ? (
              <p className="font-pixel text-[8px] text-green-600">
                {pokemonCount} Pokemon loaded and ready!
              </p>
            ) : null}
          </div>
        </div>
      </Card>

      <Card title="Choose Your Board Style">
        <div className="space-y-4">
          <p className="font-pixel text-xs text-pixel-text text-center">
            How would you like to generate your board?
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              onClick={() => onSelect('random', pokemon)}
              disabled={isDisabled || !pokemon || pokemon.length === 0}
              className={`p-6 border-4 border-gray-800 bg-white transition-colors text-left ${
                isDisabled || !pokemon || pokemon.length === 0 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50'
              }`}
            >
              <h3 className="font-pixel text-base text-pixel-accent mb-2">Full Random</h3>
              <p className="font-pixel text-[10px] text-gray-700">
                Generate a completely random board with no customization
              </p>
            </button>

            <button
              onClick={() => onSelect('customized')}
              disabled={isDisabled}
              className={`p-6 border-4 border-gray-800 bg-white transition-colors text-left ${
                isDisabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50'
              }`}
            >
              <h3 className="font-pixel text-base text-pixel-accent mb-2">Customized</h3>
              <p className="font-pixel text-[10px] text-gray-700">
                Select your favorite Pokemon and customize type assignments
              </p>
            </button>
          </div>
        </div>
      </Card>
    </div>
  )
}
