/**
 * CoinPiece.tsx
 * Animated coin that pulses when it's a legal move target.
 */

import React, { useEffect, useRef } from 'react';
import { TouchableOpacity, Animated, StyleSheet, Text } from 'react-native';
import { Coin } from '../engine/gameEngine';
import { PLAYER_COLORS } from './themes';
import { DEFAULT_BOARD_CONFIG } from '../engine/boardConfig';

interface CoinPieceProps {
  coin: Coin;
  isSelected: boolean;
  onPress: () => void;
  size?: number;
}

export default function CoinPiece({ coin, isSelected, onPress, size = 22 }: CoinPieceProps) {
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const color = PLAYER_COLORS[DEFAULT_BOARD_CONFIG.players[coin.playerId].color];

  useEffect(() => {
    if (isSelected) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.25, duration: 350, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 350, useNativeDriver: true }),
        ])
      ).start();
    } else {
      pulseAnim.stopAnimation();
      pulseAnim.setValue(1);
    }
  }, [isSelected]);

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
      <Animated.View style={[
        styles.coin,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: color.primary,
          borderColor: isSelected ? '#FFD700' : color.dark,
          borderWidth: isSelected ? 3 : 2,
          transform: [{ scale: pulseAnim }],
        }
      ]}>
        <Text style={[styles.coinLabel, { fontSize: size * 0.4 }]}>
          {coin.id.slice(1)}
        </Text>
      </Animated.View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  coin: {
    justifyContent: 'center',
    alignItems: 'center',
    margin: 1,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
  },
  coinLabel: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
});
