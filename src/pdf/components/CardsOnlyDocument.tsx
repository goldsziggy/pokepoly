import { Document } from '@react-pdf/renderer'
import type { PaperSize, CardSize } from '@/types'
import { ItemBagCardsPages } from './ItemBagCardsPages'
import { ProfessorOakCardsPages } from './ProfessorOakCardsPages'

interface CardsOnlyDocumentProps {
  paperSize: PaperSize
  cardSize: CardSize
}

export function CardsOnlyDocument({ paperSize, cardSize }: CardsOnlyDocumentProps) {
  return (
    <Document
      title="Poke-Poly: The Master League - Cards"
      author="Poke-Poly Generator"
      subject="Printable Item Bag and Professor Oak Cards"
    >
      <ItemBagCardsPages paperSize={paperSize} cardSize={cardSize} />
      <ProfessorOakCardsPages paperSize={paperSize} cardSize={cardSize} />
    </Document>
  )
}
