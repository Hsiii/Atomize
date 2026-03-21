import { useEffect, useLayoutEffect, useRef, useState } from 'react';
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
    targetId?: number;
    stageIndex?: number;
    stageAdvanceSolvedStateKey?: number;
    isComboRunning?: boolean;
    isFaultActive?: boolean;
    faultKey?: string;
    isStageRevealActive?: boolean;
    concealValues?: boolean;
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
    targetId,
    stageIndex,
    stageAdvanceSolvedStateKey,
    isComboRunning = false,
    isFaultActive = false,
    faultKey,
    isStageRevealActive = false,
    concealValues = false,
    mode = 'solo',
    size,
}: NumberBlobDisplayProps): JSX.Element {
    const resolvedTargetId =
        targetId ?? stageAdvanceSolvedStateKey ?? stageIndex ?? 0;
    const [splitEchos, setSplitEchos] = useState<SplitEcho[]>([]);
    const [clearPop, setClearPop] = useState<ClearPop>();
    const [displayedValue, setDisplayedValue] = useState<number | undefined>(
        value
    );
    const [availableSize, setAvailableSize] = useState<number>();
    const [isImpactActive, setIsImpactActive] = useState(false);
    const previousValueRef = useRef<number | undefined>(undefined);
    const previousTargetIdRef = useRef<number | undefined>(undefined);
    const echoIdRef = useRef(0);
    const clearPrepTimerRef = useRef<number | undefined>(undefined);
    const clearEchoTimerRef = useRef<number | undefined>(undefined);
    const clearPopTimerRef = useRef<number | undefined>(undefined);
    const valueTimerRef = useRef<number | undefined>(undefined);
    const echoTimerRef = useRef<number | undefined>(undefined);
    const impactTimerRef = useRef<number | undefined>(undefined);
    const containerRef = useRef<HTMLDivElement | null>(null);

    useLayoutEffect(() => {
        const container = containerRef.current;

        if (!container) {
            return undefined;
        }

        function updateAvailableSize(nextWidth: number, nextHeight: number) {
            const nextSize = Math.max(
                0,
                Math.floor(Math.min(nextWidth, nextHeight))
            );

            setAvailableSize((currentSize) =>
                currentSize === nextSize ? currentSize : nextSize
            );
        }

        function measureContainer() {
            const currentContainer = containerRef.current;

            if (!currentContainer) {
                return;
            }

            const styles = globalThis.getComputedStyle(currentContainer);
            const rect = currentContainer.getBoundingClientRect();
            const horizontalPadding =
                Number.parseFloat(styles.paddingLeft) +
                Number.parseFloat(styles.paddingRight);
            const verticalPadding =
                Number.parseFloat(styles.paddingTop) +
                Number.parseFloat(styles.paddingBottom);

            updateAvailableSize(
                Math.max(0, rect.width - horizontalPadding),
                Math.max(0, rect.height - verticalPadding)
            );
        }

        if (typeof ResizeObserver === 'undefined') {
            measureContainer();
            globalThis.addEventListener('resize', measureContainer);

            return () => {
                globalThis.removeEventListener('resize', measureContainer);
            };
        }

        const resizeObserver = new ResizeObserver(
            (entries: readonly ResizeObserverEntry[]) => {
                const entry = entries[0];

                updateAvailableSize(
                    entry.contentRect.width,
                    entry.contentRect.height
                );
            }
        );

        resizeObserver.observe(container);
        measureContainer();

        return () => {
            resizeObserver.disconnect();
        };
    }, []);

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
            previousTargetIdRef.current = resolvedTargetId;
            return undefined;
        }

        const previousValue = previousValueRef.current;
        const previousTargetId = previousTargetIdRef.current;

        if (typeof previousValue !== 'number') {
            setDisplayedValue(value);
            previousValueRef.current = value;
            previousTargetIdRef.current = resolvedTargetId;
            return undefined;
        }

        const didTargetRefresh =
            previousTargetId !== undefined &&
            resolvedTargetId !== previousTargetId;

        if (didTargetRefresh && previousValue > 1) {
            clearTimer(clearPrepTimerRef.current);
            clearPrepTimerRef.current = undefined;
            clearTimer(clearEchoTimerRef.current);
            clearEchoTimerRef.current = undefined;
            clearTimer(clearPopTimerRef.current);
            clearPopTimerRef.current = undefined;
            const clearEchoes = concealValues
                ? []
                : createClearSplitEchoes(echoIdRef.current, previousValue);

            echoIdRef.current += clearEchoes.length;
            setIsImpactActive(false);
            setClearPop(undefined);
            setDisplayedValue(previousValue);

            clearPrepTimerRef.current = globalThis.setTimeout(
                () => {
                    if (clearEchoes.length > 0) {
                        setSplitEchos((currentEchos: readonly SplitEcho[]) => [
                            ...currentEchos,
                            ...clearEchoes,
                        ]);
                    }

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

                    clearPrepTimerRef.current = undefined;
                },
                clearPopPrepDurationMs,
                undefined
            );

            previousValueRef.current = value;
            previousTargetIdRef.current = resolvedTargetId;

            return undefined;
        }

        if (value !== previousValue) {
            let poppedValue: number | undefined;

            if (!didTargetRefresh && value > 1 && value < previousValue) {
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
                previousTargetIdRef.current = resolvedTargetId;

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
            previousTargetIdRef.current = resolvedTargetId;

            return undefined;
        }

        setDisplayedValue(value);

        previousValueRef.current = value;
        previousTargetIdRef.current = resolvedTargetId;

        return undefined;
    }, [concealValues, isStageRevealActive, resolvedTargetId, value]);

    return (
        <div
            className={`number-blob-display number-blob-display-${mode}${
                isComboRunning ? ' is-combo-running' : ''
            }${size ? ` number-blob-display-size-${size}` : ''}`}
            ref={containerRef}
            style={
                availableSize
                    ? ({
                          '--number-blob-available-size': `${availableSize}px`,
                      } as CSSProperties)
                    : undefined
            }
        >
            <div
                className={`number-blob-field${clearPop ? ' is-blob-hidden' : ''}`}
            >
                {clearPop ? (
                    <div
                        aria-hidden='true'
                        className='number-blob-clear-pop'
                        key={clearPop.id}
                    >
                        <span className='number-blob-clear-pop-value'>
                            {concealValues ? '' : clearPop.value}
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
                                '--echo-size': `${concealValues ? 5.4 : echo.size}rem`,
                            } as CSSProperties
                        }
                    >
                        <span className='number-blob-split-value'>
                            {concealValues ? '' : echo.value}
                        </span>
                    </div>
                ))}

                <div
                    className={`number-main-blob-shell${
                        isImpactActive ? ' is-impact-active' : ''
                    }${isFaultActive ? ' is-fault-active' : ''}`}
                    key={isFaultActive ? faultKey : undefined}
                >
                    <div
                        className={`number-main-blob${
                            clearPop ? ' is-cleared' : ''
                        }${isStageRevealActive ? ' is-stage-reveal' : ''}`}
                        key={resolvedTargetId}
                    >
                        <strong
                            className={
                                isStageRevealActive ? ' is-value-hidden' : ''
                            }
                        >
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
