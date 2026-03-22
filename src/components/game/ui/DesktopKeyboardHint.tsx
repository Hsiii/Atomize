import { useState } from 'react';
import type { JSX } from 'react';

import { keyboardHintText } from '../../../app-state';
import { ActionButton } from './ActionButton';

export function DesktopKeyboardHint(): JSX.Element {
    const [isDismissed, setIsDismissed] = useState(false);

    if (isDismissed) {
        return <></>;
    }

    return (
        <section className='tutorial-hint desktop-keyboard-hint'>
            <h2 className='tutorial-hint-title'>{keyboardHintText.title}</h2>
            <p className='tutorial-hint-body'>{keyboardHintText.body}</p>
            <ActionButton
                onClick={() => {
                    setIsDismissed(true);
                }}
                variant='primary'
            >
                {keyboardHintText.dismissAction}
            </ActionButton>
        </section>
    );
}
