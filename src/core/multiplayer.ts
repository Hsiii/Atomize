import type { StageState } from './game';

export type RoomPlayer = {
    id: string;
    name: string;
    hp: number;
    pendingFactorDamage: number;
    combo: number;
    maxCombo: number;
    stageIndex: number;
    stage: StageState;
    connected: boolean;
    ready: boolean;
};

export type BattleEvent =
    | {
          id: number;
          type: 'attack';
          sourcePlayerId: string;
          targetPlayerId: string;
          damage: number;
          regen: number;
          perfectSolve: boolean;
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
          regen: number;
          perfectSolve: boolean;
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
