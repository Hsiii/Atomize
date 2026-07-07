import { mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { format, resolveConfig } from 'prettier';

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
import {
    addPlayerToRoom,
    applyBattlePenalty,
    applyBattlePrimeSelection,
    beginRoomMatch,
    createRoomSnapshot,
    setPlayerReady,
} from '../../src/lib/multiplayer-room';

const rootDirectory = path.resolve(import.meta.dirname, '../..');
const outputPath = path.resolve(
    rootDirectory,
    'godot/tests/generated/core-fixtures.json'
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

type RoomStepFixture = {
    label: string;
    snapshot: ReturnType<typeof createRoomSnapshot>;
};

function createStageFixtures(): readonly StageFixture[] {
    return seeds.flatMap((seed) =>
        Array.from({ length: 16 }, (_, stageIndex) => ({
            seed,
            stageIndex,
            stage: assertValidStage(generateStage(seed, stageIndex)),
        }))
    );
}

function assertValidStage(stage: StageState): StageState {
    if (
        !Number.isSafeInteger(stage.targetValue) ||
        stage.targetValue < 1 ||
        stage.targetValue !==
            stage.factors.reduce((product, factor) => product * factor, 1) ||
        stage.remainingValue !== stage.targetValue ||
        stage.remainingFactors.length !== stage.factors.length
    ) {
        throw new Error(
            `Invalid generated stage ${stage.stageIndex}: ${JSON.stringify(stage)}`
        );
    }

    return stage;
}

function assertStageGenerationInvariants() {
    for (let seedIndex = 0; seedIndex < 32; seedIndex++) {
        const seed = `stage-invariant:${seedIndex}`;

        for (let stageIndex = 0; stageIndex < 128; stageIndex++) {
            assertValidStage(generateStage(seed, stageIndex));
        }
    }
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

function createRoomFixtures(): readonly RoomStepFixture[] {
    let snapshot = createRoomSnapshot('duel-room', 'host', 'Host');
    const steps: RoomStepFixture[] = [
        {
            label: 'created',
            snapshot,
        },
    ];

    const joinedSnapshot = addPlayerToRoom(snapshot, 'guest', 'Guest');

    if (joinedSnapshot === undefined) {
        throw new Error('Expected guest to join room fixture.');
    }

    snapshot = joinedSnapshot;
    steps.push({
        label: 'guest-joined',
        snapshot,
    });

    snapshot = setPlayerReady(snapshot, 'host', true);
    steps.push({
        label: 'host-ready',
        snapshot,
    });

    snapshot = setPlayerReady(snapshot, 'guest', true);
    steps.push({
        label: 'guest-ready',
        snapshot,
    });

    snapshot = beginRoomMatch(snapshot);
    steps.push({
        label: 'playing',
        snapshot,
    });

    const hostFactors = [...snapshot.players[0].stage.remainingFactors];

    for (const [index, prime] of hostFactors.entries()) {
        snapshot = applyBattlePrimeSelection(snapshot, 'host', prime, {
            perfectSolveEligible: true,
            resolvingQueueLength: hostFactors.length,
            suppressAttack: index < hostFactors.length - 1,
        });
        steps.push({
            label: `host-prime-${index + 1}`,
            snapshot,
        });
    }

    snapshot = applyBattlePenalty(snapshot, 'guest');
    steps.push({
        label: 'guest-penalty',
        snapshot,
    });

    return steps;
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

assertStageGenerationInvariants();

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
    roomSteps: createRoomFixtures(),
};

mkdirSync(path.dirname(outputPath), { recursive: true });
const prettierOptions = (await resolveConfig(outputPath)) ?? {};
const formattedFixture = await format(JSON.stringify(fixture), {
    ...prettierOptions,
    parser: 'json',
});

writeFileSync(outputPath, formattedFixture);

console.log(`Wrote ${outputPath}`);
