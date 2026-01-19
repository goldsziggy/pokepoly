import { Document } from '@react-pdf/renderer'
import type { PaperSize, BoardSpace, PropertySpace, GymSpace, CardSize } from '@/types'
import { BoardTilePage } from './BoardTilePage'
import { PropertyDeedsPage } from './PropertyDeedsPage'
import { ItemBagCardsPages } from './ItemBagCardsPages'
import { ProfessorOakCardsPages } from './ProfessorOakCardsPages'
import { MoneyPages } from './MoneyPages'
import { TokensRulesPage } from './TokensRulesPage'

export type PrintMaterial = 'board' | 'deeds' | 'cards' | 'money' | 'tokens-rules'

// Export separate document components
export { BoardOnlyDocument } from './BoardOnlyDocument'
export { DeedsOnlyDocument } from './DeedsOnlyDocument'
export { CardsOnlyDocument } from './CardsOnlyDocument'
export { MoneyOnlyDocument } from './MoneyOnlyDocument'
export { TokensRulesOnlyDocument } from './TokensRulesOnlyDocument'

interface BoardDocumentProps {
  spaces: BoardSpace[]
  paperSize: PaperSize
  cardSize: CardSize
  materials?: PrintMaterial[]
}

export function BoardDocument({ spaces, paperSize, cardSize, materials }: BoardDocumentProps) {
  const includeAll = !materials || materials.length === 0
  const includeBoard = includeAll || materials.includes('board')
  const includeDeeds = includeAll || materials.includes('deeds')
  const includeCards = includeAll || materials.includes('cards')
  const includeMoney = includeAll || materials.includes('money')
  const includeTokensRules = includeAll || materials.includes('tokens-rules')
  // Extract property spaces for deeds
  const properties = spaces.filter(
    (space): space is PropertySpace => space.type === 'property'
  )
  
  // Extract gym spaces for deeds (includes utilities)
  const gyms = spaces.filter(
    (space): space is GymSpace => space.type === 'gym'
  )

  // Calculate total pages needed (22 properties + 6 gyms = 28 items, 10 per page = 3 pages)
  const totalItems = properties.length + gyms.length
  const itemsPerPage = 10
  const totalPages = Math.ceil(totalItems / itemsPerPage)

  return (
    <Document
      title="Poke-Poly: The Master League - Game Kit"
      author="Poke-Poly Generator"
      subject="Printable Pokemon Monopoly Game - 20x20 inch board"
    >
      {includeBoard && (
        <>
          {/* Board Tiles (6 landscape pages for 20"x20" board - 2 cols × 3 rows) */}
          <BoardTilePage spaces={spaces} paperSize={paperSize} tileRow={0} tileCol={0} />
          <BoardTilePage spaces={spaces} paperSize={paperSize} tileRow={0} tileCol={1} />
          <BoardTilePage spaces={spaces} paperSize={paperSize} tileRow={1} tileCol={0} />
          <BoardTilePage spaces={spaces} paperSize={paperSize} tileRow={1} tileCol={1} />
          <BoardTilePage spaces={spaces} paperSize={paperSize} tileRow={2} tileCol={0} />
          <BoardTilePage spaces={spaces} paperSize={paperSize} tileRow={2} tileCol={1} />
        </>
      )}

      {includeDeeds && (
        <>
          {/* Property & Gym Deeds */}
          {Array.from({ length: totalPages }, (_, i) => (
            <PropertyDeedsPage key={i} properties={properties} gyms={gyms} paperSize={paperSize} cardSize={cardSize} pageNumber={i} />
          ))}
        </>
      )}

      {includeCards && (
        <>
          {/* Item Bag Cards - dynamically generate pages */}
          <ItemBagCardsPages paperSize={paperSize} cardSize={cardSize} />

          {/* Professor Oak Cards - dynamically generate pages */}
          <ProfessorOakCardsPages paperSize={paperSize} cardSize={cardSize} />
        </>
      )}

      {includeMoney && (
        <>
          {/* Money Sheets - dynamically generate pages */}
          <MoneyPages paperSize={paperSize} cardSize={cardSize} />
        </>
      )}

      {includeTokensRules && (
        <>
          {/* Tokens + Rules (1 page) */}
          <TokensRulesPage paperSize={paperSize} />
        </>
      )}
    </Document>
  )
}
