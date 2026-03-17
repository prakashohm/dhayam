/**
 * PlayerPanel.tsx
 * Displays a player's name, color indicator, coins remaining, and active status.
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Coin, GameState } from '../engine/gameEngine';
import { PLAYER_COLORS } from './themes';
import { DEFAULT_BOARD_CONFIG } from '../engine/boardConfig';

interface PlayerPanelProps {
  playerIndex: number;
  gameState: GameState;
  isActive: boolean;
  label: string;
}

export default function PlayerPanel({ playerIndex, gameState, isActive, label }: PlayerPanelProps) {
  const config = DEFAULT_BOARD_CONFIG;
  const playerColor = PLAYER_COLORS[config.players[playerIndex].color];
  const coins = gameState.coins.filter(c => c.playerId === playerIndex);
  const homeCount = coins.filter(c => c.position === 'home').length;
  const boardCount = coins.filter(c => c.position !== 'home' && !c.finished).length;
  const finishedCount = coins.filter(c => c.finished).length;

  return (
    <View style={[
      styles.container,
      { borderColor: playerColor.primary, borderWidth: isActive ? 2 : 1, backgroundColor: playerColor.light }
    ]}>
      <View style={[styles.colorBar, { backgroundColor: playerColor.primary }]} />
      <View style={styles.info}>
        <Text style={[styles.name, { color: playerColor.dark }]}>{label}</Text>
        <Text style={styles.stats}>
          🏠 {homeCount} · 🎯 {boardCount} · ✅ {finishedCount}
        </Text>
      </View>
      {isActive && <Text style={[styles.activeTag, { color: playerColor.dark }]}>▶</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 8,
    margin: 4,
    overflow: 'hidden',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 2,
  },
  colorBar: {
    width: 6,
    alignSelf: 'stretch',
  },
  info: {
    flex: 1,
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
  name: {
    fontWeight: 'bold',
    fontSize: 13,
  },
  stats: {
    fontSize: 11,
    color: '#555',
    marginTop: 2,
  },
  activeTag: {
    fontSize: 20,
    paddingRight: 8,
    fontWeight: 'bold',
  },
});
