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
    skipTutorial: 'Skip',
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
    soloGoal: 'Beat the clock.',
    soloPB: 'Personal Best',
    battleTitle: 'Battle',
    chooseOpponent: 'Choose your opponent',
    opponentPickerTitle: 'Choose Opponent',
    atomBotLabel: 'AtomBot',
    atomBotHint: 'Practice against the CPU',
    onlinePlayersSection: 'Online Players',
    noPlayersOnline: 'No players online',
    noPlayersOnlineHint: 'Players will appear here when they join.',
    orDivider: 'or',
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
        actionLabel: 'Start',
        body: 'This is your compound. Factor and atomize it to deal damage to the enemy.',
        title: 'Tutorial - Factor to survive',
    },
    stageOnePrime: {
        body: 'Your compound is 6 = 2 x 3. Tap 2 to start queuing factors.',
        title: 'Pick a prime factor',
    },
    stageOneQueue: {
        body: 'Now tap 3 to complete the factorization.',
        title: 'Queue the next factor',
    },
    stageOneSubmit: {
        body: 'Hit send to attack with your queued factors.',
        title: 'Send the queue',
    },
    stageOneResult: {
        actionLabel: 'Next compound',
        body: 'Compound cleared! Each factor you queue deals damage, and clearing finishes the attack.',
        title: 'Atomized!',
    },
    comboExplain: {
        actionLabel: 'Next',
        body: 'Compound 6 was cleared in one combo of 2 factors - that gave bonus combo damage! Compound 30 took two sends, so no bonus.',
        title: 'Combo bonus',
    },
    stageTwoPrime: {
        body: 'This compound is 30 = 2 x 3 x 5. Start with 2.',
        title: 'Bigger compound',
    },
    stageTwoQueue: {
        body: 'Add 3 and send. Sometimes you want to factor partially to clear things out.',
        title: 'Partial factoring',
    },
    stageTwoResult: {
        actionLabel: 'Finish it',
        body: 'The blob dropped from 30 to 5 - that is 30 / 2 / 3. Damage dealt, but the compound still stands.',
        title: 'Partial clear',
    },
    stageTwoFinish: {
        body: 'The compound has factor 5 left. Tap 5 to solve it.',
        title: 'Finish the compound',
    },
    stageTwoFinishSubmit: {
        body: 'Submit to clear the remaining factor and deal damage.',
        title: 'Finish it off',
    },
    perfectSolveExplain: {
        actionLabel: 'Got it',
        body: 'Clearing in one combo is a perfect clear. Perfect clears also heal your HP - queue all factors at once to recover!',
        title: 'Perfect clear',
    },
    enemyTurn: {
        actionLabel: 'Show attack',
        body: 'Enemy clears cost you HP. Watch your HP bar.',
        title: 'Enemy turn',
    },
    enemyAttack: {
        actionLabel: 'Try a miss',
        body: 'Now try submitting a wrong factor to see the penalty.',
        title: 'What if you miss?',
    },
    tryWrongPrime: {
        body: 'Tap 3 and submit. It does not divide the current compound.',
        title: 'Try a wrong factor',
    },
    wrongPrimeResult: {
        actionLabel: 'Next',
        body: 'Wrong factors deal damage to yourself and break combos. Avoid mistakes to stay alive.',
        title: 'Wrong factors backfire',
    },
    overflowExplain: {
        actionLabel: 'Got it',
        body: 'If you send more factors than needed, the compound clears to 1 but the extras count as a self-penalty. Queue only what you need!',
        title: 'Over-queuing',
    },
    summary: {
        actionLabel: 'Keep playing',
        body: 'Queue primes, clear compounds for combo damage, and avoid wrong factors. Finish the match!',
        title: 'You are ready',
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
