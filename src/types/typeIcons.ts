/**
 * Pokemon type icon paths and utilities
 */

export const TYPE_ICON_PATHS: Record<string, string> = {
  normal: '/icons/normal.svg',
  fire: '/icons/fire.svg',
  water: '/icons/water.svg',
  electric: '/icons/electric.svg',
  grass: '/icons/grass.svg',
  ice: '/icons/ice.svg',
  fighting: '/icons/fighting.svg',
  poison: '/icons/poison.svg',
  ground: '/icons/ground.svg',
  flying: '/icons/flying.svg',
  psychic: '/icons/psychic.svg',
  bug: '/icons/bug.svg',
  rock: '/icons/rock.svg',
  ghost: '/icons/ghost.svg',
  dragon: '/icons/dragon.svg',
  dark: '/icons/dark.svg',
  steel: '/icons/steel.svg',
  fairy: '/icons/fairy.svg',
}

/**
 * Get the icon path for a Pokemon type
 */
export function getTypeIconPath(type: string): string | null {
  return TYPE_ICON_PATHS[type.toLowerCase()] || null
}
