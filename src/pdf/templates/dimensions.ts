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

// Board dimensions for a small 18.5" x 18.5" board
// Split into 2x3 grid (6 landscape tiles) for printing
export const BOARD_DIMENSIONS = {
  totalSize: 1332,    // 18.5" at 72 DPI
  tileCols: 2,        // 2 columns
  tileRows: 3,        // 3 rows
  tileWidth: 666,     // 9.25" at 72 DPI (each tile width)
  tileHeight: 444,    // 6.17" at 72 DPI (each tile height)
  totalPages: 6,      // 2x3 = 6 landscape pages
  cornerSize: 180,    // 2.5" for corner spaces
  sideSpaceSize: 108, // 1.5" for side spaces (9 per side)
}
