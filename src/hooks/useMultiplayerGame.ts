import { useEffect, useRef, useState } from 'react';
import { REALTIME_SUBSCRIBE_STATES } from '@supabase/supabase-js';
import type { RealtimeChannel } from '@supabase/supabase-js';

import { uiText } from '../app-state';
import type { MultiplayerState, OnlineLobbyUser, Screen } from '../app-state';
import type { Prime, RoomSnapshot } from '../core';
import {
    createRoomId,
    detachPromise,
    getDisplayPlayerName,
    isPendingGuestJoin,
    playablePrimes,
} from '../lib/app-helpers';
import { processComboQueue } from '../lib/combo-queue';
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
import { useComboQueueState } from './useComboQueueState';

const realtimeSendTimeoutMs = 1500;
const joinRoomLookupTimeoutMs = 5000;
const joinRoomRetryIntervalMs = 1200;

type LobbyToastState = {
    id: number;
    message: string | undefined;
};

type GameplayBroadcastMessage = Extract<
    RoomBroadcastMessage,
    {
        type: 'prime_selected' | 'combo_penalty' | 'clear_solved_stage';
    }
>;

type OrderedGameplayMessageState = {
    lastAppliedOrder: number;
    pendingMessages: Map<number, GameplayBroadcastMessage>;
};

type LobbyPresenceUser = {
    playerId: string;
    name: string;
    status: 'lobby' | 'in-game' | 'in-team';
};

function normalizePlayerNameKey(value: string | undefined): string {
    return (value ?? '').trim().replaceAll(/\s+/g, ' ').toLowerCase();
}

function isGuestDisplayName(value: string | undefined): boolean {
    const key = normalizePlayerNameKey(value);
    const guestKey = normalizePlayerNameKey(uiText.guest);
    return key === guestKey || /^guest\d+$/.test(key.replaceAll(' ', ''));
}

function getNextGuestDisplayName(existingNames: readonly string[]): string {
    let nextGuestIndex = 1;

    for (;;) {
        const candidateName = `${uiText.guest}${nextGuestIndex}`;

        if (
            !existingNames.some(
                (existingName) =>
                    normalizePlayerNameKey(existingName) ===
                    normalizePlayerNameKey(candidateName)
            )
        ) {
            return candidateName;
        }

        nextGuestIndex++;
    }
}

function resolveGuestLobbyNames(
    users: readonly LobbyPresenceUser[]
): readonly LobbyPresenceUser[] {
    const guestUsers = users.filter((user) => isGuestDisplayName(user.name));

    if (guestUsers.length <= 1) {
        return users;
    }

    const numberedGuestNames = new Map(
        guestUsers.map((user, index) => [
            user.playerId,
            `${uiText.guest}${index + 1}`,
        ])
    );

    return users.map((user) => {
        const numberedGuestName = numberedGuestNames.get(user.playerId);

        if (numberedGuestName === undefined) {
            return user;
        }

        return {
            ...user,
            name: numberedGuestName,
        };
    });
}

function resolveJoiningPlayerName(
    snapshot: RoomSnapshot,
    requestedPlayerName: string
): string {
    if (!isGuestDisplayName(requestedPlayerName)) {
        return requestedPlayerName;
    }

    return getNextGuestDisplayName(
        snapshot.players.map((player) => player.name)
    );
}

