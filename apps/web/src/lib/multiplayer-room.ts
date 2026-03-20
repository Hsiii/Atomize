import {
    applyPrimeSelection,
    computeBattleDamage,
    generateStage,
} from '@atomize/game-core';
import type {
    BattleEvent,
    Prime,
    RoomPlayer,
    RoomSnapshot,
} from '@atomize/game-core';

const STARTING_HP = 60;
const WRONG_SELECTION_DAMAGE = 8;

export function createRoomSnapshot(
    roomId: string,
    hostId: string,
    hostName: string
): RoomSnapshot {
    const initialStage = generateStage(roomId, 0);

    return {
        roomId,
        seed: roomId,
        maxHp: STARTING_HP,
        stageIndex: 0,
        stage: initialStage,
        players: [createPlayer(hostId, hostName, roomId)],
        lastEvent: undefined,
        countdownEndsAt: undefined,
        status: 'waiting',
    };
}

export function addPlayerToRoom(
    snapshot: RoomSnapshot,
    playerId: string,
    playerName: string
): RoomSnapshot | undefined {
    if (snapshot.players.some((player) => player.id === playerId)) {
        return snapshot;
    }

    if (snapshot.players.length >= 2) {
        return undefined;
    }

    return {
        ...snapshot,
        players: [
            ...snapshot.players,
            createPlayer(playerId, playerName, snapshot.seed),
        ],
        lastEvent: undefined,
        status: 'waiting',
    };
}

export function setPlayerReady(
    snapshot: RoomSnapshot,
    playerId: string
): RoomSnapshot {
    const nextPlayers = snapshot.players.map((player) =>
        player.id === playerId ? { ...player, ready: true } : player
    );

    return {
        ...snapshot,
        players: nextPlayers,
    };
}

export function applyBattlePrimeSelection(
    snapshot: RoomSnapshot,
    playerId: string,
    prime: Prime
): RoomSnapshot {
    if (snapshot.status !== 'playing') {
        return snapshot;
    }

    const actingPlayer = snapshot.players.find(
        (player) => player.id === playerId
    );
    const targetPlayer = snapshot.players.find(
        (player) => player.id !== playerId
    );

    if (!actingPlayer || !targetPlayer) {
        return snapshot;
    }

    const selection = applyPrimeSelection(actingPlayer.stage, prime);

    if (selection.kind === 'wrong') {
        return applyBattlePenalty(snapshot, playerId);
    }

    if (!selection.cleared) {
        return withPlayers(
            {
                ...snapshot,
                stageIndex: actingPlayer.stageIndex,
                stage: selection.stage,
            },
            snapshot.players.map((player) => {
                if (player.id !== playerId) {
                    return player;
                }

                return {
                    ...player,
                    stage: selection.stage,
                };
            })
        );
    }

    const combo = actingPlayer.combo + 1;
    const damage = computeBattleDamage(selection.stage, combo);
    const stageIndex = actingPlayer.stageIndex + 1;
    const nextStage = generateStage(snapshot.seed, stageIndex);
    const nextPlayers = snapshot.players.map((player) => {
        if (player.id === playerId) {
            return {
                ...player,
                combo,
                maxCombo: Math.max(player.maxCombo, combo),
                stageIndex,
                stage: nextStage,
            };
        }

        return {
            ...player,
            hp: Math.max(0, player.hp - damage),
        };
    });
    const nextActingPlayer = nextPlayers.find(
        (player) => player.id === playerId
    );
    const nextTargetPlayer = nextPlayers.find(
        (player) => player.id === targetPlayer.id
    );

    if (!nextActingPlayer || !nextTargetPlayer) {
        return snapshot;
    }

    const lastEvent: BattleEvent =
        nextTargetPlayer.hp === 0
            ? {
                  id: getNextEventId(snapshot),
                  type: 'finish',
                  winnerPlayerId: nextActingPlayer.id,
                  loserPlayerId: nextTargetPlayer.id,
                  sourcePlayerId: playerId,
                  damage,
                  combo,
                  cause: 'attack',
                  sourceStageIndex: actingPlayer.stageIndex,
                  nextStageIndex: stageIndex,
                  winnerHp: nextActingPlayer.hp,
                  loserHp: nextTargetPlayer.hp,
              }
            : {
                  id: getNextEventId(snapshot),
                  type: 'attack',
                  sourcePlayerId: playerId,
                  targetPlayerId: nextTargetPlayer.id,
                  damage,
                  combo,
                  sourceStageIndex: actingPlayer.stageIndex,
                  nextStageIndex: stageIndex,
                  sourceHp: nextActingPlayer.hp,
                  targetHp: nextTargetPlayer.hp,
              };

    return withPlayers(
        {
            ...snapshot,
            stageIndex,
            stage: nextStage,
        },
        nextPlayers,
        lastEvent
    );
}

