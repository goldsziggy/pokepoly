import { Document } from '@react-pdf/renderer'
import type { PaperSize, BoardSpace, BoardSize } from '@/types'
import { BoardTilePage } from './BoardTilePage'

interface BoardOnlyDocumentProps {
  spaces: BoardSpace[]
  paperSize: PaperSize
  boardSize: BoardSize
}

export function BoardOnlyDocument({ spaces, paperSize, boardSize }: BoardOnlyDocumentProps) {
  return (
    <Document
      title="Poke-Poly - Board"
      author="Poke-Poly Generator"
      subject="Printable Pokemon Monopoly Game Board"
    >
      {/* Board Tiles (9 landscape pages - 3 cols × 3 rows) */}
      <BoardTilePage spaces={spaces} paperSize={paperSize} boardSize={boardSize} tileRow={0} tileCol={0} />
      <BoardTilePage spaces={spaces} paperSize={paperSize} boardSize={boardSize} tileRow={0} tileCol={1} />
      <BoardTilePage spaces={spaces} paperSize={paperSize} boardSize={boardSize} tileRow={0} tileCol={2} />
      <BoardTilePage spaces={spaces} paperSize={paperSize} boardSize={boardSize} tileRow={1} tileCol={0} />
      <BoardTilePage spaces={spaces} paperSize={paperSize} boardSize={boardSize} tileRow={1} tileCol={1} />
      <BoardTilePage spaces={spaces} paperSize={paperSize} boardSize={boardSize} tileRow={1} tileCol={2} />
      <BoardTilePage spaces={spaces} paperSize={paperSize} boardSize={boardSize} tileRow={2} tileCol={0} />
      <BoardTilePage spaces={spaces} paperSize={paperSize} boardSize={boardSize} tileRow={2} tileCol={1} />
      <BoardTilePage spaces={spaces} paperSize={paperSize} boardSize={boardSize} tileRow={2} tileCol={2} />
    </Document>
  )
}
