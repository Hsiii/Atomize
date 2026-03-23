import type { JSX } from 'react';

import './ComboQueuePanel.css';

export const COMBO_QUEUE_MAX_ITEMS = 7;

type ComboQueuePanelProps = {
    queue: readonly number[];
};

export function ComboQueuePanel({ queue }: ComboQueuePanelProps): JSX.Element {
    return (
        <section aria-live='polite' className='combo-panel'>
            <div className='combo-bar'>
                {queue.map((val, idx) => (
                    <span className='combo-bar-item' key={`${val}-${idx}`}>
                        <span className='combo-bar-chip'>{val}</span>
                        {idx < queue.length - 1 ? (
                            <span aria-hidden='true' className='combo-bar-sep'>
                                {'\u00D7'}
                            </span>
                        ) : undefined}
                    </span>
                ))}
            </div>
        </section>
    );
}
