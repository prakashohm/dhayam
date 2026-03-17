/**
 * App.tsx
 * Root of the Dhayam app. Sets up React Navigation stack.
 */

import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StatusBar } from 'expo-status-bar';

import { RootStackParamList } from './src/navigation/types';
import HomeScreen from './src/screens/HomeScreen';
import GameSetupScreen from './src/screens/GameSetupScreen';
import GameScreen from './src/screens/GameScreen';
import HowToPlayScreen from './src/screens/HowToPlayScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import OnlineScreen from './src/screens/OnlineScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false }} initialRouteName="Home">
          <Stack.Screen name="Home" component={HomeScreen} />
          <Stack.Screen name="GameSetup" component={GameSetupScreen} />
          <Stack.Screen name="Game" component={GameScreen} />
          <Stack.Screen name="HowToPlay" component={HowToPlayScreen} />
          <Stack.Screen name="Settings" component={SettingsScreen} />
          <Stack.Screen name="Online" component={OnlineScreen} />
        </Stack.Navigator>
      </NavigationContainer>
      <StatusBar style="light" />
    </GestureHandlerRootView>
  );
}
