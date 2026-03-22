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
    savingName: 'Saving...',
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
    nameInUse: 'Name already in use.',
    nameSaved: 'Name saved!',
    accept: 'Accept',
    decline: 'Decline',
    inGame: 'In Game',
    inTeam: 'In Team',
    inviteDeclined: 'Invitation declined',
    guest: 'Guest',
    cpu: 'CPU',
    start: 'Start',
    atomized: 'Atomized',
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
    skipTutorial: 'Skip tutorial',
    leaderboardTitle: 'Leaderboard',
    leaderboardEmpty: 'No records found',
    rank: 'Rank',
    player: 'Player',
    highestCombo: 'Max Combo',
    signIn: 'Log In',
    withEmail: 'With Email',
    emailPlaceholder: 'Email address',
    passwordPlaceholder: 'Password',
    emailPasswordAction: 'Log In',
    emailInvalid: 'Enter a valid email address.',
    passwordInvalid: 'Enter your password.',
    withGoogle: 'With Google',
    continueWithGoogle: 'Log In with Google',
    logout: 'Log Out',
    loginError: 'Could not start Google log in.',
    emailLoginError: 'Could not log in with email and password.',
    authUnavailable: 'Auth not configured in .env',
    nameSaveError: 'Could not save name.',
    googleProviderDisabled:
        'Google log in is not enabled in Supabase yet. Turn on the Google provider to use this flow.',
    popupBlocked:
        'Pop-up was blocked by your browser. Please allow pop-ups for this site to log in.',
} as const;

export const keyboardHintText = {
    body: 'Press digit 4 to input 23',
    dismissAction: 'Hide hint',
    title: 'Hint',
} as const;

type TutorialLessonTextEntry = {
    actionLabel?: string;
    body: string;
    title: string;
};

export const tutorialLessonText = {
    intro: {
        actionLabel: 'Start tutorial',
        body: 'Bottom-left is your blob. Divide it down to 1 with prime factors before the enemy drains your HP.',
        title: 'Factor to survive',
    },
    stageOnePrime: {
        body: 'Only primes that divide the current number work. Start with 2 because 6 = 2 x 3.',
        title: 'Pick a valid factor',
    },
    stageOneQueue: {
        body: 'Queued primes wait in the combo bar. Add 3 so the queue holds the full factor list.',
        title: 'Build the queue',
    },
    stageOneSubmit: {
        body: 'Press Enter to resolve the queued factors in order.',
        title: 'Resolve the combo',
    },
    stageOneResult: {
        actionLabel: 'Next blob',
        body: 'The blob hit 1 - fully factored and cleared. Each clear deals damage to the enemy HP bar.',
        title: 'Blob cleared',
    },
    stageTwoPrime: {
        body: 'This blob is 30. Start with 2. Unlike the first 2-prime queue, this one will not finish the blob yet.',
        title: 'Same queue, new result',
    },
    stageTwoQueue: {
        body: 'Add 3. It is still a 2-prime queue, but 30 will still have a 5 left after it resolves.',
        title: 'Plan ahead',
    },
    stageTwoSubmit: {
        body: 'Press Enter. This queue sends 5 partial damage now, then you will need one more factor to finish the blob.',
        title: 'Cash out the queue',
    },
    stageTwoResult: {
        actionLabel: 'Use the last factor',
        body: 'Your queued 2 + 3 dealt 5 damage, but it was not a combo finish because the blob did not reach 1 yet.',
        title: 'Queued factors hit together',
    },
    stageTwoFinish: {
        body: 'The stored 5 damage already went out. The blob still has factor 5 left, so tap 5 to solve it.',
        title: 'Finish the blob',
    },
    stageTwoFinishSubmit: {
        body: 'Press Enter to clear the solved blob. Clearing a 1 blob counts as a 1-combo finish.',
        title: 'Complete the clear',
    },
    enemyTurn: {
        actionLabel: 'Show attack',
        body: 'The bot attacks with the same rules you do. Watch the HP bars while it moves.',
        title: 'Enemy incoming',
    },
    enemyAttack: {
        actionLabel: 'Try a miss',
        body: 'Enemy clears shave your HP bar. Next, trigger one wrong factor yourself so you can see the self-hit penalty.',
        title: 'Incoming damage',
    },
    tryWrongPrime: {
        body: 'Tap 3, then press Enter. It does not divide 14, so you can see the self-hit and released-damage rules once.',
        title: 'Miss once on purpose',
    },
    wrongPrimeResult: {
        actionLabel: 'Wrap up',
        body: 'Wrong primes deal self-damage and dump stored damage. The released partial hit still does not count as combo because it did not end the blob.',
        title: 'Misses backfire',
    },
    summary: {
        actionLabel: 'Keep playing',
        body: 'Queue valid primes, end blobs with longer finishing queues for bigger combo bonus, and avoid misses. Finish the match when you are ready.',
        title: 'Core loop learned',
    },
} as const satisfies Record<string, TutorialLessonTextEntry>;

export type TutorialLessonId = keyof typeof tutorialLessonText;

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
