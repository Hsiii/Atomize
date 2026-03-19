import type { JSX } from 'react';

type ComboQueuePanelProps = {
    queue: readonly number[];
};

export function ComboQueuePanel({ queue }: ComboQueuePanelProps): JSX.Element {
    return (
        <section aria-live='polite' className='combo-panel'>
            <div className='combo-bar'>
                {queue.length > 0 ? queue.join(' x ') : undefined}
            </div>
        </section>
    );
}
