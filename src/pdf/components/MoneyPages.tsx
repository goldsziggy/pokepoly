import type { PaperSize, CardSize } from '@/types'
import { CARD_SIZE_MULTIPLIERS } from '@/types/board'
import { MoneyPage, getMoneyBills, getMoneyItemsPerPage } from './MoneyPage'

interface MoneyPagesProps {
  paperSize: PaperSize
  cardSize: CardSize
  players: number
}

const BILL_BASE_WIDTH = 180
const BILL_BASE_HEIGHT = 78
const LEGACY_BILL_HEIGHT = 70
const BILL_CONTENT_SCALE_RATIO = BILL_BASE_HEIGHT / LEGACY_BILL_HEIGHT
const BASE_MARGIN = 4

export function getMoneyPageCount(paperSize: PaperSize, cardSize: CardSize, players: number) {
  const sizeScale = CARD_SIZE_MULTIPLIERS[cardSize]
  const contentScale = sizeScale * BILL_CONTENT_SCALE_RATIO

  const itemWidth = BILL_BASE_WIDTH * sizeScale
  const itemHeight = BILL_BASE_HEIGHT * sizeScale
  const itemMargin = BASE_MARGIN * contentScale

  const itemsPerPage = getMoneyItemsPerPage(paperSize, itemWidth, itemHeight, itemMargin)
  const totalBills = getMoneyBills(players).length
  return Math.ceil(totalBills / itemsPerPage)
}

export function MoneyPages({ paperSize, cardSize, players }: MoneyPagesProps) {
  const sizeScale = CARD_SIZE_MULTIPLIERS[cardSize]
  const contentScale = sizeScale * BILL_CONTENT_SCALE_RATIO

  const itemWidth = BILL_BASE_WIDTH * sizeScale
  const itemHeight = BILL_BASE_HEIGHT * sizeScale
  const itemMargin = BASE_MARGIN * contentScale

  const itemsPerPage = getMoneyItemsPerPage(paperSize, itemWidth, itemHeight, itemMargin)
  const totalBills = getMoneyBills(players).length
  const totalPages = Math.ceil(totalBills / itemsPerPage)

  return (
    <>
      {Array.from({ length: totalPages }, (_, i) => (
        <MoneyPage key={i} paperSize={paperSize} cardSize={cardSize} pageNumber={i} players={players} />
      ))}
    </>
  )
}
