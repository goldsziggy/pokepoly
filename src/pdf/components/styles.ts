import { StyleSheet, Font } from '@react-pdf/renderer'

// Register Press Start 2P font
// Note: Press Start 2P only has a regular style (no italic or bold variants)
// For browser-based PDF generation, we need an absolute URL
// Priority: 1) Local font (if downloaded), 2) GitHub CDN (reliable fallback)
const fontUrl =
  typeof window !== 'undefined'
    ? `${window.location.origin}/fonts/PressStart2P-Regular.ttf`
    : 'https://raw.githubusercontent.com/google/fonts/main/ofl/pressstart2p/PressStart2P-Regular.ttf'

Font.register({
  family: 'PressStart2P',
  fonts: [
    {
      src: fontUrl,
      fontWeight: 400,
      fontStyle: 'normal',
    },
  ],
})

export const colors = {
  brown: '#8B4513',
  lightblue: '#87CEEB',
  pink: '#FF69B4',
  orange: '#FFA500',
  red: '#FF0000',
  yellow: '#FFD700',
  green: '#228B22',
  darkblue: '#000080',
  black: '#000000',
  white: '#FFFFFF',
  cream: '#FFFDD0',
  boardGreen: '#C8E6C9',
}

export const baseStyles = StyleSheet.create({
  page: {
    padding: 36,
    fontFamily: 'PressStart2P',
    fontSize: 6,
  },
  title: {
    fontSize: 12,
    textAlign: 'center',
    marginBottom: 20,
    color: colors.black,
  },
  subtitle: {
    fontSize: 8,
    textAlign: 'center',
    marginBottom: 10,
    color: '#666',
  },
  row: {
    flexDirection: 'row',
  },
  col: {
    flexDirection: 'column',
  },
  centered: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  border: {
    borderWidth: 1,
    borderColor: colors.black,
  },
  bold: {
    fontWeight: 'bold',
  },
})

export const cardStyles = StyleSheet.create({
  card: {
    width: 180,
    height: 100,
    borderWidth: 2,
    borderColor: colors.black,
    backgroundColor: colors.white,
    padding: 6,
    margin: 4,
  },
  cardTitle: {
    fontSize: 7,
    textAlign: 'center',
    marginBottom: 4,
    fontWeight: 'bold',
  },
  cardDescription: {
    fontSize: 5,
    textAlign: 'center',
    marginBottom: 4,
    fontStyle: 'normal', // Press Start 2P doesn't have italic variant
  },
  cardEffect: {
    fontSize: 5,
    textAlign: 'center',
  },
})

export const deedStyles = StyleSheet.create({
  deed: {
    width: 120,
    height: 180,
    borderWidth: 2,
    borderColor: colors.black,
    backgroundColor: colors.white,
    margin: 4,
  },
  deedHeader: {
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  deedTitle: {
    fontSize: 6,
    color: colors.white,
    textAlign: 'center',
  },
  deedBody: {
    padding: 6,
    flex: 1,
  },
  deedName: {
    fontSize: 7,
    textAlign: 'center',
    marginBottom: 6,
    fontWeight: 'bold',
  },
  deedPrice: {
    fontSize: 6,
    textAlign: 'center',
    marginBottom: 8,
  },
  rentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  rentLabel: {
    fontSize: 5,
  },
  rentValue: {
    fontSize: 5,
    fontWeight: 'bold',
  },
})

export const moneyStyles = StyleSheet.create({
  bill: {
    width: 200,
    height: 80,
    borderWidth: 2,
    borderColor: colors.black,
    margin: 4,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  billValue: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  billLabel: {
    fontSize: 6,
    marginLeft: 8,
  },
})
