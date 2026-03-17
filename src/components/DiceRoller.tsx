/**
 * DiceRoller.tsx
 * Animated 4-stick dice with roll animation.
 */

import React, { useRef, useEffect } from 'react';
import { View, TouchableOpacity, Animated, Text, StyleSheet } from 'react-native';
import { DiceResult } from '../engine/diceEngine';

interface DiceRollerProps {
  lastRoll: DiceResult | null;
  isRolling: boolean;
  canRoll: boolean;
  onRoll: () => void;
  theme: { buttonBg: string; buttonText: string; textPrimary: string; cardBackground: string };
}

export default function DiceRoller({ lastRoll, isRolling, canRoll, onRoll, theme }: DiceRollerProps) {
  const rotations = [useRef(new Animated.Value(0)), useRef(new Animated.Value(0)),
    useRef(new Animated.Value(0)), useRef(new Animated.Value(0))];

  useEffect(() => {
    if (isRolling) {
      const anims = rotations.map((r, i) =>
        Animated.sequence([
          Animated.delay(i * 80),
          Animated.loop(
            Animated.timing(r.current, { toValue: 1, duration: 200, useNativeDriver: true }),
            { iterations: 3 }
          ),
        ])
      );
      Animated.parallel(anims).start();
    } else {
      rotations.forEach(r => r.current.setValue(0));
    }
  }, [isRolling]);

  const stickColor = (val: 0 | 1) => (val === 1 ? '#8B4513' : '#F5DEB3');

  return (
    <View style={styles.container}>
      {/* Stick display */}
      <View style={styles.sticksRow}>
        {(lastRoll?.sticks ?? [0, 0, 0, 0]).map((s, i) => {
          const rot = rotations[i].current.interpolate({
            inputRange: [0, 1],
            outputRange: ['0deg', '180deg'],
          });
          return (
            <Animated.View
              key={i}
              style={[
                styles.stick,
                { backgroundColor: stickColor(s as 0 | 1), transform: [{ rotateX: rot }] }
              ]}
            />
          );
        })}
      </View>

      {/* Value display */}
      {lastRoll && (
        <View style={styles.valueBox}>
          <Text style={[styles.valueText, { color: theme.textPrimary }]}>
            {lastRoll.isThayam ? 'THAYAM! 🎉' : `Rolled ${lastRoll.moveValue}`}
          </Text>
        </View>
      )}

      {/* Roll button */}
      <TouchableOpacity
        style={[
          styles.rollButton,
          { backgroundColor: canRoll ? theme.buttonBg : '#AAAAAA' }
        ]}
        onPress={onRoll}
        disabled={!canRoll || isRolling}
        activeOpacity={0.8}
        id="roll-dice-button"
      >
        <Text style={[styles.rollText, { color: theme.buttonText }]}>
          {isRolling ? '...' : '🎲 Roll'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  sticksRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 10,
  },
  stick: {
    width: 14,
    height: 60,
    borderRadius: 7,
    borderWidth: 1,
    borderColor: '#5C3317',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
  },
  valueBox: {
    marginBottom: 10,
  },
  valueText: {
    fontSize: 16,
    fontWeight: '600',
  },
  rollButton: {
    paddingVertical: 12,
    paddingHorizontal: 40,
    borderRadius: 25,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3,
  },
  rollText: {
    fontSize: 18,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
});
