import { BuyMeACoffeeButton, Spinner } from '@/components/ui'
import { Questionnaire } from '@/components/questionnaire'
import { usePokemonData, useUrlState } from '@/hooks'

function Header() {
  return (
    <header className="mb-8 text-center">
      <h1 className="font-pixel text-xl md:text-2xl text-poke-yellow mb-2">
        POKE-POLY
      </h1>
      <p className="font-pixel text-xs text-pixel-text">
        Gotta Own 'Em All!
      </p>
      <p className="font-pixel text-[8px] text-gray-500 mt-2">
        Generate a custom Pokemon Monopoly board
      </p>
    </header>
  )
}

function LoadingScreen() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center">
      <Spinner size="lg" />
      <p className="font-pixel text-xs text-pixel-text mt-4">
        Loading Pokemon data...
      </p>
      <p className="font-pixel text-[8px] text-gray-500 mt-2">
        First load may take a moment
      </p>
    </div>
  )
}

function Footer() {
  return (
    <footer className="mt-8 py-4 border-t border-pixel-border text-center">
      <div className="max-w-md mx-auto space-y-2 mb-4">
        <p className="font-pixel text-[10px] text-gray-600">
          Enjoying the chaos? Help keep the Poké-coffee flowing.
        </p>
        <div className="flex justify-center">
          <BuyMeACoffeeButton className="w-full sm:w-auto">
            Buy me a coffee
          </BuyMeACoffeeButton>
        </div>
      </div>
      <p className="font-pixel text-[8px] text-gray-500">
        Pokemon data from PokeAPI • Not affiliated with Nintendo or The Pokemon Company
      </p>
      <p className="font-pixel text-[8px] text-gray-500 mt-1">
        Monopoly is a trademark of Hasbro
      </p>
    </footer>
  )
}

export default function App() {
  useUrlState({ restoreOnMount: true })
  const { isLoading } = usePokemonData()

  if (isLoading) {
    return <LoadingScreen />
  }

  return (
    <div className="min-h-screen bg-pixel-bg">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <Header />
        <Questionnaire />
        <Footer />
      </div>
    </div>
  )
}
