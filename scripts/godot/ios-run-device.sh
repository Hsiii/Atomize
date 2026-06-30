#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
source "$ROOT_DIR/scripts/godot/load-local-env.sh"

PROJECT="${IOS_PROJECT:-$ROOT_DIR/godot/build/ios/atomize-ios.xcodeproj}"
SCHEME="${IOS_SCHEME:-atomize-ios}"
CONFIGURATION="${IOS_CONFIGURATION:-Debug}"
DERIVED_DATA_PATH="${IOS_DERIVED_DATA_PATH:-$ROOT_DIR/godot/build/ios/DeviceDerivedData}"
BUNDLE_ID="${IOS_BUNDLE_ID:-dev.hsichen.atomize}"
APP_PATH="${IOS_APP_PATH:-$DERIVED_DATA_PATH/Build/Products/$CONFIGURATION-iphoneos/$SCHEME.app}"

detect_device_id() {
    local devices_json
    devices_json="$(mktemp)"

    if ! xcrun devicectl list devices --json-output "$devices_json" >/dev/null; then
        rm -f "$devices_json"
        return 1
    fi

    local device_id
    device_id="$(
        plutil -extract result.devices.0.hardwareProperties.udid raw -o - "$devices_json" 2>/dev/null || true
    )"
    rm -f "$devices_json"

    [[ -n "$device_id" ]] && printf '%s\n' "$device_id"
}

echo "Detecting connected iOS device..."
DEVICE_ID="${IOS_DEVICE_ID:-$(detect_device_id)}"
if [[ -z "$DEVICE_ID" ]]; then
    echo "No connected iOS device found. Connect one, or set IOS_DEVICE_ID." >&2
    exit 1
fi

if [[ ! -d "$PROJECT" ]]; then
    echo "Godot iOS Xcode project not found at $PROJECT." >&2
    echo "Set GODOT_IOS_TEAM_ID in .env.local, then run: bun run ios:export" >&2
    exit 1
fi

PROVISIONING_ARGS=()
if [[ "${IOS_ALLOW_PROVISIONING_UPDATES:-1}" != "0" ]]; then
    PROVISIONING_ARGS=(-allowProvisioningUpdates)
fi

TEAM_ARGS=()
if [[ -n "${APPLE_TEAM_ID:-}" ]]; then
    TEAM_ARGS=(DEVELOPMENT_TEAM="$APPLE_TEAM_ID")
fi

XCODEBUILD_ARGS=(
    -project "$PROJECT"
    -scheme "$SCHEME"
    -configuration "$CONFIGURATION"
    -sdk iphoneos
    -destination "id=$DEVICE_ID"
    -derivedDataPath "$DERIVED_DATA_PATH"
)

if [[ ${#PROVISIONING_ARGS[@]} -gt 0 ]]; then
    XCODEBUILD_ARGS+=("${PROVISIONING_ARGS[@]}")
fi

if [[ ${#TEAM_ARGS[@]} -gt 0 ]]; then
    XCODEBUILD_ARGS+=("${TEAM_ARGS[@]}")
fi

XCODEBUILD_ARGS+=(build)

echo "Building $SCHEME for device $DEVICE_ID..."
xcodebuild "${XCODEBUILD_ARGS[@]}"

if [[ ! -d "$APP_PATH" ]]; then
    echo "Built app not found at $APP_PATH." >&2
    echo "Set IOS_APP_PATH if the product name differs from the scheme." >&2
    exit 1
fi

echo "Installing $APP_PATH..."
xcrun devicectl device install app --device "$DEVICE_ID" "$APP_PATH"

if [[ "${IOS_SKIP_LAUNCH:-0}" == "1" ]]; then
    echo "Installed $BUNDLE_ID on $DEVICE_ID."
    exit 0
fi

echo "Launching $BUNDLE_ID..."
launch_output="$(
    xcrun devicectl device process launch \
        --device "$DEVICE_ID" \
        --terminate-existing \
        "$BUNDLE_ID" 2>&1
)" || {
    if [[ "$launch_output" == *"because the device was not, or could not be, unlocked"* ]]; then
        echo "$launch_output" >&2
        echo "Installed $BUNDLE_ID on $DEVICE_ID. Unlock the device and tap Atomize, or rerun this command." >&2
        exit 0
    fi

    echo "$launch_output" >&2
    exit 1
}

echo "Updated and launched $BUNDLE_ID on $DEVICE_ID."
