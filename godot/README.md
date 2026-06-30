# Atomize Godot Port

This directory is a parallel Godot 4 project for the iOS and Android port.
The Vite app remains the web/PWA client.

## Start Here

Use this path when setting up a machine for the first time:

1. Install the repo dependencies from the repository root:

    ```bash
    bun install
    ```

2. Install Godot 4.x.

    On macOS, the wrapper scripts auto-detect both common app bundle names:

    ```text
    /Applications/Godot.app/Contents/MacOS/Godot
    /Applications/Godot_mono.app/Contents/MacOS/Godot
    ```

    If Godot is elsewhere, add this to the root `.env.local` file:

    ```bash
    GODOT_BIN=/absolute/path/to/godot
    ```

3. Open the project once:

    ```bash
    bun run godot:open
    ```

4. In Godot, install matching export templates:

    ```text
    Editor > Manage Export Templates > Download and Install
    ```

5. Run the parity check:

    ```bash
    bun run godot:test
    ```

6. Run the game in the editor with the play button, or press `F5`.

The main scene is `res://scenes/Main.tscn`. It is a solo gameplay harness for
device latency testing, not a full replacement for the Vite UI yet.

## Command Reference

Run these commands from the repository root:

| Task                                         | Command                  |
| -------------------------------------------- | ------------------------ |
| Open the Godot editor                        | `bun run godot:open`     |
| Regenerate parity fixtures                   | `bun run godot:fixtures` |
| Run TypeScript/Godot parity tests            | `bun run godot:test`     |
| Export Android debug APK                     | `bun run android:export` |
| Export iOS debug Xcode package               | `bun run ios:export`     |
| Export, build, install, and launch on iPhone | `bun run ios`            |

## Logic Parity

The Godot core mirrors the TypeScript rules:

- `src/core/random.ts` -> `godot/scripts/core/random.gd`
- `src/core/game.ts` -> `godot/scripts/core/game.gd`
- `src/core/timing.ts` -> `godot/scripts/core/timing.gd`
- `src/lib/multiplayer-room.ts` -> `godot/scripts/core/multiplayer_room.gd`

`bun run godot:test` regenerates fixtures from the TypeScript source, then runs
the Godot headless test suite. The command fails fast when Godot cannot be
found, when scripts do not parse, or when parity output differs.

## Local Environment

The Godot scripts read selected machine and signing variables from the
git-ignored root `.env.local` file:

```bash
GODOT_BIN=/Applications/Godot.app/Contents/MacOS/Godot

# Required for iOS export.
GODOT_IOS_TEAM_ID=your-apple-team-id

# Used by the iOS device install script.
APPLE_TEAM_ID=your-apple-team-id
IOS_DEVICE_ID=optional-specific-device-udid
```

For exported builds that should use Supabase instead of the local leaderboard
fallback, provide both values in the command environment:

```bash
VITE_SUPABASE_URL=your-project-url \
    VITE_SUPABASE_ANON_KEY=your-anon-key \
    bun run android:export
```

Omitting Supabase values is expected for offline gameplay testing.

## Android Setup

Install these once per machine:

- Godot 4.x export templates, installed from the Godot editor.
- OpenJDK 17.
- Android Studio with Android SDK Platform-Tools, Build-Tools, Platform 35,
  Command-line Tools, NDK, and CMake.
- A physical Android device with Developer Options and USB debugging enabled,
  or an Android emulator.

After Android Studio finishes first-run setup, open Godot editor settings:

```text
Godot > Editor Settings > Export > Android
```

Set:

- `Java SDK Path` to the JDK 17 install directory.
- `Android SDK Path` to the Android SDK directory.

Common macOS paths:

```text
/Library/Java/JavaVirtualMachines/<jdk>/Contents/Home
/Users/<you>/Library/Android/sdk
```

Then export the debug APK:

```bash
bun run android:export
```

Output:

```text
godot/build/android/atomize-debug.apk
```

Install it on a connected device with Android Studio, or from the terminal:

```bash
adb install -r godot/build/android/atomize-debug.apk
```

The Android preset is named `Android Debug`, uses package
`dev.hsichen.atomize`, and currently exports an ARM64 debug APK.

## iOS Setup

iOS export requires macOS with Xcode installed.

Install these once per machine:

- Godot 4.x export templates, installed from the Godot editor.
- Xcode from the App Store or Apple Developer downloads.
- Xcode command line tools:

    ```bash
    xcode-select --install
    ```

- An Apple Developer team capable of signing development builds.
- A connected, unlocked iPhone trusted by this Mac.

Add signing values to root `.env.local`:

```bash
GODOT_IOS_TEAM_ID=your-apple-team-id
APPLE_TEAM_ID=your-apple-team-id
```

Export the debug Xcode package:

```bash
bun run ios:export
```

Output:

```text
godot/build/ios/atomize-ios.zip
```

For manual testing, open the exported Xcode project/package, set signing if
Xcode asks, select the connected iPhone, and run.

For the local CLI path, run:

```bash
bun run ios
```

That command exports the Godot project, builds with `xcodebuild`, installs the
app through `xcrun devicectl`, and launches it on the connected iPhone.

The iOS preset is named `iOS Debug` and uses bundle identifier
`dev.hsichen.atomize`.

## Troubleshooting

### Godot was not found

Run:

```bash
which godot || which godot4
```

If neither exists and the app is not in `/Applications`, set `GODOT_BIN` in
`.env.local` to the full executable path.

### Export templates are missing

Open Godot and install templates from:

```text
Editor > Manage Export Templates > Download and Install
```

Templates must match the Godot editor version. Reinstall templates after
upgrading Godot.

### Android export cannot find Java or the SDK

Open:

```text
Godot > Editor Settings > Export > Android
```

Recheck `Java SDK Path` and `Android SDK Path`. The Android SDK directory should
contain `platform-tools/adb`.

### Android install fails because the package already exists

If a device has `dev.hsichen.atomize` installed with a different signing key,
remove the old app from the device and install again.

### iOS export fails before Xcode opens

Check that `.env.local` contains `GODOT_IOS_TEAM_ID`. The export script writes
that value into the temporary export preset and restores the tracked file after
the command exits.

### iOS install cannot find a device

Connect and unlock the iPhone, then run:

```bash
xcrun devicectl list devices
```

If more than one device is connected, set `IOS_DEVICE_ID` in `.env.local`.

### Xcode selects the wrong SDK

Point command line tools at the active Xcode app:

```bash
sudo xcode-select -s /Applications/Xcode.app/Contents/Developer
```

## Reference Links

These links are here for version-specific details, not for normal onboarding:

- [Godot Android export requirements](https://docs.godotengine.org/en/stable/tutorials/export/exporting_for_android.html)
- [Godot iOS export requirements](https://docs.godotengine.org/en/stable/tutorials/export/exporting_for_ios.html)
- [Godot command-line export flags](https://docs.godotengine.org/en/stable/tutorials/export/exporting_projects.html)
