import { useEffect, useRef, useState } from 'react';

import type { Screen } from '../app-state';
import { uiText } from '../app-state';
import { applyPrimeSelection, computeBattleFactorDamage } from '../core';
import type { Prime, RoomPlayer, RoomSnapshot } from '../core';
import { getDisplayPlayerName, playablePrimes, wait } from '../lib/app-helpers';
import {
    addPlayerToRoom,
    applyBattlePenalty,
    applyBattlePrimeSelection,
    clearSolvedBattleStage,
    createRoomSnapshot,
} from '../lib/multiplayer-room';

const cpuPlayerId = 'local-cpu';
const multiplayerComboStepDelayMs = 220;
const cpuMistakeChance = 0.14;

type UseLocalCpuGameOptions = {
    playerName: string;
    screen: Screen;
    onScreenChange: (screen: Screen) => void;
};

type UseLocalCpuGameResult = {
    playablePrimes: typeof playablePrimes;
    multiplayerSnapshot: RoomSnapshot | undefined;
    multiplayerPrimeQueue: Prime[];
    isMultiplayerComboRunning: boolean;
    isMultiplayerInputDisabled: boolean;
    currentMultiplayerPlayer: RoomPlayer | undefined;
    isLocalCpuGameActive: boolean;
    startLocalCpuGame: () => void;
    handleMultiplayerComboSubmit: (queue: readonly Prime[]) => Promise<void>;
    resetLocalCpuGame: () => void;
};

