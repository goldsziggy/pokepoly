import { Page, View, Text, Image, StyleSheet } from '@react-pdf/renderer'
import type { PaperSize, BoardSpace, PropertySpace } from '@/types'
import { PAGE_DIMENSIONS } from '@/pdf/templates'
import { colors, baseStyles, deedStyles } from './styles'

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignContent: 'flex-start',
  },
  spriteContainer: {
    alignItems: 'center',
    marginBottom: 4,
  },
  sprite: {
    width: 40,
    height: 40,
    objectFit: 'contain',
  },
})

interface PropertyDeedProps {
  property: PropertySpace
}

function PropertyDeed({ property }: PropertyDeedProps) {
  const colorHex = colors[property.color] || colors.brown
  const capitalize = (str: string) => str.charAt(0).toUpperCase() + str.slice(1)

  return (
    <View style={deedStyles.deed}>
      <View style={[deedStyles.deedHeader, { backgroundColor: colorHex }]}>
        <Text style={deedStyles.deedTitle}>TITLE DEED</Text>
      </View>
      <View style={deedStyles.deedBody}>
        {property.pokemon?.sprite && (
          <View style={styles.spriteContainer}>
            <Image src={property.pokemon.sprite} style={styles.sprite} />
          </View>
        )}
        <Text style={deedStyles.deedName}>
          {property.pokemon ? capitalize(property.pokemon.name) : 'Unknown'}
        </Text>
        <Text style={deedStyles.deedPrice}>Price: P{property.price}</Text>

        <View style={deedStyles.rentRow}>
          <Text style={deedStyles.rentLabel}>Rent</Text>
          <Text style={deedStyles.rentValue}>P{property.rent[0]}</Text>
        </View>
        <View style={deedStyles.rentRow}>
          <Text style={deedStyles.rentLabel}>With 1 Berry</Text>
          <Text style={deedStyles.rentValue}>P{property.rent[1]}</Text>
        </View>
        <View style={deedStyles.rentRow}>
          <Text style={deedStyles.rentLabel}>With 2 Berries</Text>
          <Text style={deedStyles.rentValue}>P{property.rent[2]}</Text>
        </View>
        <View style={deedStyles.rentRow}>
          <Text style={deedStyles.rentLabel}>With 3 Berries</Text>
          <Text style={deedStyles.rentValue}>P{property.rent[3]}</Text>
        </View>
        <View style={deedStyles.rentRow}>
          <Text style={deedStyles.rentLabel}>With 4 Berries</Text>
          <Text style={deedStyles.rentValue}>P{property.rent[4]}</Text>
        </View>
        <View style={deedStyles.rentRow}>
          <Text style={deedStyles.rentLabel}>Evolution Stone</Text>
          <Text style={deedStyles.rentValue}>P{property.rent[5]}</Text>
        </View>

        <View style={{ marginTop: 8 }}>
          <Text style={[deedStyles.rentLabel, { textAlign: 'center' }]}>
            Berry Cost: P{property.houseCost}
          </Text>
        </View>

        {property.pokemon && (
          <View style={{ marginTop: 4 }}>
            <Text style={[deedStyles.rentLabel, { textAlign: 'center' }]}>
              BST: {property.pokemon.bst}
            </Text>
          </View>
        )}
      </View>
    </View>
  )
}

interface PropertyDeedsPageProps {
  properties: PropertySpace[]
  paperSize: PaperSize
  pageNumber: number
}

export function PropertyDeedsPage({ properties, paperSize, pageNumber }: PropertyDeedsPageProps) {
  const dims = PAGE_DIMENSIONS[paperSize]
  const itemsPerPage = 10

  const startIndex = pageNumber * itemsPerPage
  const pageProperties = properties.slice(startIndex, startIndex + itemsPerPage)

  return (
    <Page size={paperSize.toUpperCase() as 'LETTER' | 'A4'} style={baseStyles.page}>
      <Text style={baseStyles.title}>Property Deeds - Page {pageNumber + 1}</Text>
      <View style={styles.grid}>
        {pageProperties.map((prop, index) => (
          <PropertyDeed key={startIndex + index} property={prop} />
        ))}
      </View>
    </Page>
  )
}
