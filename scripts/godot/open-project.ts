import { spawnSync } from 'node:child_process';
import process from 'node:process';

import { GODOT_DIRECTORY, requireGodotBinary } from './godot-cli';

const result = spawnSync(requireGodotBinary(), ['--path', GODOT_DIRECTORY], {
    stdio: 'inherit',
});

if (result.error) {
    console.error(`[Error] Failed to open Godot: ${result.error.message}`);
    process.exit(1);
}

process.exit(result.status ?? 1);
