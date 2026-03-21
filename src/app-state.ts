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
    tutorialStartLesson: 'Start lesson',
    tutorialContinue: 'Continue',
    tutorialGotIt: 'Got it',
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
    tutorialStageOneResultTitle: 'Clears deal damage',
    tutorialStageOneResultBody:
        'Solving a blob hits the enemy HP bar and starts your combo. Every clean clear keeps the pressure up.',
    tutorialStageTwoPrimeTitle: 'Store some damage',
    tutorialStageTwoPrimeBody:
        'This blob is 30. Start with 2 to begin stacking factor damage.',
    tutorialStageTwoQueueTitle: 'Plan ahead',
    tutorialStageTwoQueueBody:
        'Add 3. Multi-prime turns let you plan several factors before you fire.',
    tutorialStageTwoSubmitTitle: 'Cash out the queue',
    tutorialStageTwoSubmitBody:
        'Press Enter. This queue will hit for 5 even though the blob still has one factor left.',
    tutorialStageTwoResultTitle: 'Queued factors hit together',
    tutorialStageTwoResultBody:
        'Your queued 2 + 3 released 5 damage when the queue finished. Stored factor damage cashes out on submit.',
    tutorialStageTwoFinishTitle: 'Protect the combo',
    tutorialStageTwoFinishBody:
        'Finish the blob with 5. Consecutive clears grow your combo damage.',
    tutorialStageTwoFinishSubmitTitle: 'Convert the clear',
    tutorialStageTwoFinishSubmitBody:
        'Press Enter to turn the clear into a stronger combo hit.',
    tutorialEnemyTurnTitle: 'Watch the enemy turn',
    tutorialEnemyTurnBody:
        'The bot attacks with the same rules you do. Watch the HP bars while it moves.',
    tutorialEnemyAttackTitle: 'Incoming damage',
    tutorialEnemyAttackBody:
        'Enemy hits shave your lower HP bar. The fight is a race to zero, so clean factor chains matter.',
    tutorialPenaltyTitle: 'Misses backfire',
    tutorialPenaltyBody:
        'Wrong primes deal 4 self-damage, reset combo, and dump any stored damage. Accuracy matters as much as speed.',
    tutorialSummaryTitle: 'Core loop learned',
    tutorialSummaryBody:
        'Queue valid primes, submit them in order, chain clears for combo damage, and avoid misses. Finish the match when you are ready.',
} as const;

export type TutorialFocusTarget =
    | 'self-blob'
    | 'queue'
    | 'keypad'
    | 'submit'
    | 'enemy-hp'
    | 'self-hp';

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
