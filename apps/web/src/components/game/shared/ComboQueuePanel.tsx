import type { JSX } from 'react';

import './ComboQueuePanel.css';

type ComboQueuePanelProps = {
    queue: readonly number[];
};

export function ComboQueuePanel({ queue }: ComboQueuePanelProps): JSX.Element {
    const bufferedValue = queue.length > 0 ? queue.join(' x ') : '\u00A0';

    return (
        <section aria-live='polite' className='combo-panel'>
            <div className='combo-bar'>
                <span className='combo-bar-value'>{bufferedValue}</span>
            </div>
        </section>
    );
}
