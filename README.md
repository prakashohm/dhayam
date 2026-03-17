# Dhayam — Cross-Platform Board Game

A production-ready Dhayam (Dayakattai / Thayam) game app built with **Expo + React Native + TypeScript** supporting **Android, iOS, and Web** from a single codebase.

## 🏗️ Architecture

```
/src
  /engine          ← Pure TS game logic (no UI deps) — fully unit-tested
    boardConfig.ts   Board layout, safe squares, player paths
    diceEngine.ts    4-stick dice simulation with configurable mapping
    gameEngine.ts    Coin state, movement, cutting, turn flow, win detection
    aiPlayer.ts      AI with 4-level priority heuristic
  /store           ← Zustand state management
    gameStore.ts     In-game state + AI turn orchestration
    settingsStore.ts Persisted settings (rules, appearance, audio)
  /screens         ← React Native screens
    HomeScreen.tsx   Landing page with 5 navigation buttons
    GameSetupScreen  Player count + name selection
    GameScreen.tsx   Main game view (board + dice + panels)
    HowToPlayScreen  Beginner guide with board legend
    SettingsScreen   All configurable options
    OnlineScreen.tsx Create/join Firebase room
  /components      ← Reusable UI
    Board.tsx        Cross-shaped board with theme support
    CoinPiece.tsx    Animated coin with pulse-on-select
    DiceRoller.tsx   4-stick dice with flip animation
    PlayerPanel.tsx  Player info strip
    TurnIndicator.tsx Full-screen pass-phone modal
    themes.ts        3 board themes + player color palette
  /firebase
    init.ts          Firebase app init from env vars
    rooms.ts         Room CRUD, real-time listeners, disconnect handling
    security-rules.json Firebase database security rules
  /locales
    en.json          All user-facing strings (ready for Tamil/other locales)
  /navigation
    types.ts         React Navigation type definitions
/__tests__/engine   ← Jest unit tests for all engine modules
/public
  _redirects         Netlify SPA routing
```

## 🎮 Game Features

| Feature | Status |
|---|---|
| 2–4 player support | ✅ |
| 4 or 6 coins per player | ✅ |
| 4-stick Dayakattai dice with Thayam | ✅ |
| Safe square protection | ✅ |
| Cutting with extra roll | ✅ |
| Extra roll on 1, 5, 8 | ✅ |
| vs Computer (AI) | ✅ |
| Local multiplayer (pass-and-play) | ✅ |
| Online multiplayer (Firebase) | ✅ |
| 3 board themes | ✅ |
| How to Play guide | ✅ |
| All rules configurable in Settings | ✅ |
| Netlify web build | ✅ |

## 🚀 Dev Setup

```bash
git clone https://github.com/prakashohm/dhayam
cd dhayam
npm install

# Copy and fill in Firebase config
cp .env.example .env
```

### Run locally
```bash
# Expo dev server (all platforms)
npx expo start

# Web only
npx expo start --web

# Android
npx expo start --android

# iOS
npx expo start --ios
```

### Run unit tests
```bash
npm test
# or with coverage
npx jest --coverage
```

## 📱 Android / iOS Build

### Android APK (local)
```bash
npx expo build:android   # Classic builds (deprecated)
# Preferred — EAS Build:
npm install -g eas-cli
eas build --platform android
```

### iOS (requires Mac + Xcode)
```bash
eas build --platform ios
```

## 🌐 Web Build & Netlify Deployment

### 1. Build the static web app
```bash
npx expo export:web
# Produces /web-build directory
```

### 2. Deploy to Netlify

**Option A — Drag & Drop:**
1. Go to [netlify.com](https://netlify.com) → New site → Drag `/web-build` folder

**Option B — GitHub integration:**
1. Push repo to GitHub
2. Netlify → New site → Connect GitHub repo
3. Set:
   - **Build command:** `npx expo export:web`
   - **Publish directory:** `web-build`
4. Add Firebase environment variables in Netlify Site Settings → Environment:
   ```
   EXPO_PUBLIC_FIREBASE_API_KEY=...
   EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=...
   EXPO_PUBLIC_FIREBASE_DATABASE_URL=...
   EXPO_PUBLIC_FIREBASE_PROJECT_ID=...
   EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=...
   EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
   EXPO_PUBLIC_FIREBASE_APP_ID=...
   ```
5. Deploy!

The `public/_redirects` file handles SPA client-side routing automatically.

## 🔥 Firebase Setup (Online Multiplayer)

1. Create a project at [console.firebase.google.com](https://console.firebase.google.com)
2. Enable **Realtime Database** (Start in test mode, then apply security rules below)
3. Copy your project config into `.env`
4. Apply security rules from `src/firebase/security-rules.json` in the Firebase Console → Database → Rules

## 🌍 Localization

All user-facing strings are in `src/locales/en.json`. To add Tamil:
1. Create `src/locales/ta.json` with the same keys
2. Add `'ta'` as a `Language` type in `settingsStore.ts`
3. Import and switch based on `settings.language`

## 📐 Board Configuration

The board is fully configurable via `src/engine/boardConfig.ts`:
```ts
export const DEFAULT_BOARD_CONFIG: BoardConfig = {
  outerTrackLength: 52,
  safeSquares: [0, 8, 13, 21, 26, 34, 39, 47], // 8 safe squares
  centerSquare: 'CENTER',
  innerPathLength: 6,
  players: [
    { color: 'red',    entrySquare: 1,  innerPathEntry: 50, innerPath: ['r0'..'r5'] },
    { color: 'blue',   entrySquare: 14, innerPathEntry: 11, innerPath: ['b0'..'b5'] },
    { color: 'green',  entrySquare: 27, innerPathEntry: 24, innerPath: ['g0'..'g5'] },
    { color: 'yellow', entrySquare: 40, innerPathEntry: 37, innerPath: ['y0'..'y5'] },
  ],
};
```

## ⚙️ Configurable Game Rules

| Setting | Key | Default |
|---|---|---|
| Coins per player | `coinsPerPlayer` | 4 |
| Number of players | `playerCount` | 4 |
| Entry roll values | `entryRollValues` | [1, 5] |
| Extra roll values | `extraRollValues` | [1, 5, 8] |
| Extra roll on cut | `cutGrantsExtraRoll` | true |
| Must cut before inner | `mustCutBeforeInner` | false |
| Turn timer (seconds) | `turnTimerSeconds` | 30 |

## 🙏 Credits

Traditional South Indian board game Dhayam (தாயம்), digitized for modern play.
Built with Expo, React Native, Firebase, and Zustand.
