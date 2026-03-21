import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import type { JSX } from 'react';

import { uiText } from '../../app-state';
import type { Prime, SoloState } from '../../core';
import { usePrimeKeyboardControls } from '../../hooks/usePrimeKeyboardControls';

import './GamePlayScreen.css';

import { GameStatusHeader } from './GameStatusHeader';
import { COMBO_QUEUE_MAX_ITEMS, ComboQueuePanel } from './ui/ComboQueuePanel';
import { DesktopKeyboardHint } from './ui/DesktopKeyboardHint';
import { GameControls } from './ui/GameControls';
import { NumberBlobDisplay } from './ui/NumberBlobDisplay';
import { ScoreDialog } from './ui/ScoreDialog';

type SingleGameScreenProps = {
    playablePrimes: Prime[];
    soloState: SoloState;
    soloTimeLeft: number;
    soloCountdownProgress: number;
    soloPrimeQueue: Prime[];
    isSoloComboRunning: boolean;
    soloStageAdvanceSolvedStateKey: number;
    soloTimerPenaltyPopKey: number;
    onBack: () => void | Promise<void>;
    onSubmit: (queue: readonly Prime[]) => void;
    formatCountdown: (totalSeconds: number) => string;
};

export function SingleGameScreen({
    playablePrimes,
    soloState,
    soloTimeLeft,
    soloCountdownProgress,
    soloPrimeQueue,
    isSoloComboRunning,
    soloStageAdvanceSolvedStateKey,
    soloTimerPenaltyPopKey,
    onBack,
    onSubmit,
    formatCountdown,
}: SingleGameScreenProps): JSX.Element {
    const isTimeUp = soloTimeLeft === 0;
    const isInputDisabled = isTimeUp || isSoloComboRunning;
    const [visibleQueue, setVisibleQueue] = useState<Prime[]>(soloPrimeQueue);
    const visibleQueueRef = useRef(visibleQueue);
    const scorePopIdRef = useRef(0);
    const [scorePops, setScorePops] = useState<
        Array<{ id: number; delta: number }>
    >([]);
    const previousScoreRef = useRef(soloState.score);
    const keyboard = usePrimeKeyboardControls({
        canSubmit: !isInputDisabled && visibleQueue.length > 0,
        isComboRunning: isSoloComboRunning,
        isInputDisabled,
        onBackspaceQueue: () => {
            if (visibleQueueRef.current.length === 0) {
                return;
            }

            setLocalQueue(visibleQueueRef.current.slice(0, -1));
        },
        onPrimeTap: (prime) => {
            if (visibleQueueRef.current.length >= COMBO_QUEUE_MAX_ITEMS) {
                return;
            }

            setLocalQueue([...visibleQueueRef.current, prime]);
        },
        onSubmit: () => {
            if (visibleQueueRef.current.length === 0) {
                return;
            }

            onSubmit(visibleQueueRef.current);
        },
        playablePrimes,
        queueLength: visibleQueue.length,
    });

    useLayoutEffect(() => {
        visibleQueueRef.current = soloPrimeQueue;
        setVisibleQueue(soloPrimeQueue);
    }, [soloPrimeQueue]);

    useEffect(() => {
        const delta = soloState.score - previousScoreRef.current;
        previousScoreRef.current = soloState.score;

        if (delta <= 0) {
            return undefined;
        }

        scorePopIdRef.current++;
        const id = scorePopIdRef.current;
        setScorePops(
            (current: ReadonlyArray<{ id: number; delta: number }>) => [
                ...current,
                { id, delta },
            ]
        );

        const timer = globalThis.setTimeout(
            () => {
                setScorePops(
                    (current: ReadonlyArray<{ id: number; delta: number }>) =>
                        current.filter((pop) => pop.id !== id)
                );
            },
            900,
            undefined
        );

        return () => {
            globalThis.clearTimeout(timer);
        };
    }, [soloState.score]);

    function setLocalQueue(nextQueue: readonly Prime[]) {
        const normalizedQueue = [...nextQueue];

        visibleQueueRef.current = normalizedQueue;
        setVisibleQueue(normalizedQueue);
    }

    return (
        <main className='app-shell fullscreen-shell'>
            <section className='screen game-screen single-game-screen'>
                <DesktopKeyboardHint />

                <GameStatusHeader
                    countdownProgress={soloCountdownProgress}
                    formatCountdown={formatCountdown}
                    onBack={onBack}
                    penaltyKey={soloTimerPenaltyPopKey}
                    penaltyText={uiText.timerPenalty}
                    score={soloState.score}
                    timeLeft={soloTimeLeft}
                />

                <section aria-live='polite' className='single-value-display'>
                    <NumberBlobDisplay
                        isComboRunning={isSoloComboRunning}
                        mode='solo'
                        targetId={soloStageAdvanceSolvedStateKey}
                        value={soloState.currentStage.remainingValue}
                    />
                    {scorePops.map((pop) => (
                        <span
                            aria-hidden='true'
                            className='solo-score-pop'
                            key={pop.id}
                        >
                            +{pop.delta}
                        </span>
                    ))}
                </section>

                <section className='single-controls-grid'>
                    <ComboQueuePanel queue={visibleQueue} />

                    <GameControls
                        backspaceDisabled={
                            isSoloComboRunning ||
                            isTimeUp ||
                            (visibleQueue.length === 0 &&
                                keyboard.bufferedPrimeInput === '')
                        }
                        onBackspace={keyboard.handleBackspace}
                        onPrimeTap={keyboard.handlePrimeTap}
                        onSubmit={keyboard.handleSubmit}
                        primes={playablePrimes}
                        submitDisabled={
                            isTimeUp ||
                            visibleQueue.length === 0 ||
                            isSoloComboRunning
                        }
                    />
                </section>

                {isTimeUp ? (
                    <ScoreDialog
                        comboCount={soloState.maxCombo}
                        onReturnHome={onBack}
                        score={soloState.score}
                        title={uiText.timeUp}
                    />
                ) : undefined}
            </section>
        </main>
    );
}
