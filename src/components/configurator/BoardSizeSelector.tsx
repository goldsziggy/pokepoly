import { useBoardStore } from '@/store'
import type { BoardSize } from '@/types'

export function BoardSizeSelector() {
  const { boardSize, setBoardSize } = useBoardStore()

  const options: { value: BoardSize; label: string; description: string }[] = [
    { value: 'small', label: 'Small', description: '18.5" × 18.5"' },
    { value: 'medium', label: 'Medium', description: '20" × 20"' },
    { value: 'large', label: 'Large', description: '22" × 22"' },
  ]

  return (
    <div className="space-y-3">
      <h3 className="font-pixel text-xs text-pixel-accent">Board Size</h3>
      <div className="flex gap-3">
        {options.map((option) => (
          <button
            key={option.value}
            onClick={() => setBoardSize(option.value)}
            className={`
              flex-1 p-3 text-left
              border-4 transition-all
              ${boardSize === option.value
                ? 'bg-pixel-accent border-b-red-900 border-r-red-900 border-t-red-300 border-l-red-300'
                : 'bg-pixel-surface border-t-gray-900 border-l-gray-900 border-b-gray-500 border-r-gray-500 hover:bg-pixel-border'
              }
            `}
          >
            <div className="font-pixel text-[10px] text-pixel-text">{option.label}</div>
            <div className="font-pixel text-[8px] text-gray-400 mt-1">{option.description}</div>
          </button>
        ))}
      </div>
    </div>
  )
}
