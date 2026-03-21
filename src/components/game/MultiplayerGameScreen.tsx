import { useLayoutEffect, useRef, useState } from 'react';
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

import './GamePlayScreen.css';
import './MultiplayerGameScreen.css';

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
    onBack: () => void | Promise<void>;
    onSubmit: (queue: readonly Prime[]) => Promise<void>;
};

export function MultiplayerGameScreen({
    playablePrimes,
    currentMultiplayerPlayer,
    multiplayerSnapshot,
    multiplayerPrimeQueue,
    isMultiplayerInputDisabled,
    isMultiplayerComboRunning,
    onBack,
    onSubmit,
}: MultiplayerGameScreenProps): JSX.Element {
    const isMatchFinished = multiplayerSnapshot?.status === 'finished';
    const isInputDisabled = isMultiplayerInputDisabled;
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
    useLayoutEffect(() => {
        visibleQueueRef.current = multiplayerPrimeQueue;
        setVisibleQueue(multiplayerPrimeQueue);
    }, [multiplayerPrimeQueue]);

    function setLocalQueue(nextQueue: readonly Prime[]) {
        const normalizedQueue = [...nextQueue];

        visibleQueueRef.current = normalizedQueue;
        setVisibleQueue(normalizedQueue);
    }

    function queuePrime(prime: Prime) {
        if (
            isInputDisabled ||
            visibleQueueRef.current.length >= COMBO_QUEUE_MAX_ITEMS
        ) {
            return;
        }

        setLocalQueue([...visibleQueueRef.current, prime]);
    }

    async function submitVisibleQueue() {
        if (
            isInputDisabled ||
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
            (visibleQueue.length > 0 || canSubmitSolvedStage),
        isComboRunning: isMultiplayerComboRunning,
        isInputDisabled,
        onBackspaceQueue: () => {
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
                <DesktopKeyboardHint />

                <BattleHpBar
                    damagePops={battle.damagePops.filter(
                        (damagePop) => damagePop.side === 'enemy'
                    )}
                    hp={battle.displayedEnemyHp}
                    impacts={battle.hpImpacts.enemy}
                    label={opponentPlayer?.name ?? uiText.opponent}
                    maxHp={multiplayerSnapshot?.maxHp ?? 1}
                    outerRef={battle.enemyHealthRef}
                    perfectActive={battle.perfectBurst?.side === 'enemy'}
                    side='enemy'
                />

                <section className='multiplayer-board' ref={battle.overlayRef}>
                    <div className='multiplayer-column multiplayer-column-self'>
                        <div
                            className='multiplayer-blob-anchor'
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

                    {battle.attackEffect ? (
                        <AttackEffectLayer attackEffect={battle.attackEffect} />
                    ) : undefined}
                </section>

                <BattleHpBar
                    damagePops={battle.damagePops.filter(
                        (damagePop) => damagePop.side === 'self'
                    )}
                    hp={battle.displayedSelfHp}
                    impacts={battle.hpImpacts.self}
                    label={currentMultiplayerPlayer?.name ?? uiText.you}
                    maxHp={multiplayerSnapshot?.maxHp ?? 1}
                    outerRef={battle.selfHealthRef}
                    perfectActive={battle.perfectBurst?.side === 'self'}
                    side='self'
                />

                <section className='multiplayer-controls-grid'>
                    <ComboQueuePanel queue={visibleQueue} />

                    <GameControls
                        backspaceDisabled={
                            isMultiplayerComboRunning ||
                            (visibleQueue.length === 0 &&
                                keyboard.bufferedPrimeInput === '')
                        }
                        keypadClassName='multiplayer-keypad'
                        onBackspace={keyboard.handleBackspace}
                        onPrimeTap={keyboard.handlePrimeTap}
                        onSubmit={keyboard.handleSubmit}
                        primes={playablePrimes}
                        submitDisabled={
                            isInputDisabled ||
                            (visibleQueue.length === 0 && !canSubmitSolvedStage)
                        }
                    />
                </section>

                {isMatchFinished && battle.isResultDialogVisible ? (
                    <DuoScoreDialog
                        currentPlayer={{
                            name: currentMultiplayerPlayer?.name ?? uiText.you,
                            maxCombo: currentMultiplayerPlayer?.maxCombo ?? 0,
                            atomized: currentMultiplayerPlayer?.stageIndex ?? 0,
                            isWinner: currentPlayerWon,
                        }}
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
}: BattleHpBarProps): JSX.Element {
    const hpRatio = Math.max(0, Math.min(100, (hp / Math.max(maxHp, 1)) * 100));
    const isDanger = hp > 0 && hpRatio < 25;
    const classNames = [
        'multiplayer-hp-bar',
        `multiplayer-hp-bar-${side}`,
        impacts?.hit ? 'multiplayer-hp-bar--hit' : '',
        impacts?.regen ? 'multiplayer-hp-bar--regen' : '',
        isDanger ? 'multiplayer-hp-bar--danger' : '',
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
