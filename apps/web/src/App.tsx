import { useEffect, useRef, useState } from "react";
import type { RealtimeChannel, SupabaseClient } from "@supabase/supabase-js";
import {
  PRIME_POOL,
  applyPrimeSelection,
  advanceSoloState,
  createInitialSoloState,
  type Prime,
  type RoomSnapshot,
} from "@atomize/game-core";
import {
  addPlayerToRoom,
  applyBattlePrimeSelection,
  beginRoomMatch,
  canStartRoomCountdown,
  createRoomSnapshot,
  setPlayerReady,
  startRoomCountdown,
} from "./lib/multiplayer-room";
import {
  createRealtimeClient,
  getMissingSupabaseEnvVars,
} from "./lib/supabase";
import { MenuScreen } from "./components/MenuScreen";
import { SingleGameScreen } from "./components/SingleGameScreen";
import { MultiplayerLobbyScreen } from "./components/MultiplayerLobbyScreen";
import { MultiplayerGameScreen } from "./components/MultiplayerGameScreen";
import { type MenuMode, type MultiplayerState, type Screen, uiText } from "./app-state";

const soloSeed = "solo-mvp-seed";
const soloDurationSeconds = 60;
const soloStartCountdownSeconds = 3;
const playablePrimes = PRIME_POOL.slice(0, 9);
const soloComboStepDelayMs = 280;
const multiplayerComboStepDelayMs = 220;
const multiplayerCountdownDurationMs = 3000;
const joinRoomLookupTimeoutMs = 1000;

type LobbyToastState = {
  id: number;
  message: string | null;
};

type RoomBroadcastMessage =
  | {
      type: "room_state";
      snapshot: RoomSnapshot;
      sourcePlayerId: string;
    }
  | {
      type: "join_request";
      playerId: string;
    }
  | {
      type: "prime_selected";
      playerId: string;
      prime: Prime;
    }
  | {
      type: "player_ready";
      playerId: string;
      ready: boolean;
    }
  | {
      type: "room_error";
      targetPlayerId: string;
      message: string;
    };

