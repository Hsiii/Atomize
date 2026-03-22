import type { RoomSnapshot } from './core';

export const uiText = {
    back: 'Back',
    timer: 'Time',
    score: 'Score',
    scoreUnit: 'pt',
    timerPenalty: '-1s',
    returnHome: 'Top',
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
    close: 'Close',
    namePlaceholder: 'Enter your name',
    backspace: 'Backspace',
    enterCombo: 'Enter',
    joinMissingRoomToast: "That room doesn't exist.",
    countdownPrefix: 'Starting in',
    configHint: 'Server setup required for multiplayer.',
    idleStatus: 'Server idle',
    waitingShort: 'Waiting...',
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
    inviteCpu: 'Local CPU',
    inviteCpuHint: 'Start a local match instantly.',
    invited: 'Invited',
    ready: 'Ready',
    startingIn: 'Start in',
    noOnlinePlayers: 'No other players online.',
    inviteTitle: 'Online Players',
    editName: 'Edit Name',
    accept: 'Accept',
    decline: 'Decline',
    inGame: 'In Game',
    inTeam: 'In Team',
    inviteDeclined: 'Invitation declined',
    guest: 'Guest',
    cpu: 'CPU',
    start: 'Start',
    atomized: 'Atomized',
    keyboardHintTitle: 'Hint',
    keyboardHintLead: 'Press digit',
    keyboardHintTail: 'to input 23',
    bestScore: 'Best',
    newBest: 'New Best!',
    retry: 'Retry',
    rematch: 'Rematch',
    pause: 'Pause',
    resume: 'Resume',
    paused: 'Paused',
    tutorialCpu: 'Bot',
    tutorialYou: 'You',
    tutorialTitle: 'Tutorial',
    tutorialStartLesson: 'Start tutorial',
    tutorialNextBlob: 'Next blob',
    tutorialUseLastFactor: 'Use the last factor',
    tutorialTryMistake: 'Try one',
    tutorialWrapUp: 'Wrap up',
    tutorialKeepPlaying: 'Keep playing',
    tutorialDismissHint: 'Hide hint',
    tutorialIntroTitle: 'Factor to survive',
    tutorialIntroBody:
        'Bottom-left is your blob. Divide it down to 1 with prime factors before the enemy drains your HP.',
    tutorialStageOnePrimeTitle: 'Pick a valid factor',
    tutorialStageOnePrimeBody:
        'Only primes that divide the current number work. Start with 2 because 6 = 2 x 3.',
    tutorialStageOneQueueTitle: 'Build the queue',
    tutorialStageOneQueueBody:
        'Queued primes wait in the combo bar. Add 3 so the queue holds the full factor list.',
    tutorialStageOneSubmitTitle: 'Resolve the combo',
    tutorialStageOneSubmitBody:
        'Press Enter to resolve the queued factors in order.',
    tutorialStageOneResultTitle: 'Blob cleared',
    tutorialStageOneResultBody:
        'The blob hit 1 \u2014 fully factored and cleared. Each clear deals damage to the enemy HP bar.',
    tutorialStageTwoPrimeTitle: 'Store some damage',
    tutorialStageTwoPrimeBody:
        'This blob is 30. Start with 2 to begin stacking factor damage.',
    tutorialStageTwoQueueTitle: 'Plan ahead',
    tutorialStageTwoQueueBody:
        'Add 3. Multi-prime turns let you plan several factors before you fire.',
    tutorialStageTwoSubmitTitle: 'Cash out the queue',
    tutorialStageTwoSubmitBody:
        'Press Enter. This queue will release 5 stored factor damage even though the blob still has one factor left.',
    tutorialStageTwoResultTitle: 'Queued factors hit together',
    tutorialStageTwoResultBody:
        'Your queued 2 + 3 released 5 stored factor damage when the queue finished. That is not combo bonus. Combo bonus only comes from clearing blobs in a streak.',
    tutorialStageTwoFinishTitle: 'Finish the blob',
    tutorialStageTwoFinishBody:
        'The stored 5 damage already went out. The blob still has factor 5 left, so tap 5 to solve it.',
    tutorialStageTwoFinishSubmitTitle: 'Complete the clear',
    tutorialStageTwoFinishSubmitBody:
        'Press Enter to clear the solved blob. This clear only deals the normal 1 damage hit, not another combo payout.',
    tutorialEnemyTurnTitle: 'Enemy incoming',
    tutorialEnemyTurnBody:
        'The bot attacks with the same rules you do. Watch the HP bars while it moves.',
    tutorialShowAttack: 'Show attack',
    tutorialEnemyAttackTitle: 'Incoming damage',
    tutorialEnemyAttackBody:
        'Enemy clears shave your HP bar. The fight is a race to zero, so clean factor chains matter.',
    tutorialTryWrongPrimeTitle: 'Try a wrong factor',
    tutorialTryWrongPrimeBody:
        'Tap 3, then press Enter. It does not divide 14, so you can see the self-hit penalty once.',
    tutorialWrongPrimeResultTitle: 'Misses backfire',
    tutorialWrongPrimeResultBody:
        'Wrong primes deal self-damage, reset your combo, and dump stored damage. Accuracy matters as much as speed.',
    tutorialSummaryTitle: 'Core loop learned',
    tutorialSummaryBody:
        'Queue valid primes, submit them in order, chain clears for combo damage, and avoid misses. Finish the match when you are ready.',
} as const;

export type Screen = 'menu' | 'single' | 'multi-game' | 'tutorial';

export type MultiplayerState = {
    playerId: string | undefined;
    snapshot: RoomSnapshot | undefined;
    statusText: string;
    roomId: string;
    isHost: boolean;
};

export type OnlineLobbyUser = {
    playerId: string;
    name: string;
    status: 'lobby' | 'in-game' | 'in-team';
};

export type PendingInvitation = {
    fromName: string;
    roomCode: string;
};
