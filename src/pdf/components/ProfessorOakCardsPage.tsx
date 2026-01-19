import { Page, View, Text, StyleSheet } from '@react-pdf/renderer'
import type { PaperSize } from '@/types'
import { PROFESSOR_OAK_CARDS } from '@/lib/cards'
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
    backgroundColor: '#E8F5E9',
    borderColor: '#388E3C',
  },
  cardHeader: {
    backgroundColor: '#388E3C',
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

interface ProfessorOakCardsPageProps {
  paperSize: PaperSize
}

export function ProfessorOakCardsPage({ paperSize }: ProfessorOakCardsPageProps) {
  return (
    <Page size={paperSize.toUpperCase() as 'LETTER' | 'A4'} style={baseStyles.page}>
      <Text style={baseStyles.title}>Professor Oak Cards</Text>
      <Text style={baseStyles.subtitle}>Cut along the lines</Text>
      <View style={styles.grid}>
        {PROFESSOR_OAK_CARDS.map((card) => (
          <View key={card.id} style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.headerText}>PROFESSOR OAK</Text>
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
