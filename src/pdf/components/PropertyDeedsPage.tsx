import { Page, View, Text, Image, StyleSheet } from '@react-pdf/renderer'
import type { PaperSize, PropertySpace, GymSpace, CardSize } from '@/types'
import { CARD_SIZE_MULTIPLIERS, PAPER_DIMENSIONS } from '@/types/board'
import { colors, baseStyles, deedStyles, toAbsoluteSpriteUrl } from './styles'
import { getGymImage } from '@/components/board/spaceSprites'
import { PokeCoinPDF } from '@/components/ui/PokeCoin'

const DEED_BASE_WIDTH = 144
const DEED_BASE_HEIGHT = 126
const LEGACY_DEED_HEIGHT = 180
const DEED_CONTENT_SCALE_RATIO = DEED_BASE_HEIGHT / LEGACY_DEED_HEIGHT
const DEED_BASE_SPRITE_SIZE = 40
const DEED_BASE_MARGIN = 4
const PAGE_PADDING = 36 * 2
const TITLE_HEIGHT = 40
const SAFETY_BUFFER = 4

export function getDeedContentScale(cardSize: CardSize) {
  return CARD_SIZE_MULTIPLIERS[cardSize] * DEED_CONTENT_SCALE_RATIO
}

function calculateItemsPerPage(
  paperSize: PaperSize,
  itemWidth: number,
  itemHeight: number,
  itemMargin: number
) {
  const pageHeight = PAPER_DIMENSIONS[paperSize].height
  const pageWidth = PAPER_DIMENSIONS[paperSize].width
  const availableHeight = pageHeight - PAGE_PADDING - TITLE_HEIGHT - SAFETY_BUFFER
  const availableWidth = pageWidth - PAGE_PADDING - SAFETY_BUFFER

  const itemTotalWidth = itemWidth + itemMargin * 2
  const itemTotalHeight = itemHeight + itemMargin * 2

  const itemsPerRow = Math.floor(availableWidth / itemTotalWidth)
  const rowsPerPage = Math.floor(availableHeight / itemTotalHeight)

  return Math.max(1, itemsPerRow * rowsPerPage)
}

export function getDeedItemsPerPage(paperSize: PaperSize, cardSize: CardSize) {
  const sizeScale = CARD_SIZE_MULTIPLIERS[cardSize]
  const contentScale = getDeedContentScale(cardSize)
  const itemWidth = DEED_BASE_WIDTH * sizeScale
  const itemHeight = DEED_BASE_HEIGHT * sizeScale
  const itemMargin = DEED_BASE_MARGIN * contentScale

  return calculateItemsPerPage(paperSize, itemWidth, itemHeight, itemMargin)
}

function getDeedStyles(cardSize: CardSize) {
  const sizeScale = CARD_SIZE_MULTIPLIERS[cardSize]
  const contentScale = getDeedContentScale(cardSize)

  return StyleSheet.create({
    grid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'center',
      alignContent: 'flex-start',
    },
    spriteContainer: {
      alignItems: 'center',
      marginBottom: 4 * contentScale,
    },
    sprite: {
      width: DEED_BASE_SPRITE_SIZE * contentScale,
      height: DEED_BASE_SPRITE_SIZE * contentScale,
      objectFit: 'contain',
    },
    deed: {
      width: DEED_BASE_WIDTH * sizeScale,
      height: DEED_BASE_HEIGHT * sizeScale,
      borderWidth: 2,
      borderColor: colors.black,
      backgroundColor: colors.white,
      margin: DEED_BASE_MARGIN * contentScale,
    },
  })
}

interface PropertyDeedProps {
  property: PropertySpace
  cardSize: CardSize
}

