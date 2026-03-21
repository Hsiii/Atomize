import type { JSX } from 'react';
import { ArrowLeft } from 'lucide-react';

import { uiText } from '../../app-state';

import './BackButton.css';

type BackButtonProps = {
    onBack: () => void | Promise<void>;
};

export function BackButton({ onBack }: BackButtonProps): JSX.Element {
    function handleBackClick() {
        Promise.resolve(onBack()).catch(() => undefined);
    }

    return (
        <button
            aria-label={uiText.back}
            className='floating-back-button'
            onClick={handleBackClick}
            type='button'
        >
            <ArrowLeft aria-hidden='true' className='control-icon' />
        </button>
    );
}
