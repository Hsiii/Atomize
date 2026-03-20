import { useCallback, useEffect, useRef, useState } from 'react';
import type { JSX } from 'react';

import type { MenuMode, MultiplayerState, OnlineLobbyUser } from '../app-state';
import { uiText } from '../app-state';

import './MultiplayerLobbyScreen.css';

import { MultiplayerJoinScreen } from './MultiplayerJoinScreen';
import { MultiplayerWaitingRoomScreen } from './MultiplayerWaitingRoomScreen';

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

    useEffect(() => {
        if (!isJoinButtonReady) {
            hasAutoSubmitted.current = false;
        }
    }, [isJoinButtonReady]);

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

    function handleBack() {
        runAsyncAction(onBack);
    }

    function handleSubmit() {
        if (!isJoinFlow) {
            runAsyncAction(onCreateRoom);
            return;
        }

        submitJoin();
    }

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
            <MultiplayerJoinScreen
                activeToastMessage={activeToastMessage}
                createOrJoinButtonText={createOrJoinButtonText}
                isJoinPending={isJoinPending}
                onBack={handleBack}
                onRoomIdInputChange={onRoomIdInputChange}
                onSubmit={handleSubmit}
                roomIdInput={roomIdInput}
            />
        );
    }

    return (
        <MultiplayerWaitingRoomScreen
            activeToastMessage={activeToastMessage}
            codeCopied={codeCopied}
            multiplayer={multiplayer}
            multiplayerCountdownValue={multiplayerCountdownValue}
            onBack={handleBack}
            onCopyCode={handleCopyCode}
            onInvitePlayer={handleInvite}
            onlineUsers={onlineUsers}
        />
    );
}
