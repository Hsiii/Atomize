import { uiText } from '../app-state';
import type { MultiplayerState } from '../app-state';
import { PRIME_POOL } from '../core';

const playerNameStorageKey = 'atomize.playerName';

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

    return storedName;
}

export function persistPlayerName(playerName: string): void {
    const normalizedName = normalizePlayerName(playerName);

    if (!normalizedName) {
        return;
    }

    globalThis.localStorage.setItem(playerNameStorageKey, normalizedName);
}

export function getDisplayPlayerName(value: string | undefined): string {
    return normalizePlayerName(value ?? '') || uiText.guest;
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

function normalizePlayerName(value: string): string {
    return value.trim().replaceAll(/\s+/g, ' ').slice(0, 24);
}
