import { Page, View, Text, StyleSheet } from '@react-pdf/renderer'
import type { PaperSize, CardSize } from '@/types'
import { CARD_SIZE_MULTIPLIERS, PAPER_DIMENSIONS } from '@/types/board'
import { ITEM_BAG_CARDS } from '@/lib/cards'
import { baseStyles, cardStyles, colors } from './styles'

interface ItemBagCardsPageProps {
  paperSize: PaperSize
  cardSize: CardSize
  pageNumber?: number
}

function calculateItemsPerPage(
  paperSize: PaperSize,
  cardSize: CardSize,
  itemWidth: number,
  itemHeight: number,
  itemMargin: number
) {
  const pageHeight = PAPER_DIMENSIONS[paperSize].height
  const pageWidth = PAPER_DIMENSIONS[paperSize].width
  const pagePadding = 36 * 2 // top + bottom
  const titleHeight = 40 // approximate title + subtitle height
  const availableHeight = pageHeight - pagePadding - titleHeight
  const availableWidth = pageWidth - pagePadding

  const itemTotalWidth = itemWidth + itemMargin * 2
  const itemTotalHeight = itemHeight + itemMargin * 2

  const itemsPerRow = Math.floor(availableWidth / itemTotalWidth)
  const rowsPerPage = Math.floor(availableHeight / itemTotalHeight)

  return Math.max(1, itemsPerRow * rowsPerPage)
}

function getCardStyles(cardSize: CardSize) {
  const multiplier = CARD_SIZE_MULTIPLIERS[cardSize]
  const baseWidth = 180
  const baseHeight = 100
  const basePadding = 6
  const baseMargin = 4
  const baseHeaderFont = 6
  const baseTitleFont = 7
  const baseDescFont = 5
  const baseEffectFont = 5

  return StyleSheet.create({
    grid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'center',
      alignContent: 'flex-start',
    },
    card: {
      width: baseWidth * multiplier,
      height: baseHeight * multiplier,
      borderWidth: 2,
      borderColor: '#1976D2',
      backgroundColor: '#E3F2FD',
      padding: basePadding * multiplier,
      margin: baseMargin * multiplier,
    },
    cardHeader: {
      backgroundColor: '#1976D2',
      margin: -basePadding * multiplier,
      marginBottom: 4 * multiplier,
      padding: 4 * multiplier,
    },
    headerText: {
      fontSize: baseHeaderFont * multiplier,
      color: colors.white,
      textAlign: 'center',
      fontWeight: 'bold',
    },
    cardTitle: {
      fontSize: baseTitleFont * multiplier,
      textAlign: 'center',
      marginBottom: 4 * multiplier,
      fontWeight: 'bold',
    },
    cardDescription: {
      fontSize: baseDescFont * multiplier,
      textAlign: 'center',
      marginBottom: 4 * multiplier,
      fontStyle: 'normal',
    },
    cardEffect: {
      fontSize: baseEffectFont * multiplier,
      textAlign: 'center',
    },
  })
}

export function ItemBagCardsPage({ paperSize, cardSize, pageNumber = 0 }: ItemBagCardsPageProps) {
  const styles = getCardStyles(cardSize)
  const multiplier = CARD_SIZE_MULTIPLIERS[cardSize]
  const baseWidth = 180
  const baseHeight = 100
  const baseMargin = 4

  const itemWidth = baseWidth * multiplier
  const itemHeight = baseHeight * multiplier
  const itemMargin = baseMargin * multiplier

  const itemsPerPage = calculateItemsPerPage(paperSize, cardSize, itemWidth, itemHeight, itemMargin)
  const startIndex = pageNumber * itemsPerPage
  const endIndex = Math.min(startIndex + itemsPerPage, ITEM_BAG_CARDS.length)
  const pageCards = ITEM_BAG_CARDS.slice(startIndex, endIndex)

  if (pageCards.length === 0) {
    return null
  }
  
  return (
    <Page size={paperSize.toUpperCase() as 'LETTER' | 'A4'} style={baseStyles.page}>
      <Text style={baseStyles.title}>Item Bag Cards{ITEM_BAG_CARDS.length > itemsPerPage ? ` - Page ${pageNumber + 1}` : ''}</Text>
      <Text style={baseStyles.subtitle}>Cut along the lines</Text>
      <View style={styles.grid}>
        {pageCards.map((card) => (
          <View key={card.id} style={styles.card} break={false}>
            <View style={styles.cardHeader}>
              <Text style={styles.headerText}>ITEM BAG</Text>
            </View>
            <Text style={styles.cardTitle}>{card.name}</Text>
            <Text style={styles.cardDescription}>"{card.description}"</Text>
            <Text style={styles.cardEffect}>{card.effect}</Text>
          </View>
        ))}
      </View>
    </Page>
  )
}
