import { HTMLAttributes, forwardRef } from 'react'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  title?: string
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className = '', title, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={`
          bg-pixel-surface
          border-4 border-pixel-border
          shadow-pixel
          ${className}
        `}
        {...props}
      >
        {title && (
          <div className="px-4 py-2 border-b-4 border-pixel-border bg-pixel-border/50">
            <h3 className="font-pixel text-xs text-pixel-text">{title}</h3>
          </div>
        )}
        <div className="p-4">
          {children}
        </div>
      </div>
    )
  }
)

Card.displayName = 'Card'
