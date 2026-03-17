/**
 * HomeScreen.tsx
 */

import React from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  SafeAreaView, StatusBar, Dimensions, ImageBackground,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { useSettingsStore } from '../store/settingsStore';
import { THEMES } from '../components/themes';

type Props = { navigation: NativeStackNavigationProp<RootStackParamList, 'Home'> };

const BUTTONS = [
  { label: '🤖  Play vs Computer', screen: 'GameSetup' as const, mode: 'computer', id: 'btn-vs-computer' },
  { label: '👥  Local Multiplayer', screen: 'GameSetup' as const, mode: 'local', id: 'btn-local' },
  { label: '🌐  Online Multiplayer', screen: 'Online' as const, mode: 'online', id: 'btn-online' },
  { label: '📖  How to Play', screen: 'HowToPlay' as const, mode: null, id: 'btn-how' },
  { label: '⚙️  Settings', screen: 'Settings' as const, mode: null, id: 'btn-settings' },
];

export default function HomeScreen({ navigation }: Props) {
  const { settings } = useSettingsStore();
  const theme = THEMES[settings.boardTheme];

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.screenBackground }]}>
      <StatusBar barStyle="dark-content" backgroundColor={theme.screenBackground} />

      <View style={styles.heroSection}>
        <Text style={[styles.emoji]}>🎲</Text>
        <Text style={[styles.title, { color: theme.textPrimary }]}>Dhayam</Text>
        <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
          The Classic South Indian Board Game
        </Text>
      </View>

      <View style={styles.buttonList}>
        {BUTTONS.map(btn => (
          <TouchableOpacity
            key={btn.id}
            id={btn.id}
            style={[styles.button, { backgroundColor: theme.buttonBg }]}
            activeOpacity={0.85}
            onPress={() => {
              if (btn.mode) {
                navigation.navigate(btn.screen, { mode: btn.mode as any });
              } else {
                navigation.navigate(btn.screen as any);
              }
            }}
          >
            <Text style={[styles.buttonText, { color: theme.buttonText }]}>{btn.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={[styles.footer, { color: theme.textSecondary }]}>
        Dayakattai · தாயம் · Thayam
      </Text>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  heroSection: {
    alignItems: 'center',
    paddingTop: 56,
    paddingBottom: 32,
  },
  emoji: { fontSize: 72, marginBottom: 12 },
  title: {
    fontSize: 48,
    fontWeight: '900',
    letterSpacing: 3,
  },
  subtitle: {
    fontSize: 15,
    marginTop: 6,
    textAlign: 'center',
    paddingHorizontal: 24,
    fontStyle: 'italic',
  },
  buttonList: {
    paddingHorizontal: 32,
    gap: 12,
  },
  button: {
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  buttonText: {
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  footer: {
    textAlign: 'center',
    paddingVertical: 24,
    fontSize: 13,
    letterSpacing: 2,
  },
});
