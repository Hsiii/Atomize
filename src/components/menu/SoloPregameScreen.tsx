import { useState, useEffect, useRef, type JSX } from 'react';
import { Timer } from 'lucide-react';

type Particle = {
    id: number | string;
    x: number;
    y: number;
    vx: number;
    vy: number;
    radius: number;
    value: string | number;
    element?: HTMLDivElement | null;
    isGo?: boolean;
};

import { uiText } from '../../app-state';
import type { BestScoreRecord } from '../../lib/app-helpers';
import { ActionButton } from '../game/ui/ActionButton';
import { BackButton } from '../ui/BackButton';
import { BurstTransition } from '../ui/BurstTransition';

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
    const [isTransitioning, setIsTransitioning] = useState(false);
    
    const handleStart = () => {
        if (isTransitioning) return;
        setIsTransitioning(true);
    };

    return (
        <main className='app-shell fullscreen-shell solo-pregame-shell'>
            {/* Transition Mount */}
            {isTransitioning && <BurstTransition onComplete={onStart} />}
            <section className='screen solo-pregame-screen'>
                <header className='page-header-band'>
                    <div className='page-title-row'>
                        <BackButton onBack={onBack} />
                        <h1 className='page-title'>{uiText.soloTitle}</h1>
                    </div>
                    <Timer className='page-hero-icon' strokeWidth={2} />
                    <p className='page-tagline'>{uiText.soloGoal}</p>
                </header>

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

                    <ActionButton
                        className='solo-pregame-start-btn'
                        onClick={handleStart}
                        variant='primary'
                    >
                        {uiText.go}
                    </ActionButton>
                </div>
            </section>
        </main>
    );
}
