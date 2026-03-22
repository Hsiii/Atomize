import type { Prime, RoomSnapshot } from '../core';

export type RoomBroadcastMessage =
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
          type: 'player_ready';
          playerId: string;
          ready: boolean;
      }
    | {
          type: 'prime_selected';
          playerId: string;
          actionOrder: number;
          prime: Prime;
          suppressAttack?: boolean;
          perfectSolveEligible?: boolean;
          resolvingQueueLength?: number;
      }
    | {
          type: 'combo_penalty';
          playerId: string;
          actionOrder: number;
          preservedStage?: RoomSnapshot['stage'];
          releasedDamage?: number;
      }
    | {
          type: 'clear_solved_stage';
          playerId: string;
          actionOrder: number;
      }
    | {
          type: 'room_error';
          targetPlayerId: string;
          message: string;
      };

export type MultiplayerSendResult = {
    snapshot?: RoomSnapshot;
    didBroadcast: boolean;
};

export type LobbyInvitation = {
    fromName: string;
    fromPlayerId: string;
    roomCode: string;
};
