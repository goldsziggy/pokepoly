import type { PaperSize } from '@/types'

export interface PageDimensions {
  width: number
  height: number
  margin: number
}

export const PAGE_DIMENSIONS: Record<PaperSize, PageDimensions> = {
  letter: {
    width: 612,  // 8.5" at 72 DPI
    height: 792, // 11" at 72 DPI
    margin: 36,  // 0.5" margin
  },
  a4: {
    width: 595,  // 210mm at 72 DPI
    height: 842, // 297mm at 72 DPI
    margin: 36,
  },
}

// Board dimensions for a full-size 20" x 20" board
// Split into 2x3 grid (6 landscape tiles) for printing
export const BOARD_DIMENSIONS = {
  totalSize: 1440,    // 20" at 72 DPI
  tileCols: 2,        // 2 columns
  tileRows: 3,        // 3 rows
  tileWidth: 720,     // 10" at 72 DPI (each tile width)
  tileHeight: 480,    // 6.67" at 72 DPI (each tile height)
  totalPages: 6,      // 2x3 = 6 landscape pages
  cornerSize: 130,    // ~1.8" for corner spaces
  sideSpaceSize: 131, // ~1.82" for side spaces (9 per side)
}
