import { Page, View, Text, Image, StyleSheet } from '@react-pdf/renderer'
import type { PaperSize, BoardSpace, PropertySpace, GymSpace, CardSize } from '@/types'
import { CARD_SIZE_MULTIPLIERS } from '@/types/board'
import { PAGE_DIMENSIONS } from '@/pdf/templates'
import { colors, baseStyles, deedStyles } from './styles'
import { getGymImage } from '@/components/board/spaceSprites'

function getDeedStyles(cardSize: CardSize) {
  const multiplier = CARD_SIZE_MULTIPLIERS[cardSize]
  const baseWidth = 120
  const baseHeight = 180
  const baseSpriteSize = 40
  const baseMargin = 4

  return StyleSheet.create({
    grid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'center',
      alignContent: 'flex-start',
    },
    spriteContainer: {
      alignItems: 'center',
      marginBottom: 4 * multiplier,
    },
    sprite: {
      width: baseSpriteSize * multiplier,
      height: baseSpriteSize * multiplier,
      objectFit: 'contain',
    },
    deed: {
      width: baseWidth * multiplier,
      height: baseHeight * multiplier,
      borderWidth: 2,
      borderColor: colors.black,
      backgroundColor: colors.white,
      margin: baseMargin * multiplier,
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
  const multiplier = CARD_SIZE_MULTIPLIERS[cardSize]
  const deedStylesScaled = getDeedStyles(cardSize)

  return (
    <View style={deedStylesScaled.deed}>
      <View style={[deedStyles.deedHeader, { backgroundColor: colorHex, height: 24 * multiplier }]}>
        <Text style={[deedStyles.deedTitle, { fontSize: 6 * multiplier }]}>TITLE DEED</Text>
      </View>
      <View style={[deedStyles.deedBody, { padding: 6 * multiplier }]}>
        {property.pokemon?.sprite && (
          <View style={deedStylesScaled.spriteContainer}>
            <Image src={property.pokemon.sprite} style={deedStylesScaled.sprite} />
          </View>
        )}
        <Text style={[deedStyles.deedName, { fontSize: 7 * multiplier, marginBottom: 6 * multiplier }]}>
          {property.pokemon ? capitalize(property.pokemon.name) : 'Unknown'}
        </Text>
        <Text style={[deedStyles.deedPrice, { fontSize: 6 * multiplier, marginBottom: 8 * multiplier }]}>Price: P{property.price}</Text>

        <View style={[deedStyles.rentRow, { marginBottom: 2 * multiplier }]}>
          <Text style={[deedStyles.rentLabel, { fontSize: 5 * multiplier }]}>Rent</Text>
          <Text style={[deedStyles.rentValue, { fontSize: 5 * multiplier }]}>P{property.rent[0]}</Text>
        </View>
        <View style={[deedStyles.rentRow, { marginBottom: 2 * multiplier }]}>
          <Text style={[deedStyles.rentLabel, { fontSize: 5 * multiplier }]}>With 1 Berry</Text>
          <Text style={[deedStyles.rentValue, { fontSize: 5 * multiplier }]}>P{property.rent[1]}</Text>
        </View>
        <View style={[deedStyles.rentRow, { marginBottom: 2 * multiplier }]}>
          <Text style={[deedStyles.rentLabel, { fontSize: 5 * multiplier }]}>With 2 Berries</Text>
          <Text style={[deedStyles.rentValue, { fontSize: 5 * multiplier }]}>P{property.rent[2]}</Text>
        </View>
        <View style={[deedStyles.rentRow, { marginBottom: 2 * multiplier }]}>
          <Text style={[deedStyles.rentLabel, { fontSize: 5 * multiplier }]}>With 3 Berries</Text>
          <Text style={[deedStyles.rentValue, { fontSize: 5 * multiplier }]}>P{property.rent[3]}</Text>
        </View>
        <View style={[deedStyles.rentRow, { marginBottom: 2 * multiplier }]}>
          <Text style={[deedStyles.rentLabel, { fontSize: 5 * multiplier }]}>With 4 Berries</Text>
          <Text style={[deedStyles.rentValue, { fontSize: 5 * multiplier }]}>P{property.rent[4]}</Text>
        </View>
        <View style={[deedStyles.rentRow, { marginBottom: 2 * multiplier }]}>
          <Text style={[deedStyles.rentLabel, { fontSize: 5 * multiplier }]}>Evolution Stone</Text>
          <Text style={[deedStyles.rentValue, { fontSize: 5 * multiplier }]}>P{property.rent[5]}</Text>
        </View>

        <View style={{ marginTop: 8 * multiplier }}>
          <Text style={[deedStyles.rentLabel, { textAlign: 'center', fontSize: 5 * multiplier }]}>
            Berry Cost: P{property.houseCost}
          </Text>
        </View>

        {property.pokemon && (
          <View style={{ marginTop: 4 * multiplier }}>
            <Text style={[deedStyles.rentLabel, { textAlign: 'center', fontSize: 5 * multiplier }]}>
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
  const multiplier = CARD_SIZE_MULTIPLIERS[cardSize]
  const deedStylesScaled = getDeedStyles(cardSize)
  
  return (
    <View style={deedStylesScaled.deed}>
      <View style={[deedStyles.deedHeader, { backgroundColor: '#E8E8E8', height: 24 * multiplier }]}>
        <Text style={[deedStyles.deedTitle, { color: colors.black, fontSize: 6 * multiplier }]}>GYM DEED</Text>
      </View>
      <View style={[deedStyles.deedBody, { padding: 6 * multiplier }]}>
        {gymImage && (
          <View style={deedStylesScaled.spriteContainer}>
            <Image src={gymImage} style={deedStylesScaled.sprite} />
          </View>
        )}
        <Text style={[deedStyles.deedName, { fontSize: 7 * multiplier, marginBottom: 6 * multiplier }]}>{gym.name}</Text>
        <Text style={[deedStyles.deedPrice, { fontSize: 6 * multiplier, marginBottom: 8 * multiplier }]}>Price: P{gym.price}</Text>

        <View style={{ marginTop: 8 * multiplier }}>
          <Text style={[deedStyles.rentLabel, { textAlign: 'center', fontWeight: 'bold', fontSize: 5 * multiplier }]}>
            Rent (per Gym owned):
          </Text>
        </View>
        <View style={[deedStyles.rentRow, { marginBottom: 2 * multiplier }]}>
          <Text style={[deedStyles.rentLabel, { fontSize: 5 * multiplier }]}>1 Gym</Text>
          <Text style={[deedStyles.rentValue, { fontSize: 5 * multiplier }]}>P25</Text>
        </View>
        <View style={[deedStyles.rentRow, { marginBottom: 2 * multiplier }]}>
          <Text style={[deedStyles.rentLabel, { fontSize: 5 * multiplier }]}>2 Gyms</Text>
          <Text style={[deedStyles.rentValue, { fontSize: 5 * multiplier }]}>P50</Text>
        </View>
        <View style={[deedStyles.rentRow, { marginBottom: 2 * multiplier }]}>
          <Text style={[deedStyles.rentLabel, { fontSize: 5 * multiplier }]}>3 Gyms</Text>
          <Text style={[deedStyles.rentValue, { fontSize: 5 * multiplier }]}>P100</Text>
        </View>
        <View style={[deedStyles.rentRow, { marginBottom: 2 * multiplier }]}>
          <Text style={[deedStyles.rentLabel, { fontSize: 5 * multiplier }]}>4 Gyms</Text>
          <Text style={[deedStyles.rentValue, { fontSize: 5 * multiplier }]}>P200</Text>
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
  const dims = PAGE_DIMENSIONS[paperSize]
  const multiplier = CARD_SIZE_MULTIPLIERS[cardSize]
  const baseItemsPerPage = 10
  // Adjust items per page based on card size (larger cards = fewer per page)
  const itemsPerPage = Math.max(1, Math.floor(baseItemsPerPage / multiplier))
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
