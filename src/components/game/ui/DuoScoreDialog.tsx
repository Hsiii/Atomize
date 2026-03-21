import type { CSSProperties, JSX } from 'react';

import { uiText } from '../../../app-state';

import './DuoScoreDialog.css';

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

type DuoPlayerStats = {
    name: string;
    maxCombo: number;
    atomized: number;
    isWinner: boolean;
};

type DuoScoreDialogProps = {
    currentPlayer: DuoPlayerStats;
    opponent: DuoPlayerStats;
    onReturnHome: () => void | Promise<void>;
    title: string;
};

export function DuoScoreDialog({
    currentPlayer,
    opponent,
    onReturnHome,
    title,
}: DuoScoreDialogProps): JSX.Element {
    const isVictory = title === uiText.victory;

    function handleReturnHomeClick() {
        Promise.resolve(onReturnHome()).catch(() => undefined);
    }

    return (
        <div className='duo-score-dialog-scrim' role='presentation'>
            {isVictory ? (
                <div aria-hidden='true' className='duo-score-confetti-layer'>
                    {victoryConfetti.map((particle, index) => (
                        <span
                            className='duo-score-confetti-dot'
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
                aria-labelledby='duo-score-dialog-title'
                aria-modal='true'
                className={`duo-score-dialog${isVictory ? ' duo-score-dialog--victory' : ''}${title === uiText.defeat ? ' duo-score-dialog--defeat' : ''}`}
                role='dialog'
            >
                <header className='duo-score-dialog-header'>
                    <span
                        className='duo-score-dialog-title'
                        id='duo-score-dialog-title'
                    >
                        {title}
                    </span>
                </header>
                <div className='duo-score-players'>
                    <PlayerColumn player={currentPlayer} />
                    <div className='duo-score-player-divider' />
                    <PlayerColumn player={opponent} />
                </div>
                <ActionButton onClick={handleReturnHomeClick} variant='primary'>
                    {uiText.returnHome}
                </ActionButton>
            </section>
        </div>
    );
}

function PlayerColumn({ player }: { player: DuoPlayerStats }): JSX.Element {
    const modifier = player.isWinner
        ? ' duo-score-player--winner'
        : ' duo-score-player--loser';

    return (
        <div className={`duo-score-player${modifier}`}>
            <p className='duo-score-player-name'>
                {player.isWinner ? (
                    <svg
                        aria-hidden='true'
                        className='duo-score-crown'
                        fill='var(--color-gold)'
                        viewBox='0 0 24 24'
                    >
                        <path d='M2.5 19h19v2h-19zm19.57-9.36c-.21-.8-1.04-1.28-1.84-1.06L14.92 10 12 3.51 9.08 10l-5.31-1.42c-.8-.21-1.62.27-1.83 1.07-.05.2-.06.4-.02.59l1.54 6.76h17.08l1.54-6.76c.09-.19.08-.39.03-.6z' />
                    </svg>
                ) : undefined}
                {player.name}
            </p>
            <dl className='duo-score-stat-list'>
                <div className='duo-score-stat-row'>
                    <dt className='duo-score-stat-label'>{uiText.atomized}</dt>
                    <dd className='duo-score-stat-value'>{player.atomized}</dd>
                </div>
                <div className='duo-score-stat-row'>
                    <dt className='duo-score-stat-label'>{uiText.maxCombo}</dt>
                    <dd className='duo-score-stat-value'>{player.maxCombo}</dd>
                </div>
            </dl>
        </div>
    );
}
