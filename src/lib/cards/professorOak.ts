// Professor Oak cards (Chance equivalent)
// Based on PRD definitions

export interface ProfessorOakCard {
  id: number
  name: string
  description: string
  effect: string
}

export const PROFESSOR_OAK_CARDS: ProfessorOakCard[] = [
  {
    id: 1,
    name: 'New Research Site',
    description: 'Professor Oak found a new location!',
    effect: 'Advance to the nearest Gym. If you pass GO, collect ₽200.',
  },
  {
    id: 2,
    name: 'Wild Encounter',
    description: 'A wild Pokémon appeared!',
    effect: 'Move forward to the next unowned property. You may buy it or auction it.',
  },
  {
    id: 3,
    name: 'Evolution Stone',
    description: 'Your Pokémon is ready to evolve!',
    effect: 'Immediately upgrade 4 Berries into an Evolution Stone (Hotel) on one property.',
  },
  {
    id: 4,
    name: 'Teleport (Abra)',
    description: 'Abra used Teleport!',
    effect: 'Move to any space on the board. Do not pass GO.',
  },
  {
    id: 5,
    name: 'Route Closed',
    description: 'The path ahead is blocked.',
    effect: 'Go back 3 spaces.',
  },
  {
    id: 6,
    name: 'Pokémon Contest',
    description: 'You won the contest!',
    effect: 'Collect ₽150 from the bank.',
  },
  {
    id: 7,
    name: 'Trainer Battle',
    description: 'A trainer wants to battle!',
    effect: 'Pay ₽50 to the bank, or battle (roll dice). Win on 4+: collect ₽100.',
  },
  {
    id: 8,
    name: 'Safari Zone Pass',
    description: 'Free entry to Safari Zone!',
    effect: 'Advance to Free Parking. Collect any money there.',
  },
  {
    id: 9,
    name: 'Elite Four Challenge',
    description: 'The Elite Four awaits!',
    effect: 'If you own 3+ properties of the same color, collect ₽200. Otherwise, pay ₽50.',
  },
  {
    id: 10,
    name: 'Daycare Service',
    description: 'Leave your Pokémon at daycare.',
    effect: 'Pay ₽25 per Berry and ₽100 per Evolution Stone you own.',
  },
  {
    id: 11,
    name: 'Team Rocket Attack',
    description: 'Team Rocket is causing trouble!',
    effect: 'Go directly to Team Rocket Hideout. Do not pass GO.',
  },
  {
    id: 12,
    name: 'Professor\'s Errand',
    description: 'Help Professor Oak with research.',
    effect: 'Advance to GO. Collect ₽200.',
  },
  {
    id: 13,
    name: 'Breeding Success',
    description: 'Your Pokémon had an egg!',
    effect: 'Collect ₽100 from the bank.',
  },
  {
    id: 14,
    name: 'Move Tutor',
    description: 'Learn a rare move.',
    effect: 'Pay ₽75 to upgrade one property (add 1 Berry for free).',
  },
  {
    id: 15,
    name: 'Badge Earned',
    description: 'You earned a Gym Badge!',
    effect: 'If you own a Gym, collect ₽50 from each player.',
  },
  {
    id: 16,
    name: 'Regional Champion',
    description: 'You became the Champion!',
    effect: 'Collect ₽25 from each player.',
  },
]
