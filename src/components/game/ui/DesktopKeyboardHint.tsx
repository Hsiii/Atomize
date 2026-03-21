import type { JSX } from 'react';

import { uiText } from '../../../app-state';

type DesktopKeyboardHintProps = {
    className?: string;
};

export function DesktopKeyboardHint({
    className,
}: DesktopKeyboardHintProps): JSX.Element {
    return (
        <aside
            aria-hidden='true'
            className={`desktop-keyboard-hint${className ? ` ${className}` : ''}`}
        >
            <div className='desktop-keyboard-hint-header'>
                {uiText.keyboardHintTitle}
            </div>
            <div className='desktop-keyboard-hint-body'>
                <span className='desktop-keyboard-hint-copy'>
                    {uiText.keyboardHintLead}
                </span>
                <span className='desktop-keyboard-hint-key'>4</span>
                <span className='desktop-keyboard-hint-copy'>
                    {uiText.keyboardHintTail}
                </span>
            </div>
        </aside>
    );
}
