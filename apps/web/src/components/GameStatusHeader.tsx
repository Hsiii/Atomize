import type { JSX } from 'react';

import { uiText } from '../app-state';

type GameStatusHeaderProps = {
    countdownProgress: number;
    timeLeft: number;
    score: number;
    formatCountdown: (totalSeconds: number) => string;
    headerClassName?: string;
    scoreClassName?: string;
    penaltyKey?: number;
    penaltyText?: string;
};

export function GameStatusHeader({
    countdownProgress,
    timeLeft,
    score,
    formatCountdown,
    headerClassName,
    scoreClassName,
    penaltyKey,
    penaltyText,
}: GameStatusHeaderProps): JSX.Element {
    const headerClasses = ['top-bar', 'single-top-bar', headerClassName]
        .filter(Boolean)
        .join(' ');
    const scoreClasses = ['single-score-pill', scoreClassName]
        .filter(Boolean)
        .join(' ');

    return (
        <header className={headerClasses}>
            <div
                aria-label={`${uiText.timer}: ${formatCountdown(timeLeft)}`}
                className='single-timer-shell'
            >
                <div className='single-timer-bar'>
                    <span
                        className='single-timer-fill'
                        style={{ width: `${countdownProgress}%` }}
                    />
                </div>
                <span className='single-timer-text'>
                    {formatCountdown(timeLeft)}
                </span>
                {penaltyKey && penaltyText ? (
                    <span
                        aria-hidden='true'
                        className='single-timer-penalty'
                        key={penaltyKey}
                    >
                        {penaltyText}
                    </span>
                ) : undefined}
            </div>

            <div
                aria-label={`${uiText.score}: ${score}`}
                className={scoreClasses}
            >
                <span className='single-score-label'>{uiText.score}</span>
                <strong>{score}</strong>
            </div>
        </header>
    );
}
