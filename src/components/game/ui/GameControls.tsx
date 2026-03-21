import type { JSX } from 'react';
import { CircleArrowUp, Delete } from 'lucide-react';

import { uiText } from '../../../app-state';
import type { Prime } from '../../../core';
import { ActionButton } from './ActionButton';
import { PrimeKeyButton } from './PrimeKeyButton';

type GameControlsProps = {
    backspaceDisabled: boolean;
    keypadClassName?: string;
    onBackspace: () => void;
    onPrimeTap: (prime: Prime) => void;
    onSubmit: () => void;
    primes: readonly Prime[];
    submitDisabled: boolean;
};

export function GameControls({
    backspaceDisabled,
    keypadClassName,
    onBackspace,
    onPrimeTap,
    onSubmit,
    primes,
    submitDisabled,
}: GameControlsProps): JSX.Element {
    return (
        <div className='keypad-row'>
            <div
                className={`keypad solo-keypad${keypadClassName ? ` ${keypadClassName}` : ''}`}
            >
                {primes.map((prime) => (
                    <PrimeKeyButton
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
                    aria-label={uiText.backspace}
                    className='combo-backspace-button'
                    disabled={backspaceDisabled}
                    onClick={onBackspace}
                    shape='rounded'
                    variant='secondary'
                >
                    <span className='control-button-content'>
                        <Delete aria-hidden='true' className='control-icon' />
                    </span>
                </ActionButton>

                <ActionButton
                    aria-label={uiText.enterCombo}
                    className='combo-enter-button'
                    disabled={submitDisabled}
                    onClick={onSubmit}
                    shape='rounded'
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
