import { InputHTMLAttributes, forwardRef } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className = '', ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={`
          w-full px-3 py-2
          bg-pixel-surface text-pixel-text font-pixel text-[10px]
          border-4 border-t-gray-900 border-l-gray-900 border-b-gray-500 border-r-gray-500
          focus:outline-none focus:ring-2 focus:ring-pixel-accent
          placeholder:text-gray-500
          ${className}
        `}
        {...props}
      />
    )
  }
)

Input.displayName = 'Input'
