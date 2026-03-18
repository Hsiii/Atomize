import {
  applyPrimeSelection,
  computeBattleDamage,
  generateStage,
  type Prime,
  type RoomPlayer,
  type RoomSnapshot,
} from "@atomize/game-core";

const STARTING_HP = 40;
const WRONG_SELECTION_DAMAGE = 3;
const HOST_NAME = "Player 1";
const GUEST_NAME = "Player 2";

export function createRoomSnapshot(
  roomId: string,
  hostId: string,
): RoomSnapshot {
  return {
    roomId,
    seed: roomId,
    stageIndex: 0,
    stage: generateStage(roomId, 0),
    players: [createPlayer(hostId, HOST_NAME)],
    countdownEndsAt: null,
    status: "waiting",
  };
}

export function addPlayerToRoom(
  snapshot: RoomSnapshot,
  playerId: string,
): RoomSnapshot | null {
  if (snapshot.players.some((player) => player.id === playerId)) {
    return snapshot;
  }

  if (snapshot.players.length >= 2) {
    return null;
  }

  return {
    ...snapshot,
    players: [...snapshot.players, createPlayer(playerId, GUEST_NAME)],
    countdownEndsAt: null,
    status: "waiting",
  };
}

export function setPlayerReady(
  snapshot: RoomSnapshot,
  playerId: string,
  ready: boolean,
): RoomSnapshot {
  if (snapshot.status !== "waiting") {
    return snapshot;
  }

  return {
    ...snapshot,
    players: snapshot.players.map((player) => {
      if (player.id !== playerId) {
        return player;
      }

      return {
        ...player,
        ready,
      };
    }),
  };
}

export function canStartRoomCountdown(snapshot: RoomSnapshot): boolean {
  if (snapshot.status !== "waiting" || snapshot.players.length < 2) {
    return false;
  }

  return snapshot.players.slice(1).every((player) => player.ready);
}

export function startRoomCountdown(snapshot: RoomSnapshot, countdownEndsAt: number): RoomSnapshot {
  if (!canStartRoomCountdown(snapshot)) {
    return snapshot;
  }

  return {
    ...snapshot,
    countdownEndsAt,
    status: "countdown",
  };
}

export function beginRoomMatch(snapshot: RoomSnapshot): RoomSnapshot {
  if (snapshot.status !== "countdown") {
    return snapshot;
  }

  return {
    ...snapshot,
    countdownEndsAt: null,
    status: "playing",
  };
}

export function applyBattlePrimeSelection(
  snapshot: RoomSnapshot,
  playerId: string,
  prime: Prime,
): RoomSnapshot {
  if (snapshot.status !== "playing") {
    return snapshot;
  }

  const actingPlayer = snapshot.players.find((player) => player.id === playerId);

  if (!actingPlayer) {
    return snapshot;
  }

  const selection = applyPrimeSelection(snapshot.stage, prime);

  if (selection.kind === "wrong") {
    return withPlayers(snapshot, snapshot.players.map((player) => {
      if (player.id !== playerId) {
        return player;
      }

      return {
        ...player,
        hp: Math.max(0, player.hp - WRONG_SELECTION_DAMAGE),
        combo: 0,
      };
    }));
  }

  if (!selection.cleared) {
    return {
      ...snapshot,
      stage: selection.stage,
    };
  }

  const combo = actingPlayer.combo + 1;
  const damage = computeBattleDamage(selection.stage, combo);
  const stageIndex = snapshot.stageIndex + 1;

  return withPlayers(
    {
      ...snapshot,
      stageIndex,
      stage: generateStage(snapshot.seed, stageIndex),
    },
    snapshot.players.map((player) => {
      if (player.id === playerId) {
        return {
          ...player,
          combo,
        };
      }

      return {
        ...player,
        hp: Math.max(0, player.hp - damage),
      };
    }),
  );
}

function createPlayer(id: string, name: string): RoomPlayer {
  return {
    id,
    name,
    hp: STARTING_HP,
    combo: 0,
    connected: true,
    ready: false,
  };
}

function withPlayers(snapshot: RoomSnapshot, players: RoomPlayer[]): RoomSnapshot {
  const hasDefeatedPlayer = players.some((player) => player.hp === 0);

  return {
    ...snapshot,
    players,
    countdownEndsAt: hasDefeatedPlayer ? null : snapshot.countdownEndsAt,
    status: hasDefeatedPlayer ? "finished" : snapshot.status,
  };
}
