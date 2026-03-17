/**
 * boardConfig.ts
 * Pure TypeScript — no UI imports.
 * Defines the Dhayam board layout modeled on a 52-square outer track
 * (like Ludo), with 6-square inner paths per player leading to center.
 */

export type PlayerIndex = 0 | 1 | 2 | 3;

export interface PlayerBoardConfig {
  color: 'red' | 'blue' | 'green' | 'yellow';
  /** Index on the outer track (0-51) where this player's coins enter */
  entrySquare: number;
  /** Index on the outer track (0-51) where this player turns onto the inner path */
  innerPathEntry: number;
  /** Ordered list of inner-path square IDs unique to this player (6 squares + center) */
  innerPath: string[];
  /** Starting position label for home zone (off-board) */
  homeZoneLabel: string;
}

export interface BoardConfig {
  /** Total squares on the outer track */
  outerTrackLength: number;
  /** Indexes of safe squares on the outer track */
  safeSquares: number[];
  /** Per-player configuration */
  players: PlayerBoardConfig[];
  /** Square ID that represents the winning center square */
  centerSquare: string;
  /** Length of the inner path (excluding center) */
  innerPathLength: number;
}

/**
 * The canonical Dhayam board:
 * - 52 squares in outer loop (0-51), numbered clockwise from top-left corner of Red's arm.
 * - Safe squares: 4 corner squares (0, 13, 26, 39) + 4 cross squares (8, 21, 34, 47).
 * - Each player has a 6-square inner path (p0_i0 .. p0_i5) + shared CENTER.
 *
 * Visual orientation (top-down):
 *   Red   starts top-left,  entry at 0,  inner entry at 51
 *   Blue  starts top-right, entry at 13, inner entry at 12
 *   Green starts bot-right, entry at 26, inner entry at 25
 *   Yellow starts bot-left, entry at 39, inner entry at 38
 */
export const DEFAULT_BOARD_CONFIG: BoardConfig = {
  outerTrackLength: 52,
  // corners: 0, 13, 26, 39; cross: 8, 21, 34, 47
  safeSquares: [0, 8, 13, 21, 26, 34, 39, 47],
  centerSquare: 'CENTER',
  innerPathLength: 6,
  players: [
    {
      color: 'red',
      entrySquare: 1,       // red enters at index 1 (just past corner 0)
      innerPathEntry: 50,   // turns inward from square 50
      innerPath: ['r0', 'r1', 'r2', 'r3', 'r4', 'r5'],
      homeZoneLabel: 'RED_HOME',
    },
    {
      color: 'blue',
      entrySquare: 14,
      innerPathEntry: 11,
      innerPath: ['b0', 'b1', 'b2', 'b3', 'b4', 'b5'],
      homeZoneLabel: 'BLUE_HOME',
    },
    {
      color: 'green',
      entrySquare: 27,
      innerPathEntry: 24,
      innerPath: ['g0', 'g1', 'g2', 'g3', 'g4', 'g5'],
      homeZoneLabel: 'GREEN_HOME',
    },
    {
      color: 'yellow',
      entrySquare: 40,
      innerPathEntry: 37,
      innerPath: ['y0', 'y1', 'y2', 'y3', 'y4', 'y5'],
      homeZoneLabel: 'YELLOW_HOME',
    },
  ],
};

/**
 * Returns the sequence of square IDs a player traverses from the outer track
 * through the inner path to CENTER.
 * Outer track squares are represented as their numeric index (string).
 */
export function buildFullPath(
  playerIndex: PlayerIndex,
  config: BoardConfig
): string[] {
  const player = config.players[playerIndex];
  const outerLen = config.outerTrackLength;

  const outer: string[] = [];
  let sq = player.entrySquare;
  for (let i = 0; i < outerLen; i++) {
    outer.push(String(sq));
    if (sq === player.innerPathEntry) break;
    sq = (sq + 1) % outerLen;
  }

  return [...outer, ...player.innerPath, config.centerSquare];
}

/**
 * Returns true if the given outer-track square index is a safe square.
 */
export function isSafeSquare(squareIndex: number, config: BoardConfig): boolean {
  return config.safeSquares.includes(squareIndex);
}

/**
 * Returns true if the given square ID is an inner-path or center square.
 */
export function isInnerSquare(squareId: string, config: BoardConfig): boolean {
  if (squareId === config.centerSquare) return true;
  return config.players.some(p => p.innerPath.includes(squareId));
}
