import { useCallback, useRef, useState } from 'react';

/**
 * Shared hook for managing blob reveal/resolving state. Returns [isBlobRevealActive,
 * startBlobReveal, endBlobReveal].
 */
export function useBlobRevealState(
    durationMs: number
): [boolean, () => void, () => void] {
    const [isBlobRevealActive, setIsBlobRevealActive] = useState(false);
    const revealTimeoutRef = useRef<number | undefined>(undefined);

    const startBlobReveal = useCallback(() => {
        setIsBlobRevealActive(true);
        if (revealTimeoutRef.current !== undefined) {
            globalThis.clearTimeout(revealTimeoutRef.current);
        }
        revealTimeoutRef.current = globalThis.setTimeout(
            () => {
                setIsBlobRevealActive(false);
                revealTimeoutRef.current = undefined;
            },
            durationMs,
            undefined
        );
    }, [durationMs]);

    const endBlobReveal = useCallback(() => {
        setIsBlobRevealActive(false);
        if (revealTimeoutRef.current !== undefined) {
            globalThis.clearTimeout(revealTimeoutRef.current);
            revealTimeoutRef.current = undefined;
        }
    }, []);

    return [isBlobRevealActive, startBlobReveal, endBlobReveal];
}
