/**
 * Pokemon type icon component for react-pdf (print)
 */

import { Image as PDFImage } from '@react-pdf/renderer'
import type { Style } from '@react-pdf/types'

interface TypeIconPDFProps {
  type: string
  size?: number
  style?: Style
}

export function TypeIconPDF({ type, size = 12, style }: TypeIconPDFProps) {
  const base = (import.meta as ImportMeta & { env?: { BASE_URL?: string } }).env?.BASE_URL || '/'
  const normalizedBase = base.endsWith('/') ? base : `${base}/`
  const iconPath = typeof window !== 'undefined'
    ? `${window.location.origin}${normalizedBase}icons/${type.toLowerCase()}.png`
    : `${normalizedBase}icons/${type.toLowerCase()}.png`

  const baseStyle: Style = { width: size, height: size, objectFit: 'contain' }

  return (
    <PDFImage
      src={iconPath}
      style={style ? [baseStyle, style] : baseStyle}
    />
  )
}
