import type { Prime, RoomSnapshot } from '@atomize/game-core';

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
          prime: Prime;
      }
    | {
          type: 'combo_penalty';
          playerId: string;
          preservedStage?: RoomSnapshot['stage'];
      }
    | {
          type: 'clear_solved_stage';
          playerId: string;
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
    roomCode: string;
};
