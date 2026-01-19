/**
 * Helper function to get sprite URLs for special board spaces
 * Uses PokeAPI sprites for Pokemon that represent game concepts
 */

// PokeAPI sprite URLs - using Pokemon that represent the concepts
export const SPACE_SPRITES = {
  // GO - Use Pikachu (iconic starter, represents beginning)
  go: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/25.png',
  
  // Team Rocket Hideout (Jail) - Use Meowth (Team Rocket's mascot)
  jail: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/52.png',
  
  // Free Parking - Use Snorlax (sleeping/resting)
  'free-parking': 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/143.png',
  
  // Go to Jail - Use Persian (Meowth's evolution, Team Rocket)
  'go-to-jail': 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/53.png',
  
  // Gyms - Use Machamp (represents strength/training)
  gym: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/68.png',
  
  // Item Bag - Use Ditto (can transform, represents items)
  'item-bag': 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/132.png',
  
  // Professor Oak - Use Alakazam (wise, intelligent)
  'professor-oak': 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/65.png',
  
  // Grunt Ambush - Use Ekans (Team Rocket's snake Pokemon)
  'grunt-ambush': 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/23.png',
  
  // Giovanni - Use Rhydon (Giovanni's signature Pokemon)
  giovanni: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/112.png',
} as const

export function getSpaceSprite(spaceType: string): string | null {
  return SPACE_SPRITES[spaceType as keyof typeof SPACE_SPRITES] || null
}
