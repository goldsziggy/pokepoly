import { useEffect, useRef, useState, useCallback } from 'react'
import { pdf } from '@react-pdf/renderer'
import { Button, BuyMeACoffeeButton, Spinner } from '@/components/ui'
import { useBoardStore } from '@/store'
import {
  BoardDocument,
  getDeedItemsPerPage,
  getItemBagCardsPageCount,
  getProfessorOakCardsPageCount,
  getMoneyPageCount,
  type PrintMaterial,
} from '@/pdf'

export function GeneratePdfButton() {
  const { boardSpaces, paperSize, cardSize, boardSize, players, isPdfGenerating, setIsPdfGenerating } = useBoardStore()
  const [progress, setProgress] = useState('')
  const [selectedMaterials, setSelectedMaterials] = useState<PrintMaterial[]>(['board', 'deeds', 'cards', 'money', 'tokens-rules'])
  const [showPdfModal, setShowPdfModal] = useState(false)
  const [pdfComplete, setPdfComplete] = useState(false)
  const wasPdfGeneratingRef = useRef(false)

  useEffect(() => {
    if (isPdfGenerating) {
      setShowPdfModal(true)
      setPdfComplete(false)
      wasPdfGeneratingRef.current = true
      return
    }

    if (wasPdfGeneratingRef.current) {
      setPdfComplete(true)
      setShowPdfModal(true)
      wasPdfGeneratingRef.current = false
    }
  }, [isPdfGenerating])

  const toggleMaterial = (material: PrintMaterial) => {
    setSelectedMaterials(prev => 
      prev.includes(material)
        ? prev.filter(m => m !== material)
        : [...prev, material]
    )
  }

  const handleGenerate = useCallback(async () => {
    if (boardSpaces.length === 0) {
      alert('Please wait for the board to generate first.')
      return
    }

    if (selectedMaterials.length === 0) {
      alert('Please select at least one material to print.')
      return
    }

    setIsPdfGenerating(true)
    setProgress('Generating PDF...')

    try {
      // Create the PDF document
      const doc = (
        <BoardDocument
          spaces={boardSpaces}
          paperSize={paperSize}
          cardSize={cardSize}
          boardSize={boardSize}
          players={players}
          materials={selectedMaterials}
        />
      )

      // Generate the blob with error handling
      setProgress('Rendering pages...')
      
      // Use setTimeout to allow UI to update and prevent blocking
      await new Promise(resolve => setTimeout(resolve, 100))
      
      const blob = await pdf(doc).toBlob()

      // Download
      setProgress('Downloading...')
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      const materialNames = selectedMaterials.join('-')
      link.download = `poke-poly-${materialNames}-${Date.now()}.pdf`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)

      setProgress('')
    } catch (error) {
      console.error('PDF generation failed:', error)
      alert(`Failed to generate PDF: ${error instanceof Error ? error.message : 'Unknown error'}. Please try again.`)
      setProgress('')
    } finally {
      setIsPdfGenerating(false)
    }
  }, [boardSpaces, paperSize, cardSize, boardSize, players, selectedMaterials, setIsPdfGenerating])

  const materialLabels: Record<PrintMaterial, string> = {
    'board': 'Board',
    'deeds': 'Property & Gym Deeds',
    'cards': 'Cards (Item Bag & Prof. Oak)',
    'money': 'Money',
    'tokens-rules': 'Tokens & Rules'
  }

  const propertiesCount = boardSpaces.filter(space => space.type === 'property').length
  const gymsCount = boardSpaces.filter(space => space.type === 'gym').length
  const deedsTotal = propertiesCount + gymsCount
  const deedsItemsPerPage = getDeedItemsPerPage(paperSize, cardSize)
  const deedPages = deedsTotal > 0 ? Math.ceil(deedsTotal / deedsItemsPerPage) : 0

  const itemBagPages = getItemBagCardsPageCount(paperSize, cardSize)
  const professorOakPages = getProfessorOakCardsPageCount(paperSize, cardSize)
  const cardsPages = itemBagPages + professorOakPages
  const moneyPages = getMoneyPageCount(paperSize, cardSize, players)

  const pageCounts: Record<PrintMaterial, number> = {
    'board': 9,
    'deeds': deedPages,
    'cards': cardsPages,
    'money': moneyPages,
    'tokens-rules': 1,
  }

  const estimatedPages = selectedMaterials.reduce((total, material) => total + pageCounts[material], 0)
  const pageBreakdown = selectedMaterials.map((material) => `${materialLabels[material]}: ${pageCounts[material]}`).join(' • ')

  return (
    <div className="space-y-3">
      {(isPdfGenerating || showPdfModal) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40" />
          <div className="relative w-full max-w-md bg-pixel-surface border-4 border-pixel-border shadow-pixel p-6">
            <div className="flex flex-col items-center text-center gap-3">
              {!pdfComplete ? <Spinner size="lg" /> : null}
              <div className="space-y-1">
                <p className="font-pixel text-sm text-pixel-text">
                  {pdfComplete ? 'Enjoy!' : 'Printing press warming up...'}
                </p>
                <p className="font-pixel text-[10px] text-gray-200">
                  {!pdfComplete ? (progress || 'Rendering pages...') : 'All set. Your download should have started.'}{' '}
                  <span className="text-gray-300">
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
                  </span>
                </p>
              </div>
              <div className="w-full pt-2">
                <BuyMeACoffeeButton className="w-full">
                  Buy me a coffee
                </BuyMeACoffeeButton>
              </div>
              {pdfComplete && (
                <button
                  type="button"
                  onClick={() => {
                    setShowPdfModal(false)
                    setPdfComplete(false)
                  }}
                  className="mt-1 font-pixel text-[10px] text-gray-300 underline underline-offset-2 hover:text-white"
                >
                  Close
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      <h3 className="font-pixel text-xs text-pixel-accent">Generate PDF</h3>
      <p className="font-pixel text-[8px] text-gray-500">
        Select materials to include in your PDF
      </p>

      <div className="space-y-2">
        {(Object.keys(materialLabels) as PrintMaterial[]).map((material) => (
          <label key={material} className="flex items-center gap-3 cursor-pointer min-h-[44px] select-none touch-manipulation">
            <input
              type="checkbox"
              checked={selectedMaterials.includes(material)}
              onChange={() => toggleMaterial(material)}
              className="w-5 h-5 cursor-pointer"
              disabled={isPdfGenerating}
            />
            <span className="font-pixel text-xs text-gray-700">{materialLabels[material]}</span>
          </label>
        ))}
      </div>

      <div className="space-y-1">
        <p className="font-pixel text-[8px] text-gray-500">
          Estimated pages: {estimatedPages}
        </p>
        {pageBreakdown && (
          <p className="font-pixel text-[7px] text-gray-400">
            {pageBreakdown}
          </p>
        )}
      </div>

      <Button
        onClick={handleGenerate}
        disabled={isPdfGenerating || boardSpaces.length === 0 || selectedMaterials.length === 0}
        className="w-full"
        size="lg"
      >
        {isPdfGenerating ? (
          <span className="flex items-center gap-2">
            <Spinner size="sm" />
            {progress || 'Generating...'}
          </span>
        ) : (
          `Download PDF (${selectedMaterials.length} material${selectedMaterials.length !== 1 ? 's' : ''})`
        )}
      </Button>

      <p className="font-pixel text-[6px] text-gray-500 text-center">
        Select which materials to include in your printable game kit
      </p>
    </div>
  )
}
