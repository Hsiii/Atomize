/* eslint-disable no-bitwise, complete/no-unnecessary-assignment, unicorn/numeric-separators-style, unicorn/prefer-math-trunc */

export function hashSeed(seed: string): number {
    let hash = 2_166_136_261;

    for (let index = 0; index < seed.length; index++) {
        hash ^= seed.codePointAt(index) ?? 0;
        hash = Math.imul(hash, 16_777_619);
    }

    return hash >>> 0;
}

export function createRng(seed: string): () => number {
    let state = hashSeed(seed) || 1;

    return () => {
        state = (state + 0x6d2b79f5) | 0;
        let output = Math.imul(state ^ (state >>> 15), 1 | state);
        output ^= output + Math.imul(output ^ (output >>> 7), 61 | output);
        return ((output ^ (output >>> 14)) >>> 0) / 4_294_967_296;
    };
}

export function randomInt(rng: () => number, min: number, max: number): number {
    return Math.floor(rng() * (max - min + 1)) + min;
}
