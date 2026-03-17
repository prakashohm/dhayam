/**
 * SettingsScreen.tsx
 * All game rules, appearance, audio, and language settings.
 */

import React from 'react';
import {
  View, Text, StyleSheet, SafeAreaView, ScrollView,
  Switch, TouchableOpacity, Alert,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { useSettingsStore, AppSettings, BoardTheme, CoinStyle } from '../store/settingsStore';
import { THEMES } from '../components/themes';

type Props = { navigation: NativeStackNavigationProp<RootStackParamList, 'Settings'> };

function SectionHeader({ label, theme }: { label: string; theme: any }) {
  return (
    <Text style={[styles.sectionHeader, { color: theme.textSecondary }]}>{label.toUpperCase()}</Text>
  );
}

function ToggleRow({ label, value, onChange, theme }: {
  label: string; value: boolean; onChange: (v: boolean) => void; theme: any;
}) {
  return (
    <View style={[styles.row, { borderBottomColor: theme.gridLine }]}>
      <Text style={[styles.rowLabel, { color: theme.textPrimary }]}>{label}</Text>
      <Switch value={value} onValueChange={onChange} trackColor={{ true: theme.buttonBg }} />
    </View>
  );
}

function ChipSelector({ label, options, value, onChange, theme }: {
  label: string; options: { label: string; value: any }[];
  value: any; onChange: (v: any) => void; theme: any;
}) {
  return (
    <View style={[styles.chipBlock, { borderBottomColor: theme.gridLine }]}>
      <Text style={[styles.rowLabel, { color: theme.textPrimary }]}>{label}</Text>
      <View style={styles.chips}>
        {options.map(opt => (
          <TouchableOpacity
            key={String(opt.value)}
            style={[
              styles.chip,
              { borderColor: theme.buttonBg },
              value === opt.value && { backgroundColor: theme.buttonBg },
            ]}
            onPress={() => onChange(opt.value)}
          >
            <Text style={[
              styles.chipText,
              { color: value === opt.value ? theme.buttonText : theme.textPrimary }
            ]}>
              {opt.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

export default function SettingsScreen({ navigation }: Props) {
  const { settings, updateSettings, resetSettings } = useSettingsStore();
  const theme = THEMES[settings.boardTheme];

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.screenBackground }]}>
      <View style={[styles.header, { backgroundColor: theme.statusBar }]}>
        <Text onPress={() => navigation.goBack()} style={styles.back}>‹</Text>
        <Text style={styles.headerTitle}>Settings</Text>
        <View style={{ width: 30 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>

        <SectionHeader label="Game Rules" theme={theme} />
        <View style={[styles.card, { backgroundColor: theme.cardBackground }]}>
          <ChipSelector
            label="Players"
            options={[{ label: '2', value: 2 }, { label: '3', value: 3 }, { label: '4', value: 4 }]}
            value={settings.playerCount}
            onChange={v => updateSettings({ playerCount: v })}
            theme={theme}
          />
          <ChipSelector
            label="Coins per player"
            options={[{ label: '4', value: 4 }, { label: '6', value: 6 }]}
            value={settings.coinsPerPlayer}
            onChange={v => updateSettings({ coinsPerPlayer: v })}
            theme={theme}
          />
          <ToggleRow
            label="Extra roll on cut"
            value={settings.cutGrantsExtraRoll}
            onChange={v => updateSettings({ cutGrantsExtraRoll: v })}
            theme={theme}
          />
          <ToggleRow
            label="Must cut before inner path"
            value={settings.mustCutBeforeInner}
            onChange={v => updateSettings({ mustCutBeforeInner: v })}
            theme={theme}
          />
          <View style={[styles.row, { borderBottomColor: theme.gridLine }]}>
            <Text style={[styles.rowLabel, { color: theme.textPrimary }]}>Turn timer (sec)</Text>
            <View style={styles.chips}>
              {[15, 30, 60].map(s => (
                <TouchableOpacity
                  key={s}
                  style={[
                    styles.chip,
                    { borderColor: theme.buttonBg },
                    settings.turnTimerSeconds === s && { backgroundColor: theme.buttonBg },
                  ]}
                  onPress={() => updateSettings({ turnTimerSeconds: s })}
                >
                  <Text style={{ color: settings.turnTimerSeconds === s ? theme.buttonText : theme.textPrimary, fontSize: 13 }}>
                    {s}s
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>

        <SectionHeader label="Appearance" theme={theme} />
        <View style={[styles.card, { backgroundColor: theme.cardBackground }]}>
          <ChipSelector
            label="Board Theme"
            options={[
              { label: '🪵 Classic', value: 'classic' as BoardTheme },
              { label: '☀️ Light', value: 'minimal' as BoardTheme },
              { label: '🌙 Dark', value: 'dark' as BoardTheme },
            ]}
            value={settings.boardTheme}
            onChange={v => updateSettings({ boardTheme: v })}
            theme={theme}
          />
          <ChipSelector
            label="Coin Style"
            options={[
              { label: '⭕ Circle', value: 'circle' as CoinStyle },
              { label: '⭐ Star', value: 'star' as CoinStyle },
              { label: '🪙 Token', value: 'token' as CoinStyle },
            ]}
            value={settings.coinStyle}
            onChange={v => updateSettings({ coinStyle: v })}
            theme={theme}
          />
        </View>

        <SectionHeader label="Audio" theme={theme} />
        <View style={[styles.card, { backgroundColor: theme.cardBackground }]}>
          <ToggleRow
            label="Sound Effects"
            value={settings.soundEnabled}
            onChange={v => updateSettings({ soundEnabled: v })}
            theme={theme}
          />
          <ToggleRow
            label="Haptic Feedback"
            value={settings.hapticEnabled}
            onChange={v => updateSettings({ hapticEnabled: v })}
            theme={theme}
          />
        </View>

        <TouchableOpacity
          style={[styles.resetButton, { borderColor: '#E53935' }]}
          onPress={() => {
            Alert.alert('Reset Settings', 'Reset all settings to defaults?', [
              { text: 'Cancel', style: 'cancel' },
              { text: 'Reset', style: 'destructive', onPress: resetSettings },
            ]);
          }}
        >
          <Text style={{ color: '#E53935', fontWeight: '600' }}>Reset to Defaults</Text>
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
  content: { padding: 16, paddingBottom: 40 },
  sectionHeader: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.5,
    marginBottom: 6,
    marginTop: 14,
    paddingHorizontal: 4,
  },
  card: {
    borderRadius: 14,
    overflow: 'hidden',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  rowLabel: { fontSize: 15, flex: 1 },
  chipBlock: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: 8,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 6,
  },
  chip: {
    borderWidth: 1.5,
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 14,
  },
  chipText: { fontSize: 13, fontWeight: '600' },
  resetButton: {
    marginTop: 24,
    borderWidth: 1.5,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
});
