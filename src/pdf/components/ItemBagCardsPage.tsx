import { Page, View, Text, StyleSheet } from '@react-pdf/renderer'
import type { PaperSize } from '@/types'
import { ITEM_BAG_CARDS } from '@/lib/cards'
import { baseStyles, cardStyles, colors } from './styles'

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignContent: 'flex-start',
  },
  card: {
    ...cardStyles.card,
    backgroundColor: '#E3F2FD',
    borderColor: '#1976D2',
  },
  cardHeader: {
    backgroundColor: '#1976D2',
    margin: -6,
    marginBottom: 4,
    padding: 4,
  },
  headerText: {
    fontSize: 6,
    color: colors.white,
    textAlign: 'center',
    fontWeight: 'bold',
  },
})

interface ItemBagCardsPageProps {
  paperSize: PaperSize
}

export function ItemBagCardsPage({ paperSize }: ItemBagCardsPageProps) {
  return (
    <Page size={paperSize.toUpperCase() as 'LETTER' | 'A4'} style={baseStyles.page}>
      <Text style={baseStyles.title}>Item Bag Cards</Text>
      <Text style={baseStyles.subtitle}>Cut along the lines</Text>
      <View style={styles.grid}>
        {ITEM_BAG_CARDS.map((card) => (
          <View key={card.id} style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.headerText}>ITEM BAG</Text>
            </View>
            <Text style={cardStyles.cardTitle}>{card.name}</Text>
            <Text style={cardStyles.cardDescription}>"{card.description}"</Text>
            <Text style={cardStyles.cardEffect}>{card.effect}</Text>
          </View>
        ))}
      </View>
    </Page>
  )
}
