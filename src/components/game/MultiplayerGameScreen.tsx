import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import type { CSSProperties, JSX } from 'react';

import { uiText } from '../../app-state';
import type { Prime, RoomPlayer, RoomSnapshot } from '../../core';
import { useBattleAnimations } from '../../hooks/useBattleAnimations';
import type {
    AttackEffectState,
    DamagePop,
    SideHpImpacts,
} from '../../hooks/useBattleAnimations';
import { usePrimeKeyboardControls } from '../../hooks/usePrimeKeyboardControls';
import {
    getTutorialAction,
    getTutorialExpectedQueue,
    getTutorialHighlightedPrime,
    getTutorialHighlightTarget,
    getTutorialLesson,
    TutorialStep,
} from '../../lib/tutorial-config';

import './GamePlayScreen.css';
import './MultiplayerGameScreen.css';

import { ActionButton } from './ui/ActionButton';
import { COMBO_QUEUE_MAX_ITEMS, ComboQueuePanel } from './ui/ComboQueuePanel';
import { DesktopKeyboardHint } from './ui/DesktopKeyboardHint';
import { DuoScoreDialog } from './ui/DuoScoreDialog';
import { GameControls } from './ui/GameControls';
import { NumberBlobDisplay } from './ui/NumberBlobDisplay';

type MultiplayerGameScreenProps = {
    playablePrimes: Prime[];
    currentMultiplayerPlayer: RoomPlayer | undefined;
    multiplayerSnapshot: RoomSnapshot | undefined;
    multiplayerPrimeQueue: Prime[];
    isMultiplayerInputDisabled: boolean;
    isMultiplayerComboRunning: boolean;
    onAllowCpuAttack?: () => void;
    onBack: () => void | Promise<void>;
    onRematch?: () => void;
    onSubmit: (queue: readonly Prime[]) => Promise<void>;
    onTutorialComplete?: () => void;
    tutorialMode?: boolean;
};

