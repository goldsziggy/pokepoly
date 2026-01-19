// Item Bag cards (Community Chest equivalent)
// Based on PRD definitions

export interface ItemBagCard {
  id: number
  name: string
  description: string
  effect: string
}

export const ITEM_BAG_CARDS: ItemBagCard[] = [
  {
    id: 1,
    name: 'Full Restore',
    description: 'Heal your team.',
    effect: 'Get out of Team Rocket Hideout (Jail) free. Keep this card until used.',
  },
  {
    id: 2,
    name: 'Rare Candy',
    description: "Boost your Pokémon's level.",
    effect: 'Add 1 Berry (House) to any property you own for free.',
  },
  {
    id: 3,
    name: 'Amulet Coin',
    description: 'Double your prize money.',
    effect: 'Collect ₽200 from the bank.',
  },
  {
    id: 4,
    name: 'Nugget',
    description: 'You found a shiny treasure!',
    effect: 'Collect ₽100.',
  },
  {
    id: 5,
    name: 'Escape Rope',
    description: 'Teleport to safety.',
    effect: 'Move to GO. Collect ₽200.',
  },
  {
    id: 6,
    name: 'Leftovers',
    description: 'Passive healing.',
    effect: 'For every property you own, collect ₽10 from each player.',
  },
  {
    id: 7,
    name: 'Revive',
    description: 'Bring back a fainted friend.',
    effect: 'Collect ₽50 from the bank.',
  },
  {
    id: 8,
    name: 'Potion',
    description: 'A basic healing item.',
    effect: 'Collect ₽25 from the bank.',
  },
  {
    id: 9,
    name: 'Great Ball',
    description: 'A high-performance Ball.',
    effect: 'Advance to the nearest property. If unowned, you may buy it.',
  },
  {
    id: 10,
    name: 'TM Move',
    description: 'Teach a powerful move.',
    effect: 'Receive ₽50 from every player for training services.',
  },
  {
    id: 11,
    name: 'Ether',
    description: 'Restore PP.',
    effect: 'Collect ₽75 from the bank.',
  },
  {
    id: 12,
    name: 'Lucky Egg',
    description: 'Boost experience gain.',
    effect: 'On your next rent collection, double the amount.',
  },
  {
    id: 13,
    name: 'Berry Juice',
    description: 'A refreshing drink.',
    effect: 'Collect ₽45 from the bank.',
  },
  {
    id: 14,
    name: 'X Attack',
    description: 'Temporarily boost attack.',
    effect: 'Your next rent payment is reduced by half.',
  },
  {
    id: 15,
    name: 'Super Repel',
    description: 'Keep wild Pokémon away.',
    effect: 'Skip your next rent payment if you land on another player\'s property.',
  },
  {
    id: 16,
    name: 'Bike Voucher',
    description: 'A voucher for a free bike.',
    effect: 'Move forward 5 spaces. Do not collect GO bonus if you pass.',
  },
]
