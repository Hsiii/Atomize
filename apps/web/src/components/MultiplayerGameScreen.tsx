import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import type { CSSProperties, JSX } from 'react';
import type { Prime, RoomPlayer, RoomSnapshot } from '@atomize/game-core';
import { ArrowLeft, CircleArrowUp, Delete } from 'lucide-react';

import { uiText } from '../app-state';

import './GamePlayScreen.css';
import './MultiplayerGameScreen.css';

import { ActionButton } from './ActionButton';
import { ComboQueuePanel } from './ComboQueuePanel';
import { NumberBlobDisplay } from './NumberBlobDisplay';
import { PrimeKeyButton } from './PrimeKeyButton';
import { ScoreDialog } from './ScoreDialog';

type DamagePop = {
    id: string;
    side: 'enemy' | 'self';
    value: number;
};

type AttackParticle = {
    id: number;
    side: 'enemy' | 'self';
    x: number;
    y: number;
    size: number;
    opacity: number;
};

type AttackEffectState = {
    id: number;
    particles: AttackParticle[];
};

type PendingAttack = {
    id: number;
    damage: number;
    sourceSide: 'enemy' | 'self';
    targetHp: number;
    targetSide: 'enemy' | 'self';
};

type MultiplayerGameScreenProps = {
    playablePrimes: Prime[];
    currentMultiplayerPlayer: RoomPlayer | null;
    multiplayerSnapshot: RoomSnapshot | null;
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
    const isMatchFinished = multiplayerSnapshot?.status === 'finished';
    const [isBlobRevealActive, setIsBlobRevealActive] = useState(false);
    const hasInitializedStageRef = useRef(false);
    const isInputDisabled = isMultiplayerInputDisabled || isBlobRevealActive;
    const showKeypadDisabledState =
        (isMultiplayerInputDisabled && !isMultiplayerComboRunning) ||
        isBlobRevealActive;
    const [visibleQueue, setVisibleQueue] = useState<Prime[]>(
        multiplayerPrimeQueue
    );
    const visibleQueueRef = useRef(visibleQueue);
    const digitBufferRef = useRef('');
    const digitBufferTimerRef = useRef<number | undefined>(undefined);
    const previousStageIndexRef = useRef<number | undefined>(undefined);
    const previousOpponentStageIndexRef = useRef<number | undefined>(undefined);
    const currentStageIndex = currentMultiplayerPlayer?.stage.stageIndex ?? -1;
    const opponentPlayer = multiplayerSnapshot?.players.find(
        (player) => player.id !== currentMultiplayerPlayer?.id
    );
    const [isOpponentRevealActive, setIsOpponentRevealActive] = useState(false);
    const [damagePops, setDamagePops] = useState<DamagePop[]>([]);
    const [attackEffect, setAttackEffect] = useState<AttackEffectState>();
    const [queuedAttacks, setQueuedAttacks] = useState<PendingAttack[]>([]);
    const [activeAttackId, setActiveAttackId] = useState<number>();
    const [displayedSelfHp, setDisplayedSelfHp] = useState(
        currentMultiplayerPlayer?.hp ?? 0
    );
    const [displayedEnemyHp, setDisplayedEnemyHp] = useState(
        opponentPlayer?.hp ?? 0
    );
    const previousEventIdRef = useRef<number | undefined>(undefined);
    const animationFrameRef = useRef<number | undefined>(undefined);
    const overlayRef = useRef<HTMLDivElement | null>(null);
    const selfBlobRef = useRef<HTMLDivElement | null>(null);
    const enemyBlobRef = useRef<HTMLDivElement | null>(null);
    const selfHealthRef = useRef<HTMLDivElement | null>(null);
    const enemyHealthRef = useRef<HTMLDivElement | null>(null);
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
            setIsBlobRevealActive(false);
            return undefined;
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
        const opponentStageIndex = opponentPlayer?.stage.stageIndex;

        if (opponentStageIndex === undefined) {
            previousOpponentStageIndexRef.current = undefined;
            setIsOpponentRevealActive(false);
            return undefined;
        }

        if (previousOpponentStageIndexRef.current === undefined) {
            previousOpponentStageIndexRef.current = opponentStageIndex;
            setIsOpponentRevealActive(false);
            return undefined;
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
    }, [blobRevealTotalMs, opponentPlayer?.stage.stageIndex]);

    useEffect(
        () => () => {
            if (animationFrameRef.current !== undefined) {
                cancelAnimationFrame(animationFrameRef.current);
            }
        },
        []
    );

    useEffect(() => {
        if (!currentMultiplayerPlayer || !opponentPlayer) {
            setDisplayedSelfHp(currentMultiplayerPlayer?.hp ?? 0);
            setDisplayedEnemyHp(opponentPlayer?.hp ?? 0);
            setQueuedAttacks([]);
            setActiveAttackId(undefined);
            return;
        }

        if (
            queuedAttacks.length > 0 ||
            activeAttackId !== undefined ||
            hasPendingAttackEvent
        ) {
            return;
        }

        setDisplayedSelfHp(currentMultiplayerPlayer.hp);
        setDisplayedEnemyHp(opponentPlayer.hp);
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

            if (side === 'self') {
                setDisplayedSelfHp(lastEvent.sourceHp);
            } else {
                setDisplayedEnemyHp(lastEvent.sourceHp);
            }
            showDamagePop(side, lastEvent.damage);
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
        if (loserSide === 'self') {
            setDisplayedSelfHp(lastEvent.loserHp);
        } else {
            setDisplayedEnemyHp(lastEvent.loserHp);
        }
        showDamagePop(loserSide, lastEvent.damage);
    }, [currentMultiplayerPlayer?.id, multiplayerSnapshot?.lastEvent]);

    useEffect(() => {
        if (activeAttackId !== undefined || queuedAttacks.length === 0) {
            return;
        }

        const nextAttack = queuedAttacks[0];

        const completeAttack = () => {
            if (nextAttack.targetSide === 'self') {
                setDisplayedSelfHp(nextAttack.targetHp);
            } else {
                setDisplayedEnemyHp(nextAttack.targetHp);
            }

            showDamagePop(nextAttack.targetSide, nextAttack.damage);
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
    }

    function queuePrime(prime: Prime) {
        if (isInputDisabled) {
            return;
        }

        setLocalQueue([...visibleQueueRef.current, prime]);
    }

    function scheduleBufferedPrimeCommit(nextBuffer: string) {
        digitBufferRef.current = nextBuffer;

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
        if (isMultiplayerComboRunning || visibleQueueRef.current.length === 0) {
            return;
        }

        setLocalQueue(visibleQueueRef.current.slice(0, -1));
    }

    async function submitVisibleQueue() {
        if (isInputDisabled || visibleQueueRef.current.length === 0) {
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

    function showDamagePop(side: 'enemy' | 'self', value: number) {
        const id = globalThis.crypto.randomUUID();

        setDamagePops((currentPops: readonly DamagePop[]) => [
            ...currentPops,
            { id, side, value },
        ]);

        globalThis.setTimeout(
            () => {
                setDamagePops((currentPops: readonly DamagePop[]) =>
                    currentPops.filter((currentPop) => currentPop.id !== id)
                );
            },
            780,
            undefined
        );
    }

    function startAttackEffect(
        sourceSide: 'enemy' | 'self',
        targetSide: 'enemy' | 'self',
        id: number,
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
        const controlPoint = {
            x: (startPoint.x + endPoint.x) / 2 + 42 * horizontalDirection,
            y: Math.min(startPoint.y, endPoint.y) - 88,
        };
        const particleSeeds = [0, 0.12, 0.24, 0.36, 0.48, 0.6];
        const animationStart = performance.now();
        const durationMs = 1080;

        if (animationFrameRef.current !== undefined) {
            cancelAnimationFrame(animationFrameRef.current);
        }

        const animate = (timestamp: number) => {
            const elapsed = timestamp - animationStart;
            const baseProgress = Math.min(1, elapsed / durationMs);
            const particles = particleSeeds
                .map((seed, index) => {
                    const shifted = Math.max(
                        0,
                        Math.min(1, (baseProgress - seed) / (1 - seed))
                    );

                    if (shifted <= 0 || shifted >= 1) {
                        return undefined;
                    }

                    const accelerated = shifted * shifted;
                    const x = quadraticBezier(
                        startPoint.x,
                        controlPoint.x + (index - 2.5) * 10,
                        endPoint.x,
                        accelerated
                    );
                    const y = quadraticBezier(
                        startPoint.y,
                        controlPoint.y - (index % 2 === 0 ? 12 : -6),
                        endPoint.y,
                        accelerated
                    );

                    return {
                        id: index,
                        side: targetSide,
                        x,
                        y,
                        size: 12 - index * 0.8,
                        opacity: 1 - shifted * 0.72,
                    } satisfies AttackParticle;
                })
                .filter(
                    (particle): particle is AttackParticle =>
                        particle !== undefined
                );

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
                    isBlobRevealActive ||
                    isMultiplayerComboRunning ||
                    visibleQueueRef.current.length === 0
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
                <button
                    aria-label={uiText.back}
                    className='multiplayer-back-button'
                    onClick={() => {
                        Promise.resolve(onBack()).catch(() => undefined);
                    }}
                    type='button'
                >
                    <ArrowLeft aria-hidden='true' className='control-icon' />
                </button>

                <section className='multiplayer-board' ref={overlayRef}>
                    <div className='multiplayer-column multiplayer-column-enemy'>
                        <BattleHpBar
                            damagePop={damagePops.find(
                                (damagePop) => damagePop.side === 'enemy'
                            )}
                            hp={displayedEnemyHp}
                            label={opponentPlayer?.name ?? uiText.opponent}
                            maxHp={multiplayerSnapshot?.maxHp ?? 1}
                            outerRef={enemyHealthRef}
                            side='enemy'
                        />
                        <div
                            className='multiplayer-blob-anchor'
                            ref={enemyBlobRef}
                        >
                            <NumberBlobDisplay
                                isComboRunning={false}
                                isStageRevealActive={isOpponentRevealActive}
                                mode='multiplayer'
                                size='enemy'
                                stageIndex={opponentPlayer?.stage.stageIndex}
                                value={opponentPlayer?.stage.remainingValue}
                            />
                        </div>
                    </div>

                    <div className='multiplayer-column multiplayer-column-self'>
                        <BattleHpBar
                            damagePop={damagePops.find(
                                (damagePop) => damagePop.side === 'self'
                            )}
                            hp={displayedSelfHp}
                            label={uiText.you}
                            maxHp={multiplayerSnapshot?.maxHp ?? 1}
                            outerRef={selfHealthRef}
                            side='self'
                        />
                        <div
                            className='multiplayer-blob-anchor'
                            ref={selfBlobRef}
                        >
                            <NumberBlobDisplay
                                isComboRunning={isMultiplayerComboRunning}
                                isStageRevealActive={isBlobRevealActive}
                                mode='multiplayer'
                                size='self'
                                stageIndex={
                                    currentMultiplayerPlayer?.stage.stageIndex
                                }
                                value={
                                    currentMultiplayerPlayer?.stage
                                        .remainingValue
                                }
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
                                    className={`multiplayer-attack-particle multiplayer-attack-particle-${particle.side}`}
                                    key={`${attackEffect.id}-${particle.id}`}
                                    style={
                                        {
                                            '--particle-size': `${particle.size}px`,
                                            '--particle-x': `${particle.x}px`,
                                            '--particle-y': `${particle.y}px`,
                                            '--particle-opacity':
                                                particle.opacity,
                                        } as CSSProperties
                                    }
                                />
                            ))}
                        </div>
                    ) : undefined}
                </section>

                <section className='single-controls-grid multiplayer-controls-grid'>
                    <ComboQueuePanel queue={visibleQueue} />

                    <div className='keypad solo-keypad multiplayer-keypad'>
                        {playablePrimes.map((prime) => (
                            <PrimeKeyButton
                                interactionDisabled={isInputDisabled}
                                key={`room-${prime}`}
                                onPress={handlePrimeTap}
                                prime={prime}
                                visuallyDisabled={showKeypadDisabledState}
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
                                isBlobRevealActive ||
                                isMultiplayerComboRunning ||
                                visibleQueue.length === 0
                            }
                            onClick={handleBackspace}
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
                                isInputDisabled || visibleQueue.length === 0
                            }
                            onClick={handleSubmitClick}
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
                </section>

                {isMatchFinished ? (
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
    damagePop: DamagePop | undefined;
    hp: number;
    label: string;
    maxHp: number;
    outerRef: React.RefObject<HTMLDivElement | null>;
    side: 'enemy' | 'self';
};

function BattleHpBar({
    damagePop,
    hp,
    label,
    maxHp,
    outerRef,
    side,
}: BattleHpBarProps): JSX.Element {
    const hpRatio = Math.max(0, Math.min(100, (hp / Math.max(maxHp, 1)) * 100));

    return (
        <div
            className={`multiplayer-hp-bar multiplayer-hp-bar-${side}`}
            ref={outerRef}
        >
            <div className='multiplayer-hp-copy'>
                <span className='label'>{label}</span>
                <strong>
                    {hp}/{maxHp} {uiText.healthUnit}
                </strong>
            </div>

            <div className='multiplayer-hp-track'>
                <span
                    className='multiplayer-hp-fill'
                    style={{ width: `${hpRatio}%` }}
                />
            </div>

            {damagePop ? (
                <span className='multiplayer-damage-pop' key={damagePop.id}>
                    -{damagePop.value}
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
