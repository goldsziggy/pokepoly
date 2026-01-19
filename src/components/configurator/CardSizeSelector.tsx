import { useBoardStore } from '@/store'
import type { CardSize } from '@/types'
import { CARD_SIZE_MULTIPLIERS } from '@/types/board'

export function CardSizeSelector() {
  const { cardSize, setCardSize } = useBoardStore()

  // Matches PDF templates:
  // - Cards: 144×84pt (2.0"×1.17") at small
  // - Money: 180×78pt (2.5"×1.08") at small
  const baseCardIn = { w: 2.0, h: 84 / 72 }
  const baseMoneyIn = { w: 2.5, h: 78 / 72 }

  const fmt = (n: number) => (Math.round(n * 10) / 10).toFixed(1)
  const describe = (size: CardSize) => {
    const s = CARD_SIZE_MULTIPLIERS[size]
    const cardW = fmt(baseCardIn.w * s)
    const cardH = fmt(baseCardIn.h * s)
    const moneyW = fmt(baseMoneyIn.w * s)
    const moneyH = fmt(baseMoneyIn.h * s)
    return `Cards ~${cardW}" × ${cardH}" • Money ~${moneyW}" × ${moneyH}"`
  }

  const options: { value: CardSize; label: string; description: string }[] = [
    { value: 'small', label: 'Small', description: describe('small') },
    { value: 'medium', label: 'Medium', description: describe('medium') },
    { value: 'large', label: 'Large', description: describe('large') },
  ]

  return (
    <div className="space-y-3">
      <h3 className="font-pixel text-xs text-pixel-accent">Card & Money Size</h3>
      <div className="flex flex-wrap gap-3">
        {options.map((option) => (
          <button
            key={option.value}
            onClick={() => setCardSize(option.value)}
            className={`
              flex-1 min-w-[140px] p-3 text-left min-h-[56px]
              border-4 transition-all
              ${cardSize === option.value
                ? 'bg-pixel-accent border-b-red-900 border-r-red-900 border-t-red-300 border-l-red-300'
                : 'bg-pixel-surface border-t-gray-900 border-l-gray-900 border-b-gray-500 border-r-gray-500 hover:bg-pixel-border'
              }
            `}
          >
            <div className="font-pixel text-xs text-pixel-text">{option.label}</div>
            <div className="font-pixel text-[10px] text-gray-500 mt-1">{option.description}</div>
          </button>
        ))}
      </div>
    </div>
  )
}
