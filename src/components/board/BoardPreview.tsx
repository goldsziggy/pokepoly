import { useBoardStore } from '@/store'
import { Spinner, PokeCoin } from '@/components/ui'
import { COLOR_HEX, type BoardSpace, type PropertySpace } from '@/types/board'
import { getSpaceSprite, getGymImage } from './spaceSprites'
import { getPrimaryType } from '@/lib/typeIcons'
import { TypeIcon } from '@/types/TypeIcon'
import type { Pokemon } from '@/types'

function calculateHalfCirclePositions(
  count: number,
  centerX: number,
  centerY: number,
  radius: number
): { x: number; y: number }[] {
  const positions: { x: number; y: number }[] = []
  if (count === 0) return positions

  const startAngle = Math.PI
  const endAngle = 2 * Math.PI
  const maxPerRing = 10
  const rings = Math.ceil(count / maxPerRing)
  let pokemonIndex = 0

  for (let ring = 0; ring < rings && pokemonIndex < count; ring++) {
    const ringRadius = radius * (0.35 + (ring * 0.65) / Math.max(rings - 1, 1))
    const pokemonInThisRing = Math.min(maxPerRing + ring * 2, count - pokemonIndex)

    for (let i = 0; i < pokemonInThisRing && pokemonIndex < count; i++) {
      const angle = startAngle + ((endAngle - startAngle) * i) / Math.max(pokemonInThisRing - 1, 1)
      positions.push({
        x: centerX + Math.cos(angle) * ringRadius,
        y: centerY + Math.sin(angle) * ringRadius * 0.65,
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

  const centerSize = 630
  const pokeballRadius = centerSize / 2 - 20
  const spriteSize = 50

  const positions = calculateHalfCirclePositions(
    pokemon.length,
    centerSize / 2,
    pokeballRadius * 0.55,
    pokeballRadius * 0.85
  )

  return (
    <div className="w-full h-full relative overflow-hidden">
      {/* Top half - Red */}
      <div className="absolute inset-x-0 top-0 h-1/2 bg-red-600">
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
                className="text-[6px] font-pixel text-white text-center truncate w-full bg-black/50 rounded px-0.5"
                style={{ maxWidth: spriteSize + 10 }}
              >
                {capitalize(poke.name)}
              </span>
            </div>
          )
        })}

        {/* Title */}
        <div className="absolute bottom-3 left-0 right-0 text-center">
          <div className="text-[16px] font-pixel text-white font-bold drop-shadow-lg">POKE-POLY</div>
        </div>
      </div>

      {/* Bottom half - White */}
      <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gray-100 flex flex-col items-center justify-center px-8">
        <div className="flex items-center justify-center gap-4 w-full max-w-[600px] mx-auto">
          {/* Left card outline */}
          <div className="flex-shrink-0 w-24 h-14 border-2 border-dashed border-gray-400 rounded flex items-center justify-center">
            <span className="text-[8px] font-pixel text-gray-500 text-center">Card<br/>Place</span>
          </div>
          
          {/* Center rules text */}
          <div className="text-center flex-1">
            <div className="text-[14px] font-pixel text-red-600 font-bold mb-3">QUICK RULES</div>
            <div className="space-y-1 text-[10px] font-pixel text-gray-800 leading-relaxed">
              <div><span className="font-bold">Setup:</span> Each player starts with <span className="inline-flex items-center gap-0.5"><PokeCoin size={8} />1500</span> on GO. <span className="font-bold">Play:</span> Roll dice, move clockwise.</div>
              <div><span className="font-bold">Buy:</span> Land on unowned property? Buy it! <span className="font-bold">Rent:</span> Others land on yours? Collect!</div>
              <div><span className="font-bold">Build:</span> Own all of a color → add Gym Badges. 4 Gym Badges = 1 League Badge.</div>
              <div><span className="font-bold">Jail:</span> Pay <span className="inline-flex items-center gap-0.5"><PokeCoin size={8} />50</span> or roll doubles. <span className="font-bold">Gyms:</span> Rent = <span className="inline-flex items-center gap-0.5"><PokeCoin size={8} />25</span> × gyms owned. <span className="font-bold">Utilities:</span> Rent = 4× dice roll (or 10× if both utilities owned).</div>
              <div><span className="font-bold">Free Parking:</span> Collect Grunt Ambush, Giovanni & card fees!</div>
              <div><span className="font-bold">Win:</span> Last player with money! <span className="font-bold">Start:</span> 2×<span className="inline-flex items-center gap-0.5"><PokeCoin size={8} />500</span> • 2×<span className="inline-flex items-center gap-0.5"><PokeCoin size={8} />100</span> • 2×<span className="inline-flex items-center gap-0.5"><PokeCoin size={8} />50</span> • 6×<span className="inline-flex items-center gap-0.5"><PokeCoin size={8} />20</span> • 5×<span className="inline-flex items-center gap-0.5"><PokeCoin size={8} />10</span> • 5×<span className="inline-flex items-center gap-0.5"><PokeCoin size={8} />5</span> • 5×<span className="inline-flex items-center gap-0.5"><PokeCoin size={8} />1</span></div>
            </div>
          </div>
          
          {/* Right card outline */}
          <div className="flex-shrink-0 w-24 h-14 border-2 border-dashed border-gray-400 rounded flex items-center justify-center">
            <span className="text-[8px] font-pixel text-gray-500 text-center">Card<br/>Place</span>
          </div>
        </div>
      </div>

      {/* Center band */}
      <div className="absolute left-0 right-0 h-7 bg-gray-900" style={{ top: 'calc(50% - 14px)' }} />

      {/* Center button */}
      <div
        className="absolute w-16 h-16 rounded-full bg-white border-[6px] border-gray-900 shadow-lg"
        style={{ left: 'calc(50% - 32px)', top: 'calc(50% - 32px)' }}
      >
        <div className="w-full h-full rounded-full bg-white flex items-center justify-center">
          <div className="w-6 h-6 rounded-full bg-gray-300" />
        </div>
      </div>
    </div>
  )
}

