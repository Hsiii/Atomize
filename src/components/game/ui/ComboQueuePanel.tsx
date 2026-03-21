import { Fragment, useEffect, useRef } from 'react';
import type { JSX } from 'react';

import './ComboQueuePanel.css';

type ComboQueuePanelProps = {
    queue: readonly number[];
};

export function ComboQueuePanel({ queue }: ComboQueuePanelProps): JSX.Element {
    const barRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const el = barRef.current;
        if (el) {
            el.scrollLeft = el.scrollWidth;
        }
    }, [queue]);

    return (
        <section aria-live='polite' className='combo-panel'>
            <div className='combo-bar' ref={barRef}>
                {queue.map((val, idx) => (
                    <Fragment key={idx}>
                        {idx > 0 && (
                            <span aria-hidden='true' className='combo-bar-sep'>
                                {'\u00D7'}
                            </span>
                        )}
                        <span className='combo-bar-chip'>{val}</span>
                    </Fragment>
                ))}
            </div>
        </section>
    );
}
