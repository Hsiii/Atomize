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
const godotBinary = requireGodotBinary();
mkdirSync(path.dirname(exportConfig.outputPath), { recursive: true });
const buildDirectory = path.resolve(GODOT_DIRECTORY, 'build');
mkdirSync(buildDirectory, { recursive: true });
writeFileSync(path.join(buildDirectory, '.gdignore'), '');

const exportPresetsPath = path.join(GODOT_DIRECTORY, 'export_presets.cfg');
const originalExportPresets = readFileSync(exportPresetsPath, 'utf8');
let shouldRestoreExportPresets = false;

const projectSettingsPath = path.join(GODOT_DIRECTORY, 'project.godot');
const originalProjectSettings = readFileSync(projectSettingsPath, 'utf8');
let shouldRestoreProjectSettings = false;

function escapeRegExp(value: string): string {
    return value.replaceAll(/[$()*+.?[\\\]^{|}]/g, String.raw`\$&`);
}

function escapeGodotString(value: string): string {
    return value
        .replaceAll('\\', String.raw`\\`)
        .replaceAll('"', String.raw`\"`);
}

function setApplicationSetting(
    contents: string,
    key: string,
    value: string
): string {
    const line = `${key}="${escapeGodotString(value)}"`;
    const existingSettingPattern = new RegExp(
        `^${escapeRegExp(key)}="[^"]*"`,
        'm'
    );

    if (existingSettingPattern.test(contents)) {
        return contents.replace(existingSettingPattern, line);
    }

    const sectionPattern = /\[application]\n/;
    const sectionMatch = sectionPattern.exec(contents);
    if (!sectionMatch) {
        throw new Error('Could not find [application] in godot/project.godot.');
    }

    const insertAt = sectionMatch.index + sectionMatch[0].length;
    return `${contents.slice(0, insertAt)}${line}\n${contents.slice(insertAt)}`;
}

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;
const iosTeamId = process.env.GODOT_IOS_TEAM_ID;
let nextExportPresets = originalExportPresets;

if (target === 'ios') {
    if (!iosTeamId) {
        console.error(
            '[Error] Set GODOT_IOS_TEAM_ID in .env.local before exporting iOS builds.'
        );
        process.exit(1);
    }

    nextExportPresets = originalExportPresets.replace(
        /application\/app_store_team_id="[^"]*"/,
        `application/app_store_team_id="${iosTeamId}"`
    );

    if (nextExportPresets === originalExportPresets) {
        console.error(
            '[Error] Could not find application/app_store_team_id in godot/export_presets.cfg.'
        );
        process.exit(1);
    }
}

if (supabaseUrl && supabaseAnonKey) {
    const nextProjectSettings = setApplicationSetting(
        setApplicationSetting(
            originalProjectSettings,
            'config/supabase_url',
            supabaseUrl
        ),
        'config/supabase_anon_key',
        supabaseAnonKey
    );

    writeFileSync(projectSettingsPath, nextProjectSettings);
    shouldRestoreProjectSettings = true;
} else {
    console.warn(
        '[Warn] VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY is missing; exported Godot build will use local leaderboard fallback.'
    );
}

if (target === 'ios') {
    writeFileSync(exportPresetsPath, nextExportPresets);
    shouldRestoreExportPresets = true;
}

const result = (() => {
    try {
        return spawnSync(
            godotBinary,
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
        if (shouldRestoreProjectSettings) {
            writeFileSync(projectSettingsPath, originalProjectSettings);
        }

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
