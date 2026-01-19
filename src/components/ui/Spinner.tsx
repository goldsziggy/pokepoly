interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function Spinner({ size = 'md', className = '' }: SpinnerProps) {
  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  }

  return (
    <div className={`${sizes[size]} ${className}`}>
      <div className="relative w-full h-full">
        {/* Pixel art pokeball spinner */}
        <div className="absolute inset-0 animate-spin">
          <svg viewBox="0 0 16 16" className="w-full h-full">
            {/* Top half - red */}
            <rect x="4" y="0" width="8" height="2" fill="#EE1515" />
            <rect x="2" y="2" width="12" height="2" fill="#EE1515" />
            <rect x="1" y="4" width="14" height="2" fill="#EE1515" />
            <rect x="0" y="6" width="16" height="2" fill="#EE1515" />

            {/* Bottom half - white */}
            <rect x="0" y="8" width="16" height="2" fill="#FFFFFF" />
            <rect x="1" y="10" width="14" height="2" fill="#FFFFFF" />
            <rect x="2" y="12" width="12" height="2" fill="#FFFFFF" />
            <rect x="4" y="14" width="8" height="2" fill="#FFFFFF" />

            {/* Center line */}
            <rect x="0" y="7" width="6" height="2" fill="#1a1a2e" />
            <rect x="10" y="7" width="6" height="2" fill="#1a1a2e" />

            {/* Center button */}
            <rect x="6" y="6" width="4" height="4" fill="#FFFFFF" />
            <rect x="7" y="7" width="2" height="2" fill="#1a1a2e" />
          </svg>
        </div>
      </div>
    </div>
  )
}
