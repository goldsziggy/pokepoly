import { Page, View, Text, StyleSheet } from '@react-pdf/renderer'
import type { PaperSize, CardSize } from '@/types'
import { CARD_SIZE_MULTIPLIERS, PAPER_DIMENSIONS } from '@/types/board'
import { baseStyles, colors } from './styles'
import { PokeCoinPDF } from '@/components/ui/PokeCoin'

const DENOMINATIONS = [
  { value: 500, color: '#FF9800', textColor: colors.white, count: 2 },
  { value: 100, color: '#9C27B0', textColor: colors.white, count: 2 },
  { value: 50, color: '#2196F3', textColor: colors.white, count: 2 },
  { value: 20, color: '#4CAF50', textColor: colors.white, count: 6 },
  { value: 10, color: '#FFEB3B', textColor: colors.black, count: 5 },
  { value: 5, color: '#E91E63', textColor: colors.white, count: 5 },
  { value: 1, color: '#FFFFFF', textColor: colors.black, count: 5 },
]

const BILL_BASE_WIDTH = 180
const BILL_BASE_HEIGHT = 78
const LEGACY_BILL_HEIGHT = 70
const BILL_CONTENT_SCALE_RATIO = BILL_BASE_HEIGHT / LEGACY_BILL_HEIGHT
const BASE_PADDING = 8
const BASE_MARGIN = 4
const BASE_TITLE_FONT = 5
const BASE_VALUE_FONT = 16
const BASE_LABEL_FONT = 5
const BASE_CORNER_FONT = 6
const BASE_COIN_SIZE = 20
const BASE_CORNER_COIN_SIZE = 5
const SAFETY_BUFFER = 4

interface MoneyPageProps {
  paperSize: PaperSize
  cardSize: CardSize
  pageNumber: number
  players: number
}

function getMoneyStyles(cardSize: CardSize) {
  const sizeScale = CARD_SIZE_MULTIPLIERS[cardSize]
  const contentScale = sizeScale * BILL_CONTENT_SCALE_RATIO

  return StyleSheet.create({
    grid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'center',
      alignContent: 'flex-start',
    },
    bill: {
      width: BILL_BASE_WIDTH * sizeScale,
      height: BILL_BASE_HEIGHT * sizeScale,
      borderWidth: 2,
      borderColor: colors.black,
      margin: BASE_MARGIN * contentScale,
      padding: BASE_PADDING * contentScale,
      position: 'relative',
    },
    billInner: {
      flex: 1,
      borderWidth: 1,
      borderColor: 'rgba(0,0,0,0.3)',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
    },
    billTitle: {
      fontSize: BASE_TITLE_FONT * contentScale,
      marginBottom: 2 * contentScale,
    },
    billValue: {
      fontSize: BASE_VALUE_FONT * contentScale,
      fontWeight: 'bold',
    },
    billLabel: {
      fontSize: BASE_LABEL_FONT * contentScale,
      marginTop: 2 * contentScale,
    },
    cornerValue: {
      position: 'absolute',
      fontSize: BASE_CORNER_FONT * contentScale,
    },
  })
}

export function getMoneyItemsPerPage(
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

export function getMoneyBills(players: number) {
  const normalizedPlayers = Number.isFinite(players) ? Math.max(1, Math.floor(players)) : 1
  const bills: Array<{ value: number; color: string; textColor: string }> = []
  DENOMINATIONS.forEach((denom) => {
    const total = denom.count * normalizedPlayers
    for (let i = 0; i < total; i++) {
      bills.push(denom)
    }
  })
  return bills
}

export function MoneyPage({ paperSize, cardSize, pageNumber, players }: MoneyPageProps) {
  const styles = getMoneyStyles(cardSize)
  const sizeScale = CARD_SIZE_MULTIPLIERS[cardSize]
  const contentScale = sizeScale * BILL_CONTENT_SCALE_RATIO
  const coinSize = BASE_COIN_SIZE * contentScale
  const cornerCoinSize = BASE_CORNER_COIN_SIZE * contentScale

  const itemWidth = BILL_BASE_WIDTH * sizeScale
  const itemHeight = BILL_BASE_HEIGHT * sizeScale
  const itemMargin = BASE_MARGIN * contentScale

  const allBills = getMoneyBills(players)
  const itemsPerPage = getMoneyItemsPerPage(paperSize, itemWidth, itemHeight, itemMargin)
  const startIndex = pageNumber * itemsPerPage
  const endIndex = Math.min(startIndex + itemsPerPage, allBills.length)
  const pageBills = allBills.slice(startIndex, endIndex)

  // If this page would be empty or we've already rendered all bills, return null
  if (pageBills.length === 0) {
    return null
  }

  return (
    <Page size={paperSize.toUpperCase() as 'LETTER' | 'A4'} style={baseStyles.page}>
      <Text style={baseStyles.title}>Poke Coins - Page {pageNumber + 1}</Text>
      <Text style={baseStyles.subtitle}>Cut along the lines</Text>
      <View style={styles.grid}>
        {pageBills.map((bill, index) => (
          <View
            key={`${startIndex + index}-${bill.value}`}
            style={[styles.bill, { backgroundColor: bill.color }]}
            break={false}
            wrap={false}
          >
            <View style={styles.billInner}>
              <Text style={[styles.billTitle, { color: bill.textColor }]}>
                POKE COIN
              </Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 * contentScale }}>
                <PokeCoinPDF size={coinSize} />
                <Text style={[styles.billValue, { color: bill.textColor }]}>
                  {bill.value}
                </Text>
              </View>
              <Text style={[styles.billLabel, { color: bill.textColor }]}>
                THE MASTER LEAGUE
              </Text>
            </View>
            <View style={{ position: 'absolute', top: 4 * contentScale, left: 4 * contentScale, flexDirection: 'row', alignItems: 'center', gap: 1 * contentScale }}>
              <PokeCoinPDF size={cornerCoinSize} />
              <Text style={[styles.cornerValue, { color: bill.textColor }]}>{bill.value}</Text>
            </View>
            <View style={{ position: 'absolute', top: 4 * contentScale, right: 4 * contentScale, flexDirection: 'row', alignItems: 'center', gap: 1 * contentScale }}>
              <PokeCoinPDF size={cornerCoinSize} />
              <Text style={[styles.cornerValue, { color: bill.textColor }]}>{bill.value}</Text>
            </View>
            <View style={{ position: 'absolute', bottom: 4 * contentScale, left: 4 * contentScale, flexDirection: 'row', alignItems: 'center', gap: 1 * contentScale }}>
              <PokeCoinPDF size={cornerCoinSize} />
              <Text style={[styles.cornerValue, { color: bill.textColor }]}>{bill.value}</Text>
            </View>
            <View style={{ position: 'absolute', bottom: 4 * contentScale, right: 4 * contentScale, flexDirection: 'row', alignItems: 'center', gap: 1 * contentScale }}>
              <PokeCoinPDF size={cornerCoinSize} />
              <Text style={[styles.cornerValue, { color: bill.textColor }]}>{bill.value}</Text>
            </View>
          </View>
        ))}
      </View>
    </Page>
  )
}
