import type { Pokemon } from './pokemon'

export type BoardColor =
  | 'brown'
  | 'lightblue'
  | 'pink'
  | 'orange'
  | 'red'
  | 'yellow'
  | 'green'
  | 'darkblue'

export type BSTTier = 'very-common' | 'common' | 'rare' | 'ultra-rare'

export const BST_TIER_RANGES: Record<BSTTier, [number, number]> = {
  'very-common': [150, 300],
  'common': [301, 420],
  'rare': [421, 520],
  'ultra-rare': [521, 1000],
}

export const TIER_COLORS: Record<BSTTier, [BoardColor, BoardColor]> = {
  'very-common': ['brown', 'lightblue'],
  'common': ['pink', 'orange'],
  'rare': ['red', 'yellow'],
  'ultra-rare': ['green', 'darkblue'],
}

export const COLOR_HEX: Record<BoardColor, string> = {
  brown: '#8B4513',
  lightblue: '#87CEEB',
  pink: '#FF69B4',
  orange: '#FFA500',
  red: '#FF0000',
  yellow: '#FFD700',
  green: '#228B22',
  darkblue: '#000080',
}

export type SpaceType =
  | 'property'
  | 'go'
  | 'jail'
  | 'go-to-jail'
  | 'free-parking'
  | 'gym'
  | 'item-bag'
  | 'professor-oak'
  | 'grunt-ambush'
  | 'giovanni'

export interface PropertySpace {
  type: 'property'
  color: BoardColor
  pokemon?: Pokemon
  price: number
  rent: number[]
  houseCost: number
}

export interface CornerSpace {
  type: 'go' | 'jail' | 'go-to-jail' | 'free-parking'
  label: string
}

export interface GymSpace {
  type: 'gym'
  name: string
  price: number
}

export interface CardSpace {
  type: 'item-bag' | 'professor-oak'
}

export interface TaxSpace {
  type: 'grunt-ambush' | 'giovanni'
  amount: number
}

export type BoardSpace = PropertySpace | CornerSpace | GymSpace | CardSpace | TaxSpace

export interface BoardConfig {
  spaces: BoardSpace[]
}

export type PaperSize = 'letter' | 'a4'

export const PAPER_DIMENSIONS: Record<PaperSize, { width: number; height: number }> = {
  letter: { width: 612, height: 792 }, // 8.5" x 11" at 72 DPI
  a4: { width: 595, height: 842 }, // 210mm x 297mm at 72 DPI
}

export type BoardSize = 'small' | 'medium' | 'large'

export const BOARD_SIZE_INCHES: Record<BoardSize, number> = {
  small: 18.5,
  medium: 20,
  large: 22,
}

export type CardSize = 'small' | 'medium' | 'large'

export const CARD_SIZE_MULTIPLIERS: Record<CardSize, number> = {
  small: 1.0,
  medium: 1.5,
  large: 2.0,
}
