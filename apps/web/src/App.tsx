import { useEffect, useRef, useState } from 'react';
import type { JSX } from 'react';
import {
    advanceSoloState,
    applyPrimeSelection,
    applySoloPenalty,
    createInitialSoloState,
    PRIME_POOL,
} from '@atomize/game-core';
import type { Prime, RoomSnapshot } from '@atomize/game-core';
import { REALTIME_SUBSCRIBE_STATES } from '@supabase/supabase-js';
import type { RealtimeChannel } from '@supabase/supabase-js';

import { uiText } from './app-state';
import type { MultiplayerState, OnlineLobbyUser, Screen } from './app-state';
import { MultiplayerGameScreen } from './components/game/MultiplayerGameScreen';
import { SingleGameScreen } from './components/game/SingleGameScreen';
import { MenuScreen } from './components/menu/MenuScreen';
import {
    addPlayerToRoom,
    applyBattlePenalty,
    applyBattlePrimeSelection,
    beginRoomMatch,
    createRoomSnapshot,
    setPlayerReady,
    startRoomCountdown,
} from './lib/multiplayer-room';
import {
    createRealtimeClient,
    getMissingSupabaseEnvVars,
} from './lib/supabase';

const soloDurationSeconds = 60;
const playablePrimes = PRIME_POOL.slice(0, 9);
const soloComboStepDelayMs = 280;
const multiplayerComboStepDelayMs = 220;
const multiplayerCountdownTickMs = 100;
const realtimeSendTimeoutMs = 1500;
const joinRoomLookupTimeoutMs = 5000;
const joinRoomRetryIntervalMs = 1200;
const playerNameStorageKey = 'atomize.playerName';
const usedPlayerNamesStorageKey = 'atomize.usedPlayerNames';
const fallbackPlayerNames = [
    'Nova',
    'Orbit',
    'Pulse',
    'Quark',
    'Comet',
    'Prism',
    'Drift',
    'Echo',
    'Cipher',
    'Flux',
    'Ion',
    'Pixel',
] as const;

type LobbyToastState = {
    id: number;
    message: string | undefined;
};

type RoomBroadcastMessage =
    | {
          type: 'room_state';
          snapshot: RoomSnapshot;
          sourcePlayerId: string;
      }
    | {
          type: 'join_request';
          playerId: string;
          playerName: string;
      }
    | {
          type: 'player_ready';
          playerId: string;
          ready: boolean;
      }
    | {
          type: 'prime_selected';
          playerId: string;
          prime: Prime;
      }
    | {
          type: 'combo_penalty';
          playerId: string;
      }
    | {
          type: 'room_error';
          targetPlayerId: string;
          message: string;
      };

type MultiplayerSendResult = {
    snapshot?: RoomSnapshot;
    didBroadcast: boolean;
};

type LobbyInvitation = {
    fromName: string;
    roomCode: string;
};

