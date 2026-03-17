/**
 * HowToPlayScreen.tsx
 * Beginner-friendly guide to Dhayam with text sections and visual indicators.
 */

import React from 'react';
import { View, Text, ScrollView, StyleSheet, SafeAreaView } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { useSettingsStore } from '../store/settingsStore';
import { THEMES } from '../components/themes';

type Props = { navigation: NativeStackNavigationProp<RootStackParamList, 'HowToPlay'> };

const SECTIONS = [
  {
    emoji: '🏁',
    title: 'The Board',
    text: `Dhayam is played on a cross-shaped board with a track of 52 squares around the outside and 6 inner squares per player leading to the center Home square.\n\nColoured corner zones are each player's starting area. Squares marked with ★ are SAFE squares.`,
  },
  {
    emoji: '🎲',
    title: 'The Dice (Dayakattai)',
    text: `Four long sticks are thrown as dice. Each stick has a scored face and an unscored face.\n\nCount how many land scored-side up:\n  • 0 scored (all face down) = THAYAM! → move 5\n  • 1 scored → move 1\n  • 2 scored → move 2\n  • 3 scored → move 3\n  • 4 scored → move 8\n\nRolling 1, 5 (Thayam), or 8 earns an extra roll!`,
  },
  {
    emoji: '🪙',
    title: 'Moving Coins',
    text: `All 4 coins start in your home zone (off the board).\n\nRoll a 1 or a Thayam (5) to enter the board.\n\nOnce on the board, coins move clockwise around the outer track, then turn inward along your personal path toward the center.\n\nA coin must land EXACTLY on the CENTER square to finish — rolling too far = no move!`,
  },
  {
    emoji: '✂️',
    title: 'Cutting',
    text: `If you land your coin on an opponent's coin on a NON-SAFE square, their coin is "cut" — sent back to their home zone!\n\nSafe squares (★) protect all coins from being cut.\n\nCutting an opponent earns you an extra roll (if the setting is enabled).`,
  },
  {
    emoji: '🏆',
    title: 'Winning',
    text: `The first player to move ALL their coins into the home CENTER square wins the game!\n\nCoins on the inner path are always safe from cuts — focus on advancing them!`,
  },
  {
    emoji: '💡',
    title: 'Strategy Tips',
    text: `• Always try to keep your coins on safe squares when possible.\n• Prioritise cutting opponents who are close to finishing.\n• Use Thayam rolls (5) to enter a new coin if you have multiple at home.\n• On the inner path, a coin is safe — focus on getting them all home!`,
  },
];

export default function HowToPlayScreen({ navigation }: Props) {
  const { settings } = useSettingsStore();
  const theme = THEMES[settings.boardTheme];

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.screenBackground }]}>
      <View style={[styles.header, { backgroundColor: theme.statusBar }]}>
        <Text onPress={() => navigation.goBack()} style={styles.back}>‹</Text>
        <Text style={styles.headerTitle}>How to Play</Text>
        <View style={{ width: 30 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={[styles.intro, { color: theme.textSecondary }]}>
          Dhayam (Dayakattai / Thayam) is a traditional South Indian strategy board game similar to Ludo — but played with stick dice!
        </Text>

        {SECTIONS.map((section, i) => (
          <View key={i} style={[styles.card, { backgroundColor: theme.cardBackground }]}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardEmoji}>{section.emoji}</Text>
              <Text style={[styles.cardTitle, { color: theme.textPrimary }]}>{section.title}</Text>
            </View>
            <Text style={[styles.cardText, { color: theme.textSecondary }]}>{section.text}</Text>
          </View>
        ))}

        {/* Visual board legend */}
        <View style={[styles.legend, { backgroundColor: theme.cardBackground }]}>
          <Text style={[styles.legendTitle, { color: theme.textPrimary }]}>Board Legend</Text>
          <View style={styles.legendRow}>
            <View style={[styles.legendSquare, { backgroundColor: '#F5E6C8', borderColor: '#8B6914' }]}>
              <Text style={styles.legendStar}>★</Text>
            </View>
            <Text style={[styles.legendLabel, { color: theme.textSecondary }]}>Safe square — no cutting allowed</Text>
          </View>
          <View style={styles.legendRow}>
            <View style={[styles.legendSquare, { backgroundColor: '#8B4513' }]}>
              <Text style={styles.legendCenter}>🏠</Text>
            </View>
            <Text style={[styles.legendLabel, { color: theme.textSecondary }]}>CENTER — finish your coins here</Text>
          </View>
          <View style={styles.legendRow}>
            <View style={styles.legendRow}>
              {['🔴', '🔵', '🟢', '🟡'].map((e, i) => (
                <Text key={i} style={{ fontSize: 18, marginRight: 4 }}>{e}</Text>
              ))}
            </View>
            <Text style={[styles.legendLabel, { color: theme.textSecondary }]}>Player home zones</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  back: { color: '#FFF', fontSize: 28, fontWeight: 'bold' },
  headerTitle: { color: '#FFF', fontSize: 18, fontWeight: '700' },
  content: { padding: 16, gap: 14 },
  intro: {
    fontSize: 14,
    lineHeight: 21,
    fontStyle: 'italic',
    textAlign: 'center',
    paddingHorizontal: 8,
    marginBottom: 4,
  },
  card: {
    borderRadius: 14,
    padding: 16,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    gap: 8,
  },
  cardEmoji: { fontSize: 26 },
  cardTitle: { fontSize: 18, fontWeight: '700' },
  cardText: { fontSize: 14, lineHeight: 22 },
  legend: {
    borderRadius: 14,
    padding: 16,
    gap: 10,
  },
  legendTitle: { fontSize: 16, fontWeight: '700', marginBottom: 4 },
  legendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  legendSquare: {
    width: 32,
    height: 32,
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
  },
  legendStar: { fontSize: 14, opacity: 0.7 },
  legendCenter: { fontSize: 14 },
  legendLabel: { fontSize: 13, flex: 1 },
});
