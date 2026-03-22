import { useEffect, useRef, useState } from 'react';

import type { Screen } from '../app-state';
import { uiText } from '../app-state';
import { applyPrimeSelection, generateStage } from '../core';
import type { Prime, RoomPlayer, RoomSnapshot, StageState } from '../core';
import { BLOB_REVEAL_TOTAL_MS } from '../core/timing';
import { getDisplayPlayerName, playablePrimes } from '../lib/app-helpers';
import { processComboQueue } from '../lib/combo-queue';
import {
    applyBattlePenalty,
    applyBattlePrimeSelection,
    clearSolvedBattleStage,
} from '../lib/multiplayer-room';
import { getTutorialScriptedFactors } from '../lib/tutorial-config';
import { useComboQueueState } from './useComboQueueState';

const tutorialCpuPlayerId = 'tutorial-cpu';
const tutorialCpuHp = 60;
const tutorialCpuThinkBaseMs = 1400;

type UseTutorialGameOptions = {
    playerName: string;
    screen: Screen;
    onScreenChange: (screen: Screen) => void;
};

type UseTutorialGameResult = {
    playablePrimes: typeof playablePrimes;
    multiplayerSnapshot: RoomSnapshot | undefined;
    multiplayerPrimeQueue: Prime[];
    isMultiplayerComboRunning: boolean;
    isMultiplayerInputDisabled: boolean;
    currentMultiplayerPlayer: RoomPlayer | undefined;
    isTutorialActive: boolean;
    handleMultiplayerComboSubmit: (queue: readonly Prime[]) => Promise<void>;
    startTutorialGame: () => void;
    resetTutorialGame: () => void;
    allowCpuAttack: () => void;
    notifyTutorialDone: () => void;
};

