import type { CSSProperties, JSX } from 'react';

import { uiText } from '../../../app-state';

import './ScoreDialog.css';

import { ActionButton } from './ActionButton';

type ConfettiDot = {
    angle: number;
    distance: number;
    size: number;
    delay: number;
};

const victoryConfetti: readonly ConfettiDot[] = [
    { angle: -30, distance: 16, size: 0.7, delay: 0.12 },
    { angle: 25, distance: 18, size: 0.55, delay: 0.18 },
    { angle: 72, distance: 15, size: 0.65, delay: 0.1 },
    { angle: -80, distance: 17, size: 0.6, delay: 0.22 },
    { angle: 120, distance: 14.5, size: 0.68, delay: 0.15 },
    { angle: -125, distance: 16.5, size: 0.58, delay: 0.2 },
    { angle: 160, distance: 13.5, size: 0.72, delay: 0.13 },
    { angle: -165, distance: 19, size: 0.5, delay: 0.25 },
];

type ScoreDialogProps = {
    comboCount: number;
    onReturnHome: () => void | Promise<void>;
    score?: number;
    title: string;
};

export function ScoreDialog({
    comboCount,
    onReturnHome,
    score,
    title,
}: ScoreDialogProps): JSX.Element {
    const hasScoreStat = score !== undefined;
    const isVictory = title === uiText.victory;

    function handleReturnHomeClick() {
        Promise.resolve(onReturnHome()).catch(() => undefined);
    }

    return (
        <div className='score-dialog-scrim' role='presentation'>
            {isVictory ? (
                <div aria-hidden='true' className='score-dialog-confetti-layer'>
                    {victoryConfetti.map((particle, index) => (
                        <span
                            className='score-dialog-confetti-dot'
                            key={index}
                            style={
                                {
                                    '--confetti-angle': `${particle.angle}deg`,
                                    '--confetti-distance': `${particle.distance}rem`,
                                    '--confetti-size': `${particle.size}rem`,
                                    '--confetti-delay': `${particle.delay}s`,
                                } as CSSProperties
                            }
                        />
                    ))}
                </div>
            ) : undefined}
            <section
                aria-labelledby='score-dialog-title'
                aria-modal='true'
                className={`score-dialog${hasScoreStat ? ' score-dialog--split' : ''}${title === uiText.victory ? ' score-dialog--victory' : ''}${title === uiText.defeat ? ' score-dialog--defeat' : ''}`}
                role='dialog'
            >
                <header className='score-dialog-header'>
                    <span
                        className='score-dialog-title'
                        id='score-dialog-title'
                    >
                        {title}
                    </span>
                </header>
                <div
                    className={`score-dialog-stats${hasScoreStat ? ' score-dialog-stats--split' : ''}`}
                >
                    {score === undefined ? undefined : (
                        <section
                            aria-label={uiText.score}
                            className='score-dialog-stat score-dialog-stat--score'
                        >
                            <p className='score-dialog-summary'>
                                {uiText.score}
                            </p>
                            <div className='score-dialog-stat-value-block'>
                                <strong className='score-dialog-stat-value'>
                                    {score}
                                </strong>
                            </div>
                        </section>
                    )}
                    <section
                        aria-label={uiText.maxCombo}
                        className={`score-dialog-stat${hasScoreStat ? ' score-dialog-stat--combo' : ''}`}
                    >
                        <p className='score-dialog-summary'>
                            {uiText.maxCombo}
                        </p>
                        {hasScoreStat ? (
                            <div className='score-dialog-stat-value-block'>
                                <strong className='score-dialog-stat-value'>
                                    {comboCount}
                                </strong>
                            </div>
                        ) : (
                            <div className='score-dialog-combo-ring'>
                                <strong className='score-dialog-combo-value'>
                                    x{comboCount}
                                </strong>
                            </div>
                        )}
                    </section>
                </div>
                <ActionButton onClick={handleReturnHomeClick} variant='primary'>
                    {uiText.returnHome}
                </ActionButton>
            </section>
        </div>
    );
}
