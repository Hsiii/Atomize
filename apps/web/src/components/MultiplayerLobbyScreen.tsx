import { useEffect, useState } from 'react';
import type { JSX } from 'react';
import { ArrowLeft, Copy, Check } from 'lucide-react';

import type { MenuMode, MultiplayerState, OnlineLobbyUser } from '../app-state';
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
    onlineUsers: OnlineLobbyUser[];
    onBack: () => void | Promise<void>;
    onRoomIdInputChange: (value: string) => void;
    onJoinRoom: () => void | Promise<void>;
    onCreateRoom: () => void | Promise<void>;
    onInvitePlayer: (targetPlayerId: string) => void | Promise<void>;
};

export function MultiplayerLobbyScreen({
    menuMode,
    multiplayer,
    multiplayerCountdownValue,
    transientToastId,
    transientToastMessage,
    isJoinPending,
    roomIdInput,
    onlineUsers,
    onBack,
    onRoomIdInputChange,
    onJoinRoom,
    onCreateRoom,
    onInvitePlayer,
}: MultiplayerLobbyScreenProps): JSX.Element {
    const [localToastMessage, setLocalToastMessage] = useState<
        string | undefined
    >(undefined);
    const [visibleTransientToastMessage, setVisibleTransientToastMessage] =
        useState<string | undefined>(undefined);
    const [codeCopied, setCodeCopied] = useState(false);
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
    const hasOpponent = Boolean(opponentPlayer);

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

    function handleCopyCode() {
        if (!multiplayer.roomId) {
            return;
        }

        void navigator.clipboard.writeText(multiplayer.roomId).then(() => {
            setCodeCopied(true);
            globalThis.setTimeout(() => {
                setCodeCopied(false);
            }, 1500);
        });
    }

    function handleInvite(targetPlayerId: string) {
        runAsyncAction(() => onInvitePlayer(targetPlayerId));
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
            <section className='screen lobby-screen lobby-room'>
                <header className='lobby-bar'>
                    <button
                        className='lobby-bar-back'
                        onClick={() => {
                            runAsyncAction(onBack);
                        }}
                        type='button'
                    >
                        <ArrowLeft size={20} />
                    </button>
                    <div className='lobby-bar-code'>
                        <span className='lobby-bar-digits'>
                            {multiplayer.roomId}
                        </span>
                        <button
                            className='lobby-bar-copy'
                            onClick={handleCopyCode}
                            type='button'
                        >
                            {codeCopied ? (
                                <Check size={14} />
                            ) : (
                                <Copy size={14} />
                            )}
                        </button>
                    </div>
                </header>

                <div className='lobby-arena'>
                    <div className='arena-slot arena-self'>
                        <span className='arena-tag'>P1</span>
                        <span className='arena-name'>
                            {currentPlayer?.name ?? '-'}
                        </span>
                    </div>

                    <div className='arena-vs'>
                        {isCountdown
                            ? (multiplayerCountdownValue ?? 3)
                            : 'VS'}
                    </div>

                    {opponentPlayer ? (
                        <div className='arena-slot arena-opponent'>
                            <span className='arena-tag'>P2</span>
                            <span className='arena-name'>
                                {opponentPlayer.name}
                            </span>
                        </div>
                    ) : (
                        <div className='arena-slot arena-empty'>
                            <span className='arena-tag'>P2</span>
                            <span className='arena-name'>?</span>
                        </div>
                    )}
                </div>

                {!hasOpponent && !isCountdown && onlineUsers.length > 0 ? (
                    <div className='lobby-online'>
                        <p className='lobby-online-label'>
                            {uiText.onlineSection}
                        </p>
                        <ul className='lobby-online-list'>
                            {onlineUsers.map((user) => (
                                <li
                                    className='lobby-online-user'
                                    key={user.playerId}
                                >
                                    <span>{user.name}</span>
                                    <button
                                        className='lobby-online-invite'
                                        onClick={() => {
                                            handleInvite(user.playerId);
                                        }}
                                        type='button'
                                    >
                                        {uiText.inviteButton}
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </div>
                ) : undefined}

                {activeToastMessage ? (
                    <div aria-live='polite' className='waiting-toast-layer'>
                        <div className='waiting-toast'>
                            {activeToastMessage}
                        </div>
                    </div>
                ) : undefined}
            </section>
        </main>
    );
}
