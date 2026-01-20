import { useCallback, useState } from 'react'
import { BuyMeACoffeeButton, Button, Spinner } from '@/components/ui'
import { useBoardStore } from '@/store'
import { exportBoardPng } from '@/lib/export/boardImage'

export function ExportBoardImageButton() {
  const { boardSpaces, boardSize } = useBoardStore()
  const [isExporting, setIsExporting] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleExport = useCallback(async () => {
    if (!boardSpaces || boardSpaces.length === 0) return
    setIsExporting(true)
    setDone(false)
    setError(null)
    try {
      await exportBoardPng({ boardSpaces, boardSize, dpi: 300 })
      setDone(true)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Export failed')
    } finally {
      setIsExporting(false)
    }
  }, [boardSize, boardSpaces])

  return (
    <div className="space-y-3">
      {(isExporting || done || error) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40" />
          <div className="relative w-full max-w-md bg-pixel-surface border-4 border-pixel-border shadow-pixel p-6">
            <div className="flex flex-col items-center text-center gap-3">
              {isExporting ? <Spinner size="lg" /> : null}
              <div className="space-y-1">
                <p className="font-pixel text-sm text-pixel-text">
                  {error ? 'Uh oh!' : done ? 'Enjoy!' : 'Packing pixels...'}
                </p>
                <p className="font-pixel text-[10px] text-gray-200">
                  {error
                    ? error
                    : done
                      ? 'Downloaded a high-res PNG of your board. Print it, slice it, flex it.'
                      : 'Rendering a high-res board image (this can take a moment).'}
                </p>
              </div>
              <div className="w-full pt-2">
                <BuyMeACoffeeButton className="w-full">
                  Buy me a coffee
                </BuyMeACoffeeButton>
              </div>
              <button
                type="button"
                onClick={() => {
                  setDone(false)
                  setError(null)
                }}
                className="mt-1 font-pixel text-[10px] text-gray-300 underline underline-offset-2 hover:text-white"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      <h3 className="font-pixel text-xs text-pixel-accent">Export Board Image</h3>
      <p className="font-pixel text-[8px] text-gray-500">
        Download a single high-res PNG you can print and cut yourself.
      </p>
      <Button
        onClick={handleExport}
        disabled={isExporting || !boardSpaces || boardSpaces.length === 0}
        className="w-full"
        size="lg"
      >
        {isExporting ? (
          <span className="flex items-center gap-2">
            <Spinner size="sm" />
            Exporting…
          </span>
        ) : (
          'Download Board PNG (High-Res) [Experimental]'
        )}
      </Button>
      <p className="font-pixel text-[6px] text-gray-500 text-center">
        Tip: print at 100% scale for best results.
      </p>
    </div>
  )
}
