/**
 * navigation/types.ts
 * React Navigation stack param types for the app.
 */

export type RootStackParamList = {
  Home: undefined;
  GameSetup: { mode: 'computer' | 'local' | 'online' };
  Game: { mode: 'computer' | 'local' | 'online' };
  HowToPlay: undefined;
  Settings: undefined;
  Online: undefined;
};
