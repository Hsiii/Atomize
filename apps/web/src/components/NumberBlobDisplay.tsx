import { useEffect, useRef, useState } from 'react';
import type { CSSProperties, JSX } from 'react';

import './NumberBlobDisplay.css';

type BlobMode = 'solo' | 'multiplayer';

type SplitEcho = {
    id: number;
    value: number;
    angle: number;
    counterAngle: number;
    distance: number;
    size: number;
    variant: 'hit' | 'clear';
};

type ClearPop = {
    id: number;
    value: number;
};

type NumberBlobDisplayProps = {
    value: number | undefined;
    stageIndex?: number;
    isComboRunning?: boolean;
    isStageRevealActive?: boolean;
    mode?: BlobMode;
    size?: 'enemy' | 'self';
};

const echoAngles = [-58, -26, 18, 52];
const clearPopPrepDurationMs = 140;

function createSplitEcho(
    id: number,
    value: number,
    variant: 'hit' | 'clear' = 'hit',
    index = id
): SplitEcho {
    const angle = echoAngles[index % echoAngles.length] ?? echoAngles[0];
    const distance =
        variant === 'clear' ? 7.9 + (index % 4) * 0.6 : 7.6 + (index % 3) * 0.7;
    let size = 6.05;

    if (variant === 'clear') {
        if (value < 10) {
            size = 4.7;
        } else if (value < 100) {
            size = 5.15;
        } else {
            size = 5.65;
        }
    } else if (value < 10) {
        size = 5.05;
    } else if (value < 100) {
        size = 5.55;
    }

    return {
        id,
        value,
        angle,
        counterAngle: -angle,
        distance,
        size,
        variant,
    };
}

function factorizeValue(value: number): readonly number[] {
    if (!Number.isInteger(value) || value <= 1) {
        return [];
    }

    const factors: number[] = [];
    let remainingValue = value;
    let divisor = 2;

    while (divisor * divisor <= remainingValue) {
        while (remainingValue % divisor === 0) {
            factors.push(divisor);
            remainingValue /= divisor;
        }

        divisor += divisor === 2 ? 1 : 2;
    }

    if (remainingValue > 1) {
        factors.push(remainingValue);
    }

    return factors;
}

function createClearSplitEchoes(
    startId: number,
    value: number
): readonly SplitEcho[] {
    return factorizeValue(value).map((factor, index) =>
        createSplitEcho(startId + index, factor, 'clear', index)
    );
}

