import { Page, View, Text, StyleSheet } from '@react-pdf/renderer'
import type { PaperSize, CardSize } from '@/types'
import { CARD_SIZE_MULTIPLIERS, PAPER_DIMENSIONS } from '@/types/board'
import { PROFESSOR_OAK_CARDS } from '@/lib/cards'
import { baseStyles, colors } from './styles'
import { PokeCoinPDF } from '@/components/ui/PokeCoin'

interface ProfessorOakCardsPageProps {
  paperSize: PaperSize
  cardSize: CardSize
  pageNumber?: number
}

const CARD_BASE_WIDTH = 144
const CARD_BASE_HEIGHT = 84
const LEGACY_CARD_HEIGHT = 100
const CARD_CONTENT_SCALE_RATIO = CARD_BASE_HEIGHT / LEGACY_CARD_HEIGHT
const BASE_PADDING = 6
const BASE_MARGIN = 4
const BASE_HEADER_FONT = 6
const BASE_TITLE_FONT = 7
const BASE_DESC_FONT = 5
const BASE_EFFECT_FONT = 5
const SAFETY_BUFFER = 4

function calculateItemsPerPage(
  paperSize: PaperSize,
  itemWidth: number,
  itemHeight: number,
  itemMargin: number
) {
  const pageHeight = PAPER_DIMENSIONS[paperSize].height
  const pageWidth = PAPER_DIMENSIONS[paperSize].width
  const pagePadding = 36 * 2 // top + bottom
  const titleHeight = 40 // approximate title + subtitle height
  const availableHeight = pageHeight - pagePadding - titleHeight - SAFETY_BUFFER
  const availableWidth = pageWidth - pagePadding - SAFETY_BUFFER

  const itemTotalWidth = itemWidth + itemMargin * 2
  const itemTotalHeight = itemHeight + itemMargin * 2

  const itemsPerRow = Math.floor(availableWidth / itemTotalWidth)
  const rowsPerPage = Math.floor(availableHeight / itemTotalHeight)

  return Math.max(1, itemsPerRow * rowsPerPage)
}

function getCardStyles(cardSize: CardSize) {
  const sizeScale = CARD_SIZE_MULTIPLIERS[cardSize]
  const contentScale = sizeScale * CARD_CONTENT_SCALE_RATIO

  return StyleSheet.create({
    grid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'center',
      alignContent: 'flex-start',
    },
    card: {
      width: CARD_BASE_WIDTH * sizeScale,
      height: CARD_BASE_HEIGHT * sizeScale,
      borderWidth: 2,
      borderColor: '#388E3C',
      backgroundColor: '#E8F5E9',
      padding: BASE_PADDING * contentScale,
      margin: BASE_MARGIN * contentScale,
    },
    cardHeader: {
      backgroundColor: '#388E3C',
      margin: -BASE_PADDING * contentScale,
      marginBottom: 4 * contentScale,
      padding: 4 * contentScale,
    },
    headerText: {
      fontSize: BASE_HEADER_FONT * contentScale,
      color: colors.white,
      textAlign: 'center',
      fontWeight: 'bold',
    },
    cardTitle: {
      fontSize: BASE_TITLE_FONT * contentScale,
      textAlign: 'center',
      marginBottom: 4 * contentScale,
      fontWeight: 'bold',
    },
    cardDescription: {
      fontSize: BASE_DESC_FONT * contentScale,
      textAlign: 'center',
      marginBottom: 4 * contentScale,
      fontStyle: 'normal',
    },
    cardEffect: {
      fontSize: BASE_EFFECT_FONT * contentScale,
      textAlign: 'center',
    },
    effectRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      flexWrap: 'wrap',
    },
    effectText: {
      fontSize: BASE_EFFECT_FONT * contentScale,
    },
  })
}

// Helper function to render text with PokeCoin symbols
function renderEffectWithCoins(effect: string, coinSize: number, textStyle: any) {
  // Match ₽ followed by numbers
  const parts: Array<{ type: 'text' | 'coin'; value: string }> = []
  const regex = /₽(\d+)/g
  let lastIndex = 0
  let match

  while ((match = regex.exec(effect)) !== null) {
    // Add text before the match
    if (match.index > lastIndex) {
      parts.push({ type: 'text', value: effect.substring(lastIndex, match.index) })
    }
    // Add coin with amount
    parts.push({ type: 'coin', value: match[1] })
    lastIndex = regex.lastIndex
  }
  
  // Add remaining text
  if (lastIndex < effect.length) {
    parts.push({ type: 'text', value: effect.substring(lastIndex) })
  }

  // If no matches, return original text
  if (parts.length === 0) {
    return <Text style={textStyle}>{effect}</Text>
  }

  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', flexWrap: 'wrap' }}>
      {parts.map((part, index) => {
        if (part.type === 'coin') {
          return (
            <View key={index} style={{ flexDirection: 'row', alignItems: 'center', marginHorizontal: 1 }}>
              <PokeCoinPDF size={coinSize} />
              <Text style={textStyle}>{part.value}</Text>
            </View>
          )
        }
        return <Text key={index} style={textStyle}>{part.value}</Text>
      })}
    </View>
  )
}

export function ProfessorOakCardsPage({ paperSize, cardSize, pageNumber = 0 }: ProfessorOakCardsPageProps) {
  const styles = getCardStyles(cardSize)
  const sizeScale = CARD_SIZE_MULTIPLIERS[cardSize]
  const contentScale = sizeScale * CARD_CONTENT_SCALE_RATIO

  const itemWidth = CARD_BASE_WIDTH * sizeScale
  const itemHeight = CARD_BASE_HEIGHT * sizeScale
  const itemMargin = BASE_MARGIN * contentScale

  const itemsPerPage = calculateItemsPerPage(paperSize, itemWidth, itemHeight, itemMargin)
  const startIndex = pageNumber * itemsPerPage
  const endIndex = Math.min(startIndex + itemsPerPage, PROFESSOR_OAK_CARDS.length)
  const pageCards = PROFESSOR_OAK_CARDS.slice(startIndex, endIndex)

  if (pageCards.length === 0) {
    return null
  }
  
  return (
    <Page size={paperSize.toUpperCase() as 'LETTER' | 'A4'} style={baseStyles.page}>
      <Text style={baseStyles.title}>Professor Oak Cards{PROFESSOR_OAK_CARDS.length > itemsPerPage ? ` - Page ${pageNumber + 1}` : ''}</Text>
      <Text style={baseStyles.subtitle}>Cut along the lines</Text>
      <View style={styles.grid}>
        {pageCards.map((card) => (
          <View key={card.id} style={styles.card} break={false} wrap={false}>
            <View style={styles.cardHeader}>
              <Text style={styles.headerText}>PROFESSOR OAK</Text>
            </View>
            <Text style={styles.cardTitle}>{card.name}</Text>
            <Text style={styles.cardDescription}>"{card.description}"</Text>
            {renderEffectWithCoins(card.effect, 6 * contentScale, styles.cardEffect)}
          </View>
        ))}
      </View>
    </Page>
  )
}
