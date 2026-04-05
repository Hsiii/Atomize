import { useEffect, useMemo, useState } from 'react';
import type { JSX } from 'react';

import './BlobTransition.css';

type BlobTransitionProps = {
    clientX: number;
    clientY: number;
    colorKey: string;
    onComplete: () => void;
    onMiddle: () => void;
};

// Generates a massive cluster of micro foam bubbles that rise from the floor.
function useFoamBubbles(): ReadonlyArray<{
    baseScale: number;
    delay: number;
    id: number;
    opacity: number;
    startX: number;
    startYOffset: number;
    tx: number;
    ty: number;
}> {
    return useMemo(
        () =>
            // 400 tiny bubbles to fill the screen organically.
            Array.from({ length: 400 }).map((_, i) => {
                // Horizontal spawn: anywhere from extremely left to extremely right.
                const startX = Math.random() * 100;
                // Vertical delay spacing: starts hidden beneath the screen bottom.
                const startYOffset = Math.random() * 20;
                // Swaying horizontally left or right as it rises.
                const tx = (Math.random() - 0.5) * 40;
                // Rising randomly along the vertical height of the screen (40vh to 150vh upwards).
                const ty = -1 * (Math.random() * 110 + 40);

                const delay = Math.random() * 0.35; // Stagger up to 350ms.
                const baseScale = Math.random() + 0.3; // Much smaller 0.3x to 1.3x size!
                const opacity = Math.random() * 0.4 + 0.3; // 0.3 to 0.7 midway semi-transparency.

                return {
                    baseScale,
                    delay,
                    id: i,
                    opacity,
                    startX,
                    startYOffset,
                    tx,
                    ty,
                };
            }),
        []
    );
}

export function BlobTransition({
    clientX: _clientX,
    clientY: _clientY,
    colorKey,
    onComplete,
    onMiddle,
}: BlobTransitionProps): JSX.Element {
    const [phase, setPhase] = useState<'expanded' | 'expanding' | 'fading'>(
        'expanding'
    );
    const bubbles = useFoamBubbles();

    useEffect(() => {
        if (phase === 'expanding') {
            let fadeTimer: ReturnType<typeof setTimeout> | undefined;
            const timer = setTimeout(() => {
                setPhase('expanded');
                onMiddle();

                fadeTimer = setTimeout(() => {
                    setPhase('fading');
                }, 100);
            }, 1000); // 1.0s for the lengthy micro foam stream to fully blanket the view.
            return () => {
                clearTimeout(timer);
                clearTimeout(fadeTimer);
            };
        }

        if (phase === 'fading') {
            const timer = setTimeout(() => {
                onComplete();
            }, 850); // 0.85s for all 400 bubbles to shrink and pop gracefully.
            return () => {
                clearTimeout(timer);
            };
        }

        return undefined;
    }, [phase, onMiddle, onComplete]);

    return (
        <div
            aria-hidden='true'
            className={`blob-transition-overlay blob-phase-${phase}`}
        >
            {bubbles.map((bubble) => (
                <div
                    className='foam-bubble'
                    key={bubble.id}
                    style={
                        {
                            '--delay': `${bubble.delay}s`,
                            '--op': bubble.opacity,
                            '--scale': bubble.baseScale,
                            '--sx': `${bubble.startX}vw`,
                            '--sy': `-${10 + bubble.startYOffset}vh`,
                            '--tx': `${bubble.tx}vw`,
                            '--ty': `${bubble.ty}vh`,
                            'backgroundColor': colorKey,
                        } as React.CSSProperties
                    }
                />
            ))}
        </div>
    );
}
