import { useState } from 'react'
import { Button } from '@/components/ui'
import { useUrlState } from '@/hooks'

export function ShareButton() {
  const { copyShareableUrl } = useUrlState()
  const [copied, setCopied] = useState(false)

  const handleShare = async () => {
    const success = await copyShareableUrl()
    if (success) {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <div className="space-y-3">
      <h3 className="font-pixel text-xs text-pixel-accent">Share</h3>
      <p className="font-pixel text-[8px] text-gray-500">
        Copy a link to share your board configuration.
      </p>
      <Button
        variant={copied ? 'secondary' : 'primary'}
        onClick={handleShare}
        className="w-full"
      >
        {copied ? 'Copied!' : 'Copy Link'}
      </Button>
    </div>
  )
}