function PropertyCell({ space }: { space: PropertySpace }) {
  const pokemon = space.pokemon
  const capitalize = (str: string) => str.charAt(0).toUpperCase() + str.slice(1)
  const primaryType = pokemon ? getPrimaryType(pokemon.types) : null

  return (
    <div className="flex flex-col h-full bg-white">
      <div
        className="h-5 w-full border-b-2 border-gray-800 relative flex items-center justify-center"
        style={{ backgroundColor: COLOR_HEX[space.color] }}
      >
        {primaryType && (
          <TypeIcon type={primaryType} size={14} className="drop-shadow-[0_1px_1px_rgba(0,0,0,0.8)]" />
        )}
      </div>
      <div className="flex-1 flex flex-col items-center justify-center p-1 min-h-0">
        {pokemon ? (
          <>
            <img
              src={pokemon.sprite}
              alt={pokemon.name}
              className="w-16 h-16 pixelated object-contain"
              loading="lazy"
            />
            <span className="text-[7px] leading-tight text-gray-800 font-pixel font-bold text-center truncate w-full">
              {capitalize(pokemon.name)}
            </span>
            <span className="text-[7px] text-gray-700 font-pixel inline-flex items-center gap-0.5">
              <PokeCoin size={8} />
              {space.price}
            </span>
          </>
        ) : (
          <span className="text-[8px] text-gray-400 font-pixel">Empty</span>
        )}
      </div>
    </div>
  )
}

