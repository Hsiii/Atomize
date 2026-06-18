import type { RoomSnapshot } from '../core/multiplayer';
import type { Prime } from '../core/primes';
import { processComboQueue } from './combo-queue';
import {
    applyBattlePenalty,
    applyBattlePrimeSelection,
} from './multiplayer-room';

type LocalBattleQueueOptions = {
    advanceQueue: () => void;
    clearQueue: () => void;
    getLocalPlayerId: () => string | undefined;
    getSnapshot: () => RoomSnapshot | undefined;
    updateSnapshot: (nextSnapshot: RoomSnapshot) => void;
};

export async function processLocalBattleQueue(
    queuedPrimes: readonly Prime[],
    {
        advanceQueue,
        clearQueue,
        getLocalPlayerId,
        getSnapshot,
        updateSnapshot,
    }: LocalBattleQueueOptions
): Promise<void> {
    await processComboQueue(queuedPrimes, {
        getPlayer() {
            const snapshot = getSnapshot();
            const localPlayerId = getLocalPlayerId();

            return snapshot?.players.find(
                (player) => player.id === localPlayerId
            );
        },
        clearQueue,
        advanceQueue,
        onWrongPrime(player) {
            const snapshot = getSnapshot();
            const localPlayerId = getLocalPlayerId();

            if (!snapshot || !localPlayerId) {
                return;
            }

            updateSnapshot(
                applyBattlePenalty(
                    snapshot,
                    localPlayerId,
                    player.stage,
                    player.pendingFactorDamage
                )
            );
        },
        onRedundantPrimes(_player, clearedStage, releasedDamage) {
            const snapshot = getSnapshot();
            const localPlayerId = getLocalPlayerId();

            if (!snapshot || !localPlayerId) {
                return;
            }

            updateSnapshot(
                applyBattlePenalty(
                    snapshot,
                    localPlayerId,
                    clearedStage,
                    releasedDamage
                )
            );
        },
        onCorrectPrime(
            prime,
            suppressAttack,
            perfectSolveEligible,
            resolvingQueueLength
        ) {
            const snapshot = getSnapshot();
            const localPlayerId = getLocalPlayerId();

            if (!snapshot || !localPlayerId) {
                return undefined;
            }

            updateSnapshot(
                applyBattlePrimeSelection(snapshot, localPlayerId, prime, {
                    suppressAttack,
                    perfectSolveEligible,
                    resolvingQueueLength,
                })
            );

            return undefined;
        },
    });
}
