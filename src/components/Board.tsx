/**
 * Board.tsx
 * Cross-shaped Dhayam board rendered with React Native Views.
 * Supports 3 themes, highlights safe squares, legal moves, and selected coin.
 */

import React from 'react';
import { View, StyleSheet, Text, TouchableOpacity, Dimensions } from 'react-native';
import { BoardConfig, DEFAULT_BOARD_CONFIG } from '../engine/boardConfig';
import { Coin as CoinType, GameState, Move } from '../engine/gameEngine';
import { THEMES, PLAYER_COLORS } from './themes';
import { BoardTheme } from '../store/settingsStore';
import CoinPiece from './CoinPiece';

const { width: SCREEN_W } = Dimensions.get('window');
const BOARD_SIZE = Math.min(SCREEN_W - 32, 380);
const CELL = Math.floor(BOARD_SIZE / 11); // 11 cells wide/tall (Ludo-style)

interface BoardProps {
  gameState: GameState;
  legalMoves: Move[];
  onCoinPress: (coinId: string) => void;
  selectedCoin: string | null;
  theme: BoardTheme;
}

interface CellProps {
  squareId: string;
  coins: CoinType[];
  isSafe: boolean;
  isLegalTarget: boolean;
  isSelected: boolean;
  onCoinPress: (id: string) => void;
  theme: BoardColors;
}

import { BoardColors } from './themes';

function BoardCell({ squareId, coins, isSafe, isLegalTarget, isSelected, onCoinPress, theme }: CellProps) {
  const bg = isSafe ? theme.safeSquare : theme.outerTrack;
  const borderWidth = isLegalTarget ? 2 : 1;
  const borderColor = isLegalTarget ? '#FFD700' : theme.gridLine;

  return (
    <View style={[
      styles.cell,
      { width: CELL, height: CELL, backgroundColor: bg, borderWidth, borderColor }
    ]}>
      {isSafe && <Text style={styles.safeMarker}>★</Text>}
      {coins.map(coin => (
        <CoinPiece
          key={coin.id}
          coin={coin}
          isSelected={isSelected && coins.some(c => c.id === coin.id)}
          onPress={() => onCoinPress(coin.id)}
        />
      ))}
    </View>
  );
}

