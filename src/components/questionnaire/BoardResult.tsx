import { Card, Button, Input } from '@/components/ui'
import { BoardPreview } from '@/components/board'
import { ShareButton, GeneratePdfButton, ExportBoardImageButton, CardSizeSelector, PaperSizeSelector, BoardSizeSelector } from '@/components/configurator'
import { useBoardStore } from '@/store'

interface BoardResultProps {
  onRestart: () => void
  onBack: () => void
}

export function BoardResult({ onRestart, onBack }: BoardResultProps) {
  const { boardSpaces, seed, newRandomSeed, players, setPlayers } = useBoardStore()

  return (
    <div className="space-y-6">
      <Card title="Your Board is Ready!">
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
            <p className="font-pixel text-xs text-pixel-text break-all">
              Seed: {seed}
            </p>
            <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
              <Button onClick={onBack} variant="secondary" size="sm" className="w-full sm:w-auto">
                Back
              </Button>
              <Button onClick={newRandomSeed} size="sm" className="w-full sm:w-auto">
                Regenerate
              </Button>
              <Button onClick={onRestart} size="sm" className="w-full sm:w-auto">
                Start Over
              </Button>
            </div>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <BoardSizeSelector />
              <CardSizeSelector />
              <PaperSizeSelector />
            </div>
            <div className="space-y-2">
              <label className="font-pixel text-[9px] text-gray-700">Players</label>
              <Input
                type="number"
                min={1}
                step={1}
                value={players}
                onChange={(event) => {
                  const next = parseInt(event.target.value, 10)
                  setPlayers(Number.isNaN(next) ? 1 : next)
                }}
              />
            </div>
            <ShareButton />
            <GeneratePdfButton />
            <ExportBoardImageButton />
          </div>
        </div>
      </Card>

      <Card title="Board Preview">
        <div className="overflow-auto max-h-[70vh] sm:max-h-[calc(100vh-300px)]">
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
