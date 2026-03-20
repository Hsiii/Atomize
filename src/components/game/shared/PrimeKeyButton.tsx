import type { JSX, KeyboardEvent, PointerEvent, ReactNode } from 'react';
import type { Prime } from '../../../core';

import './PrimeKeyButton.css';

type PrimeKeyButtonProps = {
    prime: Prime;
    interactionDisabled: boolean;
    visuallyDisabled?: boolean;
    onPress: (prime: Prime) => void;
    children: ReactNode;
};

export function PrimeKeyButton({
    prime,
    interactionDisabled,
    visuallyDisabled = interactionDisabled,
    onPress,
    children,
}: PrimeKeyButtonProps): JSX.Element {
    function handlePointerDown(event: PointerEvent<HTMLButtonElement>) {
        if (interactionDisabled) {
            return;
        }

        if (event.pointerType === 'mouse' && event.button !== 0) {
            return;
        }

        event.preventDefault();
        onPress(prime);
    }

    function handleKeyDown(event: KeyboardEvent<HTMLButtonElement>) {
        if (interactionDisabled) {
            return;
        }

        if (event.key !== 'Enter' && event.key !== ' ') {
            return;
        }

        event.preventDefault();
        onPress(prime);
    }

    return (
        <button
            aria-disabled={interactionDisabled}
            className='prime-key-button'
            data-disabled={visuallyDisabled ? 'true' : undefined}
            onKeyDown={handleKeyDown}
            onPointerDown={handlePointerDown}
            tabIndex={interactionDisabled ? -1 : 0}
            type='button'
        >
            <span className='prime-key-button-label'>{children}</span>
        </button>
    );
}