export function useTutorialGame({
    playerName,
    screen,
    onScreenChange,
}: UseTutorialGameOptions): UseTutorialGameResult {
    const [playerId, setPlayerId] = useState<string | undefined>(undefined);
    const [multiplayerSnapshot, setMultiplayerSnapshot] = useState<
        RoomSnapshot | undefined
    >(undefined);
    const comboQueue = useComboQueueState();
    const latestSnapshotRef = useRef<RoomSnapshot | undefined>(undefined);
    const latestPlayerIdRef = useRef<string | undefined>(undefined);
    const cpuTurnTimeoutRef = useRef<number | undefined>(undefined);
    const cpuRevealTimeoutRef = useRef<number | undefined>(undefined);
    const previousCpuStageIndexRef = useRef<number | undefined>(undefined);
    const isCpuBlobRevealActiveRef = useRef(false);
    const hasCpuShownPenaltyRef = useRef(false);
    const tutorialDoneRef = useRef(false);
    const cpuAttackAllowedRef = useRef(false);
    const [cpuAttackGate, setCpuAttackGate] = useState(0);
    const [isCpuBlobRevealActive, setIsCpuBlobRevealActive] = useState(false);

    const currentMultiplayerPlayer = multiplayerSnapshot?.players.find(
        (player) => player.id === playerId
    );
    const cpuPlayer = multiplayerSnapshot?.players.find(
        (player) => player.id === tutorialCpuPlayerId
    );
    const isTutorialActive =
        Boolean(playerId) &&
        multiplayerSnapshot?.players.some(
            (player) => player.id === tutorialCpuPlayerId
        ) === true;
    const isMultiplayerInputDisabled =
        !multiplayerSnapshot ||
        multiplayerSnapshot.status !== 'playing' ||
        comboQueue.isComboRunning;

    useEffect(() => {
        latestSnapshotRef.current = multiplayerSnapshot;
    }, [multiplayerSnapshot]);

    useEffect(() => {
        latestPlayerIdRef.current = playerId;
    }, [playerId]);

    useEffect(() => {
        isCpuBlobRevealActiveRef.current = isCpuBlobRevealActive;
    }, [isCpuBlobRevealActive]);

    useEffect(
        () => () => {
            clearCpuTurnTimeout();
            clearCpuRevealTimeout();
        },
        []
    );

    useEffect(() => {
        const cpuStageIndex = cpuPlayer?.stageIndex;

        if (
            screen !== 'tutorial' ||
            !isTutorialActive ||
            cpuStageIndex === undefined
        ) {
            previousCpuStageIndexRef.current = undefined;
            clearCpuRevealTimeout();
            setIsCpuBlobRevealActive(false);
            return undefined;
        }

        if (previousCpuStageIndexRef.current === cpuStageIndex) {
            return undefined;
        }

        previousCpuStageIndexRef.current = cpuStageIndex;
        clearCpuRevealTimeout();
        setIsCpuBlobRevealActive(true);
        cpuRevealTimeoutRef.current = globalThis.setTimeout(
            () => {
                cpuRevealTimeoutRef.current = undefined;
                setIsCpuBlobRevealActive(false);
            },
            BLOB_REVEAL_TOTAL_MS,
            undefined
        );

        return () => {
            clearCpuRevealTimeout();
        };
    }, [cpuPlayer?.stageIndex, isTutorialActive, screen]);

    useEffect(() => {
        clearCpuTurnTimeout();

        if (
            screen !== 'tutorial' ||
            !isTutorialActive ||
            comboQueue.isComboRunning ||
            isCpuBlobRevealActive
        ) {
            return undefined;
        }

        const snapshot = latestSnapshotRef.current;
        const localPlayer = snapshot?.players.find(
            (player) => player.id === latestPlayerIdRef.current
        );
        const currentCpuPlayer = snapshot?.players.find(
            (player) => player.id === tutorialCpuPlayerId
        );

        if (
            !snapshot ||
            snapshot.status !== 'playing' ||
            !localPlayer ||
            !currentCpuPlayer ||
            localPlayer.hp === 0 ||
            currentCpuPlayer.hp === 0
        ) {
            return undefined;
        }

        cpuTurnTimeoutRef.current = globalThis.setTimeout(
            () => {
                cpuTurnTimeoutRef.current = undefined;
                performCpuTurn();
            },
            getTutorialCpuThinkDelay(currentCpuPlayer),
            undefined
        );

        return () => {
            clearCpuTurnTimeout();
        };
    }, [
        cpuAttackGate,
        isCpuBlobRevealActive,
        isTutorialActive,
        comboQueue.isComboRunning,
        multiplayerSnapshot?.lastEvent?.id,
        multiplayerSnapshot?.status,
        screen,
    ]);

    function startTutorialGame() {
        const localPlayerId = crypto.randomUUID();
        const roomId = `tutorial:${crypto.randomUUID()}`;
        const displayPlayerName = getDisplayPlayerName(playerName);
        const seed = roomId;
        const initialStage = generateStage(seed, 0);

        const tutorialSnapshot: RoomSnapshot = {
            roomId,
            seed,
            maxHp: 500,
            stageIndex: 0,
            stage: initialStage,
            players: [
                {
                    id: localPlayerId,
                    name: displayPlayerName,
                    hp: 500,
                    pendingFactorDamage: 0,
                    combo: 0,
                    maxCombo: 0,
                    stageIndex: 0,
                    stage: getTutorialStage(seed, 'player', 0),
                    connected: true,
                    ready: true,
                },
                {
                    id: tutorialCpuPlayerId,
                    name: uiText.tutorialCpu,
                    hp: tutorialCpuHp,
                    pendingFactorDamage: 0,
                    combo: 0,
                    maxCombo: 0,
                    stageIndex: 0,
                    stage: getTutorialStage(seed, 'cpu', 0),
                    connected: true,
                    ready: true,
                },
            ],
            lastEvent: undefined,
            countdownEndsAt: undefined,
            status: 'playing',
        };

        latestPlayerIdRef.current = localPlayerId;
        hasCpuShownPenaltyRef.current = false;
        tutorialDoneRef.current = false;
        cpuAttackAllowedRef.current = false;
        setPlayerId(localPlayerId);
        updateSnapshot(normalizeTutorialSnapshot(tutorialSnapshot));
        comboQueue.reset();
        onScreenChange('tutorial');
    }

    async function handleMultiplayerComboSubmit(
        queue: readonly Prime[]
    ): Promise<undefined> {
        const snapshot = latestSnapshotRef.current;
        const localPlayer = snapshot?.players.find(
            (player) => player.id === latestPlayerIdRef.current
        );

        if (!snapshot || !localPlayer) {
            return undefined;
        }

        await comboQueue.submitCombo(queue, {
            isDisabled: isMultiplayerInputDisabled,
            isSolvedStage: localPlayer.stage.remainingValue === 1,
            onSolvedStageClear() {
                updateSnapshot(
                    clearSolvedBattleStage(snapshot, localPlayer.id)
                );
                return undefined;
            },
            processQueue: processMultiplayerQueue,
        });

        return undefined;
    }

    function resetTutorialGame() {
        clearCpuTurnTimeout();
        clearCpuRevealTimeout();
        latestPlayerIdRef.current = undefined;
        latestSnapshotRef.current = undefined;
        hasCpuShownPenaltyRef.current = false;
        tutorialDoneRef.current = false;
        cpuAttackAllowedRef.current = false;
        setPlayerId(undefined);
        setMultiplayerSnapshot(undefined);
        comboQueue.reset();
    }

    return {
        playablePrimes,
        multiplayerSnapshot,
        multiplayerPrimeQueue: comboQueue.primeQueue,
        isMultiplayerComboRunning: comboQueue.isComboRunning,
        isMultiplayerInputDisabled,
        currentMultiplayerPlayer,
        isTutorialActive,
        handleMultiplayerComboSubmit,
        startTutorialGame,
        resetTutorialGame,
        allowCpuAttack() {
            cpuAttackAllowedRef.current = true;
            setCpuAttackGate((currentValue) => currentValue + 1);
        },
        notifyTutorialDone() {
            tutorialDoneRef.current = true;
        },
    };

    function updateSnapshot(nextSnapshot: RoomSnapshot | undefined) {
        const normalizedSnapshot = nextSnapshot
            ? normalizeTutorialSnapshot(nextSnapshot)
            : undefined;

        latestSnapshotRef.current = normalizedSnapshot;
        setMultiplayerSnapshot(normalizedSnapshot);
    }

    function clearCpuTurnTimeout() {
        if (cpuTurnTimeoutRef.current !== undefined) {
            globalThis.clearTimeout(cpuTurnTimeoutRef.current);
            cpuTurnTimeoutRef.current = undefined;
        }
    }

    function clearCpuRevealTimeout() {
        if (cpuRevealTimeoutRef.current !== undefined) {
            globalThis.clearTimeout(cpuRevealTimeoutRef.current);
            cpuRevealTimeoutRef.current = undefined;
        }
    }

    async function processMultiplayerQueue(queuedPrimes: readonly Prime[]) {
        await processComboQueue(queuedPrimes, {
            getPlayer() {
                const snapshot = latestSnapshotRef.current;
                const localPlayerId = latestPlayerIdRef.current;
                return snapshot?.players.find(
                    (player) => player.id === localPlayerId
                );
            },
            clearQueue() {
                comboQueue.setPrimeQueue([]);
            },
            advanceQueue() {
                comboQueue.setPrimeQueue((currentQueue: readonly Prime[]) =>
                    currentQueue.slice(1)
                );
            },
            onWrongPrime(player) {
                const snapshot = latestSnapshotRef.current;
                const localPlayerId = latestPlayerIdRef.current;

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
                const snapshot = latestSnapshotRef.current;
                const localPlayerId = latestPlayerIdRef.current;

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
            onCorrectPrime(prime, suppressAttack, perfectSolveEligible) {
                const snapshot = latestSnapshotRef.current;
                const localPlayerId = latestPlayerIdRef.current;

                if (!snapshot || !localPlayerId) {
                    return undefined;
                }

                updateSnapshot(
                    applyBattlePrimeSelection(snapshot, localPlayerId, prime, {
                        suppressAttack,
                        perfectSolveEligible,
                    })
                );

                return undefined;
            },
        });
    }

    function performCpuTurn() {
        const snapshot = latestSnapshotRef.current;
        const currentCpuPlayer = snapshot?.players.find(
            (player) => player.id === tutorialCpuPlayerId
        );
        const localPlayer = snapshot?.players.find(
            (player) => player.id === latestPlayerIdRef.current
        );

        if (
            !snapshot ||
            snapshot.status !== 'playing' ||
            isCpuBlobRevealActiveRef.current ||
            !currentCpuPlayer ||
            !localPlayer ||
            currentCpuPlayer.hp === 0 ||
            localPlayer.hp === 0 ||
            localPlayer.stageIndex < 2
        ) {
            return;
        }

        if (
            currentCpuPlayer.stageIndex === 0 &&
            currentCpuPlayer.stage.remainingValue ===
                currentCpuPlayer.stage.targetValue &&
            !cpuAttackAllowedRef.current
        ) {
            return;
        }

        if (
            currentCpuPlayer.stageIndex === 0 &&
            currentCpuPlayer.stage.remainingValue !==
                currentCpuPlayer.stage.targetValue &&
            !hasCpuShownPenaltyRef.current
        ) {
            return;
        }

        if (currentCpuPlayer.stageIndex >= 1 && !tutorialDoneRef.current) {
            return;
        }

        if (currentCpuPlayer.stage.remainingValue === 1) {
            updateSnapshot(
                clearSolvedBattleStage(snapshot, tutorialCpuPlayerId)
            );
            return;
        }

        const selectedPrime = pickCpuPrime(currentCpuPlayer);
        const outcome = applyPrimeSelection(
            currentCpuPlayer.stage,
            selectedPrime
        );

        if (outcome.kind === 'wrong') {
            updateSnapshot(
                applyBattlePenalty(
                    snapshot,
                    tutorialCpuPlayerId,
                    currentCpuPlayer.stage,
                    currentCpuPlayer.pendingFactorDamage
                )
            );
            return;
        }

        updateSnapshot(
            applyBattlePrimeSelection(
                snapshot,
                tutorialCpuPlayerId,
                selectedPrime,
                {
                    perfectSolveEligible:
                        currentCpuPlayer.stage.remainingValue ===
                        currentCpuPlayer.stage.targetValue,
                }
            )
        );
    }

    function pickCpuPrime(cpuRoomPlayer: RoomPlayer): Prime {
        if (cpuRoomPlayer.stageIndex === 0) {
            if (cpuRoomPlayer.stage.remainingValue === 10) {
                return 2;
            }

            if (cpuRoomPlayer.stage.remainingValue === 5) {
                if (!hasCpuShownPenaltyRef.current) {
                    hasCpuShownPenaltyRef.current = true;
                    return 3;
                }

                return 5;
            }
        }

        if (cpuRoomPlayer.stageIndex === 1) {
            return 3;
        }

        return cpuRoomPlayer.stage.remainingFactors[
            Math.floor(
                Math.random() * cpuRoomPlayer.stage.remainingFactors.length
            )
        ];
    }
}

function getTutorialStage(
    seed: string,
    side: 'cpu' | 'player',
    stageIndex: number
): StageState {
    const scriptedFactors = getTutorialScriptedFactors(side, stageIndex);

    if (scriptedFactors === undefined) {
        return generateStage(`${seed}:${side}`, stageIndex);
    }

    return createStageState(stageIndex, scriptedFactors);
}

function createStageState(
    stageIndex: number,
    factors: readonly Prime[]
): StageState {
    const normalizedFactors: Prime[] = [];

    for (const prime of factors) {
        const insertionIndex = normalizedFactors.findIndex(
            (sortedPrime) => sortedPrime > prime
        );

        if (insertionIndex === -1) {
            normalizedFactors.push(prime);
            continue;
        }

        normalizedFactors.splice(insertionIndex, 0, prime);
    }

    let targetValue = 1;

    for (const prime of normalizedFactors) {
        targetValue *= prime;
    }

    return {
        stageIndex,
        targetValue,
        remainingValue: targetValue,
        factors: normalizedFactors,
        remainingFactors: [...normalizedFactors],
    };
}

function normalizeTutorialSnapshot(snapshot: RoomSnapshot): RoomSnapshot {
    const normalizedPlayers = snapshot.players.map((player) => {
        const side = player.id === tutorialCpuPlayerId ? 'cpu' : 'player';
        const scriptedStage = getTutorialStage(
            snapshot.seed,
            side,
            player.stageIndex
        );

        if (isSameStageShape(player.stage, scriptedStage)) {
            return player;
        }

        return {
            ...player,
            stage: scriptedStage,
        };
    });
    const localPlayer = normalizedPlayers.find(
        (player) => player.id !== tutorialCpuPlayerId
    );

    return {
        ...snapshot,
        players: normalizedPlayers,
        stageIndex: localPlayer?.stageIndex ?? snapshot.stageIndex,
        stage: localPlayer?.stage ?? snapshot.stage,
    };
}

function isSameStageShape(currentStage: StageState, scriptedStage: StageState) {
    return (
        currentStage.stageIndex === scriptedStage.stageIndex &&
        currentStage.targetValue === scriptedStage.targetValue &&
        currentStage.factors.length === scriptedStage.factors.length &&
        currentStage.factors.every(
            (factor, index) => factor === scriptedStage.factors[index]
        )
    );
}

function getTutorialCpuThinkDelay(cpuPlayer: RoomPlayer): number {
    const remainingFactorCount = cpuPlayer.stage.remainingFactors.length;

    return tutorialCpuThinkBaseMs + remainingFactorCount * 200;
}
