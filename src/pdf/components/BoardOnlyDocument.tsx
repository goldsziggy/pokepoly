import { Document } from '@react-pdf/renderer'
import type { PaperSize, BoardSpace } from '@/types'
import { BoardTilePage } from './BoardTilePage'

interface BoardOnlyDocumentProps {
  spaces: BoardSpace[]
  paperSize: PaperSize
}

export function BoardOnlyDocument({ spaces, paperSize }: BoardOnlyDocumentProps) {
  return (
    <Document
      title="Poke-Poly: The Master League - Board"
      author="Poke-Poly Generator"
      subject="Printable Pokemon Monopoly Game Board"
    >
      {/* Board Tiles (6 landscape pages for 20"x20" board - 2 cols × 3 rows) */}
      <BoardTilePage spaces={spaces} paperSize={paperSize} tileRow={0} tileCol={0} />
      <BoardTilePage spaces={spaces} paperSize={paperSize} tileRow={0} tileCol={1} />
      <BoardTilePage spaces={spaces} paperSize={paperSize} tileRow={1} tileCol={0} />
      <BoardTilePage spaces={spaces} paperSize={paperSize} tileRow={1} tileCol={1} />
      <BoardTilePage spaces={spaces} paperSize={paperSize} tileRow={2} tileCol={0} />
      <BoardTilePage spaces={spaces} paperSize={paperSize} tileRow={2} tileCol={1} />
    </Document>
  )
}
