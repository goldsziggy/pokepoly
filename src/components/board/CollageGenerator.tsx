import { useBoardStore } from '@/store'
import { Spinner } from '@/components/ui'
import type { Pokemon } from '@/types'
import { useState } from 'react'

type LayoutMode = 'circle' | 'half-circle' | 'hero-group' | 'box-surround'

interface CollageProps {
  size?: number
  spriteSize?: number
  showOnBoard?: boolean
}

function calculateCirclePositions(
  count: number,
  centerX: number,
  centerY: number,
  radius: number,
  mode: 'circle' | 'half-circle'
): { x: number; y: number }[] {
  const positions: { x: number; y: number }[] = []

  if (count === 0) return positions

  const startAngle = mode === 'half-circle' ? -Math.PI / 2 : -Math.PI / 2
  const endAngle = mode === 'half-circle' ? Math.PI / 2 : (3 * Math.PI) / 2
  const angleRange = endAngle - startAngle

  const maxPerRing = mode === 'half-circle' ? 8 : 12
  const rings = Math.ceil(count / maxPerRing)

  let pokemonIndex = 0

  for (let ring = 0; ring < rings && pokemonIndex < count; ring++) {
    const ringRadius = radius * (0.4 + (ring * 0.6) / Math.max(rings - 1, 1))
    const pokemonInThisRing = Math.min(
      maxPerRing + ring * 2,
      count - pokemonIndex
    )

    for (let i = 0; i < pokemonInThisRing && pokemonIndex < count; i++) {
      const angle = startAngle + (angleRange * i) / Math.max(pokemonInThisRing - 1, 1)
      positions.push({
        x: centerX + Math.cos(angle) * ringRadius,
        y: centerY + Math.sin(angle) * ringRadius,
      })
      pokemonIndex++
    }
  }

  return positions
}

function calculateHeroGroupPositions(
  count: number,
  containerWidth: number,
  containerHeight: number,
  spriteSize: number
): { x: number; y: number; scale: number }[] {
  const positions: { x: number; y: number; scale: number }[] = []

  if (count === 0) return positions

  // Arrange like a group photo - rows with back row elevated
  // Back row: larger sprites, fewer Pokemon
  // Front row(s): smaller sprites, more Pokemon

  const rows = count <= 6 ? 1 : count <= 14 ? 2 : count <= 22 ? 3 : 4
  const pokemonPerRow: number[] = []

  let remaining = count
  for (let r = 0; r < rows; r++) {
    const isBackRow = r === 0
    const rowCapacity = isBackRow ? Math.ceil(count / rows) - 1 : Math.ceil(count / rows) + 1
    pokemonPerRow.push(Math.min(rowCapacity, remaining))
    remaining -= pokemonPerRow[r]
  }

  // Redistribute any remaining
  while (remaining > 0) {
    for (let r = rows - 1; r >= 0 && remaining > 0; r--) {
      pokemonPerRow[r]++
      remaining--
    }
  }

  const rowHeight = containerHeight / (rows + 1)
  let pokemonIndex = 0

  for (let r = 0; r < rows; r++) {
    const inRow = pokemonPerRow[r]
    const isBackRow = r === 0
    const scale = isBackRow ? 1.3 : 1 - r * 0.1
    const y = rowHeight * (r + 0.8)
    const rowWidth = containerWidth * 0.85
    const spacing = rowWidth / (inRow + 1)
    const startX = (containerWidth - rowWidth) / 2 + spacing

    for (let i = 0; i < inRow && pokemonIndex < count; i++) {
      positions.push({
        x: startX + i * spacing,
        y,
        scale,
      })
      pokemonIndex++
    }
  }

  return positions
}

function calculateBoxSurroundPositions(
  count: number,
  centerX: number,
  centerY: number,
  width: number,
  height: number,
  spriteSize: number
): { x: number; y: number }[] {
  const positions: { x: number; y: number }[] = []

  if (count === 0) return positions

  // Distribute Pokemon around a rectangle
  const margin = spriteSize / 2 + 10
  const boxWidth = width - margin * 2
  const boxHeight = height - margin * 2

  const perimeter = 2 * (boxWidth + boxHeight)
  const spacing = perimeter / count

  let distance = 0

  for (let i = 0; i < count; i++) {
    let x: number, y: number

    if (distance < boxWidth) {
      // Top edge
      x = margin + distance
      y = margin
    } else if (distance < boxWidth + boxHeight) {
      // Right edge
      x = margin + boxWidth
      y = margin + (distance - boxWidth)
    } else if (distance < 2 * boxWidth + boxHeight) {
      // Bottom edge
      x = margin + boxWidth - (distance - boxWidth - boxHeight)
      y = margin + boxHeight
    } else {
      // Left edge
      x = margin
      y = margin + boxHeight - (distance - 2 * boxWidth - boxHeight)
    }

    positions.push({ x, y })
    distance += spacing
  }

  return positions
}

