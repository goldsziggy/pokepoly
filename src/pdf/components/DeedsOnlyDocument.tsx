import { Document } from '@react-pdf/renderer'
import type { PaperSize, BoardSpace, PropertySpace, GymSpace, CardSize } from '@/types'
import { CARD_SIZE_MULTIPLIERS } from '@/types/board'
import { PropertyDeedsPage } from './PropertyDeedsPage'

interface DeedsOnlyDocumentProps {
  spaces: BoardSpace[]
  paperSize: PaperSize
  cardSize: CardSize
}

export function DeedsOnlyDocument({ spaces, paperSize, cardSize }: DeedsOnlyDocumentProps) {
  const properties = spaces.filter(
    (space): space is PropertySpace => space.type === 'property'
  )
  
  const gyms = spaces.filter(
    (space): space is GymSpace => space.type === 'gym'
  )

  const totalItems = properties.length + gyms.length
  const multiplier = CARD_SIZE_MULTIPLIERS[cardSize]
  const baseItemsPerPage = 10
  const itemsPerPage = Math.max(1, Math.floor(baseItemsPerPage / multiplier))
  const totalPages = Math.ceil(totalItems / itemsPerPage)

  return (
    <Document
      title="Poke-Poly: The Master League - Property & Gym Deeds"
      author="Poke-Poly Generator"
      subject="Printable Property and Gym Deed Cards"
    >
      {Array.from({ length: totalPages }, (_, i) => (
        <PropertyDeedsPage key={i} properties={properties} gyms={gyms} paperSize={paperSize} cardSize={cardSize} pageNumber={i} />
      ))}
    </Document>
  )
}