export function useLocalCpuGame({
    playerName,
    screen,
    onScreenChange,
}: UseLocalCpuGameOptions): UseLocalCpuGameResult {
    const [playerId, setPlayerId] = useState<string | undefined>(undefined);
    const [multiplayerSnapshot, setMultiplayerSnapshot] = useState<
        RoomSnapshot | undefined
    >(undefined);
    const [multiplayerPrimeQueue, setMultiplayerPrimeQueue] = useState<Prime[]>(
        []
    );
    const [isMultiplayerComboRunning, setIsMultiplayerComboRunning] =
        useState(false);
    const latestSnapshotRef = useRef<RoomSnapshot | undefined>(undefined);
    const latestPlayerIdRef = useRef<string | undefined>(undefined);
    const cpuTurnTimeoutRef = useRef<number | undefined>(undefined);

    const currentMultiplayerPlayer = multiplayerSnapshot?.players.find(
        (player) => player.id === playerId
    );
    const isLocalCpuGameActive =
        Boolean(playerId) &&
        multiplayerSnapshot?.players.some(
            (player) => player.id === cpuPlayerId
        ) === true;
    const isMultiplayerInputDisabled =
        !multiplayerSnapshot ||
        multiplayerSnapshot.status !== 'playing' ||
        isMultiplayerComboRunning;

    useEffect(() => {
        latestSnapshotRef.current = multiplayerSnapshot;
    }, [multiplayerSnapshot]);

    useEffect(() => {
        latestPlayerIdRef.current = playerId;
    }, [playerId]);

    useEffect(
        () => () => {
            clearCpuTurnTimeout();
        },
        []
    );

    useEffect(() => {
        clearCpuTurnTimeout();

        if (
            screen !== 'multi-game' ||
            !isLocalCpuGameActive ||
            isMultiplayerComboRunning
        ) {
            return undefined;
        }

        const snapshot = latestSnapshotRef.current;
        const localPlayer = snapshot?.players.find(
            (player) => player.id === latestPlayerIdRef.current
        );
        const cpuPlayer = snapshot?.players.find(
            (player) => player.id === cpuPlayerId
        );

        if (
            !snapshot ||
            snapshot.status !== 'playing' ||
            !localPlayer ||
            !cpuPlayer ||
            localPlayer.hp === 0 ||
            cpuPlayer.hp === 0
        ) {
            return undefined;
        }

        cpuTurnTimeoutRef.current = globalThis.setTimeout(
            () => {
                cpuTurnTimeoutRef.current = undefined;
                performCpuTurn();
            },
            getCpuThinkDelay(cpuPlayer),
            undefined
        );

        return () => {
            clearCpuTurnTimeout();
        };
    }, [
        isLocalCpuGameActive,
        isMultiplayerComboRunning,
        multiplayerSnapshot?.lastEvent?.id,
        multiplayerSnapshot?.status,
        screen,
    ]);

    function startLocalCpuGame() {
        const localPlayerId = crypto.randomUUID();
        const roomId = `cpu:${crypto.randomUUID()}`;
        const displayPlayerName = getDisplayPlayerName(playerName);
        const initialSnapshot = createRoomSnapshot(
            roomId,
            localPlayerId,
            displayPlayerName
        );
        const twoPlayerSnapshot = addPlayerToRoom(
            initialSnapshot,
            cpuPlayerId,
            uiText.cpu
        );

        if (!twoPlayerSnapshot) {
            return;
        }

        const playingSnapshot: RoomSnapshot = {
            ...twoPlayerSnapshot,
            countdownEndsAt: undefined,
            status: 'playing',
            players: twoPlayerSnapshot.players.map((player) => ({
                ...player,
                ready: true,
            })),
        };

        latestPlayerIdRef.current = localPlayerId;
        setPlayerId(localPlayerId);
        updateSnapshot(playingSnapshot);
        setMultiplayerPrimeQueue([]);
        setIsMultiplayerComboRunning(false);
        onScreenChange('multi-game');
    }

    async function handleMultiplayerComboSubmit(queue: readonly Prime[]) {
        const snapshot = latestSnapshotRef.current;
        const localPlayer = snapshot?.players.find(
            (player) => player.id === latestPlayerIdRef.current
        );

        if (!snapshot || !localPlayer || isMultiplayerInputDisabled) {
            return;
        }

        if (queue.length === 0) {
            if (localPlayer.stage.remainingValue !== 1) {
                return;
            }

            setIsMultiplayerComboRunning(true);

            try {
                updateSnapshot(
                    clearSolvedBattleStage(snapshot, localPlayer.id)
                );
            } finally {
                setIsMultiplayerComboRunning(false);
            }

            return;
        }

        setIsMultiplayerComboRunning(true);
        setMultiplayerPrimeQueue([...queue]);

        try {
            await processMultiplayerQueue(queue);
        } finally {
            setIsMultiplayerComboRunning(false);
        }
    }

    function resetLocalCpuGame() {
        clearCpuTurnTimeout();
        latestPlayerIdRef.current = undefined;
        latestSnapshotRef.current = undefined;
        setPlayerId(undefined);
        setMultiplayerSnapshot(undefined);
        setMultiplayerPrimeQueue([]);
        setIsMultiplayerComboRunning(false);
    }

    return {
        playablePrimes,
        multiplayerSnapshot,
        multiplayerPrimeQueue,
        isMultiplayerComboRunning,
        isMultiplayerInputDisabled,
        currentMultiplayerPlayer,
        isLocalCpuGameActive,
        startLocalCpuGame,
        handleMultiplayerComboSubmit,
        resetLocalCpuGame,
    };

    function updateSnapshot(nextSnapshot: RoomSnapshot | undefined) {
        latestSnapshotRef.current = nextSnapshot;
        setMultiplayerSnapshot(nextSnapshot);
    }

    function clearCpuTurnTimeout() {
        if (cpuTurnTimeoutRef.current !== undefined) {
            globalThis.clearTimeout(cpuTurnTimeoutRef.current);
            cpuTurnTimeoutRef.current = undefined;
        }
    }

    async function processMultiplayerQueue(
        queuedPrimes: readonly Prime[],
        index = 0,
        shouldBatchComboDamage?: boolean,
        perfectSolveEligible?: boolean
    ) {
        if (index >= queuedPrimes.length) {
            return;
        }

        const snapshot = latestSnapshotRef.current;
        const localPlayerId = latestPlayerIdRef.current;
        const localPlayer = snapshot?.players.find(
            (player) => player.id === localPlayerId
        );

        if (!snapshot || !localPlayerId || !localPlayer) {
            return;
        }

        const prime = queuedPrimes[index];
        const batchComboDamage =
            shouldBatchComboDamage ?? queuedPrimes.length > 1;
        const comboPerfectSolveEligible =
            perfectSolveEligible ??
            localPlayer.stage.remainingValue === localPlayer.stage.targetValue;
        const outcome = applyPrimeSelection(localPlayer.stage, prime);

        if (outcome.kind === 'wrong') {
            setMultiplayerPrimeQueue([]);
            updateSnapshot(
                applyBattlePenalty(
                    snapshot,
                    localPlayerId,
                    localPlayer.stage,
                    localPlayer.pendingFactorDamage
                )
            );
            return;
        }

        if (outcome.cleared && index < queuedPrimes.length - 1) {
            setMultiplayerPrimeQueue([]);
            updateSnapshot(
                applyBattlePenalty(
                    snapshot,
                    localPlayerId,
                    outcome.stage,
                    localPlayer.pendingFactorDamage +
                        computeBattleFactorDamage(prime)
                )
            );
            return;
        }

        setMultiplayerPrimeQueue((currentQueue: readonly Prime[]) =>
            currentQueue.slice(1)
        );

        const isFinalQueuedPrime = index >= queuedPrimes.length - 1;

        updateSnapshot(
            applyBattlePrimeSelection(snapshot, localPlayerId, prime, {
                suppressAttack:
                    batchComboDamage && !outcome.cleared && !isFinalQueuedPrime,
                perfectSolveEligible: comboPerfectSolveEligible,
            })
        );

        if (isFinalQueuedPrime) {
            return;
        }

        await wait(multiplayerComboStepDelayMs);
        await processMultiplayerQueue(
            queuedPrimes,
            index + 1,
            batchComboDamage,
            comboPerfectSolveEligible
        );
    }

    function performCpuTurn() {
        const snapshot = latestSnapshotRef.current;
        const cpuPlayer = snapshot?.players.find(
            (player) => player.id === cpuPlayerId
        );
        const localPlayer = snapshot?.players.find(
            (player) => player.id === latestPlayerIdRef.current
        );

        if (
            !snapshot ||
            snapshot.status !== 'playing' ||
            !cpuPlayer ||
            !localPlayer ||
            cpuPlayer.hp === 0 ||
            localPlayer.hp === 0
        ) {
            return;
        }

        if (cpuPlayer.stage.remainingValue === 1) {
            updateSnapshot(clearSolvedBattleStage(snapshot, cpuPlayerId));
            return;
        }

        const selectedPrime = pickCpuPrime(cpuPlayer);
        const outcome = applyPrimeSelection(cpuPlayer.stage, selectedPrime);

        if (outcome.kind === 'wrong') {
            updateSnapshot(
                applyBattlePenalty(
                    snapshot,
                    cpuPlayerId,
                    cpuPlayer.stage,
                    cpuPlayer.pendingFactorDamage
                )
            );
            return;
        }

        updateSnapshot(
            applyBattlePrimeSelection(snapshot, cpuPlayerId, selectedPrime, {
                perfectSolveEligible:
                    cpuPlayer.stage.remainingValue ===
                    cpuPlayer.stage.targetValue,
            })
        );
    }

    function pickCpuPrime(cpuPlayer: RoomPlayer): Prime {
        const wrongPrimes = playablePrimes.filter(
            (prime) => !cpuPlayer.stage.remainingFactors.includes(prime)
        );
        const shouldMiss =
            wrongPrimes.length > 0 && Math.random() < cpuMistakeChance;

        if (shouldMiss) {
            return wrongPrimes[Math.floor(Math.random() * wrongPrimes.length)];
        }

        return cpuPlayer.stage.remainingFactors[
            Math.floor(Math.random() * cpuPlayer.stage.remainingFactors.length)
        ];
    }
}

function getCpuThinkDelay(cpuPlayer: RoomPlayer): number {
    const remainingFactorCount = cpuPlayer.stage.remainingFactors.length;
    const pendingDamageWeight = Math.min(cpuPlayer.pendingFactorDamage, 12);

    return 420 + remainingFactorCount * 140 - pendingDamageWeight * 12;
}
