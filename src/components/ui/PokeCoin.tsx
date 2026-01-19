import { Image as PDFImage } from '@react-pdf/renderer'
import type { Style } from '@react-pdf/types'

interface PokeCoinProps {
  size?: number
  style?: Style
}

function getBaseUrl() {
  if (typeof window === 'undefined') return '/'
  // Vite sets BASE_URL based on `base` config (e.g. "/pokepoly/").
  // Fall back to root for non-Vite contexts.
  const base = (import.meta as ImportMeta & { env?: { BASE_URL?: string } }).env?.BASE_URL || '/'
  return base.endsWith('/') ? base : `${base}/`
}

/**
 * Poké Coin icon component for react-pdf (PDF generation)
 */
export function PokeCoinPDF({ size = 12, style }: PokeCoinProps) {
  return (
    <PDFImage
      src={`${getBaseUrl()}images/poke-coin.png`}
      style={{
        width: size,
        height: size,
        objectFit: 'contain',
        ...style,
      }}
    />
  )
}
