import type { BoardSpace, BoardColor } from '@/types/board'
import { getPropertyValues, type BoardSlot } from '@/lib/randomizer'

// Standard Monopoly board has 40 spaces
// 22 properties, 4 corners, 4 gyms, 2 taxes, 3 item bag, 3 prof oak, 2 utilities (we'll use as additional gyms)

export interface BoardPosition {
  side: 'bottom' | 'left' | 'top' | 'right'
  index: number
}

export const BOARD_POSITIONS: BoardPosition[] = [
  // Bottom row (right to left): GO to Jail
  { side: 'bottom', index: 0 },  // GO
  { side: 'bottom', index: 1 },  // Brown 1
  { side: 'bottom', index: 2 },  // Item Bag
  { side: 'bottom', index: 3 },  // Brown 2
  { side: 'bottom', index: 4 },  // Grunt Ambush (Income Tax)
  { side: 'bottom', index: 5 },  // Gym 1
  { side: 'bottom', index: 6 },  // Light Blue 1
  { side: 'bottom', index: 7 },  // Professor Oak
  { side: 'bottom', index: 8 },  // Light Blue 2
  { side: 'bottom', index: 9 },  // Jail (Just Visiting)

  // Left column (bottom to top)
  { side: 'left', index: 0 },   // Pink 1
  { side: 'left', index: 1 },   // Power Plant (Utility/Gym)
  { side: 'left', index: 2 },   // Pink 2
  { side: 'left', index: 3 },   // Pink 3
  { side: 'left', index: 4 },   // Gym 2
  { side: 'left', index: 5 },   // Orange 1
  { side: 'left', index: 6 },   // Item Bag
  { side: 'left', index: 7 },   // Orange 2
  { side: 'left', index: 8 },   // Orange 3
  { side: 'left', index: 9 },   // Free Parking

  // Top row (left to right)
  { side: 'top', index: 0 },    // Red 1
  { side: 'top', index: 1 },    // Professor Oak
  { side: 'top', index: 2 },    // Red 2
  { side: 'top', index: 3 },    // Red 3
  { side: 'top', index: 4 },    // Gym 3
  { side: 'top', index: 5 },    // Yellow 1
  { side: 'top', index: 6 },    // Yellow 2
  { side: 'top', index: 7 },    // Poké Mart (Utility/Gym)
  { side: 'top', index: 8 },    // Yellow 3
  { side: 'top', index: 9 },    // Go To Jail

  // Right column (top to bottom)
  { side: 'right', index: 0 },  // Green 1
  { side: 'right', index: 1 },  // Green 2
  { side: 'right', index: 2 },  // Item Bag
  { side: 'right', index: 3 },  // Green 3
  { side: 'right', index: 4 },  // Gym 4
  { side: 'right', index: 5 },  // Professor Oak
  { side: 'right', index: 6 },  // Dark Blue 1
  { side: 'right', index: 7 },  // Giovanni (Luxury Tax)
  { side: 'right', index: 8 },  // Dark Blue 2
  { side: 'right', index: 9 },  // Dark Blue 3 (before GO)
]

// Property index mapping: which BOARD_POSITIONS indices are properties
// and in what order they should be filled
export const PROPERTY_INDICES = [
  1, 3,           // Brown (2)
  6, 8,           // Light Blue (2) - note: we need 2 LB, but position 8 doesn't exist, using position 7's next
  10, 12, 13,     // Pink (3)
  15, 17, 18,     // Orange (3)
  20, 22, 23,     // Red (3)
  25, 26, 28,     // Yellow (3)
  30, 31, 33,     // Green (3)
  36, 38, 39,     // Dark Blue (3)
]

export const GYM_DATA = [
  { name: 'Pewter Gym', price: 200 },
  { name: 'Cerulean Gym', price: 200 },
  { name: 'Vermilion Gym', price: 200 },
  { name: 'Celadon Gym', price: 200 },
]

export function buildBoardSpaces(properties: BoardSlot[]): BoardSpace[] {
  const spaces: BoardSpace[] = []
  let propertyIndex = 0

  for (let i = 0; i < 40; i++) {
    // Corners
    if (i === 0) {
      spaces.push({ type: 'go', label: 'GO - Collect ₽200' })
      continue
    }
    if (i === 10) {
      spaces.push({ type: 'jail', label: 'Team Rocket Hideout' })
      continue
    }
    if (i === 20) {
      spaces.push({ type: 'free-parking', label: 'Free Parking' })
      continue
    }
    if (i === 30) {
      spaces.push({ type: 'go-to-jail', label: 'Go To Hideout' })
      continue
    }

    // Gyms (Railroads)
    if (i === 5) {
      spaces.push({ type: 'gym', name: GYM_DATA[0].name, price: GYM_DATA[0].price })
      continue
    }
    if (i === 15) {
      spaces.push({ type: 'gym', name: GYM_DATA[1].name, price: GYM_DATA[1].price })
      continue
    }
    if (i === 25) {
      spaces.push({ type: 'gym', name: GYM_DATA[2].name, price: GYM_DATA[2].price })
      continue
    }
    if (i === 35) {
      spaces.push({ type: 'gym', name: GYM_DATA[3].name, price: GYM_DATA[3].price })
      continue
    }

    // Utilities (Power Plant & Poké Mart)
    if (i === 12) {
      spaces.push({ type: 'gym', name: 'Power Plant', price: 150 })
      continue
    }
    if (i === 28) {
      spaces.push({ type: 'gym', name: 'Poké Mart', price: 150 })
      continue
    }

    // Taxes
    if (i === 4) {
      spaces.push({ type: 'grunt-ambush', amount: 200 })
      continue
    }
    if (i === 38) {
      spaces.push({ type: 'giovanni', amount: 100 })
      continue
    }

    // Item Bag (Community Chest)
    if (i === 2 || i === 17 || i === 33) {
      spaces.push({ type: 'item-bag' })
      continue
    }

    // Professor Oak (Chance)
    if (i === 7 || i === 22 || i === 36) {
      spaces.push({ type: 'professor-oak' })
      continue
    }

    // Properties
    const slot = properties[propertyIndex]
    if (slot) {
      const values = getPropertyValues(slot.tier)
      spaces.push({
        type: 'property',
        color: slot.color,
        pokemon: slot.pokemon,
        price: values.price,
        rent: values.rent,
        houseCost: values.houseCost,
      })
      propertyIndex++
    } else {
      // Fallback for missing properties
      spaces.push({
        type: 'property',
        color: 'brown',
        price: 60,
        rent: [4, 20, 60, 180, 320, 450],
        houseCost: 50,
      })
      propertyIndex++
    }
  }

  return spaces
}