export default function App(): JSX.Element {
    const initialSoloSeedRef = useRef(createSoloRunSeed());
    const [screen, setScreen] = useState<Screen>('menu');
    const [soloSeed, setSoloSeed] = useState(initialSoloSeedRef.current);
    const [soloState, setSoloState] = useState(() =>
        createInitialSoloState(initialSoloSeedRef.current)
    );
    const [soloTimeLeft, setSoloTimeLeft] = useState(soloDurationSeconds);
    const [soloPrimeQueue, setSoloPrimeQueue] = useState<Prime[]>([]);
    const [isSoloComboRunning, setIsSoloComboRunning] = useState(false);
    const [soloTimerPenaltyPopKey, setSoloTimerPenaltyPopKey] = useState(0);
    const [multiplayerPrimeQueue, setMultiplayerPrimeQueue] = useState<Prime[]>(
        []
    );
    const [isMultiplayerComboRunning, setIsMultiplayerComboRunning] =
        useState(false);
    const [multiplayerCountdownValue, setMultiplayerCountdownValue] =
        useState<number>();
    const [playerName, setPlayerName] = useState(() => getInitialPlayerName());
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
    const latestSoloStateRef = useRef(soloState);
    const latestMultiplayerRef = useRef(multiplayer);
    const joinLookupTimeoutRef = useRef<number | undefined>(undefined);
    const joinRetryIntervalRef = useRef<number | undefined>(undefined);
    const multiplayerPlayers = multiplayer.snapshot?.players ?? [];
    const currentMultiplayerPlayer = multiplayerPlayers.find(
        (player) => player.id === multiplayer.playerId
    );
    const isMultiplayerInputDisabled =
        !multiplayer.snapshot ||
        multiplayer.snapshot.status !== 'playing' ||
        isMultiplayerComboRunning;

    const soloCountdownProgress = (soloTimeLeft / soloDurationSeconds) * 100;

    useEffect(() => {
        persistPlayerName(playerName);
    }, [playerName]);

    useEffect(() => {
        latestSoloStateRef.current = soloState;
    }, [soloState]);

    useEffect(() => {
        latestMultiplayerRef.current = multiplayer;
    }, [multiplayer]);

    useEffect(() => {
        screenRef.current = screen;
    }, [screen]);

    function syncLobbyPresenceUsers() {
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

    useEffect(() => {
        if (multiplayer.snapshot?.status === 'playing') {
            setScreen('multi-game');
        }
    }, [multiplayer.snapshot?.status]);

    useEffect(() => {
        const countdownEndsAt = multiplayer.snapshot?.countdownEndsAt;

        if (multiplayer.snapshot?.status !== 'countdown' || !countdownEndsAt) {
            setMultiplayerCountdownValue(undefined);
            return undefined;
        }

        const updateCountdownValue = () => {
            const remainingMs = countdownEndsAt - Date.now();

            setMultiplayerCountdownValue(
                Math.max(1, Math.ceil(remainingMs / 1000))
            );
        };

        updateCountdownValue();

        const timer = globalThis.setInterval(
            updateCountdownValue,
            multiplayerCountdownTickMs,
            undefined
        );

        return () => {
            globalThis.clearInterval(timer);
        };
    }, [multiplayer.snapshot?.countdownEndsAt, multiplayer.snapshot?.status]);

    useEffect(() => {
        const currentState = latestMultiplayerRef.current;
        const countdownEndsAt = currentState.snapshot?.countdownEndsAt;

        if (
            !currentState.isHost ||
            currentState.snapshot?.status !== 'countdown' ||
            !countdownEndsAt ||
            !currentState.playerId
        ) {
            return undefined;
        }

        const timer = globalThis.setTimeout(
            () => {
                const latestState = latestMultiplayerRef.current;

                if (
                    !latestState.isHost ||
                    !latestState.snapshot ||
                    latestState.snapshot.status !== 'countdown' ||
                    !latestState.playerId
                ) {
                    return;
                }

                const nextSnapshot = beginRoomMatch(latestState.snapshot);

                updateSnapshot(nextSnapshot, '');
                detachPromise(
                    broadcastMessage({
                        type: 'room_state',
                        snapshot: nextSnapshot,
                        sourcePlayerId: latestState.playerId,
                    })
                );
            },
            Math.max(0, countdownEndsAt - Date.now()),
            undefined
        );

        return () => {
            globalThis.clearTimeout(timer);
        };
    }, [
        multiplayer.isHost,
        multiplayer.snapshot?.countdownEndsAt,
        multiplayer.snapshot?.status,
    ]);

    useEffect(() => {
        if (screen !== 'single') {
            return undefined;
        }

        setSoloTimeLeft(soloDurationSeconds);

        const timer = globalThis.setInterval(
            () => {
                setSoloTimeLeft((currentTime) => {
                    if (currentTime <= 1) {
                        globalThis.clearInterval(timer);
                        return 0;
                    }

                    return currentTime - 1;
                });
            },
            1000,
            undefined
        );

        return () => {
            globalThis.clearInterval(timer);
        };
    }, [screen]);

    useEffect(() => {
        if (multiplayer.snapshot?.status === 'playing') {
            return undefined;
        }

        setMultiplayerPrimeQueue([]);
        setIsMultiplayerComboRunning(false);
    }, [multiplayer.snapshot?.status]);

    useEffect(() => {
        if (screen !== 'single' || !isSoloComboRunning) {
            return undefined;
        }

        if (soloTimeLeft === 0) {
            setIsSoloComboRunning(false);
            return undefined;
        }

        if (soloPrimeQueue.length === 0) {
            setIsSoloComboRunning(false);
            return undefined;
        }

        const timer = globalThis.setTimeout(
            () => {
                const currentState = latestSoloStateRef.current;
                const nextPrime = soloPrimeQueue[0];
                const outcome = applyPrimeSelection(
                    currentState.currentStage,
                    nextPrime
                );

                if (outcome.kind === 'wrong') {
                    setSoloState(applySoloPenalty(currentState));
                    setSoloPrimeQueue([]);
                    setSoloTimeLeft((currentTime) =>
                        Math.max(0, currentTime - 1)
                    );
                    setSoloTimerPenaltyPopKey((currentKey) => currentKey + 1);
                    setIsSoloComboRunning(false);
                    return;
                }

                const nextState = advanceSoloState(
                    currentState,
                    soloSeed,
                    nextPrime
                );
                const hasRedundantBufferedPrimes =
                    outcome.cleared && soloPrimeQueue.length > 1;

                if (hasRedundantBufferedPrimes) {
                    setSoloState(applySoloPenalty(nextState));
                    setSoloPrimeQueue([]);
                    setSoloTimeLeft((currentTime) =>
                        Math.max(0, currentTime - 1)
                    );
                    setSoloTimerPenaltyPopKey((currentKey) => currentKey + 1);
                    setIsSoloComboRunning(false);
                    return;
                }

                setSoloState(nextState);

                setSoloPrimeQueue((currentQueue: readonly Prime[]) =>
                    currentQueue.slice(1)
                );

                if (outcome.cleared) {
                    setIsSoloComboRunning(false);
                }
            },
            soloComboStepDelayMs,
            undefined
        );

        return () => {
            globalThis.clearTimeout(timer);
        };
    }, [isSoloComboRunning, screen, soloPrimeQueue, soloTimeLeft]);

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
    }, [screen, playerName]);

    function handleSoloComboSubmit(queue: readonly Prime[]) {
        if (soloTimeLeft === 0 || queue.length === 0 || isSoloComboRunning) {
            return;
        }

        setSoloPrimeQueue([...queue]);
        setIsSoloComboRunning(true);
    }

    function startSingleGame() {
        const nextSoloSeed = createSoloRunSeed();

        setSoloSeed(nextSoloSeed);
        setSoloState(createInitialSoloState(nextSoloSeed));
        setSoloTimeLeft(soloDurationSeconds);
        setSoloPrimeQueue([]);
        setIsSoloComboRunning(false);
        setSoloTimerPenaltyPopKey(0);
        setScreen('single');
    }

    async function returnToMenu() {
        await closeActiveChannel();
        setSoloPrimeQueue([]);
        setIsSoloComboRunning(false);
        setSoloTimerPenaltyPopKey(0);
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
        setScreen('menu');
    }

    function handleEditName(name: string) {
        setPlayerName(name);
        persistPlayerName(name);
    }

    function prefetchOnlineUsers() {
        syncLobbyPresenceUsers();
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

    async function toggleReady() {
        const currentState = latestMultiplayerRef.current;

        if (
            !currentState.playerId ||
            !currentState.snapshot ||
            (currentState.snapshot.status !== 'waiting' &&
                currentState.snapshot.status !== 'countdown')
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
            const nextSnapshot = nextReadyState
                ? startRoomCountdown(readySnapshot)
                : readySnapshot;

            updateSnapshot(nextSnapshot, '');
            await broadcastMessage({
                type: 'room_state',
                snapshot: nextSnapshot,
                sourcePlayerId: currentState.playerId,
            });
        } else {
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
    }

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
            ...currentState,
            snapshot,
            roomId: snapshot.roomId,
            statusText: statusText ?? currentState.statusText,
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
        prime: Prime
    ): Promise<MultiplayerSendResult> {
        const currentState = latestMultiplayerRef.current;

        if (!currentState.playerId || !currentState.snapshot) {
            setStatusText('Create or join a room first');
            return { didBroadcast: false };
        }

        if (currentState.snapshot.status !== 'playing') {
            return { didBroadcast: false };
        }

        if (currentState.isHost) {
            const nextSnapshot = applyBattlePrimeSelection(
                currentState.snapshot,
                currentState.playerId,
                prime
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
        });

        return { didBroadcast };
    }

    async function sendMultiplayerPenalty(
        snapshotOverride?: RoomSnapshot
    ): Promise<boolean> {
        const currentState = latestMultiplayerRef.current;

        if (!currentState.playerId) {
            return false;
        }

        if (currentState.isHost) {
            const snapshot = snapshotOverride ?? currentState.snapshot;

            if (!snapshot) {
                return false;
            }

            const nextSnapshot = applyBattlePenalty(
                snapshot,
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
            type: 'combo_penalty',
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
        const countdownSnapshot = message.ready
            ? startRoomCountdown(nextSnapshot)
            : nextSnapshot;

        updateSnapshot(countdownSnapshot, '');
        await broadcastMessage({
            type: 'room_state',
            snapshot: countdownSnapshot,
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
            message.prime
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
        index = 0
    ): Promise<undefined> {
        if (index >= queuedPrimes.length) {
            return undefined;
        }

        const prime = queuedPrimes[index];

        const currentState = latestMultiplayerRef.current;

        if (
            !currentState.snapshot ||
            currentState.snapshot.status !== 'playing'
        ) {
            return undefined;
        }

        const currentPlayer = currentState.snapshot.players.find(
            (player) => player.id === currentState.playerId
        );

        if (!currentPlayer) {
            return undefined;
        }

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
            await sendMultiplayerPenalty();
            return undefined;
        }

        setMultiplayerPrimeQueue((currentQueue: readonly Prime[]) =>
            currentQueue.slice(1)
        );

        const sendResult = await sendMultiplayerPrime(prime);

        if (!sendResult.didBroadcast) {
            setMultiplayerPrimeQueue([]);
            return undefined;
        }

        if (index >= queuedPrimes.length - 1) {
            return undefined;
        }

        await wait(multiplayerComboStepDelayMs);
        await processMultiplayerQueue(queuedPrimes, index + 1);

        return undefined;
    }

    async function handleMultiplayerComboSubmit(queue: readonly Prime[]) {
        if (isMultiplayerInputDisabled || queue.length === 0) {
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

    if (screen === 'menu') {
        const opponentPlayer = multiplayer.snapshot?.players.find(
            (player) => player.id !== multiplayer.playerId
        );

        return (
            <MenuScreen
                isCurrentPlayerReady={
                    multiplayerPlayers.find(
                        (player) => player.id === multiplayer.playerId
                    )?.ready ?? false
                }
                isInRoom={Boolean(multiplayer.roomId)}
                isOpponentReady={
                    multiplayerPlayers.find(
                        (player) => player.id !== multiplayer.playerId
                    )?.ready ?? false
                }
                multiplayerCountdownValue={multiplayerCountdownValue}
                onAcceptInvitation={() => {
                    detachPromise(handleAcceptInvitation());
                }}
                onDeclineInvitation={handleDeclineInvitation}
                onEditName={handleEditName}
                onInvitePlayer={(targetPlayerId) => {
                    detachPromise(handleLobbyInvite(targetPlayerId));
                }}
                onlineUsers={onlineUsers}
                onPrefetchInviteUsers={prefetchOnlineUsers}
                onStartSoloGame={startSingleGame}
                onToggleReady={() => {
                    detachPromise(toggleReady());
                }}
                opponentName={opponentPlayer?.name}
                pendingInvitation={pendingInvitation}
                playerName={playerName}
                toastId={lobbyToast.id}
                toastMessage={lobbyToast.message}
            />
        );
    }

    if (screen === 'single') {
        return (
            <SingleGameScreen
                formatCountdown={formatCountdown}
                isSoloComboRunning={isSoloComboRunning}
                onBack={returnToMenu}
                onSubmit={handleSoloComboSubmit}
                playablePrimes={playablePrimes}
                soloCountdownProgress={soloCountdownProgress}
                soloPrimeQueue={soloPrimeQueue}
                soloState={soloState}
                soloTimeLeft={soloTimeLeft}
                soloTimerPenaltyPopKey={soloTimerPenaltyPopKey}
            />
        );
    }

    return (
        <MultiplayerGameScreen
            currentMultiplayerPlayer={currentMultiplayerPlayer}
            isMultiplayerComboRunning={isMultiplayerComboRunning}
            isMultiplayerInputDisabled={isMultiplayerInputDisabled}
            multiplayerPrimeQueue={multiplayerPrimeQueue}
            multiplayerSnapshot={multiplayer.snapshot}
            onBack={returnToMenu}
            onSubmit={handleMultiplayerComboSubmit}
            playablePrimes={playablePrimes}
        />
    );
}

async function wait(durationMs: number) {
    await new Promise<void>((resolve) => {
        globalThis.setTimeout(
            () => {
                resolve();
            },
            durationMs,
            undefined
        );
    });

    return undefined;
}

function detachPromise(promise: Promise<unknown>) {
    promise.catch(() => undefined);
}

function createSoloRunSeed(): string {
    return `solo:${crypto.randomUUID()}`;
}

function getInitialPlayerName(): string {
    const storedName = normalizePlayerName(
        globalThis.localStorage.getItem(playerNameStorageKey) ?? ''
    );

    if (storedName) {
        return storedName;
    }

    return uiText.guest;
}

function getUsedPlayerNames(): readonly string[] {
    const rawValue = globalThis.localStorage.getItem(usedPlayerNamesStorageKey);

    if (!rawValue) {
        return [];
    }

    try {
        const parsedValue = JSON.parse(rawValue) as unknown;
        return isArray(parsedValue)
            ? parsedValue
                  .map((name) => normalizePlayerName(String(name)))
                  .filter(Boolean)
            : [];
    } catch {
        return [];
    }
}

function persistPlayerName(playerName: string) {
    const normalizedName = normalizePlayerName(playerName);

    if (!normalizedName) {
        return;
    }

    globalThis.localStorage.setItem(playerNameStorageKey, normalizedName);

    const nextUsedNames = [
        normalizedName,
        ...getUsedPlayerNames().filter((name) => name !== normalizedName),
    ].slice(0, fallbackPlayerNames.length);

    globalThis.localStorage.setItem(
        usedPlayerNamesStorageKey,
        JSON.stringify(nextUsedNames)
    );
}

function normalizePlayerName(value: string): string {
    return value.trim().replaceAll(/\s+/g, ' ').slice(0, 24);
}

function createRoomId(): string {
    return String(Math.floor(1000 + Math.random() * 9000));
}

function isArray(value: unknown): value is readonly unknown[] {
    return (
        value !== null &&
        typeof value === 'object' &&
        value.constructor === Array
    );
}

function formatCountdown(totalSeconds: number): string {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;

    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

function isPendingGuestJoin(multiplayer: MultiplayerState): boolean {
    return (
        !multiplayer.isHost &&
        Boolean(multiplayer.playerId) &&
        !multiplayer.roomId &&
        !multiplayer.snapshot
    );
}
