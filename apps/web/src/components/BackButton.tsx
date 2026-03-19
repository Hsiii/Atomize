import type { JSX } from 'react';
import { ArrowLeft } from 'lucide-react';

import { uiText } from '../app-state';
import { IconButton } from './IconButton';

type BackButtonProps = {
    onBack: () => void | Promise<void>;
};

export function BackButton({ onBack }: BackButtonProps): JSX.Element {
    function handleBackClick() {
        Promise.resolve(onBack()).catch(() => undefined);
    }

    return (
        <IconButton
            className='floating-back-button'
            icon={<ArrowLeft aria-hidden='true' className='control-icon' />}
            label={uiText.back}
            onClick={handleBackClick}
        />
    );
}
