import { randomUUID } from "node:crypto";
import { WebSocketServer, type WebSocket } from "ws";
import {
  advanceSoloState,
  applyPrimeSelection,
  computeBattleDamage,
  createInitialSoloState,
  type ClientMessage,
  type Prime,
  type RoomPlayer,
  type RoomSnapshot,
  type ServerMessage,
} from "@atomize/game-core";

type PlayerSession = {
  id: string;
  socket: WebSocket;
};

type RoomState = {
  roomId: string;
  seed: string;
  stageIndex: number;
  hostId: string;
  guestId: string | null;
  stage: RoomSnapshot["stage"];
  players: Map<string, RoomPlayer>;
};

const sockets = new Map<WebSocket, PlayerSession>();
const rooms = new Map<string, RoomState>();
const port = 8787;
const HOST_NAME = "Player 1";
const GUEST_NAME = "Player 2";

const server = new WebSocketServer({ port });

server.on("connection", (socket) => {
  socket.on("message", (raw) => {
    try {
      const message = JSON.parse(raw.toString()) as ClientMessage;
      handleMessage(socket, message);
    } catch {
      send(socket, {
        type: "error",
        message: "Invalid message payload",
      });
    }
  });

  socket.on("close", () => {
    sockets.delete(socket);
  });
});

function handleMessage(socket: WebSocket, message: ClientMessage) {
  if (message.type === "create_room") {
    const playerId = randomUUID();
    const roomId = createRoomId();
    const soloState = createInitialSoloState(roomId);
    const room: RoomState = {
      roomId,
      seed: roomId,
      stageIndex: 0,
      hostId: playerId,
      guestId: null,
      stage: soloState.currentStage,
      players: new Map([
        [
          playerId,
          {
            id: playerId,
            name: HOST_NAME,
            hp: 40,
            combo: 0,
            stageIndex: 0,
            stage: soloState.currentStage,
            connected: true,
            ready: false,
          },
        ],
      ]),
    };

    rooms.set(roomId, room);
    sockets.set(socket, { id: playerId, socket });

    send(socket, {
      type: "room_created",
      playerId,
      snapshot: createSnapshot(room),
    });
    return;
  }

  if (message.type === "join_room") {
    const room = rooms.get(message.roomId);

    if (!room) {
      send(socket, { type: "error", message: "Room not found" });
      return;
    }

    if (room.guestId) {
      send(socket, { type: "error", message: "Room already full" });
      return;
    }

    const playerId = randomUUID();
    room.guestId = playerId;
    room.players.set(playerId, {
      id: playerId,
      name: GUEST_NAME,
      hp: 40,
      combo: 0,
      stageIndex: room.stageIndex,
      stage: room.stage,
      connected: true,
      ready: false,
    });
    sockets.set(socket, { id: playerId, socket });

    broadcast(room, {
      type: "room_updated",
      event: "player_joined",
      snapshot: createSnapshot(room),
    });

    send(socket, {
      type: "room_joined",
      playerId,
      snapshot: createSnapshot(room),
    });
    return;
  }

  if (message.type === "select_prime") {
    const room = rooms.get(message.roomId);

    if (!room) {
      send(socket, { type: "error", message: "Room not found" });
      return;
    }

    const actingPlayer = room.players.get(message.playerId);

    if (!actingPlayer) {
      send(socket, { type: "error", message: "Player not in room" });
      return;
    }

    resolvePrimeSelection(room, actingPlayer.id, message.prime);
  }
}

function resolvePrimeSelection(room: RoomState, playerId: string, prime: Prime) {
  const player = room.players.get(playerId);

  if (!player) {
    return;
  }

  const selection = applyPrimeSelection(player.stage, prime);

  if (selection.kind === "wrong") {
    player.hp = Math.max(0, player.hp - 3);
    player.combo = 0;

    broadcast(room, {
      type: "room_updated",
      event: "prime_wrong",
      snapshot: createSnapshot(room),
    });
    return;
  }

  player.stage = selection.stage;
  room.stage = selection.stage;
  room.stageIndex = player.stageIndex;

  if (!selection.cleared) {
    broadcast(room, {
      type: "room_updated",
      event: "prime_correct",
      snapshot: createSnapshot(room),
    });
    return;
  }

  const nextCombo = player.combo + 1;
  const damage = computeBattleDamage(selection.stage, nextCombo);
  const nextState = advanceSoloState(
    {
      hp: 5,
      combo: player.combo,
      score: 0,
      clearedStages: player.stageIndex,
      currentStage: selection.stage,
    },
    room.seed,
    prime,
  );

  room.stageIndex = nextState.clearedStages;
  room.stage = nextState.currentStage;
  player.combo = nextState.combo;
  player.stageIndex = nextState.clearedStages;
  player.stage = nextState.currentStage;

  for (const [otherPlayerId, otherPlayer] of room.players.entries()) {
    if (otherPlayerId !== playerId) {
      otherPlayer.hp = Math.max(0, otherPlayer.hp - damage);
    }
  }

  broadcast(room, {
    type: "room_updated",
    event: "stage_cleared",
    snapshot: createSnapshot(room),
  });
}

function createSnapshot(room: RoomState): RoomSnapshot {
  const players = [...room.players.values()];
  const finished = players.some((player) => player.hp === 0);

  return {
    roomId: room.roomId,
    seed: room.seed,
    stageIndex: room.stageIndex,
    stage: room.stage,
    players,
    countdownEndsAt: null,
    status: finished ? "finished" : room.guestId ? "playing" : "waiting",
  };
}

function broadcast(room: RoomState, message: ServerMessage) {
  for (const session of sockets.values()) {
    if (room.players.has(session.id)) {
      send(session.socket, message);
    }
  }
}

function send(socket: WebSocket, message: ServerMessage) {
  socket.send(JSON.stringify(message));
}

function createRoomId(): string {
  return Math.random().toString(36).slice(2, 6).toUpperCase();
}

console.log(`Atomize room server running on ws://localhost:${port}`);
