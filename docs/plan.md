# Implementation Plan: Poke-Poly

## Project Overview

Poke-Poly is a web-based generator for creating custom Pokemon-themed Monopoly game boards. Users can configure regions, favorite Pokemon, and generate a printable PDF kit including the board, property deeds, cards, money, and rules.

## Architecture

```
src/
├── App.tsx                    # Main app component
├── components/
│   ├── ui/                    # Reusable UI components (Button, Card, Badge, etc.)
│   ├── configurator/          # Configuration controls
│   │   ├── RegionSelector     # Filter by Pokemon regions
│   │   ├── FavoriteSelector   # Pick favorite Pokemon to include
│   │   ├── PaperSizeSelector  # Letter vs A4
│   │   ├── SeedControl        # Randomization seed
│   │   ├── ShareButton        # URL sharing
│   │   └── GeneratePdfButton  # PDF generation trigger
│   └── board/
│       └── BoardPreview       # Visual board preview
├── lib/
│   ├── randomizer/            # BST-based property assignment
│   ├── board/                 # Board layout (40 spaces)
│   └── cards/                 # Item Bag & Professor Oak card decks
├── pdf/
│   ├── components/            # react-pdf page components
│   │   ├── BoardPage          # Board quadrant (×4)
│   │   ├── PropertyDeedsPage  # Property cards (×3)
│   │   ├── ItemBagCardsPage   # Community Chest equivalent
│   │   ├── ProfessorOakCardsPage # Chance equivalent
│   │   ├── MoneyPage          # Poke Coin denominations (×2)
│   │   └── TokensRulesPage    # Player tokens & quick rules
│   └── templates/             # Page dimensions
├── services/
│   └── pokeapi/               # PokeAPI client with IndexedDB caching
├── store/                     # Zustand state management
├── hooks/                     # Custom React hooks
└── types/                     # TypeScript type definitions
```

## Implementation Status

### Core Features - COMPLETE

| Feature | Status | Notes |
|---------|--------|-------|
| Pokemon data fetching | ✅ | PokeAPI with IndexedDB caching |
| BST-tier classification | ✅ | Very Common → Ultra Rare (4 tiers) |
| Board layout (40 spaces) | ✅ | Standard Monopoly layout |
| Property randomization | ✅ | Seeded, deterministic |
| Regional filtering | ✅ | Kanto, Johto, Hoenn, etc. |
| Favorite Pokemon lock-in | ✅ | Locks favorites into their BST tier |
| Evolution family grouping | ✅ | Same-family Pokemon placed adjacent |
| URL state sync | ✅ | Shareable configurations |
| Board preview UI | ✅ | Visual representation |

### PDF Generation - COMPLETE

| Component | Status | Notes |
|-----------|--------|-------|
| Board quadrants (4 pages) | ✅ | Assemblable game board with Pokemon sprites |
| Property deeds (3 pages) | ✅ | 22 property cards with Pokemon sprites |
| Item Bag cards | ✅ | 16 cards (Community Chest) |
| Professor Oak cards | ✅ | 16 cards (Chance) |
| Money sheets (2 pages) | ✅ | P1, P5, P10, P20, P50, P100, P500 |
| Tokens & Rules | ✅ | 6 tokens + quick start rules |

### Game Mechanics (PRD) - COMPLETE

| Mechanic | Implementation |
|----------|----------------|
| GO | Collect P200 |
| Team Rocket Hideout (Jail) | Pay P50 / Roll doubles / Full Restore |
| Grunt Ambush (Income Tax) | Pay P200 |
| Giovanni (Luxury Tax) | Pay P100 or 10% net worth |
| Gyms (Railroads) | 4 gyms + 2 utilities |
| Item Bag deck | 16 unique cards |
| Professor Oak deck | 16 unique cards |
| Berries (Houses) | Building mechanism |
| Evolution Stones (Hotels) | 4 Berries = 1 Stone |

## Color Tier System

Based on Base Stat Total (BST):

| Tier | BST Range | Board Colors | Examples |
|------|-----------|--------------|----------|
| Very Common | 150-300 | Brown, Light Blue | Magikarp, Caterpie |
| Common | 301-420 | Pink, Orange | Pikachu, Growlithe |
| Rare | 421-520 | Red, Yellow | Arcanine, Gengar |
| Ultra Rare | 521-700+ | Green, Dark Blue | Tyranitar, Mewtwo |

## Tech Stack

- **Framework**: React 19 + TypeScript
- **Build**: Vite 7
- **Styling**: Tailwind CSS
- **State**: Zustand
- **Data Fetching**: TanStack Query
- **PDF**: @react-pdf/renderer
- **URL State**: nuqs
- **Caching**: IndexedDB (idb)
- **Randomization**: seedrandom

## Potential Enhancements

### Priority 1 - UX Polish
- [x] Add Pokemon sprite images to property spaces (board + deeds)
- [ ] Improve board quadrant assembly instructions
- [ ] Add print-friendly CSS for browser printing fallback
- [ ] Loading states during PDF generation

### Priority 2 - Features
- [ ] Custom gym names (regional gyms based on selected region)
- [ ] Type-based property grouping option
- [ ] Multiple board themes (classic, modern, retro)
- [ ] Player count configuration for money distribution

### Priority 3 - Technical
- [ ] Service worker for offline support
- [ ] Pre-cache popular Pokemon data
- [ ] PDF generation web worker (prevent UI blocking)
- [ ] Automated testing (Vitest)

## File Reference

Key implementation files:

- `src/lib/randomizer/randomizer.ts` - BST classification & property assignment
- `src/lib/board/layout.ts` - Board space definitions & layout
- `src/lib/cards/itemBag.ts` - Item Bag card deck
- `src/lib/cards/professorOak.ts` - Professor Oak card deck
- `src/data/evolutionFamilies.ts` - Evolution family mappings (Gen 1-3)
- `src/store/boardStore.ts` - Global state management
- `src/pdf/components/BoardDocument.tsx` - PDF document composition
- `src/types/board.ts` - Type definitions for board spaces

## Deployment

The app is a static SPA that can be deployed to any static hosting:

```bash
npm run build    # Output to dist/
npm run preview  # Preview production build
```
