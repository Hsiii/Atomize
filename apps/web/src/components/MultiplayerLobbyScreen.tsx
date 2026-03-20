import { useCallback, useEffect, useRef, useState } from 'react';
import type { JSX } from 'react';

import type { MenuMode } from '../app-state';
import { uiText } from '../app-state';

import './MultiplayerLobbyScreen.css';

import { MultiplayerJoinScreen } from './MultiplayerJoinScreen';

type MultiplayerLobbyScreenProps = {
    menuMode: MenuMode;
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
    const hasAutoSubmitted = useRef(false);
    const isJoinFlow = menuMode === 'join-room';
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

    return (
        <MultiplayerJoinScreen
            activeToastMessage={activeToastMessage}
            onBack={handleBack}
            createOrJoinButtonText={createOrJoinButtonText}
            isJoinPending={isJoinPending}
            onRoomIdInputChange={onRoomIdInputChange}
            onSubmit={handleSubmit}
            roomIdInput={roomIdInput}
        />
    );
}
