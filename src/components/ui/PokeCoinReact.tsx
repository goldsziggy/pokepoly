interface PokeCoinProps {
  size?: number | string
  className?: string
}

/**
 * Poké Coin icon component for React (preview)
 */
export function PokeCoin({ size = 12, className = '' }: PokeCoinProps) {
  const sizeStyle = typeof size === 'number' ? { width: size, height: size } : {}
  const base = (import.meta as ImportMeta & { env?: { BASE_URL?: string } }).env?.BASE_URL || '/'
  const normalizedBase = base.endsWith('/') ? base : `${base}/`
  
  return (
    <img
      src={`${normalizedBase}images/poke-coin.png`}
      alt="Poké Coin"
      className={`inline-block pixelated object-contain ${className}`}
      style={sizeStyle}
      loading="lazy"
    />
  )
}
