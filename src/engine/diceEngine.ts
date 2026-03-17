/**
 * diceEngine.ts
 * Pure TypeScript — no UI imports.
 * Simulates 4 Dhayam/Dayakattai sticks. Each stick has two faces:
 *   scored (1) or unscored (0).
 * Throw all 4, total scored faces up = raw count 0-4.
 * Special case: all 4 unscored (rawCount=0 with isThayam flag) → "thayam".
 *
 * Note: rawCount=0 is NOT thayam if all 4 face up (no sticks scored).
 * "Thayam" = all 4 sticks show their UNSCORED face.
 * "0 scored faces landing up" is the same thing, so rawCount=0 => thayam.
 */

export interface DiceResult {
  /** How each of the 4 sticks landed: 0 = unscored, 1 = scored */
  sticks: [0 | 1, 0 | 1, 0 | 1, 0 | 1];
  /** How many sticks landed scored-side up */
  rawCount: number;
  /** True when all 4 land unscored (rawCount === 0) */
  isThayam: boolean;
  /** Mapped game value used for movement */
  moveValue: number;
}

export type DiceMapping = {
  [key in 1 | 2 | 3 | 4]: number;
} & {
  thayam: number;
};

export const DEFAULT_DICE_MAPPING: DiceMapping = {
  1: 1,
  2: 2,
  3: 3,
  4: 8,
  thayam: 5,
};

/**
 * Simulates a single stick: returns 0 or 1 with equal probability.
 */
function rollStick(): 0 | 1 {
  return Math.random() < 0.5 ? 0 : 1;
}

/**
 * Rolls all 4 sticks and returns a DiceResult.
 * @param mapping - configurable dice-value mapping
 * @param _rng - optional RNG override (for testing reproducibility)
 */
export function rollDice(
  mapping: DiceMapping = DEFAULT_DICE_MAPPING,
  _rng?: () => 0 | 1
): DiceResult {
  const roll = _rng ?? rollStick;
  const sticks: [0 | 1, 0 | 1, 0 | 1, 0 | 1] = [
    roll(),
    roll(),
    roll(),
    roll(),
  ];
  const rawCount = sticks.reduce<number>((sum, s) => sum + s, 0);
  const isThayam = rawCount === 0;
  const moveValue = isThayam ? mapping.thayam : mapping[rawCount as 1 | 2 | 3 | 4];

  return { sticks, rawCount, isThayam, moveValue };
}

/**
 * Determines if a given moveValue grants an extra roll.
 * @param moveValue - the move value just obtained
 * @param extraRollValues - configurable list of values that grant extra roll
 */
export function grantsExtraRoll(
  moveValue: number,
  extraRollValues: number[]
): boolean {
  return extraRollValues.includes(moveValue);
}
