import { useEffect, useRef, useState } from 'react';
import type { JSX } from 'react';

import { uiText } from '../../app-state';

import './BurstTransition.css';

type BurstTransitionProps = {
    onNavigate: () => void;
    onComplete: () => void;
};

export function BurstTransition({
    onNavigate,
    onComplete,
}: BurstTransitionProps): JSX.Element {
    const [isExiting, setIsExiting] = useState(false);

    // Store latest callbacks safely.
    const onNavigateRef = useRef(onNavigate);
    const onCompleteRef = useRef(onComplete);

    useEffect(() => {
        onNavigateRef.current = onNavigate;
        onCompleteRef.current = onComplete;
    }, [onNavigate, onComplete]);

    useEffect(() => {
        // Navigation buffer: trigger immediately after text finishes fading in
        const timeoutNav = setTimeout(() => {
            onNavigateRef.current();

            // Allow shorter router DOM mounting gap, then execute the Exit Sweep.
            setTimeout(() => {
                setIsExiting(true);
            }, 50);
        }, 800);

        // Complete the transition (800ms + 50ms + 500ms sweep-up animation).
        const timeoutEnd = setTimeout(() => {
            onCompleteRef.current();
        }, 1400);

        return () => {
            clearTimeout(timeoutNav);
            clearTimeout(timeoutEnd);
        };
    }, []);

    return (
        <div
            className={`burst-transition-screen ${isExiting ? 'is-exiting' : ''}`}
        >
            {/* Primary Wipe (Color Primary) extending downwards with exact page header curve */}
            <div className='wipe-group wipe-primary'>
                <div className='wipe-rect' />
                <div className='wipe-circle' />
            </div>

            {/* Hardware Accelerated Final ATOMIZE Reveal Overlay */}
            <div className='wipe-text-overlay'>
                <div className='wipe-text-content'>
                    <span>{uiText.titleLead}</span>
                    <span aria-hidden='true' className='hero-title-filled-o' />
                    <span>{uiText.titleTail}</span>
                </div>
            </div>
        </div>
    );
}
