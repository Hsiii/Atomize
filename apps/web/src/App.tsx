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
import { createRealtimeClient, getSupabaseConfig } from "./lib/supabase";

const soloSeed = "solo-mvp-seed";
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
      playerName: string;
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
  const [soloState, setSoloState] = useState(() => createInitialSoloState(soloSeed));
  const [multiplayer, setMultiplayer] = useState<MultiplayerState>({
    playerId: null,
    snapshot: null,
    statusText: "Supabase room idle",
    roomId: "",
    isHost: false,
  });
  const [playerName, setPlayerName] = useState("Player");
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

  async function returnToMenu() {
    await closeActiveChannel();
    setMultiplayer({
      playerId: null,
      snapshot: null,
      statusText: "Supabase room idle",
      roomId: "",
      isHost: false,
    });
    setRoomIdInput("");
    setScreen("menu");
  }

  function openMultiplayerLobby() {
    setScreen("multi-lobby");
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
      setStatusText("No active Supabase room channel");
      return;
    }

    const response = await channel.send({
      type: "broadcast",
      event: message.type,
      payload: message,
    });

    if (response !== "ok") {
      setStatusText(`Supabase send failed: ${response}`);
    }
  }

  function updateSnapshot(snapshot: RoomSnapshot, statusText: string) {
    setMultiplayer((currentState) => ({
      ...currentState,
      snapshot,
      roomId: snapshot.roomId,
      statusText,
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
      setStatusText("Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY first");
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

        updateSnapshot(message.snapshot, `Room ${message.snapshot.roomId} synced`);
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
          message.playerName,
        );

        if (!nextSnapshot) {
          await broadcastMessage({
            type: "room_error",
            targetPlayerId: message.playerId,
            message: "Room already full",
          });
          return;
        }

        updateSnapshot(nextSnapshot, `Player ${message.playerName} joined`);
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

        updateSnapshot(nextSnapshot, `Prime ${message.prime} resolved`);
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
      statusText: `Connecting to room ${roomId}`,
    }));

    channel.subscribe(async (status) => {
      if (status === "SUBSCRIBED") {
        await onSubscribed();
      }

      if (status === "CHANNEL_ERROR") {
        setStatusText("Supabase room subscription failed");
      }
    });
  }

  async function createRoom() {
    const roomId = createRoomId();
    const playerId = crypto.randomUUID();
    const snapshot = createRoomSnapshot(roomId, playerId, playerName);

    await subscribeToRoom(roomId, playerId, true, async () => {
      setScreen("multi-lobby");
      updateSnapshot(snapshot, `Room ${roomId} created in Supabase`);
      await broadcastMessage({
        type: "room_state",
        snapshot,
        sourcePlayerId: playerId,
      });
    });
  }

  async function joinRoom() {
    const roomId = roomIdInput.toUpperCase().trim();

    if (!roomId) {
      setStatusText("Enter a room code first");
      return;
    }

    const playerId = crypto.randomUUID();

    await subscribeToRoom(roomId, playerId, false, async () => {
      setScreen("multi-lobby");
      setStatusText(`Requested to join room ${roomId}`);
      await broadcastMessage({
        type: "join_request",
        playerId,
        playerName,
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
      updateSnapshot(nextSnapshot, `Prime ${prime} resolved locally`);
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
            <p className="eyebrow">Atomize</p>
            <h1>Choose mode.</h1>
            <div className="action-stack">
              <button type="button" className="primary-action" onClick={startSingleGame}>
                Single Player
              </button>
              <button type="button" className="secondary-action" onClick={openMultiplayerLobby}>
                Multi Player
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
              Back
            </button>
            <span className="status-pill">Single Player</span>
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
    return (
      <main className="app-shell fullscreen-shell">
        <section className="screen lobby-screen">
          <header className="top-bar">
            <button type="button" className="ghost-action" onClick={() => void returnToMenu()}>
              Back
            </button>
            <span className="status-pill">{multiplayer.statusText}</span>
          </header>

          <div className="lobby-stack">
            <p className="eyebrow">Multi Player</p>
            <label className="field">
              <span>Name</span>
              <input value={playerName} onChange={(event) => setPlayerName(event.target.value)} />
            </label>

            <button type="button" className="primary-action" onClick={() => void createRoom()}>
              Create Room
            </button>

            <div className="code-panel">
              <p className="label">Room Code</p>
              <strong>{multiplayer.roomId || "----"}</strong>
            </div>

            <label className="field">
              <span>Enter Code</span>
              <input
                value={roomIdInput}
                onChange={(event) => setRoomIdInput(event.target.value.toUpperCase())}
                placeholder="ABCD"
              />
            </label>

            <button type="button" className="secondary-action" onClick={() => void joinRoom()}>
              Join Room
            </button>

            <p className="helper-copy">
              {supabaseConfig
                ? multiplayer.roomId
                  ? "Share the code. The game screen opens automatically when another player joins."
                  : "Create a room or enter a room code to join."
                : "Set Supabase environment variables to enable multiplayer."}
            </p>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="app-shell fullscreen-shell">
      <section className="screen game-screen">
        <header className="top-bar">
          <button type="button" className="ghost-action" onClick={() => void returnToMenu()}>
            Back
          </button>
          <span className="status-pill">Room {multiplayer.roomId}</span>
        </header>

        <section className="scoreboard player-scoreboard">
          {multiplayer.snapshot?.players.map((player) => {
            const isCurrentPlayer = player.id === multiplayer.playerId;

            return (
              <div key={player.id} className={isCurrentPlayer ? "player-card active" : "player-card"}>
                <p className="label">{isCurrentPlayer ? "You" : "Opponent"}</p>
                <strong>{player.hp} HP</strong>
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
  return Math.random().toString(36).slice(2, 6).toUpperCase();
}
