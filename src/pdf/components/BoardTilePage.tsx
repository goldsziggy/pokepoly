import { Page, View, Text, StyleSheet, Image as PDFImage } from '@react-pdf/renderer'
import type { PaperSize, BoardSpace, Pokemon } from '@/types'
import { colors } from './styles'

// 20" x 20" board at 72 DPI = 1440 x 1440 points
const BOARD_SIZE = 1440
// Landscape layout: 2 columns x 3 rows = 6 pages
const TILE_COLS = 2
const TILE_ROWS = 3
const TILE_WIDTH = BOARD_SIZE / TILE_COLS  // 720 points = 10"
const TILE_HEIGHT = BOARD_SIZE / TILE_ROWS // 480 points = 6.67"

// Space dimensions scaled for 20" board
const CORNER_SIZE = 140 // ~1.94" for corner spaces
const SIDE_SIZE = (BOARD_SIZE - 2 * CORNER_SIZE) / 9 // ~1.29" for each of 9 spaces per side

// Sprite sizes
const PROPERTY_SPRITE_SIZE = 38
const COLLAGE_SPRITE_SIZE = 44

const styles = StyleSheet.create({
  page: {
    padding: 12,
    backgroundColor: '#fff',
  },
  tileContainer: {
    width: TILE_WIDTH,
    height: TILE_HEIGHT,
    position: 'relative',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#ccc',
  },
  tileLabel: {
    position: 'absolute',
    bottom: 3,
    right: 5,
    fontSize: 6,
    color: '#666',
  },
  cutLine: {
    position: 'absolute',
    borderStyle: 'dashed',
    borderColor: '#999',
  },
  space: {
    position: 'absolute',
    borderWidth: 2,
    borderColor: colors.black,
    backgroundColor: colors.white,
    overflow: 'hidden',
  },
  propertyHeader: {
    height: 22,
  },
  propertyBody: {
    flex: 1,
    padding: 3,
    alignItems: 'center',
    justifyContent: 'center',
  },
  propertyName: {
    fontSize: 8,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  propertyPrice: {
    fontSize: 7,
    textAlign: 'center',
    marginTop: 2,
  },
  pokemonSprite: {
    width: PROPERTY_SPRITE_SIZE,
    height: PROPERTY_SPRITE_SIZE,
    objectFit: 'contain',
  },
  cornerCell: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 6,
  },
  cornerTitle: {
    fontSize: 10,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  cornerLabel: {
    fontSize: 8,
    textAlign: 'center',
    marginTop: 3,
  },
  // Pokeball center styles
  pokeballTop: {
    position: 'absolute',
    backgroundColor: '#DC2626',
  },
  pokeballBottom: {
    position: 'absolute',
    backgroundColor: '#F5F5F5',
  },
  pokeballBand: {
    position: 'absolute',
    backgroundColor: '#1F2937',
    height: 28,
  },
  pokeballButton: {
    position: 'absolute',
    backgroundColor: '#FFFFFF',
    borderWidth: 6,
    borderColor: '#1F2937',
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Pokemon collage
  collageSprite: {
    width: COLLAGE_SPRITE_SIZE,
    height: COLLAGE_SPRITE_SIZE,
    objectFit: 'contain',
  },
  collageLabel: {
    fontSize: 6,
    color: '#FFFFFF',
    backgroundColor: 'rgba(0,0,0,0.5)',
    textAlign: 'center',
    paddingHorizontal: 3,
    paddingVertical: 1,
    borderRadius: 2,
  },
  // Rules
  rulesContainer: {
    position: 'absolute',
    alignItems: 'center',
  },
  rulesTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#DC2626',
    textAlign: 'center',
    marginBottom: 8,
  },
  rulesText: {
    fontSize: 8,
    color: '#374151',
    textAlign: 'center',
    marginBottom: 4,
  },
  rulesBold: {
    fontWeight: 'bold',
  },
  centerTitle: {
    position: 'absolute',
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
  },
})

const colorMap: Record<string, string> = {
  brown: colors.brown,
  lightblue: colors.lightblue,
  pink: colors.pink,
  orange: colors.orange,
  red: colors.red,
  yellow: colors.yellow,
  green: colors.green,
  darkblue: colors.darkblue,
}

interface BoardTilePageProps {
  spaces: BoardSpace[]
  paperSize: PaperSize
  tileRow: number // 0-2
  tileCol: number // 0-1
}

function getSpacePosition(index: number): { x: number; y: number; width: number; height: number } {
  const boardRight = BOARD_SIZE - CORNER_SIZE
  const boardBottom = BOARD_SIZE - CORNER_SIZE

  if (index === 0) {
    return { x: boardRight, y: boardBottom, width: CORNER_SIZE, height: CORNER_SIZE }
  } else if (index >= 1 && index <= 9) {
    const pos = 9 - index
    return { x: CORNER_SIZE + pos * SIDE_SIZE, y: boardBottom, width: SIDE_SIZE, height: CORNER_SIZE }
  } else if (index === 10) {
    return { x: 0, y: boardBottom, width: CORNER_SIZE, height: CORNER_SIZE }
  } else if (index >= 11 && index <= 19) {
    const pos = 19 - index
    return { x: 0, y: CORNER_SIZE + pos * SIDE_SIZE, width: CORNER_SIZE, height: SIDE_SIZE }
  } else if (index === 20) {
    return { x: 0, y: 0, width: CORNER_SIZE, height: CORNER_SIZE }
  } else if (index >= 21 && index <= 29) {
    const pos = index - 21
    return { x: CORNER_SIZE + pos * SIDE_SIZE, y: 0, width: SIDE_SIZE, height: CORNER_SIZE }
  } else if (index === 30) {
    return { x: boardRight, y: 0, width: CORNER_SIZE, height: CORNER_SIZE }
  } else if (index >= 31 && index <= 39) {
    const pos = index - 31
    return { x: boardRight, y: CORNER_SIZE + pos * SIDE_SIZE, width: CORNER_SIZE, height: SIDE_SIZE }
  }
  return { x: 0, y: 0, width: 0, height: 0 }
}

// Calculate half-circle positions for Pokemon collage
function getCollagePositions(count: number, centerX: number, centerY: number, radius: number): { x: number; y: number }[] {
  const positions: { x: number; y: number }[] = []
  if (count === 0) return positions

  const startAngle = Math.PI
  const endAngle = 2 * Math.PI
  const maxPerRing = 10
  const rings = Math.ceil(count / maxPerRing)
  let idx = 0

  for (let ring = 0; ring < rings && idx < count; ring++) {
    const ringRadius = radius * (0.35 + (ring * 0.65) / Math.max(rings - 1, 1))
    const inRing = Math.min(maxPerRing + ring * 2, count - idx)

    for (let i = 0; i < inRing && idx < count; i++) {
      const angle = startAngle + ((endAngle - startAngle) * i) / Math.max(inRing - 1, 1)
      positions.push({
        x: centerX + Math.cos(angle) * ringRadius,
        y: centerY + Math.sin(angle) * ringRadius * 0.65,
      })
      idx++
    }
  }
  return positions
}

function SpaceContent({ space }: { space: BoardSpace }) {
  const capitalize = (str: string) => str.charAt(0).toUpperCase() + str.slice(1)

  if (space.type === 'property') {
    const bgColor = colorMap[space.color] || colors.brown
    return (
      <View style={{ flex: 1 }}>
        <View style={[styles.propertyHeader, { backgroundColor: bgColor }]} />
        <View style={styles.propertyBody}>
          {space.pokemon?.sprite && (
            <PDFImage src={space.pokemon.sprite} style={styles.pokemonSprite} />
          )}
          <Text style={styles.propertyName}>
            {space.pokemon ? capitalize(space.pokemon.name) : '???'}
          </Text>
          <Text style={styles.propertyPrice}>P{space.price}</Text>
        </View>
      </View>
    )
  }

  if (space.type === 'gym') {
    return (
      <View style={[styles.cornerCell, { backgroundColor: '#E8E8E8' }]}>
        <Text style={[styles.cornerTitle, { fontSize: 9 }]}>{space.name}</Text>
        <Text style={styles.cornerLabel}>GYM</Text>
        <Text style={[styles.cornerLabel, { fontWeight: 'bold' }]}>P{space.price}</Text>
      </View>
    )
  }

  if (space.type === 'item-bag') {
    return (
      <View style={[styles.cornerCell, { backgroundColor: '#BBDEFB' }]}>
        <Text style={styles.cornerTitle}>ITEM</Text>
        <Text style={styles.cornerTitle}>BAG</Text>
      </View>
    )
  }

  if (space.type === 'professor-oak') {
    return (
      <View style={[styles.cornerCell, { backgroundColor: '#C8E6C9' }]}>
        <Text style={styles.cornerTitle}>PROF.</Text>
        <Text style={styles.cornerTitle}>OAK</Text>
      </View>
    )
  }

  if (space.type === 'grunt-ambush') {
    return (
      <View style={[styles.cornerCell, { backgroundColor: '#FFCDD2' }]}>
        <Text style={styles.cornerTitle}>GRUNT</Text>
        <Text style={styles.cornerTitle}>AMBUSH</Text>
        <Text style={[styles.cornerLabel, { fontWeight: 'bold' }]}>Pay P{space.amount}</Text>
      </View>
    )
  }

  if (space.type === 'giovanni') {
    return (
      <View style={[styles.cornerCell, { backgroundColor: '#E1BEE7' }]}>
        <Text style={styles.cornerTitle}>GIOVANNI</Text>
        <Text style={[styles.cornerLabel, { fontWeight: 'bold' }]}>Pay P{space.amount}+</Text>
      </View>
    )
  }

  if (space.type === 'go') {
    return (
      <View style={[styles.cornerCell, { backgroundColor: '#FFCDD2' }]}>
        <Text style={{ fontSize: 28, color: '#D32F2F', fontWeight: 'bold' }}>→</Text>
        <Text style={[styles.cornerTitle, { fontSize: 14 }]}>GO</Text>
        <Text style={styles.cornerLabel}>Collect P200</Text>
      </View>
    )
  }

  if (space.type === 'jail') {
    return (
      <View style={[styles.cornerCell, { backgroundColor: '#FFE0B2' }]}>
        <Text style={[styles.cornerTitle, { fontSize: 9 }]}>TEAM ROCKET</Text>
        <Text style={[styles.cornerTitle, { fontSize: 12 }]}>HIDEOUT</Text>
        <Text style={styles.cornerLabel}>Just Visiting</Text>
      </View>
    )
  }

  if (space.type === 'free-parking') {
    return (
      <View style={[styles.cornerCell, { backgroundColor: '#FFF9C4' }]}>
        <Text style={{ fontSize: 20, color: '#F57F17', fontWeight: 'bold' }}>P</Text>
        <Text style={styles.cornerTitle}>FREE</Text>
        <Text style={styles.cornerTitle}>PARKING</Text>
      </View>
    )
  }

  if (space.type === 'go-to-jail') {
    return (
      <View style={[styles.cornerCell, { backgroundColor: '#E1BEE7' }]}>
        <Text style={{ fontSize: 20, color: '#7B1FA2' }}>☞</Text>
        <Text style={styles.cornerTitle}>GO TO</Text>
        <Text style={styles.cornerTitle}>HIDEOUT</Text>
      </View>
    )
  }

  return (
    <View style={[styles.cornerCell]}>
      <Text style={styles.propertyName}>???</Text>
    </View>
  )
}

export function BoardTilePage({ spaces, paperSize, tileRow, tileCol }: BoardTilePageProps) {
  const tileX = tileCol * TILE_WIDTH
  const tileY = tileRow * TILE_HEIGHT
  const tileNumber = tileRow * TILE_COLS + tileCol + 1

  // Get Pokemon for collage
  const pokemon: Pokemon[] = spaces
    .filter((s): s is BoardSpace & { pokemon: Pokemon } => s.type === 'property' && !!s.pokemon)
    .map(s => s.pokemon)

  // Determine visible spaces
  const visibleSpaces = spaces.map((space, index) => {
    const pos = getSpacePosition(index)
    const spaceRight = pos.x + pos.width
    const spaceBottom = pos.y + pos.height
    const tileRight = tileX + TILE_WIDTH
    const tileBottom = tileY + TILE_HEIGHT

    if (pos.x < tileRight && spaceRight > tileX && pos.y < tileBottom && spaceBottom > tileY) {
      return { space, pos, index }
    }
    return null
  }).filter(Boolean) as { space: BoardSpace; pos: ReturnType<typeof getSpacePosition>; index: number }[]

  // Center area bounds
  const centerStart = CORNER_SIZE
  const centerEnd = BOARD_SIZE - CORNER_SIZE
  const centerMidY = BOARD_SIZE / 2

  // Check what parts of center are visible
  const showCenter = tileX < centerEnd && tileX + TILE_WIDTH > centerStart &&
                     tileY < centerEnd && tileY + TILE_HEIGHT > centerStart

  // Only show rules on the bottom-left center tile (tile 5, row=2, col=0)
  // which contains most of the bottom-white section
  const showRules = tileRow === 2 && tileCol === 0

  // Only show title on top center tiles (row 0)
  const showTitle = tileRow === 0 && showCenter

  // Collage positions for Pokemon (in top half of center)
  const collageRadius = (centerEnd - centerStart) / 2 - 50
  const collageCenterX = BOARD_SIZE / 2
  const collageCenterY = centerStart + (centerMidY - centerStart) * 0.55
  const collagePositions = getCollagePositions(pokemon.length, collageCenterX, collageCenterY, collageRadius)

  const capitalize = (str: string) => str.charAt(0).toUpperCase() + str.slice(1)

  return (
    <Page
      size={paperSize.toUpperCase() as 'LETTER' | 'A4'}
      orientation="landscape"
      style={styles.page}
    >
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 3 }}>
        <Text style={{ fontSize: 9, fontWeight: 'bold' }}>
          Poke-Poly Board - Tile {tileNumber}/6
        </Text>
        <Text style={{ fontSize: 6, color: '#666' }}>
          Align edges & tape together • Final size: 20" × 20"
        </Text>
      </View>

      <View style={styles.tileContainer}>
        {/* Center area with Pokeball design */}
        {showCenter && (
          <>
            {/* Top half - Red */}
            <View
              style={[
                styles.pokeballTop,
                {
                  left: Math.max(0, centerStart - tileX),
                  top: Math.max(0, centerStart - tileY),
                  width: Math.min(TILE_WIDTH, centerEnd - tileX) - Math.max(0, centerStart - tileX),
                  height: Math.max(0, Math.min(centerMidY - tileY, TILE_HEIGHT) - Math.max(0, centerStart - tileY)),
                },
              ]}
            />

            {/* Bottom half - White */}
            <View
              style={[
                styles.pokeballBottom,
                {
                  left: Math.max(0, centerStart - tileX),
                  top: Math.max(0, centerMidY - tileY),
                  width: Math.min(TILE_WIDTH, centerEnd - tileX) - Math.max(0, centerStart - tileX),
                  height: Math.max(0, Math.min(centerEnd - tileY, TILE_HEIGHT) - Math.max(0, centerMidY - tileY)),
                },
              ]}
            />

            {/* Center band */}
            {tileY < centerMidY + 14 && tileY + TILE_HEIGHT > centerMidY - 14 && (
              <View
                style={[
                  styles.pokeballBand,
                  {
                    left: Math.max(0, centerStart - tileX),
                    top: Math.max(0, centerMidY - 14 - tileY),
                    width: Math.min(TILE_WIDTH, centerEnd - tileX) - Math.max(0, centerStart - tileX),
                  },
                ]}
              />
            )}

            {/* Center button */}
            {tileX < BOARD_SIZE / 2 + 40 && tileX + TILE_WIDTH > BOARD_SIZE / 2 - 40 &&
             tileY < centerMidY + 40 && tileY + TILE_HEIGHT > centerMidY - 40 && (
              <View
                style={[
                  styles.pokeballButton,
                  {
                    left: BOARD_SIZE / 2 - 36 - tileX,
                    top: centerMidY - 36 - tileY,
                    width: 72,
                    height: 72,
                  },
                ]}
              >
                <View style={{ width: 28, height: 28, borderRadius: 14, backgroundColor: '#D1D5DB' }} />
              </View>
            )}

            {/* MASTER LEAGUE title - only on specific tile */}
            {showTitle && (
              <Text
                style={[
                  styles.centerTitle,
                  {
                    left: Math.max(0, centerStart - tileX),
                    top: Math.max(10, centerStart + 20 - tileY),
                    width: Math.min(TILE_WIDTH, centerEnd - tileX) - Math.max(0, centerStart - tileX),
                  },
                ]}
              >
                MASTER LEAGUE
              </Text>
            )}

            {/* Pokemon collage sprites */}
            {pokemon.map((poke, idx) => {
              const pos = collagePositions[idx]
              if (!pos) return null

              const halfSprite = COLLAGE_SPRITE_SIZE / 2
              const spriteX = pos.x - halfSprite - tileX
              const spriteY = pos.y - halfSprite - tileY

              // Only render if visible in this tile
              if (spriteX < -COLLAGE_SPRITE_SIZE || spriteX > TILE_WIDTH ||
                  spriteY < -COLLAGE_SPRITE_SIZE || spriteY > TILE_HEIGHT) {
                return null
              }

              return (
                <View
                  key={poke.id}
                  style={{
                    position: 'absolute',
                    left: spriteX,
                    top: spriteY,
                    width: COLLAGE_SPRITE_SIZE,
                    alignItems: 'center',
                  }}
                >
                  <PDFImage src={poke.sprite} style={styles.collageSprite} />
                  <Text style={styles.collageLabel}>{capitalize(poke.name)}</Text>
                </View>
              )
            })}

            {/* Quick Rules - only on bottom-left tile */}
            {showRules && (
              <View
                style={[
                  styles.rulesContainer,
                  {
                    left: Math.max(30, centerStart + 60 - tileX),
                    top: Math.max(20, centerMidY + 35 - tileY),
                    width: Math.min(600, centerEnd - centerStart - 120),
                  },
                ]}
              >
                <Text style={styles.rulesTitle}>QUICK RULES</Text>
                <Text style={styles.rulesText}>
                  <Text style={styles.rulesBold}>Setup:</Text> Each player starts with P1500 on GO.
                  <Text style={styles.rulesBold}> Play:</Text> Roll dice, move clockwise.
                </Text>
                <Text style={styles.rulesText}>
                  <Text style={styles.rulesBold}>Buy:</Text> Land on unowned property? Buy it!
                  <Text style={styles.rulesBold}> Rent:</Text> Others land on yours? Collect rent!
                </Text>
                <Text style={styles.rulesText}>
                  <Text style={styles.rulesBold}>Build:</Text> Own all of a color → add Berries (houses). 4 Berries = 1 Evolution Stone (hotel).
                </Text>
                <Text style={styles.rulesText}>
                  <Text style={styles.rulesBold}>Jail:</Text> Pay P50 or roll doubles.
                  <Text style={styles.rulesBold}> Gyms:</Text> Rent = P25 × gyms owned.
                  <Text style={styles.rulesBold}> Free Parking:</Text> Collect the pot!
                </Text>
                <Text style={styles.rulesText}>
                  <Text style={styles.rulesBold}>Win:</Text> Last player with money wins!
                  <Text style={styles.rulesBold}> Start P1500:</Text> 2×P500 • 2×P100 • 2×P50 • 6×P20 • 5×P10 • 5×P5 • 5×P1
                </Text>
              </View>
            )}
          </>
        )}

        {/* Render board spaces */}
        {visibleSpaces.map(({ space, pos, index }) => (
          <View
            key={index}
            style={[
              styles.space,
              {
                left: pos.x - tileX,
                top: pos.y - tileY,
                width: pos.width,
                height: pos.height,
              },
            ]}
          >
            <SpaceContent space={space} />
          </View>
        ))}

        {/* Cut/alignment lines */}
        {tileCol > 0 && (
          <View style={[styles.cutLine, { left: 0, top: 0, bottom: 0, borderLeftWidth: 1 }]} />
        )}
        {tileCol < TILE_COLS - 1 && (
          <View style={[styles.cutLine, { right: 0, top: 0, bottom: 0, borderRightWidth: 1 }]} />
        )}
        {tileRow > 0 && (
          <View style={[styles.cutLine, { left: 0, right: 0, top: 0, borderTopWidth: 1 }]} />
        )}
        {tileRow < TILE_ROWS - 1 && (
          <View style={[styles.cutLine, { left: 0, right: 0, bottom: 0, borderBottomWidth: 1 }]} />
        )}

        <Text style={styles.tileLabel}>Tile {tileNumber}</Text>
      </View>

      <Text style={{ fontSize: 5, marginTop: 3, color: '#666', textAlign: 'center' }}>
        Print at 100% scale. Cut along dashed lines. Tape edges together.
      </Text>
    </Page>
  )
}
