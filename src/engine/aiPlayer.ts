/**
 * aiPlayer.ts
 * Pure TypeScript AI player — no UI imports.
 *
 * AI priority order (per spec):
 *   1. Cut an opponent coin
 *   2. Move to a safe square
 *   3. Advance the furthest-back coin (lowest path index)
 *   4. Avoid leaving a coin on a non-safe square (last resort)
 */

import { GameState, Move, getLegalMoves } from './gameEngine';
import { isInnerSquare } from './boardConfig';

/**
 * Selects the best move for the AI player given the current state and roll.
 * @param state - current game state
 * @param rollValue - the dice value just rolled
 * @returns the chosen move, or null if no legal moves
 */
export function getAIMove(state: GameState, rollValue: number): Move | null {
  const legalMoves = getLegalMoves(state, rollValue);
  if (legalMoves.length === 0) return null;
  if (legalMoves.length === 1) return legalMoves[0];

  const { config, playerPaths, currentPlayer } = state;

  // Priority 1: Cut an opponent coin
  const cutMoves = legalMoves.filter(m => m.willCut);
  if (cutMoves.length > 0) return cutMoves[0];

  // Priority 2: Move to a safe square
  const safeMoves = legalMoves.filter(m => isSafeDestination(m.toSquare, config));
  if (safeMoves.length > 0) return safeMoves[0];

  // Priority 3: Advance the furthest-back coin
  // "furthest back" = lowest index on the player's path
  const path = playerPaths[currentPlayer];
  const sortedByProgress = [...legalMoves].sort((a, b) => {
    const idxA = getPathIndex(a.coinId, state, path);
    const idxB = getPathIndex(b.coinId, state, path);
    return idxA - idxB; // ascending = furthest back first
  });
  if (sortedByProgress.length > 0) return sortedByProgress[0];

  // Priority 4: Fall back to first legal move
  return legalMoves[0];
}

function isSafeDestination(squareId: string, config: import('./boardConfig').BoardConfig): boolean {
  if (isInnerSquare(squareId, config)) return true;
  const idx = parseInt(squareId, 10);
  if (isNaN(idx)) return true;
  return config.safeSquares.includes(idx);
}

function getPathIndex(coinId: string, state: GameState, path: string[]): number {
  const coin = state.coins.find(c => c.id === coinId);
  if (!coin || coin.position === 'home') return -1;
  return path.indexOf(coin.position);
}

/**
 * Returns the AI delay in milliseconds (simulates "thinking").
 */
export const AI_THINK_DELAY_MS = 600;
