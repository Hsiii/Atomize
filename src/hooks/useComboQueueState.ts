import { useState } from 'react';

import type { Prime } from '../core';

type UseComboQueueStateResult = {
    primeQueue: Prime[];
    isComboRunning: boolean;
    setPrimeQueue: React.Dispatch<React.SetStateAction<Prime[]>>;
    submitCombo: (
        queue: readonly Prime[],
        options: {
            isDisabled: boolean;
            isSolvedStage: boolean;
            onSolvedStageClear: () => Promise<unknown> | undefined;
            processQueue: (primes: readonly Prime[]) => Promise<void>;
        }
    ) => Promise<undefined>;
    reset: () => void;
};

export function useComboQueueState(): UseComboQueueStateResult {
    const [primeQueue, setPrimeQueue] = useState<Prime[]>([]);
    const [isComboRunning, setIsComboRunning] = useState(false);

    async function submitCombo(
        queue: readonly Prime[],
        options: {
            isDisabled: boolean;
            isSolvedStage: boolean;
            onSolvedStageClear: () => Promise<unknown> | undefined;
            processQueue: (primes: readonly Prime[]) => Promise<void>;
        }
    ): Promise<undefined> {
        if (options.isDisabled) {
            return;
        }

        if (queue.length === 0) {
            if (!options.isSolvedStage) {
                return;
            }

            setIsComboRunning(true);

            try {
                await options.onSolvedStageClear();
            } finally {
                setIsComboRunning(false);
            }

            return;
        }

        setIsComboRunning(true);

        const queuedPrimes = [...queue];
        setPrimeQueue(queuedPrimes);

        try {
            await options.processQueue(queuedPrimes);
        } finally {
            setIsComboRunning(false);
        }
    }

    function reset() {
        setPrimeQueue([]);
        setIsComboRunning(false);
    }

    return {
        primeQueue,
        isComboRunning,
        setPrimeQueue,
        submitCombo,
        reset,
    };
}
