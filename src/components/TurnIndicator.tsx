/**
 * TurnIndicator.tsx
 * Full-screen overlay shown between turns in local multiplayer.
 * Prompts player to pass the phone and tap to start their turn.
 */

import React from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { PLAYER_COLORS } from './themes';
import { DEFAULT_BOARD_CONFIG } from '../engine/boardConfig';

interface TurnIndicatorProps {
  visible: boolean;
  playerIndex: number;
  playerName: string;
  onReady: () => void;
}

export default function TurnIndicator({ visible, playerIndex, playerName, onReady }: TurnIndicatorProps) {
  const color = PLAYER_COLORS[DEFAULT_BOARD_CONFIG.players[playerIndex].color];

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={[styles.overlay, { backgroundColor: color.primary + 'EE' }]}>
        <View style={styles.card}>
          <Text style={styles.passText}>📱 Pass the phone to</Text>
          <Text style={[styles.playerName, { color: color.primary }]}>{playerName}</Text>
          <TouchableOpacity
            style={[styles.readyButton, { backgroundColor: color.primary }]}
            onPress={onReady}
            id="turn-ready-button"
          >
            <Text style={styles.readyText}>Tap to Start Your Turn</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 32,
    alignItems: 'center',
    width: '100%',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  passText: {
    fontSize: 18,
    color: '#444',
    marginBottom: 8,
  },
  playerName: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 32,
  },
  readyButton: {
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 30,
  },
  readyText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
