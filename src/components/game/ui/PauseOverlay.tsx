import type { JSX } from 'react';

import { uiText } from '../../../app-state';

import './PauseOverlay.css';

import { ActionButton } from './ActionButton';

type PauseOverlayProps = {
    onResume: () => void;
    onReturnHome: () => void | Promise<void>;
};

export function PauseOverlay({
    onResume,
    onReturnHome,
}: PauseOverlayProps): JSX.Element {
    function handleReturnHomeClick() {
        Promise.resolve(onReturnHome()).catch(() => undefined);
    }

    return (
        <div className='pause-overlay-scrim' role='presentation'>
            <section
                aria-labelledby='pause-overlay-title'
                aria-modal='true'
                className='pause-overlay-panel'
                role='dialog'
            >
                <header className='pause-overlay-header'>
                    <span
                        className='pause-overlay-title'
                        id='pause-overlay-title'
                    >
                        {uiText.paused}
                    </span>
                </header>
                <div className='pause-overlay-actions'>
                    <ActionButton onClick={onResume} variant='primary'>
                        {uiText.resume}
                    </ActionButton>
                    <ActionButton
                        onClick={handleReturnHomeClick}
                        variant='secondary'
                    >
                        {uiText.returnHome}
                    </ActionButton>
                </div>
            </section>
        </div>
    );
}
