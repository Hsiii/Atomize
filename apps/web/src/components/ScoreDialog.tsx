import type { JSX } from 'react';

import { uiText } from '../app-state';

import './ScoreDialog.css';

import { ActionButton } from './ActionButton';

type ScoreDialogProps = {
    score: number;
    onReturnHome: () => void | Promise<void>;
};

export function ScoreDialog({
    score,
    onReturnHome,
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
                <span className='label' id='score-dialog-title'>
                    {uiText.score}
                </span>
                <div
                    aria-label={`${uiText.score}: ${score} ${uiText.scoreUnit}`}
                    className='score-dialog-value'
                >
                    <strong>{score}</strong>
                    <span className='score-dialog-unit'>
                        {uiText.scoreUnit}
                    </span>
                </div>
                <ActionButton onClick={handleReturnHomeClick} variant='primary'>
                    {uiText.returnHome}
                </ActionButton>
            </section>
        </div>
    );
}
