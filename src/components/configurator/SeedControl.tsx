import { Input, Button } from '@/components/ui'
import { useBoardStore } from '@/store'

export function SeedControl() {
  const { seed, setSeed, newRandomSeed } = useBoardStore()

  return (
    <div className="space-y-3">
      <h3 className="font-pixel text-xs text-pixel-accent">Random Seed</h3>
      <p className="font-pixel text-[8px] text-gray-500">
        Same seed = same board. Share seeds with friends!
      </p>
      <div className="flex gap-2">
        <Input
          type="text"
          value={seed}
          onChange={(e) => setSeed(e.target.value)}
          placeholder="Enter seed..."
          className="flex-1"
        />
        <Button
          variant="secondary"
          size="sm"
          onClick={newRandomSeed}
          title="Generate new random seed"
        >
          🎲
        </Button>
      </div>
    </div>
  )
}
