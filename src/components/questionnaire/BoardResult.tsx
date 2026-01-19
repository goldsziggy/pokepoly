import { Card, Button } from '@/components/ui'
import { BoardPreview } from '@/components/board'
import { ShareButton, GeneratePdfButton, CardSizeSelector, PaperSizeSelector } from '@/components/configurator'
import { useBoardStore } from '@/store'

interface BoardResultProps {
  onRestart: () => void
  onBack: () => void
}

export function BoardResult({ onRestart, onBack }: BoardResultProps) {
  const { boardSpaces, seed, newRandomSeed } = useBoardStore()

  return (
    <div className="space-y-6">
      <Card title="Your Board is Ready!">
        <div className="space-y-4">
          <div className="flex justify-between items-center flex-wrap gap-2">
            <p className="font-pixel text-xs text-pixel-text">
              Seed: {seed}
            </p>
            <div className="flex gap-2">
              <Button onClick={onBack} variant="secondary" size="sm">
                Back
              </Button>
              <Button onClick={newRandomSeed} size="sm">
                Regenerate
              </Button>
              <Button onClick={onRestart} size="sm">
                Start Over
              </Button>
            </div>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <CardSizeSelector />
              <PaperSizeSelector />
            </div>
            <ShareButton />
            <GeneratePdfButton />
          </div>
        </div>
      </Card>

      <Card title="Board Preview">
        <div className="overflow-auto max-h-[calc(100vh-300px)]">
          <div className="flex justify-center">
            <BoardPreview />
          </div>
        </div>
        {boardSpaces.length > 0 && (
          <p className="font-pixel text-[8px] text-gray-500 text-center mt-4">
            {boardSpaces.filter(s => s.type === 'property').length} properties generated
          </p>
        )}
      </Card>
    </div>
  )
}
