/**
 * gameEngine.ts
 * Core Dhayam game logic — pure TypeScript, zero UI imports.
 * Immutable state updates: every function takes a state and returns a new state.
 */

import { BoardConfig, PlayerIndex, buildFullPath, isSafeSquare, isInnerSquare } from './boardConfig';

// ─── Types ───────────────────────────────────────────────────────────────────

export type CoinPosition = 'home' | string; // 'home' | outer-track index string | inner-path ID | 'CENTER'

export interface Coin {
  id: string;              // e.g. 'r0', 'r1', 'b0' …
  playerId: PlayerIndex;
  position: CoinPosition;
  finished: boolean;
}

export type GamePhase = 'WAITING_ROLL' | 'WAITING_MOVE' | 'GAME_OVER';

export interface GameSettings {
  coinsPerPlayer: 4 | 6;
  playerCount: 2 | 3 | 4;
  entryRollValues: number[];
  extraRollValues: number[];
  mustCutBeforeInner: boolean;
  cutGrantsExtraRoll: boolean;
  turnTimerSeconds: number;
}

export const DEFAULT_SETTINGS: GameSettings = {
  coinsPerPlayer: 4,
  playerCount: 4,
  entryRollValues: [1, 5],
  extraRollValues: [1, 5, 8],
  mustCutBeforeInner: false,
  cutGrantsExtraRoll: true,
  turnTimerSeconds: 30,
};

export interface Move {
  coinId: string;
  /** Square ID the coin will move to */
  toSquare: CoinPosition;
  /** Whether this move cuts an opponent coin */
  willCut: boolean;
  /** ID of the coin that will be cut (if any) */
  cutCoinId?: string;
}

export interface MoveResult {
  newState: GameState;
  cutCoinId?: string;
  finished: boolean;  // whether the moved coin just finished
}

export interface GameState {
  coins: Coin[];
  currentPlayer: PlayerIndex;
  /** Which players are active (index = true) */
  activePlayers: boolean[];
  phase: GamePhase;
  lastRollValue: number | null;
  /** Whether the current turn grants an extra roll after a move */
  extraRollPending: boolean;
  /** Whether the current player has cut an opponent (for mustCutBeforeInner rule) */
  hasCutThisGame: boolean[];
  config: BoardConfig;
  settings: GameSettings;
  winner: PlayerIndex | null;
  /** Full computed paths per player (built once on init, stored for fast lookup) */
  playerPaths: string[][];
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}

/** Returns all coins belonging to a player */
export function getPlayerCoins(state: GameState, playerId: PlayerIndex): Coin[] {
  return state.coins.filter(c => c.playerId === playerId);
}

/** Returns the coin at a given square (excluding 'home' and finished coins) */
function getCoinAt(coins: Coin[], squareId: string): Coin | null {
  return coins.find(c => !c.finished && c.position !== 'home' && c.position === squareId) ?? null;
}

/**
 * Find what position a coin will be at after moving `steps` from its current position
 * along the player's full path. Returns null if the move would overshoot CENTER.
 */
export function getTargetPosition(
  coin: Coin,
  steps: number,
  playerPaths: string[][]
): CoinPosition | null {
  const path = playerPaths[coin.playerId];
  if (coin.position === 'home') {
    // First step onto the board: always land at path[0] (entry square)
    // Entry is validated elsewhere; here we just apply 1 step = path[0]
    return path[0];
  }

  const currentIndex = path.indexOf(coin.position);
  if (currentIndex === -1) return null;

  const targetIndex = currentIndex + steps;
  if (targetIndex >= path.length) return null; // would overshoot
  return path[targetIndex];
}

/**
 * Checks if a square is safe (cannot be cut on).
 * Inner-path squares and CENTER are always safe.
 */
function isSquareSafe(squareId: string, config: BoardConfig): boolean {
  if (isInnerSquare(squareId, config)) return true;
  const idx = parseInt(squareId, 10);
  if (isNaN(idx)) return true;
  return isSafeSquare(idx, config);
}

// ─── Legal Move Computation ───────────────────────────────────────────────────

/**
 * Computes all legal moves for the current player given a roll value.
 */
export function getLegalMoves(state: GameState, rollValue: number): Move[] {
  const { coins, currentPlayer, settings, config, playerPaths } = state;
  const playerCoins = getPlayerCoins(state, currentPlayer);
  const moves: Move[] = [];

  for (const coin of playerCoins) {
    if (coin.finished) continue;

    if (coin.position === 'home') {
      // Can only enter if rollValue is an entry roll
      if (!settings.entryRollValues.includes(rollValue)) continue;

      const entrySquare = String(config.players[currentPlayer].entrySquare);
      const coinAtEntry = getCoinAt(coins, entrySquare);

      // If a friendly coin is at entry on a non-safe square, can't enter (no stacking on non-safe)
      if (coinAtEntry && coinAtEntry.playerId === currentPlayer) {
        if (!isSquareSafe(entrySquare, config)) continue;
      }

      let willCut = false;
      let cutCoinId: string | undefined;
      if (coinAtEntry && coinAtEntry.playerId !== currentPlayer) {
        if (!isSquareSafe(entrySquare, config)) {
          willCut = true;
          cutCoinId = coinAtEntry.id;
        }
      }

      moves.push({ coinId: coin.id, toSquare: entrySquare, willCut, cutCoinId });
    } else {
      // Moving on board
      const targetSquare = getTargetPosition(coin, rollValue, playerPaths);
      if (!targetSquare) continue; // overshoot, skip

      // mustCutBeforeInner check
      if (settings.mustCutBeforeInner && !state.hasCutThisGame[currentPlayer]) {
        if (isInnerSquare(targetSquare, config)) continue;
      }

      const coinAtTarget = getCoinAt(coins, targetSquare);
      let willCut = false;
      let cutCoinId: string | undefined;

      if (coinAtTarget) {
        if (coinAtTarget.playerId === currentPlayer) {
          // Friendly coin
          if (!isSquareSafe(targetSquare, config)) continue; // can't stack on non-safe
        } else {
          // Opponent coin
          if (!isSquareSafe(targetSquare, config)) {
            willCut = true;
            cutCoinId = coinAtTarget.id;
          } else {
            // Safe — no cut, both can share square
          }
        }
      }

      moves.push({ coinId: coin.id, toSquare: targetSquare, willCut, cutCoinId });
    }
  }

  return moves;
}

