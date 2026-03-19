import type { JSX, KeyboardEvent, PointerEvent, ReactNode } from 'react';
import type { Prime } from '@atomize/game-core';

type PrimeKeyButtonProps = {
    prime: Prime;
    disabled: boolean;
    onPress: (prime: Prime) => void;
    children: ReactNode;
};

export function PrimeKeyButton({
    prime,
    disabled,
    onPress,
    children,
}: PrimeKeyButtonProps): JSX.Element {
    function handlePointerDown(event: PointerEvent<HTMLButtonElement>) {
        if (disabled) {
            return;
        }

        if (event.pointerType === 'mouse' && event.button !== 0) {
            return;
        }

        event.preventDefault();
        onPress(prime);
    }

    function handleKeyDown(event: KeyboardEvent<HTMLButtonElement>) {
        if (disabled) {
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
            className='prime-key-button'
            disabled={disabled}
            onKeyDown={handleKeyDown}
            onPointerDown={handlePointerDown}
            type='button'
        >
            <span className='prime-key-button-label'>{children}</span>
        </button>
    );
}
