import { useBoardStore } from '@/store'
import { Spinner } from '@/components/ui'
import { COLOR_HEX, type BoardSpace, type PropertySpace } from '@/types/board'
import { getSpaceSprite } from './spaceSprites'
import type { Pokemon } from '@/types'

function calculateHalfCirclePositions(
  count: number,
  centerX: number,
  centerY: number,
  radius: number
): { x: number; y: number }[] {
  const positions: { x: number; y: number }[] = []
  if (count === 0) return positions

  // Half circle from left to right (180 degrees, rotated to top)
  const startAngle = Math.PI // Start from left
  const endAngle = 2*Math.PI // End at right

  const maxPerRing = 10
  const rings = Math.ceil(count / maxPerRing)
  let pokemonIndex = 0

  for (let ring = 0; ring < rings && pokemonIndex < count; ring++) {
    const ringRadius = radius * (0.5 + (ring * 0.5) / Math.max(rings - 1, 1))
    const pokemonInThisRing = Math.min(maxPerRing + ring * 2, count - pokemonIndex)

    for (let i = 0; i < pokemonInThisRing && pokemonIndex < count; i++) {
      const angle = startAngle + ((endAngle - startAngle) * i) / Math.max(pokemonInThisRing - 1, 1)
      positions.push({
        x: centerX + Math.cos(angle) * ringRadius,
        y: centerY + Math.sin(angle) * ringRadius,
      })
      pokemonIndex++
    }
  }

  return positions
}

function BoardCenter() {
  const { boardSpaces } = useBoardStore()

  const pokemon: Pokemon[] = boardSpaces
    .filter((space) => space.type === 'property' && space.pokemon)
    .map((space) => (space as { pokemon: Pokemon }).pokemon)

  const capitalize = (str: string) => str.charAt(0).toUpperCase() + str.slice(1)

  // Dimensions for the pokeball layout
  const centerSize = 630 // 9 cells × 70px
  const pokeballRadius = centerSize / 2 - 20
  const spriteSize = 36

  const positions = calculateHalfCirclePositions(
    pokemon.length,
    centerSize / 2,
    pokeballRadius * 0.8, // Position in top half
    pokeballRadius * 0.85
  )

  return (
    <div className="w-full h-full relative overflow-hidden">
      {/* Top half - Red (Pokemon collage) */}
      <div
        className="absolute inset-x-0 top-0 h-1/2"
        style={{
          background: 'linear-gradient(180deg, #DC2626 0%, #EF4444 100%)',
        }}
      >
        {/* Pokemon sprites */}
        {pokemon.map((poke, index) => {
          const pos = positions[index]
          if (!pos) return null

          return (
            <div
              key={poke.id}
              className="absolute flex flex-col items-center"
              style={{
                left: pos.x - spriteSize / 2,
                top: pos.y - spriteSize / 2,
                width: spriteSize,
              }}
            >
              <img
                src={poke.sprite}
                alt={poke.name}
                className="pixelated object-contain drop-shadow-md"
                style={{ width: spriteSize, height: spriteSize }}
                loading="lazy"
              />
              <span
                className="text-[6px] font-pixel text-white text-center truncate w-full bg-black/30 rounded px-0.5"
                style={{ maxWidth: spriteSize + 8 }}
              >
                {capitalize(poke.name)}
              </span>
            </div>
          )
        })}

        {/* Title in top section */}
        <div className="absolute bottom-2 left-0 right-0 text-center">
          <div className="text-[14px] font-pixel text-white font-bold drop-shadow-lg">MASTER LEAGUE</div>
        </div>
      </div>

      {/* Bottom half - White (Rules) */}
      <div
        className="absolute inset-x-0 bottom-0 h-1/2 flex flex-col items-center justify-center px-6"
        style={{
          background: 'linear-gradient(180deg, #F5F5F5 0%, #FFFFFF 100%)',
        }}
      >
        {/* Quick Rules */}
        <div className="text-center mt-4">
          <div className="text-[8px] font-pixel text-red-600 font-bold mb-2">QUICK RULES</div>
          <div className="space-y-0.5 text-[6px] font-pixel text-gray-800 leading-relaxed max-w-[450px]">
            <div><span className="font-bold">Setup:</span> Each player starts with ₽1500 on GO.</div>
            <div><span className="font-bold">Play:</span> Roll dice, move clockwise, follow space.</div>
            <div><span className="font-bold">Buy:</span> Land on unowned property? Buy it!</div>
            <div><span className="font-bold">Rent:</span> Others land on yours? Collect rent!</div>
            <div><span className="font-bold">Build:</span> Own all of a color to add Berries. <span className="font-bold">Upgrade:</span> 4 Berries = 1 Stone.</div>
            <div><span className="font-bold">Jail:</span> Pay ₽50 or roll doubles. <span className="font-bold">Gyms:</span> Rent = ₽25 × owned.</div>
            <div><span className="font-bold">Free Parking:</span> Collect all Grunt Ambush, Giovanni & card fees!</div>
            <div><span className="font-bold">Win:</span> Last player with money!</div>
          </div>
        </div>

        {/* Starting Money */}
        <div className="text-center mt-3">
          <div className="text-[7px] font-pixel text-gray-600">
            <span className="font-bold">START ₽1500:</span> 2×₽500 • 2×₽100 • 2×₽50 • 6×₽20 • 5×₽10 • 5×₽5 • 5×₽1
          </div>
        </div>
      </div>

      {/* Center band (black stripe) */}
      <div
        className="absolute left-0 right-0 h-6 bg-gray-900"
        style={{ top: 'calc(50% - 12px)' }}
      />

      {/* Center button */}
      <div
        className="absolute w-16 h-16 rounded-full bg-white border-8 border-gray-900 shadow-lg"
        style={{
          left: 'calc(50% - 32px)',
          top: 'calc(50% - 32px)',
        }}
      >
        <div className="w-full h-full rounded-full bg-gradient-to-br from-white to-gray-200 flex items-center justify-center">
          <div className="w-6 h-6 rounded-full bg-gray-300 border-2 border-gray-400" />
        </div>
      </div>
    </div>
  )
}

