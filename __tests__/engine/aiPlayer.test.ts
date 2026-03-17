import { getAIMove } from '../../src/engine/aiPlayer';
import { initGame, GameState } from '../../src/engine/gameEngine';
import { DEFAULT_BOARD_CONFIG } from '../../src/engine/boardConfig';
import { DEFAULT_SETTINGS } from '../../src/engine/gameEngine';

function stateWithCoins(coinPositions: Record<string, string>): GameState {
  const base = initGame(DEFAULT_BOARD_CONFIG, { ...DEFAULT_SETTINGS, playerCount: 2 });
  return {
    ...base,
    currentPlayer: 0,
    phase: 'WAITING_MOVE',
    lastRollValue: 2,
    coins: base.coins.map(c => ({
      ...c,
      position: coinPositions[c.id] ?? 'home',
    })),
  };
}

describe('aiPlayer', () => {
  test('returns null when no legal moves', () => {
    const state = initGame(DEFAULT_BOARD_CONFIG, { ...DEFAULT_SETTINGS, entryRollValues: [1] });
    const move = getAIMove(state, 3); // roll 3, all coins home, cannot enter
    expect(move).toBeNull();
  });

  test('prefers cut move over safe square or advance', () => {
    // r0 at 3, b0 at 5 (non-safe) — p0 rolls 2 → can cut b0 (3+2=5)
    const state = stateWithCoins({ r0: '3', b0: '5' });
    const move = getAIMove(state, 2);
    expect(move).not.toBeNull();
    expect(move?.willCut).toBe(true);
    expect(move?.cutCoinId).toBe('b0');
  });

  test('prefers safe square over advance when no cut available', () => {
    // r0 at 6, safe square 8 is 2 steps away, b0 not nearby
    const state = stateWithCoins({ r0: '6' });
    const move = getAIMove(state, 2);
    expect(move).not.toBeNull();
    // Should move to square 8 (safe) — 6+2=8
    expect(move?.toSquare).toBe('8');
  });

  test('always returns a legal move when one exists', () => {
    const state = stateWithCoins({ r0: '3', r1: '10' });
    const move = getAIMove(state, 2);
    expect(move).not.toBeNull();
  });
});
