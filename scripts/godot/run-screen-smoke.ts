import { spawnSync } from 'node:child_process';
import process from 'node:process';

import { GODOT_DIRECTORY, requireGodotBinary } from './godot-cli';

const smokeScreens = [
    undefined,
    'help',
    'tutorial',
    'leaderboard',
    'solo-pregame',
    'solo',
    'battle',
    'battle-ready',
    'battle-game',
] as const;

const godotBinary = requireGodotBinary();
let didFail = false;

for (const screen of smokeScreens) {
    const label = screen ?? 'home';
    const args = [
        '--headless',
        '--path',
        GODOT_DIRECTORY,
        '--script',
        'res://tests/run_screen_smoke.gd',
    ];

    if (screen) {
        args.push('--', `--atomize-screen=${screen}`);
    }

    const result = spawnSync(godotBinary, args, {
        encoding: 'utf8',
    });

    if (result.stdout) {
        process.stdout.write(result.stdout);
    }

    if (result.stderr) {
        process.stderr.write(result.stderr);
    }

    if (result.error) {
        console.error(
            `[Error] Godot screen smoke failed for ${label}: ${result.error.message}`
        );
        didFail = true;
        continue;
    }

    const output = `${result.stdout}${result.stderr}`;
    if (
        result.status !== 0 ||
        output.includes('SCRIPT ERROR') ||
        output.includes('Parse Error') ||
        output.includes('Failed to load script')
    ) {
        console.error(`[Error] Godot screen smoke failed for ${label}.`);
        didFail = true;
    }
}

process.exit(didFail ? 1 : 0);