function PropertyCell({ space }: { space: PropertySpace }) {
  const pokemon = space.pokemon
  const capitalize = (str: string) => str.charAt(0).toUpperCase() + str.slice(1)

  return (
    <div className="flex flex-col h-full">
      <div
        className="h-4 w-full border-b border-gray-800"
        style={{ backgroundColor: COLOR_HEX[space.color] }}
      />
      <div className="flex-1 flex flex-col items-center justify-center p-1.5 bg-green-50 min-h-0">
        {pokemon ? (
          <>
            <img
              src={pokemon.sprite}
              alt={pokemon.name}
              className="w-10 h-10 pixelated object-contain mb-1"
              loading="lazy"
            />
            <span className="text-[7px] leading-tight text-gray-800 font-pixel text-center truncate w-full px-0.5">
              {capitalize(pokemon.name)}
            </span>
            <span className="text-[7px] text-gray-700 font-pixel font-bold mt-0.5">₽{space.price}</span>
          </>
        ) : (
          <span className="text-[8px] text-gray-400 font-pixel">Empty</span>
        )}
      </div>
    </div>
  )
}

function SpaceCell({ space, position }: { space: BoardSpace; position: number }) {
  const baseClass = "border-2 border-gray-800 bg-green-100 flex items-center justify-center h-full w-full"

  if (space.type === 'property') {
    return (
      <div className={`${baseClass} p-0`}>
        <PropertyCell space={space} />
      </div>
    )
  }

  if (space.type === 'go') {
    const sprite = getSpaceSprite('go')
    return (
      <div className={`${baseClass} bg-red-100 p-1 flex flex-col items-center justify-center`}>
        {sprite && (
          <img
            src={sprite}
            alt="GO"
            className="w-8 h-8 pixelated object-contain mb-1"
            loading="lazy"
          />
        )}
        <div className="text-center">
          <div className="text-[10px] font-pixel text-red-600 font-bold mb-0.5">GO</div>
          <div className="text-[7px] text-gray-700 font-pixel">Collect ₽200</div>
        </div>
      </div>
    )
  }

  if (space.type === 'jail') {
    const sprite = getSpaceSprite('jail')
    return (
      <div className={`${baseClass} bg-orange-100 p-1 flex flex-col items-center justify-center`}>
        {sprite && (
          <img
            src={sprite}
            alt="Team Rocket Hideout"
            className="w-8 h-8 pixelated object-contain mb-1"
            loading="lazy"
          />
        )}
        <div className="text-center">
          <div className="text-[8px] font-pixel text-orange-700 font-bold leading-tight">TEAM</div>
          <div className="text-[8px] font-pixel text-orange-700 font-bold leading-tight">ROCKET</div>
          <div className="text-[7px] text-gray-700 font-pixel mt-0.5">Hideout</div>
        </div>
      </div>
    )
  }

  if (space.type === 'free-parking') {
    const sprite = getSpaceSprite('free-parking')
    return (
      <div className={`${baseClass} bg-yellow-100 p-1 flex flex-col items-center justify-center`}>
        {sprite && (
          <img
            src={sprite}
            alt="Free Parking"
            className="w-8 h-8 pixelated object-contain mb-1"
            loading="lazy"
          />
        )}
        <div className="text-center">
          <div className="text-[8px] font-pixel text-yellow-700 font-bold leading-tight">FREE</div>
          <div className="text-[8px] font-pixel text-yellow-700 font-bold leading-tight">PARKING</div>
        </div>
      </div>
    )
  }

  if (space.type === 'go-to-jail') {
    const sprite = getSpaceSprite('go-to-jail')
    return (
      <div className={`${baseClass} bg-purple-100 p-1 flex flex-col items-center justify-center`}>
        {sprite && (
          <img
            src={sprite}
            alt="Go to Hideout"
            className="w-8 h-8 pixelated object-contain mb-1"
            loading="lazy"
          />
        )}
        <div className="text-center">
          <div className="text-[8px] font-pixel text-purple-700 font-bold leading-tight">GO TO</div>
          <div className="text-[8px] font-pixel text-purple-700 font-bold leading-tight">HIDEOUT</div>
        </div>
      </div>
    )
  }

  if (space.type === 'gym') {
    const sprite = getSpaceSprite('gym')
    return (
      <div className={`${baseClass} bg-gray-200 p-1 flex flex-col items-center justify-center`}>
        {sprite && (
          <img
            src={sprite}
            alt={space.name}
            className="w-8 h-8 pixelated object-contain mb-1"
            loading="lazy"
          />
        )}
        <div className="text-center">
          <div className="text-[8px] font-pixel text-gray-700 font-bold leading-tight">{space.name}</div>
          <div className="text-[7px] text-gray-700 font-pixel mt-0.5">₽{space.price}</div>
        </div>
      </div>
    )
  }

  if (space.type === 'item-bag') {
    const sprite = getSpaceSprite('item-bag')
    return (
      <div className={`${baseClass} bg-blue-100 p-1 flex flex-col items-center justify-center`}>
        {sprite && (
          <img
            src={sprite}
            alt="Item Bag"
            className="w-8 h-8 pixelated object-contain mb-1"
            loading="lazy"
          />
        )}
        <div className="text-center">
          <div className="text-[8px] font-pixel text-blue-700 font-bold leading-tight">ITEM</div>
          <div className="text-[8px] font-pixel text-blue-700 font-bold leading-tight">BAG</div>
        </div>
      </div>
    )
  }

  if (space.type === 'professor-oak') {
    const sprite = getSpaceSprite('professor-oak')
    return (
      <div className={`${baseClass} bg-green-200 p-1 flex flex-col items-center justify-center`}>
        {sprite && (
          <img
            src={sprite}
            alt="Professor Oak"
            className="w-8 h-8 pixelated object-contain mb-1"
            loading="lazy"
          />
        )}
        <div className="text-center">
          <div className="text-[8px] font-pixel text-green-700 font-bold leading-tight">PROF.</div>
          <div className="text-[8px] font-pixel text-green-700 font-bold leading-tight">OAK</div>
        </div>
      </div>
    )
  }

  if (space.type === 'grunt-ambush') {
    const sprite = getSpaceSprite('grunt-ambush')
    return (
      <div className={`${baseClass} bg-red-200 p-1 flex flex-col items-center justify-center`}>
        {sprite && (
          <img
            src={sprite}
            alt="Grunt Ambush"
            className="w-8 h-8 pixelated object-contain mb-1"
            loading="lazy"
          />
        )}
        <div className="text-center">
          <div className="text-[8px] font-pixel text-red-700 font-bold leading-tight">GRUNT</div>
          <div className="text-[8px] font-pixel text-red-700 font-bold leading-tight">AMBUSH</div>
          <div className="text-[7px] text-gray-700 font-pixel mt-0.5">Pay ₽{space.amount}</div>
        </div>
      </div>
    )
  }

  if (space.type === 'giovanni') {
    const sprite = getSpaceSprite('giovanni')
    return (
      <div className={`${baseClass} bg-purple-200 p-1 flex flex-col items-center justify-center`}>
        {sprite && (
          <img
            src={sprite}
            alt="Giovanni"
            className="w-8 h-8 pixelated object-contain mb-1"
            loading="lazy"
          />
        )}
        <div className="text-center">
          <div className="text-[8px] font-pixel text-purple-700 font-bold">GIOVANNI</div>
          <div className="text-[7px] text-gray-700 font-pixel mt-0.5">Pay ₽{space.amount}+</div>
        </div>
      </div>
    )
  }

  return <div className={baseClass}>?</div>
}

