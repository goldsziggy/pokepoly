import { Page, View, Text, StyleSheet } from '@react-pdf/renderer'
import type { PaperSize, CardSize } from '@/types'
import { CARD_SIZE_MULTIPLIERS, PAPER_DIMENSIONS } from '@/types/board'
import { baseStyles, moneyStyles, colors } from './styles'
import { PokeCoinPDF } from '@/components/ui/PokeCoin'

const DENOMINATIONS = [
  { value: 500, color: '#FF9800', textColor: colors.white },
  { value: 100, color: '#9C27B0', textColor: colors.white },
  { value: 50, color: '#2196F3', textColor: colors.white },
  { value: 20, color: '#4CAF50', textColor: colors.white },
  { value: 10, color: '#FFEB3B', textColor: colors.black },
  { value: 5, color: '#E91E63', textColor: colors.white },
  { value: 1, color: '#FFFFFF', textColor: colors.black },
]

interface MoneyPageProps {
  paperSize: PaperSize
  cardSize: CardSize
  pageNumber: number
}

function getMoneyStyles(cardSize: CardSize) {
  const multiplier = CARD_SIZE_MULTIPLIERS[cardSize]
  const baseWidth = 180
  const baseHeight = 70
  const basePadding = 8
  const baseMargin = 4
  const baseTitleFont = 5
  const baseValueFont = 16
  const baseLabelFont = 5
  const baseCornerFont = 6
  const baseCoinSize = 20
  const baseCornerCoinSize = 5

  return StyleSheet.create({
    grid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'center',
      alignContent: 'flex-start',
    },
    bill: {
      width: baseWidth * multiplier,
      height: baseHeight * multiplier,
      borderWidth: 2,
      borderColor: colors.black,
      margin: baseMargin * multiplier,
      padding: basePadding * multiplier,
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
      fontSize: baseTitleFont * multiplier,
      marginBottom: 2 * multiplier,
    },
    billValue: {
      fontSize: baseValueFont * multiplier,
      fontWeight: 'bold',
    },
    billLabel: {
      fontSize: baseLabelFont * multiplier,
      marginTop: 2 * multiplier,
    },
    cornerValue: {
      position: 'absolute',
      fontSize: baseCornerFont * multiplier,
    },
    coinSize: baseCoinSize * multiplier,
    cornerCoinSize: baseCornerCoinSize * multiplier,
  })
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

function getAllBills() {
  const bills: Array<{ value: number; color: string; textColor: string }> = []
  // Page 1: P500, P100, P50, P20 (3 of each)
  DENOMINATIONS.slice(0, 4).forEach((denom) => {
    for (let i = 0; i < 3; i++) {
      bills.push(denom)
    }
  })
  // Page 2: P10, P5, P1 (4 of each)
  DENOMINATIONS.slice(4).forEach((denom) => {
    for (let i = 0; i < 4; i++) {
      bills.push(denom)
    }
  })
  return bills
}

export function MoneyPage({ paperSize, cardSize, pageNumber }: MoneyPageProps) {
  const styles = getMoneyStyles(cardSize)
  const multiplier = CARD_SIZE_MULTIPLIERS[cardSize]
  const baseWidth = 180
  const baseHeight = 70
  const baseMargin = 4

  const itemWidth = baseWidth * multiplier
  const itemHeight = baseHeight * multiplier
  const itemMargin = baseMargin * multiplier

  const allBills = getAllBills()
  const itemsPerPage = calculateItemsPerPage(paperSize, cardSize, itemWidth, itemHeight, itemMargin)
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
          >
            <View style={styles.billInner}>
              <Text style={[styles.billTitle, { color: bill.textColor }]}>
                POKE COIN
              </Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 * multiplier }}>
                <PokeCoinPDF size={styles.coinSize} />
                <Text style={[styles.billValue, { color: bill.textColor }]}>
                  {bill.value}
                </Text>
              </View>
              <Text style={[styles.billLabel, { color: bill.textColor }]}>
                THE MASTER LEAGUE
              </Text>
            </View>
            <View style={{ position: 'absolute', top: 4 * multiplier, left: 4 * multiplier, flexDirection: 'row', alignItems: 'center', gap: 1 * multiplier }}>
              <PokeCoinPDF size={styles.cornerCoinSize} />
              <Text style={[styles.cornerValue, { color: bill.textColor }]}>{bill.value}</Text>
            </View>
            <View style={{ position: 'absolute', top: 4 * multiplier, right: 4 * multiplier, flexDirection: 'row', alignItems: 'center', gap: 1 * multiplier }}>
              <PokeCoinPDF size={styles.cornerCoinSize} />
              <Text style={[styles.cornerValue, { color: bill.textColor }]}>{bill.value}</Text>
            </View>
            <View style={{ position: 'absolute', bottom: 4 * multiplier, left: 4 * multiplier, flexDirection: 'row', alignItems: 'center', gap: 1 * multiplier }}>
              <PokeCoinPDF size={styles.cornerCoinSize} />
              <Text style={[styles.cornerValue, { color: bill.textColor }]}>{bill.value}</Text>
            </View>
            <View style={{ position: 'absolute', bottom: 4 * multiplier, right: 4 * multiplier, flexDirection: 'row', alignItems: 'center', gap: 1 * multiplier }}>
              <PokeCoinPDF size={styles.cornerCoinSize} />
              <Text style={[styles.cornerValue, { color: bill.textColor }]}>{bill.value}</Text>
            </View>
          </View>
        ))}
      </View>
    </Page>
  )
}
