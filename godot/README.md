# Atomize Godot Port

This directory is a parallel Godot 4 project. The existing Vite app remains the
web/PWA client.

## Logic Parity

The Godot core mirrors the TypeScript rules:

- `src/core/random.ts` -> `godot/scripts/core/random.gd`
- `src/core/game.ts` -> `godot/scripts/core/game.gd`
- `src/core/timing.ts` -> `godot/scripts/core/timing.gd`
- `src/lib/multiplayer-room.ts` -> `godot/scripts/core/multiplayer_room.gd`

Run the parity check with:

```bash
bun run godot:test
```

The command regenerates fixtures from the TypeScript source, then runs the
Godot headless test. Install Godot 4.x or set `GODOT_BIN=/path/to/godot` first.

## Local Development

Open the Godot project:

```bash
bun run godot:open
```

The main scene is `res://scenes/Main.tscn`. It is a small solo gameplay harness
for device latency testing, not a replacement for the Vite UI yet.

## Android

Prerequisites:

- Godot 4.x export templates
- Android Studio with Android SDK, platform tools, build tools, and JDK
- USB debugging enabled on a test device

After configuring Android paths in Godot editor settings, export a debug APK:

```bash
bun run godot:export:android
```

Output:

```text
godot/build/android/atomize-debug.apk
```

## iOS

Prerequisites:

- macOS
- Xcode
- Godot 4.x export templates
- Apple signing team configured in Godot/Xcode

Export the debug Xcode package:

```bash
bun run godot:export:ios
```

Output:

```text
godot/build/ios/atomize-ios.zip
```

Open the exported Xcode project/package, set signing, select a connected iPhone,
and run from Xcode for device testing.

For local CLI installs, put signing values in the git-ignored root `.env.local`
file so commands do not need inline secrets:

```bash
GODOT_IOS_TEAM_ID=your-apple-team-id
APPLE_TEAM_ID=your-apple-team-id
```

Then export and sync to a connected, unlocked iPhone:

```bash
bun run godot:export:ios
bun run godot:ios:run
```