export function MultiplayerGameScreen({
    playablePrimes,
    currentMultiplayerPlayer,
    multiplayerSnapshot,
    multiplayerPrimeQueue,
    isMultiplayerInputDisabled,
    isMultiplayerComboRunning,
    onAllowCpuAttack,
    onBack,
    onRematch,
    onSubmit,
    onTutorialComplete,
    tutorialMode = false,
}: MultiplayerGameScreenProps): JSX.Element {
    const isMatchFinished = multiplayerSnapshot?.status === 'finished';
    const opponentPlayer = multiplayerSnapshot?.players.find(
        (player) => player.id !== currentMultiplayerPlayer?.id
    );

    const battle = useBattleAnimations({
        currentPlayer: currentMultiplayerPlayer,
        opponentPlayer,
        snapshot: multiplayerSnapshot,
    });

    const [visibleQueue, setVisibleQueue] = useState<Prime[]>(
        multiplayerPrimeQueue
    );
    const visibleQueueRef = useRef(visibleQueue);
    const canSubmitSolvedStage =
        currentMultiplayerPlayer?.stage.remainingValue === 1;
    const currentPlayerWon =
        isMatchFinished &&
        Boolean(currentMultiplayerPlayer && currentMultiplayerPlayer.hp > 0);
    const tutorial = useBattleTutorial({
        battleVisualsBusy: battle.isAnimating,
        currentPlayer: currentMultiplayerPlayer,
        enabled: tutorialMode,
        isComboRunning: isMultiplayerComboRunning,
        lastEvent: multiplayerSnapshot?.lastEvent,
        onAllowCpuAttack,
        onTutorialComplete,
        opponentPlayer,
        queue: visibleQueue,
    });
    const isInputDisabled =
        isMultiplayerInputDisabled || tutorial.isInteractionBlocked;

    useLayoutEffect(() => {
        visibleQueueRef.current = multiplayerPrimeQueue;
        setVisibleQueue(multiplayerPrimeQueue);
    }, [multiplayerPrimeQueue]);

    useEffect(() => {
        if (
            !tutorialMode ||
            tutorial.expectedQueue === undefined ||
            visibleQueueRef.current.length === 0 ||
            hasQueuePrefix(visibleQueueRef.current, tutorial.expectedQueue)
        ) {
            return;
        }

        setLocalQueue([]);
    }, [tutorial.expectedQueue, tutorialMode]);

    function setLocalQueue(nextQueue: readonly Prime[]) {
        const normalizedQueue = [...nextQueue];

        visibleQueueRef.current = normalizedQueue;
        setVisibleQueue(normalizedQueue);
    }

    function queuePrime(prime: Prime) {
        if (
            isInputDisabled ||
            tutorial.getPrimeDisabledState?.(prime) === true ||
            visibleQueueRef.current.length >= COMBO_QUEUE_MAX_ITEMS
        ) {
            return;
        }

        setLocalQueue([...visibleQueueRef.current, prime]);
    }

    async function submitVisibleQueue() {
        if (
            isInputDisabled ||
            tutorial.isSubmitLocked ||
            (visibleQueueRef.current.length === 0 && !canSubmitSolvedStage)
        ) {
            return;
        }

        try {
            await onSubmit(visibleQueueRef.current);
        } catch {
            // Ignore submit failures to keep the input responsive.
        }
    }

    function handleSubmitClick() {
        submitVisibleQueue().catch(() => undefined);
    }
    const keyboard = usePrimeKeyboardControls({
        canSubmit:
            !isInputDisabled &&
            !tutorial.isSubmitLocked &&
            (visibleQueue.length > 0 || canSubmitSolvedStage),
        isComboRunning: isMultiplayerComboRunning,
        isInputDisabled,
        onBackspaceQueue: () => {
            if (tutorial.isBackspaceLocked) {
                return;
            }

            if (visibleQueueRef.current.length === 0) {
                return;
            }

            setLocalQueue(visibleQueueRef.current.slice(0, -1));
        },
        onPrimeTap: queuePrime,
        onSubmit: handleSubmitClick,
        playablePrimes,
        queueLength: visibleQueue.length,
    });

    return (
        <main className='app-shell fullscreen-shell'>
            <section className='screen game-screen multiplayer-game-screen'>
                {tutorialMode ? undefined : <DesktopKeyboardHint />}

                <section className='multiplayer-board' ref={battle.overlayRef}>
                    <BattleHpBar
                        damagePops={battle.damagePops.filter(
                            (damagePop) => damagePop.side === 'enemy'
                        )}
                        hp={battle.displayedEnemyHp}
                        impacts={battle.hpImpacts.enemy}
                        label={
                            tutorialMode
                                ? uiText.tutorialCpu
                                : (opponentPlayer?.name ?? uiText.opponent)
                        }
                        maxHp={multiplayerSnapshot?.maxHp ?? 1}
                        outerRef={battle.enemyHealthRef}
                        perfectActive={battle.perfectBurst?.side === 'enemy'}
                        side='enemy'
                        tutorialHighlighted={
                            tutorial.highlightTarget === 'enemy-hp'
                        }
                    />

                    <div className='multiplayer-column multiplayer-column-enemy'>
                        <div
                            className='multiplayer-blob-anchor'
                            ref={battle.enemyBlobRef}
                        >
                            <NumberBlobDisplay
                                concealValues
                                isComboRunning={false}
                                isStageRevealActive={
                                    battle.isOpponentRevealActive
                                }
                                mode='multiplayer'
                                size='enemy'
                                targetId={opponentPlayer?.stageIndex}
                                value={opponentPlayer?.stage.targetValue}
                            />
                        </div>
                    </div>

                    <div className='multiplayer-column multiplayer-column-self'>
                        <div
                            className={`multiplayer-blob-anchor${tutorial.highlightTarget === 'self-blob' ? ' tutorial-highlight-frame' : ''}`}
                            ref={battle.selfBlobRef}
                        >
                            <NumberBlobDisplay
                                faultKey={battle.selfFaultToken}
                                isComboRunning={isMultiplayerComboRunning}
                                isFaultActive={
                                    battle.selfFaultToken !== undefined
                                }
                                isStageRevealActive={
                                    battle.isBlobRevealActive &&
                                    battle.selfFaultToken === undefined &&
                                    !battle.hasPendingSelfFaultEvent
                                }
                                mode='multiplayer'
                                size='self'
                                targetId={currentMultiplayerPlayer?.stageIndex}
                                value={
                                    currentMultiplayerPlayer?.stage
                                        .remainingValue
                                }
                            />
                        </div>
                    </div>

                    <BattleHpBar
                        damagePops={battle.damagePops.filter(
                            (damagePop) => damagePop.side === 'self'
                        )}
                        hp={battle.displayedSelfHp}
                        impacts={battle.hpImpacts.self}
                        label={
                            tutorialMode
                                ? uiText.tutorialYou
                                : (currentMultiplayerPlayer?.name ?? uiText.you)
                        }
                        maxHp={multiplayerSnapshot?.maxHp ?? 1}
                        outerRef={battle.selfHealthRef}
                        perfectActive={battle.perfectBurst?.side === 'self'}
                        side='self'
                        tutorialHighlighted={
                            tutorial.highlightTarget === 'self-hp'
                        }
                    />

                    {battle.attackEffect ? (
                        <AttackEffectLayer attackEffect={battle.attackEffect} />
                    ) : undefined}
                </section>

                <section className='multiplayer-controls-grid'>
                    <div
                        className={
                            tutorial.highlightTarget === 'queue'
                                ? 'tutorial-highlight-frame tutorial-highlight-frame-queue'
                                : undefined
                        }
                    >
                        <ComboQueuePanel queue={visibleQueue} />
                    </div>

                    <GameControls
                        backspaceDisabled={
                            tutorial.isBackspaceLocked ||
                            isMultiplayerComboRunning ||
                            (visibleQueue.length === 0 &&
                                keyboard.bufferedPrimeInput === '')
                        }
                        getPrimeDisabledState={tutorial.getPrimeDisabledState}
                        highlightedPrime={tutorial.highlightedPrime}
                        keypadClassName='multiplayer-keypad'
                        onBackspace={keyboard.handleBackspace}
                        onPrimeTap={keyboard.handlePrimeTap}
                        onSubmit={keyboard.handleSubmit}
                        primes={playablePrimes}
                        submitClassName={
                            tutorial.highlightTarget === 'submit'
                                ? 'tutorial-highlight-button'
                                : undefined
                        }
                        submitDisabled={
                            isInputDisabled ||
                            tutorial.isSubmitLocked ||
                            (visibleQueue.length === 0 && !canSubmitSolvedStage)
                        }
                    />
                </section>

                {tutorial.lesson ? (
                    <TutorialCoachCard
                        actionLabel={tutorial.lesson.actionLabel}
                        body={tutorial.lesson.body}
                        className={
                            tutorial.lesson.position === 'top'
                                ? 'multiplayer-tutorial-hint-safe-top'
                                : undefined
                        }
                        onAction={tutorial.handleAction}
                        onSecondaryAction={
                            tutorial.canSkipTutorial
                                ? () => {
                                      Promise.resolve(onBack()).catch(
                                          () => undefined
                                      );
                                  }
                                : undefined
                        }
                        position={tutorial.lesson.position}
                        secondaryActionLabel={
                            tutorial.canSkipTutorial
                                ? uiText.skipTutorial
                                : undefined
                        }
                        title={tutorial.lesson.title}
                    />
                ) : undefined}

                {isMatchFinished && battle.isResultDialogVisible ? (
                    <DuoScoreDialog
                        currentPlayer={{
                            name: currentMultiplayerPlayer?.name ?? uiText.you,
                            maxCombo: currentMultiplayerPlayer?.maxCombo ?? 0,
                            atomized: currentMultiplayerPlayer?.stageIndex ?? 0,
                            isWinner: currentPlayerWon,
                        }}
                        onRematch={onRematch}
                        onReturnHome={onBack}
                        opponent={{
                            name: opponentPlayer?.name ?? uiText.opponent,
                            maxCombo: opponentPlayer?.maxCombo ?? 0,
                            atomized: opponentPlayer?.stageIndex ?? 0,
                            isWinner: !currentPlayerWon,
                        }}
                        title={
                            currentPlayerWon ? uiText.victory : uiText.defeat
                        }
                    />
                ) : undefined}
            </section>
        </main>
    );
}

