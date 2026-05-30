# feat(mobile): set up Expo SDK 54 mobile app with home screen navbar

## Summary

Bootstraps the `apps/mobile` Expo project from scratch and delivers the first home-screen UI component.

Key changes:
- **Expo SDK migration** — downgraded from SDK 56 to SDK 54 and resolved all cascading dependency conflicts (`react-native-worklets`, `babel-preset-expo`, `react`/`react-native-renderer` version mismatch, `expo-status-bar` plugin removal).
- **Mobile infrastructure** — wired up `expo-router` (file-based routing), NativeWind 4.x (Tailwind CSS for React Native), TanStack Query, and Zustand; configured `babel.config.js` and `metro.config.js` accordingly.
- **`BottomNav` organism** — sticky five-tab bottom navigation bar (`Home`, `Market`, centre FAB `+`, `Rewards`, `Profile`) using `@expo/vector-icons` and `useSafeAreaInsets`; active-tab highlight in blue, inactive in grey.
- **Root layout** — added `SafeAreaProvider` so all screens can consume safe-area insets.
- **Home screen scaffold** — `index.tsx` updated to render `BottomNav` at the bottom of a `flex-1` container, ready for remaining components.

## Linked Issues

N/A *(branch `feat/homepage` carries no issue number)*

## Type of Change

- [x] feat: New feature
- [ ] fix: Bug fix
- [ ] docs: Documentation update
- [ ] chore/refactor: Maintenance or code restructure

## Notes for Reviewers

- **New dependencies added** — `react-native-worklets@0.5.1` (peer dep of `react-native-reanimated@4.1.1`), `react-dom@19.1.0` (pinned to match `react-native-renderer` version inside `react-native@0.81.5`).
- **`babel-preset-expo` moved to `dependencies`** (not `devDependencies`) at `~54.0.10` — Expo's own install tool enforces this placement.
- **`expo-status-bar` removed from `app.json` plugins** — v3.x no longer ships an `app.plugin.js`; status bar is controlled at runtime via the `<StatusBar>` component.
- **`react` pinned to `19.1.0`** — must stay in sync with the renderer bundled inside `react-native@0.81.5`; bumping it to `19.2.x` causes a runtime crash.
- **`npm install --legacy-peer-deps`** should be used in CI for this workspace until upstream peer-dep conflicts between `react-dom` and `expo-router`'s optional peer dependencies are resolved by Expo.
- `BottomNav` exposes an `onTabPress` callback prop — navigation wiring will be added once the remaining screens exist.
