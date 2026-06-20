import { spawnSync } from 'node:child_process';
import process from 'node:process';

import { findGodotBinary, GODOT_DIRECTORY } from './godot-cli';

const godotBinary = findGodotBinary();

if (!godotBinary) {
    console.error(
        '[Error] Godot was not found. Install Godot 4.x or set GODOT_BIN=/path/to/godot.'
    );
    process.exit(1);
}

const result = spawnSync(
    godotBinary,
    [
        '--headless',
        '--path',
        GODOT_DIRECTORY,
        '--script',
        'res://tests/run_core_parity.gd',
    ],
    {
        stdio: 'inherit',
    }
);

if (result.error) {
    console.error(`[Error] Failed to run Godot: ${result.error.message}`);
    process.exit(1);
}

process.exit(result.status ?? 1);