type BattleHpBarProps = {
    damagePops: readonly DamagePop[];
    hp: number;
    impacts: SideHpImpacts | undefined;
    label: string;
    maxHp: number;
    outerRef: React.RefObject<HTMLDivElement | null>;
    perfectActive: boolean | undefined;
    side: 'enemy' | 'self';
    tutorialHighlighted?: boolean;
};

function BattleHpBar({
    hp,
    impacts,
    damagePops,
    label,
    maxHp,
    outerRef,
    perfectActive,
    side,
    tutorialHighlighted,
}: BattleHpBarProps): JSX.Element {
    const hpRatio = Math.max(0, Math.min(100, (hp / Math.max(maxHp, 1)) * 100));
    const isDanger = hp > 0 && hpRatio < 25;
    const classNames = [
        'multiplayer-hp-bar',
        `multiplayer-hp-bar-${side}`,
        impacts?.hit ? 'multiplayer-hp-bar--hit' : '',
        impacts?.regen ? 'multiplayer-hp-bar--regen' : '',
        isDanger ? 'multiplayer-hp-bar--danger' : '',
        tutorialHighlighted ? 'tutorial-highlight-frame' : '',
    ]
        .filter(Boolean)
        .join(' ');

    return (
        <div
            className={classNames}
            ref={outerRef}
            style={
                {
                    '--hp-hit-duration': `${impacts?.hit?.durationMs ?? 0}ms`,
                    '--hp-regen-duration': `${impacts?.regen?.durationMs ?? 0}ms`,
                } as CSSProperties
            }
        >
            <div className='multiplayer-hp-copy'>
                <span className='multiplayer-hp-name'>{label}</span>
                {perfectActive ? (
                    <span
                        aria-hidden='true'
                        className='multiplayer-perfect-tag'
                    >
                        PERFECT
                    </span>
                ) : undefined}
                <span className='multiplayer-hp-stat'>{hp}</span>
            </div>

            <div className='multiplayer-hp-track'>
                <span
                    className='multiplayer-hp-fill'
                    style={{ width: `${hpRatio}%` }}
                />
            </div>

            {damagePops.map((damagePop, index) => (
                <span
                    className={`multiplayer-hp-pop multiplayer-hp-pop-${damagePop.kind}`}
                    key={damagePop.id}
                    style={
                        {
                            '--multiplayer-hp-pop-index': index,
                            '--multiplayer-hp-pop-count': damagePops.length,
                        } as CSSProperties
                    }
                >
                    {damagePop.kind === 'regen' ? '+' : '-'}
                    {damagePop.value}
                </span>
            ))}
        </div>
    );
}

