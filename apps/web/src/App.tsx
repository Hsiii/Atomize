import { useEffect, useMemo, useRef, useState, type ButtonHTMLAttributes } from "react";
import type { RealtimeChannel, SupabaseClient } from "@supabase/supabase-js";
import { ArrowLeft, Delete, Swords } from "lucide-react";
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
  getSupabaseConfig,
} from "./lib/supabase";

const soloSeed = "solo-mvp-seed";
const soloDurationSeconds = 60;
const playablePrimes = PRIME_POOL.slice(0, 9);
const soloComboStepDelayMs = 280;
const multiplayerCountdownDurationMs = 3000;
type MenuMode = "default" | "create-room" | "join-room";

const uiText = {
  back: "Back",
  timer: "Time",
  score: "Score",
  health: "HP",
  combo: "Combo",
  you: "You",
  opponent: "Opponent",
  battle: "Battle",
  serverOnline: "Server online",
  serverOffline: "Server offline",
  title: "Atomize",
  eyebrow: "Prime factor battle",
  singlePlayer: "Single Player",
  multiPlayer: "Multi Player",
  createRoom: "Create Room",
  joinRoom: "Join Room",
  go: "Go!",
  roomCode: "Room Code",
  enterCode: "Enter Code",
  backspace: "Backspace",
  enterCombo: "Enter",
  ready: "Ready",
  readyWaiting: "Ready",
  waitingForHost: "Waiting for host to start.",
  opponentMustReady: "Opponent must press ready first.",
  pressReady: "Press ready when you are set.",
  countdownPrefix: "Starting in",
  joiningRoom: "Joining room...",
  start: "Start",
  roomHint: "Tap create to open a room, or join with a 4-digit code.",
  configHint: "Server setup required for multiplayer.",
  idleStatus: "Server idle",
  roomPlaceholder: "0000",
  openingRoom: "Opening room...",
  waitingForPlayer: "Waiting for the second player to join.",
} as const;
type Screen = "menu" | "single" | "multi-lobby" | "multi-game";

