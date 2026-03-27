import { useEffect, useRef, useState } from 'react';

import type { Prime } from '../core';

type UsePrimeKeyboardControlsOptions = {
    canQueuePrime: boolean;
    isComboRunning: boolean;
    isInputDisabled: boolean;
    onBackspaceQueue: () => void;
    onPrimeTap: (prime: Prime) => void;
    onSubmit: () => void;
    playablePrimes: readonly Prime[];
    queueLength: number;
};

type UsePrimeKeyboardControlsResult = {
    bufferedPrimeInput: string;
    clearBufferedPrimeInput: () => void;
    handleBackspace: () => void;
    handlePrimeTap: (prime: Prime) => void;
    handleSubmit: () => void;
};

export function usePrimeKeyboardControls({
    canQueuePrime,
    isComboRunning,
    isInputDisabled,
    onBackspaceQueue,
    onPrimeTap,
    onSubmit,
    playablePrimes,
    queueLength,
}: UsePrimeKeyboardControlsOptions): UsePrimeKeyboardControlsResult {
    const [bufferedPrimeInput, setBufferedPrimeInput] = useState('');
    const bufferedPrimeInputRef = useRef(bufferedPrimeInput);

    useEffect(() => {
        bufferedPrimeInputRef.current = bufferedPrimeInput;
    }, [bufferedPrimeInput]);

    useEffect(() => {
        if (!isInputDisabled) {
            return;
        }

        clearBufferedPrimeInput();
    }, [isInputDisabled]);

    useEffect(() => clearBufferedPrimeInput, []);

    function clearBufferedPrimeInput() {
        bufferedPrimeInputRef.current = '';
        setBufferedPrimeInput('');
    }

    function commitBufferedPrimeInput() {
        if (!canQueuePrime) {
            clearBufferedPrimeInput();
            return;
        }

        const bufferedPrime = playablePrimes.find(
            (prime) => String(prime) === bufferedPrimeInputRef.current
        );

        clearBufferedPrimeInput();

        if (bufferedPrime !== undefined) {
            onPrimeTap(bufferedPrime);
        }
    }

    function setPendingDigit(nextBuffer: string) {
        bufferedPrimeInputRef.current = nextBuffer;
        setBufferedPrimeInput(nextBuffer);
    }

    function processFreshDigit(digit: string) {
        if (digit === '4') {
            const shortcutPrime = playablePrimes.find((prime) => prime === 23);

            if (shortcutPrime !== undefined) {
                clearBufferedPrimeInput();
                onPrimeTap(shortcutPrime);
            }

            return;
        }

        const matchingPrimes = playablePrimes.filter((prime) =>
            String(prime).startsWith(digit)
        );

        if (matchingPrimes.length === 0) {
            return;
        }

        const exactPrime = matchingPrimes.find(
            (prime) => String(prime) === digit
        );
        const hasLongerMatch = matchingPrimes.some(
            (prime) => String(prime).length > digit.length
        );

        if (exactPrime !== undefined && (digit !== '1' || !hasLongerMatch)) {
            clearBufferedPrimeInput();
            onPrimeTap(exactPrime);
            return;
        }

        setPendingDigit(digit);
    }

    function handleDigitKey(digit: string) {
        if (isInputDisabled || !canQueuePrime) {
            return;
        }

        const pendingDigit = bufferedPrimeInputRef.current;

        if (pendingDigit === '') {
            processFreshDigit(digit);
            return;
        }

        const bufferedPrime = playablePrimes.find(
            (prime) => String(prime) === `${pendingDigit}${digit}`
        );

        clearBufferedPrimeInput();

        if (bufferedPrime !== undefined) {
            onPrimeTap(bufferedPrime);
            return;
        }

        processFreshDigit(digit);
    }

    function handlePrimeTap(prime: Prime) {
        clearBufferedPrimeInput();
        onPrimeTap(prime);
    }

    function handleBackspace() {
        if (isComboRunning) {
            return;
        }

        if (bufferedPrimeInputRef.current !== '') {
            clearBufferedPrimeInput();
            return;
        }

        onBackspaceQueue();
    }

    function handleSubmit() {
        if (bufferedPrimeInputRef.current !== '') {
            return;
        }

        clearBufferedPrimeInput();

        onSubmit();
    }

    function handleSpace() {
        if (bufferedPrimeInputRef.current !== '') {
            commitBufferedPrimeInput();
            return;
        }

        handleSubmit();
    }

    useEffect(() => {
        function handleWindowKeyDown(event: KeyboardEvent) {
            const { target } = event;

            if (
                target instanceof HTMLElement &&
                (target.isContentEditable ||
                    target.tagName === 'INPUT' ||
                    target.tagName === 'SELECT' ||
                    target.tagName === 'TEXTAREA')
            ) {
                return;
            }

            if (event.altKey || event.ctrlKey || event.metaKey) {
                return;
            }

            if (event.key === 'Backspace') {
                if (
                    isComboRunning ||
                    (bufferedPrimeInputRef.current === '' && queueLength === 0)
                ) {
                    return;
                }

                event.preventDefault();
                handleBackspace();
                return;
            }

            if (event.key === ' ') {
                event.preventDefault();
                handleSpace();
                return;
            }

            if (event.key === 'Enter') {
                event.preventDefault();
                handleSubmit();
                return;
            }

            if (!/^[1-9]$/.test(event.key) || event.repeat) {
                return;
            }

            event.preventDefault();
            handleDigitKey(event.key);
        }

        globalThis.addEventListener('keydown', handleWindowKeyDown);

        return () => {
            globalThis.removeEventListener('keydown', handleWindowKeyDown);
        };
    }, [canQueuePrime, isComboRunning, queueLength]);

    return {
        bufferedPrimeInput,
        clearBufferedPrimeInput,
        handleBackspace,
        handlePrimeTap,
        handleSubmit,
    };
}
