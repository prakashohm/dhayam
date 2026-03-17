/**
 * GameScreen.tsx
 * Primary in-game screen. Orchestrates board, dice, player panels, status bar, and turn flow.
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, SafeAreaView,
  ScrollView, Alert,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/types';
import { useGameStore, currentLegalMoves, GameMode } from '../store/gameStore';
import { useSettingsStore } from '../store/settingsStore';
import { THEMES, PLAYER_COLORS } from '../components/themes';
import Board from '../components/Board';
import DiceRoller from '../components/DiceRoller';
import PlayerPanel from '../components/PlayerPanel';
import TurnIndicator from '../components/TurnIndicator';
import { rollDice, DEFAULT_DICE_MAPPING } from '../engine/diceEngine';
import { DiceResult } from '../engine/diceEngine';
import { Move } from '../engine/gameEngine';
import { DEFAULT_BOARD_CONFIG } from '../engine/boardConfig';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Game'>;
  route: RouteProp<RootStackParamList, 'Game'>;
};

const PLAYER_LABELS = ['You', 'Player 2', 'Player 3', 'Player 4'];
const AI_LABELS = ['You', 'Computer', 'Computer 2', 'Computer 3'];

export default function GameScreen({ navigation, route }: Props) {
  const { mode } = route.params;
  const { gameState, statusMessage, isRolling, startGame, doRoll, selectMove } = useGameStore();
  const { settings } = useSettingsStore();
  const theme = THEMES[settings.boardTheme];
  const [selectedCoin, setSelectedCoin] = useState<string | null>(null);
  const [lastRoll, setLastRoll] = useState<DiceResult | null>(null);
  const [showTurnIndicator, setShowTurnIndicator] = useState(false);
  const [pendingPlayer, setPendingPlayer] = useState(0);
  const prevPlayer = useRef<number>(-1);

  // Labels
  const labels = mode === 'computer' ? AI_LABELS : PLAYER_LABELS;

  useEffect(() => {
    startGame(mode as GameMode, {
      playerCount: settings.playerCount,
      coinsPerPlayer: settings.coinsPerPlayer,
      entryRollValues: settings.entryRollValues,
      extraRollValues: settings.extraRollValues,
      mustCutBeforeInner: settings.mustCutBeforeInner,
      cutGrantsExtraRoll: settings.cutGrantsExtraRoll,
    });
  }, []);

  // Show turn indicator for local multiplayer when player changes
  useEffect(() => {
    if (!gameState || mode !== 'local') return;
    const cur = gameState.currentPlayer;
    if (prevPlayer.current !== -1 && cur !== prevPlayer.current) {
      setPendingPlayer(cur);
      setShowTurnIndicator(true);
    }
    prevPlayer.current = cur;
  }, [gameState?.currentPlayer]);

  // Winner alert
  useEffect(() => {
    if (gameState?.winner !== null && gameState?.winner !== undefined) {
      setTimeout(() => {
        Alert.alert(
          '🎉 Game Over!',
          `${labels[gameState.winner!]} wins!`,
          [
            { text: 'Play Again', onPress: () => startGame(mode as GameMode) },
            { text: 'Home', onPress: () => navigation.popToTop() },
          ]
        );
      }, 500);
    }
  }, [gameState?.winner]);

  if (!gameState) return null;

  const legalMoves = currentLegalMoves(gameState);
  const isMyTurn = mode !== 'online' &&
    (mode === 'local' || gameState.currentPlayer === 0) &&
    gameState.phase !== 'GAME_OVER';

  const handleRoll = async () => {
    const result = rollDice(DEFAULT_DICE_MAPPING);
    setLastRoll(result);
    await doRoll();
    setSelectedCoin(null);
  };

  const handleCoinPress = (coinId: string) => {
    const legal = legalMoves.find(m => m.coinId === coinId);
    if (!legal) {
      // If already selected, show its legal targets
      setSelectedCoin(coinId);
      return;
    }
    // If coin is already selected, apply move
    if (selectedCoin === coinId) {
      selectMove(legal);
      setSelectedCoin(null);
    } else {
      setSelectedCoin(coinId);
    }
  };

  const handleBoardSquareSelect = (move: Move) => {
    selectMove(move);
    setSelectedCoin(null);
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.screenBackground }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: theme.statusBar }]}>
        <TouchableOpacity onPress={() => {
          Alert.alert('Quit', 'Quit current game?', [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Quit', onPress: () => navigation.popToTop() },
          ]);
        }}>
          <Text style={styles.headerBack}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Dhayam</Text>
        <View style={{ width: 30 }} />
      </View>

      {/* Status bar */}
      <View style={[styles.statusBar, { backgroundColor: theme.cardBackground }]}>
        <Text style={[styles.statusText, { color: theme.textPrimary }]}>{statusMessage}</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Player panels top */}
        <View style={styles.playerPanelsRow}>
          {Array.from({ length: settings.playerCount }, (_, i) => (
            <View key={i} style={{ flex: 1 }}>
              <PlayerPanel
                playerIndex={i}
                gameState={gameState}
                isActive={gameState.currentPlayer === i}
                label={labels[i]}
              />
            </View>
          ))}
        </View>

        {/* Board */}
        <View style={styles.boardWrapper}>
          <Board
            gameState={gameState}
            legalMoves={legalMoves}
            onCoinPress={handleCoinPress}
            selectedCoin={selectedCoin}
            theme={settings.boardTheme}
          />
        </View>

        {/* Dice */}
        <DiceRoller
          lastRoll={lastRoll}
          isRolling={isRolling}
          canRoll={isMyTurn && gameState.phase === 'WAITING_ROLL'}
          onRoll={handleRoll}
          theme={theme}
        />

        {/* Legal moves list when coin selected */}
        {selectedCoin && legalMoves.length > 0 && (
          <View style={[styles.movesPanel, { backgroundColor: theme.cardBackground }]}>
            <Text style={[styles.movesPanelTitle, { color: theme.textPrimary }]}>
              Select destination:
            </Text>
            {legalMoves.filter(m => m.coinId === selectedCoin).map(m => (
              <TouchableOpacity
                key={m.toSquare}
                style={[styles.moveOption, { borderColor: theme.buttonBg }]}
                onPress={() => handleBoardSquareSelect(m)}
              >
                <Text style={{ color: theme.textPrimary }}>
                  → Square {m.toSquare} {m.willCut ? '✂️ CUT!' : ''}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>

      {/* Local multiplayer pass-phone overlay */}
      <TurnIndicator
        visible={showTurnIndicator}
        playerIndex={pendingPlayer}
        playerName={labels[pendingPlayer]}
        onReady={() => setShowTurnIndicator(false)}
      />
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
  headerBack: { color: '#FFF', fontSize: 28, fontWeight: 'bold' },
  headerTitle: { color: '#FFF', fontSize: 18, fontWeight: '700', letterSpacing: 1 },
  statusBar: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  statusText: { fontSize: 14, fontWeight: '600' },
  content: {
    paddingBottom: 24,
    alignItems: 'center',
  },
  playerPanelsRow: {
    flexDirection: 'row',
    paddingHorizontal: 8,
    paddingTop: 8,
    width: '100%',
  },
  boardWrapper: {
    marginVertical: 12,
    paddingHorizontal: 16,
    alignSelf: 'center',
  },
  movesPanel: {
    margin: 12,
    padding: 12,
    borderRadius: 12,
    width: '90%',
  },
  movesPanelTitle: {
    fontWeight: '600',
    marginBottom: 8,
  },
  moveOption: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    marginBottom: 6,
  },
});
