import {
  initGame,
  getLegalMoves,
  applyMove,
  applyRoll,
  checkWin,
  getNextPlayer,
  GameState,
} from '../../src/engine/gameEngine';
import { DEFAULT_BOARD_CONFIG } from '../../src/engine/boardConfig';
import { DEFAULT_SETTINGS } from '../../src/engine/gameEngine';

function freshState(overrides?: Partial<typeof DEFAULT_SETTINGS>): GameState {
  return initGame(DEFAULT_BOARD_CONFIG, { ...DEFAULT_SETTINGS, ...overrides });
}

describe('gameEngine — init', () => {
  test('creates correct number of coins', () => {
    const state = freshState({ playerCount: 4, coinsPerPlayer: 4 });
    expect(state.coins).toHaveLength(16);
  });

  test('all coins start at home', () => {
    const state = freshState();
    state.coins.forEach(c => expect(c.position).toBe('home'));
  });

  test('first player is 0', () => {
    const state = freshState();
    expect(state.currentPlayer).toBe(0);
  });
});

describe('gameEngine — entry', () => {
  test('cannot enter on non-entry roll', () => {
    const state = freshState({ entryRollValues: [1, 5] });
    const moves = getLegalMoves(state, 3);
    expect(moves).toHaveLength(0);
  });

  test('can enter on entry roll', () => {
    const state = freshState({ entryRollValues: [1, 5] });
    const moves = getLegalMoves(state, 1);
    expect(moves.length).toBeGreaterThan(0);
  });

  test('entering places coin at player entry square', () => {
    const state = freshState({ entryRollValues: [1, 5] });
    const moves = getLegalMoves(state, 1);
    const move = moves[0];
    const entrySquare = String(DEFAULT_BOARD_CONFIG.players[0].entrySquare);
    expect(move.toSquare).toBe(entrySquare);
  });
});

describe('gameEngine — movement', () => {
  test('coin advances along path after entry', () => {
    const state = freshState({ entryRollValues: [1], extraRollValues: [1, 5, 8] });
    // Roll a 1 so a coin can enter
    const afterRoll1 = applyRoll(state, 1);
    expect(afterRoll1.phase).toBe('WAITING_MOVE');
    const entryMoves = getLegalMoves(afterRoll1, 1);
    expect(entryMoves.length).toBeGreaterThan(0);

    const result1 = applyMove(afterRoll1, entryMoves[0]);
    // Roll=1 is in extraRollValues → same player gets to roll again
    expect(result1.newState.currentPlayer).toBe(0);
    expect(result1.newState.phase).toBe('WAITING_ROLL');

    // Roll a 2 — coin on board should advance 2 squares
    const state2 = applyRoll(result1.newState, 2);
    expect(state2.phase).toBe('WAITING_MOVE');
    const movesAfter = getLegalMoves(state2, 2);
    expect(movesAfter.length).toBeGreaterThan(0);
    const result2 = applyMove(state2, movesAfter[0]);
    const movedCoin = result2.newState.coins.find(c => c.id === entryMoves[0].coinId)!;
    expect(movedCoin.position).not.toBe('home');
  });
});

