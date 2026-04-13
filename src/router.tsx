import { useEffect } from 'react';
import type { JSX } from 'react';
import {
    createRootRoute,
    createRoute,
    createRouter,
    useNavigate,
} from '@tanstack/react-router';

import RootLayout from './App';
import { useAppContext } from './app-context';
import { MultiplayerGameScreen } from './components/game/MultiplayerGameScreen';
import { SingleGameScreen } from './components/game/SingleGameScreen';
import { AccountScreen } from './components/menu/AccountScreen';
import { AuthScreen } from './components/menu/AuthScreen';
import { LeaderboardScreen } from './components/menu/LeaderboardScreen';
import { MenuScreen } from './components/menu/MenuScreen';
import { OpponentPickerScreen } from './components/menu/OpponentPickerScreen';
import { SoloPregameScreen } from './components/menu/SoloPregameScreen';
import {
    detachPromise,
    formatCountdown,
    isTutorialComplete,
} from './lib/app-helpers';

// Re-export for use outside router.

// ---------------------------------------------------------------------------
// Route page components
// ---------------------------------------------------------------------------

function MenuPage(): JSX.Element {
    const { session, isGuest, localCpuGame, multiplayerGame } = useAppContext();
    const navigate = useNavigate();
    const needsTutorial = !isTutorialComplete();

    const toastId = localCpuGame.isInRoom ? 0 : multiplayerGame.lobbyToast.id;
    const toastMessage = localCpuGame.isInRoom
        ? undefined
        : multiplayerGame.lobbyToast.message;

    return (
        <MenuScreen
            isGuest={isGuest || !session}
            needsTutorial={needsTutorial}
            onOpenAccount={() => {
                detachPromise(navigate({ to: '/account' }));
            }}
            onOpenAuth={() => {
                detachPromise(navigate({ to: '/login' }));
            }}
            onOpenBattle={() => {
                detachPromise(navigate({ to: '/battle' }));
            }}
            onOpenLeaderboard={() => {
                detachPromise(navigate({ to: '/leaderboard' }));
            }}
            onOpenSolo={() => {
                detachPromise(navigate({ to: '/solo' }));
            }}
            onOpenTutorial={() => {
                detachPromise(navigate({ to: '/tutorial' }));
            }}
            toastId={toastId}
            toastMessage={toastMessage}
        />
    );
}

function TutorialPage(): JSX.Element {
    const { tutorialGame, handleTutorialReturn } = useAppContext();

    return (
        <MultiplayerGameScreen
            currentMultiplayerPlayer={tutorialGame.currentMultiplayerPlayer}
            isMultiplayerComboRunning={tutorialGame.isMultiplayerComboRunning}
            isMultiplayerInputDisabled={tutorialGame.isMultiplayerInputDisabled}
            multiplayerPrimeQueue={tutorialGame.multiplayerPrimeQueue}
            multiplayerSnapshot={tutorialGame.multiplayerSnapshot}
            onAllowCpuAttack={tutorialGame.allowCpuAttack}
            onBack={handleTutorialReturn}
            onSubmit={tutorialGame.handleMultiplayerComboSubmit}
            onTutorialComplete={tutorialGame.notifyTutorialDone}
            playablePrimes={tutorialGame.playablePrimes}
            tutorialMode
        />
    );
}

function SoloPregamePage(): JSX.Element {
    const { soloGame } = useAppContext();
    const navigate = useNavigate();

    return (
        <SoloPregameScreen
            bestScore={soloGame.bestScore}
            onBack={() => {
                detachPromise(navigate({ to: '/' }));
            }}
            onStart={() => {
                soloGame.startSingleGame();
            }}
        />
    );
}

function SoloPlayPage(): JSX.Element {
    const { soloGame, returnToMenu } = useAppContext();

    return (
        <SingleGameScreen
            bestScore={soloGame.bestScore}
            formatCountdown={formatCountdown}
            isNewBest={soloGame.isNewBest}
            isPaused={soloGame.isPaused}
            isSoloComboRunning={soloGame.isSoloComboRunning}
            onBack={returnToMenu}
            onPause={soloGame.pause}
            onResume={soloGame.resume}
            onRetry={soloGame.startSingleGame}
            onSubmit={soloGame.handleSoloComboSubmit}
            playablePrimes={soloGame.playablePrimes}
            soloCountdownProgress={soloGame.soloCountdownProgress}
            soloPrimeQueue={soloGame.soloPrimeQueue}
            soloStageAdvanceSolvedStateKey={
                soloGame.soloStageAdvanceSolvedStateKey
            }
            soloState={soloGame.soloState}
            soloTimeLeft={soloGame.soloTimeLeft}
            soloTimerPenaltyPopKey={soloGame.soloTimerPenaltyPopKey}
        />
    );
}

