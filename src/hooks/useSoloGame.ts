import { useEffect, useRef, useState } from 'react';

import type { Screen } from '../app-state';
import {
    advanceSoloState,
    applyPrimeSelection,
    applySoloPenalty,
    createInitialSoloState,
} from '../core';
import type { Prime } from '../core';
import {
    createSoloRunSeed,
    playablePrimes,
    soloDurationSeconds,
} from '../lib/app-helpers';

const soloComboStepDelayMs = 280;

type UseSoloGameOptions = {
    screen: Screen;
    onScreenChange: (screen: Screen) => void;
};

type UseSoloGameResult = {
    playablePrimes: typeof playablePrimes;
    soloState: ReturnType<typeof createInitialSoloState>;
    soloTimeLeft: number;
    soloCountdownProgress: number;
    soloPrimeQueue: Prime[];
    isSoloComboRunning: boolean;
    soloStageAdvanceSolvedStateKey: number;
    soloTimerPenaltyPopKey: number;
    handleSoloComboSubmit: (queue: readonly Prime[]) => void;
    startSingleGame: () => void;
    resetSoloGame: () => void;
};

export function useSoloGame({
    screen,
    onScreenChange,
}: UseSoloGameOptions): UseSoloGameResult {
    const initialSoloSeedRef = useRef(createSoloRunSeed());
    const [soloSeed, setSoloSeed] = useState(initialSoloSeedRef.current);
    const [soloState, setSoloState] = useState(() =>
        createInitialSoloState(initialSoloSeedRef.current)
    );
    const [soloTimeLeft, setSoloTimeLeft] = useState(soloDurationSeconds);
    const [soloPrimeQueue, setSoloPrimeQueue] = useState<Prime[]>([]);
    const [isSoloComboRunning, setIsSoloComboRunning] = useState(false);
    const [soloStageAdvanceSolvedStateKey, setSoloStageAdvanceSolvedStateKey] =
        useState(0);
    const [soloTimerPenaltyPopKey, setSoloTimerPenaltyPopKey] = useState(0);
    const latestSoloStateRef = useRef(soloState);

    const soloCountdownProgress = (soloTimeLeft / soloDurationSeconds) * 100;

    useEffect(() => {
        latestSoloStateRef.current = soloState;
    }, [soloState]);

    useEffect(() => {
        if (screen !== 'single') {
            return undefined;
        }

        setSoloTimeLeft(soloDurationSeconds);

        const timer = globalThis.setInterval(
            () => {
                setSoloTimeLeft((currentTime) => {
                    if (currentTime <= 1) {
                        globalThis.clearInterval(timer);
                        return 0;
                    }

                    return currentTime - 1;
                });
            },
            1000,
            undefined
        );

        return () => {
            globalThis.clearInterval(timer);
        };
    }, [screen]);

    useEffect(() => {
        if (screen !== 'single' || !isSoloComboRunning) {
            return undefined;
        }

        if (soloTimeLeft === 0) {
            setIsSoloComboRunning(false);
            return undefined;
        }

        if (soloPrimeQueue.length === 0) {
            setIsSoloComboRunning(false);
            return undefined;
        }

        const timer = globalThis.setTimeout(
            () => {
                const currentState = latestSoloStateRef.current;
                const nextPrime = soloPrimeQueue[0];
                const outcome = applyPrimeSelection(
                    currentState.currentStage,
                    nextPrime
                );

                if (outcome.kind === 'wrong') {
                    setSoloState(applySoloPenalty(currentState));
                    setSoloPrimeQueue([]);
                    setSoloTimeLeft((currentTime) =>
                        Math.max(0, currentTime - 1)
                    );
                    setSoloTimerPenaltyPopKey((currentKey) => currentKey + 1);
                    setIsSoloComboRunning(false);
                    return;
                }

                const nextState = advanceSoloState(
                    currentState,
                    soloSeed,
                    nextPrime
                );
                const hasRedundantBufferedPrimes =
                    outcome.cleared && soloPrimeQueue.length > 1;

                if (hasRedundantBufferedPrimes) {
                    setSoloStageAdvanceSolvedStateKey(
                        (currentKey) => currentKey + 1
                    );
                    setSoloState(applySoloPenalty(nextState));
                    setSoloPrimeQueue([]);
                    setSoloTimeLeft((currentTime) =>
                        Math.max(0, currentTime - 1)
                    );
                    setSoloTimerPenaltyPopKey((currentKey) => currentKey + 1);
                    setIsSoloComboRunning(false);
                    return;
                }

                setSoloState(nextState);

                setSoloPrimeQueue((currentQueue: readonly Prime[]) =>
                    currentQueue.slice(1)
                );

                if (outcome.cleared) {
                    setIsSoloComboRunning(false);
                }
            },
            soloComboStepDelayMs,
            undefined
        );

        return () => {
            globalThis.clearTimeout(timer);
        };
    }, [isSoloComboRunning, screen, soloPrimeQueue, soloTimeLeft, soloSeed]);

    function handleSoloComboSubmit(queue: readonly Prime[]) {
        if (soloTimeLeft === 0 || queue.length === 0 || isSoloComboRunning) {
            return;
        }

        setSoloPrimeQueue([...queue]);
        setIsSoloComboRunning(true);
    }

    function startSingleGame() {
        const nextSoloSeed = createSoloRunSeed();

        setSoloSeed(nextSoloSeed);
        setSoloState(createInitialSoloState(nextSoloSeed));
        setSoloTimeLeft(soloDurationSeconds);
        setSoloPrimeQueue([]);
        setIsSoloComboRunning(false);
        setSoloStageAdvanceSolvedStateKey(0);
        setSoloTimerPenaltyPopKey(0);
        onScreenChange('single');
    }

    function resetSoloGame() {
        setSoloPrimeQueue([]);
        setIsSoloComboRunning(false);
        setSoloStageAdvanceSolvedStateKey(0);
        setSoloTimerPenaltyPopKey(0);
    }

    return {
        playablePrimes,
        soloState,
        soloTimeLeft,
        soloCountdownProgress,
        soloPrimeQueue,
        isSoloComboRunning,
        soloStageAdvanceSolvedStateKey,
        soloTimerPenaltyPopKey,
        handleSoloComboSubmit,
        startSingleGame,
        resetSoloGame,
    };
}
