# VYBE — Global Social & Dating Mobile App

**Feel the vibe. Find your people.**

VYBE is a production-oriented global social discovery and dating app built as a
**native mobile application** for iOS and Android, with a shared TypeScript
codebase.

## Tech Stack

- **Frontend**: Vite + React 19 + TypeScript
- **UI**: Tailwind CSS v4, shadcn/ui, Framer Motion, Lucide icons
- **Backend & Database**: Convex (realtime queries, auth, storage, subscriptions)
- **Auth**: Convex Auth (email OTP, Google, Apple)
- **Mobile**: Capacitor 8 (Android + iOS native projects)
- **Native plugins**: Camera, Geolocation, Push Notifications, Haptics, Status Bar, Keyboard, Splash Screen, Preferences, App (deep links)
- **Package manager**: Bun

## Repository Layout

```
android/                  Native Android project (Gradle, applicationId com.vybe.app)
ios/                      Native iOS project (Xcode, bundle id com.vybe.app)
src/                      Shared TypeScript application (web + mobile)
  app/                    App screens (Discover, Matches, Messages, Activity, Profile, Chat, ...)
  convex/                 Convex backend (schema, queries, mutations, actions)
  lib/mobile.ts           Capacitor native bridge (deep links, push, status bar)
  lib/haptics.ts          Native haptic feedback with web fallback
scripts/generate-icons.mjs  Generates app icons + splash assets from the logo
.github/workflows/        CI (Android build + iOS check)
capacitor.config.ts       Capacitor configuration
```

## Prerequisites

- **Bun** ≥ 1.1 (`curl -fsSL https://bun.sh/install | bash`)
- **Node.js** ≥ 20
- **Android**: JDK 21 (Temurin), Android Studio with Android SDK (compileSdk 36)
- **iOS**: macOS with Xcode 16+

## Install

```bash
bun install
```

## Run Web Development

```bash
bun run dev
```

The app runs at `http://localhost:5173`. The Convex backend must be running
(managed by the Freebuff cloud environment, or locally with
`npx convex dev`).

## Mobile Development Workflow

The web app is the source of truth. After changing `src/`, sync the native
projects:

```bash
# Build the web app and copy assets into both native projects
bun run mobile:sync

# Or only copy assets without rebuilding
npx cap copy
```

### Run Android

```bash
bun run mobile:sync
cd android
./gradlew assembleDebug        # builds app-debug.apk
./gradlew installDebug         # installs on a connected device/emulator
```

Or open Android Studio:

```bash
bun run mobile:android         # npx cap open android
```

### Run iOS

```bash
bun run mobile:sync
bun run mobile:ios             # npx cap open ios
```

Then select a simulator or your device in Xcode and press **Run**. The iOS
project uses Swift Package Manager — Xcode resolves Capacitor packages
automatically on first build.

## Sync Mobile Platforms

```bash
bun run mobile:sync    # bun run build && npx cap sync
npx cap sync android   # sync only Android
npx cap sync ios       # sync only iOS
```

`cap sync` copies the freshly built web assets into the native projects and
updates plugins. Always run it after installing a new Capacitor plugin or
changing `capacitor.config.ts`.

## Build Android APK

```bash
bun run mobile:sync
cd android
./gradlew assembleDebug
```

Output: `android/app/build/outputs/apk/debug/app-debug.apk`

Release build (unsigned):

```bash
cd android
./gradlew assembleRelease
```

Output: `android/app/build/outputs/apk/release/app-release-unsigned.apk`

## Build Android App Bundle (.aab)

```bash
cd android
./gradlew bundleRelease
```

Output: `android/app/build/outputs/bundle/release/app-release.aab`

