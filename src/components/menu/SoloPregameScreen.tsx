import { useState } from 'react';
import type { JSX } from 'react';
import { Timer } from 'lucide-react';

import { uiText } from '../../app-state';
import type { BestScoreRecord } from '../../lib/app-helpers';
import { ActionButton } from '../game/ui/ActionButton';
import { BackButton } from '../ui/BackButton';

import './SoloPregameScreen.css';

type SoloPregameScreenProps = {
    bestScore: BestScoreRecord;
    onBack: () => void;
    onStart: () => void;
};

export function SoloPregameScreen({
    bestScore,
    onBack,
    onStart,
}: SoloPregameScreenProps): JSX.Element {
    const [countdownActive, setCountdownActive] = useState(false);
    const [countdownValue, setCountdownValue] = useState(3);

    const hasBestScore = bestScore.score > 0;

    function handleStart() {
        setCountdownActive(true);
        setCountdownValue(3);

        let remaining = 3;

        function scheduleTick() {
            globalThis.setTimeout(
                () => {
                    remaining--;

                    if (remaining <= 0) {
                        onStart();
                        return;
                    }

                    setCountdownValue(remaining);
                    scheduleTick();
                },
                700,
                undefined
            );
        }

        scheduleTick();
    }

    if (countdownActive) {
        return (
            <main className='app-shell fullscreen-shell solo-pregame-shell'>
                <section className='screen solo-pregame-screen solo-countdown-screen'>
                    <span className='countdown-number' key={countdownValue}>
                        {countdownValue}
                    </span>
                </section>
            </main>
        );
    }

    return (
        <main className='app-shell fullscreen-shell solo-pregame-shell'>
            <section className='screen solo-pregame-screen'>
                <header className='solo-pregame-header'>
                    <BackButton onBack={onBack} />
                    <Timer
                        aria-hidden='true'
                        className='solo-pregame-mode-icon'
                    />
                    <h1 className='solo-pregame-title'>{uiText.soloTitle}</h1>
                </header>

                <div className='solo-pregame-body'>
                    {hasBestScore ? (
                        <div className='solo-pregame-best-card'>
                            <span className='solo-pregame-best-label'>
                                {uiText.bestScore}
                            </span>
                            <span className='solo-pregame-best-value'>
                                {bestScore.score}
                            </span>
                        </div>
                    ) : undefined}

                    <p className='solo-pregame-goal'>{uiText.soloGoal}</p>

                    <ActionButton
                        className='solo-pregame-start-btn'
                        onClick={handleStart}
                        variant='primary'
                    >
                        {uiText.start}
                    </ActionButton>
                </div>
            </section>
        </main>
    );
}
