import { useState, useCallback } from 'react'
import { pdf } from '@react-pdf/renderer'
import { Button, Spinner } from '@/components/ui'
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
      <h3 className="font-pixel text-xs text-pixel-accent">Generate PDF</h3>
      <p className="font-pixel text-[8px] text-gray-500">
        Select materials to include in your PDF
      </p>

      <div className="space-y-2">
        {(Object.keys(materialLabels) as PrintMaterial[]).map((material) => (
          <label key={material} className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={selectedMaterials.includes(material)}
              onChange={() => toggleMaterial(material)}
              className="w-4 h-4 cursor-pointer"
              disabled={isPdfGenerating}
            />
            <span className="font-pixel text-[9px] text-gray-700">{materialLabels[material]}</span>
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