export function BoardPreview() {
  const { boardSpaces, isGenerating } = useBoardStore()

  if (isGenerating) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner size="lg" />
      </div>
    )
  }

  if (boardSpaces.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500 font-pixel text-xs">
        Loading board...
      </div>
    )
  }

  // Build the board grid
  // Monopoly board: 11x11 grid with properties around the edge
  const gridSize = 11
  const regularCellSize = 70 // Increased from 45px
  const cornerCellSize = 90 // Increased from 60px

  // Map positions to grid coordinates
  const getGridPosition = (index: number): { row: number; col: number } | null => {
    if (index < 10) {
      // Bottom row (right to left): indices 0-9 -> row 10, col 10-1
      return { row: 10, col: 10 - index }
    } else if (index < 20) {
      // Left column (bottom to top): indices 10-19 -> col 0, row 9-0
      return { row: 10 - (index - 10) - 1, col: 0 }
    } else if (index < 30) {
      // Top row (left to right): indices 20-29 -> row 0, col 1-10
      return { row: 0, col: index - 20 + 1 }
    } else if (index < 40) {
      // Right column (top to bottom): indices 30-39 -> col 10, row 1-9
      return { row: index - 30 + 1, col: 10 }
    }
    return null
  }

  // Create grid
  const grid: (BoardSpace | null)[][] = Array(gridSize)
    .fill(null)
    .map(() => Array(gridSize).fill(null))

  // Place spaces
  boardSpaces.forEach((space, index) => {
    const pos = getGridPosition(index)
    if (pos) {
      grid[pos.row][pos.col] = space
    }
  })

  // Create grid template with larger corners
  const createGridTemplate = (size: number, regular: number, corner: number) => {
    const templates: string[] = []
    for (let i = 0; i < size; i++) {
      if (i === 0 || i === size - 1) {
        templates.push(`${corner}px`)
      } else {
        templates.push(`${regular}px`)
      }
    }
    return templates.join(' ')
  }

  return (
    <div className="overflow-auto p-2 -m-2">
      <div
        className="inline-grid gap-0 border-4 border-gray-800 bg-green-200 shadow-lg"
        style={{
          gridTemplateColumns: createGridTemplate(gridSize, regularCellSize, cornerCellSize),
          gridTemplateRows: createGridTemplate(gridSize, regularCellSize, cornerCellSize),
        }}
      >
        {grid.map((row, rowIndex) =>
          row.map((space, colIndex) => {
            const isEdge =
              rowIndex === 0 ||
              rowIndex === 10 ||
              colIndex === 0 ||
              colIndex === 10

            if (!isEdge) {
              // Center area - render the BoardCenter component only once at position (1,1)
              // and have it span all 9x9 center cells
              if (rowIndex === 1 && colIndex === 1) {
                return (
                  <div
                    key={`${rowIndex}-${colIndex}`}
                    className="bg-green-200"
                    style={{
                      gridColumn: '2 / 11',
                      gridRow: '2 / 11',
                    }}
                  >
                    <BoardCenter />
                  </div>
                )
              }
              // Skip other center cells as they're covered by the spanning cell
              return null
            }

            if (space) {
              const index = boardSpaces.indexOf(space)
              return (
                <div
                  key={`${rowIndex}-${colIndex}`}
                  className="h-full w-full"
                >
                  <SpaceCell space={space} position={index} />
                </div>
              )
            }

            return (
              <div
                key={`${rowIndex}-${colIndex}`}
                className="bg-green-200"
              />
            )
          })
        )}
      </div>
    </div>
  )
}
