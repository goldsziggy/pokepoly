import { Page, View, Text, StyleSheet, Image as PDFImage } from '@react-pdf/renderer'
import type { PaperSize, BoardSpace, Pokemon, BoardSize } from '@/types'
import { colors } from './styles'
import { getSpaceSprite, getGymImage } from '@/components/board/spaceSprites'
import { PokeCoinPDF } from '@/components/ui/PokeCoin'
import { getPrimaryType } from '@/lib/typeIcons'
import { TypeIconPDF } from '@/types/TypeIconPDF'
import { BOARD_SIZE_INCHES, PAPER_DIMENSIONS } from '@/types/board'

const POINTS_PER_INCH = 72
const BASE_CORNER_SIZE_IN = 2.5
const BASE_SIDE_SIZE_IN = 1.5
const BASE_BOARD_SIZE_IN = BASE_CORNER_SIZE_IN * 2 + BASE_SIDE_SIZE_IN * 9
// Landscape layout: 3 columns x 3 rows = 9 pages
const TILE_COLS = 3
const TILE_ROWS = 3
const createStyles = (
  scale: (value: number) => number,
  tileWidth: number,
  tileHeight: number
) => StyleSheet.create({
  page: {
    backgroundColor: '#fff',
  },
  tileContainer: {
    width: tileWidth,
    height: tileHeight,
    position: 'relative',
    overflow: 'hidden',
    borderWidth: scale(1),
    borderColor: '#ccc',
  },
  tileLabel: {
    position: 'absolute',
    bottom: scale(3),
    right: scale(5),
    fontSize: scale(6),
    color: '#666',
  },
  cutLine: {
    position: 'absolute',
    borderStyle: 'dashed',
    borderColor: '#999',
  },
  space: {
    position: 'absolute',
    borderWidth: scale(2),
    borderColor: colors.black,
    backgroundColor: colors.white,
    overflow: 'hidden',
  },
  propertyHeader: {
    height: scale(22),
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  propertyBody: {
    flex: 1,
    padding: scale(3),
    alignItems: 'center',
    justifyContent: 'center',
  },
  propertyName: {
    fontSize: scale(8),
    fontWeight: 'bold',
    textAlign: 'center',
  },
  propertyPrice: {
    fontSize: scale(7),
    textAlign: 'center',
    marginTop: scale(2),
  },
  pokemonSprite: {
    width: scale(55),
    height: scale(55),
    objectFit: 'contain',
  },
  spaceImage: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    position: 'absolute',
    top: 0,
    left: 0,
  },
  spaceImageContain: {
    width: '100%',
    height: '100%',
    objectFit: 'contain',
    position: 'absolute',
    top: 0,
    left: 0,
  },
  cornerCell: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: scale(6),
    position: 'relative',
  },
  innerSquareBorder: {
    position: 'absolute',
    bottom: scale(4),
    right: scale(4),
    width: '50%',
    height: '50%',
    borderWidth: scale(2),
    borderColor: colors.black,
    zIndex: 10,
  },
  innerSquareBorderTopRight: {
    position: 'absolute',
    top: scale(4),
    right: scale(4),
    width: '50%',
    height: '50%',
    borderWidth: scale(2),
    borderColor: colors.black,
    zIndex: 10,
  },
  innerSquareContent: {
    position: 'absolute',
    bottom: scale(4),
    right: scale(4),
    width: '50%',
    height: '50%',
    overflow: 'hidden',
    zIndex: 10,
  },
  innerSquareContentTopRight: {
    position: 'absolute',
    top: scale(4),
    right: scale(4),
    width: '50%',
    height: '50%',
    overflow: 'hidden',
    zIndex: 10,
  },
  outerSquareText: {
    position: 'absolute',
    top: scale(4),
    left: scale(4),
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: scale(3),
    paddingVertical: scale(2),
    zIndex: 20,
  },
  outerSquareTextBottomLeft: {
    position: 'absolute',
    bottom: scale(4),
    left: scale(4),
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: scale(3),
    paddingVertical: scale(2),
    zIndex: 20,
  },
  cornerImage: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    position: 'absolute',
    top: 0,
    left: 0,
    zIndex: 0,
  },
  cornerTitle: {
    fontSize: scale(10),
    fontWeight: 'bold',
    textAlign: 'center',
  },
  cornerLabel: {
    fontSize: scale(8),
    textAlign: 'center',
    marginTop: scale(3),
  },
  textOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    paddingHorizontal: scale(4),
    paddingVertical: scale(3),
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: scale(22),
    width: '100%',
  },
  overlayText: {
    color: '#FFFFFF',
    fontSize: scale(8),
    fontWeight: 'bold',
    textAlign: 'center',
  },
  overlaySubtext: {
    color: '#FFFFFF',
    fontSize: scale(6),
    textAlign: 'center',
    marginTop: scale(1),
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
    height: scale(28),
  },
  pokeballButton: {
    position: 'absolute',
    backgroundColor: '#FFFFFF',
    borderWidth: scale(6),
    borderColor: '#1F2937',
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Pokemon collage
  collageSprite: {
    width: scale(50),
    height: scale(50),
    objectFit: 'contain',
  },
  collageLabel: {
    fontSize: scale(6),
    color: '#FFFFFF',
    backgroundColor: 'rgba(0,0,0,0.5)',
    textAlign: 'center',
    paddingHorizontal: scale(3),
    paddingVertical: scale(1),
    borderRadius: scale(2),
  },
  // Rules
  rulesContainer: {
    position: 'absolute',
    alignItems: 'center',
    flexDirection: 'row',
    gap: scale(20),
  },
  cardPlaceholder: {
    width: scale(96),
    height: scale(128),
    borderWidth: scale(2),
    borderStyle: 'dashed',
    borderColor: '#9CA3AF',
    borderRadius: scale(4),
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F9FAFB',
  },
  cardPlaceholderText: {
    fontSize: scale(8),
    color: '#6B7280',
    textAlign: 'center',
    fontWeight: 'bold',
  },
  rulesTitle: {
    fontSize: scale(18),
    fontWeight: 'bold',
    color: '#DC2626',
    textAlign: 'center',
    marginBottom: scale(10),
  },
  rulesText: {
    fontSize: scale(12),
    color: '#374151',
    textAlign: 'center',
    marginBottom: scale(5),
  },
  rulesBold: {
    fontWeight: 'bold',
    fontSize: scale(12),
  },
  centerTitle: {
    position: 'absolute',
    fontSize: scale(22),
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
  boardSize: BoardSize
  tileRow: number // 0-2
  tileCol: number // 0-1
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

export function BoardTilePage({ spaces, paperSize, boardSize, tileRow, tileCol }: BoardTilePageProps) {
  const boardSizeIn = BOARD_SIZE_INCHES[boardSize]
  const boardScale = boardSizeIn / BASE_BOARD_SIZE_IN
  const scale = (value: number) => value * boardScale

  const boardSizePoints = boardSizeIn * POINTS_PER_INCH
  const cornerSize = BASE_CORNER_SIZE_IN * boardScale * POINTS_PER_INCH
  const sideSize = BASE_SIDE_SIZE_IN * boardScale * POINTS_PER_INCH
  const tileWidth = boardSizePoints / TILE_COLS
  const tileHeight = boardSizePoints / TILE_ROWS
  const collageSpriteSize = scale(50)
  const typeIconSize = scale(16)
  const propertyCoinSize = scale(8)
  const overlayCoinSize = scale(6)
  const overlayGap = scale(2)
  const overlayMargin = scale(1)
  const   rulesCoinSize = scale(8)
  const rulesInlineGap = scale(2)
  const centerBandHalfHeight = scale(14)
  const centerButtonRadius = scale(40)
  const centerButtonOffset = scale(36)
  const centerButtonSize = scale(72)
  const centerButtonInnerSize = scale(28)
  const centerButtonInnerRadius = scale(14)
  const collageRadiusPadding = scale(50)
  const rulesOffsetX = scale(40)
  const rulesOffsetY = scale(20)
  const rulesWidth = scale(650)
  const headerMarginBottom = scale(3)
  const headerTitleFont = scale(9)
  const headerSubtitleFont = scale(6)
  const footerFontSize = scale(5)
  const footerMarginTop = scale(3)
  const tileLabelCutLineWidth = scale(1)

  const pageDimensions = PAPER_DIMENSIONS[paperSize]
  const pageWidth = pageDimensions.height
  const basePadding = scale(12)
  const paddingHorizontal = Math.max(0, Math.min(basePadding, (pageWidth - tileWidth) / 2))

  const styles = createStyles(scale, tileWidth, tileHeight)
  const tileX = tileCol * tileWidth
  const tileY = tileRow * tileHeight
  const tileNumber = tileRow * TILE_COLS + tileCol + 1
  const capitalize = (str: string) => str.charAt(0).toUpperCase() + str.slice(1)

  const getSpacePosition = (index: number): { x: number; y: number; width: number; height: number } => {
    const boardRight = boardSizePoints - cornerSize
    const boardBottom = boardSizePoints - cornerSize

    if (index === 0) {
      return { x: boardRight, y: boardBottom, width: cornerSize, height: cornerSize }
    } else if (index >= 1 && index <= 9) {
      const pos = 9 - index
      return { x: cornerSize + pos * sideSize, y: boardBottom, width: sideSize, height: cornerSize }
    } else if (index === 10) {
      return { x: 0, y: boardBottom, width: cornerSize, height: cornerSize }
    } else if (index >= 11 && index <= 19) {
      const pos = 19 - index
      return { x: 0, y: cornerSize + pos * sideSize, width: cornerSize, height: sideSize }
    } else if (index === 20) {
      return { x: 0, y: 0, width: cornerSize, height: cornerSize }
    } else if (index >= 21 && index <= 29) {
      const pos = index - 21
      return { x: cornerSize + pos * sideSize, y: 0, width: sideSize, height: cornerSize }
    } else if (index === 30) {
      return { x: boardRight, y: 0, width: cornerSize, height: cornerSize }
    } else if (index >= 31 && index <= 39) {
      const pos = index - 31
      return { x: boardRight, y: cornerSize + pos * sideSize, width: cornerSize, height: sideSize }
    }
    return { x: 0, y: 0, width: 0, height: 0 }
  }

  const SpaceContent = ({ space }: { space: BoardSpace }) => {
    if (space.type === 'property') {
      const bgColor = colorMap[space.color] || colors.brown
      const primaryType = space.pokemon ? getPrimaryType(space.pokemon.types) : null
      return (
        <View style={{ flex: 1 }}>
          <View style={[styles.propertyHeader, { backgroundColor: bgColor }]}>
            {primaryType && (
              <View style={{
                backgroundColor: 'rgba(255, 255, 255, 0.85)',
                borderRadius: 999,
                padding: scale(1),
              }}>
                <TypeIconPDF type={primaryType} size={typeIconSize} />
              </View>
            )}
          </View>
          <View style={styles.propertyBody}>
            {space.pokemon?.sprite && (
              <PDFImage src={space.pokemon.sprite} style={styles.pokemonSprite} />
            )}
            <Text style={styles.propertyName}>
              {space.pokemon ? capitalize(space.pokemon.name) : '???'}
            </Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: overlayGap }}>
              <PokeCoinPDF size={propertyCoinSize} />
              <Text style={styles.propertyPrice}>{space.price}</Text>
            </View>
          </View>
        </View>
      )
    }

    if (space.type === 'gym') {
      const gymImage = getGymImage(space.name)
      return (
        <View style={[styles.cornerCell, { backgroundColor: '#E8E8E8' }]}>
          <View style={{ position: 'relative', width: '100%', height: '100%' }}>
            {gymImage && (
              <PDFImage src={gymImage} style={styles.cornerImage} />
            )}
            <View style={styles.textOverlay}>
              <Text style={styles.overlayText}>{space.name}</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: overlayGap, marginTop: overlayMargin }}>
                <PokeCoinPDF size={overlayCoinSize} />
                <Text style={styles.overlaySubtext}>{space.price}</Text>
              </View>
            </View>
          </View>
        </View>
      )
    }

    if (space.type === 'item-bag') {
      const sprite = getSpaceSprite('item-bag')
      return (
        <View style={[styles.cornerCell, { backgroundColor: '#BBDEFB' }]}>
          <View style={{ position: 'relative', width: '100%', height: '100%' }}>
            {sprite && (
              <PDFImage src={sprite} style={styles.cornerImage} />
            )}
            <View style={styles.textOverlay}>
              <Text style={styles.overlayText}>ITEM BAG</Text>
            </View>
          </View>
        </View>
      )
    }

    if (space.type === 'professor-oak') {
      const sprite = getSpaceSprite('professor-oak')
      return (
        <View style={[styles.cornerCell, { backgroundColor: '#C8E6C9' }]}>
          <View style={{ position: 'relative', width: '100%', height: '100%' }}>
            {sprite && (
              <PDFImage src={sprite} style={styles.cornerImage} />
            )}
            <View style={styles.textOverlay}>
              <Text style={styles.overlayText}>PROF. OAK</Text>
            </View>
          </View>
        </View>
      )
    }

    if (space.type === 'grunt-ambush') {
      const sprite = getSpaceSprite('grunt-ambush')
      return (
        <View style={[styles.cornerCell, { backgroundColor: '#FFCDD2' }]}>
          <View style={{ position: 'relative', width: '100%', height: '100%' }}>
            {sprite && (
              <PDFImage src={sprite} style={styles.cornerImage} />
            )}
            <View style={styles.textOverlay}>
              <Text style={styles.overlayText}>GRUNT AMBUSH</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: overlayGap, marginTop: overlayMargin }}>
                <Text style={styles.overlaySubtext}>Pay </Text>
                <PokeCoinPDF size={overlayCoinSize} />
                <Text style={styles.overlaySubtext}>{space.amount}</Text>
              </View>
            </View>
          </View>
        </View>
      )
    }

    if (space.type === 'giovanni') {
      const sprite = getSpaceSprite('giovanni')
      return (
        <View style={[styles.cornerCell, { backgroundColor: '#E1BEE7' }]}>
          <View style={{ position: 'relative', width: '100%', height: '100%' }}>
            {sprite && (
              <PDFImage src={sprite} style={styles.cornerImage} />
            )}
            <View style={styles.textOverlay}>
              <Text style={styles.overlayText}>GIOVANNI</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: overlayGap, marginTop: overlayMargin }}>
                <Text style={styles.overlaySubtext}>Pay </Text>
                <PokeCoinPDF size={overlayCoinSize} />
                <Text style={styles.overlaySubtext}>{space.amount}+</Text>
              </View>
            </View>
          </View>
        </View>
      )
    }

    if (space.type === 'go') {
      const sprite = getSpaceSprite('go')
      return (
        <View style={[styles.cornerCell, { backgroundColor: '#FFCDD2' }]}>
          <View style={{ position: 'relative', width: '100%', height: '100%' }}>
            {sprite && (
              <PDFImage src={sprite} style={styles.cornerImage} />
            )}
            <View style={styles.textOverlay}>
              <Text style={styles.overlayText}>GO</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: overlayGap, marginTop: overlayMargin }}>
                <Text style={styles.overlaySubtext}>Collect </Text>
                <PokeCoinPDF size={overlayCoinSize} />
                <Text style={styles.overlaySubtext}>200</Text>
              </View>
            </View>
          </View>
        </View>
      )
    }

    if (space.type === 'jail') {
      const sprite = getSpaceSprite('jail')
      return (
        <View style={[styles.cornerCell, { backgroundColor: '#FFE0B2' }]}>
          {/* Outer square - "Just Visiting" text at top-left (outer corner) */}
          <View style={styles.outerSquareText}>
            <Text style={styles.overlaySubtext}>Just Visiting</Text>
          </View>
          
          {/* Inner square border - aligned to bottom-right (inner corner toward center) */}
          <View style={styles.innerSquareBorder} />
          
          {/* Inner square content - image and "Team Rocket Hideout" */}
          <View style={styles.innerSquareContent}>
            {sprite && (
              <PDFImage src={sprite} style={styles.cornerImage} />
            )}
            <View style={styles.textOverlay}>
              <Text style={styles.overlayText}>TEAM ROCKET</Text>
              <Text style={styles.overlaySubtext}>HIDEOUT</Text>
            </View>
          </View>
        </View>
      )
    }

    if (space.type === 'free-parking') {
      const sprite = getSpaceSprite('free-parking')
      return (
        <View style={[styles.cornerCell, { backgroundColor: '#FFF9C4' }]}>
          <View style={{ position: 'relative', width: '100%', height: '100%' }}>
            {sprite && (
              <PDFImage src={sprite} style={styles.cornerImage} />
            )}
            <View style={styles.textOverlay}>
              <Text style={styles.overlayText}>FREE PARKING</Text>
            </View>
          </View>
        </View>
      )
    }

    if (space.type === 'go-to-jail') {
      const sprite = getSpaceSprite('go-to-jail')
      return (
        <View style={[styles.cornerCell, { backgroundColor: '#E1BEE7' }]}>
          <View style={{ position: 'relative', width: '100%', height: '100%' }}>
            {sprite && (
              <PDFImage src={sprite} style={styles.cornerImage} />
            )}
            <View style={styles.textOverlay}>
              <Text style={styles.overlayText}>GO TO HIDEOUT</Text>
            </View>
          </View>
        </View>
      )
    }

    return (
      <View style={[styles.cornerCell]}>
        <Text style={styles.propertyName}>???</Text>
      </View>
    )
  }

  // Get Pokemon for collage
  const pokemon: Pokemon[] = spaces
    .filter((s): s is BoardSpace & { pokemon: Pokemon } => s.type === 'property' && !!s.pokemon)
    .map(s => s.pokemon)

  // Determine visible spaces
  const visibleSpaces = spaces.map((space, index) => {
    const pos = getSpacePosition(index)
    const spaceRight = pos.x + pos.width
    const spaceBottom = pos.y + pos.height
    const tileRight = tileX + tileWidth
    const tileBottom = tileY + tileHeight

    if (pos.x < tileRight && spaceRight > tileX && pos.y < tileBottom && spaceBottom > tileY) {
      return { space, pos, index }
    }
    return null
  }).filter(Boolean) as { space: BoardSpace; pos: ReturnType<typeof getSpacePosition>; index: number }[]

  // Center area bounds
  const centerStart = cornerSize
  const centerEnd = boardSizePoints - cornerSize
  const centerMidY = (centerStart + centerEnd) / 2

  // Check what parts of center are visible
  const showCenter = tileX < centerEnd && tileX + tileWidth > centerStart &&
                     tileY < centerEnd && tileY + tileHeight > centerStart

  // Calculate rules container bounds (absolute position on board)
  // Rules are in the bottom half of the center area
  // Position rules starting from the middle of the center area (bottom half)
  const rulesContainerLeft = centerStart + rulesOffsetX
  const rulesContainerTop = centerMidY + rulesOffsetY // Start from middle of center area
  const rulesContainerRight = rulesContainerLeft + rulesWidth
  // Estimate height based on content (title (18) + title margin (10) + 7 text lines (12 each + 6 margin) + bottom padding (20))
  const estimatedRulesHeight = scale(18 + 10 + (12 + 6) * 7 + 20)
  const rulesContainerBottom = rulesContainerTop + estimatedRulesHeight
  
  // Show rules on ALL bottom row tiles (row=2) that show the center
  // This ensures rules are always visible and can span multiple tiles
  const showRules = tileRow === 2 && showCenter
  
  // Check if rules container overlaps with current tile (for clipping)
  const rulesOverlapsTile = rulesContainerLeft < tileX + tileWidth && 
                            rulesContainerRight > tileX &&
                            rulesContainerTop < tileY + tileHeight &&
                            rulesContainerBottom > tileY

  // Calculate visible portion of rules container on this tile (if showing rules)
  let visibleRulesLeft = 0
  let visibleRulesRight = 0
  let visibleRulesTop = 0
  let visibleRulesBottom = 0
  let visibleRulesWidth = 0
  let visibleRulesHeight = 0
  let visibleRulesLeftOffset = 0
  let visibleRulesTopOffset = 0
  
  if (showRules) {
    if (rulesOverlapsTile) {
      // Calculate visible portion that overlaps with this tile
      visibleRulesLeft = Math.max(rulesContainerLeft, tileX)
      visibleRulesRight = Math.min(rulesContainerRight, tileX + tileWidth)
      visibleRulesTop = Math.max(rulesContainerTop, tileY)
      visibleRulesBottom = Math.min(rulesContainerBottom, tileY + tileHeight)
      visibleRulesWidth = Math.max(0, visibleRulesRight - visibleRulesLeft)
      visibleRulesHeight = Math.max(0, visibleRulesBottom - visibleRulesTop)
      visibleRulesLeftOffset = visibleRulesLeft - rulesContainerLeft
      visibleRulesTopOffset = visibleRulesTop - rulesContainerTop
    } else {
      // Fallback: if no overlap detected, show rules positioned from container start
      // This ensures rules always show on bottom row tiles
      visibleRulesLeft = rulesContainerLeft - tileX
      visibleRulesTop = rulesContainerTop - tileY
      visibleRulesWidth = Math.min(rulesWidth, tileWidth - Math.max(0, visibleRulesLeft))
      visibleRulesHeight = Math.min(estimatedRulesHeight, tileHeight - Math.max(0, visibleRulesTop))
      visibleRulesLeftOffset = 0
      visibleRulesTopOffset = 0
    }
  }

  // Only show title on top center tiles (row 0)
  const showTitle = tileRow === 0 && showCenter

  // Collage positions for Pokemon (in top half of center)
  const collageRadius = (centerEnd - centerStart) / 2 - collageRadiusPadding
  const collageCenterX = boardSizePoints / 2
  const collageCenterY = centerStart + (centerMidY - centerStart) * 0.55
  const collagePositions = getCollagePositions(pokemon.length, collageCenterX, collageCenterY, collageRadius)

  return (
    <Page
      size={paperSize.toUpperCase() as 'LETTER' | 'A4'}
      orientation="landscape"
      style={[styles.page, { paddingHorizontal, paddingVertical: basePadding }]}
    >
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: headerMarginBottom }}>
        <Text style={{ fontSize: headerTitleFont, fontWeight: 'bold' }}>
          Poke-Poly Board - Tile {tileNumber}/9
        </Text>
        <Text style={{ fontSize: headerSubtitleFont, color: '#666' }}>
          Align edges & tape together • Final size: {boardSizeIn}" × {boardSizeIn}"
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
                  width: Math.min(tileWidth, centerEnd - tileX) - Math.max(0, centerStart - tileX),
                  height: Math.max(0, Math.min(centerMidY - tileY, tileHeight) - Math.max(0, centerStart - tileY)),
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
                  width: Math.min(tileWidth, centerEnd - tileX) - Math.max(0, centerStart - tileX),
                  height: Math.max(0, Math.min(centerEnd - tileY, tileHeight) - Math.max(0, centerMidY - tileY)),
                },
              ]}
            />

            {/* Center band */}
            {tileY < centerMidY + centerBandHalfHeight && tileY + tileHeight > centerMidY - centerBandHalfHeight && (
              <View
                style={[
                  styles.pokeballBand,
                  {
                    left: Math.max(0, centerStart - tileX),
                    top: Math.max(0, centerMidY - centerBandHalfHeight - tileY),
                    width: Math.min(tileWidth, centerEnd - tileX) - Math.max(0, centerStart - tileX),
                  },
                ]}
              />
            )}

            {/* Center button */}
            {tileX < boardSizePoints / 2 + centerButtonRadius && tileX + tileWidth > boardSizePoints / 2 - centerButtonRadius &&
             tileY < centerMidY + centerButtonRadius && tileY + tileHeight > centerMidY - centerButtonRadius && (
              <View
                style={[
                  styles.pokeballButton,
                  {
                    left: boardSizePoints / 2 - centerButtonOffset - tileX,
                    top: centerMidY - centerButtonOffset - tileY,
                    width: centerButtonSize,
                    height: centerButtonSize,
                  },
                ]}
              >
                <View style={{ width: centerButtonInnerSize, height: centerButtonInnerSize, borderRadius: centerButtonInnerRadius, backgroundColor: '#D1D5DB' }} />
              </View>
            )}

            {/* MASTER LEAGUE title - only on specific tile */}
            {showTitle && (
              <Text
                style={[
                  styles.centerTitle,
                  {
                    left: Math.max(0, centerStart - tileX),
                    top: Math.max(scale(10), centerStart + scale(20) - tileY),
                    width: Math.min(tileWidth, centerEnd - tileX) - Math.max(0, centerStart - tileX),
                  },
                ]}
              >
                POKE-POLY
              </Text>
            )}

            {/* Pokemon collage sprites */}
            {pokemon.map((poke, idx) => {
              const pos = collagePositions[idx]
              if (!pos) return null

              const halfSprite = collageSpriteSize / 2
              const spriteX = pos.x - halfSprite - tileX
              const spriteY = pos.y - halfSprite - tileY

              // Only render if visible in this tile
              if (spriteX < -collageSpriteSize || spriteX > tileWidth ||
                  spriteY < -collageSpriteSize || spriteY > tileHeight) {
                return null
              }

              return (
                <View
                  key={poke.id}
                  style={{
                    position: 'absolute',
                    left: spriteX,
                    top: spriteY,
                    width: collageSpriteSize,
                    alignItems: 'center',
                  }}
                >
                  <PDFImage src={poke.sprite} style={styles.collageSprite} />
                  <Text style={styles.collageLabel}>{capitalize(poke.name)}</Text>
                </View>
              )
            })}

            {/* Quick Rules - split across bottom tiles (row=2) */}
            {showRules && (
              <View
                style={[
                  styles.rulesContainer,
                  {
                    left: visibleRulesLeft - tileX,
                    top: visibleRulesTop - tileY,
                    width: visibleRulesWidth > 0 ? visibleRulesWidth : rulesWidth,
                    height: visibleRulesHeight > 0 ? visibleRulesHeight : estimatedRulesHeight,
                    overflow: 'hidden',
                  },
                ]}
              >
                {/* Offset the content to show the correct portion */}
                <View
                  style={{
                    position: 'absolute',
                    left: -visibleRulesLeftOffset,
                    top: -visibleRulesTopOffset,
                    width: rulesWidth,
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: scale(20),
                  }}
                >
                  {/* Left card placeholder */}
                  <View style={styles.cardPlaceholder}>
                    <Text style={styles.cardPlaceholderText}>Oak/Bag{'\n'}Cards</Text>
                  </View>
                  
                  {/* Center rules text */}
                  <View style={{ flex: 1, alignItems: 'center' }}>
                    <Text style={styles.rulesTitle}>QUICK RULES</Text>
                    <Text style={styles.rulesText}>
                    <Text style={styles.rulesText}>
                      <Text style={styles.rulesBold}>Setup:</Text> Each player starts with{' '}
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: rulesInlineGap }}>
                        <PokeCoinPDF size={rulesCoinSize} />
                        <Text>1500</Text>
                      </View>{' '}
                      on GO.
                    </Text>
                    <Text style={styles.rulesBold}> Play:</Text> Roll dice, move clockwise.
                  </Text>
                  <Text style={styles.rulesText}>
                    <Text style={styles.rulesBold}>Buy:</Text> Land on unowned property? Buy it!
                    <Text style={styles.rulesBold}> Rent:</Text> Others land on yours? Collect rent!
                  </Text>
                  <Text style={styles.rulesText}>
                    <Text style={styles.rulesBold}>Build:</Text> Own all of a color → add Gym Badges (houses). 4 Gym Badges = 1 League Badge (hotel).
                  </Text>
                  <Text style={styles.rulesText}>
                    <Text style={styles.rulesText}>
                      <Text style={styles.rulesBold}>Jail:</Text> Pay{' '}
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: rulesInlineGap }}>
                        <PokeCoinPDF size={rulesCoinSize} />
                        <Text>50</Text>
                      </View>{' '}
                      or roll doubles.{' '}
                      <Text style={styles.rulesBold}>Gyms:</Text> Rent ={' '}
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: rulesInlineGap }}>
                        <PokeCoinPDF size={rulesCoinSize} />
                        <Text>25</Text>
                      </View>{' '}
                      × gyms owned.
                    </Text>
                    <Text style={styles.rulesBold}> Free Parking:</Text> Collect the pot!
                  </Text>
                  <Text style={styles.rulesText}>
                    <Text style={styles.rulesBold}>Win:</Text> Last player with money wins!
                    <Text style={styles.rulesText}>
                      <Text style={styles.rulesBold}>Start </Text>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: rulesInlineGap }}>
                        <PokeCoinPDF size={rulesCoinSize} />
                        <Text>1500</Text>
                      </View>
                      <Text>: </Text>
                      2×<View style={{ flexDirection: 'row', alignItems: 'center', gap: rulesInlineGap }}><PokeCoinPDF size={rulesCoinSize} /><Text>500</Text></View>
                      {' • '}
                      2×<View style={{ flexDirection: 'row', alignItems: 'center', gap: rulesInlineGap }}><PokeCoinPDF size={rulesCoinSize} /><Text>100</Text></View>
                      {' • '}
                      2×<View style={{ flexDirection: 'row', alignItems: 'center', gap: rulesInlineGap }}><PokeCoinPDF size={rulesCoinSize} /><Text>50</Text></View>
                      {' • '}
                      6×<View style={{ flexDirection: 'row', alignItems: 'center', gap: rulesInlineGap }}><PokeCoinPDF size={rulesCoinSize} /><Text>20</Text></View>
                      {' • '}
                      5×<View style={{ flexDirection: 'row', alignItems: 'center', gap: rulesInlineGap }}><PokeCoinPDF size={rulesCoinSize} /><Text>10</Text></View>
                      {' • '}
                      5×<View style={{ flexDirection: 'row', alignItems: 'center', gap: rulesInlineGap }}><PokeCoinPDF size={rulesCoinSize} /><Text>5</Text></View>
                      {' • '}
                      5×<View style={{ flexDirection: 'row', alignItems: 'center', gap: rulesInlineGap }}><PokeCoinPDF size={rulesCoinSize} /><Text>1</Text></View>
                    </Text>
                  </Text>
                  </View>
                  
                  {/* Right card placeholder */}
                  <View style={styles.cardPlaceholder}>
                    <Text style={styles.cardPlaceholderText}>Oak/Bag{'\n'}Cards</Text>
                  </View>
                </View>
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
          <View style={[styles.cutLine, { left: 0, top: 0, bottom: 0, borderLeftWidth: tileLabelCutLineWidth }]} />
        )}
        {tileCol < TILE_COLS - 1 && (
          <View style={[styles.cutLine, { right: 0, top: 0, bottom: 0, borderRightWidth: tileLabelCutLineWidth }]} />
        )}
        {tileRow > 0 && (
          <View style={[styles.cutLine, { left: 0, right: 0, top: 0, borderTopWidth: tileLabelCutLineWidth }]} />
        )}
        {tileRow < TILE_ROWS - 1 && (
          <View style={[styles.cutLine, { left: 0, right: 0, bottom: 0, borderBottomWidth: tileLabelCutLineWidth }]} />
        )}

        <Text style={styles.tileLabel}>Tile {tileNumber}</Text>
      </View>

      <Text style={{ fontSize: footerFontSize, marginTop: footerMarginTop, color: '#666', textAlign: 'center' }}>
        Print at 100% scale. Cut along dashed lines. Tape edges together.
      </Text>
    </Page>
  )
}
