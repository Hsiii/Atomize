import {
    applyPrimeSelection,
    computeBattleComboDamage,
    computeBattleFactorDamage,
    generateStage,
} from '../core';
import type { BattleEvent, Prime, RoomPlayer, RoomSnapshot } from '../core';

const STARTING_HP = 500;
const WRONG_SELECTION_DAMAGE = 4;

function computePerfectSolveRegen(
    hp: number,
    maxHp: number,
    factorDamageTotal: number,
    perfectSolve: boolean
): number {
    if (!perfectSolve) {
        return 0;
    }

    return Math.max(0, Math.min(maxHp - hp, Math.round(factorDamageTotal / 2)));
}

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
    playerId: string,
    ready: boolean
): RoomSnapshot {
    if (snapshot.status === 'playing' || snapshot.status === 'finished') {
        return snapshot;
    }

    const nextPlayers = snapshot.players.map((player) =>
        player.id === playerId ? { ...player, ready } : player
    );
    return {
        ...snapshot,
        players: nextPlayers,
        countdownEndsAt: undefined,
        status: snapshot.status === 'countdown' ? 'waiting' : snapshot.status,
    };
}

export function beginRoomMatch(snapshot: RoomSnapshot): RoomSnapshot {
    if (snapshot.players.length < 2 || snapshot.status !== 'waiting') {
        return snapshot;
    }

    const areAllPlayersReady = snapshot.players.every((player) => player.ready);

    if (!areAllPlayersReady) {
        return snapshot;
    }

    return {
        ...snapshot,
        countdownEndsAt: undefined,
        status: 'playing',
    };
}

export function applyBattlePrimeSelection(
    snapshot: RoomSnapshot,
    playerId: string,
    prime: Prime,
    options?: {
        suppressAttack?: boolean;
    }
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

    const combo = selection.cleared
        ? actingPlayer.combo + 1
        : actingPlayer.combo;
    const stageIndex = selection.cleared
        ? actingPlayer.stageIndex + 1
        : actingPlayer.stageIndex;
    const nextStage = selection.cleared
        ? generateStage(snapshot.seed, stageIndex)
        : selection.stage;
    const shouldSuppressAttack =
        options?.suppressAttack === true && !selection.cleared;
    const { pendingFactorDamage } = actingPlayer;
    const factorDamage = computeBattleFactorDamage(prime);
    const totalFactorDamage = pendingFactorDamage + factorDamage;
    const perfectSolve = selection.cleared && pendingFactorDamage > 0;
    const comboDamage = selection.cleared ? computeBattleComboDamage(combo) : 0;
    const regen = computePerfectSolveRegen(
        actingPlayer.hp,
        snapshot.maxHp,
        totalFactorDamage,
        perfectSolve
    );
    const nextPendingFactorDamage = shouldSuppressAttack
        ? pendingFactorDamage + factorDamage
        : 0;
    const damage: number = shouldSuppressAttack
        ? 0
        : totalFactorDamage + comboDamage;
    const nextPlayers = snapshot.players.map((player) => {
        if (player.id === playerId) {
            return {
                ...player,
                hp: Math.min(snapshot.maxHp, player.hp + regen),
                pendingFactorDamage: nextPendingFactorDamage,
                combo,
                maxCombo: selection.cleared
                    ? Math.max(player.maxCombo, combo)
                    : player.maxCombo,
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

    if (shouldSuppressAttack) {
        return withPlayers(
            {
                ...snapshot,
                stageIndex,
                stage: nextStage,
            },
            nextPlayers,
            undefined
        );
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
                  regen,
                  perfectSolve,
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
                  regen,
                  perfectSolve,
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
    playerId: string,
    preservedStage?: RoomSnapshot['stage']
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

    const nextStage = preservedStage ?? actingPlayer.stage;
    const nextPlayers = snapshot.players.map((player) => {
        if (player.id !== playerId) {
            return player;
        }

        return {
            ...player,
            hp: Math.max(0, player.hp - WRONG_SELECTION_DAMAGE),
            pendingFactorDamage: 0,
            combo: 0,
            stage: nextStage,
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
                  regen: 0,
                  perfectSolve: false,
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
            stage: nextStage,
        },
        nextPlayers,
        lastEvent
    );
}

export function clearSolvedBattleStage(
    snapshot: RoomSnapshot,
    playerId: string
): RoomSnapshot {
    if (snapshot.status !== 'playing') {
        return snapshot;
    }

    const actingPlayer = snapshot.players.find(
        (player) => player.id === playerId
    );

    if (!actingPlayer || actingPlayer.stage.remainingValue !== 1) {
        return snapshot;
    }

    const targetPlayer = snapshot.players.find(
        (player) => player.id !== playerId
    );

    if (!targetPlayer) {
        return snapshot;
    }

    const clearDamage = 1;
    const stageIndex = actingPlayer.stageIndex + 1;
    const nextStage = generateStage(snapshot.seed, stageIndex);
    const nextPlayers = snapshot.players.map((player) => {
        if (player.id === playerId) {
            return {
                ...player,
                pendingFactorDamage: 0,
                stageIndex,
                stage: nextStage,
            };
        }

        return {
            ...player,
            hp: Math.max(0, player.hp - clearDamage),
        };
    });

    const nextActingPlayer = nextPlayers.find(
        (player) => player.id === playerId
    );
    const nextTargetPlayer = nextPlayers.find(
        (player) => player.id !== playerId
    );

    if (!nextActingPlayer || !nextTargetPlayer) {
        return snapshot;
    }

    const lastEvent: BattleEvent =
        nextTargetPlayer.hp === 0
            ? {
                  id: getNextEventId(snapshot),
                  type: 'finish',
                  winnerPlayerId: actingPlayer.id,
                  loserPlayerId: targetPlayer.id,
                  sourcePlayerId: playerId,
                  damage: clearDamage,
                  regen: 0,
                  perfectSolve: false,
                  combo: actingPlayer.combo,
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
                  targetPlayerId: targetPlayer.id,
                  damage: clearDamage,
                  regen: 0,
                  perfectSolve: false,
                  combo: actingPlayer.combo,
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

function createPlayer(id: string, name: string, seed: string): RoomPlayer {
    return {
        id,
        name,
        hp: STARTING_HP,
        pendingFactorDamage: 0,
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
