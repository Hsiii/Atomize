import type { Prime } from "./primes";
import type { StageState } from "./game";

export type RoomPlayer = {
  id: string;
  name: string;
  hp: number;
  combo: number;
  connected: boolean;
};

export type RoomSnapshot = {
  roomId: string;
  seed: string;
  stageIndex: number;
  stage: StageState;
  players: RoomPlayer[];
  status: "waiting" | "playing" | "finished";
};

export type ClientMessage =
  | {
      type: "create_room";
      playerName: string;
    }
  | {
      type: "join_room";
      roomId: string;
      playerName: string;
    }
  | {
      type: "select_prime";
      roomId: string;
      playerId: string;
      prime: Prime;
    };

export type ServerMessage =
  | {
      type: "room_created";
      playerId: string;
      snapshot: RoomSnapshot;
    }
  | {
      type: "room_joined";
      playerId: string;
      snapshot: RoomSnapshot;
    }
  | {
      type: "room_updated";
      snapshot: RoomSnapshot;
      event: "player_joined" | "prime_correct" | "prime_wrong" | "stage_cleared";
    }
  | {
      type: "error";
      message: string;
    };
