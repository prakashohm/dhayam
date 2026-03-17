/**
 * gameStore.ts
 * Zustand store wrapping the pure game engine.
 * Handles: game init, dice rolls, move selection, AI turns, online sync.
 */

import { create } from 'zustand';
import {
  GameState,
  initGame,
  getLegalMoves,
  applyMove,
  applyRoll,
  Move,
  DEFAULT_SETTINGS,
  GameSettings,
} from '../engine/gameEngine';
import { getAIMove, AI_THINK_DELAY_MS } from '../engine/aiPlayer';
import { rollDice } from '../engine/diceEngine';
import { DEFAULT_BOARD_CONFIG } from '../engine/boardConfig';

export type GameMode = 'computer' | 'local' | 'online';

interface GameStore {
  // State
  gameState: GameState | null;
  mode: GameMode;
  isRolling: boolean;
  statusMessage: string;

  // Actions
  startGame: (mode: GameMode, settings?: Partial<GameSettings>) => void;
  doRoll: () => Promise<void>;
  selectMove: (move: Move) => void;
  resetGame: () => void;
  setStatusMessage: (msg: string) => void;

  // AI
  triggerAITurn: () => Promise<void>;

  // Online
  applyRemoteState: (state: GameState) => void;
}

export const useGameStore = create<GameStore>((set, get) => ({
  gameState: null,
  mode: 'local',
  isRolling: false,
  statusMessage: '',

  startGame: (mode, settings = {}) => {
    const merged = { ...DEFAULT_SETTINGS, ...settings };
    const state = initGame(DEFAULT_BOARD_CONFIG, merged);
    set({ gameState: state, mode, statusMessage: "Your turn — tap to roll!" });
  },

  doRoll: async () => {
    const { gameState } = get();
    if (!gameState || gameState.phase !== 'WAITING_ROLL') return;

    set({ isRolling: true });

    // Brief "rolling" UX delay
    await new Promise(res => setTimeout(res, 400));

    const result = rollDice();
    const newState = applyRoll(gameState, result.moveValue);

    const msg = newState.phase === 'WAITING_MOVE'
      ? `Rolled ${result.moveValue} — pick a coin`
      : `Rolled ${result.moveValue} — no moves, turn passed`;

    set({ gameState: newState, isRolling: false, statusMessage: msg });

    // If AI turn after skip
    if (newState.phase === 'WAITING_ROLL' && get().mode !== 'online') {
      await get().triggerAITurn();
    }
  },

  selectMove: (move: Move) => {
    const { gameState } = get();
    if (!gameState || gameState.phase !== 'WAITING_MOVE') return;

    const { newState, cutCoinId, finished } = applyMove(gameState, move);

    let msg = '';
    if (newState.winner !== null) {
      msg = `Player ${newState.winner + 1} wins! 🎉`;
    } else if (cutCoinId) {
      msg = `Cut! An opponent coin was sent home.`;
    } else if (finished) {
      msg = `Coin reached home!`;
    } else if (newState.currentPlayer !== gameState.currentPlayer) {
      msg = `Player ${newState.currentPlayer + 1}'s turn`;
    } else {
      msg = `Extra roll! Roll again.`;
    }

    set({ gameState: newState, statusMessage: msg });

    // Trigger AI if next player is non-human
    if (newState.phase === 'WAITING_ROLL' && get().mode !== 'online') {
      get().triggerAITurn();
    }
  },

  triggerAITurn: async () => {
    const { gameState, mode } = get();
    if (!gameState || gameState.phase !== 'WAITING_ROLL') return;

    // In 'computer' mode, players 1+ are AI. In 'local', no AI.
    if (mode === 'local') return;
    if (gameState.currentPlayer === 0 && mode === 'computer') return;

    // AI thinking delay
    set({ statusMessage: `Player ${gameState.currentPlayer + 1} is thinking…` });
    await new Promise(res => setTimeout(res, AI_THINK_DELAY_MS));

    const rollResult = rollDice();
    const afterRoll = applyRoll(gameState, rollResult.moveValue);
    const legalMoves = getLegalMoves(afterRoll, rollResult.moveValue);
    const aiMove = getAIMove(afterRoll, rollResult.moveValue);

    if (!aiMove) {
      // No moves — turn skipped
      set({
        gameState: afterRoll,
        statusMessage: `Player ${gameState.currentPlayer + 1} rolled ${rollResult.moveValue}, no moves — skipped`,
      });
      // Pass to next AI or human
      await get().triggerAITurn();
      return;
    }

    const { newState, cutCoinId } = applyMove(afterRoll, aiMove);
    const msg = cutCoinId
      ? `Player ${gameState.currentPlayer + 1} cut your coin!`
      : `Player ${gameState.currentPlayer + 1} rolled ${rollResult.moveValue}`;
    set({ gameState: newState, statusMessage: msg });

    // Chain extra rolls
    if (newState.phase === 'WAITING_ROLL' && newState.currentPlayer !== 0) {
      await get().triggerAITurn();
    }
  },

  resetGame: () => {
    set({ gameState: null, statusMessage: '', isRolling: false });
  },

  setStatusMessage: (msg) => set({ statusMessage: msg }),

  applyRemoteState: (state) => {
    set({ gameState: state });
  },
}));

/** Returns legal moves for the current player in current state */
export function currentLegalMoves(state: GameState): Move[] {
  if (state.phase !== 'WAITING_MOVE' || state.lastRollValue === null) return [];
  return getLegalMoves(state, state.lastRollValue);
}
