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
  const iconPath = typeof window !== 'undefined'
    ? `${window.location.origin}/icons/${type.toLowerCase()}.png`
    : `/icons/${type.toLowerCase()}.png`

  const baseStyle: Style = { width: size, height: size, objectFit: 'contain' }

  return (
    <PDFImage
      src={iconPath}
      style={style ? [baseStyle, style] : baseStyle}
    />
  )
}
