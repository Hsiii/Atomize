#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"

bun run "$ROOT_DIR/scripts/godot/export-mobile.ts" ios
"$ROOT_DIR/scripts/godot/ios-run-device.sh"
