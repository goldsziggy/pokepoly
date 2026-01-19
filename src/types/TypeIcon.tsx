/**
 * Pokemon type icon component for React (preview)
 */

interface TypeIconProps {
  type: string
  size?: number | string
  className?: string
}

export function TypeIcon({ type, size = 12, className = '' }: TypeIconProps) {
  const iconPath = `/icons/${type.toLowerCase()}.svg`
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
