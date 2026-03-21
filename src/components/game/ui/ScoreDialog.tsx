import type { JSX } from 'react';

import { uiText } from '../../../app-state';

import './ScoreDialog.css';

import { ActionButton } from './ActionButton';
import { ConfettiLayer } from './ConfettiLayer';

type ScoreDialogProps = {
    atomized: number;
    comboCount: number;
    onReturnHome: () => void | Promise<void>;
    onRetry?: () => void;
    score: number;
    bestScore?: number;
    isNewBest?: boolean;
    title: string;
};

export function ScoreDialog({
    atomized,
    comboCount,
    onReturnHome,
    onRetry,
    score,
    bestScore,
    isNewBest,
    title,
}: ScoreDialogProps): JSX.Element {
    const isVictory = title === uiText.victory;

    function handleReturnHomeClick() {
        Promise.resolve(onReturnHome()).catch(() => undefined);
    }

    return (
        <div className='score-dialog-scrim' role='presentation'>
            {isVictory ? <ConfettiLayer /> : undefined}
            <section
                aria-labelledby='score-dialog-title'
                aria-modal='true'
                className={`score-dialog${title === uiText.victory ? ' score-dialog--victory' : ''}${title === uiText.defeat ? ' score-dialog--defeat' : ''}`}
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
                <div className='score-dialog-hero'>
                    <span className='score-dialog-hero-label'>
                        {uiText.score}
                    </span>
                    <strong className='score-dialog-hero-value'>{score}</strong>
                    {isNewBest ? (
                        <span className='score-dialog-new-best'>
                            {uiText.newBest}
                        </span>
                    ) : undefined}
                    {!isNewBest && bestScore !== undefined && bestScore > 0 ? (
                        <span className='score-dialog-best-label'>
                            <span className='score-dialog-best-prefix'>
                                {uiText.bestScore}
                            </span>
                            <span className='score-dialog-best-value'>
                                {bestScore}
                            </span>
                        </span>
                    ) : undefined}
                </div>
                <dl className='score-dialog-secondary'>
                    <div className='score-dialog-sec-stat'>
                        <dt className='score-dialog-sec-label'>
                            {uiText.atomized}
                        </dt>
                        <dd className='score-dialog-sec-value'>{atomized}</dd>
                    </div>
                    <div
                        aria-hidden='true'
                        className='score-dialog-sec-divider'
                    />
                    <div className='score-dialog-sec-stat'>
                        <dt className='score-dialog-sec-label'>
                            {uiText.maxCombo}
                        </dt>
                        <dd className='score-dialog-sec-value'>{comboCount}</dd>
                    </div>
                </dl>
                <div className='score-dialog-actions'>
                    {onRetry ? (
                        <ActionButton onClick={onRetry} variant='secondary'>
                            {uiText.retry}
                        </ActionButton>
                    ) : undefined}
                    <ActionButton
                        onClick={handleReturnHomeClick}
                        variant='primary'
                    >
                        {uiText.returnHome}
                    </ActionButton>
                </div>
            </section>
        </div>
    );
}
