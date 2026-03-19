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
    onPrimeTap: (prime: Prime) => void;
    onBackspace: () => void;
    onSubmit: () => void;
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
    onPrimeTap,
    onBackspace,
    onSubmit,
    formatCountdown,
}: SingleGameScreenProps): JSX.Element {
    const isCountdownActive = soloStartCountdownValue !== null;
    const isTimeUp = soloTimeLeft === 0;

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

                <ComboQueuePanel queue={soloPrimeQueue} />

                <section className='single-controls-grid'>
                    <div className='keypad solo-keypad'>
                        {playablePrimes.map((prime) => (
                            <PrimeKeyButton
                                disabled={
                                    isTimeUp ||
                                    isSoloComboRunning ||
                                    isCountdownActive
                                }
                                key={prime}
                                onPress={onPrimeTap}
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
                                soloPrimeQueue.length === 0 ||
                                isSoloComboRunning ||
                                isCountdownActive ||
                                isTimeUp
                            }
                            onClick={onBackspace}
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
                                soloPrimeQueue.length === 0 ||
                                isSoloComboRunning ||
                                isCountdownActive
                            }
                            onClick={onSubmit}
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