function BattlePickerPage(): JSX.Element {
    const { localCpuGame, multiplayerGame, playerName } = useAppContext();
    const navigate = useNavigate();

    const activeMenuGame = localCpuGame.isInRoom
        ? {
              isCpuOpponent: true,
              isCurrentPlayerReady: localCpuGame.isCurrentPlayerReady,
              isInRoom: localCpuGame.isInRoom,
              isOpponentReady: localCpuGame.isOpponentReady,
              onToggleReady: localCpuGame.toggleReady,
              opponentName: localCpuGame.opponentName,
          }
        : {
              isCpuOpponent: false,
              isCurrentPlayerReady: multiplayerGame.isCurrentPlayerReady,
              isInRoom: multiplayerGame.isInRoom,
              isOpponentReady: multiplayerGame.isOpponentReady,
              onToggleReady: multiplayerGame.toggleReady,
              opponentName: multiplayerGame.opponentName,
          };

    return (
        <OpponentPickerScreen
            isCpuOpponent={activeMenuGame.isCpuOpponent}
            isCurrentPlayerReady={activeMenuGame.isCurrentPlayerReady}
            isInRoom={activeMenuGame.isInRoom}
            isOpponentReady={activeMenuGame.isOpponentReady}
            onBack={() => {
                detachPromise(navigate({ to: '/' }));
            }}
            onInvitePlayer={(targetPlayerId) => {
                detachPromise(
                    multiplayerGame.handleLobbyInvite(targetPlayerId)
                );
            }}
            onLeaveVs={() => {
                localCpuGame.resetLocalCpuGame();
                detachPromise(multiplayerGame.resetMultiplayerGame());
            }}
            onlineUsers={multiplayerGame.onlineUsers}
            onPrefetchInviteUsers={multiplayerGame.prefetchOnlineUsers}
            onStartCpuGame={() => {
                localCpuGame.startLocalCpuGame();
            }}
            onToggleReady={() => {
                detachPromise(Promise.resolve(activeMenuGame.onToggleReady()));
            }}
            opponentName={activeMenuGame.opponentName}
            playerName={playerName}
        />
    );
}

function BattlePlayPage(): JSX.Element {
    const { localCpuGame, multiplayerGame, returnToMenu } = useAppContext();

    const activeBattleGame = localCpuGame.isLocalCpuGameActive
        ? {
              currentMultiplayerPlayer: localCpuGame.currentMultiplayerPlayer,
              isMultiplayerComboRunning: localCpuGame.isMultiplayerComboRunning,
              isMultiplayerInputDisabled:
                  localCpuGame.isMultiplayerInputDisabled,
              multiplayerPrimeQueue: localCpuGame.multiplayerPrimeQueue,
              multiplayerSnapshot: localCpuGame.multiplayerSnapshot,
              onRematch: localCpuGame.rematchLocalCpuGame,
              onSubmit: localCpuGame.handleMultiplayerComboSubmit,
              playablePrimes: localCpuGame.playablePrimes,
          }
        : {
              currentMultiplayerPlayer:
                  multiplayerGame.currentMultiplayerPlayer,
              isMultiplayerComboRunning:
                  multiplayerGame.isMultiplayerComboRunning,
              isMultiplayerInputDisabled:
                  multiplayerGame.isMultiplayerInputDisabled,
              multiplayerPrimeQueue: multiplayerGame.multiplayerPrimeQueue,
              multiplayerSnapshot: multiplayerGame.multiplayer.snapshot,
              onRematch: undefined,
              onSubmit: multiplayerGame.handleMultiplayerComboSubmit,
              playablePrimes: multiplayerGame.playablePrimes,
          };

    return (
        <MultiplayerGameScreen
            currentMultiplayerPlayer={activeBattleGame.currentMultiplayerPlayer}
            isMultiplayerComboRunning={
                activeBattleGame.isMultiplayerComboRunning
            }
            isMultiplayerInputDisabled={
                activeBattleGame.isMultiplayerInputDisabled
            }
            multiplayerPrimeQueue={activeBattleGame.multiplayerPrimeQueue}
            multiplayerSnapshot={activeBattleGame.multiplayerSnapshot}
            onBack={returnToMenu}
            onRematch={activeBattleGame.onRematch}
            onSubmit={activeBattleGame.onSubmit}
            playablePrimes={activeBattleGame.playablePrimes}
        />
    );
}

