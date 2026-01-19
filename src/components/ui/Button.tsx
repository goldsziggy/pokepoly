import { ButtonHTMLAttributes, forwardRef } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger'
  size?: 'sm' | 'md' | 'lg'
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = '', variant = 'primary', size = 'md', children, disabled, ...props }, ref) => {
    const baseStyles = `
      font-pixel inline-flex items-center justify-center
      border-4 transition-all cursor-pointer
      select-none touch-manipulation
      min-h-[44px]
      disabled:opacity-50 disabled:cursor-not-allowed
    `

    const variants = {
      primary: `
        bg-pixel-accent text-white
        border-b-red-900 border-r-red-900 border-t-red-300 border-l-red-300
        hover:brightness-110
        active:border-t-red-900 active:border-l-red-900 active:border-b-red-300 active:border-r-red-300
      `,
      secondary: `
        bg-pixel-surface text-pixel-text
        border-b-gray-900 border-r-gray-900 border-t-gray-500 border-l-gray-500
        hover:bg-pixel-border
        active:border-t-gray-900 active:border-l-gray-900 active:border-b-gray-500 active:border-r-gray-500
      `,
      danger: `
        bg-red-700 text-white
        border-b-red-950 border-r-red-950 border-t-red-500 border-l-red-500
        hover:brightness-110
        active:border-t-red-950 active:border-l-red-950 active:border-b-red-500 active:border-r-red-500
      `,
    }

    const sizes = {
      sm: 'px-3 py-2 text-[10px]',
      md: 'px-4 py-2 text-xs',
      lg: 'px-6 py-3 text-sm',
    }

    return (
      <button
        ref={ref}
        className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
        disabled={disabled}
        {...props}
      >
        {children}
      </button>
    )
  }
)

Button.displayName = 'Button'
