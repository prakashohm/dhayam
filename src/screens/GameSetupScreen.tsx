/**
 * GameSetupScreen.tsx
 * Pre-game setup: choose number of players and their names, then start.
 */

import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  SafeAreaView, ScrollView,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/types';
import { useSettingsStore } from '../store/settingsStore';
import { THEMES } from '../components/themes';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'GameSetup'>;
  route: RouteProp<RootStackParamList, 'GameSetup'>;
};

const DEFAULT_NAMES_LOCAL = ['Player 1', 'Player 2', 'Player 3', 'Player 4'];
const DEFAULT_NAMES_CPU = ['You', 'Computer', 'Computer 2', 'Computer 3'];

export default function GameSetupScreen({ navigation, route }: Props) {
  const { mode } = route.params;
  const { settings, updateSettings } = useSettingsStore();
  const theme = THEMES[settings.boardTheme];
  const isVsCPU = mode === 'computer';

  const [count, setCount] = useState<number>(settings.playerCount);
  const defaultNames = isVsCPU ? DEFAULT_NAMES_CPU : DEFAULT_NAMES_LOCAL;

  const handleStart = () => {
    updateSettings({ playerCount: count as any });
    navigation.replace('Game', { mode });
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.screenBackground }]}>
      <View style={[styles.header, { backgroundColor: theme.statusBar }]}>
        <Text onPress={() => navigation.goBack()} style={styles.back}>‹</Text>
        <Text style={styles.headerTitle}>
          {isVsCPU ? 'vs Computer' : 'Local Multiplayer'}
        </Text>
        <View style={{ width: 30 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={[styles.card, { backgroundColor: theme.cardBackground }]}>
          <Text style={[styles.label, { color: theme.textSecondary }]}>Number of Players</Text>
          <View style={styles.chips}>
            {(isVsCPU ? [2, 3, 4] : [2, 3, 4]).map(n => (
              <TouchableOpacity
                key={n}
                style={[styles.chip, { borderColor: theme.buttonBg }, count === n && { backgroundColor: theme.buttonBg }]}
                onPress={() => setCount(n)}
                id={`player-count-${n}`}
              >
                <Text style={{ color: count === n ? theme.buttonText : theme.textPrimary, fontWeight: '600', fontSize: 16 }}>{n}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Show player slots */}
        <View style={[styles.card, { backgroundColor: theme.cardBackground }]}>
          <Text style={[styles.label, { color: theme.textSecondary }]}>Players</Text>
          {Array.from({ length: count }, (_, i) => (
            <View key={i} style={[styles.playerRow, { borderBottomColor: theme.gridLine }]}>
              <View style={[styles.colorDot, { backgroundColor: ['#E53935','#1E88E5','#43A047','#FDD835'][i] }]} />
              <Text style={[styles.playerName, { color: theme.textPrimary }]}>{defaultNames[i]}</Text>
              {i === 0 && <Text style={[styles.youTag, { color: theme.textSecondary }]}>← You</Text>}
              {isVsCPU && i > 0 && <Text style={[styles.cpuTag, { color: theme.buttonBg }]}>AI</Text>}
            </View>
          ))}
        </View>

        <TouchableOpacity
          style={[styles.startButton, { backgroundColor: theme.buttonBg }]}
          onPress={handleStart}
          id="btn-start-game"
        >
          <Text style={[styles.startText, { color: theme.buttonText }]}>▶  Start Game</Text>
        </TouchableOpacity>
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
  label: { fontSize: 12, fontWeight: '600', letterSpacing: 0.5, marginBottom: 8 },
  card: {
    borderRadius: 14,
    padding: 16,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
  },
  chips: { flexDirection: 'row', gap: 10 },
  chip: {
    borderWidth: 1.5,
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  playerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: 12,
  },
  colorDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
  },
  playerName: { fontSize: 16, flex: 1 },
  youTag: { fontSize: 13, fontStyle: 'italic' },
  cpuTag: { fontSize: 13, fontWeight: '700' },
  startButton: {
    paddingVertical: 18,
    borderRadius: 14,
    alignItems: 'center',
    marginTop: 8,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  startText: { fontSize: 18, fontWeight: '800', letterSpacing: 1 },
});
