import { useState } from 'react';
import type { JSX } from 'react';

import { uiText } from '../../../app-state';
import { ActionButton } from './ActionButton';

export function DesktopKeyboardHint(): JSX.Element {
    const [isDismissed, setIsDismissed] = useState(false);

    if (isDismissed) {
        return <></>;
    }

    return (
        <section className='tutorial-hint desktop-keyboard-hint'>
            <h2 className='tutorial-hint-title'>{uiText.keyboardHintTitle}</h2>
            <p className='tutorial-hint-body'>
                {`${uiText.keyboardHintLead} 4 ${uiText.keyboardHintTail}`}
            </p>
            <ActionButton
                onClick={() => {
                    setIsDismissed(true);
                }}
                variant='primary'
            >
                {uiText.tutorialGotIt}
            </ActionButton>
        </section>
    );
}
