import { Image as PDFImage } from '@react-pdf/renderer'
import type { Style } from '@react-pdf/types'

interface PokeCoinProps {
  size?: number
  style?: Style
}

/**
 * Poké Coin icon component for react-pdf (PDF generation)
 */
export function PokeCoinPDF({ size = 12, style }: PokeCoinProps) {
  return (
    <PDFImage
      src="/images/poke-coin.png"
      style={{
        width: size,
        height: size,
        objectFit: 'contain',
        ...style,
      }}
    />
  )
}
