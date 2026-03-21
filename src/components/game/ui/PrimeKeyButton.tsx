import type { JSX, KeyboardEvent, PointerEvent, ReactNode } from 'react';

import type { Prime } from '../../../core';

import './PrimeKeyButton.css';

type PrimeKeyButtonProps = {
    prime: Prime;
    onPress: (prime: Prime) => void;
    children: ReactNode;
};

export function PrimeKeyButton({
    prime,
    onPress,
    children,
}: PrimeKeyButtonProps): JSX.Element {
    function handlePointerDown(event: PointerEvent<HTMLButtonElement>) {
        if (event.pointerType === 'mouse' && event.button !== 0) {
            return;
        }

        onPress(prime);
    }

    function handleKeyDown(event: KeyboardEvent<HTMLButtonElement>) {
        if (event.key !== 'Enter' && event.key !== ' ') {
            return;
        }

        event.preventDefault();
        onPress(prime);
    }

    return (
        <button
            className='prime-key-button'
            onKeyDown={handleKeyDown}
            onPointerDown={handlePointerDown}
            type='button'
        >
            <span className='prime-key-button-label'>{children}</span>
        </button>
    );
}
