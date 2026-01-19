/**
 * Helper function to get sprite URLs for special board spaces
 * Uses local images from public/images
 */

function withBaseUrl(path: string) {
  const base = (import.meta as ImportMeta & { env?: { BASE_URL?: string } }).env?.BASE_URL || '/'
  const normalizedBase = base.endsWith('/') ? base : `${base}/`
  const normalizedPath = path.startsWith('/') ? path.slice(1) : path
  return `${normalizedBase}${normalizedPath}`
}

// Local image paths for board spaces
export const SPACE_SPRITES = {
  go: withBaseUrl('images/GO.png'),
  jail: withBaseUrl('images/hideout.png'),
  'free-parking': withBaseUrl('images/poke-coin.png'),
  'go-to-jail': withBaseUrl('images/hideout.png'),
  'item-bag': withBaseUrl('images/bag.png'),
  'professor-oak': withBaseUrl('images/oak.png'),
  'grunt-ambush': withBaseUrl('images/grunt-ambush.png'),
  giovanni: withBaseUrl('images/giovanni.png'),
} as const

// Gym name to image mapping
const GYM_IMAGES: Record<string, string> = {
  'Pewter Gym': withBaseUrl('images/pewter.png'),
  'Cerulean Gym': withBaseUrl('images/cerulean.jpg'),
  'Vermilion Gym': withBaseUrl('images/vermillion.jpg'),
  'Celadon Gym': withBaseUrl('images/celadon.png'),
  'Power Plant': withBaseUrl('images/power-plant.png'),
  'Poké Mart': withBaseUrl('images/pokemart.png'),
}

export function getSpaceSprite(spaceType: string): string | null {
  return SPACE_SPRITES[spaceType as keyof typeof SPACE_SPRITES] || null
}

export function getGymImage(gymName: string): string | null {
  return GYM_IMAGES[gymName] || null
}