export default function App() {
  const [screen, setScreen] = useState<Screen>("menu");
  const [menuMode, setMenuMode] = useState<MenuMode>("default");
  const [soloState, setSoloState] = useState(() => createInitialSoloState(soloSeed));
  const [soloTimeLeft, setSoloTimeLeft] = useState(soloDurationSeconds);
  const [soloStartCountdownValue, setSoloStartCountdownValue] = useState<number | null>(null);
  const [multiplayerTimeLeft, setMultiplayerTimeLeft] = useState(soloDurationSeconds);
  const [soloPrimeQueue, setSoloPrimeQueue] = useState<Prime[]>([]);
  const [isSoloComboRunning, setIsSoloComboRunning] = useState(false);
  const [soloTimerPenaltyPopKey, setSoloTimerPenaltyPopKey] = useState(0);
  const [multiplayerPrimeQueue, setMultiplayerPrimeQueue] = useState<Prime[]>([]);
  const [isMultiplayerComboRunning, setIsMultiplayerComboRunning] = useState(false);
  const [multiplayerCountdownValue, setMultiplayerCountdownValue] = useState<number | null>(null);
  const [lobbyToast, setLobbyToast] = useState<LobbyToastState>({
    id: 0,
    message: null,
  });
  const [multiplayer, setMultiplayer] = useState<MultiplayerState>({
    playerId: null,
    snapshot: null,
    statusText: uiText.idleStatus,
    roomId: "",
    isHost: false,
  });
  const [roomIdInput, setRoomIdInput] = useState("");
  const channelRef = useRef<RealtimeChannel | null>(null);
  const supabaseRef = useRef<SupabaseClient | null>(null);
  const latestSoloStateRef = useRef(soloState);
  const latestMultiplayerRef = useRef(multiplayer);
  const joinLookupTimeoutRef = useRef<number | null>(null);
  const multiplayerPlayers = multiplayer.snapshot?.players ?? [];
  const currentMultiplayerPlayer = multiplayerPlayers.find((player) => player.id === multiplayer.playerId) ?? null;
  const multiplayerCountdownProgress = (multiplayerTimeLeft / soloDurationSeconds) * 100;
  const multiplayerScore = currentMultiplayerPlayer?.combo ?? 0;
  const isMultiplayerInputDisabled = !multiplayer.snapshot || multiplayer.snapshot.status !== "playing" || isMultiplayerComboRunning || multiplayerTimeLeft === 0;

  const soloCountdownProgress = (soloTimeLeft / soloDurationSeconds) * 100;

  useEffect(() => {
    latestSoloStateRef.current = soloState;
  }, [soloState]);

  useEffect(() => {
    latestMultiplayerRef.current = multiplayer;
  }, [multiplayer]);

  useEffect(() => {
    if (multiplayer.snapshot?.status === "playing") {
      setScreen("multi-game");
    }
  }, [multiplayer.snapshot?.status]);

  useEffect(() => {
    const countdownEndsAt = multiplayer.snapshot?.countdownEndsAt;

    if (multiplayer.snapshot?.status !== "countdown" || !countdownEndsAt) {
      setMultiplayerCountdownValue(null);
      return;
    }

    const updateCountdownValue = () => {
      const remainingMs = countdownEndsAt - Date.now();
      setMultiplayerCountdownValue(Math.max(1, Math.ceil(remainingMs / 1000)));
    };

    updateCountdownValue();

    const timer = window.setInterval(updateCountdownValue, 100);

    return () => {
      window.clearInterval(timer);
    };
  }, [multiplayer.snapshot?.countdownEndsAt, multiplayer.snapshot?.status]);

  useEffect(() => {
    const countdownEndsAt = multiplayer.snapshot?.countdownEndsAt;

    if (!multiplayer.isHost || multiplayer.snapshot?.status !== "countdown" || !countdownEndsAt) {
      return;
    }

    const timer = window.setTimeout(() => {
      const currentState = latestMultiplayerRef.current;

      if (!currentState.isHost || !currentState.snapshot || currentState.snapshot.status !== "countdown" || !currentState.playerId) {
        return;
      }

      const nextSnapshot = beginRoomMatch(currentState.snapshot);
      updateSnapshot(nextSnapshot, "");
      void broadcastMessage({
        type: "room_state",
        snapshot: nextSnapshot,
        sourcePlayerId: currentState.playerId,
      });
    }, Math.max(0, countdownEndsAt - Date.now()));

    return () => {
      window.clearTimeout(timer);
    };
  }, [multiplayer.isHost, multiplayer.snapshot?.countdownEndsAt, multiplayer.snapshot?.status]);

  useEffect(() => {
    if (screen !== "single" || soloStartCountdownValue !== null) {
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
  }, [screen, soloStartCountdownValue]);

  useEffect(() => {
    if (screen !== "single" || soloStartCountdownValue === null) {
      return;
    }

    const timer = window.setTimeout(() => {
      setSoloStartCountdownValue((currentValue) => {
        if (currentValue === null) {
          return currentValue;
        }

        if (currentValue <= 1) {
          return null;
        }

        return currentValue - 1;
      });
    }, 1000);

    return () => {
      window.clearTimeout(timer);
    };
  }, [screen, soloStartCountdownValue]);

  useEffect(() => {
    if (screen !== "multi-game") {
      return;
    }

    setMultiplayerTimeLeft(soloDurationSeconds);

    const timer = window.setInterval(() => {
      setMultiplayerTimeLeft((currentTime) => {
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
  }, [multiplayer.roomId, screen]);

  useEffect(() => {
    if (screen !== "single" || !isSoloComboRunning) {
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
      const outcome = applyPrimeSelection(currentState.currentStage, nextPrime);

      setSoloState(advanceSoloState(currentState, soloSeed, nextPrime));
      setSoloPrimeQueue((currentQueue) => currentQueue.slice(1));

      if (outcome.kind === "wrong") {
        setSoloTimeLeft((currentTime) => Math.max(0, currentTime - 1));
        setSoloTimerPenaltyPopKey((currentKey) => currentKey + 1);
        setIsSoloComboRunning(false);
        return;
      }

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

  function handlePrimeTap(prime: Prime) {
    if (soloTimeLeft === 0 || isSoloComboRunning) {
      return;
    }

    setSoloPrimeQueue((currentQueue) => [...currentQueue, prime]);
  }

  function handleSoloComboSubmit() {
    if (soloTimeLeft === 0 || soloPrimeQueue.length === 0 || isSoloComboRunning) {
      return;
    }

    setIsSoloComboRunning(true);
  }

  function handleSoloComboBackspace() {
    if (soloPrimeQueue.length === 0 || isSoloComboRunning) {
      return;
    }

    setSoloPrimeQueue((currentQueue) => currentQueue.slice(0, -1));
  }

  function startSingleGame() {
    setSoloState(createInitialSoloState(soloSeed));
    setSoloTimeLeft(soloDurationSeconds);
    setSoloStartCountdownValue(soloStartCountdownSeconds);
    setSoloPrimeQueue([]);
    setIsSoloComboRunning(false);
    setSoloTimerPenaltyPopKey(0);
    setScreen("single");
  }

  function startCreateRoomFlow() {
    setMenuMode("create-room");
    setScreen("multi-lobby");
    setStatusText(uiText.openingRoom);
    void createRoom();
  }

  function startJoinRoomFlow() {
    setMenuMode("join-room");
    setStatusText(uiText.idleStatus);
    setScreen("multi-lobby");
  }

  function handleRoomIdInputChange(value: string) {
    setRoomIdInput(normalizeRoomId(value));
  }

  async function returnToMenu() {
    await closeActiveChannel();
    setSoloPrimeQueue([]);
    setIsSoloComboRunning(false);
    setSoloStartCountdownValue(null);
    setSoloTimerPenaltyPopKey(0);
    setMultiplayerPrimeQueue([]);
    setIsMultiplayerComboRunning(false);
    setMultiplayer({
      playerId: null,
      snapshot: null,
      statusText: uiText.idleStatus,
      roomId: "",
      isHost: false,
    });
    setRoomIdInput("");
    setMenuMode("default");
    setScreen("menu");
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

  function clearJoinLookupTimeout() {
    if (joinLookupTimeoutRef.current !== null) {
      window.clearTimeout(joinLookupTimeoutRef.current);
      joinLookupTimeoutRef.current = null;
    }
  }

  async function failPendingJoin(message: string) {
    clearJoinLookupTimeout();
    await closeActiveChannel();
    setMultiplayer({
      playerId: null,
      snapshot: null,
      statusText: uiText.idleStatus,
      roomId: "",
      isHost: false,
    });
    showLobbyToast(message);
  }

  async function broadcastMessage(message: RoomBroadcastMessage) {
    const channel = channelRef.current;

    if (!channel) {
      setStatusText("No active server channel");
      return;
    }

    const response = await channel.send({
      type: "broadcast",
      event: message.type,
      payload: message,
    });

    if (response !== "ok") {
      setStatusText(`Server send failed: ${response}`);
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
    clearJoinLookupTimeout();

    if (channelRef.current && supabaseRef.current) {
      await supabaseRef.current.removeChannel(channelRef.current);
      channelRef.current = null;
    }
  }

  async function subscribeToRoom(
    roomId: string,
    playerId: string,
    isHost: boolean,
    onSubscribed: () => Promise<void> | void,
  ) {
    const supabase = supabaseRef.current;

    if (!supabase) {
      const missingVars = getMissingSupabaseEnvVars();
      const envList = missingVars.join(", ");
      setStatusText(`Server unavailable: missing ${envList}. Add them to this environment and redeploy.`);
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
      .on("broadcast", { event: "room_state" }, ({ payload }) => {
        const message = payload as RoomBroadcastMessage;

        if (message.type !== "room_state") {
          return;
        }

        const currentState = latestMultiplayerRef.current;

        if (!currentState.isHost && currentState.playerId && message.snapshot.players.some((player) => player.id === currentState.playerId)) {
          clearJoinLookupTimeout();
        }

        updateSnapshot(message.snapshot, "");
      })
      .on("broadcast", { event: "join_request" }, async ({ payload }) => {
        const message = payload as RoomBroadcastMessage;
        const currentState = latestMultiplayerRef.current;

        if (message.type !== "join_request" || !currentState.isHost || !currentState.snapshot) {
          return;
        }

        const nextSnapshot = addPlayerToRoom(
          currentState.snapshot,
          message.playerId,
        );

        if (!nextSnapshot) {
          await broadcastMessage({
            type: "room_error",
            targetPlayerId: message.playerId,
            message: "Room already full",
          });
          return;
        }

        updateSnapshot(nextSnapshot, "");
        await broadcastMessage({
          type: "room_state",
          snapshot: nextSnapshot,
          sourcePlayerId: playerId,
        });
      })
      .on("broadcast", { event: "player_ready" }, async ({ payload }) => {
        const message = payload as RoomBroadcastMessage;
        const currentState = latestMultiplayerRef.current;

        if (message.type !== "player_ready" || !currentState.isHost || !currentState.snapshot) {
          return;
        }

        const nextSnapshot = setPlayerReady(currentState.snapshot, message.playerId, message.ready);

        updateSnapshot(nextSnapshot, "");
        await broadcastMessage({
          type: "room_state",
          snapshot: nextSnapshot,
          sourcePlayerId: playerId,
        });
      })
      .on("broadcast", { event: "prime_selected" }, async ({ payload }) => {
        const message = payload as RoomBroadcastMessage;
        const currentState = latestMultiplayerRef.current;

        if (message.type !== "prime_selected" || !currentState.isHost || !currentState.snapshot) {
          return;
        }

        const nextSnapshot = applyBattlePrimeSelection(
          currentState.snapshot,
          message.playerId,
          message.prime,
        );

        updateSnapshot(nextSnapshot, "");
        await broadcastMessage({
          type: "room_state",
          snapshot: nextSnapshot,
          sourcePlayerId: playerId,
        });
      })
      .on("broadcast", { event: "room_error" }, ({ payload }) => {
        const message = payload as RoomBroadcastMessage;

        if (message.type !== "room_error" || message.targetPlayerId !== playerId) {
          return;
        }

        const currentState = latestMultiplayerRef.current;

        if (!currentState.isHost && !currentState.roomId && !currentState.snapshot) {
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
      statusText: "",
    }));

    channel.subscribe(async (status) => {
      if (status === "SUBSCRIBED") {
        await onSubscribed();
      }

      if (status === "CHANNEL_ERROR") {
        setStatusText("Server connection failed");
      }
    });
  }

  async function createRoom() {
    const roomId = createRoomId();
    const playerId = crypto.randomUUID();
    const snapshot = createRoomSnapshot(roomId, playerId);

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
      updateSnapshot(snapshot, "");
      await broadcastMessage({
        type: "room_state",
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
      setScreen("multi-lobby");
      await broadcastMessage({
        type: "join_request",
        playerId,
      });

       clearJoinLookupTimeout();
       joinLookupTimeoutRef.current = window.setTimeout(() => {
         const currentState = latestMultiplayerRef.current;

         if (currentState.isHost || currentState.roomId || currentState.snapshot) {
           return;
         }

         void failPendingJoin(uiText.joinMissingRoomToast);
       }, joinRoomLookupTimeoutMs);
    });
  }

  async function sendMultiplayerPrime(prime: Prime) {
    const currentState = latestMultiplayerRef.current;

    if (!currentState.playerId || !currentState.snapshot) {
      setStatusText("Create or join a room first");
      return;
    }

    if (currentState.snapshot.status !== "playing") {
      return;
    }

    if (currentState.isHost) {
      const nextSnapshot = applyBattlePrimeSelection(
        currentState.snapshot,
        currentState.playerId,
        prime,
      );
      updateSnapshot(nextSnapshot, "");
      await broadcastMessage({
        type: "room_state",
        snapshot: nextSnapshot,
        sourcePlayerId: currentState.playerId,
      });
      return;
    }

    await broadcastMessage({
      type: "prime_selected",
      playerId: currentState.playerId,
      prime,
    });
  }

  function handleMultiplayerPrimeTap(prime: Prime) {
    if (isMultiplayerInputDisabled) {
      return;
    }

    setMultiplayerPrimeQueue((currentQueue) => [...currentQueue, prime]);
  }

  function handleMultiplayerComboBackspace() {
    if (isMultiplayerComboRunning || multiplayerPrimeQueue.length === 0) {
      return;
    }

    setMultiplayerPrimeQueue((currentQueue) => currentQueue.slice(0, -1));
  }

  async function handleMultiplayerComboSubmit() {
    if (isMultiplayerInputDisabled || multiplayerPrimeQueue.length === 0 || isMultiplayerComboRunning) {
      return;
    }

    setIsMultiplayerComboRunning(true);

    const queuedPrimes = [...multiplayerPrimeQueue];
    setMultiplayerPrimeQueue([]);

    try {
      for (const prime of queuedPrimes) {
        const currentState = latestMultiplayerRef.current;

        if (!currentState.snapshot || currentState.snapshot.status !== "playing") {
          break;
        }

        await sendMultiplayerPrime(prime);
        await wait(multiplayerComboStepDelayMs);
      }
    } finally {
      setIsMultiplayerComboRunning(false);
    }
  }

  async function handleGuestReady() {
    const currentState = latestMultiplayerRef.current;

    if (!currentState.playerId || !currentState.snapshot || currentState.isHost || currentState.snapshot.status !== "waiting") {
      return;
    }

    const currentPlayer = currentState.snapshot.players.find((player) => player.id === currentState.playerId);

    if (!currentPlayer) {
      return;
    }

    const nextReady = !currentPlayer.ready;
    const optimisticSnapshot = setPlayerReady(currentState.snapshot, currentState.playerId, nextReady);
    updateSnapshot(optimisticSnapshot, nextReady ? uiText.waitingForHost : "");

    await broadcastMessage({
      type: "player_ready",
      playerId: currentState.playerId,
      ready: nextReady,
    });
  }

  async function handleHostStart() {
    const currentState = latestMultiplayerRef.current;

    if (!currentState.playerId || !currentState.snapshot || !currentState.isHost) {
      return;
    }

    if (!canStartRoomCountdown(currentState.snapshot)) {
      setStatusText(uiText.opponentMustReady);
      return;
    }

    const nextSnapshot = startRoomCountdown(currentState.snapshot, Date.now() + multiplayerCountdownDurationMs);
    updateSnapshot(nextSnapshot, "");

    await broadcastMessage({
      type: "room_state",
      snapshot: nextSnapshot,
      sourcePlayerId: currentState.playerId,
    });
  }

  if (screen === "menu") {
    return (
      <MenuScreen
        onStartSingleGame={startSingleGame}
        onStartCreateRoomFlow={startCreateRoomFlow}
        onStartJoinRoomFlow={startJoinRoomFlow}
      />
    );
  }

  if (screen === "single") {
    return (
      <SingleGameScreen
        playablePrimes={playablePrimes}
        soloState={soloState}
        soloTimeLeft={soloTimeLeft}
        soloStartCountdownValue={soloStartCountdownValue}
        soloCountdownProgress={soloCountdownProgress}
        soloPrimeQueue={soloPrimeQueue}
        isSoloComboRunning={isSoloComboRunning}
        soloTimerPenaltyPopKey={soloTimerPenaltyPopKey}
        onBack={returnToMenu}
        onPrimeTap={handlePrimeTap}
        onBackspace={handleSoloComboBackspace}
        onSubmit={handleSoloComboSubmit}
        formatCountdown={formatCountdown}
      />
    );
  }

  if (screen === "multi-lobby") {
    return (
      <MultiplayerLobbyScreen
        menuMode={menuMode}
        multiplayer={multiplayer}
        multiplayerCountdownValue={multiplayerCountdownValue}
        transientToastId={lobbyToast.id}
        transientToastMessage={lobbyToast.message}
        roomIdInput={roomIdInput}
        onBack={returnToMenu}
        onRoomIdInputChange={handleRoomIdInputChange}
        onJoinRoom={joinRoom}
        onCreateRoom={createRoom}
        onGuestReady={handleGuestReady}
        onHostStart={handleHostStart}
        canStartRoomCountdown={multiplayer.isHost && multiplayer.snapshot ? canStartRoomCountdown(multiplayer.snapshot) : false}
      />
    );
  }

  return (
    <MultiplayerGameScreen
      playablePrimes={playablePrimes}
      multiplayerTimeLeft={multiplayerTimeLeft}
      multiplayerCountdownProgress={multiplayerCountdownProgress}
      multiplayerScore={multiplayerScore}
      currentMultiplayerPlayer={currentMultiplayerPlayer}
      multiplayerSnapshot={multiplayer.snapshot}
      multiplayerPrimeQueue={multiplayerPrimeQueue}
      isMultiplayerInputDisabled={isMultiplayerInputDisabled}
      isMultiplayerComboRunning={isMultiplayerComboRunning}
      roomId={multiplayer.roomId}
      onBack={returnToMenu}
      onPrimeTap={handleMultiplayerPrimeTap}
      onBackspace={handleMultiplayerComboBackspace}
      onSubmit={handleMultiplayerComboSubmit}
      formatCountdown={formatCountdown}
    />
  );
}

function wait(durationMs: number): Promise<void> {
  return new Promise((resolve) => {
    window.setTimeout(resolve, durationMs);
  });
}

function createRoomId(): string {
  return String(Math.floor(1000 + Math.random() * 9000));
}

function normalizeRoomId(value: string): string {
  return value.replace(/\D/g, "").slice(0, 4);
}

function formatCountdown(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}
