/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        'pixel': ['"Press Start 2P"', 'cursive'],
      },
      colors: {
        // Monopoly board colors
        'board-brown': '#8B4513',
        'board-lightblue': '#87CEEB',
        'board-pink': '#FF69B4',
        'board-orange': '#FFA500',
        'board-red': '#FF0000',
        'board-yellow': '#FFD700',
        'board-green': '#228B22',
        'board-darkblue': '#000080',
        // Pokemon colors
        'poke-red': '#EE1515',
        'poke-blue': '#1E90FF',
        'poke-yellow': '#FFD733',
        // UI colors
        'pixel-bg': '#1a1a2e',
        'pixel-surface': '#16213e',
        'pixel-border': '#0f3460',
        'pixel-accent': '#e94560',
        'pixel-text': '#eaeaea',
      },
      boxShadow: {
        'pixel': '4px 4px 0px 0px rgba(0,0,0,0.8)',
        'pixel-sm': '2px 2px 0px 0px rgba(0,0,0,0.8)',
        'pixel-inset': 'inset 2px 2px 0px 0px rgba(0,0,0,0.3)',
      },
      animation: {
        'blink': 'blink 1s step-start infinite',
      },
      keyframes: {
        blink: {
          '50%': { opacity: '0' },
        },
      },
    },
  },
  plugins: [],
}
