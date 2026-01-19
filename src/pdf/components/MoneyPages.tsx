import type { PaperSize, CardSize } from '@/types'
import { CARD_SIZE_MULTIPLIERS, PAPER_DIMENSIONS } from '@/types/board'
import { MoneyPage } from './MoneyPage'

interface MoneyPagesProps {
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

export function MoneyPages({ paperSize, cardSize }: MoneyPagesProps) {
  const multiplier = CARD_SIZE_MULTIPLIERS[cardSize]
  const baseWidth = 180
  const baseHeight = 70
  const baseMargin = 4

  const itemWidth = baseWidth * multiplier
  const itemHeight = baseHeight * multiplier
  const itemMargin = baseMargin * multiplier

  const itemsPerPage = calculateItemsPerPage(paperSize, cardSize, itemWidth, itemHeight, itemMargin)

  // Total bills: 12 (3 each of 4 denominations) + 12 (4 each of 3 denominations) = 24 total
  const totalBills = 24
  const totalPages = Math.ceil(totalBills / itemsPerPage)

  return (
    <>
      {Array.from({ length: totalPages }, (_, i) => (
        <MoneyPage key={i} paperSize={paperSize} cardSize={cardSize} pageNumber={i} />
      ))}
    </>
  )
}
