/**
 * Helper function to get sprite URLs for special board spaces
 * Uses local images from public/images
 */

// Local image paths for board spaces
export const SPACE_SPRITES = {
  go: '/images/GO.png',
  jail: '/images/hideout.png',
  'free-parking': '/images/poke-coin.png',
  'go-to-jail': '/images/hideout.png',
  'item-bag': '/images/bag.png',
  'professor-oak': '/images/oak.png',
  'grunt-ambush': '/images/grunt-ambush.png',
  giovanni: '/images/giovanni.png',
} as const

// Gym name to image mapping
const GYM_IMAGES: Record<string, string> = {
  'Pewter Gym': '/images/pewter.png',
  'Cerulean Gym': '/images/cerulean.jpg',
  'Vermilion Gym': '/images/vermillion.jpg',
  'Celadon Gym': '/images/celadon.png',
  'Power Plant': '/images/power-plant.png',
  'Poké Mart': '/images/pokemart.png',
}

export function getSpaceSprite(spaceType: string): string | null {
  return SPACE_SPRITES[spaceType as keyof typeof SPACE_SPRITES] || null
}

export function getGymImage(gymName: string): string | null {
  return GYM_IMAGES[gymName] || null
}
