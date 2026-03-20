import { useEffect, useRef, useState } from 'react';
import { REALTIME_SUBSCRIBE_STATES } from '@supabase/supabase-js';
import type { RealtimeChannel } from '@supabase/supabase-js';

import { uiText } from '../app-state';
import type { MultiplayerState, OnlineLobbyUser, Screen } from '../app-state';
import { applyPrimeSelection } from '../core';
import type { Prime, RoomSnapshot } from '../core';
import {
    createRoomId,
    detachPromise,
    isPendingGuestJoin,
    playablePrimes,
    wait,
} from '../lib/app-helpers';
import type {
    LobbyInvitation,
    MultiplayerSendResult,
    RoomBroadcastMessage,
} from '../lib/multiplayer-messages';
import {
    addPlayerToRoom,
    applyBattlePenalty,
    applyBattlePrimeSelection,
    beginRoomMatch,
    clearSolvedBattleStage,
    createRoomSnapshot,
    setPlayerReady,
} from '../lib/multiplayer-room';
import {
    createRealtimeClient,
    getMissingSupabaseEnvVars,
} from '../lib/supabase';

const multiplayerComboStepDelayMs = 220;
const realtimeSendTimeoutMs = 1500;
const joinRoomLookupTimeoutMs = 5000;
const joinRoomRetryIntervalMs = 1200;

type LobbyToastState = {
    id: number;
    message: string | undefined;
};

type UseMultiplayerGameOptions = {
    playerName: string;
    screen: Screen;
    onScreenChange: (screen: Screen) => void;
};

type UseMultiplayerGameResult = {
    playablePrimes: typeof playablePrimes;
    multiplayer: MultiplayerState;
    multiplayerPrimeQueue: Prime[];
    isMultiplayerComboRunning: boolean;
    isMultiplayerInputDisabled: boolean;
    currentMultiplayerPlayer: RoomSnapshot['players'][number] | undefined;
    opponentName: string | undefined;
    isCurrentPlayerReady: boolean;
    isOpponentReady: boolean;
    isInRoom: boolean;
    onlineUsers: OnlineLobbyUser[];
    pendingInvitation: LobbyInvitation | undefined;
    lobbyToast: LobbyToastState;
    prefetchOnlineUsers: () => void;
    handleLobbyInvite: (targetPlayerId: string) => Promise<void>;
    handleAcceptInvitation: () => Promise<void>;
    handleDeclineInvitation: () => void;
    toggleReady: () => Promise<void>;
    handleMultiplayerComboSubmit: (queue: readonly Prime[]) => Promise<void>;
    resetMultiplayerGame: () => Promise<void>;
};

