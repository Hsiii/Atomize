import { useRef, useState } from 'react';

import type { Prime } from '../core/primes';

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
    const submissionTokenRef = useRef(0);

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

            submissionTokenRef.current++;
            const submissionToken = submissionTokenRef.current;
            setIsComboRunning(true);

            try {
                await options.onSolvedStageClear();
            } finally {
                if (submissionToken === submissionTokenRef.current) {
                    setIsComboRunning(false);
                }
            }

            return;
        }

        submissionTokenRef.current++;
        const submissionToken = submissionTokenRef.current;
        setIsComboRunning(true);

        const queuedPrimes = [...queue];
        setPrimeQueue(queuedPrimes);

        try {
            await options.processQueue(queuedPrimes);
        } finally {
            if (submissionToken === submissionTokenRef.current) {
                setIsComboRunning(false);
            }
        }
    }

    function reset() {
        submissionTokenRef.current++;
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
