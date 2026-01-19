/**
 * Pokemon type icon paths and utilities
 */

const base = (import.meta as ImportMeta & { env?: { BASE_URL?: string } }).env?.BASE_URL || '/'
const normalizedBase = base.endsWith('/') ? base : `${base}/`
const withBase = (path: string) => `${normalizedBase}${path.startsWith('/') ? path.slice(1) : path}`

export const TYPE_ICON_PATHS: Record<string, string> = {
  normal: withBase('icons/normal.svg'),
  fire: withBase('icons/fire.svg'),
  water: withBase('icons/water.svg'),
  electric: withBase('icons/electric.svg'),
  grass: withBase('icons/grass.svg'),
  ice: withBase('icons/ice.svg'),
  fighting: withBase('icons/fighting.svg'),
  poison: withBase('icons/poison.svg'),
  ground: withBase('icons/ground.svg'),
  flying: withBase('icons/flying.svg'),
  psychic: withBase('icons/psychic.svg'),
  bug: withBase('icons/bug.svg'),
  rock: withBase('icons/rock.svg'),
  ghost: withBase('icons/ghost.svg'),
  dragon: withBase('icons/dragon.svg'),
  dark: withBase('icons/dark.svg'),
  steel: withBase('icons/steel.svg'),
  fairy: withBase('icons/fairy.svg'),
}

/**
 * Get the icon path for a Pokemon type
 */
export function getTypeIconPath(type: string): string | null {
  return TYPE_ICON_PATHS[type.toLowerCase()] || null
}
