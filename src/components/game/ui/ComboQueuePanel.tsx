import type { JSX } from 'react';

import './ComboQueuePanel.css';

export const COMBO_QUEUE_MAX_ITEMS = 7;

type ComboQueuePanelProps = {
    pendingInput?: string;
    queue: readonly number[];
};

export function ComboQueuePanel({
    pendingInput = '',
    queue,
}: ComboQueuePanelProps): JSX.Element {
    const displayQueue = pendingInput === '' ? queue : [...queue, pendingInput];

    return (
        <section aria-live='polite' className='combo-panel'>
            <div className='combo-bar'>
                {displayQueue.map((val, idx) => {
                    const isPendingInput =
                        pendingInput !== '' && idx === displayQueue.length - 1;

                    return (
                        <span className='combo-bar-item' key={`${val}-${idx}`}>
                            <span
                                className={`combo-bar-chip${isPendingInput ? ' combo-bar-chip-pending' : ''}`}
                            >
                                {val}
                            </span>
                            {idx < displayQueue.length - 1 ? (
                                <span
                                    aria-hidden='true'
                                    className='combo-bar-sep'
                                >
                                    {'\u00D7'}
                                </span>
                            ) : undefined}
                        </span>
                    );
                })}
            </div>
        </section>
    );
}
