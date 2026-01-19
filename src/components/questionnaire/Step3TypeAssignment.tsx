import { useState, useEffect } from 'react'
import { Card, Button } from '@/components/ui'
import { useBoardStore } from '@/store'
import { getPrimaryType } from '@/lib/typeIcons'
import { COLOR_HEX, type BoardColor } from '@/types/board'
import { TypeIcon } from '@/types/TypeIcon'

const ALL_COLORS: BoardColor[] = ['brown', 'lightblue', 'pink', 'orange', 'red', 'yellow', 'green', 'darkblue']

const ALL_TYPES = [
  'normal', 'fire', 'water', 'electric', 'grass', 'ice',
  'fighting', 'poison', 'ground', 'flying', 'psychic', 'bug',
  'rock', 'ghost', 'dragon', 'dark', 'steel', 'fairy'
]

// Property counts per color (standard Monopoly layout)
const COLOR_COUNTS: Record<BoardColor, number> = {
  brown: 2,
  lightblue: 3,
  pink: 3,
  orange: 3,
  red: 3,
  yellow: 3,
  green: 3,
  darkblue: 2,
}

interface Step3TypeAssignmentProps {
  onComplete: () => void
  onBack: () => void
}

export function Step3TypeAssignment({ onComplete, onBack }: Step3TypeAssignmentProps) {
  const { favoritePokemon, setTypeColorMapping } = useBoardStore()
  const [colorTypes, setColorTypes] = useState<Record<BoardColor, string | null>>({
    brown: null,
    lightblue: null,
    pink: null,
    orange: null,
    red: null,
    yellow: null,
    green: null,
    darkblue: null,
  })

  // Auto-assign types based on favorites - only for colors that need them
  useEffect(() => {
    if (favoritePokemon.length === 0) {
      // No favorites, leave all null for auto-generation
      setColorTypes({
        brown: null,
        lightblue: null,
        pink: null,
        orange: null,
        red: null,
        yellow: null,
        green: null,
        darkblue: null,
      })
      return
    }

    // Count types in favorites
    const typeCounts = new Map<string, number>()
    for (const pokemon of favoritePokemon) {
      const primaryType = getPrimaryType(pokemon.types)
      if (primaryType) {
        typeCounts.set(primaryType, (typeCounts.get(primaryType) || 0) + 1)
      }
    }
    
    // Sort types by count (most common first)
    const sortedTypes = Array.from(typeCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([type]) => type)
    
    // Assign types to colors based on how many properties each color has
    // Types with more favorites get assigned to colors with more properties
    const newColorTypes: Record<BoardColor, string | null> = {
      brown: null,
      lightblue: null,
      pink: null,
      orange: null,
      red: null,
      yellow: null,
      green: null,
      darkblue: null,
    }

    // Sort colors by property count (descending) to assign most common types to colors with most properties
    const colorsByCount = [...ALL_COLORS].sort((a, b) => COLOR_COUNTS[b] - COLOR_COUNTS[a])
    
    let typeIdx = 0
    for (const color of colorsByCount) {
      if (typeIdx < sortedTypes.length) {
        newColorTypes[color] = sortedTypes[typeIdx]
        typeIdx++
      } else {
        // If no more favorite types, leave null for auto-generation
        newColorTypes[color] = null
      }
    }

    setColorTypes(newColorTypes)
  }, [favoritePokemon])

  const handleTypeChange = (color: BoardColor, type: string | null) => {
    setColorTypes(prev => ({ ...prev, [color]: type }))
  }

  const handleComplete = () => {
    setTypeColorMapping(colorTypes)
    onComplete()
  }

  const capitalize = (str: string) => str.charAt(0).toUpperCase() + str.slice(1)

  // Get colors that have type assignments (either auto-assigned from favorites or manually set)
  const colorsWithAssignments = ALL_COLORS.filter(color => colorTypes[color] !== null)

  return (
    <Card title="Step 3: Assign Types to Colors">
      <div className="space-y-4">
        <p className="font-pixel text-xs text-pixel-text">
          Assign types to colors based on your favorites. Colors without assignments will be auto-generated.
        </p>

        {colorsWithAssignments.length > 0 && (
          <div className="space-y-2">
            <p className="font-pixel text-[8px] text-gray-500">
              Colors with type assignments ({colorsWithAssignments.length}):
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {colorsWithAssignments.map((color) => (
                <div
                  key={color}
                  className="border-4 border-gray-800 p-4"
                  style={{ backgroundColor: COLOR_HEX[color] }}
                >
                  <div className="bg-white p-3 space-y-2 border-2 border-gray-800">
                    <div className="font-pixel text-xs font-bold text-center text-gray-900">
                      {capitalize(color.replace(/([A-Z])/g, ' $1').trim())}
                      <span className="text-[8px] text-gray-700 ml-2">
                        ({COLOR_COUNTS[color]} properties)
                      </span>
                    </div>
                    <select
                      value={colorTypes[color] || ''}
                      onChange={(e) => handleTypeChange(color, e.target.value || null)}
                      className="w-full p-2 border-2 border-gray-800 font-pixel text-[10px] bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      aria-label={`Select type for ${color} color`}
                    >
                      <option value="">Auto-generate</option>
                      {ALL_TYPES.map((type) => (
                        <option key={type} value={type}>
                          {capitalize(type)}
                        </option>
                      ))}
                    </select>
                    {colorTypes[color] && (
                      <div className="flex justify-center pt-1">
                        <TypeIcon type={colorTypes[color]!} size={24} />
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {colorsWithAssignments.length < ALL_COLORS.length && (
          <div className="mt-4 p-3 bg-gray-100 border-2 border-gray-800">
            <p className="font-pixel text-[8px] text-gray-900">
              {ALL_COLORS.length - colorsWithAssignments.length} color(s) will be auto-generated with random types
            </p>
          </div>
        )}

        {colorsWithAssignments.length === 0 && (
          <div className="mt-4 p-3 bg-gray-100 border-2 border-gray-800">
            <p className="font-pixel text-[8px] text-gray-900">
              No favorites selected. All colors will be auto-generated with random types.
            </p>
          </div>
        )}

        <div className="flex flex-col sm:flex-row justify-between gap-2 pt-4">
          <Button onClick={onBack} variant="secondary" size="lg" className="w-full sm:w-auto">
            Back
          </Button>
          <Button onClick={handleComplete} size="lg" className="w-full sm:w-auto">
            Generate Board
          </Button>
        </div>
      </div>
    </Card>
  )
}
