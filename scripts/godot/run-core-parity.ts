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
        encoding: 'utf8',
    }
);

if (result.stdout) {
    process.stdout.write(result.stdout);
}

if (result.stderr) {
    process.stderr.write(result.stderr);
}

if (result.error) {
    console.error(`[Error] Failed to run Godot: ${result.error.message}`);
    process.exit(1);
}

if (
    result.stderr.includes('SCRIPT ERROR') ||
    result.stderr.includes('Parse Error') ||
    result.stderr.includes('Failed to load script')
) {
    process.exit(1);
}

process.exit(result.status ?? 1);
