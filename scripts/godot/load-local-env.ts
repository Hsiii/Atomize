import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const rootDirectory = path.resolve(import.meta.dirname, '../..');

function isSupportedEnvKey(key: string): boolean {
    return (
        key.startsWith('GODOT_') ||
        key.startsWith('IOS_') ||
        key === 'APPLE_TEAM_ID' ||
        key === 'VITE_SUPABASE_ANON_KEY' ||
        key === 'VITE_SUPABASE_URL'
    );
}

function parseEnvValue(value: string): string {
    const trimmedValue = value.trim();
    const quote = trimmedValue.at(0);

    if (
        (quote === '"' || quote === "'") &&
        trimmedValue.endsWith(quote) &&
        trimmedValue.length >= 2
    ) {
        return trimmedValue.slice(1, -1);
    }

    return trimmedValue;
}

export function loadLocalEnv(): void {
    const localEnvPath = process.env.LOCAL_ENV_FILE
        ? path.resolve(process.env.LOCAL_ENV_FILE)
        : path.join(rootDirectory, '.env.local');

    if (!existsSync(localEnvPath)) {
        return;
    }

    for (const line of readFileSync(localEnvPath, 'utf8').split(/\r?\n/)) {
        const trimmedLine = line.trim();

        if (!trimmedLine || trimmedLine.startsWith('#')) {
            continue;
        }

        const separatorIndex = trimmedLine.indexOf('=');

        if (separatorIndex <= 0) {
            continue;
        }

        const key = trimmedLine.slice(0, separatorIndex).trim();

        if (
            !/^[A-Z_a-z]\w*$/.test(key) ||
            !isSupportedEnvKey(key) ||
            process.env[key]
        ) {
            continue;
        }

        process.env[key] = parseEnvValue(trimmedLine.slice(separatorIndex + 1));
    }
}
