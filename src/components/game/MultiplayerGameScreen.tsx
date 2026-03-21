import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import type { CSSProperties, JSX } from 'react';
import { CircleArrowUp, Delete } from 'lucide-react';

import { uiText } from '../../app-state';
import type { Prime, RoomPlayer, RoomSnapshot } from '../../core';

import './GamePlayScreen.css';
import './MultiplayerGameScreen.css';

import { ActionButton } from './ui/ActionButton';
import { COMBO_QUEUE_MAX_ITEMS, ComboQueuePanel } from './ui/ComboQueuePanel';
import { NumberBlobDisplay } from './ui/NumberBlobDisplay';
import { PrimeKeyButton } from './ui/PrimeKeyButton';
import { ScoreDialog } from './ui/ScoreDialog';

type HpPop = {
    id: string;
    side: 'enemy' | 'self';
    value: number;
    kind: 'damage' | 'regen';
};

type HpImpact = {
    token: string;
    durationMs: number;
    kind: 'hit' | 'regen';
};

type AttackParticle = {
    id: number;
    side: 'enemy' | 'self';
    x: number;
    y: number;
    size: number;
    opacity: number;
    shape: 'circle' | 'diamond' | 'ring';
    rotation: number;
};

type AttackEffectState = {
    id: number;
    particles: AttackParticle[];
};

type PendingAttack = {
    id: number;
    damage: number;
    isFinisher: boolean;
    perfectSolve: boolean;
    sourceHp: number;
    sourceRegen: number;
    sourceSide: 'enemy' | 'self';
    targetHp: number;
    targetSide: 'enemy' | 'self';
};

type PerfectBurst = {
    id: number;
    side: 'enemy' | 'self';
};

type HeldBlobState = {
    stageIndex: number | undefined;
    value: number | undefined;
};

type MultiplayerGameScreenProps = {
    playablePrimes: Prime[];
    currentMultiplayerPlayer: RoomPlayer | undefined;
    multiplayerSnapshot: RoomSnapshot | undefined;
    multiplayerPrimeQueue: Prime[];
    isMultiplayerInputDisabled: boolean;
    isMultiplayerComboRunning: boolean;
    onBack: () => void | Promise<void>;
    onSubmit: (queue: readonly Prime[]) => Promise<void>;
};

