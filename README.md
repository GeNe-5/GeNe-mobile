# GeNe Mobile

GeNe Mobile is a React Native + Expo wellness app that streams physiological signals, predicts stress in real time, and recommends calming audio tracks based on stress level.

## What this app does

- Live physiological stream session via WebSocket
- Stress prediction flow with confidence and severity details
- Stress-level based music recommendations (Freesound API)
- Session summary, feature summary, prediction result cards
- Prediction history and PDF report generation
- Authentication and profile management

## Tech stack

- Expo + React Native + TypeScript
- React Query (`@tanstack/react-query`) for API state
- Axios for HTTP requests
- `expo-av` for audio playback
- `@react-native-community/datetimepicker` for date inputs

## Project structure (high level)

- `src/screens` — app screens
- `src/components` — reusable UI components
- `src/api` — API clients (`inference`, `music`, `reports`, etc.)
- `src/services` — socket and service-level integrations
- `src/config/env.ts` — runtime env mapping
- `src/types` — TypeScript types

## Prerequisites

- Node.js 18+
- npm
- Expo CLI (via `npx expo`)
- Android Studio emulator and/or iOS simulator/Xcode (for mobile testing)
- Running backend(s):
  - Inference HTTP API
  - Sensor stream WebSocket server

## Getting started

### 1) Install dependencies

```bash
npm install
```

### 2) Configure environment variables

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

Set values in `.env` for your machine/network:

- `EXPO_PUBLIC_USE_FASTAPI`
- `EXPO_PUBLIC_FASTAPI_BASE_URL`
- `EXPO_PUBLIC_LEGACY_API_BASE_URL`
- `EXPO_PUBLIC_FREESOUND_API_BASE_URL`
- `EXPO_PUBLIC_FREESOUND_API_KEY`
- `EXPO_PUBLIC_WS_BASE_URL_IOS`
- `EXPO_PUBLIC_WS_BASE_URL_ANDROID`
- `EXPO_PUBLIC_WS_BASE_URL_DEFAULT`

> Important: `EXPO_PUBLIC_*` variables are bundled in the client app, so do not store highly sensitive secrets.

### 3) Start the app

```bash
npm run start
```

Then choose one:

- `a` for Android emulator
- `i` for iOS simulator
- Expo Go on a physical device

You can also run directly:

```bash
npm run android
npm run ios
npm run web
```

## Network notes

- Use your computer LAN IP (example `192.168.x.x`) for physical devices.
- Use `10.0.2.2` for Android emulator host access.
- `localhost` inside a phone/emulator points to that device itself, not your computer.

## Common issues

### App cannot reach backend

- Confirm backend is running.
- Verify `.env` URLs and ports.
- Ensure phone/emulator and backend machine are on reachable network.
- Restart Expo after changing `.env`.

### WebSocket fails to connect

- Check `EXPO_PUBLIC_WS_BASE_URL_*` values.
- Ensure WebSocket server listens on correct host/port.
- Validate firewall allows incoming connection.

### No music returned

- Verify `EXPO_PUBLIC_FREESOUND_API_KEY` is valid.
- Confirm Freesound endpoint and internet connectivity.
- Some queries can be sparse; retry with broader terms or different stress level.

## Scripts

From `package.json`:

- `npm run start` — start Expo dev server
- `npm run android` — run on Android
- `npm run ios` — run on iOS
- `npm run web` — run web target

## Contributing

1. Create a feature branch
2. Make changes
3. Test on target platform(s)
4. Commit and open PR

---

