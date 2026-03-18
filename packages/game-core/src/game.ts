import { PRIME_POOL, type Prime } from "./primes";
import { createRng, randomInt } from "./random";

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
  score: number;
  clearedStages: number;
  currentStage: StageState;
};

export type SelectionResult =
  | {
      kind: "correct";
      stage: StageState;
      cleared: boolean;
    }
  | {
      kind: "wrong";
      stage: StageState;
      selectedPrime: Prime;
    };

const MAX_FACTOR_COUNT = 7;
const MAX_PLAYABLE_PRIME_COUNT = 9;

export function generateStage(seed: string, stageIndex: number): StageState {
  const rng = createRng(`${seed}:${stageIndex}`);
  const factorCount = Math.min(MAX_FACTOR_COUNT, 2 + Math.floor(stageIndex / 2) + randomInt(rng, 0, 1));
  const primeCeiling = Math.min(PRIME_POOL.length, MAX_PLAYABLE_PRIME_COUNT, 4 + Math.floor(stageIndex / 2));
  const factors: Prime[] = [];

  for (let count = 0; count < factorCount; count += 1) {
    const primeIndex = randomInt(rng, 0, primeCeiling - 1);
    factors.push(PRIME_POOL[primeIndex]);
  }

  factors.sort((left, right) => left - right);

  const targetValue = factors.reduce((product, factor) => product * factor, 1);

  return {
    stageIndex,
    targetValue,
    remainingValue: targetValue,
    factors,
    remainingFactors: [...factors],
  };
}

export function applyPrimeSelection(stage: StageState, selectedPrime: Prime): SelectionResult {
  const factorIndex = stage.remainingFactors.indexOf(selectedPrime);

  if (factorIndex === -1) {
    return {
      kind: "wrong",
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
    kind: "correct",
    stage: nextStage,
    cleared: remainingFactors.length === 0,
  };
}

export function createInitialSoloState(seed: string): SoloState {
  return {
    hp: 5,
    combo: 0,
    score: 0,
    clearedStages: 0,
    currentStage: generateStage(seed, 0),
  };
}

export function advanceSoloState(state: SoloState, seed: string, selectedPrime: Prime): SoloState {
  const outcome = applyPrimeSelection(state.currentStage, selectedPrime);

  if (outcome.kind === "wrong") {
    return {
      ...state,
      hp: Math.max(0, state.hp - 1),
      combo: 0,
    };
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
    hp: Math.min(5, state.hp + (nextStageIndex % 5 === 0 ? 1 : 0)),
    combo: nextCombo,
    score: state.score + 50 + comboBonus,
    clearedStages: nextStageIndex,
    currentStage: generateStage(seed, nextStageIndex),
  };
}

export function computeBattleDamage(clearedStage: StageState, combo: number): number {
  return 8 + clearedStage.factors.length * 3 + combo * 2;
}
