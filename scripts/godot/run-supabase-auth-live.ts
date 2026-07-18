import { spawnSync } from 'node:child_process';
import process from 'node:process';

import { GODOT_DIRECTORY, requireGodotBinary } from './godot-cli';
import { loadLocalEnv } from './load-local-env';

loadLocalEnv();

const result = spawnSync(
    requireGodotBinary(),
    [
        '--headless',
        '--path',
        GODOT_DIRECTORY,
        '--script',
        'res://tests/run_supabase_auth_live.gd',
    ],
    { encoding: 'utf8' }
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

const output = `${result.stdout}${result.stderr}`;
if (
    result.status !== 0 ||
    output.includes('SCRIPT ERROR') ||
    output.includes('Parse Error') ||
    output.includes('Failed to load script')
) {
    process.exit(1);
}

process.exit(0);