function PropertyDeed({ property, cardSize }: PropertyDeedProps) {
  const colorHex = colors[property.color] || colors.brown
  const capitalize = (str: string) => str.charAt(0).toUpperCase() + str.slice(1)
  const contentScale = getDeedContentScale(cardSize)
  const deedStylesScaled = getDeedStyles(cardSize)

  return (
    <View style={deedStylesScaled.deed} wrap={false}>
      <View style={[deedStyles.deedHeader, { backgroundColor: colorHex, height: 24 * contentScale }]}>
        <Text style={[deedStyles.deedTitle, { fontSize: 6 * contentScale }]}>TITLE DEED</Text>
      </View>
      <View style={[deedStyles.deedBody, { padding: 6 * contentScale }]}>
        {property.pokemon?.sprite && (
          <View style={deedStylesScaled.spriteContainer}>
            <Image src={toAbsoluteSpriteUrl(property.pokemon.sprite)} style={deedStylesScaled.sprite} />
          </View>
        )}
        <Text style={[deedStyles.deedName, { fontSize: 7 * contentScale, marginBottom: 6 * contentScale }]}>
          {property.pokemon ? capitalize(property.pokemon.name) : 'Unknown'}
        </Text>
        <View style={[deedStyles.deedPrice, { fontSize: 6 * contentScale, marginBottom: 8 * contentScale, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }]}>
          <Text>Price: </Text>
          <PokeCoinPDF size={6 * contentScale} />
          <Text>{property.price}</Text>
        </View>

        <View style={[deedStyles.rentRow, { marginBottom: 2 * contentScale }]}>
          <Text style={[deedStyles.rentLabel, { fontSize: 5 * contentScale }]}>Rent</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <PokeCoinPDF size={5 * contentScale} />
            <Text style={[deedStyles.rentValue, { fontSize: 5 * contentScale }]}>{property.rent[0]}</Text>
          </View>
        </View>
        <View style={[deedStyles.rentRow, { marginBottom: 2 * contentScale }]}>
          <Text style={[deedStyles.rentLabel, { fontSize: 5 * contentScale }]}>With 1 Gym Badge</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <PokeCoinPDF size={5 * contentScale} />
            <Text style={[deedStyles.rentValue, { fontSize: 5 * contentScale }]}>{property.rent[1]}</Text>
          </View>
        </View>
        <View style={[deedStyles.rentRow, { marginBottom: 2 * contentScale }]}>
          <Text style={[deedStyles.rentLabel, { fontSize: 5 * contentScale }]}>With 2 Gym Badges</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <PokeCoinPDF size={5 * contentScale} />
            <Text style={[deedStyles.rentValue, { fontSize: 5 * contentScale }]}>{property.rent[2]}</Text>
          </View>
        </View>
        <View style={[deedStyles.rentRow, { marginBottom: 2 * contentScale }]}>
          <Text style={[deedStyles.rentLabel, { fontSize: 5 * contentScale }]}>With 3 Gym Badges</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <PokeCoinPDF size={5 * contentScale} />
            <Text style={[deedStyles.rentValue, { fontSize: 5 * contentScale }]}>{property.rent[3]}</Text>
          </View>
        </View>
        <View style={[deedStyles.rentRow, { marginBottom: 2 * contentScale }]}>
          <Text style={[deedStyles.rentLabel, { fontSize: 5 * contentScale }]}>With 4 Gym Badges</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <PokeCoinPDF size={5 * contentScale} />
            <Text style={[deedStyles.rentValue, { fontSize: 5 * contentScale }]}>{property.rent[4]}</Text>
          </View>
        </View>
        <View style={[deedStyles.rentRow, { marginBottom: 2 * contentScale }]}>
          <Text style={[deedStyles.rentLabel, { fontSize: 5 * contentScale }]}>League Badge</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <PokeCoinPDF size={5 * contentScale} />
            <Text style={[deedStyles.rentValue, { fontSize: 5 * contentScale }]}>{property.rent[5]}</Text>
          </View>
        </View>

        <View style={{ marginTop: 8 * contentScale, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
          <Text style={[deedStyles.rentLabel, { textAlign: 'center', fontSize: 5 * contentScale }]}>Gym Badge Cost: </Text>
          <PokeCoinPDF size={5 * contentScale} />
          <Text style={[deedStyles.rentLabel, { textAlign: 'center', fontSize: 5 * contentScale }]}>{property.houseCost}</Text>
        </View>

        {property.pokemon && (
          <View style={{ marginTop: 4 * contentScale }}>
            <Text style={[deedStyles.rentLabel, { textAlign: 'center', fontSize: 5 * contentScale }]}>
              BST: {property.pokemon.bst}
            </Text>
          </View>
        )}
      </View>
    </View>
  )
}

interface GymDeedProps {
  gym: GymSpace
  cardSize: CardSize
}

function GymDeed({ gym, cardSize }: GymDeedProps) {
  const gymImage = getGymImage(gym.name)
  const contentScale = getDeedContentScale(cardSize)
  const deedStylesScaled = getDeedStyles(cardSize)
  
  return (
    <View style={deedStylesScaled.deed} wrap={false}>
      <View style={[deedStyles.deedHeader, { backgroundColor: '#E8E8E8', height: 24 * contentScale }]}>
        <Text style={[deedStyles.deedTitle, { color: colors.black, fontSize: 6 * contentScale }]}>GYM DEED</Text>
      </View>
      <View style={[deedStyles.deedBody, { padding: 6 * contentScale }]}>
        {gymImage && (
          <View style={deedStylesScaled.spriteContainer}>
            <Image src={gymImage} style={deedStylesScaled.sprite} />
          </View>
        )}
        <Text style={[deedStyles.deedName, { fontSize: 7 * contentScale, marginBottom: 6 * contentScale }]}>{gym.name}</Text>
        <View style={[deedStyles.deedPrice, { fontSize: 6 * contentScale, marginBottom: 8 * contentScale, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }]}>
          <Text>Price: </Text>
          <PokeCoinPDF size={6 * contentScale} />
          <Text>{gym.price}</Text>
        </View>

        <View style={{ marginTop: 8 * contentScale }}>
          <Text style={[deedStyles.rentLabel, { textAlign: 'center', fontWeight: 'bold', fontSize: 5 * contentScale }]}>
            Rent (per Gym owned):
          </Text>
        </View>
        <View style={[deedStyles.rentRow, { marginBottom: 2 * contentScale }]}>
          <Text style={[deedStyles.rentLabel, { fontSize: 5 * contentScale }]}>1 Gym</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <PokeCoinPDF size={5 * contentScale} />
            <Text style={[deedStyles.rentValue, { fontSize: 5 * contentScale }]}>25</Text>
          </View>
        </View>
        <View style={[deedStyles.rentRow, { marginBottom: 2 * contentScale }]}>
          <Text style={[deedStyles.rentLabel, { fontSize: 5 * contentScale }]}>2 Gyms</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <PokeCoinPDF size={5 * contentScale} />
            <Text style={[deedStyles.rentValue, { fontSize: 5 * contentScale }]}>50</Text>
          </View>
        </View>
        <View style={[deedStyles.rentRow, { marginBottom: 2 * contentScale }]}>
          <Text style={[deedStyles.rentLabel, { fontSize: 5 * contentScale }]}>3 Gyms</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <PokeCoinPDF size={5 * contentScale} />
            <Text style={[deedStyles.rentValue, { fontSize: 5 * contentScale }]}>100</Text>
          </View>
        </View>
        <View style={[deedStyles.rentRow, { marginBottom: 2 * contentScale }]}>
          <Text style={[deedStyles.rentLabel, { fontSize: 5 * contentScale }]}>4 Gyms</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <PokeCoinPDF size={5 * contentScale} />
            <Text style={[deedStyles.rentValue, { fontSize: 5 * contentScale }]}>200</Text>
          </View>
        </View>
      </View>
    </View>
  )
}

interface PropertyDeedsPageProps {
  properties: PropertySpace[]
  gyms: GymSpace[]
  paperSize: PaperSize
  cardSize: CardSize
  pageNumber: number
}

export function PropertyDeedsPage({ properties, gyms, paperSize, cardSize, pageNumber }: PropertyDeedsPageProps) {
  const itemsPerPage = getDeedItemsPerPage(paperSize, cardSize)
  const deedStylesScaled = getDeedStyles(cardSize)

  // Combine properties and gyms
  const allDeeds: Array<{ type: 'property' | 'gym'; data: PropertySpace | GymSpace }> = [
    ...properties.map(p => ({ type: 'property' as const, data: p })),
    ...gyms.map(g => ({ type: 'gym' as const, data: g }))
  ]

  const startIndex = pageNumber * itemsPerPage
  const pageDeeds = allDeeds.slice(startIndex, startIndex + itemsPerPage)

  return (
    <Page size={paperSize.toUpperCase() as 'LETTER' | 'A4'} style={baseStyles.page}>
      <Text style={baseStyles.title}>Property & Gym Deeds - Page {pageNumber + 1}</Text>
      <View style={deedStylesScaled.grid}>
        {pageDeeds.map((deed, index) => (
          deed.type === 'property' ? (
            <PropertyDeed key={`prop-${startIndex + index}`} property={deed.data as PropertySpace} cardSize={cardSize} />
          ) : (
            <GymDeed key={`gym-${startIndex + index}`} gym={deed.data as GymSpace} cardSize={cardSize} />
          )
        ))}
      </View>
    </Page>
  )
}