const LAYOUT_OPTIONS: { value: LayoutMode; label: string }[] = [
  { value: 'half-circle', label: 'Half Circle' },
  { value: 'circle', label: 'Full Circle' },
  { value: 'hero-group', label: 'Hero Group' },
  { value: 'box-surround', label: 'Box Surround' },
]

export function CollageGenerator({ size = 500, spriteSize = 48, showOnBoard = false }: CollageProps) {
  const { boardSpaces, isGenerating } = useBoardStore()
  const [layoutMode, setLayoutMode] = useState<LayoutMode>('half-circle')
  const [overlayOnBoard, setOverlayOnBoard] = useState(showOnBoard)

  if (isGenerating) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner size="lg" />
      </div>
    )
  }

  const pokemon: Pokemon[] = boardSpaces
    .filter((space) => space.type === 'property' && space.pokemon)
    .map((space) => (space as { pokemon: Pokemon }).pokemon)

  if (pokemon.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500 font-pixel text-xs">
        No Pokemon on board yet...
      </div>
    )
  }

  const centerX = size / 2
  const centerY = size / 2
  const radius = (size / 2) - spriteSize - 10

  const capitalize = (str: string) => str.charAt(0).toUpperCase() + str.slice(1)

  // Calculate positions based on layout mode
  let positions: { x: number; y: number; scale?: number }[] = []

  if (layoutMode === 'circle' || layoutMode === 'half-circle') {
    positions = calculateCirclePositions(pokemon.length, centerX, centerY, radius, layoutMode)
  } else if (layoutMode === 'hero-group') {
    positions = calculateHeroGroupPositions(pokemon.length, size, size, spriteSize)
  } else if (layoutMode === 'box-surround') {
    positions = calculateBoxSurroundPositions(pokemon.length, centerX, centerY, size, size, spriteSize)
  }

  const collageContent = (
    <>
      {/* Center decoration */}
      {!overlayOnBoard && (
        <div
          className="absolute flex flex-col items-center justify-center"
          style={{
            left: centerX - 50,
            top: centerY - 30,
            width: 100,
            height: 60,
          }}
        >
          <div className="text-lg font-pixel text-green-800 font-bold">MASTER</div>
          <div className="text-lg font-pixel text-green-800 font-bold">LEAGUE</div>
        </div>
      )}

      {/* Pokemon sprites */}
      {pokemon.map((poke, index) => {
        const pos = positions[index]
        if (!pos) return null

        const scale = (pos as { scale?: number }).scale || 1
        const actualSize = spriteSize * scale

        return (
          <div
            key={poke.id}
            className="absolute flex flex-col items-center transition-all duration-300 hover:scale-110 hover:z-10"
            style={{
              left: pos.x - actualSize / 2,
              top: pos.y - actualSize / 2,
              width: actualSize,
            }}
          >
            <img
              src={poke.sprite}
              alt={poke.name}
              className="pixelated object-contain drop-shadow-md"
              style={{ width: actualSize, height: actualSize }}
              loading="lazy"
            />
            <span
              className="text-[8px] font-pixel text-gray-800 text-center truncate w-full bg-white/70 rounded px-0.5 mt-0.5"
              style={{ maxWidth: actualSize + 10 }}
            >
              {capitalize(poke.name)}
            </span>
          </div>
        )
      })}
    </>
  )

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Layout controls */}
      <div className="flex flex-wrap gap-2 items-center justify-center">
        {LAYOUT_OPTIONS.map((option) => (
          <button
            key={option.value}
            onClick={() => setLayoutMode(option.value)}
            className={`px-3 py-1 text-xs font-pixel rounded border-2 transition-colors ${
              layoutMode === option.value
                ? 'bg-green-600 text-white border-green-700'
                : 'bg-white text-gray-700 border-gray-300 hover:border-green-500'
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>

      {/* Overlay toggle */}
      <label className="flex items-center gap-2 text-xs font-pixel text-gray-600 cursor-pointer">
        <input
          type="checkbox"
          checked={overlayOnBoard}
          onChange={(e) => setOverlayOnBoard(e.target.checked)}
          className="w-4 h-4 accent-green-600"
        />
        Show on game board
      </label>

      {/* Collage container */}
      {overlayOnBoard ? (
        <CollageOnBoard
          pokemon={pokemon}
          positions={positions}
          spriteSize={spriteSize}
          layoutMode={layoutMode}
        />
      ) : (
        <div
          className="relative bg-gradient-to-br from-green-100 to-green-200 rounded-lg border-4 border-green-800 shadow-xl"
          style={{ width: size, height: size }}
        >
          {collageContent}
        </div>
      )}

      {/* Pokemon count */}
      <div className="text-xs font-pixel text-gray-600">
        {pokemon.length} Pokemon in collage
      </div>
    </div>
  )
}

// Component to render collage overlaid on the game board
function CollageOnBoard({
  pokemon,
  positions,
  spriteSize,
  layoutMode,
}: {
  pokemon: Pokemon[]
  positions: { x: number; y: number; scale?: number }[]
  spriteSize: number
  layoutMode: LayoutMode
}) {
  const capitalize = (str: string) => str.charAt(0).toUpperCase() + str.slice(1)

  // Board dimensions matching BoardPreview
  const regularCellSize = 70
  const cornerCellSize = 90
  const boardSize = cornerCellSize * 2 + regularCellSize * 9 // 810px

  // Recalculate positions for the board center area
  const centerAreaSize = regularCellSize * 9 // 630px - the inner board area
  const offset = cornerCellSize // 90px offset from edge

  const centerX = centerAreaSize / 2
  const centerY = centerAreaSize / 2
  const radius = (centerAreaSize / 2) - spriteSize - 20

  let boardPositions: { x: number; y: number; scale?: number }[] = []

  if (layoutMode === 'circle' || layoutMode === 'half-circle') {
    boardPositions = calculateCirclePositions(pokemon.length, centerX, centerY, radius, layoutMode)
  } else if (layoutMode === 'hero-group') {
    boardPositions = calculateHeroGroupPositions(pokemon.length, centerAreaSize, centerAreaSize, spriteSize)
  } else if (layoutMode === 'box-surround') {
    boardPositions = calculateBoxSurroundPositions(pokemon.length, centerX, centerY, centerAreaSize, centerAreaSize, spriteSize)
  }

  return (
    <div className="overflow-auto">
      <div
        className="relative border-4 border-gray-800 bg-green-200 shadow-lg"
        style={{ width: boardSize, height: boardSize }}
      >
        {/* Board edge placeholder */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            borderWidth: cornerCellSize,
            borderStyle: 'solid',
            borderColor: 'rgba(34, 197, 94, 0.3)',
          }}
        />

        {/* Center collage area */}
        <div
          className="absolute bg-green-200"
          style={{
            left: offset,
            top: offset,
            width: centerAreaSize,
            height: centerAreaSize,
          }}
        >
          {/* Center title */}
          <div
            className="absolute flex flex-col items-center justify-center"
            style={{
              left: centerX - 60,
              top: centerY - 40,
              width: 120,
              height: 80,
            }}
          >
            <div className="text-2xl font-pixel text-green-800 font-bold opacity-30">MASTER</div>
            <div className="text-2xl font-pixel text-green-800 font-bold opacity-30">LEAGUE</div>
          </div>

          {/* Pokemon sprites */}
          {pokemon.map((poke, index) => {
            const pos = boardPositions[index]
            if (!pos) return null

            const scale = (pos as { scale?: number }).scale || 1
            const actualSize = spriteSize * scale

            return (
              <div
                key={poke.id}
                className="absolute flex flex-col items-center transition-all duration-300 hover:scale-110 hover:z-10"
                style={{
                  left: pos.x - actualSize / 2,
                  top: pos.y - actualSize / 2,
                  width: actualSize,
                }}
              >
                <img
                  src={poke.sprite}
                  alt={poke.name}
                  className="pixelated object-contain drop-shadow-lg"
                  style={{ width: actualSize, height: actualSize }}
                  loading="lazy"
                />
                <span
                  className="text-[8px] font-pixel text-gray-800 text-center truncate w-full bg-white/80 rounded px-0.5 mt-0.5 shadow-sm"
                  style={{ maxWidth: actualSize + 10 }}
                >
                  {capitalize(poke.name)}
                </span>
              </div>
            )
          })}
        </div>

        {/* Board edge indicator text */}
        <div className="absolute top-2 left-1/2 -translate-x-1/2 text-[10px] font-pixel text-green-700 opacity-50">
          Board Edge
        </div>
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 text-[10px] font-pixel text-green-700 opacity-50">
          Board Edge
        </div>
        <div className="absolute left-2 top-1/2 -translate-y-1/2 -rotate-90 text-[10px] font-pixel text-green-700 opacity-50">
          Board Edge
        </div>
        <div className="absolute right-2 top-1/2 -translate-y-1/2 rotate-90 text-[10px] font-pixel text-green-700 opacity-50">
          Board Edge
        </div>
      </div>
    </div>
  )
}
