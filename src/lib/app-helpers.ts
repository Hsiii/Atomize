import { uiText } from '../app-state';
import type { MultiplayerState } from '../app-state';
import { PRIME_POOL } from '../core';

const playerNameStorageKey = 'atomize.playerName';
const bestScoreStorageKey = 'atomize.bestScore';
const bestMaxComboStorageKey = 'atomize.bestMaxCombo';
const tutorialCompleteStorageKey = 'atomize.tutorialComplete';
const guestModeStorageKey = 'atomize.isGuestMode';

const guestSessionNumber = Math.floor(Math.random() * 999) + 1;

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
    if (isGuestModeEnabled()) {
        return '';
    }

    return normalizePlayerName(
        globalThis.localStorage.getItem(playerNameStorageKey) ?? ''
    );
}

export function persistPlayerName(playerName: string): void {
    const normalizedName = normalizePlayerName(playerName);

    if (!normalizedName) {
        globalThis.localStorage.removeItem(playerNameStorageKey);
        return;
    }

    globalThis.localStorage.setItem(playerNameStorageKey, normalizedName);
}

export function getGuestDisplayName(): string {
    return `${uiText.guest}${guestSessionNumber}`;
}

export function getDisplayPlayerName(value: string | undefined): string {
    return normalizePlayerName(value ?? '') || getGuestDisplayName();
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
    return value.trim().replaceAll(/\s+/g, ' ').slice(0, 8);
}

export type BestScoreRecord = {
    score: number;
    maxCombo: number;
};

export function loadBestScore(): BestScoreRecord {
    const score = Number(
        globalThis.localStorage.getItem(bestScoreStorageKey) ?? '0'
    );
    const maxCombo = Number(
        globalThis.localStorage.getItem(bestMaxComboStorageKey) ?? '0'
    );

    return {
        score: Number.isFinite(score) ? score : 0,
        maxCombo: Number.isFinite(maxCombo) ? maxCombo : 0,
    };
}

export function saveBestScore(score: number, maxCombo: number): boolean {
    const current = loadBestScore();
    let updated = false;

    if (score > current.score) {
        globalThis.localStorage.setItem(bestScoreStorageKey, String(score));
        updated = true;
    }

    if (maxCombo > current.maxCombo) {
        globalThis.localStorage.setItem(
            bestMaxComboStorageKey,
            String(maxCombo)
        );
        updated = true;
    }

    return updated;
}

export function isTutorialComplete(): boolean {
    return globalThis.localStorage.getItem(tutorialCompleteStorageKey) === '1';
}

export function markTutorialComplete(): void {
    globalThis.localStorage.setItem(tutorialCompleteStorageKey, '1');
}

export function isGuestModeEnabled(): boolean {
    return globalThis.localStorage.getItem(guestModeStorageKey) === '1';
}

export function setGuestModeEnabled(enabled: boolean): void {
    if (enabled) {
        globalThis.localStorage.setItem(guestModeStorageKey, '1');
    } else {
        globalThis.localStorage.removeItem(guestModeStorageKey);
    }
}