export function applyBattlePenalty(
    snapshot: RoomSnapshot,
    playerId: string
): RoomSnapshot {
    if (snapshot.status !== 'playing') {
        return snapshot;
    }

    const actingPlayer = snapshot.players.find(
        (player) => player.id === playerId
    );
    const targetPlayer = snapshot.players.find(
        (player) => player.id !== playerId
    );

    if (!actingPlayer || !targetPlayer) {
        return snapshot;
    }

    const resetStage = generateStage(snapshot.seed, actingPlayer.stageIndex);
    const nextPlayers = snapshot.players.map((player) => {
        if (player.id !== playerId) {
            return player;
        }

        return {
            ...player,
            hp: Math.max(0, player.hp - WRONG_SELECTION_DAMAGE),
            combo: 0,
            stage: resetStage,
        };
    });
    const nextActingPlayer = nextPlayers.find(
        (player) => player.id === playerId
    );

    if (!nextActingPlayer) {
        return snapshot;
    }

    const lastEvent: BattleEvent =
        nextActingPlayer.hp === 0
            ? {
                  id: getNextEventId(snapshot),
                  type: 'finish',
                  winnerPlayerId: targetPlayer.id,
                  loserPlayerId: nextActingPlayer.id,
                  sourcePlayerId: playerId,
                  damage: WRONG_SELECTION_DAMAGE,
                  combo: 0,
                  cause: 'self-hit',
                  sourceStageIndex: actingPlayer.stageIndex,
                  nextStageIndex: actingPlayer.stageIndex,
                  winnerHp: targetPlayer.hp,
                  loserHp: nextActingPlayer.hp,
              }
            : {
                  id: getNextEventId(snapshot),
                  type: 'self-hit',
                  sourcePlayerId: playerId,
                  damage: WRONG_SELECTION_DAMAGE,
                  combo: 0,
                  sourceStageIndex: actingPlayer.stageIndex,
                  nextStageIndex: actingPlayer.stageIndex,
                  sourceHp: nextActingPlayer.hp,
              };

    return withPlayers(
        {
            ...snapshot,
            stageIndex: actingPlayer.stageIndex,
            stage: resetStage,
        },
        nextPlayers,
        lastEvent
    );
}

function createPlayer(id: string, name: string, seed: string): RoomPlayer {
    return {
        id,
        name,
        hp: STARTING_HP,
        combo: 0,
        maxCombo: 0,
        stageIndex: 0,
        stage: generateStage(seed, 0),
        connected: true,
        ready: false,
    };
}

function withPlayers(
    snapshot: RoomSnapshot,
    players: readonly RoomPlayer[],
    lastEvent: BattleEvent | undefined = snapshot.lastEvent
): RoomSnapshot {
    const hasDefeatedPlayer = players.some((player) => player.hp === 0);

    return {
        ...snapshot,
        players: [...players],
        lastEvent,
        countdownEndsAt: hasDefeatedPlayer
            ? undefined
            : snapshot.countdownEndsAt,
        status: hasDefeatedPlayer ? 'finished' : snapshot.status,
    };
}

function getNextEventId(snapshot: RoomSnapshot): number {
    return (snapshot.lastEvent?.id ?? 0) + 1;
}