function LoginPage(): JSX.Element | undefined {
    const { session } = useAppContext();
    const navigate = useNavigate();

    useEffect(() => {
        if (session) {
            detachPromise(navigate({ to: '/' }));
        }
    }, [session, navigate]);

    if (session) {
        return undefined;
    }

    return (
        <AuthScreen
            initialMode='login'
            onAuthSuccess={() => {
                detachPromise(navigate({ to: '/' }));
            }}
            onBack={() => {
                detachPromise(navigate({ to: '/' }));
            }}
        />
    );
}

function SignupPage(): JSX.Element | undefined {
    const { session } = useAppContext();
    const navigate = useNavigate();

    useEffect(() => {
        if (session) {
            detachPromise(navigate({ to: '/' }));
        }
    }, [session, navigate]);

    if (session) {
        return undefined;
    }

    return (
        <AuthScreen
            initialMode='signup'
            onAuthSuccess={() => {
                detachPromise(navigate({ to: '/' }));
            }}
            onBack={() => {
                detachPromise(navigate({ to: '/' }));
            }}
        />
    );
}

function AccountPage(): JSX.Element | undefined {
    const { session, playerName, handleEditName, handleLogout } =
        useAppContext();
    const navigate = useNavigate();

    useEffect(() => {
        if (!session) {
            detachPromise(navigate({ to: '/' }));
        }
    }, [session, navigate]);

    if (!session) {
        return undefined;
    }

    return (
        <AccountScreen
            onBack={() => {
                detachPromise(navigate({ to: '/' }));
            }}
            onEditName={handleEditName}
            onLogout={() => {
                handleLogout();
                detachPromise(navigate({ to: '/' }));
            }}
            playerName={playerName}
            userId={session.user.id}
        />
    );
}

function LeaderboardPage(): JSX.Element {
    const { playerName, leaderboardData } = useAppContext();
    const navigate = useNavigate();

    return (
        <LeaderboardScreen
            onBack={() => {
                detachPromise(navigate({ to: '/' }));
            }}
            playerName={playerName}
            prefetchedData={leaderboardData}
        />
    );
}

// ---------------------------------------------------------------------------
// Route tree
// ---------------------------------------------------------------------------

const rootRoute = createRootRoute({
    component: RootLayout,
});

const menuRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/',
    component: MenuPage,
});

const tutorialRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: 'tutorial',
    component: TutorialPage,
});

const soloRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: 'solo',
});

const soloIndexRoute = createRoute({
    getParentRoute: () => soloRoute,
    path: '/',
    component: SoloPregamePage,
});

const soloPlayRoute = createRoute({
    getParentRoute: () => soloRoute,
    path: 'play',
    component: SoloPlayPage,
});

const battleRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: 'battle',
});

const battleIndexRoute = createRoute({
    getParentRoute: () => battleRoute,
    path: '/',
    component: BattlePickerPage,
});

const battlePlayRoute = createRoute({
    getParentRoute: () => battleRoute,
    path: 'play',
    component: BattlePlayPage,
});

const loginRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: 'login',
    component: LoginPage,
});

const signupRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: 'signup',
    component: SignupPage,
});

const accountRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: 'account',
    component: AccountPage,
});

const leaderboardRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: 'leaderboard',
    component: LeaderboardPage,
});

export const router = createRouter({
    routeTree: rootRoute.addChildren([
        menuRoute,
        tutorialRoute,
        soloRoute.addChildren([soloIndexRoute, soloPlayRoute]),
        battleRoute.addChildren([battleIndexRoute, battlePlayRoute]),
        loginRoute,
        signupRoute,
        accountRoute,
        leaderboardRoute,
    ]),
});

declare module '@tanstack/react-router' {
    interface Register {
        router: typeof router;
    }
}

export { isTutorialComplete } from './lib/app-helpers';
