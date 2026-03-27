import type { JSX } from 'react';
import { CircleArrowUp, Delete } from 'lucide-react';

import { uiText } from '../../../app-state';
import type { Prime } from '../../../core';
import { ActionButton } from './ActionButton';
import { PrimeKeyButton } from './PrimeKeyButton';

type GameControlsProps = {
    backspaceDisabled: boolean;
    getPrimeDisabledState?: (prime: Prime) => boolean;
    highlightedPrime?: Prime | undefined;
    keypadClassName?: string;
    onBackspace: () => void;
    onPrimeTap: (prime: Prime) => void;
    onSubmit: () => void;
    primes: readonly Prime[];
    submitClassName?: string;
    submitDisabled: boolean;
};

export function GameControls({
    backspaceDisabled,
    getPrimeDisabledState,
    highlightedPrime,
    keypadClassName,
    onBackspace,
    onPrimeTap,
    onSubmit,
    primes,
    submitClassName,
    submitDisabled,
}: GameControlsProps): JSX.Element {
    return (
        <div className='keypad-row'>
            <div
                className={`keypad solo-keypad${keypadClassName ? ` ${keypadClassName}` : ''}`}
            >
                {primes.map((prime) => (
                    <PrimeKeyButton
                        disabled={getPrimeDisabledState?.(prime) === true}
                        isHighlighted={highlightedPrime === prime}
                        key={prime}
                        onPress={onPrimeTap}
                        prime={prime}
                    >
                        {prime}
                    </PrimeKeyButton>
                ))}
            </div>

            <div className='combo-actions-column'>
                <ActionButton
                    aria-disabled={backspaceDisabled}
                    aria-label={uiText.backspace}
                    className='combo-backspace-button'
                    onClick={onBackspace}
                    shape='rounded'
                    tabIndex={backspaceDisabled ? -1 : undefined}
                    variant='secondary'
                >
                    <span className='control-button-content'>
                        <Delete aria-hidden='true' className='control-icon' />
                    </span>
                </ActionButton>

                <ActionButton
                    aria-disabled={submitDisabled}
                    aria-label={uiText.enterCombo}
                    className={`combo-enter-button${submitClassName ? ` ${submitClassName}` : ''}`}
                    onPress={onSubmit}
                    shape='rounded'
                    tabIndex={submitDisabled ? -1 : undefined}
                    triggerMode='press-start'
                    variant='secondary'
                >
                    <span className='control-button-content'>
                        <CircleArrowUp
                            aria-hidden='true'
                            className='control-icon'
                        />
                    </span>
                </ActionButton>
            </div>
        </div>
    );
}
