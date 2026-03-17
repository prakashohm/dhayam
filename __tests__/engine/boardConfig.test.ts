import { DEFAULT_BOARD_CONFIG, buildFullPath, isSafeSquare } from '../../src/engine/boardConfig';

describe('boardConfig', () => {
  test('outer track has 52 squares', () => {
    expect(DEFAULT_BOARD_CONFIG.outerTrackLength).toBe(52);
  });

  test('has 8 safe squares', () => {
    expect(DEFAULT_BOARD_CONFIG.safeSquares).toHaveLength(8);
  });

  test('has 4 players', () => {
    expect(DEFAULT_BOARD_CONFIG.players).toHaveLength(4);
  });

  test('each player has a 6-square inner path', () => {
    DEFAULT_BOARD_CONFIG.players.forEach(p => {
      expect(p.innerPath).toHaveLength(6);
    });
  });

  test('buildFullPath for player 0 starts at entry square and ends at CENTER', () => {
    const path = buildFullPath(0, DEFAULT_BOARD_CONFIG);
    expect(path[0]).toBe(String(DEFAULT_BOARD_CONFIG.players[0].entrySquare));
    expect(path[path.length - 1]).toBe('CENTER');
  });

  test('buildFullPath for all players ends at CENTER', () => {
    [0, 1, 2, 3].forEach(p => {
      const path = buildFullPath(p as any, DEFAULT_BOARD_CONFIG);
      expect(path[path.length - 1]).toBe('CENTER');
    });
  });

  test('isSafeSquare returns true for corner squares', () => {
    [0, 13, 26, 39].forEach(sq => {
      expect(isSafeSquare(sq, DEFAULT_BOARD_CONFIG)).toBe(true);
    });
  });

  test('isSafeSquare returns false for non-safe square', () => {
    expect(isSafeSquare(5, DEFAULT_BOARD_CONFIG)).toBe(false);
  });

  test('inner paths have unique IDs across players', () => {
    const allInner = DEFAULT_BOARD_CONFIG.players.flatMap(p => p.innerPath);
    const unique = new Set(allInner);
    expect(unique.size).toBe(allInner.length);
  });
});