export function NumberBlobDisplay({
    value,
    stageIndex = 0,
    isComboRunning = false,
    isStageRevealActive = false,
    mode = 'solo',
    size,
}: NumberBlobDisplayProps): JSX.Element {
    const [splitEchos, setSplitEchos] = useState<SplitEcho[]>([]);
    const [clearPop, setClearPop] = useState<ClearPop>();
    const [displayedValue, setDisplayedValue] = useState<number | undefined>(
        value
    );
    const valueClassName = (
        isStageRevealActive ? ' is-value-hidden' : ''
    ).trim();
    const [isImpactActive, setIsImpactActive] = useState(false);
    const previousValueRef = useRef<number | undefined>(undefined);
    const previousStageIndexRef = useRef<number | undefined>(undefined);
    const echoIdRef = useRef(0);
    const clearPrepTimerRef = useRef<number | undefined>(undefined);
    const clearEchoTimerRef = useRef<number | undefined>(undefined);
    const clearPopTimerRef = useRef<number | undefined>(undefined);
    const valueTimerRef = useRef<number | undefined>(undefined);
    const echoTimerRef = useRef<number | undefined>(undefined);
    const impactTimerRef = useRef<number | undefined>(undefined);

    useEffect(
        () => () => {
            clearTimer(clearPrepTimerRef.current);
            clearPrepTimerRef.current = undefined;
            clearTimer(clearEchoTimerRef.current);
            clearEchoTimerRef.current = undefined;
            clearTimer(clearPopTimerRef.current);
            clearPopTimerRef.current = undefined;
            clearTimer(valueTimerRef.current);
            valueTimerRef.current = undefined;
            clearTimer(echoTimerRef.current);
            echoTimerRef.current = undefined;
            clearTimer(impactTimerRef.current);
            impactTimerRef.current = undefined;
        },
        []
    );

    useEffect(() => {
        if (typeof value !== 'number') {
            clearTimer(clearPrepTimerRef.current);
            clearPrepTimerRef.current = undefined;
            clearTimer(clearEchoTimerRef.current);
            clearEchoTimerRef.current = undefined;
            clearTimer(clearPopTimerRef.current);
            clearPopTimerRef.current = undefined;
            clearTimer(valueTimerRef.current);
            valueTimerRef.current = undefined;
            clearTimer(echoTimerRef.current);
            echoTimerRef.current = undefined;
            clearTimer(impactTimerRef.current);
            impactTimerRef.current = undefined;
            setDisplayedValue(value);
            previousValueRef.current = value;
            previousStageIndexRef.current = stageIndex;
            return undefined;
        }

        const previousValue = previousValueRef.current;
        const previousStageIndex = previousStageIndexRef.current;

        if (typeof previousValue !== 'number') {
            setDisplayedValue(value);
            previousValueRef.current = value;
            previousStageIndexRef.current = stageIndex;
            return undefined;
        }

        const didStageAdvance = stageIndex > (previousStageIndex ?? stageIndex);

        if (didStageAdvance && previousValue > 1) {
            clearTimer(clearPrepTimerRef.current);
            clearPrepTimerRef.current = undefined;
            clearTimer(clearEchoTimerRef.current);
            clearEchoTimerRef.current = undefined;
            clearTimer(clearPopTimerRef.current);
            clearPopTimerRef.current = undefined;
            const clearEchoes = createClearSplitEchoes(
                echoIdRef.current,
                previousValue
            );
            const nextClearPop: ClearPop = {
                id: echoIdRef.current + clearEchoes.length,
                value: 1,
            };

            echoIdRef.current += clearEchoes.length + 1;
            setIsImpactActive(false);
            setDisplayedValue(1);

            clearPrepTimerRef.current = globalThis.setTimeout(
                () => {
                    if (clearEchoes.length > 0) {
                        setSplitEchos((currentEchos: readonly SplitEcho[]) => [
                            ...currentEchos,
                            ...clearEchoes,
                        ]);
                    }
                    setClearPop(nextClearPop);
                    setDisplayedValue(value);

                    clearEchoTimerRef.current = globalThis.setTimeout(
                        () => {
                            setSplitEchos(
                                (currentEchos: readonly SplitEcho[]) =>
                                    currentEchos.filter(
                                        (currentEcho) =>
                                            !clearEchoes.some(
                                                (clearEcho) =>
                                                    clearEcho.id ===
                                                    currentEcho.id
                                            )
                                    )
                            );
                            clearEchoTimerRef.current = undefined;
                        },
                        820,
                        undefined
                    );

                    clearPopTimerRef.current = globalThis.setTimeout(
                        () => {
                            setClearPop(
                                (currentClearPop: ClearPop | undefined) =>
                                    currentClearPop?.id === nextClearPop.id
                                        ? undefined
                                        : currentClearPop
                            );
                            clearPopTimerRef.current = undefined;
                        },
                        260,
                        undefined
                    );

                    clearPrepTimerRef.current = undefined;
                },
                clearPopPrepDurationMs,
                undefined
            );

            previousValueRef.current = value;
            previousStageIndexRef.current = stageIndex;

            return undefined;
        }

        if (value !== previousValue) {
            let poppedValue: number | undefined;

            if (
                stageIndex === previousStageIndex &&
                value > 1 &&
                value < previousValue
            ) {
                const nextPoppedValue = previousValue / value;

                if (Number.isInteger(nextPoppedValue)) {
                    poppedValue = nextPoppedValue;
                }
            }

            if (poppedValue !== undefined) {
                clearTimer(valueTimerRef.current);
                valueTimerRef.current = undefined;
                clearTimer(echoTimerRef.current);
                echoTimerRef.current = undefined;
                clearTimer(impactTimerRef.current);
                impactTimerRef.current = undefined;
                const echo = createSplitEcho(echoIdRef.current, poppedValue);

                echoIdRef.current++;
                setSplitEchos((currentEchos: readonly SplitEcho[]) => [
                    ...currentEchos,
                    echo,
                ]);

                valueTimerRef.current = globalThis.setTimeout(
                    () => {
                        setDisplayedValue(value);
                        setIsImpactActive(true);
                        valueTimerRef.current = undefined;
                    },
                    90,
                    undefined
                );

                echoTimerRef.current = globalThis.setTimeout(
                    () => {
                        setSplitEchos((currentEchos: readonly SplitEcho[]) =>
                            currentEchos.filter(
                                (currentEcho) => currentEcho.id !== echo.id
                            )
                        );
                        echoTimerRef.current = undefined;
                    },
                    820,
                    undefined
                );

                impactTimerRef.current = globalThis.setTimeout(
                    () => {
                        setIsImpactActive(false);
                        impactTimerRef.current = undefined;
                    },
                    610,
                    undefined
                );

                previousValueRef.current = value;
                previousStageIndexRef.current = stageIndex;

                return undefined;
            }

            clearTimer(impactTimerRef.current);
            impactTimerRef.current = undefined;
            setDisplayedValue(value);
            setIsImpactActive(true);

            impactTimerRef.current = globalThis.setTimeout(
                () => {
                    setIsImpactActive(false);
                    impactTimerRef.current = undefined;
                },
                610,
                undefined
            );

            previousValueRef.current = value;
            previousStageIndexRef.current = stageIndex;

            return undefined;
        }

        if (!isStageRevealActive) {
            setDisplayedValue(value);
        }

        previousValueRef.current = value;
        previousStageIndexRef.current = stageIndex;

        return undefined;
    }, [isStageRevealActive, stageIndex, value]);

    return (
        <div
            className={`number-blob-display number-blob-display-${mode}${
                isComboRunning ? ' is-combo-running' : ''
            }${size ? ` number-blob-display-size-${size}` : ''}`}
        >
            <div
                className={`number-blob-field${
                    clearPop || isStageRevealActive ? ' is-blob-hidden' : ''
                }`}
            >
                {clearPop ? (
                    <div
                        aria-hidden='true'
                        className='number-blob-clear-pop'
                        key={clearPop.id}
                    >
                        <span className='number-blob-clear-pop-value'>
                            {clearPop.value}
                        </span>
                    </div>
                ) : undefined}

                {splitEchos.map((echo) => (
                    <div
                        aria-hidden='true'
                        className={`number-blob-split-echo${
                            echo.variant === 'clear' ? ' is-clear-burst' : ''
                        }`}
                        key={echo.id}
                        style={
                            {
                                '--echo-angle': `${echo.angle}deg`,
                                '--echo-counter-angle': `${echo.counterAngle}deg`,
                                '--echo-distance': `${echo.distance}rem`,
                                '--echo-size': `${echo.size}rem`,
                            } as CSSProperties
                        }
                    >
                        <span className='number-blob-split-value'>
                            {echo.value}
                        </span>
                    </div>
                ))}

                <div
                    className={`number-main-blob-shell${
                        isImpactActive ? ' is-impact-active' : ''
                    }`}
                >
                    <div
                        className={`number-main-blob${
                            isStageRevealActive ? ' is-stage-reveal' : ''
                        }${clearPop ? ' is-cleared' : ''}`}
                    >
                        <strong className={valueClassName}>
                            {displayedValue}
                        </strong>
                    </div>
                </div>
            </div>
        </div>
    );
}

function clearTimer(timerId: number | undefined) {
    if (timerId === undefined) {
        return;
    }

    globalThis.clearTimeout(timerId);
}
