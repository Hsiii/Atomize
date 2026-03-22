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
    return (
        <main className='app-shell fullscreen-shell solo-pregame-shell'>
            <section className='screen solo-pregame-screen'>
                <header className='solo-pregame-header-band'>
                    <BackButton onBack={onBack} />
                    <h1 className='solo-pregame-title'>{uiText.soloTitle}</h1>
                </header>

                <div className='solo-pregame-hero'>
                    <Timer
                        className='solo-pregame-hero-icon'
                        strokeWidth={1.5}
                    />
                    <p className='solo-pregame-tagline'>{uiText.soloGoal}</p>
                </div>

                <div className='solo-pregame-body'>
                    <div className='solo-pregame-pb'>
                        <span className='solo-pregame-pb-title'>
                            {uiText.soloPB}
                        </span>
                        <div className='solo-pregame-pb-stat'>
                            <span className='solo-pregame-pb-label'>
                                {uiText.score}
                            </span>
                            <span className='solo-pregame-pb-value'>
                                {bestScore.score}
                            </span>
                        </div>
                        <div className='solo-pregame-pb-stat'>
                            <span className='solo-pregame-pb-label'>
                                {uiText.maxCombo}
                            </span>
                            <span className='solo-pregame-pb-value'>
                                {bestScore.maxCombo}
                            </span>
                        </div>
                    </div>

                    <div className='solo-pregame-spacer' />

                    <ActionButton
                        className='solo-pregame-start-btn'
                        onClick={onStart}
                        variant='primary'
                    >
                        {uiText.go}
                    </ActionButton>
                </div>
            </section>
        </main>
    );
}