// ─── Move Application ─────────────────────────────────────────────────────────

/**
 * Applies a move to the game state and returns the new state plus metadata.
 */
export function applyMove(state: GameState, move: Move): MoveResult {
  const newState = deepClone(state);
  const coin = newState.coins.find(c => c.id === move.coinId)!;

  // Move coin
  coin.position = move.toSquare;

  let cutCoinId: string | undefined;
  let cutOccurred = false;

  // Apply cut
  if (move.willCut && move.cutCoinId) {
    const cutCoin = newState.coins.find(c => c.id === move.cutCoinId);
    if (cutCoin) {
      cutCoin.position = 'home';
      cutCoinId = cutCoin.id;
      cutOccurred = true;
      newState.hasCutThisGame[state.currentPlayer] = true;
    }
  }

  // Check if coin finished
  let finished = false;
  if (coin.position === newState.config.centerSquare) {
    coin.finished = true;
    finished = true;
  }

  // Check winner (all coins finished)
  const playerCoins = newState.coins.filter(c => c.playerId === state.currentPlayer);
  if (playerCoins.every(c => c.finished)) {
    newState.winner = state.currentPlayer;
    newState.phase = 'GAME_OVER';
    return { newState, cutCoinId, finished };
  }

  // Determine next phase / extra roll
  const extraRollFromValue = newState.settings.extraRollValues.includes(
    newState.lastRollValue ?? 0
  );
  const extraRollFromCut = cutOccurred && newState.settings.cutGrantsExtraRoll;

  if (extraRollFromValue || extraRollFromCut) {
    newState.extraRollPending = false; // already rolled, player rolls again
    newState.phase = 'WAITING_ROLL';
    // currentPlayer remains the same
  } else {
    newState.phase = 'WAITING_ROLL';
    newState.currentPlayer = getNextPlayer(newState) as PlayerIndex;
  }

  return { newState, cutCoinId, finished };
}

// ─── Turn Management ──────────────────────────────────────────────────────────

/**
 * Returns the next player index (skips inactive/finished players).
 */
export function getNextPlayer(state: GameState): PlayerIndex {
  const { currentPlayer, activePlayers, settings } = state;
  let next = (currentPlayer + 1) % settings.playerCount;
  let attempts = 0;
  while (!activePlayers[next] && attempts < settings.playerCount) {
    next = (next + 1) % settings.playerCount;
    attempts++;
  }
  return next as PlayerIndex;
}

/**
 * Applies a roll value to state, determining legal moves and phase.
 */
export function applyRoll(state: GameState, rollValue: number): GameState {
  const newState = deepClone(state);
  newState.lastRollValue = rollValue;

  const legalMoves = getLegalMoves(newState, rollValue);
  if (legalMoves.length === 0) {
    // No legal moves — turn passes
    newState.phase = 'WAITING_ROLL';
    newState.currentPlayer = getNextPlayer(newState) as PlayerIndex;
  } else {
    newState.phase = 'WAITING_MOVE';
  }
  return newState;
}

// ─── Win Detection ────────────────────────────────────────────────────────────

export function checkWin(state: GameState): PlayerIndex | null {
  for (let p = 0; p < state.settings.playerCount; p++) {
    const coins = state.coins.filter(c => c.playerId === p as PlayerIndex);
    if (coins.length > 0 && coins.every(c => c.finished)) {
      return p as PlayerIndex;
    }
  }
  return null;
}

// ─── Game Initialization ──────────────────────────────────────────────────────

export function initGame(config: BoardConfig, settings: GameSettings): GameState {
  const coins: Coin[] = [];
  const colors: Array<'r' | 'b' | 'g' | 'y'> = ['r', 'b', 'g', 'y'];

  for (let p = 0; p < settings.playerCount; p++) {
    for (let c = 0; c < settings.coinsPerPlayer; c++) {
      coins.push({
        id: `${colors[p]}${c}`,
        playerId: p as PlayerIndex,
        position: 'home',
        finished: false,
      });
    }
  }

  const activePlayers = Array(4).fill(false).map((_, i) => i < settings.playerCount);

  // Precompute player paths
  const playerPaths = ([0, 1, 2, 3] as PlayerIndex[]).map(p =>
    p < settings.playerCount ? buildFullPath(p, config) : []
  );

  return {
    coins,
    currentPlayer: 0,
    activePlayers,
    phase: 'WAITING_ROLL',
    lastRollValue: null,
    extraRollPending: false,
    hasCutThisGame: Array(4).fill(false),
    config,
    settings,
    winner: null,
    playerPaths,
  };
}
