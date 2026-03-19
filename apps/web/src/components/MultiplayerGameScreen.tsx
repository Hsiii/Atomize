import {
    startTransition,
    useEffect,
    useLayoutEffect,
    useRef,
    useState,
} from 'react';
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
    onQueueChange: (queue: readonly Prime[]) => void;
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
    onQueueChange,
    onSubmit,
    formatCountdown,
}: MultiplayerGameScreenProps): JSX.Element {
    const blobRevealTotalMs = 3000;
    const isTimeUp = multiplayerTimeLeft === 0;
    const [isBlobRevealActive, setIsBlobRevealActive] = useState(false);
    const isInputDisabled =
        isMultiplayerInputDisabled || isBlobRevealActive;
    const showKeypadDisabledState =
        (isMultiplayerInputDisabled && !isMultiplayerComboRunning) ||
        isBlobRevealActive;
    const [visibleQueue, setVisibleQueue] = useState<Prime[]>(
        multiplayerPrimeQueue
    );
    const visibleQueueRef = useRef(visibleQueue);
    const previousStageIndexRef = useRef<number | null>(null);
    const currentStageIndex = currentMultiplayerPlayer?.stage.stageIndex ?? -1;

    useEffect(() => {
        visibleQueueRef.current = multiplayerPrimeQueue;
        setVisibleQueue(multiplayerPrimeQueue);
    }, [multiplayerPrimeQueue]);

    useLayoutEffect(() => {
        if (!currentMultiplayerPlayer) {
            previousStageIndexRef.current = null;
            setIsBlobRevealActive(false);
            return undefined;
        }

        if (currentStageIndex < 0) {
            previousStageIndexRef.current = null;
            setIsBlobRevealActive(false);
            return undefined;
        }

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

        const timer = window.setTimeout(() => {
            setIsBlobRevealActive(false);
        }, blobRevealTotalMs);

        return () => {
            window.clearTimeout(timer);
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
        if (isMultiplayerComboRunning || visibleQueueRef.current.length === 0) {
            return;
        }

        updateVisibleQueue(visibleQueueRef.current.slice(0, -1));
    }

    async function submitVisibleQueue() {
        if (
            isInputDisabled ||
            visibleQueueRef.current.length === 0
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

                <ComboQueuePanel queue={visibleQueue} />

                <section className='single-controls-grid multiplayer-controls-grid'>
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
                                isInputDisabled ||
                                visibleQueue.length === 0
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
