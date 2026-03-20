import type { StageState } from './game';
import type { Prime } from './primes';

export type RoomPlayer = {
    id: string;
    name: string;
    hp: number;
    combo: number;
    maxCombo: number;
    stageIndex: number;
    stage: StageState;
    connected: boolean;
};

export type BattleEvent =
    | {
          id: number;
          type: 'attack';
          sourcePlayerId: string;
          targetPlayerId: string;
          damage: number;
          combo: number;
          sourceStageIndex: number;
          nextStageIndex: number;
          sourceHp: number;
          targetHp: number;
      }
    | {
          id: number;
          type: 'self-hit';
          sourcePlayerId: string;
          damage: number;
          combo: number;
          sourceStageIndex: number;
          nextStageIndex: number;
          sourceHp: number;
      }
    | {
          id: number;
          type: 'finish';
          winnerPlayerId: string;
          loserPlayerId: string;
          sourcePlayerId: string;
          damage: number;
          combo: number;
          cause: 'attack' | 'self-hit';
          sourceStageIndex: number;
          nextStageIndex: number;
          winnerHp: number;
          loserHp: number;
      };

export type RoomSnapshot = {
    roomId: string;
    seed: string;
    maxHp: number;
    stageIndex: number;
    stage: StageState;
    players: RoomPlayer[];
    lastEvent: BattleEvent | undefined;
    countdownEndsAt: number | undefined;
    status: 'waiting' | 'countdown' | 'playing' | 'finished';
};

export type ClientMessage =
    | {
          type: 'create_room';
      }
    | {
          type: 'join_room';
          roomId: string;
      }
    | {
          type: 'select_prime';
          roomId: string;
          playerId: string;
          prime: Prime;
      };

export type ServerMessage =
    | {
          type: 'room_created';
          playerId: string;
          snapshot: RoomSnapshot;
      }
    | {
          type: 'room_joined';
          playerId: string;
          snapshot: RoomSnapshot;
      }
    | {
          type: 'room_updated';
          snapshot: RoomSnapshot;
          event:
              | 'player_joined'
              | 'prime_correct'
              | 'prime_wrong'
              | 'stage_cleared';
      }
    | {
          type: 'error';
          message: string;
      };
