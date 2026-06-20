import { spawnSync } from 'node:child_process';
import { mkdirSync } from 'node:fs';
import path from 'node:path';
import process from 'node:process';

import { GODOT_DIRECTORY, requireGodotBinary } from './godot-cli';

const target = process.argv[2];
const exportsByTarget = {
    android: {
        outputPath: path.resolve(
            GODOT_DIRECTORY,
            'build/android/atomize-debug.apk'
        ),
        preset: 'Android Debug',
    },
    ios: {
        outputPath: path.resolve(GODOT_DIRECTORY, 'build/ios/atomize-ios.zip'),
        preset: 'iOS Debug',
    },
} as const;

if (target !== 'android' && target !== 'ios') {
    console.error('Usage: bun run scripts/godot/export-mobile.ts android|ios');
    process.exit(1);
}

const exportConfig = exportsByTarget[target];
mkdirSync(path.dirname(exportConfig.outputPath), { recursive: true });

const result = spawnSync(
    requireGodotBinary(),
    [
        '--headless',
        '--path',
        GODOT_DIRECTORY,
        '--export-debug',
        exportConfig.preset,
        exportConfig.outputPath,
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
    console.error(`[Error] Godot export failed: ${result.error.message}`);
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
