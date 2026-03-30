import type { Prime } from '../core';

export const desktopPrimeKeybinds = [
    'r',
    't',
    'y',
    'f',
    'g',
    'h',
    'v',
    'b',
    'n',
] as const;

export const desktopActionKeybinds = {
    backspace: 'u',
    submit: 'j',
} as const;

export function getDesktopPrimeKeybind(
    primes: readonly Prime[],
    prime: Prime
): string | undefined {
    const index = primes.indexOf(prime);

    if (index === -1 || index >= desktopPrimeKeybinds.length) {
        return undefined;
    }

    return desktopPrimeKeybinds[index];
}

export function getDesktopPrimeFromKey(
    primes: readonly Prime[],
    key: string
): Prime | undefined {
    const index = desktopPrimeKeybinds.indexOf(
        key as (typeof desktopPrimeKeybinds)[number]
    );

    if (index === -1 || index >= primes.length) {
        return undefined;
    }

    return primes[index];
}