export function MultiplayerGameScreen({
    playablePrimes,
    currentMultiplayerPlayer,
    multiplayerSnapshot,
    multiplayerPrimeQueue,
    isMultiplayerInputDisabled,
    isMultiplayerComboRunning,
    onBack,
    onSubmit,
}: MultiplayerGameScreenProps): JSX.Element {
    const blobRevealTotalMs = 3000;
    const keyboardDigitBufferWindowMs = 250;
    const damagePopLifetimeMs = 780;
    const perfectBurstDurationMs = 1120;
    const hpImpactTailMs = 240;
    const hpLossBaseDurationMs = 220;
    const hpLossPerPointDurationMs = 28;
    const hpRegenBaseDurationMs = 260;
    const hpRegenPerPointDurationMs = 24;
    const hpZeroHoldMs = 900;
    const isMatchFinished = multiplayerSnapshot?.status === 'finished';
    const [isBlobRevealActive, setIsBlobRevealActive] = useState(false);
    const hasInitializedStageRef = useRef(false);
    const isInputDisabled = isMultiplayerInputDisabled;
    const canSubmitSolvedBlob =
        currentMultiplayerPlayer?.stage.remainingValue === 1;
    const [bufferedPrimeInput, setBufferedPrimeInput] = useState('');
    const [visibleQueue, setVisibleQueue] = useState<Prime[]>(
        multiplayerPrimeQueue
    );
    const visibleQueueRef = useRef(visibleQueue);
    const digitBufferRef = useRef('');
    const digitBufferTimerRef = useRef<number | undefined>(undefined);
    const previousStageIndexRef = useRef<number | undefined>(undefined);
    const previousOpponentStageIndexRef = useRef<number | undefined>(undefined);
    const opponentPlayer = multiplayerSnapshot?.players.find(
        (player) => player.id !== currentMultiplayerPlayer?.id
    );
    const [isOpponentRevealActive, setIsOpponentRevealActive] = useState(false);
    const [hpPops, setHpPops] = useState<HpPop[]>([]);
    const [attackEffect, setAttackEffect] = useState<AttackEffectState>();
    const [queuedAttacks, setQueuedAttacks] = useState<PendingAttack[]>([]);
    const [activeAttackId, setActiveAttackId] = useState<number>();
    const [displayedSelfHp, setDisplayedSelfHp] = useState(
        currentMultiplayerPlayer?.hp ?? 0
    );
    const [displayedEnemyHp, setDisplayedEnemyHp] = useState(
        opponentPlayer?.hp ?? 0
    );
    const [heldSelfBlob, setHeldSelfBlob] = useState<HeldBlobState>();
    const [heldEnemyBlob, setHeldEnemyBlob] = useState<HeldBlobState>();
    const [hpImpacts, setHpImpacts] = useState<{
        enemy?: HpImpact;
        self?: HpImpact;
    }>({});
    const [isResultDialogVisible, setIsResultDialogVisible] = useState(false);
    const [pendingResultDialogEventId, setPendingResultDialogEventId] =
        useState<number>();
    const [perfectBurst, setPerfectBurst] = useState<PerfectBurst>();
    const previousEventIdRef = useRef<number | undefined>(undefined);
    const animationFrameRef = useRef<number | undefined>(undefined);
    const timeoutIdsRef = useRef<number[]>([]);
    const resultDialogTimerRef = useRef<number | undefined>(undefined);
    const overlayRef = useRef<HTMLDivElement | null>(null);
    const selfBlobRef = useRef<HTMLDivElement | null>(null);
    const enemyBlobRef = useRef<HTMLDivElement | null>(null);
    const selfHealthRef = useRef<HTMLDivElement | null>(null);
    const enemyHealthRef = useRef<HTMLDivElement | null>(null);
    const displayedSelfHpRef = useRef(displayedSelfHp);
    const displayedEnemyHpRef = useRef(displayedEnemyHp);
    const effectiveSelfBlob = heldSelfBlob ?? {
        stageIndex: currentMultiplayerPlayer?.stage.stageIndex,
        value: currentMultiplayerPlayer?.stage.remainingValue,
    };
    const effectiveEnemyBlob = heldEnemyBlob ?? {
        stageIndex: opponentPlayer?.stage.stageIndex,
        value: opponentPlayer?.stage.targetValue,
    };
    const currentStageIndex = effectiveSelfBlob.stageIndex ?? -1;
    const currentPlayerWon =
        isMatchFinished &&
        Boolean(currentMultiplayerPlayer && currentMultiplayerPlayer.hp > 0);
    const hasPendingAttackEvent = Boolean(
        multiplayerSnapshot?.lastEvent &&
        multiplayerSnapshot.lastEvent.id !== previousEventIdRef.current &&
        (multiplayerSnapshot.lastEvent.type === 'attack' ||
            (multiplayerSnapshot.lastEvent.type === 'finish' &&
                multiplayerSnapshot.lastEvent.cause === 'attack'))
    );
    useEffect(() => {
        visibleQueueRef.current = multiplayerPrimeQueue;
        setVisibleQueue(multiplayerPrimeQueue);
    }, [multiplayerPrimeQueue]);

    useEffect(() => {
        if (!isInputDisabled) {
            return;
        }

        clearDigitBuffer();
    }, [isInputDisabled]);

    useEffect(() => clearDigitBuffer, []);

    useLayoutEffect(() => {
        if (!currentMultiplayerPlayer) {
            hasInitializedStageRef.current = false;
            previousStageIndexRef.current = undefined;
            setIsBlobRevealActive(false);
            return undefined;
        }

        if (currentStageIndex < 0) {
            hasInitializedStageRef.current = false;
            previousStageIndexRef.current = undefined;
            setIsBlobRevealActive(false);
            return undefined;
        }

        if (!hasInitializedStageRef.current) {
            hasInitializedStageRef.current = true;
            previousStageIndexRef.current = currentStageIndex;
            setIsBlobRevealActive(true);

            const initialTimer = globalThis.setTimeout(
                () => {
                    setIsBlobRevealActive(false);
                },
                blobRevealTotalMs,
                undefined
            );

            return () => {
                globalThis.clearTimeout(initialTimer);
            };
        }

        if (previousStageIndexRef.current === currentStageIndex) {
            return undefined;
        }

        previousStageIndexRef.current = currentStageIndex;

        setIsBlobRevealActive(true);

        const timer = globalThis.setTimeout(
            () => {
                setIsBlobRevealActive(false);
            },
            blobRevealTotalMs,
            undefined
        );

        return () => {
            globalThis.clearTimeout(timer);
        };
    }, [blobRevealTotalMs, currentStageIndex]);

    useLayoutEffect(() => {
        const opponentStageIndex = effectiveEnemyBlob.stageIndex;

        if (opponentStageIndex === undefined) {
            previousOpponentStageIndexRef.current = undefined;
            setIsOpponentRevealActive(false);
            return undefined;
        }

        if (previousOpponentStageIndexRef.current === undefined) {
            previousOpponentStageIndexRef.current = opponentStageIndex;
            setIsOpponentRevealActive(true);

            const initialTimer = globalThis.setTimeout(
                () => {
                    setIsOpponentRevealActive(false);
                },
                blobRevealTotalMs,
                undefined
            );

            return () => {
                globalThis.clearTimeout(initialTimer);
            };
        }

        if (previousOpponentStageIndexRef.current === opponentStageIndex) {
            return undefined;
        }

        previousOpponentStageIndexRef.current = opponentStageIndex;
        setIsOpponentRevealActive(true);

        const timer = globalThis.setTimeout(
            () => {
                setIsOpponentRevealActive(false);
            },
            blobRevealTotalMs,
            undefined
        );

        return () => {
            globalThis.clearTimeout(timer);
        };
    }, [blobRevealTotalMs, effectiveEnemyBlob.stageIndex]);

    useEffect(
        () => () => {
            if (animationFrameRef.current !== undefined) {
                cancelAnimationFrame(animationFrameRef.current);
            }

            for (const timerId of timeoutIdsRef.current) {
                globalThis.clearTimeout(timerId);
            }
            timeoutIdsRef.current = [];

            if (resultDialogTimerRef.current !== undefined) {
                globalThis.clearTimeout(resultDialogTimerRef.current);
                resultDialogTimerRef.current = undefined;
            }
        },
        []
    );

    useEffect(() => {
        displayedSelfHpRef.current = displayedSelfHp;
    }, [displayedSelfHp]);

    useEffect(() => {
        displayedEnemyHpRef.current = displayedEnemyHp;
    }, [displayedEnemyHp]);

    useEffect(() => {
        if (isMatchFinished) {
            return;
        }

        if (resultDialogTimerRef.current !== undefined) {
            globalThis.clearTimeout(resultDialogTimerRef.current);
            resultDialogTimerRef.current = undefined;
        }

        setPendingResultDialogEventId(undefined);
        setIsResultDialogVisible(false);
    }, [isMatchFinished]);

    useEffect(() => {
        if (
            !isMatchFinished ||
            isResultDialogVisible ||
            pendingResultDialogEventId !== undefined ||
            hasPendingAttackEvent ||
            queuedAttacks.length > 0 ||
            activeAttackId !== undefined
        ) {
            return;
        }

        setIsResultDialogVisible(true);
    }, [
        activeAttackId,
        hasPendingAttackEvent,
        isMatchFinished,
        isResultDialogVisible,
        pendingResultDialogEventId,
        queuedAttacks.length,
    ]);

    useEffect(() => {
        if (!currentMultiplayerPlayer || !opponentPlayer) {
            setDisplayedHp('self', currentMultiplayerPlayer?.hp ?? 0);
            setDisplayedHp('enemy', opponentPlayer?.hp ?? 0);
            setHeldSelfBlob(undefined);
            setHeldEnemyBlob(undefined);
            setQueuedAttacks([]);
            setActiveAttackId(undefined);
            setHpImpacts({});
            setPerfectBurst(undefined);
            return;
        }

        if (
            queuedAttacks.length > 0 ||
            activeAttackId !== undefined ||
            hasPendingAttackEvent
        ) {
            return;
        }

        setDisplayedHp('self', currentMultiplayerPlayer.hp);
        setDisplayedHp('enemy', opponentPlayer.hp);
    }, [
        activeAttackId,
        currentMultiplayerPlayer,
        currentMultiplayerPlayer?.hp,
        hasPendingAttackEvent,
        opponentPlayer,
        opponentPlayer?.hp,
        queuedAttacks.length,
    ]);

    useEffect(() => {
        const lastEvent = multiplayerSnapshot?.lastEvent;

        if (!lastEvent || lastEvent.id === previousEventIdRef.current) {
            return;
        }

        previousEventIdRef.current = lastEvent.id;

        if (lastEvent.type === 'attack') {
            const sourceSide =
                lastEvent.sourcePlayerId === currentMultiplayerPlayer?.id
                    ? 'self'
                    : 'enemy';
            const targetSide = sourceSide === 'self' ? 'enemy' : 'self';

            setQueuedAttacks((currentQueue: readonly PendingAttack[]) => [
                ...currentQueue,
                {
                    id: lastEvent.id,
                    damage: lastEvent.damage,
                    isFinisher: false,
                    perfectSolve: lastEvent.perfectSolve,
                    sourceHp: lastEvent.sourceHp,
                    sourceRegen: lastEvent.regen,
                    sourceSide,
                    targetHp: lastEvent.targetHp,
                    targetSide,
                },
            ]);
            return;
        }

        if (lastEvent.type === 'self-hit') {
            const side =
                lastEvent.sourcePlayerId === currentMultiplayerPlayer?.id
                    ? 'self'
                    : 'enemy';

            if (lastEvent.releasedDamage > 0) {
                const targetSide = side === 'self' ? 'enemy' : 'self';

                setQueuedAttacks((currentQueue: readonly PendingAttack[]) => [
                    ...currentQueue,
                    {
                        id: lastEvent.id,
                        damage: lastEvent.releasedDamage,
                        isFinisher: false,
                        perfectSolve: false,
                        sourceHp: lastEvent.sourceHp,
                        sourceRegen: 0,
                        sourceSide: side,
                        targetHp: lastEvent.targetHp,
                        targetSide,
                    },
                ]);
            }

            resolveHpLoss(side, lastEvent.sourceHp, lastEvent.damage);
            return;
        }

        if (lastEvent.cause === 'attack') {
            const sourceSide =
                lastEvent.sourcePlayerId === currentMultiplayerPlayer?.id
                    ? 'self'
                    : 'enemy';
            const targetSide = sourceSide === 'self' ? 'enemy' : 'self';

            setQueuedAttacks((currentQueue: readonly PendingAttack[]) => [
                ...currentQueue,
                {
                    id: lastEvent.id,
                    damage: lastEvent.damage,
                    isFinisher: true,
                    perfectSolve: lastEvent.perfectSolve,
                    sourceHp: lastEvent.winnerHp,
                    sourceRegen: lastEvent.regen,
                    sourceSide,
                    targetHp: lastEvent.loserHp,
                    targetSide,
                },
            ]);
            return;
        }

        const loserSide =
            lastEvent.loserPlayerId === currentMultiplayerPlayer?.id
                ? 'self'
                : 'enemy';
        const winnerSide = loserSide === 'self' ? 'enemy' : 'self';

        setDisplayedHp(winnerSide, lastEvent.winnerHp);

        const lossResult = resolveHpLoss(
            loserSide,
            lastEvent.loserHp,
            lastEvent.damage
        );
        const zeroHoldMs =
            lossResult.deductedHp > 0 && lastEvent.loserHp === 0
                ? hpZeroHoldMs
                : 0;

        queueResultDialogReveal(
            lastEvent.id,
            lossResult.durationMs + zeroHoldMs
        );
    }, [currentMultiplayerPlayer?.id, multiplayerSnapshot?.lastEvent]);

    useEffect(() => {
        if (activeAttackId !== undefined || queuedAttacks.length === 0) {
            return;
        }

        const nextAttack = queuedAttacks[0];
        const perfectEffectStartTime = performance.now();
        const perfectEffectDuration = nextAttack.perfectSolve
            ? triggerPerfectSolve(
                  nextAttack.sourceSide,
                  nextAttack.id,
                  nextAttack.sourceHp,
                  nextAttack.sourceRegen
              )
            : 0;

        const completeAttack = () => {
            const lossResult = resolveHpLoss(
                nextAttack.targetSide,
                nextAttack.targetHp,
                nextAttack.damage
            );
            const remainingPerfectDelay =
                perfectEffectDuration > 0
                    ? Math.max(
                          0,
                          perfectEffectDuration -
                              (performance.now() - perfectEffectStartTime)
                      )
                    : 0;

            if (nextAttack.isFinisher) {
                const zeroHoldMs =
                    lossResult.deductedHp > 0 && nextAttack.targetHp === 0
                        ? hpZeroHoldMs
                        : 0;

                queueResultDialogReveal(
                    nextAttack.id,
                    Math.max(
                        lossResult.durationMs + zeroHoldMs,
                        remainingPerfectDelay
                    )
                );
            }

            setQueuedAttacks((currentQueue: readonly PendingAttack[]) =>
                currentQueue.filter(
                    (queuedAttack) => queuedAttack.id !== nextAttack.id
                )
            );
            setActiveAttackId(undefined);
        };

        setActiveAttackId(nextAttack.id);
        const didStartAttackEffect = startAttackEffect(
            nextAttack.sourceSide,
            nextAttack.targetSide,
            nextAttack.id,
            nextAttack.damage,
            completeAttack
        );

        if (!didStartAttackEffect) {
            completeAttack();
        }
    }, [activeAttackId, queuedAttacks]);

    function setLocalQueue(nextQueue: readonly Prime[]) {
        const normalizedQueue = [...nextQueue];

        visibleQueueRef.current = normalizedQueue;
        setVisibleQueue(normalizedQueue);
    }

    function clearDigitBuffer() {
        const timerId = digitBufferTimerRef.current;

        if (timerId !== undefined) {
            globalThis.clearTimeout(timerId);
            digitBufferTimerRef.current = undefined;
        }

        digitBufferRef.current = '';
        setBufferedPrimeInput('');
    }

    function scheduleTimeout(callback: () => void, delayMs: number): number {
        const timerId = globalThis.setTimeout(
            () => {
                timeoutIdsRef.current = timeoutIdsRef.current.filter(
                    (currentTimerId) => currentTimerId !== timerId
                );
                callback();
            },
            delayMs,
            undefined
        );

        timeoutIdsRef.current = [...timeoutIdsRef.current, timerId];
        return timerId;
    }

    function setDisplayedHp(side: 'enemy' | 'self', nextHp: number) {
        if (side === 'self') {
            displayedSelfHpRef.current = nextHp;
            setDisplayedSelfHp(nextHp);
            return;
        }

        displayedEnemyHpRef.current = nextHp;
        setDisplayedEnemyHp(nextHp);
    }

    function getDisplayedHp(side: 'enemy' | 'self'): number {
        return side === 'self'
            ? displayedSelfHpRef.current
            : displayedEnemyHpRef.current;
    }

    function getHpLossDuration(previousHp: number, nextHp: number): number {
        const deductedHp = Math.max(0, previousHp - nextHp);

        if (deductedHp === 0) {
            return 0;
        }

        return Math.min(
            1200,
            hpLossBaseDurationMs + deductedHp * hpLossPerPointDurationMs
        );
    }

    function getHpGainDuration(previousHp: number, nextHp: number): number {
        const gainedHp = Math.max(0, nextHp - previousHp);

        if (gainedHp === 0) {
            return 0;
        }

        return Math.min(
            980,
            hpRegenBaseDurationMs + gainedHp * hpRegenPerPointDurationMs
        );
    }

    function queueResultDialogReveal(eventId: number, delayMs: number) {
        if (resultDialogTimerRef.current !== undefined) {
            globalThis.clearTimeout(resultDialogTimerRef.current);
            resultDialogTimerRef.current = undefined;
        }

        setPendingResultDialogEventId(eventId);
        setIsResultDialogVisible(false);

        if (delayMs <= 0) {
            setPendingResultDialogEventId(undefined);
            setIsResultDialogVisible(true);
            return;
        }

        resultDialogTimerRef.current = scheduleTimeout(() => {
            resultDialogTimerRef.current = undefined;
            setPendingResultDialogEventId(undefined);
            setIsResultDialogVisible(true);
        }, delayMs);
    }

    function resolveHpLoss(
        side: 'enemy' | 'self',
        nextHp: number,
        damage: number
    ): {
        deductedHp: number;
        durationMs: number;
    } {
        const previousHp = getDisplayedHp(side);
        const durationMs = getHpLossDuration(previousHp, nextHp);
        const deductedHp = Math.max(0, previousHp - nextHp);

        if (deductedHp > 0) {
            const impactToken = globalThis.crypto.randomUUID();

            setHpImpacts((currentImpacts) => ({
                ...currentImpacts,
                [side]: {
                    token: impactToken,
                    durationMs,
                    kind: 'hit',
                },
            }));

            scheduleTimeout(() => {
                setHpImpacts((currentImpacts) => {
                    if (currentImpacts[side]?.token !== impactToken) {
                        return currentImpacts;
                    }

                    return {
                        ...currentImpacts,
                        [side]: undefined,
                    };
                });
            }, durationMs + hpImpactTailMs);
        }

        setDisplayedHp(side, nextHp);

        if (damage > 0) {
            showHpPop(side, damage, 'damage');
        }

        return {
            deductedHp,
            durationMs,
        };
    }

    function resolveHpGain(
        side: 'enemy' | 'self',
        nextHp: number,
        regen: number
    ): number {
        const previousHp = getDisplayedHp(side);
        const appliedRegen = Math.max(0, nextHp - previousHp);
        const durationMs = getHpGainDuration(previousHp, nextHp);

        if (appliedRegen > 0) {
            const impactToken = globalThis.crypto.randomUUID();

            setHpImpacts((currentImpacts) => ({
                ...currentImpacts,
                [side]: {
                    token: impactToken,
                    durationMs,
                    kind: 'regen',
                },
            }));

            scheduleTimeout(() => {
                setHpImpacts((currentImpacts) => {
                    if (currentImpacts[side]?.token !== impactToken) {
                        return currentImpacts;
                    }

                    return {
                        ...currentImpacts,
                        [side]: undefined,
                    };
                });
            }, durationMs + hpImpactTailMs);
        }

        setDisplayedHp(side, nextHp);

        if (regen > 0) {
            showHpPop(side, regen, 'regen');
        }

        return durationMs;
    }

    function triggerPerfectSolve(
        side: 'enemy' | 'self',
        eventId: number,
        nextHp: number,
        regen: number
    ): number {
        if (side === 'self') {
            setHeldSelfBlob({
                stageIndex: effectiveSelfBlob.stageIndex,
                value: 1,
            });
        } else {
            setHeldEnemyBlob({
                stageIndex: effectiveEnemyBlob.stageIndex,
                value: 1,
            });
        }

        setPerfectBurst({ id: eventId, side });

        scheduleTimeout(() => {
            setPerfectBurst((currentBurst) =>
                currentBurst?.id === eventId ? undefined : currentBurst
            );
            if (side === 'self') {
                setHeldSelfBlob(undefined);
                return;
            }

            setHeldEnemyBlob(undefined);
        }, perfectBurstDurationMs);

        const previousHp = getDisplayedHp(side);
        const regenDurationMs = getHpGainDuration(previousHp, nextHp);

        if (regen > 0) {
            resolveHpGain(side, nextHp, regen);
        }

        return Math.max(perfectBurstDurationMs, regenDurationMs);
    }

    function queuePrime(prime: Prime) {
        if (
            isInputDisabled ||
            visibleQueueRef.current.length >= COMBO_QUEUE_MAX_ITEMS
        ) {
            return;
        }

        setLocalQueue([...visibleQueueRef.current, prime]);
    }

    function scheduleBufferedPrimeCommit(nextBuffer: string) {
        digitBufferRef.current = nextBuffer;
        setBufferedPrimeInput(nextBuffer);

        const timerId = digitBufferTimerRef.current;

        if (timerId !== undefined) {
            globalThis.clearTimeout(timerId);
        }

        digitBufferTimerRef.current = globalThis.setTimeout(
            () => {
                const bufferedPrime = playablePrimes.find(
                    (prime) => String(prime) === digitBufferRef.current
                );

                clearDigitBuffer();

                if (bufferedPrime !== undefined) {
                    queuePrime(bufferedPrime);
                }
            },
            keyboardDigitBufferWindowMs,
            undefined
        );
    }

    function handleDigitKey(digit: string) {
        if (isInputDisabled) {
            return;
        }

        const nextBuffer = `${digitBufferRef.current}${digit}`;
        const matchingPrimes = playablePrimes.filter((prime) =>
            String(prime).startsWith(nextBuffer)
        );

        if (matchingPrimes.length === 0) {
            clearDigitBuffer();

            const restartedMatches = playablePrimes.filter((prime) =>
                String(prime).startsWith(digit)
            );

            if (restartedMatches.length === 0) {
                return;
            }

            const restartedPrime = restartedMatches.find(
                (prime) => String(prime) === digit
            );
            const hasLongerRestartMatch = restartedMatches.some(
                (prime) => String(prime).length > digit.length
            );

            if (restartedPrime !== undefined && !hasLongerRestartMatch) {
                queuePrime(restartedPrime);
                return;
            }

            scheduleBufferedPrimeCommit(digit);
            return;
        }

        const exactPrime = matchingPrimes.find(
            (prime) => String(prime) === nextBuffer
        );
        const hasLongerMatch = matchingPrimes.some(
            (prime) => String(prime).length > nextBuffer.length
        );

        if (exactPrime !== undefined && !hasLongerMatch) {
            clearDigitBuffer();
            queuePrime(exactPrime);
            return;
        }

        scheduleBufferedPrimeCommit(nextBuffer);
    }

    function handlePrimeTap(prime: Prime) {
        queuePrime(prime);
    }

    function handleBackspace() {
        if (isMultiplayerComboRunning) {
            return;
        }

        if (digitBufferRef.current !== '') {
            const nextBuffer = digitBufferRef.current.slice(0, -1);

            if (nextBuffer === '') {
                clearDigitBuffer();
                return;
            }

            const hasMatchingPrime = playablePrimes.some((prime) =>
                String(prime).startsWith(nextBuffer)
            );

            if (!hasMatchingPrime) {
                clearDigitBuffer();
                return;
            }

            scheduleBufferedPrimeCommit(nextBuffer);
            return;
        }

        if (visibleQueueRef.current.length === 0) {
            return;
        }

        setLocalQueue(visibleQueueRef.current.slice(0, -1));
    }

    async function submitVisibleQueue() {
        if (
            isInputDisabled ||
            (visibleQueueRef.current.length === 0 && !canSubmitSolvedBlob)
        ) {
            return;
        }

        try {
            await onSubmit(visibleQueueRef.current);
        } catch {
            // Ignore submit failures to keep the input responsive.
        }
    }

    function handleSubmitClick() {
        submitVisibleQueue().catch(() => undefined);
    }

    function showHpPop(
        side: 'enemy' | 'self',
        value: number,
        kind: 'damage' | 'regen'
    ) {
        const id = globalThis.crypto.randomUUID();

        setHpPops((currentPops: readonly HpPop[]) => [
            ...currentPops,
            { id, side, value, kind },
        ]);

        scheduleTimeout(() => {
            setHpPops((currentPops: readonly HpPop[]) =>
                currentPops.filter((currentPop) => currentPop.id !== id)
            );
        }, damagePopLifetimeMs);
    }

    function startAttackEffect(
        sourceSide: 'enemy' | 'self',
        targetSide: 'enemy' | 'self',
        id: number,
        damage: number,
        onComplete?: () => void
    ): boolean {
        const overlayElement = overlayRef.current;
        const sourceElement =
            sourceSide === 'self' ? selfBlobRef.current : enemyBlobRef.current;
        const targetElement =
            targetSide === 'self'
                ? selfHealthRef.current
                : enemyHealthRef.current;

        if (!overlayElement || !sourceElement || !targetElement) {
            return false;
        }

        const overlayRect = overlayElement.getBoundingClientRect();
        const sourceRect = sourceElement.getBoundingClientRect();
        const targetRect = targetElement.getBoundingClientRect();
        const startPoint = {
            x: sourceRect.left + sourceRect.width / 2 - overlayRect.left,
            y: sourceRect.top + sourceRect.height / 2 - overlayRect.top,
        };
        const endPoint = {
            x: targetRect.left + targetRect.width / 2 - overlayRect.left,
            y: targetRect.top + targetRect.height / 2 - overlayRect.top,
        };
        const horizontalDirection = targetSide === 'self' ? 1 : -1;

        let severity = 0;

        if (damage > 30) {
            severity = 3;
        } else if (damage > 15) {
            severity = 2;
        } else if (damage > 5) {
            severity = 1;
        }
        const trailCount = [3, 5, 8, 11][severity];
        const leadSize = [14, 18, 24, 30][severity];
        const trailBaseSize = [6, 8, 10, 12][severity];
        const spreadScale = [0.6, 1, 1.5, 2][severity];
        const impactRingCount = [3, 4, 5, 7][severity];
        const durationMs = [1080, 960, 840, 720][severity];

        const controlPoint = {
            x:
                (startPoint.x + endPoint.x) / 2 +
                42 * horizontalDirection * spreadScale,
            y: Math.min(startPoint.y, endPoint.y) - 88 * spreadScale,
        };

        const dx = endPoint.x - startPoint.x;
        const dy = endPoint.y - startPoint.y;
        const pathLength = Math.hypot(dx, dy) || 1;
        const perpX = -dy / pathLength;
        const perpY = dx / pathLength;

        const flightEnd = 0.82;
        const impactStart = 0.78;
        const animationStart = performance.now();

        if (animationFrameRef.current !== undefined) {
            cancelAnimationFrame(animationFrameRef.current);
        }

        const animate = (timestamp: number) => {
            const elapsed = timestamp - animationStart;
            const baseProgress = Math.min(1, elapsed / durationMs);
            const particles: AttackParticle[] = [];

            const leadT = Math.min(1, baseProgress / flightEnd);

            if (leadT > 0 && leadT < 1) {
                const accel = leadT * leadT;
                const lx = quadraticBezier(
                    startPoint.x,
                    controlPoint.x,
                    endPoint.x,
                    accel
                );
                const ly = quadraticBezier(
                    startPoint.y,
                    controlPoint.y,
                    endPoint.y,
                    accel
                );
                const nextT = Math.min(1, accel + 0.01);
                const nx = quadraticBezier(
                    startPoint.x,
                    controlPoint.x,
                    endPoint.x,
                    nextT
                );
                const ny = quadraticBezier(
                    startPoint.y,
                    controlPoint.y,
                    endPoint.y,
                    nextT
                );
                const angle =
                    Math.atan2(ny - ly, nx - lx) * (180 / Math.PI) + 45;

                particles.push({
                    id: 0,
                    side: sourceSide,
                    x: lx,
                    y: ly,
                    size: leadSize,
                    opacity: Math.min(1, leadT * 5),
                    shape: 'diamond',
                    rotation: angle,
                });
            }

            for (let i = 0; i < trailCount; i++) {
                const delay = (i + 1) * 0.06;
                const t = Math.max(
                    0,
                    Math.min(1, (baseProgress - delay) / (flightEnd - delay))
                );

                if (t <= 0 || t >= 1) {
                    continue;
                }

                const accel = t * t;
                const wobbleAmp = 10 * spreadScale * Math.sin(t * Math.PI);
                const wobblePhase =
                    Math.sin(t * Math.PI * 4 + i * 1.8) * wobbleAmp;

                const bx = quadraticBezier(
                    startPoint.x,
                    controlPoint.x,
                    endPoint.x,
                    accel
                );
                const by = quadraticBezier(
                    startPoint.y,
                    controlPoint.y,
                    endPoint.y,
                    accel
                );

                particles.push({
                    id: i + 1,
                    side: sourceSide,
                    x: bx + perpX * wobblePhase,
                    y: by + perpY * wobblePhase,
                    size: trailBaseSize * Math.max(0.5, 1 - i * 0.06),
                    opacity: (1 - t * 0.65) * Math.min(1, t * 8),
                    shape: 'circle',
                    rotation: 0,
                });
            }

            if (baseProgress > impactStart) {
                const impactT =
                    (baseProgress - impactStart) / (1 - impactStart);
                const easeOut = 1 - (1 - impactT) * (1 - impactT);

                for (let i = 0; i < impactRingCount; i++) {
                    const angle = (Math.PI * 2 * i) / impactRingCount + 0.3;
                    const radius = easeOut * (24 + severity * 10);

                    particles.push({
                        id: trailCount + 1 + i,
                        side: sourceSide,
                        x: endPoint.x + Math.cos(angle) * radius,
                        y: endPoint.y + Math.sin(angle) * radius,
                        size: leadSize * 0.5 * (1 - easeOut * 0.4),
                        opacity: (1 - easeOut) * 0.9,
                        shape: 'ring',
                        rotation: 0,
                    });
                }
            }

            setAttackEffect({ id, particles });

            if (baseProgress < 1) {
                animationFrameRef.current = requestAnimationFrame(animate);
                return;
            }

            setAttackEffect(undefined);
            animationFrameRef.current = undefined;
            onComplete?.();
        };

        animationFrameRef.current = requestAnimationFrame(animate);
        return true;
    }

    useEffect(() => {
        function handleWindowKeyDown(event: KeyboardEvent) {
            const { target } = event;

            if (
                target instanceof HTMLElement &&
                (target.isContentEditable ||
                    target.tagName === 'INPUT' ||
                    target.tagName === 'SELECT' ||
                    target.tagName === 'TEXTAREA')
            ) {
                return;
            }

            if (event.altKey || event.ctrlKey || event.metaKey) {
                return;
            }

            if (event.key === 'Backspace') {
                if (
                    isMultiplayerComboRunning ||
                    (digitBufferRef.current === '' &&
                        visibleQueueRef.current.length === 0)
                ) {
                    return;
                }

                event.preventDefault();
                clearDigitBuffer();
                handleBackspace();
                return;
            }

            if (event.key === 'Enter') {
                if (isInputDisabled || visibleQueueRef.current.length === 0) {
                    return;
                }

                event.preventDefault();
                clearDigitBuffer();
                submitVisibleQueue().catch(() => undefined);
                return;
            }

            if (!/^\d$/.test(event.key) || event.repeat) {
                return;
            }

            event.preventDefault();
            handleDigitKey(event.key);
        }

        globalThis.addEventListener('keydown', handleWindowKeyDown);

        return () => {
            globalThis.removeEventListener('keydown', handleWindowKeyDown);
        };
    }, [
        handleBackspace,
        handleDigitKey,
        isBlobRevealActive,
        isInputDisabled,
        isMultiplayerComboRunning,
        submitVisibleQueue,
    ]);

    return (
        <main className='app-shell fullscreen-shell'>
            <section className='screen game-screen single-game-screen multiplayer-game-screen'>
                <BattleHpBar
                    hp={displayedEnemyHp}
                    hpPop={hpPops.find((hpPop) => hpPop.side === 'enemy')}
                    impact={hpImpacts.enemy}
                    label={opponentPlayer?.name ?? uiText.opponent}
                    maxHp={multiplayerSnapshot?.maxHp ?? 1}
                    outerRef={enemyHealthRef}
                    perfectActive={perfectBurst?.side === 'enemy'}
                    side='enemy'
                />

                <section className='multiplayer-board' ref={overlayRef}>
                    <div className='multiplayer-column multiplayer-column-self'>
                        <div
                            className='multiplayer-blob-anchor'
                            ref={selfBlobRef}
                        >
                            <NumberBlobDisplay
                                isComboRunning={isMultiplayerComboRunning}
                                isStageRevealActive={isBlobRevealActive}
                                mode='multiplayer'
                                size='self'
                                stageIndex={effectiveSelfBlob.stageIndex}
                                value={effectiveSelfBlob.value}
                            />
                        </div>
                    </div>

                    <div className='multiplayer-column multiplayer-column-enemy'>
                        <div
                            className='multiplayer-blob-anchor'
                            ref={enemyBlobRef}
                        >
                            <NumberBlobDisplay
                                concealValues
                                isComboRunning={false}
                                isStageRevealActive={isOpponentRevealActive}
                                mode='multiplayer'
                                size='enemy'
                                stageIndex={effectiveEnemyBlob.stageIndex}
                                value={effectiveEnemyBlob.value}
                            />
                        </div>
                    </div>

                    {attackEffect ? (
                        <div
                            aria-hidden='true'
                            className='multiplayer-attack-layer'
                        >
                            {attackEffect.particles.map((particle) => (
                                <span
                                    className={`multiplayer-attack-particle multiplayer-attack-particle-${particle.side} multiplayer-attack-particle-${particle.shape}`}
                                    key={`${attackEffect.id}-${particle.id}`}
                                    style={
                                        {
                                            '--particle-size': `${particle.size}px`,
                                            '--particle-x': `${particle.x}px`,
                                            '--particle-y': `${particle.y}px`,
                                            '--particle-opacity':
                                                particle.opacity,
                                            '--particle-rotation': `${particle.rotation}deg`,
                                        } as CSSProperties
                                    }
                                />
                            ))}
                        </div>
                    ) : undefined}
                </section>

                <section className='single-controls-grid multiplayer-controls-grid'>
                    <BattleHpBar
                        hp={displayedSelfHp}
                        hpPop={hpPops.find((hpPop) => hpPop.side === 'self')}
                        impact={hpImpacts.self}
                        label={uiText.you}
                        maxHp={multiplayerSnapshot?.maxHp ?? 1}
                        outerRef={selfHealthRef}
                        perfectActive={perfectBurst?.side === 'self'}
                        side='self'
                    />

                    <ComboQueuePanel queue={visibleQueue} />

                    <div className='keypad-row'>
                        <div className='keypad solo-keypad multiplayer-keypad'>
                            {playablePrimes.map((prime) => (
                                <PrimeKeyButton
                                    key={`room-${prime}`}
                                    onPress={handlePrimeTap}
                                    prime={prime}
                                >
                                    {prime}
                                </PrimeKeyButton>
                            ))}
                        </div>

                        <div className='combo-actions-column'>
                            <ActionButton
                                aria-label={uiText.backspace}
                                className='combo-backspace-button'
                                disabled={
                                    isMultiplayerComboRunning ||
                                    (visibleQueue.length === 0 &&
                                        bufferedPrimeInput === '')
                                }
                                onClick={handleBackspace}
                                shape='rounded'
                                variant='secondary'
                            >
                                <span className='control-button-content'>
                                    <Delete
                                        aria-hidden='true'
                                        className='control-icon'
                                    />
                                </span>
                            </ActionButton>

                            <ActionButton
                                aria-label={uiText.enterCombo}
                                className='combo-enter-button'
                                disabled={
                                    isInputDisabled ||
                                    (visibleQueue.length === 0 &&
                                        !canSubmitSolvedBlob)
                                }
                                onClick={handleSubmitClick}
                                shape='rounded'
                                variant='secondary'
                            >
                                <span className='control-button-content'>
                                    <CircleArrowUp
                                        aria-hidden='true'
                                        className='control-icon'
                                    />
                                </span>
                            </ActionButton>
                        </div>
                    </div>
                </section>

                {isMatchFinished && isResultDialogVisible ? (
                    <ScoreDialog
                        comboCount={currentMultiplayerPlayer?.maxCombo ?? 0}
                        onReturnHome={onBack}
                        title={
                            currentPlayerWon ? uiText.victory : uiText.defeat
                        }
                    />
                ) : undefined}
            </section>
        </main>
    );
}

