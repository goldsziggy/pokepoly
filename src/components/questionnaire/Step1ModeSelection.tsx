import { Card, Button } from '@/components/ui'
import type { QuestionnaireMode } from './Questionnaire'

interface Step1ModeSelectionProps {
  onSelect: (mode: QuestionnaireMode) => void
}

export function Step1ModeSelection({ onSelect }: Step1ModeSelectionProps) {
  return (
    <Card title="Choose Your Board Style">
      <div className="space-y-4">
        <p className="font-pixel text-xs text-pixel-text text-center">
          How would you like to generate your board?
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button
            onClick={() => onSelect('random')}
            className="p-6 border-4 border-gray-800 bg-white hover:bg-gray-50 transition-colors text-left"
          >
            <h3 className="font-pixel text-sm text-pixel-accent mb-2">Full Random</h3>
            <p className="font-pixel text-[8px] text-gray-600">
              Generate a completely random board with no customization
            </p>
          </button>

          <button
            onClick={() => onSelect('customized')}
            className="p-6 border-4 border-gray-800 bg-white hover:bg-gray-50 transition-colors text-left"
          >
            <h3 className="font-pixel text-sm text-pixel-accent mb-2">Customized</h3>
            <p className="font-pixel text-[8px] text-gray-600">
              Select your favorite Pokemon and customize type assignments
            </p>
          </button>
        </div>
      </div>
    </Card>
  )
}