function SpaceCell({ space }: { space: BoardSpace }) {
  const baseClass = "border-2 border-gray-800 flex items-center justify-center h-full w-full"

  if (space.type === 'property') {
    return (
      <div className={`${baseClass} p-0 bg-white`}>
        <PropertyCell space={space} />
      </div>
    )
  }

  if (space.type === 'go') {
    const sprite = getSpaceSprite('go')
    return (
      <div className={`${baseClass} bg-red-100 flex-col p-1 relative`}>
        {sprite && (
          <img
            src={sprite}
            alt="GO"
            className="absolute inset-0 w-full h-full pixelated object-cover"
            loading="lazy"
          />
        )}
        <div className="absolute bottom-0 left-0 right-0 bg-black/70 px-1 py-0.5 z-10">
          <div className="text-[10px] font-pixel text-white font-bold text-center">GO</div>
          <div className="text-[7px] text-white font-pixel text-center inline-flex items-center justify-center gap-0.5 w-full">
            Collect <PokeCoin size={8} />200
          </div>
        </div>
      </div>
    )
  }

  if (space.type === 'jail') {
    const sprite = getSpaceSprite('jail')
    return (
      <div className={`${baseClass} bg-orange-100 flex-col p-1 relative`}>
        {/* Outer square - "Just Visiting" text at top-left (outer corner) */}
        <div className="absolute top-1 left-1 bg-black/70 px-1 py-0.5 z-20">
          <div className="text-[7px] text-white font-pixel text-center">Just Visiting</div>
        </div>
        
        {/* Inner square border - aligned to bottom-right (inner corner toward center) */}
        <div className="absolute bottom-2 right-2 w-1/2 h-1/2 border-2 border-gray-800 pointer-events-none z-10" />
        
        {/* Inner square content - image and "Team Rocket Hideout" */}
        <div className="absolute bottom-2 right-2 w-1/2 h-1/2 overflow-hidden z-10">
        {sprite && (
          <img
            src={sprite}
            alt="Team Rocket Hideout"
              className="w-full h-full pixelated object-cover"
            loading="lazy"
          />
        )}
          <div className="absolute bottom-0 left-0 right-0 bg-black/70 px-1 py-0.5">
            <div className="text-[6px] font-pixel text-white font-bold leading-tight text-center">TEAM ROCKET</div>
            <div className="text-[5px] text-white font-pixel text-center">HIDEOUT</div>
          </div>
        </div>
      </div>
    )
  }

  if (space.type === 'free-parking') {
    const sprite = getSpaceSprite('free-parking')
    return (
      <div className={`${baseClass} bg-yellow-100 flex-col p-1 relative`}>
        {sprite && (
          <img
            src={sprite}
            alt="Free Parking"
            className="absolute inset-0 w-full h-full pixelated object-cover"
            loading="lazy"
          />
        )}
        <div className="absolute bottom-0 left-0 right-0 bg-black/70 px-1 py-0.5 z-10">
          <div className="text-[8px] font-pixel text-white font-bold leading-tight text-center">FREE PARKING</div>
        </div>
      </div>
    )
  }

  if (space.type === 'go-to-jail') {
    const sprite = getSpaceSprite('go-to-jail')
    return (
      <div className={`${baseClass} bg-purple-100 flex-col p-1 relative`}>
        {sprite && (
          <img
            src={sprite}
            alt="Go to Hideout"
            className="absolute inset-0 w-full h-full pixelated object-cover"
            loading="lazy"
          />
        )}
        <div className="absolute bottom-0 left-0 right-0 bg-black/70 px-1 py-0.5 z-10">
          <div className="text-[8px] font-pixel text-white font-bold leading-tight text-center">GO TO HIDEOUT</div>
        </div>
      </div>
    )
  }

  if (space.type === 'gym') {
    const sprite = getGymImage(space.name)
    return (
      <div className={`${baseClass} bg-gray-200 flex-col p-1 relative`}>
        {sprite && (
          <img
            src={sprite}
            alt={space.name}
            className="absolute inset-0 w-full h-full pixelated object-cover"
            loading="lazy"
          />
        )}
        <div className="absolute bottom-0 left-0 right-0 bg-black/70 px-1 py-0.5 z-10">
          <div className="text-[8px] font-pixel text-white font-bold text-center leading-tight">{space.name}</div>
          <div className="text-[7px] font-pixel text-white font-bold text-center inline-flex items-center justify-center gap-0.5 w-full">
            <PokeCoin size={8} />
            {space.price}
          </div>
        </div>
      </div>
    )
  }

  if (space.type === 'item-bag') {
    const sprite = getSpaceSprite('item-bag')
    return (
      <div className={`${baseClass} bg-blue-100 flex-col p-1 relative`}>
        {sprite && (
          <img
            src={sprite}
            alt="Item Bag"
            className="absolute inset-0 w-full h-full pixelated object-cover"
            loading="lazy"
          />
        )}
        <div className="absolute bottom-0 left-0 right-0 bg-black/70 px-1 py-0.5 z-10">
          <div className="text-[8px] font-pixel text-white font-bold leading-tight text-center">ITEM BAG</div>
        </div>
      </div>
    )
  }

  if (space.type === 'professor-oak') {
    const sprite = getSpaceSprite('professor-oak')
    return (
      <div className={`${baseClass} bg-green-200 flex-col p-1 relative`}>
        {sprite && (
          <img
            src={sprite}
            alt="Professor Oak"
            className="absolute inset-0 w-full h-full pixelated object-cover"
            loading="lazy"
          />
        )}
        <div className="absolute bottom-0 left-0 right-0 bg-black/70 px-1 py-0.5 z-10">
          <div className="text-[8px] font-pixel text-white font-bold leading-tight text-center">PROF. OAK</div>
        </div>
      </div>
    )
  }

  if (space.type === 'grunt-ambush') {
    const sprite = getSpaceSprite('grunt-ambush')
    return (
      <div className={`${baseClass} bg-red-200 flex-col p-1 relative`}>
        {sprite && (
          <img
            src={sprite}
            alt="Grunt Ambush"
            className="absolute inset-0 w-full h-full pixelated object-cover"
            loading="lazy"
          />
        )}
        <div className="absolute bottom-0 left-0 right-0 bg-black/70 px-1 py-0.5 z-10">
          <div className="text-[8px] font-pixel text-white font-bold text-center">GRUNT AMBUSH</div>
          <div className="text-[7px] text-white font-pixel font-bold text-center inline-flex items-center justify-center gap-0.5 w-full">
            Pay <PokeCoin size={8} />
            {space.amount}
          </div>
        </div>
      </div>
    )
  }

  if (space.type === 'giovanni') {
    const sprite = getSpaceSprite('giovanni')
    return (
      <div className={`${baseClass} bg-purple-200 flex-col p-1 relative`}>
        {sprite && (
          <img
            src={sprite}
            alt="Giovanni"
            className="absolute inset-0 w-full h-full pixelated object-cover"
            loading="lazy"
          />
        )}
        <div className="absolute bottom-0 left-0 right-0 bg-black/70 px-1 py-0.5 z-10">
          <div className="text-[8px] font-pixel text-white font-bold text-center">GIOVANNI</div>
          <div className="text-[7px] text-white font-pixel font-bold text-center inline-flex items-center justify-center gap-0.5 w-full">
            Pay <PokeCoin size={8} />
            {space.amount}+
          </div>
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

  const gridSize = 11
  const regularCellSize = 70
  const cornerToSideRatio = 2.5 / 1.5
  const cornerCellSize = Math.round(regularCellSize * cornerToSideRatio)

  const getGridPosition = (index: number): { row: number; col: number } | null => {
    // Handle corners first
    if (index === 0) return { row: 10, col: 10 }  // GO - bottom-right
    if (index === 10) return { row: 0, col: 0 }   // Jail - top-left
    if (index === 20) return { row: 0, col: 10 }  // Free Parking - top-right
    if (index === 30) return { row: 10, col: 0 }  // Go To Jail - bottom-left

    // Handle regular spaces
    if (index < 10) {
      // Bottom row (right to left): indices 1-9 -> row 10, col 9-1
      return { row: 10, col: 10 - index }
    } else if (index < 20) {
      // Left column (bottom to top): indices 11-19 -> col 0, row 8-1
      return { row: 10 - (index - 10), col: 0 }
    } else if (index < 30) {
      // Top row (left to right): indices 21-29 -> row 0, col 1-9
      return { row: 0, col: index - 20 }
    } else if (index < 40) {
      // Right column (top to bottom): indices 31-39 -> col 10, row 1-9
      return { row: index - 30, col: 10 }
    }
    return null
  }

  const grid: (BoardSpace | null)[][] = Array(gridSize)
    .fill(null)
    .map(() => Array(gridSize).fill(null))

  boardSpaces.forEach((space, index) => {
    const pos = getGridPosition(index)
    if (pos) {
      grid[pos.row][pos.col] = space
    }
  })

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
    <div className="p-2 -m-2">
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
              return null
            }

            if (space) {
              return (
                <div key={`${rowIndex}-${colIndex}`} className="h-full w-full">
                  <SpaceCell space={space} />
                </div>
              )
            }

            return (
              <div key={`${rowIndex}-${colIndex}`} className="bg-green-200" />
            )
          })
        )}
      </div>
    </div>
  )
}
