import { InputHTMLAttributes, forwardRef } from 'react'

interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label: string
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className = '', label, checked, ...props }, ref) => {
    return (
      <label className={`flex items-center gap-3 cursor-pointer group ${className}`}>
        <div className="relative">
          <input
            ref={ref}
            type="checkbox"
            checked={checked}
            className="sr-only peer"
            {...props}
          />
          <div className={`
            w-5 h-5
            border-4 border-t-gray-900 border-l-gray-900 border-b-gray-500 border-r-gray-500
            bg-pixel-surface
            peer-checked:bg-pixel-accent
            peer-focus:ring-2 peer-focus:ring-pixel-accent
            transition-colors
          `}>
            {checked && (
              <svg
                className="w-full h-full text-white"
                fill="currentColor"
                viewBox="0 0 16 16"
              >
                <path d="M3 8l3 3 7-7" stroke="currentColor" strokeWidth="3" fill="none" />
              </svg>
            )}
          </div>
        </div>
        <span className="font-pixel text-[10px] text-pixel-text group-hover:text-pixel-accent transition-colors">
          {label}
        </span>
      </label>
    )
  }
)

Checkbox.displayName = 'Checkbox'
