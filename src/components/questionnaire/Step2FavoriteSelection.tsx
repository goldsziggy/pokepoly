import { useState, useRef, useEffect } from 'react'
import { Card, Input, Button } from '@/components/ui'
import { useBoardStore } from '@/store'
import { usePokemonSearch } from '@/hooks'
import type { Pokemon } from '@/types'
import { getBSTTier } from '@/lib/randomizer'

const TIER_LABELS = {
  'very-common': 'Very Common',
  'common': 'Common',
  'rare': 'Rare',
  'ultra-rare': 'Ultra Rare',
}

const TIER_COLORS = {
  'very-common': 'bg-board-brown',
  'common': 'bg-board-pink',
  'rare': 'bg-board-red',
  'ultra-rare': 'bg-board-green',
}

interface Step2FavoriteSelectionProps {
  onComplete: () => void
  onBack: () => void
}

export function Step2FavoriteSelection({ onComplete, onBack }: Step2FavoriteSelectionProps) {
  const { favoritePokemon, addFavorite, removeFavorite } = useBoardStore()
  const [query, setQuery] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const { results, isSearching } = usePokemonSearch(query)
  const inputRef = useRef<HTMLInputElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSelect = (pokemon: Pokemon) => {
    addFavorite(pokemon)
    setQuery('')
    setIsOpen(false)
  }

  const capitalize = (str: string) => str.charAt(0).toUpperCase() + str.slice(1)

  return (
    <Card title="Step 2: Select Your Favorite Pokémon">
      <div className="space-y-4">
        <p className="font-pixel text-xs text-pixel-text">
          Choose up to 22 Pokémon to include on your board. You can continue without selecting any.
        </p>

        {/* Search input */}
        <div className="relative">
          <Input
            ref={inputRef}
            type="text"
            placeholder="Search Pokémon..."
            value={query}
            onChange={(e) => {
              setQuery(e.target.value)
              setIsOpen(true)
            }}
            onFocus={() => setIsOpen(true)}
          />

          {/* Dropdown */}
          {isOpen && query.length >= 2 && (
            <div
              ref={dropdownRef}
              className="absolute z-50 w-full mt-1 max-h-60 overflow-auto bg-pixel-surface border-4 border-pixel-border shadow-pixel"
            >
              {isSearching ? (
                <div className="p-3 font-pixel text-[10px] text-gray-500">Searching...</div>
              ) : results.length === 0 ? (
                <div className="p-3 font-pixel text-[10px] text-gray-500">No Pokémon found</div>
              ) : (
                results.map((pokemon) => {
                  const tier = getBSTTier(pokemon.bst)
                  const isAlreadyFavorite = favoritePokemon.some(p => p.id === pokemon.id)

                  return (
                    <button
                      key={pokemon.id}
                      className={`
                        w-full px-3 py-2 flex items-center gap-3
                        hover:bg-pixel-border transition-colors text-left
                        ${isAlreadyFavorite ? 'opacity-50' : ''}
                      `}
                      onClick={() => !isAlreadyFavorite && handleSelect(pokemon)}
                      disabled={isAlreadyFavorite}
                    >
                      <img
                        src={pokemon.sprite}
                        alt={pokemon.name}
                        className="w-8 h-8 pixelated"
                        loading="lazy"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="font-pixel text-[10px] text-pixel-text truncate">
                          #{pokemon.id} {capitalize(pokemon.name)}
                        </div>
                        <div className="font-pixel text-[8px] text-gray-500">
                          BST: {pokemon.bst} • {TIER_LABELS[tier]}
                        </div>
                      </div>
                      <div className={`w-3 h-3 ${TIER_COLORS[tier]}`} />
                    </button>
                  )
                })
              )}
            </div>
          )}
        </div>

        {/* Selected favorites */}
        {favoritePokemon.length > 0 && (
          <div className="space-y-2">
            <div className="font-pixel text-[8px] text-gray-500">
              {favoritePokemon.length}/22 favorites selected
            </div>
            <div className="flex flex-wrap gap-2">
              {favoritePokemon.map((pokemon) => {
                const tier = getBSTTier(pokemon.bst)
                return (
                  <div
                    key={pokemon.id}
                    className="flex items-center gap-2 px-2 py-1 bg-pixel-border border-2 border-pixel-surface"
                  >
                    <img
                      src={pokemon.sprite}
                      alt={pokemon.name}
                      className="w-6 h-6 pixelated"
                    />
                    <span className="font-pixel text-[8px]">
                      {capitalize(pokemon.name)}
                    </span>
                    <div className={`w-2 h-2 ${TIER_COLORS[tier]}`} title={TIER_LABELS[tier]} />
                    <button
                      onClick={() => removeFavorite(pokemon.id)}
                      className="text-red-500 hover:text-red-400 font-pixel text-[10px]"
                    >
                      ×
                    </button>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        <div className="flex justify-between pt-4">
          <Button onClick={onBack} variant="secondary" size="lg">
            Back
          </Button>
          <Button onClick={onComplete} size="lg">
            Continue to Type Assignment
          </Button>
        </div>
      </div>
    </Card>
  )
}
