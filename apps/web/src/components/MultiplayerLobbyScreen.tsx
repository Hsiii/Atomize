import { useEffect, useState } from 'react';
import type { JSX } from 'react';

import type { MenuMode, MultiplayerState } from '../app-state';
import { uiText } from '../app-state';
import { ActionButton } from './ActionButton';
import { BackButton } from './BackButton';
import { RoomCodePanel } from './RoomCodePanel';

type MultiplayerLobbyScreenProps = {
    menuMode: MenuMode;
    multiplayer: MultiplayerState;
    multiplayerCountdownValue: number | null;
    transientToastId: number;
    transientToastMessage: string | null;
    isJoinPending: boolean;
    roomIdInput: string;
    onBack: () => void | Promise<void>;
    onRoomIdInputChange: (value: string) => void;
    onJoinRoom: () => void | Promise<void>;
    onCreateRoom: () => void | Promise<void>;
    onGuestReady: () => void | Promise<void>;
    onHostStart: () => void | Promise<void>;
    canStartRoomCountdown: boolean;
};

export function MultiplayerLobbyScreen({
    menuMode,
    multiplayer,
    multiplayerCountdownValue,
    transientToastId,
    transientToastMessage,
    isJoinPending,
    roomIdInput,
    onBack,
    onRoomIdInputChange,
    onJoinRoom,
    onCreateRoom,
    onGuestReady,
    onHostStart,
    canStartRoomCountdown,
}: MultiplayerLobbyScreenProps): JSX.Element {
    const [localToastMessage, setLocalToastMessage] = useState<
        string | undefined
    >(undefined);
    const [visibleTransientToastMessage, setVisibleTransientToastMessage] =
        useState<string | undefined>(undefined);
    const isJoinFlow = menuMode === 'join-room';
    const shouldShowWaitingRoom = Boolean(multiplayer.roomId);
    const isJoinButtonReady = roomIdInput.length === 4;
    const isJoinButtonDisabled = isJoinPending || !isJoinButtonReady;
    const activeToastMessage =
        localToastMessage ?? visibleTransientToastMessage;
    let createOrJoinButtonText: string = uiText.createRoom;

    if (isJoinFlow) {
        createOrJoinButtonText = isJoinPending ? uiText.findingRoom : uiText.go;
    }

    const currentPlayer = multiplayer.snapshot?.players.find(
        (player) => player.id === multiplayer.playerId
    );
    const opponentPlayer = multiplayer.snapshot?.players.find(
        (player) => player.id !== multiplayer.playerId
    );
    const isCountdown = multiplayer.snapshot?.status === 'countdown';
    const readyButtonDisabled = !currentPlayer || isCountdown;
    const guestButtonText = currentPlayer?.ready
        ? `${uiText.readyWaiting} ${opponentPlayer?.name ?? uiText.opponent}`
        : uiText.ready;

    function handleActionError() {
        setLocalToastMessage(uiText.serverOffline);
    }

    function runAsyncAction(action: () => void | Promise<void>) {
        Promise.resolve().then(action).catch(handleActionError);
    }

    useEffect(() => {
        if (!localToastMessage) {
            return undefined;
        }

        const timer = globalThis.setTimeout(
            (nextMessage: undefined) => {
                setLocalToastMessage(nextMessage);
            },
            2200,
            undefined
        );

        return () => {
            globalThis.clearTimeout(timer);
        };
    }, [localToastMessage]);

    useEffect(() => {
        if (!transientToastMessage) {
            setVisibleTransientToastMessage(undefined);
            return undefined;
        }

        setVisibleTransientToastMessage(transientToastMessage);

        const timer = globalThis.setTimeout(
            (nextMessage: undefined) => {
                setVisibleTransientToastMessage(nextMessage);
            },
            2200,
            undefined
        );

        return () => {
            globalThis.clearTimeout(timer);
        };
    }, [transientToastId, transientToastMessage]);

    function handleCreateOrJoinClick() {
        if (!isJoinFlow) {
            runAsyncAction(onCreateRoom);
            return;
        }

        if (!isJoinButtonReady) {
            setLocalToastMessage(uiText.joinIncompleteToast);
            return;
        }

        if (isJoinPending) {
            return;
        }

        runAsyncAction(onJoinRoom);
    }

    if (!multiplayer.roomId && !shouldShowWaitingRoom) {
        return (
            <main className='app-shell fullscreen-shell'>
                <BackButton onBack={onBack} />
                <section className='screen lobby-screen'>
                    <div className='lobby-stack waiting-room-stack'>
                        <RoomCodePanel
                            editable
                            onChange={onRoomIdInputChange}
                            value={roomIdInput}
                        />

                        <div className='waiting-cta'>
                            <ActionButton
                                aria-disabled={
                                    isJoinFlow && isJoinButtonDisabled
                                }
                                className={
                                    isJoinFlow && isJoinButtonDisabled
                                        ? 'start-action is-disabled'
                                        : 'start-action'
                                }
                                onClick={handleCreateOrJoinClick}
                                variant='secondary'
                            >
                                {createOrJoinButtonText}
                            </ActionButton>
                        </div>

                        {activeToastMessage ? (
                            <div
                                aria-live='polite'
                                className='waiting-toast-layer'
                            >
                                <div className='waiting-toast'>
                                    {activeToastMessage}
                                </div>
                            </div>
                        ) : undefined}
                    </div>
                </section>
            </main>
        );
    }

    function handleHostStartClick() {
        if (!canStartRoomCountdown) {
            setLocalToastMessage(uiText.startBlockedToast);
            return;
        }

        runAsyncAction(onHostStart);
    }

    function handleGuestReadyClick() {
        runAsyncAction(onGuestReady);
    }

    let waitingRoomAction: JSX.Element;

    if (isCountdown) {
        waitingRoomAction = (
            <ActionButton className='start-action' disabled variant='secondary'>
                {`${uiText.countdownPrefix} ${multiplayerCountdownValue ?? 3}`}
            </ActionButton>
        );
    } else if (multiplayer.isHost) {
        waitingRoomAction = (
            <ActionButton
                aria-disabled={!canStartRoomCountdown}
                className={
                    canStartRoomCountdown
                        ? 'start-action'
                        : 'start-action is-disabled'
                }
                onClick={handleHostStartClick}
                variant='secondary'
            >
                {uiText.start}
            </ActionButton>
        );
    } else {
        waitingRoomAction = (
            <ActionButton
                className='start-action'
                disabled={readyButtonDisabled}
                onClick={handleGuestReadyClick}
                variant='secondary'
            >
                {guestButtonText}
            </ActionButton>
        );
    }

    return (
        <main className='app-shell fullscreen-shell'>
            <BackButton onBack={onBack} />
            <section className='screen lobby-screen'>
                <div className='lobby-stack waiting-room-stack'>
                    <RoomCodePanel value={multiplayer.roomId} />

                    <section className='scoreboard player-scoreboard lobby-scoreboard waiting-room-grid'>
                        <div className='player-card waiting-player-card active'>
                            <p className='label'>YOU</p>
                            <strong>{currentPlayer?.name ?? '-'}</strong>
                        </div>

                        {opponentPlayer ? (
                            <div className='player-card waiting-player-card'>
                                <p className='label'>OPPONENT</p>
                                <strong>{opponentPlayer.name}</strong>
                                {opponentPlayer.ready ? (
                                    <span className='waiting-ready-badge'>
                                        {uiText.readyBadge}
                                    </span>
                                ) : undefined}
                            </div>
                        ) : (
                            <div className='player-card waiting-player-card waiting-placeholder-card'>
                                <p className='label'>OPPONENT</p>
                                <div
                                    aria-hidden='true'
                                    className='waiting-placeholder-mark'
                                >
                                    ?
                                </div>
                            </div>
                        )}
                    </section>

                    <div className='waiting-cta'>{waitingRoomAction}</div>

                    {activeToastMessage ? (
                        <div aria-live='polite' className='waiting-toast-layer'>
                            <div className='waiting-toast'>
                                {activeToastMessage}
                            </div>
                        </div>
                    ) : undefined}
                </div>
            </section>
        </main>
    );
}
