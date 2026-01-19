#!/usr/bin/env node
/**
 * Script to download Press Start 2P font for PDF generation
 * Run with: npx tsx scripts/download-font.ts
 */

import { writeFileSync, mkdirSync } from 'fs'
import { join } from 'path'
import { fileURLToPath } from 'url'
import { dirname } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const rootDir = join(__dirname, '..')
const fontsDir = join(rootDir, 'public', 'fonts')

// Create fonts directory if it doesn't exist
mkdirSync(fontsDir, { recursive: true })

// Press Start 2P font URL from Google Fonts GitHub repository
// This is the direct download link for the regular TTF file
const fontUrl = 'https://raw.githubusercontent.com/google/fonts/main/ofl/pressstart2p/PressStart2P-Regular.ttf'
const fontPath = join(fontsDir, 'PressStart2P-Regular.ttf')

console.log('Downloading Press Start 2P font...')
console.log(`From: ${fontUrl}`)
console.log(`To: ${fontPath}`)

try {
  const response = await fetch(fontUrl)
  if (!response.ok) {
    throw new Error(`Failed to download font: ${response.status} ${response.statusText}`)
  }
  const buffer = await response.arrayBuffer()
  writeFileSync(fontPath, Buffer.from(buffer))
  console.log('✓ Font downloaded successfully!')
  console.log(`  Location: ${fontPath}`)
} catch (error) {
  console.error('✗ Failed to download font:', error)
  console.error('\nAlternative: Download manually from:')
  console.error('  https://fonts.google.com/specimen/Press+Start+2P')
  console.error(`  Save as: ${fontPath}`)
  process.exit(1)
}
