import type { PaperSize, CardSize } from '@/types'
import { CARD_SIZE_MULTIPLIERS, PAPER_DIMENSIONS } from '@/types/board'
import { ITEM_BAG_CARDS } from '@/lib/cards'
import { ItemBagCardsPage } from './ItemBagCardsPage'

interface ItemBagCardsPagesProps {
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

export function ItemBagCardsPages({ paperSize, cardSize }: ItemBagCardsPagesProps) {
  const multiplier = CARD_SIZE_MULTIPLIERS[cardSize]
  const baseWidth = 180
  const baseHeight = 100
  const baseMargin = 4

  const itemWidth = baseWidth * multiplier
  const itemHeight = baseHeight * multiplier
  const itemMargin = baseMargin * multiplier

  const itemsPerPage = calculateItemsPerPage(paperSize, cardSize, itemWidth, itemHeight, itemMargin)
  const totalPages = Math.ceil(ITEM_BAG_CARDS.length / itemsPerPage)

  return (
    <>
      {Array.from({ length: totalPages }, (_, i) => (
        <ItemBagCardsPage key={i} paperSize={paperSize} cardSize={cardSize} pageNumber={i} />
      ))}
    </>
  )
}
