/**
 * settingsStore.ts
 * Zustand persisted store for all user-configurable settings:
 *   - Game rules
 *   - Appearance (theme, coin style)
 *   - Audio
 *   - Language
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { GameSettings, DEFAULT_SETTINGS } from '../engine/gameEngine';

export type BoardTheme = 'classic' | 'minimal' | 'dark';
export type CoinStyle = 'circle' | 'star' | 'token';
export type Language = 'en';

export interface AppSettings extends GameSettings {
  // Appearance
  boardTheme: BoardTheme;
  coinStyle: CoinStyle;
  // Audio
  soundEnabled: boolean;
  hapticEnabled: boolean;
  // Language
  language: Language;
}

export const DEFAULT_APP_SETTINGS: AppSettings = {
  ...DEFAULT_SETTINGS,
  boardTheme: 'classic',
  coinStyle: 'circle',
  soundEnabled: true,
  hapticEnabled: true,
  language: 'en',
};

interface SettingsStore {
  settings: AppSettings;
  updateSettings: (patch: Partial<AppSettings>) => void;
  resetSettings: () => void;
}

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set) => ({
      settings: DEFAULT_APP_SETTINGS,
      updateSettings: (patch) =>
        set((state) => ({ settings: { ...state.settings, ...patch } })),
      resetSettings: () => set({ settings: DEFAULT_APP_SETTINGS }),
    }),
    {
      name: 'dhayam-settings',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
