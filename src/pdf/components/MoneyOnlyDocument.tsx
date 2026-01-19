import { Document } from '@react-pdf/renderer'
import type { PaperSize, CardSize } from '@/types'
import { MoneyPages } from './MoneyPages'

interface MoneyOnlyDocumentProps {
  paperSize: PaperSize
  cardSize: CardSize
}

export function MoneyOnlyDocument({ paperSize, cardSize }: MoneyOnlyDocumentProps) {
  return (
    <Document
      title="Poke-Poly: The Master League - Money"
      author="Poke-Poly Generator"
      subject="Printable Poke Coin Money Sheets"
    >
      <MoneyPages paperSize={paperSize} cardSize={cardSize} />
    </Document>
  )
}