function useBattleTutorial({
    battleVisualsBusy,
    currentPlayer,
    enabled,
    isComboRunning,
    lastEvent,
    onAllowCpuAttack,
    onTutorialComplete,
    opponentPlayer,
    queue,
}: {
    battleVisualsBusy: boolean;
    currentPlayer: RoomPlayer | undefined;
    enabled: boolean;
    isComboRunning: boolean;
    lastEvent: RoomSnapshot['lastEvent'];
    onAllowCpuAttack: (() => void) | undefined;
    onTutorialComplete: (() => void) | undefined;
    opponentPlayer: RoomPlayer | undefined;
    queue: readonly Prime[];
}) {
    const [step, setStep] = useState<TutorialStep>(
        enabled ? TutorialStep.Intro : TutorialStep.Done
    );
    const [enemyAttackSeen, setEnemyAttackSeen] = useState(false);
    const [enemyTurnAcknowledged, setEnemyTurnAcknowledged] = useState(false);
    const [selfPenaltySeen, setSelfPenaltySeen] = useState(false);
    const [overflowPenaltySeen, setOverflowPenaltySeen] = useState(false);
    const trackedEventIdRef = useRef<number | undefined>(undefined);

    useEffect(() => {
        if (!enabled) {
            setStep(TutorialStep.Done);
            setEnemyAttackSeen(false);
            setEnemyTurnAcknowledged(false);
            setSelfPenaltySeen(false);
            setOverflowPenaltySeen(false);
            trackedEventIdRef.current = undefined;
            return;
        }

        setStep(TutorialStep.Intro);
        setEnemyAttackSeen(false);
        setEnemyTurnAcknowledged(false);
        setSelfPenaltySeen(false);
        setOverflowPenaltySeen(false);
        trackedEventIdRef.current = undefined;
    }, [enabled]);

    useEffect(() => {
        if (
            !enabled ||
            !lastEvent ||
            trackedEventIdRef.current === lastEvent.id
        ) {
            return;
        }

        trackedEventIdRef.current = lastEvent.id;

        if (
            lastEvent.sourcePlayerId === opponentPlayer?.id &&
            (lastEvent.type === 'attack' || lastEvent.type === 'finish')
        ) {
            setEnemyAttackSeen(true);
        }

        if (
            lastEvent.sourcePlayerId === currentPlayer?.id &&
            lastEvent.type === 'self-hit'
        ) {
            setSelfPenaltySeen(true);

            if (
                step === TutorialStep.OverflowQueue ||
                step === TutorialStep.OverflowSubmit
            ) {
                setOverflowPenaltySeen(true);
            }
        }
    }, [currentPlayer?.id, enabled, lastEvent, opponentPlayer?.id, step]);

    useEffect(() => {
        if (!enabled || !currentPlayer) {
            return;
        }

        if (step === TutorialStep.StageOnePrime && hasQueue(queue, [2])) {
            setStep(TutorialStep.StageOneQueue);
            return;
        }

        if (step === TutorialStep.StageOneQueue) {
            if (queue.length === 0) {
                setStep(TutorialStep.StageOnePrime);
                return;
            }

            if (hasQueue(queue, [2, 3])) {
                setStep(TutorialStep.StageOneSubmit);
                return;
            }
        }

        if (step === TutorialStep.StageOneSubmit) {
            if (currentPlayer.stageIndex >= 1 && !battleVisualsBusy) {
                setStep(TutorialStep.StageOneResult);
            }

            return;
        }

        if (step === TutorialStep.StageTwoPrime && hasQueue(queue, [2])) {
            setStep(TutorialStep.StageTwoQueue);
            return;
        }

        if (
            step === TutorialStep.StageTwoQueue &&
            queue.length === 0 &&
            currentPlayer.stage.remainingValue ===
                currentPlayer.stage.targetValue
        ) {
            setStep(TutorialStep.StageTwoPrime);
            return;
        }

        if (step === TutorialStep.StageTwoQueue) {
            if (
                currentPlayer.stageIndex >= 1 &&
                currentPlayer.stage.remainingValue === 5
            ) {
                setStep(TutorialStep.StageTwoResult);
            }

            return;
        }

        if (step === TutorialStep.StageTwoFinish && hasQueue(queue, [5])) {
            setStep(TutorialStep.StageTwoFinishSubmit);
            return;
        }

        if (step === TutorialStep.StageTwoFinishSubmit) {
            if (currentPlayer.stageIndex >= 2 && !battleVisualsBusy) {
                setStep(TutorialStep.EnemyTurn);
            }

            return;
        }

        if (
            step === TutorialStep.EnemyTurn &&
            enemyAttackSeen &&
            !battleVisualsBusy
        ) {
            setStep(TutorialStep.EnemyAttack);
            return;
        }

        if (
            step === TutorialStep.PerfectSolveQueue &&
            hasQueue(queue, [2, 7])
        ) {
            setStep(TutorialStep.PerfectSolveSubmit);
            return;
        }

        if (step === TutorialStep.PerfectSolveSubmit) {
            if (currentPlayer.stageIndex >= 3 && !battleVisualsBusy) {
                setStep(TutorialStep.PerfectSolveResult);
            }

            return;
        }

        if (
            step === TutorialStep.TryWrongPrime &&
            selfPenaltySeen &&
            !battleVisualsBusy
        ) {
            setStep(TutorialStep.WrongPrimeResult);
        }

        if (
            (step === TutorialStep.OverflowQueue ||
                step === TutorialStep.OverflowSubmit) &&
            overflowPenaltySeen &&
            !battleVisualsBusy
        ) {
            setStep(TutorialStep.OverflowResult);
        }

        if (
            step === TutorialStep.OverflowClear &&
            currentPlayer.stageIndex >= 4 &&
            !battleVisualsBusy
        ) {
            setStep(TutorialStep.Summary);
        }
    }, [
        battleVisualsBusy,
        currentPlayer,
        enabled,
        enemyAttackSeen,
        overflowPenaltySeen,
        selfPenaltySeen,
        queue,
        step,
    ]);

    if (!enabled) {
        return {
            canSkipTutorial: false,
            expectedQueue: undefined,
            getPrimeDisabledState: undefined,
            handleAction: undefined,
            highlightedPrime: undefined,
            highlightTarget: undefined,
            isBackspaceLocked: false,
            isInteractionBlocked: false,
            isSubmitLocked: false,
            lesson: undefined,
        };
    }

    const resolvedStep = resolveTutorialQueueStep(step, queue, isComboRunning);
    const lesson =
        resolvedStep === TutorialStep.EnemyTurn && enemyTurnAcknowledged
            ? undefined
            : getTutorialLesson(resolvedStep);
    const expectedQueue = getTutorialExpectedQueue(resolvedStep);
    const highlightTarget = getTutorialHighlightTarget(resolvedStep, queue);
    const isInteractionBlocked =
        lesson?.isBlocking === true ||
        (resolvedStep === TutorialStep.EnemyTurn && enemyTurnAcknowledged);
    const highlightedPrime = getTutorialHighlightedPrime(resolvedStep, queue);
    const isSubmitLocked =
        !isInteractionBlocked &&
        (resolvedStep === TutorialStep.StageOnePrime ||
            resolvedStep === TutorialStep.StageOneQueue ||
            resolvedStep === TutorialStep.StageTwoPrime ||
            resolvedStep === TutorialStep.StageTwoFinish ||
            (resolvedStep === TutorialStep.StageTwoQueue &&
                !hasQueue(queue, [2, 3])) ||
            resolvedStep === TutorialStep.EnemyTurn ||
            (resolvedStep === TutorialStep.StageOneSubmit &&
                !hasQueue(queue, [2, 3])) ||
            (resolvedStep === TutorialStep.StageTwoFinishSubmit &&
                !hasQueue(queue, [5])) ||
            resolvedStep === TutorialStep.PerfectSolveQueue ||
            (resolvedStep === TutorialStep.PerfectSolveSubmit &&
                !hasQueue(queue, [2, 7])) ||
            (resolvedStep === TutorialStep.TryWrongPrime &&
                !hasQueue(queue, [2])) ||
            resolvedStep === TutorialStep.OverflowQueue ||
            (resolvedStep === TutorialStep.OverflowSubmit &&
                !hasQueue(queue, [3, 7, 2])));

    const handleAction = () => {
        const action = getTutorialAction(step);

        if (action.actionEffect === 'allow-cpu-attack') {
            setEnemyTurnAcknowledged(true);
            onAllowCpuAttack?.();
            return;
        }

        if (action.actionEffect === 'complete-tutorial') {
            onTutorialComplete?.();
            setStep(TutorialStep.Done);
            return;
        }

        if (action.nextActionStep) {
            setStep(action.nextActionStep);
        }
    };

    return {
        canSkipTutorial: resolvedStep === TutorialStep.Intro,
        expectedQueue,
        getPrimeDisabledState(prime: Prime) {
            if (isInteractionBlocked) {
                return true;
            }

            const allowedPrime = getTutorialAllowedPrime(resolvedStep, queue);
            if (allowedPrime !== undefined) {
                return prime !== allowedPrime;
            }

            return locksTutorialPrimeInput(resolvedStep, queue);
        },
        handleAction,
        highlightedPrime,
        highlightTarget,
        isBackspaceLocked: step !== TutorialStep.Done,
        isInteractionBlocked,
        isSubmitLocked,
        lesson,
    };
}

