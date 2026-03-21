import type { JSX } from 'react';
import { ArrowLeft } from 'lucide-react';

import { uiText } from '../../app-state';

import './GameStatusHeader.css';

type GameStatusHeaderProps = {
    onBack?: () => void | Promise<void>;
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
    onBack,
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

    function handleBackClick() {
        if (!onBack) {
            return;
        }

        Promise.resolve(onBack()).catch(() => undefined);
    }

    return (
        <header className={headerClasses}>
            <div className='single-top-bar-side single-top-bar-side-start'>
                {onBack ? (
                    <button
                        aria-label={uiText.back}
                        className='top-bar-back-button'
                        onClick={handleBackClick}
                        type='button'
                    >
                        <ArrowLeft
                            aria-hidden='true'
                            className='control-icon'
                        />
                    </button>
                ) : undefined}
            </div>

            <div
                aria-label={`${uiText.timer}: ${formatCountdown(timeLeft)}`}
                className='single-timer-shell'
            >
                <span aria-hidden='true' className='single-timer-penalty-lane'>
                    {penaltyKey && penaltyText ? (
                        <span className='single-timer-penalty' key={penaltyKey}>
                            {penaltyText}
                        </span>
                    ) : undefined}
                </span>
                <div className='single-timer-bar'>
                    <span
                        className='single-timer-fill'
                        style={{ width: `${countdownProgress}%` }}
                    />
                </div>
            </div>

            <div className='single-top-bar-side single-top-bar-side-end'>
                <div
                    aria-label={`${uiText.score}: ${score} ${uiText.scoreUnit}`}
                    className={scoreClasses}
                >
                    <strong>{score}</strong>
                    <span className='single-score-unit'>
                        {uiText.scoreUnit}
                    </span>
                </div>
            </div>
        </header>
    );
}