type MultiplayerState = {
  playerId: string | null;
  snapshot: RoomSnapshot | null;
  statusText: string;
  roomId: string;
  isHost: boolean;
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
  const [soloPrimeQueue, setSoloPrimeQueue] = useState<Prime[]>([]);
  const [isSoloComboRunning, setIsSoloComboRunning] = useState(false);
  const [soloTimerPenaltyPopKey, setSoloTimerPenaltyPopKey] = useState(0);
  const [multiplayerCountdownValue, setMultiplayerCountdownValue] = useState<number | null>(null);
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
  const supabaseConfig = useMemo(() => getSupabaseConfig(), []);

  const multiplayerStageSummary = useMemo(() => {
    return multiplayer.snapshot?.stage.remainingFactors.join(" × ") || "waiting";
  }, [multiplayer.snapshot]);

  const multiplayerPlayers = multiplayer.snapshot?.players ?? [];
  const currentMultiplayerPlayer = multiplayerPlayers.find((player) => player.id === multiplayer.playerId) ?? null;
  const multiplayerStageFactorCount = multiplayer.snapshot?.stage.factors.length ?? 0;
  const multiplayerRemainingFactorCount = multiplayer.snapshot?.stage.remainingFactors.length ?? 0;
  const multiplayerStageProgress = multiplayerStageFactorCount > 0
    ? ((multiplayerStageFactorCount - multiplayerRemainingFactorCount) / multiplayerStageFactorCount) * 100
    : 0;
  const multiplayerScore = currentMultiplayerPlayer?.combo ?? 0;
  const isMultiplayerInputDisabled = !multiplayer.snapshot || multiplayer.snapshot.status !== "playing";

  const soloCountdownProgress = (soloTimeLeft / soloDurationSeconds) * 100;

  const multiplayerFooterText = useMemo(() => {
    if (!supabaseConfig) {
      return uiText.configHint;
    }

    const snapshot = multiplayer.snapshot;

    if (snapshot?.status === "countdown") {
      return `${uiText.countdownPrefix} ${multiplayerCountdownValue ?? 3}`;
    }

    if (multiplayer.statusText) {
      return multiplayer.statusText;
    }

    if (!multiplayer.roomId) {
      return uiText.serverOnline;
    }

    if (!snapshot || snapshot.players.length < 2) {
      return uiText.waitingForPlayer;
    }

    const currentPlayer = snapshot.players.find((player) => player.id === multiplayer.playerId);
    const opponentReady = snapshot.players.some((player) => player.id !== multiplayer.playerId && player.ready);

    if (multiplayer.isHost) {
      return opponentReady ? uiText.start : uiText.opponentMustReady;
    }

    return currentPlayer?.ready ? uiText.waitingForHost : uiText.pressReady;
  }, [multiplayer.roomId, multiplayer.statusText, multiplayer.snapshot, multiplayer.playerId, multiplayer.isHost, multiplayerCountdownValue, supabaseConfig]);

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
    if (screen !== "single") {
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
    setSoloTimerPenaltyPopKey(0);
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

        setStatusText(message.message);
      });

    channelRef.current = channel;

    setMultiplayer((currentState) => ({
      ...currentState,
      playerId,
      roomId,
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
    setStatusText(uiText.joiningRoom);

    await subscribeToRoom(roomId, playerId, false, async () => {
      setScreen("multi-lobby");
      await broadcastMessage({
        type: "join_request",
        playerId,
      });
    });
  }

  async function handleMultiplayerPrimeTap(prime: Prime) {
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

  async function handleGuestReady() {
    const currentState = latestMultiplayerRef.current;

    if (!currentState.playerId || !currentState.snapshot || currentState.isHost || currentState.snapshot.status !== "waiting") {
      return;
    }

    const currentPlayer = currentState.snapshot.players.find((player) => player.id === currentState.playerId);

    if (currentPlayer?.ready) {
      return;
    }

    const optimisticSnapshot = setPlayerReady(currentState.snapshot, currentState.playerId, true);
    updateSnapshot(optimisticSnapshot, uiText.waitingForHost);

    await broadcastMessage({
      type: "player_ready",
      playerId: currentState.playerId,
      ready: true,
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
      <main className="app-shell fullscreen-shell">
        <section className="screen screen-menu">
          <div className="menu-stack">
            <p className="eyebrow">{uiText.eyebrow}</p>
            <h1 className="hero-title">{uiText.title}</h1>
            <div className="action-stack menu-actions">
              <ActionButton variant="primary" onClick={startSingleGame}>
                {uiText.singlePlayer}
              </ActionButton>
              <ActionButton variant="secondary" onClick={startCreateRoomFlow}>
                {uiText.createRoom}
              </ActionButton>
              <ActionButton variant="secondary" onClick={startJoinRoomFlow}>
                {uiText.joinRoom}
              </ActionButton>
            </div>
          </div>
        </section>
      </main>
    );
  }

  if (screen === "single") {
    return (
      <main className="app-shell fullscreen-shell">
        <section className="screen game-screen single-game-screen">
          <header className="top-bar single-top-bar">
            <button
              type="button"
              className="icon-action"
              onClick={() => void returnToMenu()}
              aria-label={uiText.back}
            >
              <ArrowLeft className="control-icon" aria-hidden="true" />
            </button>

            <div className="single-timer-shell" aria-label={`${uiText.timer}: ${formatCountdown(soloTimeLeft)}`}>
              <div className="single-timer-bar">
                <span
                  className="single-timer-fill"
                  style={{ width: `${soloCountdownProgress}%` }}
                />
              </div>
              <span className="single-timer-text">{formatCountdown(soloTimeLeft)}</span>
              {soloTimerPenaltyPopKey > 0 ? (
                <span key={soloTimerPenaltyPopKey} className="single-timer-penalty" aria-hidden="true">
                  -1s
                </span>
              ) : null}
            </div>

            <div className="single-score-pill" aria-label={`${uiText.score}: ${soloState.score}`}>
              <span className="single-score-label">{uiText.score}</span>
              <strong>{soloState.score}</strong>
            </div>
          </header>

          <section className="single-value-display" aria-live="polite">
            <strong>{soloState.currentStage.remainingValue}</strong>
          </section>

          <section className="combo-panel" aria-live="polite">
            <div className="combo-bar">
              {soloPrimeQueue.length > 0 ? soloPrimeQueue.join(" x ") : null}
            </div>
          </section>

          <section className="single-controls-grid">
            <div className="keypad solo-keypad">
              {playablePrimes.map((prime) => (
                <button
                  key={prime}
                  type="button"
                  onClick={() => handlePrimeTap(prime)}
                  disabled={soloTimeLeft === 0 || isSoloComboRunning}
                >
                  {prime}
                </button>
              ))}
            </div>

            <div className="combo-actions-column">
              <ActionButton
                variant="secondary"
                className="combo-backspace-button"
                onClick={handleSoloComboBackspace}
                disabled={soloPrimeQueue.length === 0 || isSoloComboRunning}
                aria-label={uiText.backspace}
              >
                <Delete className="control-icon" aria-hidden="true" />
              </ActionButton>

              <ActionButton
                variant="secondary"
                className="combo-enter-button"
                onClick={handleSoloComboSubmit}
                disabled={soloTimeLeft === 0 || soloPrimeQueue.length === 0 || isSoloComboRunning}
                aria-label={uiText.enterCombo}
              >
                <Swords className="control-icon" aria-hidden="true" />
              </ActionButton>
            </div>
          </section>
        </section>
      </main>
    );
  }

  if (screen === "multi-lobby") {
    const isJoinFlow = menuMode === "join-room";
    const shouldShowWaitingRoom = Boolean(multiplayer.roomId);

    if (!multiplayer.roomId && !shouldShowWaitingRoom) {
      return (
        <main className="app-shell fullscreen-shell">
          <section className="screen lobby-screen">
            <header className="top-bar">
              <button
                type="button"
                className="icon-action"
                onClick={() => void returnToMenu()}
                aria-label={uiText.back}
              >
                <ArrowLeft className="control-icon" aria-hidden="true" />
              </button>
            </header>

            <div className="lobby-stack waiting-room-stack">
              <label className="code-panel waiting-code-panel room-code-input-panel">
                <p className="label">{uiText.roomCode}</p>
                <input
                  className="room-code-block-input"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={4}
                  value={roomIdInput}
                  onChange={(event) => handleRoomIdInputChange(event.target.value)}
                  placeholder={uiText.roomPlaceholder}
                  aria-label={uiText.enterCode}
                />
              </label>

              <div className="waiting-cta">
                <ActionButton variant="secondary" onClick={() => void (isJoinFlow ? joinRoom() : createRoom())}>
                  {isJoinFlow ? uiText.go : uiText.createRoom}
                </ActionButton>
              </div>

              {multiplayerFooterText !== uiText.idleStatus ? (
                <footer className="minimal-footer">{multiplayerFooterText}</footer>
              ) : null}
            </div>
          </section>
        </main>
      );
    }

    if (shouldShowWaitingRoom) {
      const waitingPlayers = [multiplayer.snapshot?.players[0] ?? null, multiplayer.snapshot?.players[1] ?? null];
      const currentPlayer = multiplayer.snapshot?.players.find((player) => player.id === multiplayer.playerId) ?? null;
      const canHostStart = multiplayer.isHost && multiplayer.snapshot ? canStartRoomCountdown(multiplayer.snapshot) : false;
      const isCountdown = multiplayer.snapshot?.status === "countdown";
      const readyButtonDisabled = !currentPlayer || currentPlayer.ready || isCountdown;

      return (
        <main className="app-shell fullscreen-shell">
          <section className="screen lobby-screen">
            <header className="top-bar">
              <button
                type="button"
                className="icon-action"
                onClick={() => void returnToMenu()}
                aria-label={uiText.back}
              >
                <ArrowLeft className="control-icon" aria-hidden="true" />
              </button>
            </header>

            <div className="lobby-stack waiting-room-stack">
              <div className="code-panel waiting-code-panel">
                <p className="label">{uiText.roomCode}</p>
                <strong>{multiplayer.roomId || uiText.roomPlaceholder}</strong>
              </div>

              <section className="scoreboard player-scoreboard lobby-scoreboard waiting-room-grid">
                {waitingPlayers.map((player, index) => {
                  if (!player) {
                    return (
                      <div key={`waiting-slot-${index}`} className="player-card waiting-player-card waiting-placeholder-card">
                        <p className="label">Opponent</p>
                        <div className="waiting-placeholder-mark" aria-hidden="true">
                          ?
                        </div>
                      </div>
                    );
                  }

                  const isCurrentPlayer = player.id === multiplayer.playerId;

                  return (
                    <div
                      key={player.id}
                      className={isCurrentPlayer ? "player-card waiting-player-card active" : "player-card waiting-player-card"}
                    >
                      <p className="label">{isCurrentPlayer ? "You" : "Opponent"}</p>
                      <strong>{player.name}</strong>
                    </div>
                  );
                })}
              </section>

              <div className="waiting-cta">
                {isCountdown ? (
                  <ActionButton variant="primary" className="start-action" disabled>
                    {`${uiText.countdownPrefix} ${multiplayerCountdownValue ?? 3}`}
                  </ActionButton>
                ) : multiplayer.isHost ? (
                  <ActionButton
                    variant="primary"
                    className="start-action"
                    onClick={() => void handleHostStart()}
                    disabled={!canHostStart}
                  >
                    {uiText.start}
                  </ActionButton>
                ) : (
                  <ActionButton
                    variant="secondary"
                    className="start-action"
                    onClick={() => void handleGuestReady()}
                    disabled={readyButtonDisabled}
                  >
                    {currentPlayer?.ready ? uiText.readyWaiting : uiText.ready}
                  </ActionButton>
                )}
              </div>

              {multiplayerFooterText !== uiText.waitingForPlayer ? (
                <footer className="minimal-footer minimal-footer-bottom">{multiplayerFooterText}</footer>
              ) : null}
            </div>
          </section>
        </main>
      );
    }
  }

  return (
    <main className="app-shell fullscreen-shell">
      <section className="screen game-screen single-game-screen multiplayer-game-screen">
        <header className="top-bar single-top-bar multiplayer-top-bar">
          <button
            type="button"
            className="icon-action"
            onClick={() => void returnToMenu()}
            aria-label={uiText.back}
          >
            <ArrowLeft className="control-icon" aria-hidden="true" />
          </button>

          <div
            className="single-timer-shell multiplayer-status-shell"
            aria-label={`${uiText.battle}: ${Math.round(multiplayerStageProgress)}%`}
          >
            <div className="single-timer-bar">
              <span
                className="single-timer-fill multiplayer-status-fill"
                style={{ width: `${multiplayerStageProgress}%` }}
              />
            </div>
            <span className="single-timer-text multiplayer-status-text">
              {Math.round(multiplayerStageProgress)}% complete
            </span>
          </div>

          <div
            className="single-score-pill multiplayer-score-pill"
            aria-label={`${uiText.score}: ${multiplayerScore}`}
          >
            <span className="single-score-label">{uiText.score}</span>
            <strong>{multiplayerScore}</strong>
          </div>
        </header>

        <section className="single-value-display multiplayer-value-display" aria-live="polite">
          <strong>{multiplayer.snapshot?.stage.remainingValue ?? "--"}</strong>
          <p className="multiplayer-stage-caption">{multiplayerStageSummary}</p>
        </section>

        <section className="keypad solo-keypad multiplayer-keypad">
          {playablePrimes.map((prime) => (
            <button
              key={`room-${prime}`}
              type="button"
              onClick={() => void handleMultiplayerPrimeTap(prime)}
              disabled={isMultiplayerInputDisabled}
            >
              {prime}
            </button>
          ))}
        </section>
      </section>
    </main>
  );
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

type ActionButtonProps = {
  variant: "primary" | "secondary";
} & ButtonHTMLAttributes<HTMLButtonElement>;

function ActionButton({ variant, className, type = "button", ...props }: ActionButtonProps) {
  const classes = ["app-action-button", variant === "primary" ? "primary-action" : "secondary-action", className]
    .filter(Boolean)
    .join(" ");

  return <button type={type} className={classes} {...props} />;
}