function applyGameplayBroadcastMessage(
    snapshot: RoomSnapshot,
    message: GameplayBroadcastMessage
): RoomSnapshot {
    switch (message.type) {
        case 'prime_selected': {
            return applyBattlePrimeSelection(
                snapshot,
                message.playerId,
                message.prime,
                {
                    suppressAttack: message.suppressAttack,
                    perfectSolveEligible: message.perfectSolveEligible,
                    resolvingQueueLength: message.resolvingQueueLength,
                }
            );
        }

        case 'combo_penalty': {
            return applyBattlePenalty(
                snapshot,
                message.playerId,
                message.preservedStage,
                message.releasedDamage
            );
        }

        case 'clear_solved_stage': {
            return clearSolvedBattleStage(snapshot, message.playerId);
        }
    }
}

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
    const comboQueue = useComboQueueState();
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
    const localGameplayActionOrderRef = useRef(0);
    const orderedGameplayMessagesRef = useRef<
        Map<string, OrderedGameplayMessageState>
    >(new Map());

    const effectiveMultiplayerSnapshot = getEffectiveMultiplayerSnapshot(
        multiplayer.snapshot,
        screen
    );
    const multiplayerPlayerName = getDisplayPlayerName(playerName);
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
        comboQueue.isComboRunning;

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

        comboQueue.reset();
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
                    fromPlayerId: string;
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
                    fromPlayerId: invite.fromPlayerId,
                    roomCode: invite.roomCode,
                });
            })
            .on('broadcast', { event: 'invite_declined' }, ({ payload }) => {
                const decline = payload as {
                    type: 'invite_declined';
                    roomCode: string;
                    targetPlayerId: string;
                };

                if (decline.targetPlayerId !== currentPlayerId) {
                    return;
                }

                const currentState = latestMultiplayerRef.current;

                if (currentState.roomId !== decline.roomCode) {
                    return;
                }

                if (
                    currentState.snapshot &&
                    currentState.snapshot.players.length >= 2
                ) {
                    return;
                }

                showLobbyToast(uiText.inviteDeclined);
                detachPromise(closeActiveChannel());
                setMultiplayerState({
                    playerId: undefined,
                    snapshot: undefined,
                    statusText: uiText.idleStatus,
                    roomId: '',
                    isHost: false,
                });
            })
            .subscribe((status) => {
                if (status === REALTIME_SUBSCRIBE_STATES.SUBSCRIBED) {
                    syncLobbyPresenceUsers();

                    let presenceStatus: 'lobby' | 'in-game' | 'in-team';

                    if (screenRef.current !== 'menu') {
                        presenceStatus = 'in-game';
                    } else if (latestMultiplayerRef.current.roomId) {
                        presenceStatus = 'in-team';
                    } else {
                        presenceStatus = 'lobby';
                    }

                    detachPromise(
                        lobbyChannel
                            .track({
                                playerId: currentPlayerId,
                                name: multiplayerPlayerName,
                                status: presenceStatus,
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

            const users = getResolvedLobbyPresenceUsers(currentLobbyChannel);

            setOnlineUsers(
                users.filter((user) => user.playerId !== currentPlayerId)
            );
        }
    }, [multiplayerPlayerName]);

    useEffect(() => {
        const lobbyChannel = lobbyChannelRef.current;

        if (!lobbyChannel) {
            return undefined;
        }

        let status: 'lobby' | 'in-game' | 'in-team';

        if (screen !== 'menu') {
            status = 'in-game';
        } else if (multiplayer.roomId) {
            status = 'in-team';
        } else {
            status = 'lobby';
        }

        detachPromise(
            lobbyChannel.track({
                playerId: lobbyPlayerIdRef.current,
                name: multiplayerPlayerName,
                status,
            })
        );

        return undefined;
    }, [multiplayerPlayerName, screen, multiplayer.roomId]);

    async function resetMultiplayerGame() {
        await closeActiveChannel();
        resetGameplayMessageOrdering();
        comboQueue.reset();
        setMultiplayerState({
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
        const currentPlayerId = lobbyPlayerIdRef.current;

        setOnlineUsers(
            getResolvedLobbyPresenceUsers(lobbyChannel).filter(
                (user) => user.playerId !== currentPlayerId
            )
        );
    }

    async function handleLobbyInvite(targetPlayerId: string) {
        const currentState = latestMultiplayerRef.current;

        if (!currentState.roomId) {
            const roomId = createRoomId();
            const playerId = crypto.randomUUID();
            const snapshot = createRoomSnapshot(
                roomId,
                playerId,
                multiplayerPlayerName
            );

            setMultiplayerState((prev) => ({
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
                            fromName: getCurrentLobbyDisplayName(),
                            fromPlayerId: lobbyPlayerIdRef.current,
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
                        playerName: multiplayerPlayerName,
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
        if (pendingInvitation) {
            const lobbyChannel = lobbyChannelRef.current;

            if (lobbyChannel) {
                detachPromise(
                    lobbyChannel.send({
                        type: 'broadcast',
                        event: 'invite_declined',
                        payload: {
                            type: 'invite_declined',
                            roomCode: pendingInvitation.roomCode,
                            targetPlayerId: pendingInvitation.fromPlayerId,
                        },
                    })
                );
            }
        }

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

        setMultiplayerState((prev) => {
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

    async function handleMultiplayerComboSubmit(
        queue: readonly Prime[]
    ): Promise<undefined> {
        const currentState = latestMultiplayerRef.current;
        const gameplaySnapshot = getEffectiveMultiplayerSnapshot(
            currentState.snapshot,
            screenRef.current
        );
        const currentPlayer = gameplaySnapshot?.players.find(
            (player) => player.id === currentState.playerId
        );

        await comboQueue.submitCombo(queue, {
            isDisabled: isMultiplayerInputDisabled,
            isSolvedStage: currentPlayer?.stage.remainingValue === 1,
            onSolvedStageClear: sendSolvedStageClear,
            processQueue: processMultiplayerQueue,
        });

        return undefined;
    }

    return {
        playablePrimes,
        multiplayer,
        multiplayerPrimeQueue: comboQueue.primeQueue,
        isMultiplayerComboRunning: comboQueue.isComboRunning,
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
        setMultiplayerState((currentState) => ({
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
        setMultiplayerState({
            playerId: undefined,
            snapshot: undefined,
            statusText: uiText.idleStatus,
            roomId: '',
            isHost: false,
        });
    }

    function setMultiplayerState(
        nextState:
            | MultiplayerState
            | ((currentState: MultiplayerState) => MultiplayerState)
    ) {
        const currentState = latestMultiplayerRef.current;
        const resolvedState =
            typeof nextState === 'function'
                ? nextState(currentState)
                : nextState;

        latestMultiplayerRef.current = resolvedState;
        setMultiplayer(resolvedState);
    }

    async function invitePlayer(targetPlayerId: string) {
        const currentState = latestMultiplayerRef.current;
        const lobbyChannel = lobbyChannelRef.current;
        const currentPlayerId = lobbyPlayerIdRef.current;

        if (!currentState.roomId || !lobbyChannel) {
            return;
        }

        await lobbyChannel.send({
            type: 'broadcast',
            event: 'room_invite',
            payload: {
                type: 'room_invite',
                roomCode: currentState.roomId,
                fromName: getCurrentLobbyDisplayName(),
                fromPlayerId: currentPlayerId,
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
        setMultiplayerState((currentState) =>
            shouldIgnoreSnapshotRegression(currentState.snapshot, snapshot)
                ? currentState
                : {
                      ...currentState,
                      snapshot,
                      roomId: snapshot.roomId,
                      statusText: statusText ?? currentState.statusText,
                  }
        );
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

        resetGameplayMessageOrdering();
        await closeActiveChannel();

        const channel = supabase.channel(`atomize:${roomId}`, {
            config: {
                broadcast: {
                    self: false,
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
                handlePrimeSelectedBroadcast(message, playerId);
            })
            .on('broadcast', { event: 'combo_penalty' }, ({ payload }) => {
                const message = payload as RoomBroadcastMessage;
                handleComboPenaltyBroadcast(message, playerId);
            })
            .on('broadcast', { event: 'clear_solved_stage' }, ({ payload }) => {
                const message = payload as RoomBroadcastMessage;
                handleClearSolvedStageBroadcast(message, playerId);
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

        setMultiplayerState((currentState) => ({
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
        suppressAttack = false,
        perfectSolveEligible = false,
        resolvingQueueLength?: number
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

        const nextSnapshot = applyBattlePrimeSelection(
            gameplaySnapshot,
            currentState.playerId,
            prime,
            {
                suppressAttack,
                perfectSolveEligible,
                resolvingQueueLength,
            }
        );
        const actionOrder = getNextGameplayActionOrder();
        updateSnapshot(nextSnapshot, '');
        const didBroadcast = await broadcastMessage({
            type: 'prime_selected',
            playerId: currentState.playerId,
            actionOrder,
            prime,
            suppressAttack,
            perfectSolveEligible,
            resolvingQueueLength,
        });

        return {
            snapshot: nextSnapshot,
            didBroadcast,
        };
    }

    async function sendMultiplayerPenalty(
        snapshotOverride?: RoomSnapshot,
        preservedStage?: RoomSnapshot['stage'],
        releasedDamageOverride?: number
    ): Promise<boolean> {
        const currentState = latestMultiplayerRef.current;
        const gameplaySnapshot = getEffectiveMultiplayerSnapshot(
            snapshotOverride ?? currentState.snapshot,
            screenRef.current
        );

        if (!currentState.playerId || !gameplaySnapshot) {
            return false;
        }

        const actingPlayer = gameplaySnapshot.players.find(
            (player) => player.id === currentState.playerId
        );

        if (!actingPlayer) {
            return false;
        }

        const releasedDamage = Math.max(
            0,
            releasedDamageOverride ?? actingPlayer.pendingFactorDamage
        );

        const nextSnapshot = applyBattlePenalty(
            gameplaySnapshot,
            currentState.playerId,
            preservedStage,
            releasedDamage
        );
        const actionOrder = getNextGameplayActionOrder();
        updateSnapshot(nextSnapshot, '');
        return await broadcastMessage({
            type: 'combo_penalty',
            playerId: currentState.playerId,
            actionOrder,
            preservedStage,
            releasedDamage,
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

        const nextSnapshot = clearSolvedBattleStage(
            gameplaySnapshot,
            currentState.playerId
        );
        const actionOrder = getNextGameplayActionOrder();
        updateSnapshot(nextSnapshot, '');
        return await broadcastMessage({
            type: 'clear_solved_stage',
            playerId: currentState.playerId,
            actionOrder,
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
            resolveJoiningPlayerName(currentState.snapshot, message.playerName)
        );

        if (
            !isGuestDisplayName(message.playerName) &&
            currentState.snapshot.players.some(
                (player) =>
                    normalizePlayerNameKey(player.name) ===
                    normalizePlayerNameKey(message.playerName)
            )
        ) {
            await broadcastMessage({
                type: 'room_error',
                targetPlayerId: message.playerId,
                message: uiText.nameInUse,
            });
            return undefined;
        }

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

    function getResolvedLobbyPresenceUsers(
        lobbyChannel: RealtimeChannel
    ): readonly LobbyPresenceUser[] {
        const state = lobbyChannel.presenceState<{
            playerId: string;
            name: string;
            status: 'lobby' | 'in-game' | 'in-team';
        }>();
        const users: LobbyPresenceUser[] = [];

        for (const presences of Object.values(state)) {
            for (const entry of presences) {
                users.push({
                    playerId: entry.playerId,
                    name: getDisplayPlayerName(entry.name),
                    status: entry.status,
                });
            }
        }

        return resolveGuestLobbyNames(users);
    }

    function getCurrentLobbyDisplayName(): string {
        const lobbyChannel = lobbyChannelRef.current;

        if (!lobbyChannel) {
            return multiplayerPlayerName;
        }

        const currentLobbyUser = getResolvedLobbyPresenceUsers(
            lobbyChannel
        ).find((user) => user.playerId === lobbyPlayerIdRef.current);

        return currentLobbyUser?.name ?? multiplayerPlayerName;
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

    function handlePrimeSelectedBroadcast(
        message: RoomBroadcastMessage,
        localPlayerId: string
    ) {
        if (message.type !== 'prime_selected') {
            return;
        }

        enqueueOrderedGameplayMessage(message, localPlayerId);
    }

    function handleComboPenaltyBroadcast(
        message: RoomBroadcastMessage,
        localPlayerId: string
    ) {
        if (message.type !== 'combo_penalty') {
            return;
        }

        enqueueOrderedGameplayMessage(message, localPlayerId);
    }

    function handleClearSolvedStageBroadcast(
        message: RoomBroadcastMessage,
        localPlayerId: string
    ) {
        if (message.type !== 'clear_solved_stage') {
            return;
        }

        enqueueOrderedGameplayMessage(message, localPlayerId);
    }

    async function processMultiplayerQueue(
        queuedPrimes: readonly Prime[]
    ): Promise<undefined> {
        await processComboQueue(queuedPrimes, {
            getPlayer() {
                const currentState = latestMultiplayerRef.current;
                const gameplaySnapshot = getEffectiveMultiplayerSnapshot(
                    currentState.snapshot,
                    screenRef.current
                );

                if (
                    !gameplaySnapshot ||
                    gameplaySnapshot.status !== 'playing'
                ) {
                    return undefined;
                }

                return gameplaySnapshot.players.find(
                    (player) => player.id === currentState.playerId
                );
            },
            clearQueue() {
                comboQueue.setPrimeQueue([]);
            },
            advanceQueue() {
                comboQueue.setPrimeQueue((currentQueue: readonly Prime[]) =>
                    currentQueue.slice(1)
                );
            },
            async onWrongPrime(player) {
                await sendMultiplayerPenalty(
                    undefined,
                    player.stage,
                    player.pendingFactorDamage
                );
            },
            async onRedundantPrimes(_player, clearedStage, releasedDamage) {
                await sendMultiplayerPenalty(
                    undefined,
                    clearedStage,
                    releasedDamage
                );
            },
            async onCorrectPrime(
                prime,
                suppressAttack,
                perfectSolveEligible,
                resolvingQueueLength
            ) {
                const sendResult = await sendMultiplayerPrime(
                    prime,
                    suppressAttack,
                    perfectSolveEligible,
                    resolvingQueueLength
                );

                if (!sendResult.didBroadcast) {
                    return { shouldAbort: true };
                }
            },
        });

        return undefined;
    }

    function enqueueOrderedGameplayMessage(
        message: GameplayBroadcastMessage,
        localPlayerId: string
    ) {
        const currentState = latestMultiplayerRef.current;

        if (!currentState.snapshot || message.playerId === localPlayerId) {
            return;
        }

        const orderedState = getOrderedGameplayMessageState(message.playerId);

        if (message.actionOrder <= orderedState.lastAppliedOrder) {
            return;
        }

        orderedState.pendingMessages.set(message.actionOrder, message);
        applyOrderedGameplayMessages(message.playerId);
    }

    function applyOrderedGameplayMessages(playerId: string) {
        const orderedState = getOrderedGameplayMessageState(playerId);
        let nextMessage = orderedState.pendingMessages.get(
            orderedState.lastAppliedOrder + 1
        );

        while (nextMessage) {
            const currentState = latestMultiplayerRef.current;

            if (!currentState.snapshot) {
                break;
            }

            const nextSnapshot = applyGameplayBroadcastMessage(
                currentState.snapshot,
                nextMessage
            );

            orderedState.pendingMessages.delete(nextMessage.actionOrder);
            orderedState.lastAppliedOrder = nextMessage.actionOrder;
            updateSnapshot(nextSnapshot, '');
            nextMessage = orderedState.pendingMessages.get(
                orderedState.lastAppliedOrder + 1
            );
        }
    }

    function getOrderedGameplayMessageState(
        playerId: string
    ): OrderedGameplayMessageState {
        const existingState = orderedGameplayMessagesRef.current.get(playerId);

        if (existingState) {
            return existingState;
        }

        const nextState: OrderedGameplayMessageState = {
            lastAppliedOrder: 0,
            pendingMessages: new Map(),
        };

        orderedGameplayMessagesRef.current.set(playerId, nextState);
        return nextState;
    }

    function getNextGameplayActionOrder(): number {
        localGameplayActionOrderRef.current++;
        return localGameplayActionOrderRef.current;
    }

    function resetGameplayMessageOrdering() {
        localGameplayActionOrderRef.current = 0;
        orderedGameplayMessagesRef.current.clear();
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
