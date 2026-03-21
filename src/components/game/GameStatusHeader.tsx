import { useLayoutEffect, useRef, useState } from 'react';
import type { CSSProperties, JSX } from 'react';
import { ArrowLeft, Pause } from 'lucide-react';

import { uiText } from '../../app-state';

import './GameStatusHeader.css';

type GameStatusHeaderProps = {
    onBack?: () => void | Promise<void>;
    onPause?: () => void;
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
    onPause,
    countdownProgress,
    timeLeft,
    score,
    formatCountdown,
    headerClassName,
    scoreClassName,
    penaltyKey,
    penaltyText,
}: GameStatusHeaderProps): JSX.Element {
    const backButtonRef = useRef<HTMLButtonElement | null>(null);
    const scorePillRef = useRef<HTMLDivElement | null>(null);
    const [sideWidth, setSideWidth] = useState<number | undefined>(undefined);
    const headerClasses = ['top-bar', 'single-top-bar', headerClassName]
        .filter(Boolean)
        .join(' ');
    const scoreClasses = ['single-score-pill', scoreClassName]
        .filter(Boolean)
        .join(' ');
    const headerStyle =
        sideWidth === undefined
            ? undefined
            : ({
                  '--single-top-bar-side-width': `${sideWidth}px`,
              } as CSSProperties);

    useLayoutEffect(() => {
        function measureSideWidth() {
            const backButtonWidth =
                backButtonRef.current?.getBoundingClientRect().width ?? 0;
            const scorePillWidth =
                scorePillRef.current?.getBoundingClientRect().width ?? 0;

            setSideWidth(Math.ceil(Math.max(backButtonWidth, scorePillWidth)));
        }

        measureSideWidth();

        globalThis.addEventListener('resize', measureSideWidth);

        return () => {
            globalThis.removeEventListener('resize', measureSideWidth);
        };
    }, [score]);

    function handleBackClick() {
        if (!onBack) {
            return;
        }

        Promise.resolve(onBack()).catch(() => undefined);
    }

    return (
        <header className={headerClasses} style={headerStyle}>
            <div className='single-top-bar-side single-top-bar-side-start'>
                {onPause ? (
                    <button
                        aria-label={uiText.pause}
                        className='top-bar-back-button'
                        onClick={onPause}
                        ref={backButtonRef}
                        type='button'
                    >
                        <Pause aria-hidden='true' className='control-icon' />
                    </button>
                ) : undefined}
                {!onPause && onBack ? (
                    <button
                        aria-label={uiText.back}
                        className='top-bar-back-button'
                        onClick={handleBackClick}
                        ref={backButtonRef}
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
                    ref={scorePillRef}
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
