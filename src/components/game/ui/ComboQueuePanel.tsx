import type { JSX } from 'react';

import './ComboQueuePanel.css';

const COMBO_QUEUE_BASE_ROW_CAPACITY = 5;
const COMBO_QUEUE_COMPACT_ROW_CAPACITY = 7;

export const COMBO_QUEUE_MAX_ITEMS = COMBO_QUEUE_COMPACT_ROW_CAPACITY * 2;

type ComboQueuePanelProps = {
    queue: readonly number[];
};

export function ComboQueuePanel({ queue }: ComboQueuePanelProps): JSX.Element {
    const isCompactQueue = queue.length > COMBO_QUEUE_BASE_ROW_CAPACITY;

    return (
        <section aria-live='polite' className='combo-panel'>
            <div
                className={`combo-bar${isCompactQueue ? ' compact-queue' : ''}`}
            >
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
