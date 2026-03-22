import { applyPrimeSelection, computeBattleFactorDamage } from '../core';
import type { Prime, StageState } from '../core';
import { MULTIPLAYER_COMBO_STEP_DELAY_MS } from '../core/timing';
import { wait } from './app-helpers';

export type ComboQueuePlayer = {
    stage: StageState;
    pendingFactorDamage: number;
};

export type ComboQueueCallbacks = {
    getPlayer: () => ComboQueuePlayer | undefined;
    clearQueue: () => void;
    advanceQueue: () => void;
    onWrongPrime: (player: ComboQueuePlayer) => Promise<void> | void;
    onRedundantPrimes: (
        player: ComboQueuePlayer,
        clearedStage: StageState,
        releasedDamage: number
    ) => Promise<void> | void;
    onCorrectPrime: (
        prime: Prime,
        suppressAttack: boolean,
        perfectSolveEligible: boolean,
        resolvingQueueLength?: number
    ) =>
        | Promise<{ shouldAbort?: boolean } | undefined>
        | { shouldAbort?: boolean }
        | undefined;
};

export async function processComboQueue(
    queuedPrimes: readonly Prime[],
    callbacks: ComboQueueCallbacks,
    index = 0,
    shouldBatchComboDamage?: boolean,
    perfectSolveEligible?: boolean
): Promise<void> {
    if (index >= queuedPrimes.length) {
        return;
    }

    const player = callbacks.getPlayer();

    if (!player) {
        return;
    }

    const prime = queuedPrimes[index];
    const batchComboDamage = shouldBatchComboDamage ?? queuedPrimes.length > 1;
    const comboPerfectSolveEligible =
        perfectSolveEligible ??
        player.stage.remainingValue === player.stage.targetValue;

    const outcome = applyPrimeSelection(player.stage, prime);

    if (outcome.kind === 'wrong') {
        callbacks.clearQueue();
        await callbacks.onWrongPrime(player);
        return;
    }

    if (outcome.cleared && index < queuedPrimes.length - 1) {
        callbacks.clearQueue();
        const releasedDamage =
            player.pendingFactorDamage + computeBattleFactorDamage(prime);
        await callbacks.onRedundantPrimes(
            player,
            outcome.stage,
            releasedDamage
        );
        return;
    }

    callbacks.advanceQueue();

    const isFinalQueuedPrime = index >= queuedPrimes.length - 1;
    const result = await callbacks.onCorrectPrime(
        prime,
        batchComboDamage && !outcome.cleared && !isFinalQueuedPrime,
        comboPerfectSolveEligible,
        outcome.cleared ? queuedPrimes.length : undefined
    );

    if (result?.shouldAbort) {
        callbacks.clearQueue();
        return;
    }

    if (isFinalQueuedPrime) {
        return;
    }

    await wait(MULTIPLAYER_COMBO_STEP_DELAY_MS);
    await processComboQueue(
        queuedPrimes,
        callbacks,
        index + 1,
        batchComboDamage,
        comboPerfectSolveEligible
    );
}
