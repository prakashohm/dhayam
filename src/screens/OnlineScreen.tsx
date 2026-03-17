/**
 * OnlineScreen.tsx
 * Create or join an online multiplayer room via Firebase.
 */

import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  SafeAreaView, Alert, ActivityIndicator, Share, ScrollView,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { useSettingsStore } from '../store/settingsStore';
import { useGameStore } from '../store/gameStore';
import { THEMES } from '../components/themes';
import { createRoom, joinRoom, getInviteLink, startGame as fbStartGame } from '../firebase/rooms';
import { initGame, DEFAULT_SETTINGS } from '../engine/gameEngine';
import { DEFAULT_BOARD_CONFIG } from '../engine/boardConfig';

type Props = { navigation: NativeStackNavigationProp<RootStackParamList, 'Online'> };

function generatePlayerId() {
  return Math.random().toString(36).substring(2, 10);
}

export default function OnlineScreen({ navigation }: Props) {
  const { settings } = useSettingsStore();
  const { applyRemoteState } = useGameStore();
  const theme = THEMES[settings.boardTheme];

  const [tab, setTab] = useState<'create' | 'join'>('create');
  const [name, setName] = useState('');
  const [joinCode, setJoinCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [createdCode, setCreatedCode] = useState<string | null>(null);
  const [playerCount, setPlayerCount] = useState(2);

  const playerId = generatePlayerId();

  const handleCreate = async () => {
    if (!name.trim()) { Alert.alert('Enter your name'); return; }
    setLoading(true);
    try {
      const code = await createRoom({ id: playerId, name: name.trim(), playerIndex: 0, connected: true });
      setCreatedCode(code);
    } catch (e) {
      Alert.alert('Error', 'Could not create room. Check Firebase config.');
    }
    setLoading(false);
  };

  const handleShare = async () => {
    if (!createdCode) return;
    const link = getInviteLink(createdCode);
    Share.share({ message: `Join my Dhayam game! Room code: ${createdCode}\n${link}` });
  };

  const handleStart = async () => {
    if (!createdCode) return;
    setLoading(true);
    try {
      const gameState = initGame(DEFAULT_BOARD_CONFIG, {
        ...DEFAULT_SETTINGS,
        playerCount: playerCount as any,
      });
      await fbStartGame(createdCode, gameState);
      applyRemoteState(gameState);
      navigation.replace('Game', { mode: 'online' });
    } catch {
      Alert.alert('Error', 'Could not start game.');
    }
    setLoading(false);
  };

  const handleJoin = async () => {
    if (!name.trim()) { Alert.alert('Enter your name'); return; }
    if (joinCode.trim().length < 6) { Alert.alert('Enter a 6-character room code'); return; }
    setLoading(true);
    try {
      const room = await joinRoom(joinCode.trim(), { id: playerId, name: name.trim(), playerIndex: -1, connected: true });
      if (!room) {
        Alert.alert('Room not found', 'Check the code and try again.');
      } else if (room.gameState) {
        applyRemoteState(room.gameState);
        navigation.replace('Game', { mode: 'online' });
      } else {
        Alert.alert('Waiting', 'Joined room! Waiting for host to start the game.');
      }
    } catch {
      Alert.alert('Error', 'Could not join room.');
    }
    setLoading(false);
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.screenBackground }]}>
      <View style={[styles.header, { backgroundColor: theme.statusBar }]}>
        <Text onPress={() => navigation.goBack()} style={styles.back}>‹</Text>
        <Text style={styles.headerTitle}>Online Multiplayer</Text>
        <View style={{ width: 30 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Tabs */}
        <View style={[styles.tabs, { backgroundColor: theme.cardBackground }]}>
          {(['create', 'join'] as const).map(t => (
            <TouchableOpacity
              key={t}
              style={[styles.tab, tab === t && { backgroundColor: theme.buttonBg }]}
              onPress={() => setTab(t)}
            >
              <Text style={[styles.tabText, { color: tab === t ? theme.buttonText : theme.textSecondary }]}>
                {t === 'create' ? 'Create Room' : 'Join Room'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={[styles.card, { backgroundColor: theme.cardBackground }]}>
          <Text style={[styles.label, { color: theme.textSecondary }]}>Your Name</Text>
          <TextInput
            style={[styles.input, { borderColor: theme.gridLine, color: theme.textPrimary, backgroundColor: theme.screenBackground }]}
            value={name}
            onChangeText={setName}
            placeholder="Enter your name"
            placeholderTextColor={theme.textSecondary}
            maxLength={20}
          />

          {tab === 'join' && (
            <>
              <Text style={[styles.label, { color: theme.textSecondary }]}>Room Code</Text>
              <TextInput
                style={[styles.input, styles.codeInput, { borderColor: theme.gridLine, color: theme.textPrimary, backgroundColor: theme.screenBackground }]}
                value={joinCode}
                onChangeText={v => setJoinCode(v.toUpperCase())}
                placeholder="XXXXXX"
                placeholderTextColor={theme.textSecondary}
                maxLength={6}
                autoCapitalize="characters"
              />
            </>
          )}

          {tab === 'create' && (
            <>
              <Text style={[styles.label, { color: theme.textSecondary }]}>Players</Text>
              <View style={styles.chips}>
                {[2, 3, 4].map(n => (
                  <TouchableOpacity
                    key={n}
                    style={[styles.chip, { borderColor: theme.buttonBg }, playerCount === n && { backgroundColor: theme.buttonBg }]}
                    onPress={() => setPlayerCount(n)}
                  >
                    <Text style={{ color: playerCount === n ? theme.buttonText : theme.textPrimary, fontWeight: '600' }}>{n}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </>
          )}

          <TouchableOpacity
            style={[styles.primaryButton, { backgroundColor: theme.buttonBg }]}
            onPress={tab === 'create' ? handleCreate : handleJoin}
            disabled={loading}
            id={tab === 'create' ? 'btn-create-room' : 'btn-join-room'}
          >
            {loading ? (
              <ActivityIndicator color={theme.buttonText} />
            ) : (
              <Text style={[styles.primaryButtonText, { color: theme.buttonText }]}>
                {tab === 'create' ? 'Create Room' : 'Join Room'}
              </Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Created room info */}
        {createdCode && (
          <View style={[styles.codeCard, { backgroundColor: theme.cardBackground }]}>
            <Text style={[styles.codeLabel, { color: theme.textSecondary }]}>Your Room Code</Text>
            <Text style={[styles.code, { color: theme.buttonBg }]}>{createdCode}</Text>
            <TouchableOpacity style={[styles.shareButton, { borderColor: theme.buttonBg }]} onPress={handleShare}>
              <Text style={{ color: theme.buttonBg, fontWeight: '600' }}>📤 Share Invite Link</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.primaryButton, { backgroundColor: theme.buttonBg, marginTop: 12 }]}
              onPress={handleStart}
              id="btn-start-online"
            >
              <Text style={[styles.primaryButtonText, { color: theme.buttonText }]}>Start Game</Text>
            </TouchableOpacity>
            <Text style={[styles.hintText, { color: theme.textSecondary }]}>
              Share the code with friends, then tap Start when everyone has joined.
            </Text>
          </View>
        )}
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
  tabs: {
    flexDirection: 'row',
    borderRadius: 12,
    overflow: 'hidden',
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 10,
  },
  tabText: { fontWeight: '700', fontSize: 15 },
  card: {
    borderRadius: 14,
    padding: 16,
    gap: 8,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
  },
  label: { fontSize: 12, fontWeight: '600', letterSpacing: 0.5, marginBottom: 2 },
  input: {
    borderWidth: 1.5,
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 14,
    fontSize: 16,
  },
  codeInput: {
    fontSize: 24,
    letterSpacing: 6,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  chips: { flexDirection: 'row', gap: 8 },
  chip: {
    borderWidth: 1.5,
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 18,
  },
  primaryButton: {
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  primaryButtonText: { fontSize: 16, fontWeight: '700' },
  codeCard: {
    borderRadius: 14,
    padding: 20,
    alignItems: 'center',
    gap: 8,
  },
  codeLabel: { fontSize: 13 },
  code: {
    fontSize: 40,
    fontWeight: '900',
    letterSpacing: 8,
  },
  shareButton: {
    borderWidth: 1.5,
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 20,
    marginTop: 4,
  },
  hintText: { fontSize: 12, textAlign: 'center', marginTop: 4 },
});
