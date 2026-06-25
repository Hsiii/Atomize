import { spawnSync } from 'node:child_process';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
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
const buildDirectory = path.resolve(GODOT_DIRECTORY, 'build');
mkdirSync(buildDirectory, { recursive: true });
writeFileSync(path.join(buildDirectory, '.gdignore'), '');

const exportPresetsPath = path.join(GODOT_DIRECTORY, 'export_presets.cfg');
const originalExportPresets = readFileSync(exportPresetsPath, 'utf8');
let shouldRestoreExportPresets = false;

if (target === 'ios') {
    const iosTeamId = process.env.GODOT_IOS_TEAM_ID;

    if (!iosTeamId) {
        console.error(
            '[Error] Set GODOT_IOS_TEAM_ID before exporting iOS builds.'
        );
        process.exit(1);
    }

    const nextExportPresets = originalExportPresets.replace(
        /application\/app_store_team_id="[^"]*"/,
        `application/app_store_team_id="${iosTeamId}"`
    );

    if (nextExportPresets === originalExportPresets) {
        console.error(
            '[Error] Could not find application/app_store_team_id in godot/export_presets.cfg.'
        );
        process.exit(1);
    }

    writeFileSync(exportPresetsPath, nextExportPresets);
    shouldRestoreExportPresets = true;
}

const result = (() => {
    try {
        return spawnSync(
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
    } finally {
        if (shouldRestoreExportPresets) {
            writeFileSync(exportPresetsPath, originalExportPresets);
        }
    }
})();

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
