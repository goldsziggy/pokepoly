/**
 * Pokemon type icon utilities
 * 
 * For now, we use text abbreviations. In the future, this can be extended
 * to use actual type icon images from /public/images/types/ or similar.
 */

export const TYPE_ABBREVIATIONS: Record<string, string> = {
  normal: 'NM',
  fire: 'FR',
  water: 'WT',
  electric: 'EL',
  grass: 'GR',
  ice: 'IC',
  fighting: 'FT',
  poison: 'PS',
  ground: 'GD',
  flying: 'FL',
  psychic: 'PY',
  bug: 'BG',
  rock: 'RK',
  ghost: 'GH',
  dragon: 'DR',
  dark: 'DK',
  steel: 'ST',
  fairy: 'FY',
}

/**
 * Get the primary type abbreviation for a Pokemon
 */
export function getTypeAbbreviation(type: string): string {
  return TYPE_ABBREVIATIONS[type.toLowerCase()] || type.charAt(0).toUpperCase()
}

/**
 * Get the primary type for a Pokemon (first type in the types array)
 */
export function getPrimaryType(types: string[]): string | null {
  return types && types.length > 0 ? types[0] : null
}
