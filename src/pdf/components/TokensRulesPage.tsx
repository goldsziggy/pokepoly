import { Page, View, Text, StyleSheet, Image as PDFImage } from '@react-pdf/renderer'
import type { PaperSize } from '@/types'
import { baseStyles, colors } from './styles'

const base = (import.meta as ImportMeta & { env?: { BASE_URL?: string } }).env?.BASE_URL || '/'
const normalizedBase = base.endsWith('/') ? base : `${base}/`
const assetUrl = (path: string) => {
  const normalizedPath = path.startsWith('/') ? path.slice(1) : path
  return typeof window !== 'undefined'
    ? `${window.location.origin}${normalizedBase}${normalizedPath}`
    : `${normalizedBase}${normalizedPath}`
}
const GYM_BADGE_IMAGE = assetUrl('images/gym-badge.png')
const LEAGUE_BADGE_IMAGE = assetUrl('images/league-badge.png')

const styles = StyleSheet.create({
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 8,
    marginBottom: 8,
    color: colors.red,
  },
  tokenGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
  },
  token: {
    width: 40,
    height: 40,
    borderWidth: 2,
    borderColor: colors.black,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    margin: 4,
  },
  tokenLabel: {
    fontSize: 5,
    textAlign: 'center',
  },
  rulesText: {
    fontSize: 5,
    lineHeight: 1.5,
    marginBottom: 4,
  },
  rulesBold: {
    fontSize: 5,
    fontWeight: 'bold',
  },
  twoCol: {
    flexDirection: 'row',
    gap: 20,
  },
  col: {
    flex: 1,
  },
  houseGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 2,
  },
  badgeImage: {
    width: 40,
    height: 40,
    objectFit: 'contain',
  },
  leagueBadgeImage: {
    width: 48,
    height: 48,
    objectFit: 'contain',
  },
})

const TOKENS = [
  { label: 'Pikachu', color: '#FFD700' },
  { label: 'Bulbasaur', color: '#78C850' },
  { label: 'Charmander', color: '#F08030' },
  { label: 'Squirtle', color: '#6890F0' },
  { label: 'Eevee', color: '#A8A878' },
  { label: 'Jigglypuff', color: '#EE99AC' },
]

interface TokensRulesPageProps {
  paperSize: PaperSize
}

export function TokensRulesPage({ paperSize }: TokensRulesPageProps) {
  return (
    <Page size={paperSize.toUpperCase() as 'LETTER' | 'A4'} style={baseStyles.page}>
      <Text style={baseStyles.title}>Tokens, Pieces & Quick Rules</Text>

      <View style={styles.twoCol}>
        <View style={styles.col}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>PLAYER TOKENS (Cut Out)</Text>
            <View style={styles.tokenGrid}>
              {TOKENS.map((token, i) => (
                <View key={i} style={[styles.token, { backgroundColor: token.color }]}>
                  <Text style={styles.tokenLabel}>{token.label}</Text>
                </View>
              ))}
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Gym Badges (Houses) - 64 pieces</Text>
            <View style={styles.houseGrid}>
              {Array(64).fill(0).map((_, i) => (
                <PDFImage key={i} src={GYM_BADGE_IMAGE} style={styles.badgeImage} />
              ))}
            </View>
            <Text style={[styles.rulesText, { marginTop: 4 }]}>Cut out badges</Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>League Badges (Hotels) - 24 pieces</Text>
            <View style={styles.houseGrid}>
              {Array(24).fill(0).map((_, i) => (
                <PDFImage key={i} src={LEAGUE_BADGE_IMAGE} style={styles.leagueBadgeImage} />
              ))}
            </View>
          </View>
        </View>

        <View style={styles.col}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>QUICK START RULES</Text>

            <Text style={styles.rulesBold}>Setup:</Text>
            <Text style={styles.rulesText}>
              Each player starts with P1500. Place tokens on GO.
            </Text>

            <Text style={styles.rulesBold}>Gameplay:</Text>
            <Text style={styles.rulesText}>
              Roll two dice. Move that many spaces clockwise. Follow space instructions.
            </Text>

            <Text style={styles.rulesBold}>Properties:</Text>
            <Text style={styles.rulesText}>
              Land on an unclaimed Pokémon? Capture it (buy). Land on a Pokémon someone owns? You lost a battle — pay the owner the fee.
            </Text>

            <Text style={styles.rulesBold}>Gym Badges & League Badges:</Text>
            <Text style={styles.rulesText}>
              Own all Pokemon properties of a color to build. 4 Gym Badges = 1 League Badge.
            </Text>

            <Text style={styles.rulesBold}>Team Rocket Hideout (Jail):</Text>
            <Text style={styles.rulesText}>
              Pay P50, use Full Restore card, or roll doubles to escape.
            </Text>

            <Text style={styles.rulesBold}>Gyms:</Text>
            <Text style={styles.rulesText}>
              Rent = P25 × number of Gyms owned. Collect when landed on.
            </Text>

            <Text style={styles.rulesBold}>Utilities (Power Plant & Poké Mart):</Text>
            <Text style={styles.rulesText}>
              Roll dice and pay owner: 4× your roll if they own 1 utility, or 10× if they own both.
            </Text>

            <Text style={styles.rulesBold}>Winning:</Text>
            <Text style={styles.rulesText}>
              Last player with money wins! Or own 3 complete color sets and land on GO.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>STARTING MONEY</Text>
            <Text style={styles.rulesText}>2x P500 = P1000</Text>
            <Text style={styles.rulesText}>2x P100 = P200</Text>
            <Text style={styles.rulesText}>2x P50 = P100</Text>
            <Text style={styles.rulesText}>6x P20 = P120</Text>
            <Text style={styles.rulesText}>5x P10 = P50</Text>
            <Text style={styles.rulesText}>5x P5 = P25</Text>
            <Text style={styles.rulesText}>5x P1 = P5</Text>
            <Text style={[styles.rulesBold, { marginTop: 4 }]}>Total: P1500</Text>
          </View>
        </View>
      </View>
    </Page>
  )
}
