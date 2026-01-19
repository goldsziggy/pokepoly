import { Page, View, Text, StyleSheet } from '@react-pdf/renderer'
import type { PaperSize } from '@/types'
import { baseStyles, moneyStyles, colors } from './styles'

const DENOMINATIONS = [
  { value: 500, color: '#FF9800', textColor: colors.white },
  { value: 100, color: '#9C27B0', textColor: colors.white },
  { value: 50, color: '#2196F3', textColor: colors.white },
  { value: 20, color: '#4CAF50', textColor: colors.white },
  { value: 10, color: '#FFEB3B', textColor: colors.black },
  { value: 5, color: '#E91E63', textColor: colors.white },
  { value: 1, color: '#FFFFFF', textColor: colors.black },
]

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignContent: 'flex-start',
  },
  bill: {
    width: 180,
    height: 70,
    borderWidth: 2,
    borderColor: colors.black,
    margin: 4,
    padding: 8,
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
    fontSize: 5,
    marginBottom: 2,
  },
  billValue: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  billLabel: {
    fontSize: 5,
    marginTop: 2,
  },
  cornerValue: {
    position: 'absolute',
    fontSize: 6,
  },
})

interface MoneyPageProps {
  paperSize: PaperSize
  pageNumber: number
}

export function MoneyPage({ paperSize, pageNumber }: MoneyPageProps) {
  // Page 1: P500, P100, P50, P20 (3 of each)
  // Page 2: P10, P5, P1 (4 of each)
  const isFirstPage = pageNumber === 0
  const denomsToShow = isFirstPage
    ? DENOMINATIONS.slice(0, 4)
    : DENOMINATIONS.slice(4)
  const copiesPerDenom = isFirstPage ? 3 : 4

  const bills: Array<{ value: number; color: string; textColor: string }> = []
  denomsToShow.forEach((denom) => {
    for (let i = 0; i < copiesPerDenom; i++) {
      bills.push(denom)
    }
  })

  return (
    <Page size={paperSize.toUpperCase() as 'LETTER' | 'A4'} style={baseStyles.page}>
      <Text style={baseStyles.title}>Poke Coins - Page {pageNumber + 1}</Text>
      <Text style={baseStyles.subtitle}>Cut along the lines</Text>
      <View style={styles.grid}>
        {bills.map((bill, index) => (
          <View
            key={index}
            style={[styles.bill, { backgroundColor: bill.color }]}
          >
            <View style={styles.billInner}>
              <Text style={[styles.billTitle, { color: bill.textColor }]}>
                POKE COIN
              </Text>
              <Text style={[styles.billValue, { color: bill.textColor }]}>
                P{bill.value}
              </Text>
              <Text style={[styles.billLabel, { color: bill.textColor }]}>
                THE MASTER LEAGUE
              </Text>
            </View>
            <Text style={[styles.cornerValue, { top: 4, left: 4, color: bill.textColor }]}>
              P{bill.value}
            </Text>
            <Text style={[styles.cornerValue, { top: 4, right: 4, color: bill.textColor }]}>
              P{bill.value}
            </Text>
            <Text style={[styles.cornerValue, { bottom: 4, left: 4, color: bill.textColor }]}>
              P{bill.value}
            </Text>
            <Text style={[styles.cornerValue, { bottom: 4, right: 4, color: bill.textColor }]}>
              P{bill.value}
            </Text>
          </View>
        ))}
      </View>
    </Page>
  )
}
