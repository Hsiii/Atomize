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
                <dl className='score-dialog-stat-list'>
                    <div className='score-dialog-stat-row score-dialog-stat-row--score'>
                        <dt className='score-dialog-stat-label'>
                            {uiText.score}
                        </dt>
                        <dd className='score-dialog-stat-value'>{score}</dd>
                        {isNewBest ? (
                            <span className='score-dialog-new-best'>
                                {uiText.newBest}
                            </span>
                        ) : undefined}
                        {!isNewBest &&
                        bestScore !== undefined &&
                        bestScore > 0 ? (
                            <span className='score-dialog-best-label'>
                                {uiText.bestScore} {bestScore}
                            </span>
                        ) : undefined}
                    </div>
                    <div className='score-dialog-stat-row score-dialog-stat-row--atomized'>
                        <dt className='score-dialog-stat-label'>
                            {uiText.atomized}
                        </dt>
                        <dd className='score-dialog-stat-value'>{atomized}</dd>
                    </div>
                    <div className='score-dialog-stat-row score-dialog-stat-row--combo'>
                        <dt className='score-dialog-stat-label'>
                            {uiText.maxCombo}
                        </dt>
                        <dd className='score-dialog-stat-value'>
                            {comboCount}
                        </dd>
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
