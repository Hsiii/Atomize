import { useEffect, useRef, useState } from 'react';
import {
    applySoloPenalty,
    advanceSoloState,
    applyPrimeSelection,
    createInitialSoloState,
    PRIME_POOL,
    type Prime,
    type RoomSnapshot,
} from '@atomize/game-core';
import type { RealtimeChannel, SupabaseClient } from '@supabase/supabase-js';

import {
    uiText,
    type MenuMode,
    type MultiplayerState,
    type Screen,
} from './app-state';
import { MenuScreen } from './components/MenuScreen';
import { MultiplayerGameScreen } from './components/MultiplayerGameScreen';
import { MultiplayerLobbyScreen } from './components/MultiplayerLobbyScreen';
import { SingleGameScreen } from './components/SingleGameScreen';
import {
    addPlayerToRoom,
    applyBattlePenalty,
    applyBattlePrimeSelection,
    beginRoomMatch,
    canStartRoomCountdown,
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
const multiplayerCountdownDurationMs = 3000;
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
    message: string | null;
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
          type: 'prime_selected';
          playerId: string;
          prime: Prime;
      }
        | {
                    type: 'combo_penalty';
                    playerId: string;
            }
    | {
          type: 'player_ready';
          playerId: string;
          ready: boolean;
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

export default function App() {
    const initialSoloSeedRef = useRef(createSoloRunSeed());
    const [screen, setScreen] = useState<Screen>('menu');
    const [menuMode, setMenuMode] = useState<MenuMode>('default');
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
    const [multiplayerCountdownValue, setMultiplayerCountdownValue] = useState<
        number | null
    >(null);
    const [playerName] = useState(() => getInitialPlayerName());
    const [lobbyToast, setLobbyToast] = useState<LobbyToastState>({
        id: 0,
        message: null,
    });
    const [multiplayer, setMultiplayer] = useState<MultiplayerState>({
        playerId: null,
        snapshot: null,
        statusText: uiText.idleStatus,
        roomId: '',
        isHost: false,
    });
    const [roomIdInput, setRoomIdInput] = useState('');
    const channelRef = useRef<RealtimeChannel | null>(null);
    const supabaseRef = useRef<SupabaseClient | null>(null);
    const latestSoloStateRef = useRef(soloState);
    const latestMultiplayerRef = useRef(multiplayer);
    const joinLookupTimeoutRef = useRef<number | null>(null);
    const joinRetryIntervalRef = useRef<number | null>(null);
    const multiplayerPlayers = multiplayer.snapshot?.players ?? [];
    const currentMultiplayerPlayer =
        multiplayerPlayers.find(
            (player) => player.id === multiplayer.playerId
        ) ?? null;
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
        if (multiplayer.snapshot?.status === 'playing') {
            setScreen('multi-game');
        }
    }, [multiplayer.snapshot?.status]);

    useEffect(() => {
        const countdownEndsAt = multiplayer.snapshot?.countdownEndsAt;

        if (multiplayer.snapshot?.status !== 'countdown' || !countdownEndsAt) {
            setMultiplayerCountdownValue(null);
            return;
        }

        const updateCountdownValue = () => {
            const remainingMs = countdownEndsAt - Date.now();
            setMultiplayerCountdownValue(
                Math.max(1, Math.ceil(remainingMs / 1000))
            );
        };

        updateCountdownValue();

        const timer = window.setInterval(updateCountdownValue, 100);

        return () => {
            window.clearInterval(timer);
        };
    }, [multiplayer.snapshot?.countdownEndsAt, multiplayer.snapshot?.status]);

    useEffect(() => {
        const countdownEndsAt = multiplayer.snapshot?.countdownEndsAt;

        if (
            !multiplayer.isHost ||
            multiplayer.snapshot?.status !== 'countdown' ||
            !countdownEndsAt
        ) {
            return;
        }

        const timer = window.setTimeout(
            () => {
                const currentState = latestMultiplayerRef.current;

                if (
                    !currentState.isHost ||
                    !currentState.snapshot ||
                    currentState.snapshot.status !== 'countdown' ||
                    !currentState.playerId
                ) {
                    return;
                }

                const nextSnapshot = beginRoomMatch(currentState.snapshot);
                updateSnapshot(nextSnapshot, '');
                void broadcastMessage({
                    type: 'room_state',
                    snapshot: nextSnapshot,
                    sourcePlayerId: currentState.playerId,
                });
            },
            Math.max(0, countdownEndsAt - Date.now())
        );

        return () => {
            window.clearTimeout(timer);
        };
    }, [
        multiplayer.isHost,
        multiplayer.snapshot?.countdownEndsAt,
        multiplayer.snapshot?.status,
    ]);

    useEffect(() => {
        if (screen !== 'single') {
            return;
        }

        setSoloTimeLeft(soloDurationSeconds);

        const timer = window.setInterval(() => {
            setSoloTimeLeft((currentTime) => {
                if (currentTime <= 1) {
                    window.clearInterval(timer);
                    return 0;
                }

                return currentTime - 1;
            });
        }, 1000);

        return () => {
            window.clearInterval(timer);
        };
    }, [screen]);

    useEffect(() => {
        if (multiplayer.snapshot?.status === 'playing') {
            return;
        }

        setMultiplayerPrimeQueue([]);
        setIsMultiplayerComboRunning(false);
    }, [multiplayer.snapshot?.status]);

    useEffect(() => {
        if (screen !== 'single' || !isSoloComboRunning) {
            return;
        }

        if (soloTimeLeft === 0) {
            setIsSoloComboRunning(false);
            return;
        }

        if (soloPrimeQueue.length === 0) {
            setIsSoloComboRunning(false);
            return;
        }

        const timer = window.setTimeout(() => {
            const currentState = latestSoloStateRef.current;
            const nextPrime = soloPrimeQueue[0];
            const outcome = applyPrimeSelection(
                currentState.currentStage,
                nextPrime
            );

            if (outcome.kind === 'wrong') {
                setSoloState(applySoloPenalty(currentState));
                setSoloPrimeQueue([]);
                setSoloTimeLeft((currentTime) => Math.max(0, currentTime - 1));
                setSoloTimerPenaltyPopKey((currentKey) => currentKey + 1);
                setIsSoloComboRunning(false);
                return;
            }

            const nextState = advanceSoloState(currentState, soloSeed, nextPrime);
            const hasRedundantBufferedPrimes =
                outcome.cleared && soloPrimeQueue.length > 1;

            if (hasRedundantBufferedPrimes) {
                setSoloState(applySoloPenalty(nextState));
                setSoloPrimeQueue([]);
                setSoloTimeLeft((currentTime) => Math.max(0, currentTime - 1));
                setSoloTimerPenaltyPopKey((currentKey) => currentKey + 1);
                setIsSoloComboRunning(false);
                return;
            }

            setSoloState(nextState);

            setSoloPrimeQueue((currentQueue) => currentQueue.slice(1));

            if (outcome.cleared) {
                setIsSoloComboRunning(false);
            }
        }, soloComboStepDelayMs);

        return () => {
            window.clearTimeout(timer);
        };
    }, [isSoloComboRunning, screen, soloPrimeQueue, soloTimeLeft]);

    useEffect(() => {
        supabaseRef.current = createRealtimeClient();

        return () => {
            if (channelRef.current && supabaseRef.current) {
                void supabaseRef.current.removeChannel(channelRef.current);
            }
        };
    }, []);

    function handleSoloComboSubmit(queue: readonly Prime[]) {
        if (
            soloTimeLeft === 0 ||
            queue.length === 0 ||
            isSoloComboRunning
        ) {
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

    function startCreateRoomFlow() {
        setMenuMode('create-room');
        setScreen('multi-lobby');
        setStatusText(uiText.openingRoom);
        void createRoom();
    }

    function startJoinRoomFlow() {
        setMenuMode('join-room');
        setStatusText(uiText.idleStatus);
        setScreen('multi-lobby');
    }

    function handleRoomIdInputChange(value: string) {
        setRoomIdInput(normalizeRoomId(value));
    }

    async function returnToMenu() {
        await closeActiveChannel();
        setSoloPrimeQueue([]);
        setIsSoloComboRunning(false);
        setSoloTimerPenaltyPopKey(0);
        setMultiplayerPrimeQueue([]);
        setIsMultiplayerComboRunning(false);
        setMultiplayer({
            playerId: null,
            snapshot: null,
            statusText: uiText.idleStatus,
            roomId: '',
            isHost: false,
        });
        setRoomIdInput('');
        setMenuMode('default');
        setScreen('menu');
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
        if (joinLookupTimeoutRef.current !== null) {
            window.clearTimeout(joinLookupTimeoutRef.current);
            joinLookupTimeoutRef.current = null;
        }

        if (joinRetryIntervalRef.current !== null) {
            window.clearInterval(joinRetryIntervalRef.current);
            joinRetryIntervalRef.current = null;
        }
    }

    async function failPendingJoin(message: string) {
        showLobbyToast(message);
        clearPendingJoinTimers();
        await closeActiveChannel();
        setMultiplayer({
            playerId: null,
            snapshot: null,
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
            const response = await Promise.race<
                'ok' | 'timed out' | 'error'
            >([
                channel.send({
                    type: 'broadcast',
                    event: message.type,
                    payload: message,
                }),
                new Promise<'timed out'>((resolve) => {
                    timeoutId = window.setTimeout(
                        () => resolve('timed out'),
                        realtimeSendTimeoutMs
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
                window.clearTimeout(timeoutId);
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
            channelRef.current = null;
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
            return;
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
            .on('broadcast', { event: 'join_request' }, async ({ payload }) => {
                const message = payload as RoomBroadcastMessage;
                const currentState = latestMultiplayerRef.current;

                if (
                    message.type !== 'join_request' ||
                    !currentState.isHost ||
                    !currentState.snapshot
                ) {
                    return;
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
                    return;
                }

                updateSnapshot(nextSnapshot, '');
                await broadcastMessage({
                    type: 'room_state',
                    snapshot: nextSnapshot,
                    sourcePlayerId: playerId,
                });
            })
            .on('broadcast', { event: 'player_ready' }, async ({ payload }) => {
                const message = payload as RoomBroadcastMessage;
                const currentState = latestMultiplayerRef.current;

                if (
                    message.type !== 'player_ready' ||
                    !currentState.isHost ||
                    !currentState.snapshot
                ) {
                    return;
                }

                const nextSnapshot = setPlayerReady(
                    currentState.snapshot,
                    message.playerId,
                    message.ready
                );

                updateSnapshot(nextSnapshot, '');
                await broadcastMessage({
                    type: 'room_state',
                    snapshot: nextSnapshot,
                    sourcePlayerId: playerId,
                });
            })
            .on(
                'broadcast',
                { event: 'prime_selected' },
                async ({ payload }) => {
                    const message = payload as RoomBroadcastMessage;
                    const currentState = latestMultiplayerRef.current;

                    if (
                        message.type !== 'prime_selected' ||
                        !currentState.isHost ||
                        !currentState.snapshot
                    ) {
                        return;
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
                        sourcePlayerId: playerId,
                    });
                }
            )
            .on('broadcast', { event: 'combo_penalty' }, async ({ payload }) => {
                const message = payload as RoomBroadcastMessage;
                const currentState = latestMultiplayerRef.current;

                if (
                    message.type !== 'combo_penalty' ||
                    !currentState.isHost ||
                    !currentState.snapshot
                ) {
                    return;
                }

                const nextSnapshot = applyBattlePenalty(
                    currentState.snapshot,
                    message.playerId
                );

                updateSnapshot(nextSnapshot, '');
                await broadcastMessage({
                    type: 'room_state',
                    snapshot: nextSnapshot,
                    sourcePlayerId: playerId,
                });
            })
            .on('broadcast', { event: 'room_error' }, ({ payload }) => {
                const message = payload as RoomBroadcastMessage;

                if (
                    message.type !== 'room_error' ||
                    message.targetPlayerId !== playerId
                ) {
                    return;
                }

                const currentState = latestMultiplayerRef.current;

                if (isPendingGuestJoin(currentState)) {
                    void failPendingJoin(message.message);
                    return;
                }

                setStatusText(message.message);
            });

        channelRef.current = channel;

        setMultiplayer((currentState) => ({
            ...currentState,
            playerId,
            roomId: isHost ? roomId : currentState.roomId,
            isHost,
            statusText: '',
        }));

        channel.subscribe(async (status) => {
            if (status === 'SUBSCRIBED') {
                await onSubscribed();
            }

            if (status === 'CHANNEL_ERROR') {
                const currentState = latestMultiplayerRef.current;

                if (isPendingGuestJoin(currentState)) {
                    void failPendingJoin(uiText.joinMissingRoomToast);
                    return;
                }

                setStatusText('Server connection failed');
            }
        });
    }

    async function createRoom() {
        const roomId = createRoomId();
        const playerId = crypto.randomUUID();
        const snapshot = createRoomSnapshot(roomId, playerId, playerName);

        if (supabaseRef.current) {
            setMultiplayer((currentState) => ({
                ...currentState,
                playerId,
                snapshot,
                roomId,
                isHost: true,
                statusText: uiText.openingRoom,
            }));
        }

        await subscribeToRoom(roomId, playerId, true, async () => {
            updateSnapshot(snapshot, '');
            await broadcastMessage({
                type: 'room_state',
                snapshot,
                sourcePlayerId: playerId,
            });
        });
    }

    async function joinRoom() {
        const roomId = normalizeRoomId(roomIdInput);

        if (roomId.length !== 4) {
            return;
        }

        const playerId = crypto.randomUUID();
        setLobbyToast((currentToast) => ({
            id: currentToast.id,
            message: null,
        }));

        await subscribeToRoom(roomId, playerId, false, async () => {
            setScreen('multi-lobby');
            const sendJoinRequest = () => {
                const currentState = latestMultiplayerRef.current;

                if (!isPendingGuestJoin(currentState)) {
                    clearPendingJoinTimers();
                    return;
                }

                void broadcastMessage({
                    type: 'join_request',
                    playerId,
                    playerName,
                });
            };

            sendJoinRequest();

            clearPendingJoinTimers();
            joinRetryIntervalRef.current = window.setInterval(
                sendJoinRequest,
                joinRoomRetryIntervalMs
            );
            joinLookupTimeoutRef.current = window.setTimeout(() => {
                const currentState = latestMultiplayerRef.current;

                if (!isPendingGuestJoin(currentState)) {
                    clearPendingJoinTimers();
                    return;
                }

                void failPendingJoin(uiText.joinMissingRoomToast);
            }, joinRoomLookupTimeoutMs);
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
            return broadcastMessage({
                type: 'room_state',
                snapshot: nextSnapshot,
                sourcePlayerId: currentState.playerId,
            });
        }

        return broadcastMessage({
            type: 'combo_penalty',
            playerId: currentState.playerId,
        });
    }

    async function handleMultiplayerComboSubmit(queue: readonly Prime[]) {
        if (
            isMultiplayerInputDisabled ||
            queue.length === 0 ||
            isMultiplayerComboRunning
        ) {
            return;
        }

        setIsMultiplayerComboRunning(true);

        const queuedPrimes = [...queue];
        setMultiplayerPrimeQueue(queuedPrimes);

        try {
            for (const [index, prime] of queuedPrimes.entries()) {
                const currentState = latestMultiplayerRef.current;

                if (
                    !currentState.snapshot ||
                    currentState.snapshot.status !== 'playing'
                ) {
                    break;
                }

                const currentPlayer = currentState.snapshot.players.find(
                    (player) => player.id === currentState.playerId
                );

                if (!currentPlayer) {
                    break;
                }

                const outcome = applyPrimeSelection(currentPlayer.stage, prime);

                if (outcome.kind === 'wrong') {
                    setMultiplayerPrimeQueue([]);

                    const sendResult = await sendMultiplayerPrime(prime);

                    if (!sendResult.didBroadcast) {
                        break;
                    }

                    break;
                }

                const hasRedundantBufferedPrimes =
                    outcome.cleared && index < queuedPrimes.length - 1;

                if (hasRedundantBufferedPrimes) {
                    setMultiplayerPrimeQueue([]);

                    await sendMultiplayerPenalty();
                    break;
                }

                setMultiplayerPrimeQueue((currentQueue) =>
                    currentQueue.slice(1)
                );

                const sendResult = await sendMultiplayerPrime(prime);

                if (!sendResult.didBroadcast) {
                    setMultiplayerPrimeQueue([]);
                    break;
                }

                await wait(multiplayerComboStepDelayMs);
            }
        } finally {
            setIsMultiplayerComboRunning(false);
        }
    }

    async function handleGuestReady() {
        const currentState = latestMultiplayerRef.current;

        if (
            !currentState.playerId ||
            !currentState.snapshot ||
            currentState.isHost ||
            currentState.snapshot.status !== 'waiting'
        ) {
            return;
        }

        const currentPlayer = currentState.snapshot.players.find(
            (player) => player.id === currentState.playerId
        );

        if (!currentPlayer) {
            return;
        }

        const nextReady = !currentPlayer.ready;
        const optimisticSnapshot = setPlayerReady(
            currentState.snapshot,
            currentState.playerId,
            nextReady
        );
        updateSnapshot(
            optimisticSnapshot,
            nextReady ? uiText.waitingForHost : ''
        );

        await broadcastMessage({
            type: 'player_ready',
            playerId: currentState.playerId,
            ready: nextReady,
        });
    }

    async function handleHostStart() {
        const currentState = latestMultiplayerRef.current;

        if (
            !currentState.playerId ||
            !currentState.snapshot ||
            !currentState.isHost
        ) {
            return;
        }

        if (!canStartRoomCountdown(currentState.snapshot)) {
            setStatusText(uiText.opponentMustReady);
            return;
        }

        const nextSnapshot = startRoomCountdown(
            currentState.snapshot,
            Date.now() + multiplayerCountdownDurationMs
        );
        updateSnapshot(nextSnapshot, '');

        await broadcastMessage({
            type: 'room_state',
            snapshot: nextSnapshot,
            sourcePlayerId: currentState.playerId,
        });
    }

    if (screen === 'menu') {
        return (
            <MenuScreen
                onStartSingleGame={startSingleGame}
                onStartCreateRoomFlow={startCreateRoomFlow}
                onStartJoinRoomFlow={startJoinRoomFlow}
            />
        );
    }

    if (screen === 'single') {
        return (
            <SingleGameScreen
                playablePrimes={playablePrimes}
                soloState={soloState}
                soloTimeLeft={soloTimeLeft}
                soloCountdownProgress={soloCountdownProgress}
                soloPrimeQueue={soloPrimeQueue}
                isSoloComboRunning={isSoloComboRunning}
                soloTimerPenaltyPopKey={soloTimerPenaltyPopKey}
                onBack={returnToMenu}
                onSubmit={handleSoloComboSubmit}
                formatCountdown={formatCountdown}
            />
        );
    }

    if (screen === 'multi-lobby') {
        return (
            <MultiplayerLobbyScreen
                menuMode={menuMode}
                multiplayer={multiplayer}
                multiplayerCountdownValue={multiplayerCountdownValue}
                transientToastId={lobbyToast.id}
                transientToastMessage={lobbyToast.message}
                isJoinPending={isPendingGuestJoin(multiplayer)}
                roomIdInput={roomIdInput}
                onBack={returnToMenu}
                onRoomIdInputChange={handleRoomIdInputChange}
                onJoinRoom={joinRoom}
                onCreateRoom={createRoom}
                onGuestReady={handleGuestReady}
                onHostStart={handleHostStart}
                canStartRoomCountdown={
                    multiplayer.isHost && multiplayer.snapshot
                        ? canStartRoomCountdown(multiplayer.snapshot)
                        : false
                }
            />
        );
    }

    return (
        <MultiplayerGameScreen
            playablePrimes={playablePrimes}
            currentMultiplayerPlayer={currentMultiplayerPlayer}
            multiplayerSnapshot={multiplayer.snapshot}
            multiplayerPrimeQueue={multiplayerPrimeQueue}
            isMultiplayerInputDisabled={isMultiplayerInputDisabled}
            isMultiplayerComboRunning={isMultiplayerComboRunning}
            onBack={returnToMenu}
            onSubmit={handleMultiplayerComboSubmit}
        />
    );
}

function wait(durationMs: number): Promise<void> {
    return new Promise((resolve) => {
        window.setTimeout(resolve, durationMs);
    });
}

function createSoloRunSeed(): string {
    return `solo:${crypto.randomUUID()}`;
}

function getInitialPlayerName(): string {
    if (typeof window === 'undefined') {
        return fallbackPlayerNames[0];
    }

    const storedName = normalizePlayerName(
        window.localStorage.getItem(playerNameStorageKey) ?? ''
    );

    if (storedName) {
        return storedName;
    }

    return getRandomUnusedPlayerName();
}

function getRandomUnusedPlayerName(currentName?: string): string {
    if (typeof window === 'undefined') {
        return fallbackPlayerNames[0];
    }

    const usedNames = new Set(
        getUsedPlayerNames().filter((name) => name !== currentName)
    );
    const availableNames = fallbackPlayerNames.filter(
        (name) => !usedNames.has(name)
    );
    const sourceNames =
        availableNames.length > 0 ? availableNames : fallbackPlayerNames;
    const randomIndex = Math.floor(Math.random() * sourceNames.length);

    return sourceNames[randomIndex] ?? fallbackPlayerNames[0];
}

function getUsedPlayerNames(): string[] {
    if (typeof window === 'undefined') {
        return [];
    }

    const rawValue = window.localStorage.getItem(usedPlayerNamesStorageKey);

    if (!rawValue) {
        return [];
    }

    try {
        const parsedValue = JSON.parse(rawValue) as string[];
        return Array.isArray(parsedValue)
            ? parsedValue
                  .map((name) => normalizePlayerName(name))
                  .filter(Boolean)
            : [];
    } catch {
        return [];
    }
}

function persistPlayerName(playerName: string) {
    if (typeof window === 'undefined') {
        return;
    }

    const normalizedName = normalizePlayerName(playerName);

    if (!normalizedName) {
        return;
    }

    window.localStorage.setItem(playerNameStorageKey, normalizedName);

    const nextUsedNames = [
        normalizedName,
        ...getUsedPlayerNames().filter((name) => name !== normalizedName),
    ].slice(0, fallbackPlayerNames.length);

    window.localStorage.setItem(
        usedPlayerNamesStorageKey,
        JSON.stringify(nextUsedNames)
    );
}

function normalizePlayerName(value: string): string {
    return value.trim().replace(/\s+/g, ' ').slice(0, 24);
}

function createRoomId(): string {
    return String(Math.floor(1000 + Math.random() * 9000));
}

function normalizeRoomId(value: string): string {
    return value.replace(/\D/g, '').slice(0, 4);
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
