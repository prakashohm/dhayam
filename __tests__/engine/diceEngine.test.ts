import { rollDice, grantsExtraRoll, DEFAULT_DICE_MAPPING } from '../../src/engine/diceEngine';

describe('diceEngine', () => {
  test('rollDice returns valid sticks array of length 4', () => {
    const result = rollDice();
    expect(result.sticks).toHaveLength(4);
    result.sticks.forEach(s => expect([0, 1]).toContain(s));
  });

  test('rawCount matches sum of sticks', () => {
    const result = rollDice();
    const sum = result.sticks.reduce<number>((a, b) => a + b, 0);
    expect(result.rawCount).toBe(sum);
  });

  test('thayam when all sticks are 0', () => {
    const allZero = (): 0 | 1 => 0;
    const result = rollDice(DEFAULT_DICE_MAPPING, allZero);
    expect(result.isThayam).toBe(true);
    expect(result.moveValue).toBe(5); // thayam maps to 5
  });

  test('non-thayam when at least one stick is scored', () => {
    let call = 0;
    const oneScored = (): 0 | 1 => (call++ === 0 ? 1 : 0);
    const result = rollDice(DEFAULT_DICE_MAPPING, oneScored);
    expect(result.isThayam).toBe(false);
  });

  test('4 scored sticks maps to moveValue 8', () => {
    const allOne = (): 0 | 1 => 1;
    const result = rollDice(DEFAULT_DICE_MAPPING, allOne);
    expect(result.rawCount).toBe(4);
    expect(result.moveValue).toBe(8);
  });

  test('1 scored stick maps to moveValue 1', () => {
    let call = 0;
    const oneScored = (): 0 | 1 => (call++ === 0 ? 1 : 0);
    const result = rollDice(DEFAULT_DICE_MAPPING, oneScored);
    expect(result.rawCount).toBe(1);
    expect(result.moveValue).toBe(1);
  });

  test('grantsExtraRoll true for values in list', () => {
    expect(grantsExtraRoll(1, [1, 5, 8])).toBe(true);
    expect(grantsExtraRoll(5, [1, 5, 8])).toBe(true);
    expect(grantsExtraRoll(8, [1, 5, 8])).toBe(true);
  });

  test('grantsExtraRoll false for values not in list', () => {
    expect(grantsExtraRoll(2, [1, 5, 8])).toBe(false);
    expect(grantsExtraRoll(3, [1, 5, 8])).toBe(false);
  });
});
