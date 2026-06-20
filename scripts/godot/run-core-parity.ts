import { spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const rootDirectory = path.resolve(import.meta.dirname, '../..');
const godotDirectory = path.resolve(rootDirectory, 'godot');
const configuredGodotBinary = process.env.GODOT_BIN;
const candidateBinaries = [
    ...(configuredGodotBinary ? [configuredGodotBinary] : []),
    'godot',
    'godot4',
    '/Applications/Godot.app/Contents/MacOS/Godot',
    '/Applications/Godot_mono.app/Contents/MacOS/Godot',
];

const godotBinary = candidateBinaries.find((candidate) => {
    if (candidate.includes(path.sep) && !existsSync(candidate)) {
        return false;
    }

    const result = spawnSync(candidate, ['--version'], {
        stdio: 'ignore',
    });

    return result.status === 0;
});

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
        godotDirectory,
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
