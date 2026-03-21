import { useState } from 'react';
import type { JSX } from 'react';
import { X } from 'lucide-react';

import { uiText } from '../../../app-state';

type DesktopKeyboardHintProps = {
    className?: string;
};

export function DesktopKeyboardHint({
    className,
}: DesktopKeyboardHintProps): JSX.Element {
    const [isDismissed, setIsDismissed] = useState(false);

    if (isDismissed) {
        return <></>;
    }

    return (
        <aside
            className={`desktop-keyboard-hint${className ? ` ${className}` : ''}`}
        >
            <div className='desktop-keyboard-hint-header'>
                <span className='desktop-keyboard-hint-title'>
                    {uiText.keyboardHintTitle}
                </span>
                <button
                    aria-label={uiText.close}
                    className='desktop-keyboard-hint-close'
                    onClick={() => {
                        setIsDismissed(true);
                    }}
                    type='button'
                >
                    <X aria-hidden='true' size={18} />
                </button>
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