function resolveTutorialQueueStep(
    step: TutorialStep,
    queue: readonly Prime[],
    isComboRunning: boolean
): TutorialStep {
    if (isComboRunning) {
        return step;
    }

    if (
        step === TutorialStep.StageOnePrime ||
        step === TutorialStep.StageOneQueue
    ) {
        if (hasQueue(queue, [2, 3])) {
            return TutorialStep.StageOneSubmit;
        }

        if (hasQueue(queue, [2])) {
            return TutorialStep.StageOneQueue;
        }

        return TutorialStep.StageOnePrime;
    }

    if (
        step === TutorialStep.StageTwoPrime ||
        step === TutorialStep.StageTwoQueue
    ) {
        if (hasQueue(queue, [2, 3]) || hasQueue(queue, [2])) {
            return TutorialStep.StageTwoQueue;
        }

        return TutorialStep.StageTwoPrime;
    }

    if (step === TutorialStep.StageTwoFinish) {
        return hasQueue(queue, [5]) ? TutorialStep.StageTwoFinishSubmit : step;
    }

    if (
        step === TutorialStep.PerfectSolveQueue ||
        step === TutorialStep.PerfectSolveSubmit
    ) {
        if (hasQueue(queue, [2, 7])) {
            return TutorialStep.PerfectSolveSubmit;
        }

        return TutorialStep.PerfectSolveQueue;
    }

    if (
        step === TutorialStep.OverflowQueue ||
        step === TutorialStep.OverflowSubmit
    ) {
        if (hasQueue(queue, [3, 7, 2])) {
            return TutorialStep.OverflowSubmit;
        }

        return TutorialStep.OverflowQueue;
    }

    return step;
}

