import { spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import path from 'node:path';
import process from 'node:process';

export const ROOT_DIRECTORY = path.resolve(import.meta.dirname, '../..');
export const GODOT_DIRECTORY = path.resolve(ROOT_DIRECTORY, 'godot');

export function findGodotBinary(): string | undefined {
    const configuredGodotBinary = process.env.GODOT_BIN;
    const candidateBinaries = [
        ...(configuredGodotBinary ? [configuredGodotBinary] : []),
        'godot',
        'godot4',
        '/Applications/Godot.app/Contents/MacOS/Godot',
        '/Applications/Godot_mono.app/Contents/MacOS/Godot',
    ];

    return candidateBinaries.find((candidate) => {
        if (candidate.includes(path.sep) && !existsSync(candidate)) {
            return false;
        }

        const result = spawnSync(candidate, ['--version'], {
            stdio: 'ignore',
        });

        return result.status === 0;
    });
}

export function requireGodotBinary(): string {
    const godotBinary = findGodotBinary();

    if (!godotBinary) {
        console.error(
            '[Error] Godot was not found. Install Godot 4.x or set GODOT_BIN=/path/to/godot.'
        );
        process.exit(1);
    }

    return godotBinary;
}
