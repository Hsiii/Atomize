import { useEffect, useRef, useState } from 'react';

import type { Prime } from '../core';
import { KEYBOARD_DIGIT_BUFFER_WINDOW_MS } from '../core/timing';

type UsePrimeKeyboardControlsOptions = {
    canSubmit: boolean;
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
    canSubmit,
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
    const bufferedPrimeTimerRef = useRef<number | undefined>(undefined);

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
        const timerId = bufferedPrimeTimerRef.current;

        if (timerId !== undefined) {
            globalThis.clearTimeout(timerId);
            bufferedPrimeTimerRef.current = undefined;
        }

        bufferedPrimeInputRef.current = '';
        setBufferedPrimeInput('');
    }

    function commitBufferedPrimeInput() {
        const bufferedPrime = playablePrimes.find(
            (prime) => String(prime) === bufferedPrimeInputRef.current
        );

        clearBufferedPrimeInput();

        if (bufferedPrime !== undefined) {
            onPrimeTap(bufferedPrime);
        }
    }

    function scheduleBufferedPrimeCommit(nextBuffer: string) {
        bufferedPrimeInputRef.current = nextBuffer;
        setBufferedPrimeInput(nextBuffer);

        const timerId = bufferedPrimeTimerRef.current;

        if (timerId !== undefined) {
            globalThis.clearTimeout(timerId);
        }

        bufferedPrimeTimerRef.current = globalThis.setTimeout(
            commitBufferedPrimeInput,
            KEYBOARD_DIGIT_BUFFER_WINDOW_MS,
            undefined
        );
    }

    function processFreshDigit(digit: string) {
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

        if (exactPrime !== undefined && !hasLongerMatch) {
            clearBufferedPrimeInput();
            onPrimeTap(exactPrime);
            return;
        }

        scheduleBufferedPrimeCommit(digit);
    }

    function handleDigitKey(digit: string) {
        if (isInputDisabled) {
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
        clearBufferedPrimeInput();

        if (!canSubmit) {
            return;
        }

        onSubmit();
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

            if (event.key === 'Enter' || event.key === ' ') {
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
    }, [canSubmit, handleSubmit, isComboRunning, queueLength]);

    return {
        bufferedPrimeInput,
        clearBufferedPrimeInput,
        handleBackspace,
        handlePrimeTap,
        handleSubmit,
    };
}
