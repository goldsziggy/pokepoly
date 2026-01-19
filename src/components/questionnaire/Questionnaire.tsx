import { useEffect, useRef, useState } from 'react'
import { BuyMeACoffeeButton, Spinner } from '@/components/ui'
import { useBoardStore } from '@/store'
import { Step1ModeSelection } from './Step1ModeSelection'
import { Step2FavoriteSelection } from './Step2FavoriteSelection'
import { Step3TypeAssignment } from './Step3TypeAssignment'
import { BoardResult } from './BoardResult'
import type { Pokemon } from '@/types'

export type QuestionnaireMode = 'random' | 'customized' | null

export function Questionnaire() {
  const [step, setStep] = useState(1)
  const [mode, setMode] = useState<QuestionnaireMode>(null)
  const { isGenerating } = useBoardStore()
  const [showGeneratingModal, setShowGeneratingModal] = useState(false)
  const [generationComplete, setGenerationComplete] = useState(false)
  const wasGeneratingRef = useRef(false)

  useEffect(() => {
    if (isGenerating) {
      setShowGeneratingModal(true)
      setGenerationComplete(false)
      wasGeneratingRef.current = true
      return
    }

    if (wasGeneratingRef.current) {
      setGenerationComplete(true)
      setShowGeneratingModal(true)
      wasGeneratingRef.current = false
    }
  }, [isGenerating])

  const handleModeSelect = (selectedMode: QuestionnaireMode, pokemon?: Pokemon[]) => {
    setMode(selectedMode)
    if (selectedMode === 'random') {
      // Generate random board immediately with the Pokemon data to avoid race condition
      useBoardStore.getState().generateRandomBoard(pokemon)
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

  if (isGenerating || showGeneratingModal) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-black/40" />
        <div className="relative w-full max-w-md bg-pixel-surface border-4 border-pixel-border shadow-pixel p-6">
          <div className="flex flex-col items-center text-center gap-3">
            {!generationComplete ? <Spinner size="lg" /> : null}
            <div className="space-y-1">
              <p className="font-pixel text-sm text-pixel-text">
                {generationComplete ? 'Enjoy!' : 'Brewing your board...'}
              </p>
              <p className="font-pixel text-[10px] text-gray-200">
                I hope you and your friends/family enjoy. Feel free to request features at{' '}
                <a
                  href="https://github.com/goldsziggy/pokepoly"
                  target="_blank"
                  rel="noreferrer"
                  className="text-poke-yellow underline underline-offset-2"
                >
                  GitHub
                </a>
                , and if you have the means and want to buy me a coffee go for it!
              </p>
            </div>
            <div className="w-full pt-2">
              <BuyMeACoffeeButton className="w-full">
                Buy me a coffee
              </BuyMeACoffeeButton>
            </div>
            {generationComplete && (
              <button
                type="button"
                onClick={() => {
                  setShowGeneratingModal(false)
                  setGenerationComplete(false)
                }}
                className="mt-1 font-pixel text-[10px] text-gray-300 underline underline-offset-2 hover:text-white"
              >
                Close
              </button>
            )}
          </div>
        </div>
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
