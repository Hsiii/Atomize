import type { JSX } from 'react';

import { uiText } from '../app-state';

import './ScoreDialog.css';

import { ActionButton } from './ActionButton';

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
    function handleReturnHomeClick() {
        Promise.resolve(onReturnHome()).catch(() => undefined);
    }

    return (
        <div className='score-dialog-scrim' role='presentation'>
            <section
                aria-labelledby='score-dialog-title'
                aria-modal='true'
                className='score-dialog'
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
                <div className='score-dialog-stats'>
                    {score === undefined ? undefined : (
                        <section
                            aria-label={uiText.score}
                            className='score-dialog-stat'
                        >
                            <p className='score-dialog-summary'>
                                {uiText.score}
                            </p>
                            <div className='score-dialog-stat-value-block'>
                                <strong className='score-dialog-stat-value'>
                                    {score}
                                </strong>
                                <span className='score-dialog-stat-unit'>
                                    {uiText.scoreUnit}
                                </span>
                            </div>
                        </section>
                    )}
                    <section
                        aria-label={uiText.maxCombo}
                        className='score-dialog-stat'
                    >
                        <p className='score-dialog-summary'>
                            {uiText.maxCombo}
                        </p>
                        <div className='score-dialog-combo-ring'>
                            <strong className='score-dialog-combo-value'>
                                x{comboCount}
                            </strong>
                        </div>
                    </section>
                </div>
                <ActionButton onClick={handleReturnHomeClick} variant='primary'>
                    {uiText.returnHome}
                </ActionButton>
            </section>
        </div>
    );
}
