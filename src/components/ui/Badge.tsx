import { HTMLAttributes, forwardRef } from 'react'

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'success' | 'warning' | 'danger'
}

export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className = '', variant = 'default', children, ...props }, ref) => {
    const variants = {
      default: 'bg-pixel-border text-pixel-text',
      success: 'bg-green-700 text-white',
      warning: 'bg-yellow-600 text-black',
      danger: 'bg-red-700 text-white',
    }

    return (
      <span
        ref={ref}
        className={`
          inline-flex items-center
          px-2 py-1
          font-pixel text-[8px]
          border-2 border-b-black/30 border-r-black/30 border-t-white/30 border-l-white/30
          ${variants[variant]}
          ${className}
        `}
        {...props}
      >
        {children}
      </span>
    )
  }
)

Badge.displayName = 'Badge'
