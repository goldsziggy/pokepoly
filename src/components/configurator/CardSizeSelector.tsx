import { useBoardStore } from '@/store'
import type { CardSize } from '@/types'

export function CardSizeSelector() {
  const { cardSize, setCardSize } = useBoardStore()

  const options: { value: CardSize; label: string; description: string }[] = [
    { value: 'small', label: 'Small', description: 'Current size' },
    { value: 'medium', label: 'Medium', description: '1.5× larger' },
    { value: 'large', label: 'Large', description: '2× larger' },
  ]

  return (
    <div className="space-y-3">
      <h3 className="font-pixel text-xs text-pixel-accent">Card & Money Size</h3>
      <div className="flex flex-col sm:flex-row gap-3">
        {options.map((option) => (
          <button
            key={option.value}
            onClick={() => setCardSize(option.value)}
            className={`
              flex-1 p-3 text-left min-h-[56px]
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