type BattleHpBarProps = {
    hpPop: HpPop | undefined;
    hp: number;
    impact: HpImpact | undefined;
    label: string;
    maxHp: number;
    outerRef: React.RefObject<HTMLDivElement | null>;
    perfectActive: boolean;
    side: 'enemy' | 'self';
};

function BattleHpBar({
    hp,
    hpPop,
    impact,
    label,
    maxHp,
    outerRef,
    perfectActive,
    side,
}: BattleHpBarProps): JSX.Element {
    const hpRatio = Math.max(0, Math.min(100, (hp / Math.max(maxHp, 1)) * 100));
    const impactClassName = impact ? ` multiplayer-hp-bar--${impact.kind}` : '';

    return (
        <div
            className={`multiplayer-hp-bar multiplayer-hp-bar-${side}${impactClassName}`}
            ref={outerRef}
            style={
                {
                    '--hp-transition-duration': `${impact?.durationMs ?? 0}ms`,
                } as CSSProperties
            }
        >
            <div className='multiplayer-hp-copy'>
                <span className='multiplayer-hp-name'>{label}</span>
                {perfectActive ? (
                    <span
                        aria-hidden='true'
                        className='multiplayer-perfect-tag'
                    >
                        PERFECT
                    </span>
                ) : undefined}
                <span className='multiplayer-hp-stat'>{hp}</span>
            </div>

            <div className='multiplayer-hp-track'>
                <span
                    className='multiplayer-hp-fill'
                    style={{ width: `${hpRatio}%` }}
                />
            </div>

            {hpPop ? (
                <span
                    className={`multiplayer-hp-pop multiplayer-hp-pop-${hpPop.kind}`}
                    key={hpPop.id}
                >
                    {hpPop.kind === 'regen' ? '+' : '-'}
                    {hpPop.value}
                </span>
            ) : undefined}
        </div>
    );
}

function quadraticBezier(
    start: number,
    control: number,
    end: number,
    progress: number
): number {
    const inverse = 1 - progress;
    return (
        inverse * inverse * start +
        2 * inverse * progress * control +
        progress * progress * end
    );
}
