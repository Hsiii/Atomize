import { PRIME_POOL } from '@atomize/game-core';

import { uiText } from '../app-state';
import type { MultiplayerState } from '../app-state';

const playerNameStorageKey = 'atomize.playerName';
const usedPlayerNamesStorageKey = 'atomize.usedPlayerNames';
const fallbackPlayerNames = [
    'Nova',
    'Orbit',
    'Pulse',
    'Quark',
    'Comet',
    'Prism',
    'Drift',
    'Echo',
    'Cipher',
    'Flux',
    'Ion',
    'Pixel',
] as const;

export const soloDurationSeconds = 60;
export const playablePrimes = PRIME_POOL.slice(0, 9);

export async function wait(durationMs: number): Promise<undefined> {
    await new Promise<void>((resolve) => {
        globalThis.setTimeout(
            () => {
                resolve();
            },
            durationMs,
            undefined
        );
    });

    return undefined;
}

export function detachPromise(promise: Promise<unknown>): void {
    promise.catch(() => undefined);
}

export function createSoloRunSeed(): string {
    return `solo:${crypto.randomUUID()}`;
}

export function getInitialPlayerName(): string {
    const storedName = normalizePlayerName(
        globalThis.localStorage.getItem(playerNameStorageKey) ?? ''
    );

    if (storedName) {
        return storedName;
    }

    return uiText.guest;
}

export function persistPlayerName(playerName: string): void {
    const normalizedName = normalizePlayerName(playerName);

    if (!normalizedName) {
        return;
    }

    globalThis.localStorage.setItem(playerNameStorageKey, normalizedName);

    const nextUsedNames = [
        normalizedName,
        ...getUsedPlayerNames().filter((name) => name !== normalizedName),
    ].slice(0, fallbackPlayerNames.length);

    globalThis.localStorage.setItem(
        usedPlayerNamesStorageKey,
        JSON.stringify(nextUsedNames)
    );
}

export function createRoomId(): string {
    return String(Math.floor(1000 + Math.random() * 9000));
}

export function formatCountdown(totalSeconds: number): string {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;

    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

export function isPendingGuestJoin(multiplayer: MultiplayerState): boolean {
    return (
        !multiplayer.isHost &&
        Boolean(multiplayer.playerId) &&
        !multiplayer.roomId &&
        !multiplayer.snapshot
    );
}

function getUsedPlayerNames(): readonly string[] {
    const rawValue = globalThis.localStorage.getItem(usedPlayerNamesStorageKey);

    if (!rawValue) {
        return [];
    }

    try {
        const parsedValue = JSON.parse(rawValue) as unknown;
        return isArray(parsedValue)
            ? parsedValue
                  .map((name) => normalizePlayerName(String(name)))
                  .filter(Boolean)
            : [];
    } catch {
        return [];
    }
}

function normalizePlayerName(value: string): string {
    return value.trim().replaceAll(/\s+/g, ' ').slice(0, 24);
}

function isArray(value: unknown): value is readonly unknown[] {
    return (
        value !== null &&
        typeof value === 'object' &&
        value.constructor === Array
    );
}
