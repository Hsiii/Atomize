import { useEffect, useMemo, useRef, useState } from "react";
import type { RealtimeChannel, SupabaseClient } from "@supabase/supabase-js";
import {
  PRIME_POOL,
  advanceSoloState,
  createInitialSoloState,
  type Prime,
  type RoomSnapshot,
} from "@atomize/game-core";
import {
  addPlayerToRoom,
  applyBattlePrimeSelection,
  createRoomSnapshot,
} from "./lib/multiplayer-room";
import {
  createRealtimeClient,
  getMissingSupabaseEnvVars,
  getSupabaseConfig,
} from "./lib/supabase";

const soloSeed = "solo-mvp-seed";
type MenuMode = "default" | "create-room" | "join-room";

const uiText = {
  back: "Back",
  serverOnline: "Server online",
  serverOffline: "Server offline",
  title: "Atomize",
  eyebrow: "Prime factor battle",
  singlePlayer: "Single Player",
  multiPlayer: "Multi Player",
  createRoom: "Create Room",
  joinRoom: "Join Room",
  roomCode: "Room Code",
  enterCode: "Enter Code",
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
      type: "room_error";
      targetPlayerId: string;
      message: string;
    };

export default function App() {
  const [screen, setScreen] = useState<Screen>("menu");
  const [menuMode, setMenuMode] = useState<MenuMode>("default");
  const [soloState, setSoloState] = useState(() => createInitialSoloState(soloSeed));
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
  const latestMultiplayerRef = useRef(multiplayer);
  const supabaseConfig = useMemo(() => getSupabaseConfig(), []);

  const stageSummary = useMemo(() => {
    return soloState.currentStage.remainingFactors.join(" × ") || "cleared";
  }, [soloState.currentStage.remainingFactors]);

  const multiplayerStageSummary = useMemo(() => {
    return multiplayer.snapshot?.stage.remainingFactors.join(" × ") || "waiting";
  }, [multiplayer.snapshot]);

  const multiplayerFooterText = useMemo(() => {
    if (!supabaseConfig) {
      return uiText.configHint;
    }

    if (multiplayer.statusText) {
      return multiplayer.statusText;
    }

    if (multiplayer.roomId) {
      return uiText.waitingForPlayer;
    }

    return uiText.serverOnline;
  }, [multiplayer.roomId, multiplayer.statusText, supabaseConfig]);

  useEffect(() => {
    latestMultiplayerRef.current = multiplayer;
  }, [multiplayer]);

  useEffect(() => {
    if (multiplayer.snapshot?.status === "playing") {
      setScreen("multi-game");
    }
  }, [multiplayer.snapshot?.status]);

  useEffect(() => {
    supabaseRef.current = createRealtimeClient();

    return () => {
      if (channelRef.current && supabaseRef.current) {
        void supabaseRef.current.removeChannel(channelRef.current);
      }
    };
  }, []);

  function handlePrimeTap(prime: Prime) {
    setSoloState((currentState) => advanceSoloState(currentState, soloSeed, prime));
  }

  function startSingleGame() {
    setSoloState(createInitialSoloState(soloSeed));
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

        updateSnapshot(message.snapshot);
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

        updateSnapshot(nextSnapshot);
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

        updateSnapshot(nextSnapshot);
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
      setStatusText("Enter a 4-digit room code");
      return;
    }

    const playerId = crypto.randomUUID();

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

    if (currentState.isHost) {
      const nextSnapshot = applyBattlePrimeSelection(
        currentState.snapshot,
        currentState.playerId,
        prime,
      );
      updateSnapshot(nextSnapshot);
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

  if (screen === "menu") {
    return (
      <main className="app-shell fullscreen-shell">
        <section className="screen screen-menu">
          <div className="menu-stack">
            <p className="eyebrow">{uiText.eyebrow}</p>
            <h1 className="hero-title">{uiText.title}</h1>
            <div className="action-stack menu-actions">
              <button type="button" className="mode-action" onClick={startSingleGame}>
                {uiText.singlePlayer}
              </button>
              <button type="button" className="mode-action" onClick={startCreateRoomFlow}>
                {uiText.createRoom}
              </button>
              <button type="button" className="mode-action" onClick={startJoinRoomFlow}>
                {uiText.joinRoom}
              </button>
            </div>
          </div>
        </section>
      </main>
    );
  }

  if (screen === "single") {
    return (
      <main className="app-shell fullscreen-shell">
        <section className="screen game-screen">
          <header className="top-bar">
            <button type="button" className="ghost-action" onClick={() => void returnToMenu()}>
              {uiText.back}
            </button>
            <span className="status-pill">{uiText.singlePlayer}</span>
          </header>

          <section className="scoreboard">
            <div>
              <p className="label">Stage</p>
              <strong>{soloState.currentStage.stageIndex + 1}</strong>
            </div>
            <div>
              <p className="label">HP</p>
              <strong>{soloState.hp}</strong>
            </div>
            <div>
              <p className="label">Combo</p>
              <strong>{soloState.combo}</strong>
            </div>
            <div>
              <p className="label">Score</p>
              <strong>{soloState.score}</strong>
            </div>
          </section>

          <section className="value-panel">
            <p className="label">Target</p>
            <strong>{soloState.currentStage.remainingValue}</strong>
            <p>{stageSummary}</p>
          </section>

          <section className="keypad">
            {PRIME_POOL.map((prime) => (
              <button key={prime} type="button" onClick={() => handlePrimeTap(prime)}>
                {prime}
              </button>
            ))}
          </section>
        </section>
      </main>
    );
  }

  if (screen === "multi-lobby") {
    const isJoinFlow = menuMode === "join-room";
    const isCreateFlow = menuMode === "create-room";
    const shouldShowWaitingRoom = isCreateFlow;

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
                <span aria-hidden="true">&#8592;</span>
              </button>
            </header>

            <div className="lobby-stack lobby-stack-centered">
              <div className="join-room-panel">
                {isJoinFlow ? (
                  <label className="field">
                    <span>{uiText.enterCode}</span>
                    <input
                      inputMode="numeric"
                      pattern="[0-9]*"
                      maxLength={4}
                      value={roomIdInput}
                      onChange={(event) => handleRoomIdInputChange(event.target.value)}
                      placeholder={uiText.roomPlaceholder}
                    />
                  </label>
                ) : null}

                <button
                  type="button"
                  className="primary-action"
                  onClick={() => void (isJoinFlow ? joinRoom() : createRoom())}
                >
                  {isJoinFlow ? uiText.joinRoom : uiText.createRoom}
                </button>
              </div>

              <footer className="minimal-footer">{multiplayerFooterText}</footer>
            </div>
          </section>
        </main>
      );
    }

    if (shouldShowWaitingRoom) {
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
                <span aria-hidden="true">&#8592;</span>
              </button>
            </header>

            <div className="lobby-stack waiting-room-stack">
              <div className="code-panel">
                <p className="label">{uiText.roomCode}</p>
                <strong>{multiplayer.roomId || uiText.roomPlaceholder}</strong>
              </div>

              <section className="scoreboard player-scoreboard lobby-scoreboard waiting-room-grid">
                {multiplayer.snapshot?.players.map((player) => {
                  const isCurrentPlayer = player.id === multiplayer.playerId;

                  return (
                    <div key={player.id} className={isCurrentPlayer ? "player-card active" : "player-card"}>
                      <p className="label">{isCurrentPlayer ? "You" : "Opponent"}</p>
                      <strong>{player.name}</strong>
                      <span>{player.connected ? "Connected" : uiText.waitingForPlayer}</span>
                    </div>
                  );
                })}
              </section>

              <div className="waiting-cta">
                <p className="helper-copy waiting-copy">{uiText.waitingForPlayer}</p>
                <button type="button" className="primary-action start-action" disabled>
                  {uiText.start}
                </button>
              </div>

              <footer className="minimal-footer minimal-footer-bottom">{multiplayerFooterText}</footer>
            </div>
          </section>
        </main>
      );
    }

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
              <span aria-hidden="true">&#8592;</span>
            </button>
          </header>

          <div className="lobby-stack">
            <div className="code-panel">
              <p className="label">{uiText.roomCode}</p>
              <strong>{multiplayer.roomId || "----"}</strong>
            </div>

            <section className="scoreboard player-scoreboard lobby-scoreboard">
              {multiplayer.snapshot?.players.map((player) => {
                const isCurrentPlayer = player.id === multiplayer.playerId;

                return (
                  <div key={player.id} className={isCurrentPlayer ? "player-card active" : "player-card"}>
                    <p className="label">{isCurrentPlayer ? "You" : "Opponent"}</p>
                    <strong>{player.name}</strong>
                    <span>{player.connected ? "Connected" : uiText.waitingForPlayer}</span>
                  </div>
                );
              })}
            </section>

            <footer className="minimal-footer minimal-footer-bottom">{multiplayerFooterText}</footer>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="app-shell fullscreen-shell">
      <section className="screen game-screen">
        <header className="top-bar">
          <button
            type="button"
            className="icon-action"
            onClick={() => void returnToMenu()}
            aria-label={uiText.back}
          >
            <span aria-hidden="true">&#8592;</span>
          </button>
          <span className="status-pill">Room {multiplayer.roomId}</span>
        </header>

        <section className="scoreboard player-scoreboard">
          {multiplayer.snapshot?.players.map((player) => {
            const isCurrentPlayer = player.id === multiplayer.playerId;

            return (
              <div key={player.id} className={isCurrentPlayer ? "player-card active" : "player-card"}>
                <p className="label">{isCurrentPlayer ? "You" : "Opponent"}</p>
                <strong>{player.name}</strong>
                <span>Combo {player.combo}</span>
              </div>
            );
          })}
        </section>

        <section className="value-panel">
          <p className="label">Target</p>
          <strong>{multiplayer.snapshot?.stage.remainingValue ?? "--"}</strong>
          <p>{multiplayerStageSummary}</p>
        </section>

        <section className="keypad">
          {PRIME_POOL.map((prime) => (
            <button
              key={`room-${prime}`}
              type="button"
              onClick={() => void handleMultiplayerPrimeTap(prime)}
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
