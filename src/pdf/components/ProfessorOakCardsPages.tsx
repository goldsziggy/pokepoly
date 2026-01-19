import type { PaperSize, CardSize } from '@/types'
import { CARD_SIZE_MULTIPLIERS, PAPER_DIMENSIONS } from '@/types/board'
import { PROFESSOR_OAK_CARDS } from '@/lib/cards'
import { ProfessorOakCardsPage } from './ProfessorOakCardsPage'

interface ProfessorOakCardsPagesProps {
  paperSize: PaperSize
  cardSize: CardSize
}

const CARD_BASE_WIDTH = 144
const CARD_BASE_HEIGHT = 84
const LEGACY_CARD_HEIGHT = 100
const CARD_CONTENT_SCALE_RATIO = CARD_BASE_HEIGHT / LEGACY_CARD_HEIGHT
const BASE_MARGIN = 4
const SAFETY_BUFFER = 4

function calculateItemsPerPage(
  paperSize: PaperSize,
  itemWidth: number,
  itemHeight: number,
  itemMargin: number
) {
  const pageHeight = PAPER_DIMENSIONS[paperSize].height
  const pageWidth = PAPER_DIMENSIONS[paperSize].width
  const pagePadding = 36 * 2 // top + bottom
  const titleHeight = 40 // approximate title + subtitle height
  const availableHeight = pageHeight - pagePadding - titleHeight - SAFETY_BUFFER
  const availableWidth = pageWidth - pagePadding - SAFETY_BUFFER

  const itemTotalWidth = itemWidth + itemMargin * 2
  const itemTotalHeight = itemHeight + itemMargin * 2

  const itemsPerRow = Math.floor(availableWidth / itemTotalWidth)
  const rowsPerPage = Math.floor(availableHeight / itemTotalHeight)

  return Math.max(1, itemsPerRow * rowsPerPage)
}

export function getProfessorOakCardsPageCount(paperSize: PaperSize, cardSize: CardSize) {
  const sizeScale = CARD_SIZE_MULTIPLIERS[cardSize]
  const contentScale = sizeScale * CARD_CONTENT_SCALE_RATIO

  const itemWidth = CARD_BASE_WIDTH * sizeScale
  const itemHeight = CARD_BASE_HEIGHT * sizeScale
  const itemMargin = BASE_MARGIN * contentScale

  const itemsPerPage = calculateItemsPerPage(paperSize, itemWidth, itemHeight, itemMargin)
  return Math.ceil(PROFESSOR_OAK_CARDS.length / itemsPerPage)
}

export function ProfessorOakCardsPages({ paperSize, cardSize }: ProfessorOakCardsPagesProps) {
  const totalPages = getProfessorOakCardsPageCount(paperSize, cardSize)

  return (
    <>
      {Array.from({ length: totalPages }, (_, i) => (
        <ProfessorOakCardsPage key={i} paperSize={paperSize} cardSize={cardSize} pageNumber={i} />
      ))}
    </>
  )
}
