import { PRIME_POOL } from './primes';
import type { Prime } from './primes';
import { createRng, randomInt } from './random';

export type StageState = {
    stageIndex: number;
    targetValue: number;
    remainingValue: number;
    factors: Prime[];
    remainingFactors: Prime[];
};

export type SoloState = {
    hp: number;
    combo: number;
    maxCombo: number;
    score: number;
    clearedStages: number;
    currentStage: StageState;
};

type SelectionResult =
    | {
          kind: 'correct';
          stage: StageState;
          cleared: boolean;
      }
    | {
          kind: 'wrong';
          stage: StageState;
          selectedPrime: Prime;
      };

const MAX_FACTOR_COUNT = 7;
const MAX_PLAYABLE_PRIME_COUNT = 9;
const MIN_FACTOR_COUNT = 2;
const MAX_STAGE_VALUE = 1_000_000;
const MIN_PRIME = PRIME_POOL[0];
const SOLO_MAX_HP = 500;
const FEATURED_PRIME: Prime = 23;
const FEATURED_PRIME_UNLOCK_STAGE = 2;
const FEATURED_PRIME_STAGE_CHANCE = 0.28;

export function applySoloPenalty(state: SoloState): SoloState {
    return {
        ...state,
        hp: Math.max(0, state.hp - 1),
        combo: 0,
    };
}

function getAvailableStagePrimes(
    primeCeiling: number,
    maxPrimeValue: number,
    factors: readonly Prime[]
): readonly Prime[] {
    return PRIME_POOL.slice(0, primeCeiling).filter(
        (prime) =>
            prime <= maxPrimeValue &&
            !(prime === FEATURED_PRIME && factors.includes(FEATURED_PRIME))
    );
}

function pickStagePrime(
    availablePrimes: readonly Prime[],
    rng: () => number,
    factors: readonly Prime[]
): Prime {
    const hasFeaturedPrime = factors.includes(FEATURED_PRIME);
    const weightedPrimes: Prime[] = [];

    for (const prime of availablePrimes) {
        let weight = 1;

        if (hasFeaturedPrime) {
            if (prime <= 7) {
                weight = 4;
            } else if (prime <= 13) {
                weight = 2;
            }
        }

        for (let count = 0; count < weight; count++) {
            weightedPrimes.push(prime);
        }
    }

    return weightedPrimes[randomInt(rng, 0, weightedPrimes.length - 1)];
}

export function generateStage(seed: string, stageIndex: number): StageState {
    const rng = createRng(`${seed}:${stageIndex}`);
    const factorCount = Math.min(
        MAX_FACTOR_COUNT,
        MIN_FACTOR_COUNT + Math.floor(stageIndex / 2) + randomInt(rng, 0, 1)
    );
    const primeCeiling = Math.min(
        PRIME_POOL.length,
        MAX_PLAYABLE_PRIME_COUNT,
        4 + Math.floor(stageIndex / 2)
    );
    const factors: Prime[] = [];
    const shouldFeaturePrime =
        stageIndex >= FEATURED_PRIME_UNLOCK_STAGE &&
        rng() < FEATURED_PRIME_STAGE_CHANCE;
    let targetValue = 1;

    for (let count = 0; count < factorCount; count++) {
        if (shouldFeaturePrime && count === 0) {
            factors.push(FEATURED_PRIME);
            targetValue *= FEATURED_PRIME;
            continue;
        }

        const remainingSlots = factorCount - count - 1;
        const reservedValue = MIN_PRIME ** remainingSlots;
        const maxPrimeValue = Math.floor(
            MAX_STAGE_VALUE / (targetValue * reservedValue)
        );
        const availablePrimes = getAvailableStagePrimes(
            primeCeiling,
            maxPrimeValue,
            factors
        );
        const selectedPrime = pickStagePrime(availablePrimes, rng, factors);

        factors.push(selectedPrime);
        targetValue *= selectedPrime;
    }

    factors.sort((left, right) => left - right);

    return {
        stageIndex,
        targetValue,
        remainingValue: targetValue,
        factors,
        remainingFactors: [...factors],
    };
}

export function applyPrimeSelection(
    stage: StageState,
    selectedPrime: Prime
): SelectionResult {
    const factorIndex = stage.remainingFactors.indexOf(selectedPrime);

    if (factorIndex === -1) {
        return {
            kind: 'wrong',
            stage,
            selectedPrime,
        };
    }

    const remainingFactors = [...stage.remainingFactors];
    remainingFactors.splice(factorIndex, 1);

    const nextStage: StageState = {
        ...stage,
        remainingFactors,
        remainingValue: stage.remainingValue / selectedPrime,
    };

    return {
        kind: 'correct',
        stage: nextStage,
        cleared: remainingFactors.length === 0,
    };
}

export function createInitialSoloState(seed: string): SoloState {
    return {
        hp: SOLO_MAX_HP,
        combo: 0,
        maxCombo: 0,
        score: 0,
        clearedStages: 0,
        currentStage: generateStage(seed, 0),
    };
}

export function advanceSoloState(
    state: SoloState,
    seed: string,
    selectedPrime: Prime
): SoloState {
    const outcome = applyPrimeSelection(state.currentStage, selectedPrime);

    if (outcome.kind === 'wrong') {
        return applySoloPenalty(state);
    }

    if (!outcome.cleared) {
        return {
            ...state,
            currentStage: outcome.stage,
            score: state.score + 10,
        };
    }

    const nextStageIndex = state.clearedStages + 1;
    const nextCombo = state.combo + 1;
    const comboBonus = nextCombo * 15;

    return {
        hp: Math.min(
            SOLO_MAX_HP,
            state.hp + (nextStageIndex % 5 === 0 ? 1 : 0)
        ),
        combo: nextCombo,
        maxCombo: Math.max(state.maxCombo, nextCombo),
        score: state.score + 50 + comboBonus,
        clearedStages: nextStageIndex,
        currentStage: generateStage(seed, nextStageIndex),
    };
}

export function computeBattleFactorDamage(selectedPrime: Prime): number {
    return selectedPrime;
}

export function computeBattleComboDamage(combo: number): number {
    return Math.max(0, combo - 1) * 8;
}
