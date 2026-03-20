import { useCallback, useEffect, useRef, useState } from 'react';
import type { ChangeEvent, JSX, KeyboardEvent } from 'react';
import { ArrowLeft, Check, Copy, Search } from 'lucide-react';

import type { MenuMode, MultiplayerState, OnlineLobbyUser } from '../app-state';
import { uiText } from '../app-state';

import './MultiplayerLobbyScreen.css';

import { BackButton } from './BackButton';

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
    const hasAutoSubmitted = useRef(false);
    const isJoinFlow = menuMode === 'join-room';
    const shouldShowWaitingRoom = Boolean(multiplayer.roomId);
    const isJoinButtonReady = roomIdInput.length === 4;
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

    const submitJoin = useCallback(() => {
        if (!isJoinButtonReady) {
            setLocalToastMessage(uiText.joinIncompleteToast);
            return;
        }

        if (isJoinPending) {
            return;
        }

        runAsyncAction(onJoinRoom);
    }, [isJoinButtonReady, isJoinPending, onJoinRoom]);

    // Reset auto-submit guard only when input changes.
    useEffect(() => {
        if (!isJoinButtonReady) {
            hasAutoSubmitted.current = false;
        }
    }, [isJoinButtonReady]);

    // Auto-submit when four digits are entered.
    useEffect(() => {
        if (
            !isJoinFlow ||
            !isJoinButtonReady ||
            isJoinPending ||
            hasAutoSubmitted.current
        ) {
            return;
        }

        hasAutoSubmitted.current = true;
        submitJoin();
    }, [isJoinFlow, isJoinButtonReady, isJoinPending, submitJoin]);

    function handleCreateOrJoinClick() {
        if (!isJoinFlow) {
            runAsyncAction(onCreateRoom);
            return;
        }

        submitJoin();
    }

    function handleRoomCodeKeyDown(event: KeyboardEvent<HTMLElement>) {
        if (event.key === 'Enter') {
            event.preventDefault();
            submitJoin();
        }
    }

    function handleInputChange(event: ChangeEvent<HTMLInputElement>) {
        onRoomIdInputChange(event.target.value);
    }

    function focusInput() {
        inputRef.current?.focus();
    }

    const inputRef = useRef<HTMLInputElement | null>(null);
    const roomCodeDigits = Array.from(
        { length: 4 },
        (_, index) => roomIdInput[index] ?? ''
    );

    function handleCopyCode() {
        if (!multiplayer.roomId) {
            return;
        }

        navigator.clipboard.writeText(multiplayer.roomId).then(
            () => {
                setCodeCopied(true);
                globalThis.setTimeout(
                    () => {
                        setCodeCopied(false);
                    },
                    1500,
                    undefined
                );
            },
            () => undefined
        );
    }

    function handleInvite(targetPlayerId: string) {
        runAsyncAction(async () => {
            await onInvitePlayer(targetPlayerId);
        });
    }

    if (!multiplayer.roomId && !shouldShowWaitingRoom) {
        return (
            <main className='app-shell fullscreen-shell'>
                <BackButton onBack={onBack} />
                <section className='screen lobby-screen'>
                    <div className='join-layout'>
                        {activeToastMessage ? (
                            <div
                                aria-live='polite'
                                className='join-toast-layer'
                            >
                                <div className='waiting-toast'>
                                    {activeToastMessage}
                                </div>
                            </div>
                        ) : undefined}

                        <div aria-hidden='true' className='join-title-orb'>
                            <p className='join-title'>
                                <span>{uiText.joinRoom.split(' ')[0]}</span>
                                <span>{uiText.joinRoom.split(' ')[1]}</span>
                            </p>
                        </div>

                        <div className='join-stage'>
                            {/* The hidden input inside handles keyboard interaction. */}
                            <div
                                className='join-orb'
                                onClick={focusInput}
                                onKeyDown={handleRoomCodeKeyDown}
                            >
                                <div
                                    aria-hidden='true'
                                    className='join-orb-bars'
                                >
                                    {roomCodeDigits.map((character, index) => (
                                        <span
                                            className={
                                                character
                                                    ? 'join-bar filled'
                                                    : 'join-bar'
                                            }
                                            key={`bar-${String(index)}`}
                                        >
                                            {character}
                                        </span>
                                    ))}
                                </div>
                                <input
                                    aria-label={uiText.enterCode}
                                    className='join-orb-input'
                                    inputMode='numeric'
                                    maxLength={4}
                                    onChange={handleInputChange}
                                    pattern='[0-9]*'
                                    ref={inputRef}
                                    value={roomIdInput}
                                />
                            </div>

                            <button
                                className={`join-go-blob${
                                    isJoinPending ? ' join-go-blob-pending' : ''
                                }`}
                                onClick={handleCreateOrJoinClick}
                                type='button'
                            >
                                <Search
                                    aria-hidden='true'
                                    className='join-go-icon'
                                />
                                <span className='join-go-text'>
                                    {createOrJoinButtonText}
                                </span>
                            </button>
                        </div>
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
                    <div className='arena-player arena-p1'>
                        <span className='arena-label'>P1</span>
                        <span className='arena-name'>
                            {currentPlayer?.name ?? '-'}
                        </span>
                    </div>

                    <div className='arena-center'>
                        <span className='arena-vs'>
                            {isCountdown
                                ? (multiplayerCountdownValue ?? 3)
                                : 'VS'}
                        </span>
                    </div>

                    <div
                        className={`arena-player arena-p2${
                            opponentPlayer ? '' : ' arena-p2-open'
                        }`}
                    >
                        <span className='arena-label'>P2</span>
                        <span
                            className={`arena-name${
                                opponentPlayer ? '' : ' arena-name-waiting'
                            }`}
                        >
                            {opponentPlayer?.name ?? '?'}
                        </span>
                    </div>

                    {!hasOpponent && !isCountdown && onlineUsers.length > 0 ? (
                        <ul className='arena-challengers'>
                            {onlineUsers.map((user) => (
                                <li
                                    className='arena-challenger'
                                    key={user.playerId}
                                >
                                    <span className='arena-challenger-name'>
                                        {user.name}
                                    </span>
                                    <button
                                        className='arena-challenger-invite'
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
                    ) : undefined}
                </div>

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
