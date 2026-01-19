/**
 * Pokemon type icon component for React (preview)
 */

interface TypeIconProps {
  type: string
  size?: number | string
  className?: string
}

export function TypeIcon({ type, size = 12, className = '' }: TypeIconProps) {
  const base = (import.meta as ImportMeta & { env?: { BASE_URL?: string } }).env?.BASE_URL || '/'
  const normalizedBase = base.endsWith('/') ? base : `${base}/`
  const iconPath = `${normalizedBase}icons/${type.toLowerCase()}.svg`
  const sizeStyle = typeof size === 'number' ? { width: size, height: size } : {}

  return (
    <img
      src={iconPath}
      alt={type}
      className={`inline-block pixelated object-contain ${className}`}
      style={sizeStyle}
      loading="lazy"
    />
  )
}
