/**
 * themes.ts — Board themes and color palette for Classic, Minimal, and Dark modes.
 */

export interface BoardColors {
  boardBackground: string;
  outerTrack: string;
  innerTrack: string;
  safeSquare: string;
  centerSquare: string;
  gridLine: string;
  textPrimary: string;
  textSecondary: string;
  buttonBg: string;
  buttonText: string;
  screenBackground: string;
  cardBackground: string;
  statusBar: string;
}

export const THEMES: Record<string, BoardColors> = {
  classic: {
    boardBackground: '#C8A96E',
    outerTrack: '#E8D5A3',
    innerTrack: '#D4B07A',
    safeSquare: '#F5E6C8',
    centerSquare: '#8B4513',
    gridLine: '#8B6914',
    textPrimary: '#2C1810',
    textSecondary: '#6B4423',
    buttonBg: '#8B4513',
    buttonText: '#FFF8F0',
    screenBackground: '#F5E6C8',
    cardBackground: '#FAEBD7',
    statusBar: '#6B3410',
  },
  minimal: {
    boardBackground: '#FFFFFF',
    outerTrack: '#F5F5F5',
    innerTrack: '#E8E8E8',
    safeSquare: '#E3F2FD',
    centerSquare: '#1565C0',
    gridLine: '#BDBDBD',
    textPrimary: '#1A1A1A',
    textSecondary: '#666666',
    buttonBg: '#1565C0',
    buttonText: '#FFFFFF',
    screenBackground: '#FAFAFA',
    cardBackground: '#FFFFFF',
    statusBar: '#0D47A1',
  },
  dark: {
    boardBackground: '#1A1A2E',
    outerTrack: '#16213E',
    innerTrack: '#0F3460',
    safeSquare: '#1A2744',
    centerSquare: '#E94560',
    gridLine: '#2D3561',
    textPrimary: '#E8E8F0',
    textSecondary: '#9090A8',
    buttonBg: '#E94560',
    buttonText: '#FFFFFF',
    screenBackground: '#0D0D1A',
    cardBackground: '#16213E',
    statusBar: '#C73652',
  },
};

export const PLAYER_COLORS = {
  red: {
    primary: '#E53935',
    light: '#FFCDD2',
    dark: '#B71C1C',
  },
  blue: {
    primary: '#1E88E5',
    light: '#BBDEFB',
    dark: '#0D47A1',
  },
  green: {
    primary: '#43A047',
    light: '#C8E6C9',
    dark: '#1B5E20',
  },
  yellow: {
    primary: '#FDD835',
    light: '#FFF9C4',
    dark: '#F57F17',
  },
};

export type PlayerColor = keyof typeof PLAYER_COLORS;