The AAB requires a signed keystore to be usable on Google Play — see
[Release Signing](#release-signing).

## Generate App Icons & Splash Assets

Icons are generated from `src/assets/logo.svg`:

```bash
bun run mobile:icons
```

This rewrites all Android mipmaps, splash drawables, and the iOS AppIcon set
and splash images. Run it after changing the logo, then `npx cap sync`.

## Environment Variables

| Variable                  | Where       | Purpose                                  |
| ------------------------- | ----------- | ---------------------------------------- |
| `VITE_CONVEX_URL`         | Client      | Convex deployment URL                    |
| `CONVEX_DEPLOYMENT`       | Backend     | Convex deployment ID                     |
| `JWKS` / `JWT_PRIVATE_KEY`| Backend     | Convex Auth signing keys                 |
| `SITE_URL`                | Backend     | Canonical site URL for auth redirects    |
| `VITE_VLY_APP_ID`         | Client      | Vly monitoring/analytics app id          |
| `VITE_VLY_MONITORING_URL` | Client      | Vly error-reporting endpoint             |

Copy `.env.example` to `.env.local` for local client values. **Never commit**
real keys. Backend secrets are managed through the platform's Keys/API keys UI.

## Push Notifications

Push support is wired into `src/lib/mobile.ts` (permission request,
registration, token storage, and tap-to-navigate deep linking). Delivery needs
Firebase Cloud Messaging, which requires your own Firebase project:

### Android (FCM)

1. Create a Firebase project and register the Android app with package
   `com.vybe.app`.
2. Download `google-services.json` and place it at `android/google-services.json`
   (gitignored — never commit it).
3. The app's `build.gradle` applies the Google Services plugin automatically
   when the file is present.
4. Add a `route` field to notification payloads (e.g. `/app/chat/<matchId>`) so
   taps open the right screen.

### iOS (APNs)

1. In the Apple Developer portal, enable **Push Notifications** for the App ID
   `com.vybe.app` and generate an APNs auth key.
2. Add the APNs key to your Firebase project under **Cloud Messaging**.
3. Download `GoogleService-Info.plist` and add it to the `App` target in Xcode
   (gitignored).

Until FCM is configured, the app runs normally; only push delivery is absent.

## In-App Purchases

VYBE's subscription tiers (Silver, Gold, Platinum) are enforced server-side:
Convex is the source of truth for entitlements
(`src/convex/entitlements.ts`, `src/convex/subscriptions.ts`). The client never
unlocks premium features by itself.

Native billing (Google Play Billing / Apple StoreKit) requires your own
developer accounts:

1. **Google Play Console** — create the app with `com.vybe.app`, add the
   in-app products (Silver/Gold/Platinum monthly + annual).
2. **App Store Connect** — create the app with bundle id `com.vybe.app` and
   configure the same auto-renewable subscriptions.

A native billing bridge (e.g. RevenueCat or Capacitor billing plugins) can then
forward verified receipts to the Convex backend for entitlement checks. This
step is intentionally not simulated in the app.

## GitHub Actions

- **`.github/workflows/android-build.yml`** — on push/PR: installs
  dependencies, typechecks, lints, builds the web app, syncs Capacitor,
  compiles the debug APK with the Android SDK, and uploads `app-debug.apk` as a
  build artifact. Fails the run if the APK cannot be built.
- **`.github/workflows/ios-check.yml`** — on push/PR (macOS runner): typechecks,
  builds the web app, syncs Capacitor, and compiles an **unsigned simulator
  build** with `xcodebuild` to validate the Xcode project. Real signed iOS
  builds require Apple certificates and run from a local Mac or a paid Apple
  runner.

## Release Signing

### Android

1. Generate a keystore (keep it private, store the password in your CI
   secrets):
   ```bash
   keytool -genkey -v -keystore vybe-release.keystore \
     -alias vybe -keyalg RSA -keysize 2048 -validity 10000
   ```
2. Create `android/keystore.properties` (gitignored):
   ```properties
   storeFile=../vybe-release.keystore
   storePassword=***
   keyAlias=vybe
   keyPassword=***
   ```
3. Add the signing config to `android/app/build.gradle` and build
   `assembleRelease` / `bundleRelease`.
4. In GitHub Actions, add the keystore as a base64 secret and the passwords as
   secrets, then sign the release artifacts before upload.

### iOS

1. In Xcode → *Signing & Capabilities*, select your team and enable
   **Automatically manage signing**.
2. Set the bundle identifier to `com.vybe.app`.
3. Create the distribution profile in the Apple Developer portal and archive
   via **Product → Archive**, then upload to App Store Connect.

Never commit keystores, certificates, provisioning profiles, or
`google-services.json` / `GoogleService-Info.plist`.

## App Configuration Reference

- **App IDs**: `com.vybe.app` (Android `applicationId` + iOS bundle id) —
  set in `capacitor.config.ts` and synced into both native projects.
- **Android permissions** (`android/app/src/main/AndroidManifest.xml`):
  internet, camera, coarse+fine location, notifications, photo library
  (Android 13+ / legacy), vibration. Permissions are requested contextually in
  the app, never all at launch.
- **iOS permissions** (`ios/App/App/Info.plist`): camera, photo library
  (read + add), location (when-in-use + always), remote notifications with
  user-facing usage strings.
- **Dark mode**: the app defaults to a deep-dark theme
  (`#0b0b12` background, violet/pink accents) with light mode supported.
- **Safe areas**: handled via `env(safe-area-inset-*)` utilities and Capacitor
  status bar overlays.

## VYBE Feature Map

| Screen        | Purpose                                                        |
| ------------- | -------------------------------------------------------------- |
| Landing `/`   | Brand landing with sign-in / sign-up CTAs                       |
| Auth `/auth`  | Apple / Google / Email OTP sign-in                              |
| Onboarding    | Step-by-step profile setup (name, DOB, gender, photos, bio...)  |
| Discover      | Card-based profile discovery with swipe + Super VYBE            |
| Matches       | Mutual matches with verified badges                             |
| Messages      | Conversations, read receipts, verified badges                   |
| Activity      | Likes / notifications feed                                      |
| Profile       | Own profile, edit, Boost, Question of the Day                   |
| Premium       | Silver / Gold / Platinum subscription plans                     |
| Verify        | Live-camera liveness verification with randomized challenges    |

## Contributing & Conventions

- Use Bun for installs and scripts.
- Typecheck: `bun tsc -b --noEmit` · Lint: `bun run lint`
- Convex functions live in `src/convex/`; run `bun convex dev --once` to
  regenerate types after schema changes.
- Never hand-edit `src/convex/_generated/*`.
- Keep the app mobile-first: bottom tab navigation, swipe gestures, native
  sheets, safe-area aware, dark mode primary.
