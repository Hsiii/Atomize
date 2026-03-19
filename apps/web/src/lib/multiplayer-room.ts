import {
    applyPrimeSelection,
    computeBattleDamage,
    generateStage,
} from '@atomize/game-core';
import type { Prime, RoomPlayer, RoomSnapshot } from '@atomize/game-core';

const STARTING_HP = 40;
const WRONG_SELECTION_DAMAGE = 3;

export function createRoomSnapshot(
    roomId: string,
    hostId: string,
    hostName: string
): RoomSnapshot {
    const initialStage = generateStage(roomId, 0);

    return {
        roomId,
        seed: roomId,
        stageIndex: 0,
        stage: initialStage,
        players: [createPlayer(hostId, hostName, roomId)],
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
        countdownEndsAt: undefined,
        status: 'waiting',
    };
}

export function setPlayerReady(
    snapshot: RoomSnapshot,
    playerId: string,
    ready: boolean
): RoomSnapshot {
    if (snapshot.status !== 'waiting') {
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
    if (snapshot.status !== 'waiting' || snapshot.players.length < 2) {
        return false;
    }

    return snapshot.players.slice(1).every((player) => player.ready);
}

export function startRoomCountdown(
    snapshot: RoomSnapshot,
    countdownEndsAt: number
): RoomSnapshot {
    if (!canStartRoomCountdown(snapshot)) {
        return snapshot;
    }

    return {
        ...snapshot,
        countdownEndsAt,
        status: 'countdown',
    };
}

export function beginRoomMatch(snapshot: RoomSnapshot): RoomSnapshot {
    if (snapshot.status !== 'countdown') {
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
    prime: Prime
): RoomSnapshot {
    if (snapshot.status !== 'playing') {
        return snapshot;
    }

    const actingPlayer = snapshot.players.find(
        (player) => player.id === playerId
    );

    if (!actingPlayer) {
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

    return withPlayers(
        {
            ...snapshot,
            stageIndex,
            stage: nextStage,
        },
        snapshot.players.map((player) => {
            if (player.id === playerId) {
                return {
                    ...player,
                    combo,
                    stageIndex,
                    stage: nextStage,
                };
            }

            return {
                ...player,
                hp: Math.max(0, player.hp - damage),
            };
        })
    );
}

export function applyBattlePenalty(
    snapshot: RoomSnapshot,
    playerId: string
): RoomSnapshot {
    if (snapshot.status !== 'playing') {
        return snapshot;
    }

    return withPlayers(
        snapshot,
        snapshot.players.map((player) => {
            if (player.id !== playerId) {
                return player;
            }

            return {
                ...player,
                hp: Math.max(0, player.hp - WRONG_SELECTION_DAMAGE),
                combo: 0,
            };
        })
    );
}

function createPlayer(id: string, name: string, seed: string): RoomPlayer {
    return {
        id,
        name,
        hp: STARTING_HP,
        combo: 0,
        stageIndex: 0,
        stage: generateStage(seed, 0),
        connected: true,
        ready: false,
    };
}

function withPlayers(
    snapshot: RoomSnapshot,
    players: readonly RoomPlayer[]
): RoomSnapshot {
    const hasDefeatedPlayer = players.some((player) => player.hp === 0);

    return {
        ...snapshot,
        players: [...players],
        countdownEndsAt: hasDefeatedPlayer
            ? undefined
            : snapshot.countdownEndsAt,
        status: hasDefeatedPlayer ? 'finished' : snapshot.status,
    };
}