export function useMultiplayerGame({
    playerName,
    screen,
    onScreenChange,
}: UseMultiplayerGameOptions): UseMultiplayerGameResult {
    const [multiplayerPrimeQueue, setMultiplayerPrimeQueue] = useState<Prime[]>(
        []
    );
    const [isMultiplayerComboRunning, setIsMultiplayerComboRunning] =
        useState(false);
    const [pendingInvitation, setPendingInvitation] = useState<
        LobbyInvitation | undefined
    >(undefined);
    const [lobbyToast, setLobbyToast] = useState<LobbyToastState>({
        id: 0,
        message: undefined,
    });
    const [multiplayer, setMultiplayer] = useState<MultiplayerState>({
        playerId: undefined,
        snapshot: undefined,
        statusText: uiText.idleStatus,
        roomId: '',
        isHost: false,
    });
    const [onlineUsers, setOnlineUsers] = useState<OnlineLobbyUser[]>([]);
    const channelRef = useRef<RealtimeChannel | undefined>(undefined);
    const lobbyChannelRef = useRef<RealtimeChannel | undefined>(undefined);
    const supabaseRef =
        useRef<ReturnType<typeof createRealtimeClient>>(undefined);
    const lobbyPlayerIdRef = useRef(crypto.randomUUID());
    const screenRef = useRef(screen);
    const latestMultiplayerRef = useRef(multiplayer);
    const joinLookupTimeoutRef = useRef<number | undefined>(undefined);
    const joinRetryIntervalRef = useRef<number | undefined>(undefined);

    const effectiveMultiplayerSnapshot = getEffectiveMultiplayerSnapshot(
        multiplayer.snapshot,
        screen
    );
    const multiplayerPlayers = effectiveMultiplayerSnapshot?.players ?? [];
    const currentMultiplayerPlayer = multiplayerPlayers.find(
        (player) => player.id === multiplayer.playerId
    );
    const opponentPlayer = effectiveMultiplayerSnapshot?.players.find(
        (player) => player.id !== multiplayer.playerId
    );
    const isCurrentPlayerReady =
        multiplayerPlayers.find((player) => player.id === multiplayer.playerId)
            ?.ready ?? false;
    const isOpponentReady =
        multiplayerPlayers.find((player) => player.id !== multiplayer.playerId)
            ?.ready ?? false;
    const isMultiplayerInputDisabled =
        !effectiveMultiplayerSnapshot ||
        effectiveMultiplayerSnapshot.status !== 'playing' ||
        isMultiplayerComboRunning;

    useEffect(() => {
        latestMultiplayerRef.current = multiplayer;
    }, [multiplayer]);

    useEffect(() => {
        screenRef.current = screen;
    }, [screen]);

    useEffect(() => {
        if (multiplayer.snapshot?.status === 'playing') {
            onScreenChange('multi-game');
        }
    }, [multiplayer.snapshot?.status, onScreenChange]);

    useEffect(() => {
        if (effectiveMultiplayerSnapshot?.status === 'playing') {
            return undefined;
        }

        setMultiplayerPrimeQueue([]);
        setIsMultiplayerComboRunning(false);
    }, [effectiveMultiplayerSnapshot?.status]);

    useEffect(() => {
        supabaseRef.current = createRealtimeClient();

        return () => {
            if (channelRef.current && supabaseRef.current) {
                detachPromise(
                    supabaseRef.current.removeChannel(channelRef.current)
                );
            }
        };
    }, []);

    useEffect(() => {
        const supabase = supabaseRef.current;

        if (!supabase) {
            return undefined;
        }

        const currentPlayerId = lobbyPlayerIdRef.current;
        const lobbyChannel = supabase.channel('atomize:lobby', {
            config: { presence: { key: currentPlayerId } },
        });

        lobbyChannel
            .on('presence', { event: 'sync' }, syncLobbyPresenceUsers)
            .on('broadcast', { event: 'room_invite' }, ({ payload }) => {
                const invite = payload as {
                    type: 'room_invite';
                    roomCode: string;
                    fromName: string;
                    targetPlayerId: string;
                };

                if (invite.targetPlayerId !== currentPlayerId) {
                    return;
                }

                if (screenRef.current !== 'menu') {
                    return;
                }

                const currentState = latestMultiplayerRef.current;

                if (currentState.roomId) {
                    return;
                }

                setPendingInvitation({
                    fromName: invite.fromName,
                    roomCode: invite.roomCode,
                });
            })
            .subscribe((status) => {
                if (status === REALTIME_SUBSCRIBE_STATES.SUBSCRIBED) {
                    syncLobbyPresenceUsers();

                    detachPromise(
                        lobbyChannel
                            .track({
                                playerId: currentPlayerId,
                                name: playerName,
                                status:
                                    screenRef.current === 'menu'
                                        ? 'lobby'
                                        : 'in-game',
                            })
                            .then(() => {
                                syncLobbyPresenceUsers();
                            })
                    );

                    return undefined;
                }

                return undefined;
            });

        lobbyChannelRef.current = lobbyChannel;

        return () => {
            detachPromise(supabase.removeChannel(lobbyChannel));
            lobbyChannelRef.current = undefined;
        };

        function syncLobbyPresenceUsers() {
            const currentLobbyChannel = lobbyChannelRef.current;

            if (!currentLobbyChannel) {
                return;
            }

            const state = currentLobbyChannel.presenceState<{
                playerId: string;
                name: string;
                status: 'lobby' | 'in-game';
            }>();
            const users: OnlineLobbyUser[] = [];

            for (const presences of Object.values(state)) {
                for (const entry of presences) {
                    if (entry.playerId !== currentPlayerId) {
                        users.push({
                            playerId: entry.playerId,
                            name: entry.name,
                            status: entry.status,
                        });
                    }
                }
            }

            setOnlineUsers(users);
        }
    }, [playerName]);

    useEffect(() => {
        const lobbyChannel = lobbyChannelRef.current;

        if (!lobbyChannel) {
            return undefined;
        }

        detachPromise(
            lobbyChannel.track({
                playerId: lobbyPlayerIdRef.current,
                name: playerName,
                status: screen === 'menu' ? 'lobby' : 'in-game',
            })
        );

        return undefined;
    }, [playerName, screen]);

    async function resetMultiplayerGame() {
        await closeActiveChannel();
        setMultiplayerPrimeQueue([]);
        setIsMultiplayerComboRunning(false);
        setMultiplayer({
            playerId: undefined,
            snapshot: undefined,
            statusText: uiText.idleStatus,
            roomId: '',
            isHost: false,
        });
        setPendingInvitation(undefined);
    }

    function prefetchOnlineUsers() {
        const lobbyChannel = lobbyChannelRef.current;

        if (!lobbyChannel) {
            return;
        }

        const state = lobbyChannel.presenceState<{
            playerId: string;
            name: string;
            status: 'lobby' | 'in-game';
        }>();
        const currentPlayerId = lobbyPlayerIdRef.current;
        const users: OnlineLobbyUser[] = [];

        for (const presences of Object.values(state)) {
            for (const entry of presences) {
                if (entry.playerId !== currentPlayerId) {
                    users.push({
                        playerId: entry.playerId,
                        name: entry.name,
                        status: entry.status,
                    });
                }
            }
        }

        setOnlineUsers(users);
    }

    async function handleLobbyInvite(targetPlayerId: string) {
        const currentState = latestMultiplayerRef.current;

        if (!currentState.roomId) {
            const roomId = createRoomId();
            const playerId = crypto.randomUUID();
            const snapshot = createRoomSnapshot(roomId, playerId, playerName);

            setMultiplayer((prev) => ({
                ...prev,
                playerId,
                snapshot,
                roomId,
                isHost: true,
                statusText: '',
            }));

            await subscribeToRoom(roomId, playerId, true, async () => {
                updateSnapshot(snapshot, '');
                await broadcastMessage({
                    type: 'room_state',
                    snapshot,
                    sourcePlayerId: playerId,
                });

                const lobbyChannel = lobbyChannelRef.current;

                if (lobbyChannel) {
                    await lobbyChannel.send({
                        type: 'broadcast',
                        event: 'room_invite',
                        payload: {
                            type: 'room_invite',
                            roomCode: roomId,
                            fromName: playerName,
                            targetPlayerId,
                        },
                    });
                }
            });

            return;
        }

        await invitePlayer(targetPlayerId);
    }

    async function handleAcceptInvitation() {
        if (!pendingInvitation) {
            return;
        }

        const { roomCode } = pendingInvitation;
        setPendingInvitation(undefined);

        const playerId = crypto.randomUUID();

        await subscribeToRoom(roomCode, playerId, false, () => {
            const sendJoinRequest = () => {
                const currentState = latestMultiplayerRef.current;

                if (!isPendingGuestJoin(currentState)) {
                    clearPendingJoinTimers();
                    return undefined;
                }

                detachPromise(
                    broadcastMessage({
                        type: 'join_request',
                        playerId,
                        playerName,
                    })
                );
            };

            sendJoinRequest();
            clearPendingJoinTimers();

            joinRetryIntervalRef.current = globalThis.setInterval(
                sendJoinRequest,
                joinRoomRetryIntervalMs,
                undefined
            );

            joinLookupTimeoutRef.current = globalThis.setTimeout(
                () => {
                    const currentState = latestMultiplayerRef.current;

                    if (!isPendingGuestJoin(currentState)) {
                        clearPendingJoinTimers();
                        return undefined;
                    }

                    detachPromise(failPendingJoin(uiText.joinMissingRoomToast));
                    return undefined;
                },
                joinRoomLookupTimeoutMs,
                undefined
            );
        });
    }

    function handleDeclineInvitation() {
        setPendingInvitation(undefined);
    }

    async function toggleReady() {
        const currentState = latestMultiplayerRef.current;

        if (
            !currentState.playerId ||
            !currentState.snapshot ||
            currentState.snapshot.status !== 'waiting'
        ) {
            return;
        }

        const alreadyReady = currentState.snapshot.players.find(
            (player) => player.id === currentState.playerId
        )?.ready;
        const nextReadyState = !alreadyReady;

        if (currentState.isHost) {
            const readySnapshot = setPlayerReady(
                currentState.snapshot,
                currentState.playerId,
                nextReadyState
            );
            const nextSnapshot = beginRoomMatch(readySnapshot);

            updateSnapshot(nextSnapshot, '');
            await broadcastMessage({
                type: 'room_state',
                snapshot: nextSnapshot,
                sourcePlayerId: currentState.playerId,
            });
            return;
        }

        await broadcastMessage({
            type: 'player_ready',
            playerId: currentState.playerId,
            ready: nextReadyState,
        });

        setMultiplayer((prev) => {
            if (!prev.snapshot || !prev.playerId) {
                return prev;
            }

            const readySnapshot = setPlayerReady(
                prev.snapshot,
                prev.playerId,
                nextReadyState
            );

            return {
                ...prev,
                snapshot: readySnapshot,
            };
        });
    }

    async function handleMultiplayerComboSubmit(queue: readonly Prime[]) {
        if (isMultiplayerInputDisabled) {
            return;
        }

        const currentState = latestMultiplayerRef.current;
        const gameplaySnapshot = getEffectiveMultiplayerSnapshot(
            currentState.snapshot,
            screenRef.current
        );
        const currentPlayer = gameplaySnapshot?.players.find(
            (player) => player.id === currentState.playerId
        );

        if (queue.length === 0) {
            if (currentPlayer?.stage.remainingValue !== 1) {
                return;
            }

            setIsMultiplayerComboRunning(true);

            try {
                await sendSolvedStageClear();
            } finally {
                setIsMultiplayerComboRunning(false);
            }

            return;
        }

        setIsMultiplayerComboRunning(true);

        const queuedPrimes = [...queue];
        setMultiplayerPrimeQueue(queuedPrimes);

        try {
            await processMultiplayerQueue(queuedPrimes);
        } finally {
            setIsMultiplayerComboRunning(false);
        }
    }

    return {
        playablePrimes,
        multiplayer,
        multiplayerPrimeQueue,
        isMultiplayerComboRunning,
        isMultiplayerInputDisabled,
        currentMultiplayerPlayer,
        opponentName: opponentPlayer?.name,
        isCurrentPlayerReady,
        isOpponentReady,
        isInRoom: Boolean(multiplayer.roomId),
        onlineUsers,
        pendingInvitation,
        lobbyToast,
        prefetchOnlineUsers,
        handleLobbyInvite,
        handleAcceptInvitation,
        handleDeclineInvitation,
        toggleReady,
        handleMultiplayerComboSubmit,
        resetMultiplayerGame,
    };

    function setStatusText(statusText: string) {
        setMultiplayer((currentState) => ({
            ...currentState,
            statusText,
        }));
    }

    function showLobbyToast(message: string) {
        setLobbyToast((currentToast) => ({
            id: currentToast.id + 1,
            message,
        }));
    }

    function clearPendingJoinTimers() {
        if (joinLookupTimeoutRef.current !== undefined) {
            globalThis.clearTimeout(joinLookupTimeoutRef.current);
            joinLookupTimeoutRef.current = undefined;
        }

        if (joinRetryIntervalRef.current !== undefined) {
            globalThis.clearInterval(joinRetryIntervalRef.current);
            joinRetryIntervalRef.current = undefined;
        }
    }

    async function failPendingJoin(message: string) {
        showLobbyToast(message);
        clearPendingJoinTimers();
        await closeActiveChannel();
        setMultiplayer({
            playerId: undefined,
            snapshot: undefined,
            statusText: uiText.idleStatus,
            roomId: '',
            isHost: false,
        });
    }

    async function invitePlayer(targetPlayerId: string) {
        const currentState = latestMultiplayerRef.current;
        const lobbyChannel = lobbyChannelRef.current;

        if (!currentState.roomId || !lobbyChannel) {
            return;
        }

        await lobbyChannel.send({
            type: 'broadcast',
            event: 'room_invite',
            payload: {
                type: 'room_invite',
                roomCode: currentState.roomId,
                fromName: playerName,
                targetPlayerId,
            },
        });
    }

    async function broadcastMessage(
        message: RoomBroadcastMessage
    ): Promise<boolean> {
        const channel = channelRef.current;

        if (!channel) {
            setStatusText('No active server channel');
            return false;
        }

        let timeoutId: number | undefined;

        try {
            const response = await Promise.race<'ok' | 'timed out' | 'error'>([
                channel.send({
                    type: 'broadcast',
                    event: message.type,
                    payload: message,
                }),
                new Promise<'timed out'>((resolve) => {
                    timeoutId = globalThis.setTimeout(
                        () => {
                            resolve('timed out');
                        },
                        realtimeSendTimeoutMs,
                        undefined
                    );
                }),
            ]);

            if (response !== 'ok') {
                setStatusText(
                    response === 'timed out'
                        ? uiText.multiplayerSyncStalled
                        : `Server send failed: ${response}`
                );
                return false;
            }

            return true;
        } finally {
            if (timeoutId !== undefined) {
                globalThis.clearTimeout(timeoutId);
            }
        }
    }

    function updateSnapshot(snapshot: RoomSnapshot, statusText?: string) {
        setMultiplayer((currentState) => ({
            ...(shouldIgnoreSnapshotRegression(currentState.snapshot, snapshot)
                ? currentState
                : {
                      ...currentState,
                      snapshot,
                      roomId: snapshot.roomId,
                      statusText: statusText ?? currentState.statusText,
                  }),
        }));
    }

    async function closeActiveChannel() {
        clearPendingJoinTimers();

        if (channelRef.current && supabaseRef.current) {
            await supabaseRef.current.removeChannel(channelRef.current);
            channelRef.current = undefined;
        }
    }

    async function subscribeToRoom(
        roomId: string,
        playerId: string,
        isHost: boolean,
        onSubscribed: () => Promise<void> | void
    ) {
        const supabase = supabaseRef.current;

        if (!supabase) {
            const missingVars = getMissingSupabaseEnvVars();
            const envList = missingVars.join(', ');
            setStatusText(
                `Server unavailable: missing ${envList}. Add them to this environment and redeploy.`
            );
            return undefined;
        }

        await closeActiveChannel();

        const channel = supabase.channel(`atomize:${roomId}`, {
            config: {
                broadcast: {
                    self: true,
                },
            },
        });

        channel
            .on('broadcast', { event: 'room_state' }, ({ payload }) => {
                const message = payload as RoomBroadcastMessage;

                if (message.type !== 'room_state') {
                    return;
                }

                const currentState = latestMultiplayerRef.current;

                if (
                    !currentState.isHost &&
                    currentState.playerId &&
                    message.snapshot.players.some(
                        (player) => player.id === currentState.playerId
                    )
                ) {
                    clearPendingJoinTimers();
                }

                updateSnapshot(message.snapshot, '');
            })
            .on('broadcast', { event: 'join_request' }, ({ payload }) => {
                const message = payload as RoomBroadcastMessage;
                detachPromise(handleJoinRequestBroadcast(message, playerId));
            })
            .on('broadcast', { event: 'player_ready' }, ({ payload }) => {
                const message = payload as RoomBroadcastMessage;
                detachPromise(handlePlayerReadyBroadcast(message, playerId));
            })
            .on('broadcast', { event: 'prime_selected' }, ({ payload }) => {
                const message = payload as RoomBroadcastMessage;
                detachPromise(handlePrimeSelectedBroadcast(message, playerId));
            })
            .on('broadcast', { event: 'combo_penalty' }, ({ payload }) => {
                const message = payload as RoomBroadcastMessage;
                detachPromise(handleComboPenaltyBroadcast(message, playerId));
            })
            .on('broadcast', { event: 'clear_solved_stage' }, ({ payload }) => {
                const message = payload as RoomBroadcastMessage;
                detachPromise(
                    handleClearSolvedStageBroadcast(message, playerId)
                );
            })
            .on('broadcast', { event: 'room_error' }, ({ payload }) => {
                const message = payload as RoomBroadcastMessage;

                if (
                    message.type !== 'room_error' ||
                    message.targetPlayerId !== playerId
                ) {
                    return undefined;
                }

                const currentState = latestMultiplayerRef.current;

                if (isPendingGuestJoin(currentState)) {
                    detachPromise(failPendingJoin(message.message));
                    return undefined;
                }

                setStatusText(message.message);
                return undefined;
            });

        channelRef.current = channel;

        setMultiplayer((currentState) => ({
            ...currentState,
            playerId,
            roomId: isHost ? roomId : currentState.roomId,
            isHost,
            statusText: '',
        }));

        channel.subscribe((status) => {
            if (status === REALTIME_SUBSCRIBE_STATES.SUBSCRIBED) {
                detachPromise(Promise.resolve(onSubscribed()));
                return undefined;
            }

            if (status === REALTIME_SUBSCRIBE_STATES.CHANNEL_ERROR) {
                const currentState = latestMultiplayerRef.current;

                if (isPendingGuestJoin(currentState)) {
                    detachPromise(failPendingJoin(uiText.joinMissingRoomToast));
                    return undefined;
                }

                setStatusText('Server connection failed');
            }

            return undefined;
        });
    }

    async function sendMultiplayerPrime(
        prime: Prime,
        suppressAttack = false
    ): Promise<MultiplayerSendResult> {
        const currentState = latestMultiplayerRef.current;
        const gameplaySnapshot = getEffectiveMultiplayerSnapshot(
            currentState.snapshot,
            screenRef.current
        );

        if (!currentState.playerId || !gameplaySnapshot) {
            setStatusText('Create or join a room first');
            return { didBroadcast: false };
        }

        if (gameplaySnapshot.status !== 'playing') {
            return { didBroadcast: false };
        }

        if (currentState.isHost) {
            const nextSnapshot = applyBattlePrimeSelection(
                gameplaySnapshot,
                currentState.playerId,
                prime,
                { suppressAttack }
            );
            updateSnapshot(nextSnapshot, '');
            const didBroadcast = await broadcastMessage({
                type: 'room_state',
                snapshot: nextSnapshot,
                sourcePlayerId: currentState.playerId,
            });

            return {
                snapshot: nextSnapshot,
                didBroadcast,
            };
        }

        const didBroadcast = await broadcastMessage({
            type: 'prime_selected',
            playerId: currentState.playerId,
            prime,
            suppressAttack,
        });

        return { didBroadcast };
    }

    async function sendMultiplayerPenalty(
        snapshotOverride?: RoomSnapshot,
        preservedStage?: RoomSnapshot['stage']
    ): Promise<boolean> {
        const currentState = latestMultiplayerRef.current;
        const gameplaySnapshot = getEffectiveMultiplayerSnapshot(
            snapshotOverride ?? currentState.snapshot,
            screenRef.current
        );

        if (!currentState.playerId) {
            return false;
        }

        if (currentState.isHost) {
            if (!gameplaySnapshot) {
                return false;
            }

            const nextSnapshot = applyBattlePenalty(
                gameplaySnapshot,
                currentState.playerId,
                preservedStage
            );
            updateSnapshot(nextSnapshot, '');
            return await broadcastMessage({
                type: 'room_state',
                snapshot: nextSnapshot,
                sourcePlayerId: currentState.playerId,
            });
        }

        return await broadcastMessage({
            type: 'combo_penalty',
            playerId: currentState.playerId,
            preservedStage,
        });
    }

    async function sendSolvedStageClear(): Promise<boolean> {
        const currentState = latestMultiplayerRef.current;
        const gameplaySnapshot = getEffectiveMultiplayerSnapshot(
            currentState.snapshot,
            screenRef.current
        );

        if (!currentState.playerId || !gameplaySnapshot) {
            return false;
        }

        if (currentState.isHost) {
            const nextSnapshot = clearSolvedBattleStage(
                gameplaySnapshot,
                currentState.playerId
            );
            updateSnapshot(nextSnapshot, '');
            return await broadcastMessage({
                type: 'room_state',
                snapshot: nextSnapshot,
                sourcePlayerId: currentState.playerId,
            });
        }

        return await broadcastMessage({
            type: 'clear_solved_stage',
            playerId: currentState.playerId,
        });
    }

    async function handleJoinRequestBroadcast(
        message: RoomBroadcastMessage,
        sourcePlayerId: string
    ): Promise<undefined> {
        const currentState = latestMultiplayerRef.current;

        if (
            message.type !== 'join_request' ||
            !currentState.isHost ||
            !currentState.snapshot
        ) {
            return undefined;
        }

        const nextSnapshot = addPlayerToRoom(
            currentState.snapshot,
            message.playerId,
            message.playerName
        );

        if (!nextSnapshot) {
            await broadcastMessage({
                type: 'room_error',
                targetPlayerId: message.playerId,
                message: 'Room already full',
            });
            return undefined;
        }

        updateSnapshot(nextSnapshot, '');
        await broadcastMessage({
            type: 'room_state',
            snapshot: nextSnapshot,
            sourcePlayerId,
        });

        return undefined;
    }

    async function handlePlayerReadyBroadcast(
        message: RoomBroadcastMessage,
        sourcePlayerId: string
    ): Promise<undefined> {
        const currentState = latestMultiplayerRef.current;

        if (
            message.type !== 'player_ready' ||
            !currentState.isHost ||
            !currentState.snapshot
        ) {
            return undefined;
        }

        const nextSnapshot = setPlayerReady(
            currentState.snapshot,
            message.playerId,
            message.ready
        );
        const readySnapshot = beginRoomMatch(nextSnapshot);

        updateSnapshot(readySnapshot, '');
        await broadcastMessage({
            type: 'room_state',
            snapshot: readySnapshot,
            sourcePlayerId,
        });

        return undefined;
    }

    async function handlePrimeSelectedBroadcast(
        message: RoomBroadcastMessage,
        sourcePlayerId: string
    ): Promise<undefined> {
        const currentState = latestMultiplayerRef.current;

        if (
            message.type !== 'prime_selected' ||
            !currentState.isHost ||
            !currentState.snapshot
        ) {
            return undefined;
        }

        const nextSnapshot = applyBattlePrimeSelection(
            currentState.snapshot,
            message.playerId,
            message.prime,
            { suppressAttack: message.suppressAttack }
        );

        updateSnapshot(nextSnapshot, '');
        await broadcastMessage({
            type: 'room_state',
            snapshot: nextSnapshot,
            sourcePlayerId,
        });

        return undefined;
    }

    async function handleComboPenaltyBroadcast(
        message: RoomBroadcastMessage,
        sourcePlayerId: string
    ): Promise<undefined> {
        const currentState = latestMultiplayerRef.current;

        if (
            message.type !== 'combo_penalty' ||
            !currentState.isHost ||
            !currentState.snapshot
        ) {
            return undefined;
        }

        const nextSnapshot = applyBattlePenalty(
            currentState.snapshot,
            message.playerId,
            message.preservedStage
        );

        updateSnapshot(nextSnapshot, '');
        await broadcastMessage({
            type: 'room_state',
            snapshot: nextSnapshot,
            sourcePlayerId,
        });

        return undefined;
    }

    async function handleClearSolvedStageBroadcast(
        message: RoomBroadcastMessage,
        sourcePlayerId: string
    ): Promise<undefined> {
        const currentState = latestMultiplayerRef.current;

        if (
            message.type !== 'clear_solved_stage' ||
            !currentState.isHost ||
            !currentState.snapshot
        ) {
            return undefined;
        }

        const nextSnapshot = clearSolvedBattleStage(
            currentState.snapshot,
            message.playerId
        );

        updateSnapshot(nextSnapshot, '');
        await broadcastMessage({
            type: 'room_state',
            snapshot: nextSnapshot,
            sourcePlayerId,
        });

        return undefined;
    }

    async function processMultiplayerQueue(
        queuedPrimes: readonly Prime[],
        index = 0,
        shouldBatchComboDamage?: boolean
    ): Promise<undefined> {
        if (index >= queuedPrimes.length) {
            return undefined;
        }

        const prime = queuedPrimes[index];
        const currentState = latestMultiplayerRef.current;
        const gameplaySnapshot = getEffectiveMultiplayerSnapshot(
            currentState.snapshot,
            screenRef.current
        );

        if (!gameplaySnapshot || gameplaySnapshot.status !== 'playing') {
            return undefined;
        }

        const currentPlayer = gameplaySnapshot.players.find(
            (player) => player.id === currentState.playerId
        );

        if (!currentPlayer) {
            return undefined;
        }

        const batchComboDamage =
            shouldBatchComboDamage ?? queuedPrimes.length > 1;

        const outcome = applyPrimeSelection(currentPlayer.stage, prime);

        if (outcome.kind === 'wrong') {
            setMultiplayerPrimeQueue([]);
            await sendMultiplayerPrime(prime);
            return undefined;
        }

        const hasRedundantBufferedPrimes =
            outcome.cleared && index < queuedPrimes.length - 1;

        if (hasRedundantBufferedPrimes) {
            setMultiplayerPrimeQueue([]);
            await sendMultiplayerPenalty(undefined, outcome.stage);
            return undefined;
        }

        setMultiplayerPrimeQueue((currentQueue: readonly Prime[]) =>
            currentQueue.slice(1)
        );

        const sendResult = await sendMultiplayerPrime(
            prime,
            batchComboDamage && !outcome.cleared
        );

        if (!sendResult.didBroadcast) {
            setMultiplayerPrimeQueue([]);
            return undefined;
        }

        if (index >= queuedPrimes.length - 1) {
            return undefined;
        }

        await wait(multiplayerComboStepDelayMs);
        await processMultiplayerQueue(
            queuedPrimes,
            index + 1,
            batchComboDamage
        );

        return undefined;
    }

    function getEffectiveMultiplayerSnapshot(
        snapshot: RoomSnapshot | undefined,
        currentScreen: Screen
    ): RoomSnapshot | undefined {
        if (!snapshot) {
            return undefined;
        }

        if (
            currentScreen !== 'multi-game' ||
            snapshot.status === 'playing' ||
            snapshot.status === 'finished'
        ) {
            return snapshot;
        }

        return {
            ...snapshot,
            countdownEndsAt: undefined,
            status: 'playing',
        };
    }
}

function shouldIgnoreSnapshotRegression(
    currentSnapshot: RoomSnapshot | undefined,
    nextSnapshot: RoomSnapshot
): boolean {
    if (!currentSnapshot) {
        return false;
    }

    if (currentSnapshot.status === 'finished') {
        return nextSnapshot.status !== 'finished';
    }

    return (
        currentSnapshot.status === 'playing' &&
        (nextSnapshot.status === 'waiting' ||
            nextSnapshot.status === 'countdown')
    );
}
