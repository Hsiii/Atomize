import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import type { JSX } from 'react';
import type { Prime, RoomPlayer, RoomSnapshot } from '@atomize/game-core';
import { CircleArrowUp, Delete } from 'lucide-react';

import { uiText } from '../app-state';

import './GamePlayScreen.css';
import './MultiplayerGameScreen.css';

import { ActionButton } from './ActionButton';
import { ComboQueuePanel } from './ComboQueuePanel';
import { GameStatusHeader } from './GameStatusHeader';
import { NumberBlobDisplay } from './NumberBlobDisplay';
import { PrimeKeyButton } from './PrimeKeyButton';
import { ScoreDialog } from './ScoreDialog';

type MultiplayerGameScreenProps = {
    playablePrimes: Prime[];
    multiplayerTimeLeft: number;
    multiplayerCountdownProgress: number;
    multiplayerScore: number;
    currentMultiplayerPlayer: RoomPlayer | null;
    multiplayerSnapshot: RoomSnapshot | null;
    multiplayerPrimeQueue: Prime[];
    isMultiplayerInputDisabled: boolean;
    isMultiplayerComboRunning: boolean;
    roomId: string;
    onBack: () => void | Promise<void>;
    onSubmit: (queue: readonly Prime[]) => Promise<void>;
    formatCountdown: (totalSeconds: number) => string;
};

export function MultiplayerGameScreen({
    playablePrimes,
    multiplayerTimeLeft,
    multiplayerCountdownProgress,
    multiplayerScore,
    currentMultiplayerPlayer,
    multiplayerSnapshot: _multiplayerSnapshot,
    multiplayerPrimeQueue,
    isMultiplayerInputDisabled,
    isMultiplayerComboRunning,
    roomId: _roomId,
    onBack,
    onSubmit,
    formatCountdown,
}: MultiplayerGameScreenProps): JSX.Element {
    const blobRevealTotalMs = 3000;
    const keyboardDigitBufferWindowMs = 250;
    const isTimeUp = multiplayerTimeLeft === 0;
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
    const currentStageIndex = currentMultiplayerPlayer?.stage.stageIndex ?? -1;

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
                <GameStatusHeader
                    countdownProgress={multiplayerCountdownProgress}
                    formatCountdown={formatCountdown}
                    headerClassName='multiplayer-top-bar'
                    onBack={onBack}
                    score={multiplayerScore}
                    scoreClassName='multiplayer-score-pill'
                    timeLeft={multiplayerTimeLeft}
                />

                <section
                    aria-live='polite'
                    className='single-value-display multiplayer-value-display'
                >
                    <NumberBlobDisplay
                        isComboRunning={isMultiplayerComboRunning}
                        isStageRevealActive={isBlobRevealActive}
                        mode='multiplayer'
                        stageIndex={currentMultiplayerPlayer?.stage.stageIndex}
                        value={currentMultiplayerPlayer?.stage.remainingValue}
                    />
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

                {isTimeUp ? (
                    <ScoreDialog
                        onReturnHome={onBack}
                        score={multiplayerScore}
                    />
                ) : undefined}
            </section>
        </main>
    );
}
