import { useState } from 'react'
import { Card, Button, Spinner } from '@/components/ui'
import { useBoardStore } from '@/store'
import { Step1ModeSelection } from './Step1ModeSelection'
import { Step2FavoriteSelection } from './Step2FavoriteSelection'
import { Step3TypeAssignment } from './Step3TypeAssignment'
import { BoardResult } from './BoardResult'

export type QuestionnaireMode = 'random' | 'customized' | null

export function Questionnaire() {
  const [step, setStep] = useState(1)
  const [mode, setMode] = useState<QuestionnaireMode>(null)
  const { isGenerating } = useBoardStore()

  const handleModeSelect = (selectedMode: QuestionnaireMode) => {
    setMode(selectedMode)
    if (selectedMode === 'random') {
      // Generate random board immediately
      useBoardStore.getState().generateRandomBoard()
      setStep(4)
    } else {
      setStep(2)
    }
  }

  const handleFavoritesComplete = () => {
    setStep(3)
  }

  const handleTypeAssignmentComplete = () => {
    setStep(4)
  }

  const handleBack = () => {
    if (step === 2) {
      setStep(1)
      setMode(null)
    } else if (step === 3) {
      setStep(2)
    } else if (step === 4 && mode === 'customized') {
      setStep(3)
    } else if (step === 4 && mode === 'random') {
      setStep(1)
      setMode(null)
      useBoardStore.getState().resetQuestionnaire()
    }
  }

  const handleRestart = () => {
    setStep(1)
    setMode(null)
    useBoardStore.getState().resetQuestionnaire()
  }

  if (isGenerating) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <Spinner size="lg" />
        <p className="font-pixel text-xs text-pixel-text mt-4">
          Generating board...
        </p>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
      {step === 1 && <Step1ModeSelection onSelect={handleModeSelect} />}
      {step === 2 && mode === 'customized' && (
        <Step2FavoriteSelection onComplete={handleFavoritesComplete} onBack={handleBack} />
      )}
      {step === 3 && mode === 'customized' && (
        <Step3TypeAssignment onComplete={handleTypeAssignmentComplete} onBack={handleBack} />
      )}
      {step === 4 && <BoardResult onRestart={handleRestart} onBack={handleBack} />}
    </div>
  )
}
