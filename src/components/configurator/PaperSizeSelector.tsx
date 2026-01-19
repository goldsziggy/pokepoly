import { useBoardStore } from '@/store'
import type { PaperSize } from '@/types'

export function PaperSizeSelector() {
  const { paperSize, setPaperSize } = useBoardStore()

  const options: { value: PaperSize; label: string; description: string }[] = [
    { value: 'letter', label: 'Letter', description: '8.5" × 11" (US)' },
    { value: 'a4', label: 'A4', description: '210 × 297 mm (Intl)' },
  ]

  return (
    <div className="space-y-3">
      <h3 className="font-pixel text-xs text-pixel-accent">Paper Size</h3>
      <div className="flex flex-wrap gap-3">
        {options.map((option) => (
          <button
            key={option.value}
            onClick={() => setPaperSize(option.value)}
            className={`
              flex-1 min-w-[160px] p-3 text-left min-h-[56px]
              border-4 transition-all
              ${paperSize === option.value
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
