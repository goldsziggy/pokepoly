import { Document } from '@react-pdf/renderer'
import type { PaperSize } from '@/types'
import { TokensRulesPage } from './TokensRulesPage'

interface TokensRulesOnlyDocumentProps {
  paperSize: PaperSize
}

export function TokensRulesOnlyDocument({ paperSize }: TokensRulesOnlyDocumentProps) {
  return (
    <Document
      title="Poke-Poly: The Master League - Tokens & Rules"
      author="Poke-Poly Generator"
      subject="Printable Player Tokens and Game Rules"
    >
      <TokensRulesPage paperSize={paperSize} />
    </Document>
  )
}