describe('gameEngine — cutting', () => {
  test('landing on opponent coin on non-safe square causes cut', () => {
    // Place player 0 coin and player 1 coin on the same non-safe square manually
    const state = freshState();
    const ns = state;

    // Manually position p0 coin at square 5 and p1 at square 3
    // then roll 2 for p0 → lands on 5 (same as p1)
    const test: GameState = {
      ...ns,
      currentPlayer: 0,
      phase: 'WAITING_MOVE',
      lastRollValue: 2,
      coins: [
        { id: 'r0', playerId: 0, position: '3', finished: false },  // p0 coin at 3
        { id: 'r1', playerId: 0, position: 'home', finished: false },
        { id: 'r2', playerId: 0, position: 'home', finished: false },
        { id: 'r3', playerId: 0, position: 'home', finished: false },
        { id: 'b0', playerId: 1, position: '5', finished: false },  // p1 coin at 5 (non-safe)
        { id: 'b1', playerId: 1, position: 'home', finished: false },
        { id: 'b2', playerId: 1, position: 'home', finished: false },
        { id: 'b3', playerId: 1, position: 'home', finished: false },
        { id: 'g0', playerId: 2, position: 'home', finished: false },
        { id: 'g1', playerId: 2, position: 'home', finished: false },
        { id: 'g2', playerId: 2, position: 'home', finished: false },
        { id: 'g3', playerId: 2, position: 'home', finished: false },
        { id: 'y0', playerId: 3, position: 'home', finished: false },
        { id: 'y1', playerId: 3, position: 'home', finished: false },
        { id: 'y2', playerId: 3, position: 'home', finished: false },
        { id: 'y3', playerId: 3, position: 'home', finished: false },
      ],
    };

    const moves = getLegalMoves(test, 2);
    const cutMove = moves.find(m => m.willCut);
    expect(cutMove).toBeDefined();
    expect(cutMove?.cutCoinId).toBe('b0');

    const result = applyMove(test, cutMove!);
    const b0After = result.newState.coins.find(c => c.id === 'b0')!;
    expect(b0After.position).toBe('home');
    expect(result.cutCoinId).toBe('b0');
  });

  test('cannot cut coin on safe square', () => {
    const state = freshState();
    const test: GameState = {
      ...state,
      currentPlayer: 0,
      phase: 'WAITING_MOVE',
      lastRollValue: 2,
      coins: [
        { id: 'r0', playerId: 0, position: '6', finished: false },  // p0 at 6
        { id: 'r1', playerId: 0, position: 'home', finished: false },
        { id: 'r2', playerId: 0, position: 'home', finished: false },
        { id: 'r3', playerId: 0, position: 'home', finished: false },
        { id: 'b0', playerId: 1, position: '8', finished: false },  // p1 at 8 (SAFE)
        { id: 'b1', playerId: 1, position: 'home', finished: false },
        { id: 'b2', playerId: 1, position: 'home', finished: false },
        { id: 'b3', playerId: 1, position: 'home', finished: false },
        { id: 'g0', playerId: 2, position: 'home', finished: false },
        { id: 'g1', playerId: 2, position: 'home', finished: false },
        { id: 'g2', playerId: 2, position: 'home', finished: false },
        { id: 'g3', playerId: 2, position: 'home', finished: false },
        { id: 'y0', playerId: 3, position: 'home', finished: false },
        { id: 'y1', playerId: 3, position: 'home', finished: false },
        { id: 'y2', playerId: 3, position: 'home', finished: false },
        { id: 'y3', playerId: 3, position: 'home', finished: false },
      ],
    };
    const moves = getLegalMoves(test, 2);
    const cutMove = moves.find(m => m.willCut);
    expect(cutMove).toBeUndefined();
  });
});

describe('gameEngine — turn flow', () => {
  test('no legal moves skips turn', () => {
    const state = freshState({ entryRollValues: [1] });
    // All coins home, roll a 3 — cannot enter
    const newState = applyRoll(state, 3);
    expect(newState.currentPlayer).toBe(1); // skipped to player 1
    expect(newState.phase).toBe('WAITING_ROLL');
  });

  test('extra roll value keeps same player', () => {
    let state = freshState({ entryRollValues: [1, 5], extraRollValues: [1, 5, 8] });
    const moves = getLegalMoves(state, 1);
    const result = applyMove({ ...state, lastRollValue: 1, phase: 'WAITING_MOVE' }, moves[0]);
    // Roll value 1 is in extraRollValues → same player
    expect(result.newState.currentPlayer).toBe(0);
  });

  test('non-extra roll value passes turn', () => {
    let state = freshState({ entryRollValues: [1, 5], extraRollValues: [1, 5, 8] });
    // Manually place coin on board so we have a legal move on roll 2
    state = {
      ...state,
      currentPlayer: 0,
      lastRollValue: 2,
      phase: 'WAITING_MOVE',
      coins: state.coins.map(c =>
        c.id === 'r0' ? { ...c, position: '3' } : c
      ),
    };
    const moves = getLegalMoves(state, 2);
    if (moves.length > 0) {
      const result = applyMove(state, moves[0]);
      // Roll 2 not in extraRollValues → should advance to next player
      expect(result.newState.currentPlayer).toBe(1);
    }
  });
});

describe('gameEngine — win detection', () => {
  test('returns null when no winner', () => {
    const state = freshState();
    expect(checkWin(state)).toBeNull();
  });

  test('returns player index when all coins finished', () => {
    const state = freshState({ coinsPerPlayer: 4, playerCount: 2 });
    const allFinished: GameState = {
      ...state,
      coins: state.coins.map(c =>
        c.playerId === 0 ? { ...c, position: 'CENTER', finished: true } : c
      ),
    };
    expect(checkWin(allFinished)).toBe(0);
  });
});
