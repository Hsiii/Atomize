import { startTransition, useEffect, useRef, useState } from 'react';
import type { JSX } from 'react';
import type { Prime, SoloState } from '@atomize/game-core';
import { CircleArrowUp, Delete } from 'lucide-react';

import { uiText } from '../app-state';
import { ActionButton } from './ActionButton';
import { ComboQueuePanel } from './ComboQueuePanel';
import { GameStatusHeader } from './GameStatusHeader';
import { PrimeKeyButton } from './PrimeKeyButton';
import { ScoreDialog } from './ScoreDialog';

type SingleGameScreenProps = {
    playablePrimes: Prime[];
    soloState: SoloState;
    soloTimeLeft: number;
    soloStartCountdownValue: number | null;
    soloCountdownProgress: number;
    soloPrimeQueue: Prime[];
    isSoloComboRunning: boolean;
    soloTimerPenaltyPopKey: number;
    onBack: () => void | Promise<void>;
    onQueueChange: (queue: readonly Prime[]) => void;
    onSubmit: (queue: readonly Prime[]) => void;
    formatCountdown: (totalSeconds: number) => string;
};

export function SingleGameScreen({
    playablePrimes,
    soloState,
    soloTimeLeft,
    soloStartCountdownValue,
    soloCountdownProgress,
    soloPrimeQueue,
    isSoloComboRunning,
    soloTimerPenaltyPopKey,
    onBack,
    onQueueChange,
    onSubmit,
    formatCountdown,
}: SingleGameScreenProps): JSX.Element {
    const isCountdownActive = soloStartCountdownValue !== null;
    const isTimeUp = soloTimeLeft === 0;
    const isInputDisabled = isTimeUp || isSoloComboRunning || isCountdownActive;
    const [visibleQueue, setVisibleQueue] = useState<Prime[]>(soloPrimeQueue);
    const visibleQueueRef = useRef(visibleQueue);

    useEffect(() => {
        visibleQueueRef.current = soloPrimeQueue;
        setVisibleQueue(soloPrimeQueue);
    }, [soloPrimeQueue]);

    function updateVisibleQueue(nextQueue: readonly Prime[]) {
        const normalizedQueue = [...nextQueue];

        visibleQueueRef.current = normalizedQueue;
        setVisibleQueue(normalizedQueue);
        startTransition(() => {
            onQueueChange(normalizedQueue);
        });
    }

    function handlePrimeTap(prime: Prime) {
        if (isInputDisabled) {
            return;
        }

        updateVisibleQueue([...visibleQueueRef.current, prime]);
    }

    function handleBackspace() {
        if (visibleQueueRef.current.length === 0 || isSoloComboRunning) {
            return;
        }

        updateVisibleQueue(visibleQueueRef.current.slice(0, -1));
    }

    function handleSubmit() {
        if (isInputDisabled || visibleQueueRef.current.length === 0) {
            return;
        }

        onSubmit(visibleQueueRef.current);
    }

    return (
        <main className='app-shell fullscreen-shell'>
            <section className='screen game-screen single-game-screen'>
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
                    <strong>
                        {soloStartCountdownValue === null
                            ? soloState.currentStage.remainingValue
                            : undefined}
                    </strong>
                </section>

                <ComboQueuePanel queue={visibleQueue} />

                <section className='single-controls-grid'>
                    <div className='keypad solo-keypad'>
                        {playablePrimes.map((prime) => (
                            <PrimeKeyButton
                                disabled={isInputDisabled}
                                key={prime}
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
                                visibleQueue.length === 0 ||
                                isSoloComboRunning ||
                                isCountdownActive ||
                                isTimeUp
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
                                isTimeUp ||
                                visibleQueue.length === 0 ||
                                isSoloComboRunning ||
                                isCountdownActive
                            }
                            onClick={handleSubmit}
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
                        score={soloState.score}
                    />
                ) : undefined}

                {soloStartCountdownValue === null ? undefined : (
                    <div
                        aria-atomic='true'
                        aria-live='assertive'
                        className='single-start-countdown'
                    >
                        <span
                            className='single-start-countdown-value'
                            key={soloStartCountdownValue}
                        >
                            {soloStartCountdownValue}
                        </span>
                    </div>
                )}
            </section>
        </main>
    );
}