function hasQueuePrefix(
    queue: readonly Prime[],
    expectedQueue: readonly Prime[]
) {
    return (
        queue.length <= expectedQueue.length &&
        queue.every((prime, index) => prime === expectedQueue[index])
    );
}

function getTutorialAllowedPrime(
    step: TutorialStep,
    queue: readonly Prime[]
): Prime | undefined {
    if (!isTutorialPrimeEntryStep(step)) {
        return undefined;
    }

    const expectedQueue = getTutorialExpectedQueue(step);

    if (
        expectedQueue === undefined ||
        !hasQueuePrefix(queue, expectedQueue) ||
        queue.length >= expectedQueue.length
    ) {
        return undefined;
    }

    return expectedQueue[queue.length];
}

function locksTutorialPrimeInput(step: TutorialStep, queue: readonly Prime[]) {
    if (!isTutorialPrimeEntryStep(step)) {
        return getTutorialExpectedQueue(step) !== undefined;
    }

    const expectedQueue = getTutorialExpectedQueue(step);

    if (expectedQueue === undefined) {
        return false;
    }

    return (
        !hasQueuePrefix(queue, expectedQueue) ||
        queue.length >= expectedQueue.length
    );
}

function hasQueue(queue: readonly Prime[], expectedQueue: readonly Prime[]) {
    return (
        queue.length === expectedQueue.length &&
        expectedQueue.every((prime, index) => queue[index] === prime)
    );
}

