import type { PaperSize, CardSize } from '@/types'
import { CARD_SIZE_MULTIPLIERS, PAPER_DIMENSIONS } from '@/types/board'
import { PROFESSOR_OAK_CARDS } from '@/lib/cards'
import { ProfessorOakCardsPage } from './ProfessorOakCardsPage'

interface ProfessorOakCardsPagesProps {
  paperSize: PaperSize
  cardSize: CardSize
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

export function ProfessorOakCardsPages({ paperSize, cardSize }: ProfessorOakCardsPagesProps) {
  const multiplier = CARD_SIZE_MULTIPLIERS[cardSize]
  const baseWidth = 180
  const baseHeight = 100
  const baseMargin = 4

  const itemWidth = baseWidth * multiplier
  const itemHeight = baseHeight * multiplier
  const itemMargin = baseMargin * multiplier

  const itemsPerPage = calculateItemsPerPage(paperSize, cardSize, itemWidth, itemHeight, itemMargin)
  const totalPages = Math.ceil(PROFESSOR_OAK_CARDS.length / itemsPerPage)

  return (
    <>
      {Array.from({ length: totalPages }, (_, i) => (
        <ProfessorOakCardsPage key={i} paperSize={paperSize} cardSize={cardSize} pageNumber={i} />
      ))}
    </>
  )
}
