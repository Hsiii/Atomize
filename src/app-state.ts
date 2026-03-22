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
    inviteCpu: 'AtomBot',
    inviteCpuHint: 'Start a local match instantly.',
    invited: 'Invited',
    ready: 'Ready',
    startingIn: 'Start in',
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
    cpu: 'AtomBot',
    start: 'Start',
    atomized: 'Atomized',
    bestScore: 'Best',
    newBest: 'New Best!',
    retry: 'Retry',
    rematch: 'Rematch',
    pause: 'Pause',
    resume: 'Resume',
    paused: 'Paused',
    tutorialCpu: 'AtomBot',
    tutorialYou: 'You',
    tutorialTitle: 'Tutorial',
    skipTutorial: 'Skip tutorial',
    leaderboardTitle: 'Leaderboard',
    leaderboardEmpty: 'No records found',
    rank: 'Rank',
    player: 'Player',
    highScore: 'High Score',
    signIn: 'Log In',
    signUp: 'Sign Up',
    withEmail: 'With Email',
    userName: 'User Name',
    email: 'Email',
    password: 'Password',
    emailPlaceholder: 'Email address',
    userNamePlaceholder: 'Choose a name',
    passwordPlaceholder: 'Password',
    emailPasswordAction: 'Log In',
    emailSignupAction: 'Sign Up',
    authDivider: 'or',
    firstTimePrompt: 'First time?',
    alreadyHaveAccountPrompt: 'Already have an account?',
    emailInvalid: 'Enter a valid email address.',
    passwordInvalid: 'Enter your password.',
    withGoogle: 'With Google',
    continueWithGoogle: 'Log In with Google',
    continueSignupWithGoogle: 'Sign Up with Google',
    logout: 'Log Out',
    accountTitle: 'Account',
    loginError: 'Could not start Google log in.',
    emailLoginError: 'Could not log in with email and password.',
    emailSignupError: 'Could not create your account.',
    signupConfirmation:
        'Check your email to confirm your account, then log in.',
    authUnavailable: 'Auth not configured in .env',
    nameSaveError: 'Could not save name.',
    userNameInvalid: 'Enter a user name.',
    googleProviderDisabled:
        'Google log in is not enabled in Supabase yet. Turn on the Google provider to use this flow.',
    popupBlocked:
        'Pop-up was blocked by your browser. Please allow pop-ups for this site to log in.',
    soloTitle: 'Solo',
    soloGoal: 'Factor as many numbers as you can in 60 seconds.',
    battleTitle: 'Battle',
    opponentPickerTitle: 'Choose Opponent',
    atomBotLabel: 'AtomBot',
    atomBotHint: 'Practice against the CPU',
    onlinePlayersSection: 'Online Players',
    noPlayersOnline: 'No one else is online right now.',
    vs: 'VS',
    go: 'GO',
} as const;

export const seoText = {
    defaultDescription:
        'Atomize is a fast prime factorization battle game for the browser. Train in solo mode, learn with the tutorial, or duel opponents in real time.',
    defaultTitle: 'Atomize | Prime Factorization Battle Game',
    leaderboardDescription:
        'Check the latest Atomize high scores and see who leads the prime factorization leaderboard.',
    leaderboardTitle: 'Leaderboard | Atomize',
    accountDescription:
        'Manage your Atomize account, update your player name, and sign out securely.',
    accountTitle: 'Account | Atomize',
    menuDescription:
        'Play Atomize in solo mode, challenge AtomBot, or jump into live multiplayer prime factorization battles.',
    menuTitle: 'Play Atomize | Prime Factorization Battle Game',
    multiplayerDescription:
        'Face an opponent in a real-time prime factorization duel where faster combos deal more damage.',
    multiplayerTitle: 'Multiplayer Battle | Atomize',
    singleDescription:
        'Practice speed and accuracy in Atomize solo mode by clearing as many prime factorization stages as possible.',
    singleTitle: 'Solo Mode | Atomize',
    loginDescription:
        'Log in to Atomize to keep your player identity and compete on the leaderboard.',
    loginTitle: 'Log In | Atomize',
    signupDescription:
        'Create an Atomize account to claim your name and join the prime factorization leaderboard.',
    signupTitle: 'Sign Up | Atomize',
    tutorialDescription:
        'Learn how Atomize works with a guided tutorial covering factors, combos, damage, and battle flow.',
    tutorialTitle: 'Tutorial | Atomize',
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
