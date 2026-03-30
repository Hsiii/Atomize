import type { JSX, KeyboardEvent, PointerEvent, ReactNode } from 'react';

import type { Prime } from '../../../core';

import './PrimeKeyButton.css';

type PrimeKeyButtonProps = {
    prime: Prime;
    onPress: (prime: Prime) => void;
    children: ReactNode;
    disabled?: boolean;
    isHighlighted?: boolean;
    keybindHint?: string;
};

export function PrimeKeyButton({
    prime,
    onPress,
    children,
    disabled = false,
    isHighlighted = false,
    keybindHint,
}: PrimeKeyButtonProps): JSX.Element {
    function handlePointerDown(event: PointerEvent<HTMLButtonElement>) {
        if (disabled) {
            return;
        }

        if (event.pointerType === 'mouse' && event.button !== 0) {
            return;
        }

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
            className={`prime-key-button${isHighlighted ? ' prime-key-button--highlighted' : ''}`}
            disabled={disabled}
            onKeyDown={handleKeyDown}
            onPointerDown={handlePointerDown}
            type='button'
        >
            <span className='prime-key-button-label'>
                <span className='prime-key-button-main'>{children}</span>
                {keybindHint ? (
                    <span aria-hidden='true' className='prime-key-button-hint'>
                        {keybindHint.toUpperCase()}
                    </span>
                ) : undefined}
            </span>
        </button>
    );
}
