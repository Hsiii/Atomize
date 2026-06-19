import { useEffect } from 'react';
import type { JSX } from 'react';

import { useAppContext } from './app-context';
import { MultiplayerGameScreen } from './components/game/MultiplayerGameScreen';
import { SingleGameScreen } from './components/game/SingleGameScreen';
import { AccountScreen } from './components/menu/AccountScreen';
import { AuthScreen } from './components/menu/AuthScreen';
import { FriendsScreen } from './components/menu/FriendsScreen';
import { LeaderboardScreen } from './components/menu/LeaderboardScreen';
import { MenuScreen } from './components/menu/MenuScreen';
import { OpponentPickerScreen } from './components/menu/OpponentPickerScreen';
import { SoloPregameScreen } from './components/menu/SoloPregameScreen';
import {
    detachPromise,
    formatCountdown,
    isTutorialComplete,
} from './lib/app-helpers';

function MenuPage(): JSX.Element {
    const { session, isGuest, localCpuGame, multiplayerGame, navigateTo } =
        useAppContext();
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
                navigateTo('/account');
            }}
            onOpenAuth={() => {
                navigateTo('/login');
            }}
            onOpenBattle={() => {
                navigateTo('/battle');
            }}
            onOpenFriends={() => {
                navigateTo('/friends');
            }}
            onOpenLeaderboard={() => {
                navigateTo('/leaderboard');
            }}
            onOpenSolo={() => {
                navigateTo('/solo');
            }}
            onOpenTutorial={() => {
                navigateTo('/tutorial');
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
    const { soloGame, navigateTo } = useAppContext();

    return (
        <SoloPregameScreen
            bestScore={soloGame.bestScore}
            onBack={() => {
                navigateTo('/');
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
    const { localCpuGame, multiplayerGame, navigateTo, playerName } =
        useAppContext();

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
                navigateTo('/');
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
    const { navigateTo, session } = useAppContext();

    useEffect(() => {
        if (session) {
            navigateTo('/');
        }
    }, [session, navigateTo]);

    if (session) {
        return undefined;
    }

    return (
        <AuthScreen
            initialMode='login'
            onAuthSuccess={() => {
                navigateTo('/');
            }}
            onBack={() => {
                navigateTo('/');
            }}
        />
    );
}

function SignupPage(): JSX.Element | undefined {
    const { navigateTo, session } = useAppContext();

    useEffect(() => {
        if (session) {
            navigateTo('/');
        }
    }, [session, navigateTo]);

    if (session) {
        return undefined;
    }

    return (
        <AuthScreen
            initialMode='signup'
            onAuthSuccess={() => {
                navigateTo('/');
            }}
            onBack={() => {
                navigateTo('/');
            }}
        />
    );
}

function AccountPage(): JSX.Element | undefined {
    const { handleEditName, handleLogout, navigateTo, playerName, session } =
        useAppContext();

    useEffect(() => {
        if (!session) {
            navigateTo('/');
        }
    }, [session, navigateTo]);

    if (!session) {
        return undefined;
    }

    return (
        <AccountScreen
            onBack={() => {
                navigateTo('/');
            }}
            onEditName={handleEditName}
            onLogout={() => {
                handleLogout();
                navigateTo('/');
            }}
            playerName={playerName}
            userId={session.user.id}
        />
    );
}

function FriendsPage(): JSX.Element | undefined {
    const { navigateTo, playerName, session } = useAppContext();

    useEffect(() => {
        if (!session) {
            navigateTo('/');
        }
    }, [session, navigateTo]);

    if (!session) {
        return undefined;
    }

    return (
        <FriendsScreen
            onBack={() => {
                navigateTo('/');
            }}
            playerName={playerName}
            userId={session.user.id}
        />
    );
}

function LeaderboardPage(): JSX.Element {
    const { leaderboardData, navigateTo, playerName } = useAppContext();

    return (
        <LeaderboardScreen
            onBack={() => {
                navigateTo('/');
            }}
            playerName={playerName}
            prefetchedData={leaderboardData}
        />
    );
}

export function AppRoutes(): JSX.Element {
    const { pathname } = useAppContext();

    switch (pathname) {
        case '/tutorial': {
            return <TutorialPage />;
        }

        case '/solo': {
            return <SoloPregamePage />;
        }

        case '/solo/play': {
            return <SoloPlayPage />;
        }

        case '/battle': {
            return <BattlePickerPage />;
        }

        case '/battle/play': {
            return <BattlePlayPage />;
        }

        case '/login': {
            return <LoginPage />;
        }

        case '/signup': {
            return <SignupPage />;
        }

        case '/account': {
            return <AccountPage />;
        }

        case '/friends': {
            return <FriendsPage />;
        }

        case '/leaderboard': {
            return <LeaderboardPage />;
        }

        default: {
            return <MenuPage />;
        }
    }
}

export { isTutorialComplete } from './lib/app-helpers';
