import { Page, View, Text, StyleSheet, Image as PDFImage } from '@react-pdf/renderer'
import type { PaperSize, BoardSpace, PropertySpace } from '@/types'
import { PAGE_DIMENSIONS } from '@/pdf/templates'
import { baseStyles, colors } from './styles'

const styles = StyleSheet.create({
  board: {
    flex: 1,
    borderWidth: 2,
    borderColor: colors.black,
    backgroundColor: colors.boardGreen,
    position: 'relative',
  },
  quadrantLabel: {
    position: 'absolute',
    fontSize: 8,
    color: '#999',
  },
  assemblyMark: {
    position: 'absolute',
    width: 20,
    height: 20,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: '#999',
  },
  space: {
    borderWidth: 1,
    borderColor: colors.black,
    backgroundColor: colors.white,
  },
  spaceRow: {
    flexDirection: 'row',
  },
  spaceCol: {
    flexDirection: 'column',
  },
  propertyHeader: {
    height: 16,
  },
  propertyBody: {
    flex: 1,
    padding: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  propertyName: {
    fontSize: 5,
    textAlign: 'center',
  },
  propertyPrice: {
    fontSize: 4,
    textAlign: 'center',
    marginTop: 2,
  },
  cornerSpace: {
    width: 60,
    height: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sideSpace: {
    width: 45,
    height: 60,
    // Will be rotated for left/right sides
  },
  pokemonSprite: {
    width: 24,
    height: 24,
    objectFit: 'contain',
  },
  cornerText: {
    fontSize: 6,
    textAlign: 'center',
  },
  cornerSubtext: {
    fontSize: 4,
    textAlign: 'center',
    marginTop: 2,
  },
  // Corner space specific styles
  cornerCell: {
    width: 60,
    height: 60,
    borderWidth: 2,
    borderColor: colors.black,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 4,
  },
  cornerIcon: {
    fontSize: 16,
    marginBottom: 2,
  },
  cornerTitle: {
    fontSize: 7,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  cornerLabel: {
    fontSize: 5,
    textAlign: 'center',
    marginTop: 2,
  },
  goArrow: {
    fontSize: 20,
    color: '#D32F2F',
  },
  jailBars: {
    width: 30,
    height: 20,
    borderWidth: 2,
    borderColor: '#5D4037',
    backgroundColor: '#FFE0B2',
    marginBottom: 2,
  },
  jailBar: {
    position: 'absolute',
    width: 2,
    height: 20,
    backgroundColor: '#5D4037',
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

interface SpaceCellProps {
  space: BoardSpace
  orientation: 'top' | 'bottom' | 'left' | 'right'
}

function SpaceCell({ space, orientation }: SpaceCellProps) {
  const capitalize = (str: string) => str.charAt(0).toUpperCase() + str.slice(1)

  const isVertical = orientation === 'left' || orientation === 'right'
  const cellStyle = isVertical
    ? { width: 60, height: 45 }
    : { width: 45, height: 60 }

  if (space.type === 'property') {
    const bgColor = colorMap[space.color] || colors.brown
    return (
      <View style={[styles.space, cellStyle]}>
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
      <View style={[styles.space, cellStyle, { backgroundColor: '#f5f5f5' }]}>
        <View style={styles.propertyBody}>
          <Text style={styles.propertyName}>{space.name}</Text>
          <Text style={styles.propertyPrice}>P{space.price}</Text>
        </View>
      </View>
    )
  }

  if (space.type === 'item-bag') {
    return (
      <View style={[styles.space, cellStyle, { backgroundColor: '#E3F2FD' }]}>
        <View style={styles.propertyBody}>
          <Text style={styles.propertyName}>ITEM</Text>
          <Text style={styles.propertyName}>BAG</Text>
        </View>
      </View>
    )
  }

  if (space.type === 'professor-oak') {
    return (
      <View style={[styles.space, cellStyle, { backgroundColor: '#E8F5E9' }]}>
        <View style={styles.propertyBody}>
          <Text style={styles.propertyName}>PROF.</Text>
          <Text style={styles.propertyName}>OAK</Text>
        </View>
      </View>
    )
  }

  if (space.type === 'grunt-ambush') {
    return (
      <View style={[styles.space, cellStyle, { backgroundColor: '#FFCDD2' }]}>
        <View style={styles.propertyBody}>
          <Text style={styles.propertyName}>GRUNT</Text>
          <Text style={styles.propertyName}>AMBUSH</Text>
          <Text style={styles.propertyPrice}>Pay P{space.amount}</Text>
        </View>
      </View>
    )
  }

  if (space.type === 'giovanni') {
    return (
      <View style={[styles.space, cellStyle, { backgroundColor: '#E1BEE7' }]}>
        <View style={styles.propertyBody}>
          <Text style={styles.propertyName}>GIOVANNI</Text>
          <Text style={styles.propertyPrice}>Pay P{space.amount}+</Text>
        </View>
      </View>
    )
  }

  // Corner: GO
  if (space.type === 'go') {
    return (
      <View style={[styles.cornerCell, { backgroundColor: '#FFCDD2' }]}>
        <Text style={styles.goArrow}>→</Text>
        <Text style={styles.cornerTitle}>GO</Text>
        <Text style={styles.cornerLabel}>Collect P200</Text>
      </View>
    )
  }

  // Corner: Jail (Team Rocket Hideout)
  if (space.type === 'jail') {
    return (
      <View style={[styles.cornerCell, { backgroundColor: '#FFE0B2' }]}>
        <View style={styles.jailBars}>
          <View style={[styles.jailBar, { left: 6 }]} />
          <View style={[styles.jailBar, { left: 14 }]} />
          <View style={[styles.jailBar, { left: 22 }]} />
        </View>
        <Text style={styles.cornerTitle}>HIDEOUT</Text>
        <Text style={styles.cornerLabel}>Just Visiting</Text>
      </View>
    )
  }

  // Corner: Free Parking
  if (space.type === 'free-parking') {
    return (
      <View style={[styles.cornerCell, { backgroundColor: '#FFF9C4' }]}>
        <Text style={[styles.cornerIcon, { color: '#F57F17' }]}>P</Text>
        <Text style={styles.cornerTitle}>FREE</Text>
        <Text style={styles.cornerTitle}>PARKING</Text>
      </View>
    )
  }

  // Corner: Go To Jail
  if (space.type === 'go-to-jail') {
    return (
      <View style={[styles.cornerCell, { backgroundColor: '#E1BEE7' }]}>
        <Text style={[styles.cornerIcon, { color: '#7B1FA2' }]}>☞</Text>
        <Text style={styles.cornerTitle}>GO TO</Text>
        <Text style={styles.cornerTitle}>HIDEOUT</Text>
      </View>
    )
  }

  return (
    <View style={[styles.space, cellStyle]}>
      <View style={styles.propertyBody}>
        <Text style={styles.propertyName}>???</Text>
      </View>
    </View>
  )
}

interface BoardPageProps {
  spaces: BoardSpace[]
  paperSize: PaperSize
  quadrant: number // 0-3 (TL, TR, BL, BR)
}

export function BoardPage({ spaces, paperSize, quadrant }: BoardPageProps) {
  // For simplicity, we'll render a simplified board representation
  // A full implementation would split the board into 4 quadrants

  const quadrantLabels = ['Top-Left', 'Top-Right', 'Bottom-Left', 'Bottom-Right']

  // Get spaces for this quadrant
  // Quadrant 0 (TL): Spaces 20-29 (top row, left half) + 10-14 (left column, top half)
  // Quadrant 1 (TR): Spaces 25-30 (top row, right half) + 30-34 (right column, top half)
  // Quadrant 2 (BL): Spaces 10-19 (left column, bottom half) + 0-4 (bottom row, left half)
  // Quadrant 3 (BR): Spaces 35-39 (right column, bottom half) + 5-9 (bottom row, right half)

  // For now, render a simplified view showing which quadrant
  return (
    <Page size={paperSize.toUpperCase() as 'LETTER' | 'A4'} style={baseStyles.page}>
      <Text style={baseStyles.title}>Game Board - {quadrantLabels[quadrant]}</Text>
      <Text style={baseStyles.subtitle}>
        Assemble all 4 quadrants to form the complete board
      </Text>

      <View style={styles.board}>
        {/* Assembly marks */}
        <View style={[styles.assemblyMark, { top: 0, left: 0 }]} />
        <View style={[styles.assemblyMark, { top: 0, right: 0 }]} />
        <View style={[styles.assemblyMark, { bottom: 0, left: 0 }]} />
        <View style={[styles.assemblyMark, { bottom: 0, right: 0 }]} />

        {/* Quadrant label */}
        <Text style={[styles.quadrantLabel, { bottom: 10, right: 10 }]}>
          Q{quadrant + 1}
        </Text>

        {/* Render relevant spaces based on quadrant */}
        <View style={{ padding: 20 }}>
          {quadrant === 0 && (
            <View>
              <Text style={{ fontSize: 8, marginBottom: 10 }}>Top Row (Left Side):</Text>
              <View style={styles.spaceRow}>
                {[20, 21, 22, 23, 24].map(i => (
                  <SpaceCell key={i} space={spaces[i]} orientation="top" />
                ))}
              </View>
              <Text style={{ fontSize: 8, marginTop: 20, marginBottom: 10 }}>Left Column (Top Half):</Text>
              <View style={styles.spaceCol}>
                {[19, 18, 17, 16, 15].map(i => (
                  <SpaceCell key={i} space={spaces[i]} orientation="left" />
                ))}
              </View>
            </View>
          )}

          {quadrant === 1 && (
            <View>
              <Text style={{ fontSize: 8, marginBottom: 10 }}>Top Row (Right Side):</Text>
              <View style={styles.spaceRow}>
                {[25, 26, 27, 28, 29, 30].map(i => (
                  <SpaceCell key={i} space={spaces[i]} orientation="top" />
                ))}
              </View>
              <Text style={{ fontSize: 8, marginTop: 20, marginBottom: 10 }}>Right Column (Top Half):</Text>
              <View style={styles.spaceCol}>
                {[31, 32, 33, 34].map(i => (
                  <SpaceCell key={i} space={spaces[i]} orientation="right" />
                ))}
              </View>
            </View>
          )}

          {quadrant === 2 && (
            <View>
              <Text style={{ fontSize: 8, marginBottom: 10 }}>Left Column (Bottom Half):</Text>
              <View style={styles.spaceCol}>
                {[14, 13, 12, 11, 10].map(i => (
                  <SpaceCell key={i} space={spaces[i]} orientation="left" />
                ))}
              </View>
              <Text style={{ fontSize: 8, marginTop: 20, marginBottom: 10 }}>Bottom Row (Left Side):</Text>
              <View style={styles.spaceRow}>
                {[9, 8, 7, 6, 5].map(i => (
                  <SpaceCell key={i} space={spaces[i]} orientation="bottom" />
                ))}
              </View>
            </View>
          )}

          {quadrant === 3 && (
            <View>
              <Text style={{ fontSize: 8, marginBottom: 10 }}>Right Column (Bottom Half):</Text>
              <View style={styles.spaceCol}>
                {[35, 36, 37, 38, 39].map(i => (
                  <SpaceCell key={i} space={spaces[i]} orientation="right" />
                ))}
              </View>
              <Text style={{ fontSize: 8, marginTop: 20, marginBottom: 10 }}>Bottom Row (Right Side):</Text>
              <View style={styles.spaceRow}>
                {[4, 3, 2, 1, 0].map(i => (
                  <SpaceCell key={i} space={spaces[i]} orientation="bottom" />
                ))}
              </View>
            </View>
          )}
        </View>
      </View>
    </Page>
  )
}
