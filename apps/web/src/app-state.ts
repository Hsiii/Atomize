import type { RoomSnapshot } from '@atomize/game-core';

export const uiText = {
    back: 'Back',
    timer: 'Time',
    score: 'Score',
    scoreUnit: 'pt',
    timerPenalty: '-1s',
    returnHome: 'Back to Top',
    health: 'HP',
    healthUnit: 'HP',
    combo: 'Combo',
    maxCombo: 'Max Combo',
    you: 'You',
    opponent: 'Opponent',
    serverOnline: 'Server online',
    serverOffline: 'Server offline',
    title: 'Atomize',
    titleLead: 'At',
    titleTail: 'mize',
    eyebrow: 'Prime factor battle',
    menuPlay: 'Play',
    menuSolo: 'Solo',
    menuDual: 'Dual',
    singlePlayer: 'Single Player',
    multiPlayer: 'Multi Player',
    settings: 'Settings',
    playerName: 'Player Name',
    saveName: 'Save',
    randomName: 'Randomize',
    close: 'Close',
    namePlaceholder: 'Enter your name',
    backspace: 'Backspace',
    enterCombo: 'Enter',
    joinMissingRoomToast: "That room doesn't exist.",
    countdownPrefix: 'Starting in',
    configHint: 'Server setup required for multiplayer.',
    idleStatus: 'Server idle',
    waitingForPlayer: 'Waiting for the second player to join.',
    multiplayerSyncStalled:
        'Realtime sync stalled. Input unlocked, but room sync may lag.',
    timeUp: "Time's Up",
    victory: 'Victory',
    defeat: 'Defeat',
    remainingUnit: 'left',
    onlineSection: 'Online',
    inviteSent: 'Invite sent!',
    inviteReceived: 'invited you to play!',
    inviteButton: 'Invite',
    invited: 'Invited',
    ready: 'Ready',
    cancelReady: 'Cancel Ready',
    startingIn: 'Start in',
    noOnlinePlayers: 'No other players online.',
    inviteTitle: 'Online Players',
    editName: 'Edit Name',
    accept: 'Accept',
    decline: 'Decline',
    inGame: 'In Game',
    start: 'Start',
    guest: 'Guest',
} as const;

export type Screen = 'menu' | 'single' | 'multi-game';

export type MultiplayerState = {
    playerId: string | null;
    snapshot: RoomSnapshot | null;
    statusText: string;
    roomId: string;
    isHost: boolean;
};

export type OnlineLobbyUser = {
    playerId: string;
    name: string;
    status: 'lobby' | 'in-game';
};

export type PendingInvitation = {
    fromName: string;
    roomCode: string;
};
