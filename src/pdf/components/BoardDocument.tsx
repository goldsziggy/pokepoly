import { Document } from '@react-pdf/renderer'
import type { PaperSize, BoardSpace, PropertySpace, CardSize } from '@/types'
import { BoardTilePage } from './BoardTilePage'
import { PropertyDeedsPage } from './PropertyDeedsPage'
import { ItemBagCardsPages } from './ItemBagCardsPages'
import { ProfessorOakCardsPages } from './ProfessorOakCardsPages'
import { MoneyPages } from './MoneyPages'
import { TokensRulesPage } from './TokensRulesPage'

interface BoardDocumentProps {
  spaces: BoardSpace[]
  paperSize: PaperSize
  cardSize: CardSize
}

export function BoardDocument({ spaces, paperSize, cardSize }: BoardDocumentProps) {
  // Extract property spaces for deeds
  const properties = spaces.filter(
    (space): space is PropertySpace => space.type === 'property'
  )

  return (
    <Document
      title="Poke-Poly: The Master League - Game Kit"
      author="Poke-Poly Generator"
      subject="Printable Pokemon Monopoly Game - 20x20 inch board"
    >
      {/* Board Tiles (6 landscape pages for 20"x20" board - 2 cols × 3 rows) */}
      <BoardTilePage spaces={spaces} paperSize={paperSize} tileRow={0} tileCol={0} />
      <BoardTilePage spaces={spaces} paperSize={paperSize} tileRow={0} tileCol={1} />
      <BoardTilePage spaces={spaces} paperSize={paperSize} tileRow={1} tileCol={0} />
      <BoardTilePage spaces={spaces} paperSize={paperSize} tileRow={1} tileCol={1} />
      <BoardTilePage spaces={spaces} paperSize={paperSize} tileRow={2} tileCol={0} />
      <BoardTilePage spaces={spaces} paperSize={paperSize} tileRow={2} tileCol={1} />

      {/* Property Deeds (3 pages for 22 properties) */}
      <PropertyDeedsPage properties={properties} paperSize={paperSize} pageNumber={0} />
      <PropertyDeedsPage properties={properties} paperSize={paperSize} pageNumber={1} />
      <PropertyDeedsPage properties={properties} paperSize={paperSize} pageNumber={2} />

      {/* Item Bag Cards - dynamically generate pages */}
      <ItemBagCardsPages paperSize={paperSize} cardSize={cardSize} />

      {/* Professor Oak Cards - dynamically generate pages */}
      <ProfessorOakCardsPages paperSize={paperSize} cardSize={cardSize} />

      {/* Money Sheets - dynamically generate pages */}
      <MoneyPages paperSize={paperSize} cardSize={cardSize} />

      {/* Tokens + Rules (1 page) */}
      <TokensRulesPage paperSize={paperSize} />
    </Document>
  )
}
