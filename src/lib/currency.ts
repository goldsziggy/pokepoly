import { Text, View } from '@react-pdf/renderer'
import { PokeCoinPDF } from '@/components/ui/PokeCoin'
import { PokeCoin } from '@/components/ui/PokeCoinReact'
import type { Style } from '@react-pdf/types'

/**
 * Format currency with Poké coin icon for React (preview)
 */
export function formatCurrencyReact(amount: number, coinSize: number = 10) {
  return (
    <span className="inline-flex items-center gap-0.5">
      <PokeCoin size={coinSize} />
      <span>{amount}</span>
    </span>
  )
}

/**
 * Format currency with Poké coin icon for react-pdf (PDF)
 */
export function formatCurrencyPDF(amount: number, coinSize: number = 10, textStyle?: Style) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 2 }}>
      <PokeCoinPDF size={coinSize} />
      <Text style={textStyle}>{amount}</Text>
    </View>
  )
}

/**
 * Format currency string with coin icon for inline text (React)
 * Returns JSX that can be used in text content
 */
export function CurrencyText({ amount, coinSize = 10 }: { amount: number; coinSize?: number }) {
  return (
    <>
      <PokeCoin size={coinSize} />
      {amount}
    </>
  )
}
