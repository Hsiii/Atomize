import { useEffect, useState } from 'react';
import type { JSX } from 'react';

import type { MenuMode, MultiplayerState } from '../app-state';
import { uiText } from '../app-state';

import './MultiplayerLobbyScreen.css';

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

    return (
        <main className='app-shell fullscreen-shell'>
            <BackButton onBack={onBack} />
            <section className='screen lobby-screen'>
                <div className='lobby-stack waiting-room-stack'>
                    <RoomCodePanel value={multiplayer.roomId} />

                    <section className='vs-matchup'>
                        <div className='vs-player vs-player-self'>
                            <span className='vs-player-tag'>P1</span>
                            <strong className='vs-player-name'>
                                {currentPlayer?.name ?? '-'}
                            </strong>
                        </div>

                        <div className='vs-divider'>
                            <span className='vs-label'>VS</span>
                        </div>

                        {opponentPlayer ? (
                            <div className='vs-player vs-player-opponent'>
                                <span className='vs-player-tag'>P2</span>
                                <strong className='vs-player-name'>
                                    {opponentPlayer.name}
                                </strong>
                            </div>
                        ) : (
                            <div className='vs-player vs-player-opponent vs-player-waiting'>
                                <span className='vs-player-tag'>P2</span>
                                <div className='vs-waiting-mark'>?</div>
                            </div>
                        )}
                    </section>

                    {isCountdown ? (
                        <div className='waiting-cta'>
                            <ActionButton
                                className='start-action'
                                disabled
                                variant='secondary'
                            >
                                {`${uiText.countdownPrefix} ${multiplayerCountdownValue ?? 3}`}
                            </ActionButton>
                        </div>
                    ) : (
                        <p className='vs-waiting-hint'>
                            {uiText.waitingForPlayer}
                        </p>
                    )}

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
