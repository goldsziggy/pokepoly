/**
 * Convert an image URL (WebP, PNG, etc.) to a PNG data URL for PDF embedding.
 * Used for all Palworld sprites so react-pdf gets a format it can embed reliably.
 */
export function webpUrlToPngDataUrl(absoluteUrl: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas')
        canvas.width = img.naturalWidth
        canvas.height = img.naturalHeight
        const ctx = canvas.getContext('2d')
        if (!ctx) {
          reject(new Error('Could not get canvas context'))
          return
        }
        ctx.drawImage(img, 0, 0)
        resolve(canvas.toDataURL('image/png'))
      } catch (e) {
        reject(e)
      }
    }
    img.onerror = () => reject(new Error(`Failed to load image: ${absoluteUrl}`))
    img.src = absoluteUrl
  })
}
