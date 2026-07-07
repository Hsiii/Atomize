import type { Prime } from '../core/primes';

export const desktopPrimeKeybinds = [
    '2',
    '3',
    '5',
    '7',
    '11',
    '13',
    '17',
    '19',
    'Shift+2',
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
