import { mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';

import {
    advanceSoloState,
    applyPrimeSelection,
    computeBattleComboDamage,
    computeBattleFactorDamage,
    createInitialSoloState,
    generateStage,
} from '../../src/core/game';
import type { SoloState, StageState } from '../../src/core/game';
import { PRIME_POOL } from '../../src/core/primes';
import type { Prime } from '../../src/core/primes';
import { createRng, hashSeed, randomInt } from '../../src/core/random';
import {
    BLOB_REVEAL_TOTAL_MS,
    DAMAGE_POP_LIFETIME_MS,
    HP_IMPACT_TAIL_MS,
    HP_LOSS_BASE_DURATION_MS,
    HP_LOSS_PER_POINT_DURATION_MS,
    HP_REGEN_BASE_DURATION_MS,
    HP_REGEN_PER_POINT_DURATION_MS,
    HP_ZERO_HOLD_MS,
    KEYBOARD_DIGIT_BUFFER_WINDOW_MS,
    MULTIPLAYER_COMBO_STEP_DELAY_MS,
    PERFECT_BURST_DURATION_MS,
    SELF_FAULT_DURATION_MS,
    SOLO_COMBO_STEP_DELAY_MS,
} from '../../src/core/timing';

const rootDirectory = path.resolve(import.meta.dirname, '../..');
const outputPath = path.resolve(
    rootDirectory,
    'godot/tests/fixtures/core-fixtures.json'
);

const seeds = [
    'atomize',
    'room-42',
    'tutorial:left',
    'large-repeat',
    '2026-06-20',
] as const;

const randomIntRanges = [
    [0, 1],
    [1, 5],
    [3, 17],
    [0, 31],
    [11, 53],
] as const;

type SoloStepFixture = {
    before: SoloState;
    after: SoloState;
    prime: Prime;
    options?: {
        resolvingQueueLength: number;
    };
};

type StageFixture = {
    seed: string;
    stageIndex: number;
    stage: StageState;
};

type HashFixture = {
    seed: string;
    hash: number;
};

type RngFixture = {
    seed: string;
    values: readonly number[];
};

type RandomIntFixture = {
    seed: string;
    ranges: ReadonlyArray<{
        min: number;
        max: number;
        value: number;
    }>;
};

type SelectionFixture = {
    seed: string;
    stageIndex: number;
    prime: Prime;
    result: ReturnType<typeof applyPrimeSelection>;
};

type SoloRunFixture = {
    seed: string;
    initialState: SoloState;
    steps: readonly SoloStepFixture[];
    finalState: SoloState;
};

function createStageFixtures(): readonly StageFixture[] {
    return seeds.flatMap((seed) =>
        Array.from({ length: 16 }, (_, stageIndex) => ({
            seed,
            stageIndex,
            stage: generateStage(seed, stageIndex),
        }))
    );
}

function createHashFixtures(): readonly HashFixture[] {
    return seeds.map((seed) => ({
        seed,
        hash: hashSeed(seed),
    }));
}

function createRngFixtures(): readonly RngFixture[] {
    return seeds.map((seed) => {
        const rng = createRng(seed);

        return {
            seed,
            values: Array.from({ length: 12 }, () => rng()),
        };
    });
}

function createRandomIntFixtures(): readonly RandomIntFixture[] {
    return seeds.map((seed) => {
        const rng = createRng(seed);

        return {
            seed,
            ranges: randomIntRanges.map(([min, max]) => ({
                min,
                max,
                value: randomInt(rng, min, max),
            })),
        };
    });
}

function createSelectionFixtures(): readonly SelectionFixture[] {
    return seeds.flatMap((seed) => {
        const stage = generateStage(seed, 5);
        const correctPrime = stage.remainingFactors[0];
        const wrongPrime = pickWrongPrime(stage);

        return [
            {
                seed,
                stageIndex: stage.stageIndex,
                prime: correctPrime,
                result: applyPrimeSelection(stage, correctPrime),
            },
            {
                seed,
                stageIndex: stage.stageIndex,
                prime: wrongPrime,
                result: applyPrimeSelection(stage, wrongPrime),
            },
        ];
    });
}

function createSoloFixtures(): readonly SoloRunFixture[] {
    return seeds.slice(0, 3).map((seed) => {
        let state = createInitialSoloState(seed);
        const initialState = state;
        const steps: SoloStepFixture[] = [];

        for (let stepIndex = 0; stepIndex < 18; stepIndex++) {
            const before = state;
            const prime =
                stepIndex % 7 === 3
                    ? pickWrongPrime(state.currentStage)
                    : state.currentStage.remainingFactors[0];
            const options =
                stepIndex % 5 === 4
                    ? {
                          resolvingQueueLength: 3,
                      }
                    : undefined;

            state = advanceSoloState(state, seed, prime, options);
            steps.push({
                before,
                after: state,
                prime,
                ...(options === undefined ? {} : { options }),
            });
        }

        return {
            seed,
            initialState,
            steps,
            finalState: state,
        };
    });
}

function pickWrongPrime(stage: StageState): Prime {
    const wrongPrime = PRIME_POOL.find(
        (prime) => !stage.remainingFactors.includes(prime)
    );

    if (wrongPrime === undefined) {
        throw new Error('Could not find a wrong prime for fixture stage.');
    }

    return wrongPrime;
}

const fixture = {
    generatedBy: 'scripts/godot/generate-core-fixtures.ts',
    primePool: PRIME_POOL,
    timing: {
        blobRevealTotalMs: BLOB_REVEAL_TOTAL_MS,
        damagePopLifetimeMs: DAMAGE_POP_LIFETIME_MS,
        hpImpactTailMs: HP_IMPACT_TAIL_MS,
        hpLossBaseDurationMs: HP_LOSS_BASE_DURATION_MS,
        hpLossPerPointDurationMs: HP_LOSS_PER_POINT_DURATION_MS,
        hpRegenBaseDurationMs: HP_REGEN_BASE_DURATION_MS,
        hpRegenPerPointDurationMs: HP_REGEN_PER_POINT_DURATION_MS,
        hpZeroHoldMs: HP_ZERO_HOLD_MS,
        keyboardDigitBufferWindowMs: KEYBOARD_DIGIT_BUFFER_WINDOW_MS,
        multiplayerComboStepDelayMs: MULTIPLAYER_COMBO_STEP_DELAY_MS,
        perfectBurstDurationMs: PERFECT_BURST_DURATION_MS,
        selfFaultDurationMs: SELF_FAULT_DURATION_MS,
        soloComboStepDelayMs: SOLO_COMBO_STEP_DELAY_MS,
    },
    damage: PRIME_POOL.map((prime) => ({
        prime,
        factorDamage: computeBattleFactorDamage(prime),
    })),
    comboDamage: Array.from({ length: 10 }, (_, combo) => ({
        combo,
        damage: computeBattleComboDamage(combo),
    })),
    hashes: createHashFixtures(),
    rng: createRngFixtures(),
    randomInts: createRandomIntFixtures(),
    stages: createStageFixtures(),
    selections: createSelectionFixtures(),
    soloRuns: createSoloFixtures(),
};

mkdirSync(path.dirname(outputPath), { recursive: true });
writeFileSync(outputPath, `${JSON.stringify(fixture, undefined, 2)}\n`);

console.log(`Wrote ${outputPath}`);
