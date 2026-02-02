export interface Pokemon {
  id: number
  name: string
  sprite: string
  bst: number
  types: string[]
  region: Region
  evolutionFamily?: number // ID of the base Pokemon in the evolution chain
}

export type Region =
  | 'kanto'
  | 'johto'
  | 'hoenn'
  | 'sinnoh'
  | 'unova'
  | 'kalos'
  | 'alola'
  | 'galar'
  | 'paldea'
  | 'palworld'

export const REGIONS: Region[] = [
  'kanto',
  'johto',
  'hoenn',
  'sinnoh',
  'unova',
  'kalos',
  'alola',
  'galar',
  'paldea',
  'palworld',
]

export const REGION_RANGES: Record<Region, [number, number]> = {
  kanto: [1, 151],
  johto: [152, 251],
  hoenn: [252, 386],
  sinnoh: [387, 493],
  unova: [494, 649],
  kalos: [650, 721],
  alola: [722, 809],
  galar: [810, 905],
  paldea: [906, 1025],
  palworld: [2000, 2138],
}

export const REGION_LABELS: Record<Region, string> = {
  kanto: 'Kanto (Gen 1)',
  johto: 'Johto (Gen 2)',
  hoenn: 'Hoenn (Gen 3)',
  sinnoh: 'Sinnoh (Gen 4)',
  unova: 'Unova (Gen 5)',
  kalos: 'Kalos (Gen 6)',
  alola: 'Alola (Gen 7)',
  galar: 'Galar (Gen 8)',
  paldea: 'Paldea (Gen 9)',
  palworld: 'Palworld',
}
