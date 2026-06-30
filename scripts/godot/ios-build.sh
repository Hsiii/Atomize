#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
source "$ROOT_DIR/scripts/godot/load-local-env.sh"

PROJECT="${IOS_PROJECT:-$ROOT_DIR/godot/build/ios/atomize-ios.xcodeproj}"
SCHEME="${IOS_SCHEME:-atomize-ios}"
CONFIGURATION="${IOS_CONFIGURATION:-Debug}"
SDK="${IOS_SDK:-iphoneos}"
DESTINATION="${IOS_DESTINATION:-generic/platform=iOS}"
DERIVED_DATA_PATH="${IOS_DERIVED_DATA_PATH:-$ROOT_DIR/godot/build/ios/DerivedData}"

if [[ ! -d "$PROJECT" ]]; then
    echo "Godot iOS Xcode project not found at $PROJECT." >&2
    echo "Set GODOT_IOS_TEAM_ID in .env.local, then run: bun run ios:export" >&2
    exit 1
fi

xcodebuild \
    -project "$PROJECT" \
    -scheme "$SCHEME" \
    -configuration "$CONFIGURATION" \
    -sdk "$SDK" \
    -destination "$DESTINATION" \
    -derivedDataPath "$DERIVED_DATA_PATH" \
    CODE_SIGNING_ALLOWED=NO \
    build