function isTutorialPrimeEntryStep(step: TutorialStep) {
    return (
        step === TutorialStep.StageOnePrime ||
        step === TutorialStep.StageOneQueue ||
        step === TutorialStep.StageTwoPrime ||
        step === TutorialStep.StageTwoQueue ||
        step === TutorialStep.StageTwoFinish ||
        step === TutorialStep.PerfectSolveQueue ||
        step === TutorialStep.TryWrongPrime ||
        step === TutorialStep.OverflowQueue
    );
}

function TutorialCoachCard({
    actionLabel,
    body,
    className,
    onAction,
    onSecondaryAction,
    position,
    secondaryActionLabel,
    title,
}: {
    actionLabel?: string;
    body: string;
    className?: string;
    onAction: (() => void) | undefined;
    onSecondaryAction?: (() => void) | undefined;
    position: 'bottom' | 'top';
    secondaryActionLabel?: string;
    title: string;
}): JSX.Element {
    const classNames = [
        'tutorial-hint',
        `tutorial-hint--${position}`,
        className,
    ]
        .filter(Boolean)
        .join(' ');

    return (
        <section className={classNames}>
            <h2 className='tutorial-hint-title'>{title}</h2>
            <p className='tutorial-hint-body'>{body}</p>
            {(actionLabel && onAction) ||
            (secondaryActionLabel && onSecondaryAction) ? (
                <div className='tutorial-hint-actions'>
                    {actionLabel && onAction ? (
                        <ActionButton onClick={onAction} variant='primary'>
                            {actionLabel}
                        </ActionButton>
                    ) : undefined}
                    {secondaryActionLabel && onSecondaryAction ? (
                        <ActionButton
                            onClick={onSecondaryAction}
                            variant='secondary'
                        >
                            {secondaryActionLabel}
                        </ActionButton>
                    ) : undefined}
                </div>
            ) : undefined}
        </section>
    );
}

function AttackEffectLayer({
    attackEffect,
}: {
    attackEffect: AttackEffectState;
}): JSX.Element {
    return (
        <div aria-hidden='true' className='multiplayer-attack-layer'>
            {attackEffect.particles.map((particle) => (
                <span
                    className={`multiplayer-attack-particle multiplayer-attack-particle-${particle.side} multiplayer-attack-particle-${particle.shape}`}
                    key={`${attackEffect.id}-${particle.id}`}
                    style={
                        {
                            '--particle-size': `${particle.size}px`,
                            '--particle-x': `${particle.x}px`,
                            '--particle-y': `${particle.y}px`,
                            '--particle-opacity': particle.opacity,
                        } as CSSProperties
                    }
                />
            ))}
        </div>
    );
}
