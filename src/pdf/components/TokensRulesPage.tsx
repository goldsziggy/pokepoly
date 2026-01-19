import { Page, View, Text, StyleSheet } from '@react-pdf/renderer'
import type { PaperSize } from '@/types'
import { baseStyles, colors } from './styles'

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
    gap: 4,
  },
  house: {
    width: 15,
    height: 20,
    backgroundColor: '#4CAF50',
    borderWidth: 1,
    borderColor: colors.black,
  },
  hotel: {
    width: 20,
    height: 25,
    backgroundColor: '#F44336',
    borderWidth: 1,
    borderColor: colors.black,
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
            <Text style={styles.sectionTitle}>BERRIES (Houses) - 32 pieces</Text>
            <View style={styles.houseGrid}>
              {Array(16).fill(0).map((_, i) => (
                <View key={i} style={styles.house} />
              ))}
            </View>
            <Text style={[styles.rulesText, { marginTop: 4 }]}>Cut and fold for 3D effect</Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>EVOLUTION STONES (Hotels) - 12 pieces</Text>
            <View style={styles.houseGrid}>
              {Array(12).fill(0).map((_, i) => (
                <View key={i} style={styles.hotel} />
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
              Buy unowned Pokemon properties you land on. Collect rent when others land on yours.
            </Text>

            <Text style={styles.rulesBold}>Berries & Evolution Stones:</Text>
            <Text style={styles.rulesText}>
              Own all Pokemon properties of a color to build. 4 Berries = 1 Evolution Stone.
            </Text>

            <Text style={styles.rulesBold}>Team Rocket Hideout (Jail):</Text>
            <Text style={styles.rulesText}>
              Pay P50, use Full Restore card, or roll doubles to escape.
            </Text>

            <Text style={styles.rulesBold}>Gyms:</Text>
            <Text style={styles.rulesText}>
              Rent = P25 x number of Gyms owned. Collect when landed on.
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
