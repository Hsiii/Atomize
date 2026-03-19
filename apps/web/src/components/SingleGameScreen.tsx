import {
    startTransition,
    useEffect,
    useLayoutEffect,
    useRef,
    useState,
} from 'react';
import type { JSX } from 'react';
import type { Prime, SoloState } from '@atomize/game-core';
import { CircleArrowUp, Delete } from 'lucide-react';

import { uiText } from '../app-state';

import './GamePlayScreen.css';

import { ActionButton } from './ActionButton';
import { ComboQueuePanel } from './ComboQueuePanel';
import { GameStatusHeader } from './GameStatusHeader';
import { NumberBlobDisplay } from './NumberBlobDisplay';
import { PrimeKeyButton } from './PrimeKeyButton';
import { ScoreDialog } from './ScoreDialog';

type SingleGameScreenProps = {
    playablePrimes: Prime[];
    soloState: SoloState;
    soloTimeLeft: number;
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
    soloCountdownProgress,
    soloPrimeQueue,
    isSoloComboRunning,
    soloTimerPenaltyPopKey,
    onBack,
    onQueueChange,
    onSubmit,
    formatCountdown,
}: SingleGameScreenProps): JSX.Element {
    const blobRevealTotalMs = 3000;
    const isTimeUp = soloTimeLeft === 0;
    const currentStageIndex = soloState.currentStage.stageIndex;
    const [isBlobRevealActive, setIsBlobRevealActive] = useState(false);
    const previousStageIndexRef = useRef<number | null>(null);
    const isInputDisabled =
        isTimeUp || isSoloComboRunning || isBlobRevealActive;
    const showKeypadDisabledState = isTimeUp || isBlobRevealActive;
    const [visibleQueue, setVisibleQueue] = useState<Prime[]>(soloPrimeQueue);
    const visibleQueueRef = useRef(visibleQueue);

    useEffect(() => {
        visibleQueueRef.current = soloPrimeQueue;
        setVisibleQueue(soloPrimeQueue);
    }, [soloPrimeQueue]);

    useLayoutEffect(() => {
        if (previousStageIndexRef.current === null) {
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
                    <NumberBlobDisplay
                        isComboRunning={isSoloComboRunning}
                        isStageRevealActive={isBlobRevealActive}
                        mode='solo'
                        stageIndex={currentStageIndex}
                        value={soloState.currentStage.remainingValue}
                    />
                </section>

                <section className='single-controls-grid'>
                    <ComboQueuePanel queue={visibleQueue} />

                    <div className='keypad solo-keypad'>
                        {playablePrimes.map((prime) => (
                            <PrimeKeyButton
                                interactionDisabled={isInputDisabled}
                                key={prime}
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
                                visibleQueue.length === 0 ||
                                isSoloComboRunning ||
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
                                isBlobRevealActive
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
            </section>
        </main>
    );
}
