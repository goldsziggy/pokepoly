import { useState, useCallback } from 'react'
import { pdf } from '@react-pdf/renderer'
import { Button, Spinner } from '@/components/ui'
import { useBoardStore } from '@/store'
import { BoardDocument } from '@/pdf'

export function GeneratePdfButton() {
  const { boardSpaces, paperSize, isPdfGenerating, setIsPdfGenerating } = useBoardStore()
  const [progress, setProgress] = useState('')

  const handleGenerate = useCallback(async () => {
    if (boardSpaces.length === 0) {
      alert('Please wait for the board to generate first.')
      return
    }

    setIsPdfGenerating(true)
    setProgress('Generating PDF...')

    try {
      // Create the PDF document
      const doc = <BoardDocument spaces={boardSpaces} paperSize={paperSize} />

      // Generate the blob
      setProgress('Rendering pages...')
      const blob = await pdf(doc).toBlob()

      // Download
      setProgress('Downloading...')
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `poke-poly-game-kit-${Date.now()}.pdf`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)

      setProgress('')
    } catch (error) {
      console.error('PDF generation failed:', error)
      alert('Failed to generate PDF. Please try again.')
      setProgress('')
    } finally {
      setIsPdfGenerating(false)
    }
  }, [boardSpaces, paperSize, setIsPdfGenerating])

  return (
    <div className="space-y-3">
      <h3 className="font-pixel text-xs text-pixel-accent">Generate PDF</h3>
      <p className="font-pixel text-[8px] text-gray-500">
        Download your complete game kit (12 pages)
      </p>

      <Button
        onClick={handleGenerate}
        disabled={isPdfGenerating || boardSpaces.length === 0}
        className="w-full"
        size="lg"
      >
        {isPdfGenerating ? (
          <span className="flex items-center gap-2">
            <Spinner size="sm" />
            {progress || 'Generating...'}
          </span>
        ) : (
          'Download Game Kit PDF'
        )}
      </Button>

      <p className="font-pixel text-[6px] text-gray-500 text-center">
        Includes: Board (4 pages), Deeds, Cards, Money, Tokens & Rules
      </p>
    </div>
  )
}