export default function Board({ gameState, legalMoves, onCoinPress, selectedCoin, theme }: BoardProps) {
  const colors = THEMES[theme];
  const config = gameState.config;

  const legalTargets = new Set(legalMoves.map(m => m.toSquare));
  const legalCoinIds = new Set(legalMoves.map(m => m.coinId));

  function coinsAt(squareId: string): CoinType[] {
    return gameState.coins.filter(c => !c.finished && c.position === squareId);
  }

  function renderOuterRow(indices: number[], horizontal = true) {
    return indices.map(idx => {
      const id = String(idx);
      const isLegal = legalTargets.has(id);
      const coinList = coinsAt(id);
      return (
        <BoardCell
          key={id}
          squareId={id}
          coins={coinList}
          isSafe={config.safeSquares.includes(idx)}
          isLegalTarget={isLegal}
          isSelected={selectedCoin ? coinList.some(c => c.id === selectedCoin) : false}
          onCoinPress={onCoinPress}
          theme={colors}
        />
      );
    });
  }

  // Build board rows for a Ludo-style cross (11×11 grid).
  // Rows 0-1: top arm (columns 4-6), rows 2-8: middle band (all 11), rows 9-10: bottom arm
  // Simplified visual: render as a flat cross with player home zones in corners.

  const homeStyle = (playerIdx: number) => ({
    backgroundColor: PLAYER_COLORS[config.players[playerIdx].color].light,
  });

  const homeCoins = (playerIdx: number) =>
    gameState.coins.filter(c => c.playerId === playerIdx && c.position === 'home');

  return (
    <View style={[styles.boardContainer, { width: BOARD_SIZE, height: BOARD_SIZE, backgroundColor: colors.boardBackground }]}>
      {/* Top row: home zones R/B with arm in middle */}
      <View style={styles.row}>
        <View style={[styles.homeZone, homeStyle(0)]}>
          <Text style={[styles.homeLabel, { color: PLAYER_COLORS.red.dark }]}>🔴</Text>
          <View style={styles.homeCoins}>
            {homeCoins(0).map(c => (
              <CoinPiece key={c.id} coin={c} isSelected={selectedCoin === c.id}
                onPress={() => legalCoinIds.has(c.id) && onCoinPress(c.id)} />
            ))}
          </View>
        </View>
        <View style={[styles.arm, { backgroundColor: colors.innerTrack }]}>
          {[0, 1, 2, 3, 4, 5].map(i => {
            const sq = String(i);
            return (
              <View key={sq} style={[styles.armCell, {
                width: CELL, height: CELL,
                backgroundColor: config.safeSquares.includes(i) ? colors.safeSquare : colors.outerTrack,
                borderColor: legalTargets.has(sq) ? '#FFD700' : colors.gridLine,
                borderWidth: legalTargets.has(sq) ? 2 : 1,
              }]}>
                {config.safeSquares.includes(i) && <Text style={styles.safeMarker}>★</Text>}
                {coinsAt(sq).map(c => <CoinPiece key={c.id} coin={c} isSelected={selectedCoin === c.id} onPress={() => onCoinPress(c.id)} />)}
              </View>
            );
          })}
        </View>
        <View style={[styles.homeZone, homeStyle(1)]}>
          <Text style={[styles.homeLabel, { color: PLAYER_COLORS.blue.dark }]}>🔵</Text>
          <View style={styles.homeCoins}>
            {homeCoins(1).map(c => (
              <CoinPiece key={c.id} coin={c} isSelected={selectedCoin === c.id}
                onPress={() => legalCoinIds.has(c.id) && onCoinPress(c.id)} />
            ))}
          </View>
        </View>
      </View>

      {/* Middle band */}
      <View style={[styles.middleBand, { backgroundColor: colors.outerTrack }]}>
        <View style={[styles.sideArm, { backgroundColor: colors.innerTrack }]}>
          {[51, 50, 49, 48, 47, 46].map(i => {
            const sq = String(i);
            return (
              <View key={sq} style={[styles.armCell, {
                width: CELL, height: CELL,
                backgroundColor: config.safeSquares.includes(i) ? colors.safeSquare : colors.outerTrack,
                borderColor: legalTargets.has(sq) ? '#FFD700' : colors.gridLine,
                borderWidth: legalTargets.has(sq) ? 2 : 1,
              }]}>
                {config.safeSquares.includes(i) && <Text style={styles.safeMarker}>★</Text>}
                {coinsAt(sq).map(c => <CoinPiece key={c.id} coin={c} isSelected={selectedCoin === c.id} onPress={() => onCoinPress(c.id)} />)}
              </View>
            );
          })}
        </View>
        {/* Center */}
        <View style={[styles.centerSquare, { backgroundColor: colors.centerSquare }]}>
          <Text style={styles.centerText}>🏠</Text>
          {coinsAt('CENTER').map(c => <CoinPiece key={c.id} coin={c} isSelected={false} onPress={() => {}} />)}
        </View>
        <View style={[styles.sideArm, { backgroundColor: colors.innerTrack }]}>
          {[13, 14, 15, 16, 17, 18].map(i => {
            const sq = String(i);
            return (
              <View key={sq} style={[styles.armCell, {
                width: CELL, height: CELL,
                backgroundColor: config.safeSquares.includes(i) ? colors.safeSquare : colors.outerTrack,
                borderColor: legalTargets.has(sq) ? '#FFD700' : colors.gridLine,
                borderWidth: legalTargets.has(sq) ? 2 : 1,
              }]}>
                {config.safeSquares.includes(i) && <Text style={styles.safeMarker}>★</Text>}
                {coinsAt(sq).map(c => <CoinPiece key={c.id} coin={c} isSelected={selectedCoin === c.id} onPress={() => onCoinPress(c.id)} />)}
              </View>
            );
          })}
        </View>
      </View>

      {/* Bottom row: home zones G/Y */}
      <View style={styles.row}>
        <View style={[styles.homeZone, homeStyle(3)]}>
          <Text style={[styles.homeLabel, { color: PLAYER_COLORS.yellow.dark }]}>🟡</Text>
          <View style={styles.homeCoins}>
            {homeCoins(3).map(c => (
              <CoinPiece key={c.id} coin={c} isSelected={selectedCoin === c.id}
                onPress={() => legalCoinIds.has(c.id) && onCoinPress(c.id)} />
            ))}
          </View>
        </View>
        <View style={[styles.arm, { backgroundColor: colors.innerTrack }]}>
          {[39, 38, 37, 36, 35, 34].map(i => {
            const sq = String(i);
            return (
              <View key={sq} style={[styles.armCell, {
                width: CELL, height: CELL,
                backgroundColor: config.safeSquares.includes(i) ? colors.safeSquare : colors.outerTrack,
                borderColor: legalTargets.has(sq) ? '#FFD700' : colors.gridLine,
                borderWidth: legalTargets.has(sq) ? 2 : 1,
              }]}>
                {config.safeSquares.includes(i) && <Text style={styles.safeMarker}>★</Text>}
                {coinsAt(sq).map(c => <CoinPiece key={c.id} coin={c} isSelected={selectedCoin === c.id} onPress={() => onCoinPress(c.id)} />)}
              </View>
            );
          })}
        </View>
        <View style={[styles.homeZone, homeStyle(2)]}>
          <Text style={[styles.homeLabel, { color: PLAYER_COLORS.green.dark }]}>🟢</Text>
          <View style={styles.homeCoins}>
            {homeCoins(2).map(c => (
              <CoinPiece key={c.id} coin={c} isSelected={selectedCoin === c.id}
                onPress={() => legalCoinIds.has(c.id) && onCoinPress(c.id)} />
            ))}
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  boardContainer: {
    borderRadius: 8,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  row: {
    flexDirection: 'row',
    flex: 2,
  },
  homeZone: {
    flex: 3,
    padding: 6,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
  },
  homeLabel: {
    fontSize: 22,
    marginBottom: 4,
  },
  homeCoins: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 4,
  },
  arm: {
    flex: 1,
    flexDirection: 'column',
    overflow: 'hidden',
  },
  armCell: {
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
  },
  middleBand: {
    flexDirection: 'row',
    flex: 3,
  },
  sideArm: {
    flex: 1,
    flexDirection: 'row',
    overflow: 'hidden',
  },
  centerSquare: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    margin: 2,
  },
  centerText: {
    fontSize: 28,
  },
  cell: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  safeMarker: {
    fontSize: 10,
    position: 'absolute',
    top: 1,
    right: 2,
    opacity: 0.6,
  },
});
