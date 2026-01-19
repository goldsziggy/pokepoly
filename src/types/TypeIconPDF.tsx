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
  const iconPath = `/icons/${type.toLowerCase()}.svg`

  return (
    <PDFImage
      src={iconPath}
      style={[{ width: size, height: size, objectFit: 'contain' }, style]}
    />
  )
}
