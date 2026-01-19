import type { AnchorHTMLAttributes } from 'react'

type BuyMeACoffeeButtonProps = Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'href'> & {
  href?: string
}

const DEFAULT_HREF = 'https://buymeacoffee.com/goldsziggy'

export function BuyMeACoffeeButton({ href = DEFAULT_HREF, className = '', children, ...props }: BuyMeACoffeeButtonProps) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className={`
        font-pixel inline-flex items-center justify-center
        border-4 transition-all cursor-pointer
        select-none touch-manipulation
        min-h-[44px]
        bg-pixel-accent text-white
        border-b-red-900 border-r-red-900 border-t-red-300 border-l-red-300
        hover:brightness-110
        active:border-t-red-900 active:border-l-red-900 active:border-b-red-300 active:border-r-red-300
        px-4 py-2 text-xs
        ${className}
      `}
      {...props}
    >
      {children ?? 'Buy me a coffee'}
    </a>
  )
}

