import { useEffect, useLayoutEffect, useRef, useState } from 'react';

import type { RoomPlayer, RoomSnapshot } from '../core';
import {
    BLOB_REVEAL_TOTAL_MS,
    DAMAGE_POP_LIFETIME_MS,
    HP_IMPACT_TAIL_MS,
    HP_LOSS_BASE_DURATION_MS,
    HP_LOSS_PER_POINT_DURATION_MS,
    HP_REGEN_BASE_DURATION_MS,
    HP_REGEN_PER_POINT_DURATION_MS,
    HP_ZERO_HOLD_MS,
    PERFECT_BURST_DURATION_MS,
    SELF_FAULT_DURATION_MS,
} from '../core/timing';

export type DamagePop = {
    id: string;
    side: 'enemy' | 'self';
    value: number;
    kind: 'damage' | 'regen';
};

export type HpImpact = {
    token: string;
    durationMs: number;
    kind: 'hit' | 'regen';
};

export type SideHpImpacts = {
    hit?: HpImpact;
    regen?: HpImpact;
};

type AttackParticle = {
    id: number;
    side: 'enemy' | 'self';
    x: number;
    y: number;
    size: number;
    opacity: number;
    shape: 'ball' | 'circle' | 'ring';
};

export type AttackEffectState = {
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

export type PerfectBurst = {
    id: number;
    side: 'enemy' | 'self';
};

function getHpLossDuration(previousHp: number, nextHp: number): number {
    const deductedHp = Math.max(0, previousHp - nextHp);

    if (deductedHp === 0) {
        return 0;
    }

    return Math.min(
        1200,
        HP_LOSS_BASE_DURATION_MS + deductedHp * HP_LOSS_PER_POINT_DURATION_MS
    );
}

function getHpGainDuration(previousHp: number, nextHp: number): number {
    const gainedHp = Math.max(0, nextHp - previousHp);

    if (gainedHp === 0) {
        return 0;
    }

    return Math.min(
        980,
        HP_REGEN_BASE_DURATION_MS + gainedHp * HP_REGEN_PER_POINT_DURATION_MS
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

export function useBattleAnimations({
    currentPlayer,
    opponentPlayer,
    snapshot,
}: {
    currentPlayer: RoomPlayer | undefined;
    opponentPlayer: RoomPlayer | undefined;
    snapshot: RoomSnapshot | undefined;
}): {
    attackEffect: AttackEffectState | undefined;
    damagePops: DamagePop[];
    displayedEnemyHp: number;
    displayedSelfHp: number;
    enemyBlobRef: React.RefObject<HTMLDivElement | null>;
    enemyHealthRef: React.RefObject<HTMLDivElement | null>;
    hasPendingSelfFaultEvent: boolean;
    hpImpacts: { enemy?: SideHpImpacts; self?: SideHpImpacts };
    isBlobRevealActive: boolean;
    isOpponentRevealActive: boolean;
    isResultDialogVisible: boolean;
    overlayRef: React.RefObject<HTMLDivElement | null>;
    perfectBurst: PerfectBurst | undefined;
    selfBlobRef: React.RefObject<HTMLDivElement | null>;
    selfFaultToken: string | undefined;
    selfHealthRef: React.RefObject<HTMLDivElement | null>;
} {
    const isMatchFinished = snapshot?.status === 'finished';
    const currentStageIndex = currentPlayer?.stageIndex;
    const opponentStageIndex = opponentPlayer?.stageIndex;

    const [isBlobRevealActive, setIsBlobRevealActive] = useState(false);
    const [isOpponentRevealActive, setIsOpponentRevealActive] = useState(false);
    const [damagePops, setDamagePops] = useState<DamagePop[]>([]);
    const [attackEffect, setAttackEffect] = useState<AttackEffectState>();
    const [queuedAttacks, setQueuedAttacks] = useState<PendingAttack[]>([]);
    const [activeAttackId, setActiveAttackId] = useState<number>();
    const [displayedSelfHp, setDisplayedSelfHp] = useState(
        currentPlayer?.hp ?? 0
    );
    const [displayedEnemyHp, setDisplayedEnemyHp] = useState(
        opponentPlayer?.hp ?? 0
    );
    const [hpImpacts, setHpImpacts] = useState<{
        enemy?: SideHpImpacts;
        self?: SideHpImpacts;
    }>({});
    const [isResultDialogVisible, setIsResultDialogVisible] = useState(false);
    const [pendingResultDialogEventId, setPendingResultDialogEventId] =
        useState<number>();
    const [perfectBurst, setPerfectBurst] = useState<PerfectBurst>();
    const [selfFaultToken, setSelfFaultToken] = useState<string>();

    const previousEventIdRef = useRef<number | undefined>(undefined);
    const previousStageIndexRef = useRef<number | undefined>(undefined);
    const previousOpponentStageIndexRef = useRef<number | undefined>(undefined);
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
    const pendingAnimatedAttackIdRef = useRef<number | undefined>(undefined);
    const perfectSolveEndTimeRef = useRef<Map<number, number>>(new Map());
    const completedReleasedSelfHitEventIdRef = useRef<number | undefined>(
        undefined
    );

    const hasPendingAttackEvent = Boolean(
        snapshot?.lastEvent &&
        snapshot.lastEvent.id !== previousEventIdRef.current &&
        (snapshot.lastEvent.type === 'attack' ||
            (snapshot.lastEvent.type === 'finish' &&
                snapshot.lastEvent.cause === 'attack'))
    );

    /**
     * Self-hit events arrive in snapshot state before the fault animation token is set by the
     * effect below. During that gap, the self blob is still using the current stage index and can
     * incorrectly re-enter the stage-reveal branch. If that happens on a wrong prime, the blob
     * hides and later fades back in with the same number because the stage never actually changed.
     */
    const hasPendingSelfFaultEvent = Boolean(
        snapshot?.lastEvent &&
        snapshot.lastEvent.id !== previousEventIdRef.current &&
        ((snapshot.lastEvent.type === 'self-hit' &&
            snapshot.lastEvent.sourcePlayerId === currentPlayer?.id) ||
            (snapshot.lastEvent.type === 'finish' &&
                snapshot.lastEvent.cause === 'self-hit' &&
                snapshot.lastEvent.sourcePlayerId === currentPlayer?.id))
    );

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

    function remainingPerfectSolveDuration(eventId: number): number {
        const endTime = perfectSolveEndTimeRef.current.get(eventId);

        if (endTime === undefined) {
            return 0;
        }

        return Math.max(0, endTime - performance.now());
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
        damage: number,
        finishState?: {
            eventId: number;
            isFinisher: boolean;
        }
    ) {
        const previousHp = getDisplayedHp(side);
        const durationMs = getHpLossDuration(previousHp, nextHp);
        const deductedHp = Math.max(0, previousHp - nextHp);

        if (deductedHp > 0) {
            const impactToken = globalThis.crypto.randomUUID();

            setHpImpacts((currentImpacts) => ({
                ...currentImpacts,
                [side]: {
                    ...currentImpacts[side],
                    hit: {
                        token: impactToken,
                        durationMs,
                        kind: 'hit',
                    },
                },
            }));

            scheduleTimeout(() => {
                setHpImpacts((currentImpacts) => {
                    if (currentImpacts[side]?.hit?.token !== impactToken) {
                        return currentImpacts;
                    }

                    const nextSideImpacts = {
                        ...currentImpacts[side],
                        hit: undefined,
                    };

                    if (!nextSideImpacts.regen) {
                        return {
                            ...currentImpacts,
                            [side]: undefined,
                        };
                    }

                    return {
                        ...currentImpacts,
                        [side]: nextSideImpacts,
                    };
                });
            }, durationMs + HP_IMPACT_TAIL_MS);
        }

        setDisplayedHp(side, nextHp);

        if (damage > 0) {
            showDamagePop(side, damage, 'damage');
        }

        if (!finishState?.isFinisher) {
            return {
                deductedHp,
                durationMs,
            };
        }

        const zeroHoldMs = deductedHp > 0 && nextHp === 0 ? HP_ZERO_HOLD_MS : 0;

        queueResultDialogReveal(finishState.eventId, durationMs + zeroHoldMs);

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
                    ...currentImpacts[side],
                    regen: {
                        token: impactToken,
                        durationMs,
                        kind: 'regen',
                    },
                },
            }));

            scheduleTimeout(() => {
                setHpImpacts((currentImpacts) => {
                    if (currentImpacts[side]?.regen?.token !== impactToken) {
                        return currentImpacts;
                    }

                    const nextSideImpacts = {
                        ...currentImpacts[side],
                        regen: undefined,
                    };

                    if (!nextSideImpacts.hit) {
                        return {
                            ...currentImpacts,
                            [side]: undefined,
                        };
                    }

                    return {
                        ...currentImpacts,
                        [side]: nextSideImpacts,
                    };
                });
            }, durationMs + HP_IMPACT_TAIL_MS);
        }

        setDisplayedHp(side, nextHp);

        if (regen > 0) {
            showDamagePop(side, regen, 'regen');
        }

        return durationMs;
    }

    function triggerPerfectSolve(
        side: 'enemy' | 'self',
        eventId: number,
        nextHp: number,
        regen: number
    ): number {
        setPerfectBurst({ id: eventId, side });

        scheduleTimeout(() => {
            setPerfectBurst((currentBurst) =>
                currentBurst?.id === eventId ? undefined : currentBurst
            );
        }, PERFECT_BURST_DURATION_MS);

        const previousHp = getDisplayedHp(side);
        const regenDurationMs = getHpGainDuration(previousHp, nextHp);
        const totalDurationMs = Math.max(
            PERFECT_BURST_DURATION_MS,
            regenDurationMs
        );

        perfectSolveEndTimeRef.current.set(
            eventId,
            performance.now() + totalDurationMs
        );

        if (regen > 0) {
            resolveHpGain(side, nextHp, regen);
        }

        return totalDurationMs;
    }

    function showDamagePop(
        side: 'enemy' | 'self',
        value: number,
        kind: 'damage' | 'regen'
    ) {
        const id = globalThis.crypto.randomUUID();

        setDamagePops((currentPops: readonly DamagePop[]) => [
            ...currentPops,
            { id, kind, side, value },
        ]);

        scheduleTimeout(() => {
            setDamagePops((currentPops: readonly DamagePop[]) =>
                currentPops.filter((currentPop) => currentPop.id !== id)
            );
        }, DAMAGE_POP_LIFETIME_MS);
    }

    /**
     * A wrong-prime self-hit is a visual fault on the current stage, not a stage transition. We
     * explicitly cancel the self reveal flag here because its lifetime is longer than the fault
     * token; if reveal is allowed to resume, the blob disappears and reappears with the same value.
     */
    function triggerSelfFault() {
        const token = globalThis.crypto.randomUUID();

        setIsBlobRevealActive(false);
        setSelfFaultToken(token);

        scheduleTimeout(() => {
            setSelfFaultToken((currentToken) =>
                currentToken === token ? undefined : currentToken
            );
        }, SELF_FAULT_DURATION_MS);
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

                particles.push({
                    id: 0,
                    side: sourceSide,
                    x: lx,
                    y: ly,
                    size: leadSize,
                    opacity: Math.min(1, leadT * 5),
                    shape: 'ball',
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
                    });
                }
            }

            setAttackEffect({
                id,
                particles,
            });

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

    /**
     * The self reveal window is keyed off stage index only. Wrong-prime penalties do not advance
     * the stage, so any existing reveal timer must be treated as stale once a self-hit starts.
     * Otherwise the reveal state can outlive the short fault state and hide the unchanged blob a
     * second time.
     */
    useLayoutEffect(() => {
        if (currentStageIndex === undefined) {
            previousStageIndexRef.current = undefined;
            setIsBlobRevealActive(false);
            return undefined;
        }

        if (previousStageIndexRef.current === undefined) {
            previousStageIndexRef.current = currentStageIndex;
            setIsBlobRevealActive(true);

            const initialTimer = globalThis.setTimeout(
                () => {
                    setIsBlobRevealActive(false);
                },
                BLOB_REVEAL_TOTAL_MS,
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
            BLOB_REVEAL_TOTAL_MS,
            undefined
        );

        return () => {
            globalThis.clearTimeout(timer);
        };
    }, [currentStageIndex]);

    useLayoutEffect(() => {
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
                BLOB_REVEAL_TOTAL_MS,
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
            BLOB_REVEAL_TOTAL_MS,
            undefined
        );

        return () => {
            globalThis.clearTimeout(timer);
        };
    }, [opponentStageIndex]);

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

            perfectSolveEndTimeRef.current.clear();
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
        const pendingSelfHitEvent =
            snapshot?.lastEvent?.type === 'self-hit' &&
            snapshot.lastEvent.id !== previousEventIdRef.current;
        const pendingReleasedSelfHitEvent =
            snapshot?.lastEvent?.type === 'self-hit' &&
            snapshot.lastEvent.releasedDamage > 0 &&
            completedReleasedSelfHitEventIdRef.current !==
                snapshot.lastEvent.id;

        if (!currentPlayer || !opponentPlayer) {
            setDisplayedHp('self', currentPlayer?.hp ?? 0);
            setDisplayedHp('enemy', opponentPlayer?.hp ?? 0);
            setQueuedAttacks([]);
            setActiveAttackId(undefined);
            setHpImpacts({});
            setPerfectBurst(undefined);
            setSelfFaultToken(undefined);
            perfectSolveEndTimeRef.current.clear();
            return;
        }

        if (
            queuedAttacks.length > 0 ||
            activeAttackId !== undefined ||
            hasPendingAttackEvent ||
            pendingSelfHitEvent ||
            pendingReleasedSelfHitEvent ||
            pendingAnimatedAttackIdRef.current !== undefined
        ) {
            return;
        }

        setDisplayedHp('self', currentPlayer.hp);
        setDisplayedHp('enemy', opponentPlayer.hp);
    }, [
        activeAttackId,
        currentPlayer,
        currentPlayer?.hp,
        hasPendingAttackEvent,
        snapshot?.lastEvent,
        opponentPlayer,
        opponentPlayer?.hp,
        queuedAttacks.length,
    ]);

    useEffect(() => {
        const lastEvent = snapshot?.lastEvent;

        if (!lastEvent || lastEvent.id === previousEventIdRef.current) {
            return;
        }

        previousEventIdRef.current = lastEvent.id;

        if (lastEvent.type === 'attack') {
            const sourceSide =
                lastEvent.sourcePlayerId === currentPlayer?.id
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
                lastEvent.sourcePlayerId === currentPlayer?.id
                    ? 'self'
                    : 'enemy';
            const targetSide = side === 'self' ? 'enemy' : 'self';

            if (side === 'self') {
                triggerSelfFault();
            }

            resolveHpLoss(side, lastEvent.sourceHp, lastEvent.damage);

            if (lastEvent.releasedDamage > 0) {
                const releasedAttackId = lastEvent.id * 1000 + 1;
                const restoredTargetHp = Math.min(
                    snapshot.maxHp,
                    lastEvent.targetHp + lastEvent.releasedDamage
                );

                pendingAnimatedAttackIdRef.current = releasedAttackId;
                setDisplayedHp(targetSide, restoredTargetHp);
                setQueuedAttacks((currentQueue: readonly PendingAttack[]) => [
                    ...currentQueue,
                    {
                        id: releasedAttackId,
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

            return;
        }

        if (lastEvent.cause === 'attack') {
            const sourceSide =
                lastEvent.sourcePlayerId === currentPlayer?.id
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
            lastEvent.loserPlayerId === currentPlayer?.id ? 'self' : 'enemy';

        resolveHpLoss(loserSide, lastEvent.loserHp, lastEvent.damage, {
            eventId: lastEvent.id,
            isFinisher: true,
        });
    }, [currentPlayer?.id, snapshot?.lastEvent]);

    useEffect(() => {
        if (activeAttackId !== undefined || queuedAttacks.length === 0) {
            return;
        }

        const nextAttack = queuedAttacks[0];
        const remainingPerfectSolveMs = nextAttack.perfectSolve
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
            const resultRevealDelayMs = nextAttack.perfectSolve
                ? Math.max(remainingPerfectSolveDuration(nextAttack.id), 0)
                : remainingPerfectSolveMs;

            if (nextAttack.isFinisher) {
                const zeroHoldMs =
                    lossResult.deductedHp > 0 && nextAttack.targetHp === 0
                        ? HP_ZERO_HOLD_MS
                        : 0;

                queueResultDialogReveal(
                    nextAttack.id,
                    Math.max(
                        lossResult.durationMs + zeroHoldMs,
                        resultRevealDelayMs
                    )
                );
            }

            perfectSolveEndTimeRef.current.delete(nextAttack.id);

            setQueuedAttacks((currentQueue: readonly PendingAttack[]) =>
                currentQueue.filter(
                    (queuedAttack) => queuedAttack.id !== nextAttack.id
                )
            );

            if (pendingAnimatedAttackIdRef.current === nextAttack.id) {
                completedReleasedSelfHitEventIdRef.current = Math.floor(
                    nextAttack.id / 1000
                );
                pendingAnimatedAttackIdRef.current = undefined;
            }

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

    return {
        damagePops,
        attackEffect,
        displayedSelfHp,
        displayedEnemyHp,
        hpImpacts,
        isResultDialogVisible,
        perfectBurst,
        selfFaultToken,
        isBlobRevealActive,
        isOpponentRevealActive,
        hasPendingSelfFaultEvent,
        overlayRef,
        selfBlobRef,
        enemyBlobRef,
        selfHealthRef,
        enemyHealthRef,
    };
}
