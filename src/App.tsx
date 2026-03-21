import { useEffect, useState } from 'react';
import type { JSX } from 'react';

import type { Screen } from './app-state';
import { MultiplayerGameScreen } from './components/game/MultiplayerGameScreen';
import { SingleGameScreen } from './components/game/SingleGameScreen';
import { MenuScreen } from './components/menu/MenuScreen';
import { useLocalCpuGame } from './hooks/useLocalCpuGame';
import { useMultiplayerGame } from './hooks/useMultiplayerGame';
import { useSoloGame } from './hooks/useSoloGame';
import { useTutorialGame } from './hooks/useTutorialGame';
import {
    detachPromise,
    formatCountdown,
    getInitialPlayerName,
    isTutorialComplete,
    markTutorialComplete,
    persistPlayerName,
} from './lib/app-helpers';

export default function App(): JSX.Element {
    const [screen, setScreen] = useState<Screen>(() =>
        isTutorialComplete() ? 'menu' : 'tutorial'
    );
    const [playerName, setPlayerName] = useState(() => getInitialPlayerName());
    const soloGame = useSoloGame({
        screen,
        onScreenChange: setScreen,
    });
    const multiplayerGame = useMultiplayerGame({
        playerName,
        screen,
        onScreenChange: setScreen,
    });
    const localCpuGame = useLocalCpuGame({
        playerName,
        screen,
        onScreenChange: setScreen,
    });
    const tutorialGame = useTutorialGame({
        playerName,
        screen,
        onScreenChange: setScreen,
    });

    useEffect(() => {
        if (screen === 'tutorial' && !tutorialGame.isTutorialActive) {
            tutorialGame.startTutorialGame();
        }
    }, [screen, tutorialGame.isTutorialActive]);

    useEffect(() => {
        persistPlayerName(playerName);
    }, [playerName]);

    function handleEditName(name: string) {
        setPlayerName(name);
    }

    async function returnToMenu() {
        await multiplayerGame.resetMultiplayerGame();
        localCpuGame.resetLocalCpuGame();
        soloGame.resetSoloGame();
        tutorialGame.resetTutorialGame();
        setScreen('menu');
    }

    function handleTutorialReturn() {
        markTutorialComplete();
        tutorialGame.resetTutorialGame();
        setScreen('menu');
    }

    if (screen === 'tutorial') {
        return (
            <MultiplayerGameScreen
                currentMultiplayerPlayer={tutorialGame.currentMultiplayerPlayer}
                isMultiplayerComboRunning={
                    tutorialGame.isMultiplayerComboRunning
                }
                isMultiplayerInputDisabled={
                    tutorialGame.isMultiplayerInputDisabled
                }
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

    if (screen === 'menu') {
        const activeMenuGame = localCpuGame.isInRoom
            ? {
                  isCurrentPlayerReady: localCpuGame.isCurrentPlayerReady,
                  isCpuOpponent: true,
                  isInRoom: localCpuGame.isInRoom,
                  isOpponentReady: localCpuGame.isOpponentReady,
                  onToggleReady: localCpuGame.toggleReady,
                  opponentName: localCpuGame.opponentName,
                  pendingInvitation: undefined,
                  toastId: 0,
                  toastMessage: undefined,
              }
            : {
                  isCurrentPlayerReady: multiplayerGame.isCurrentPlayerReady,
                  isCpuOpponent: false,
                  isInRoom: multiplayerGame.isInRoom,
                  isOpponentReady: multiplayerGame.isOpponentReady,
                  onToggleReady: multiplayerGame.toggleReady,
                  opponentName: multiplayerGame.opponentName,
                  pendingInvitation: multiplayerGame.pendingInvitation,
                  toastId: multiplayerGame.lobbyToast.id,
                  toastMessage: multiplayerGame.lobbyToast.message,
              };

        return (
            <MenuScreen
                isCpuOpponent={activeMenuGame.isCpuOpponent}
                isCurrentPlayerReady={activeMenuGame.isCurrentPlayerReady}
                isInRoom={activeMenuGame.isInRoom}
                isOpponentReady={activeMenuGame.isOpponentReady}
                onAcceptInvitation={() => {
                    detachPromise(multiplayerGame.handleAcceptInvitation());
                }}
                onDeclineInvitation={multiplayerGame.handleDeclineInvitation}
                onEditName={handleEditName}
                onInvitePlayer={(targetPlayerId) => {
                    detachPromise(
                        multiplayerGame.handleLobbyInvite(targetPlayerId)
                    );
                }}
                onlineUsers={multiplayerGame.onlineUsers}
                onPrefetchInviteUsers={multiplayerGame.prefetchOnlineUsers}
                onStartCpuGame={() => {
                    localCpuGame.startLocalCpuGame();
                }}
                onStartSoloGame={soloGame.startSingleGame}
                onToggleReady={() => {
                    detachPromise(
                        Promise.resolve(activeMenuGame.onToggleReady())
                    );
                }}
                opponentName={activeMenuGame.opponentName}
                pendingInvitation={activeMenuGame.pendingInvitation}
                playerName={playerName}
                toastId={activeMenuGame.toastId}
                toastMessage={activeMenuGame.toastMessage}
            />
        );
    }

    if (screen === 'single') {
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

    const activeBattleGame = localCpuGame.isLocalCpuGameActive
        ? {
              currentMultiplayerPlayer: localCpuGame.currentMultiplayerPlayer,
              isMultiplayerComboRunning: localCpuGame.isMultiplayerComboRunning,
              isMultiplayerInputDisabled:
                  localCpuGame.isMultiplayerInputDisabled,
              multiplayerPrimeQueue: localCpuGame.multiplayerPrimeQueue,
              multiplayerSnapshot: localCpuGame.multiplayerSnapshot,
              onSubmit: localCpuGame.handleMultiplayerComboSubmit,
              playablePrimes: localCpuGame.playablePrimes,
              onRematch: localCpuGame.rematchLocalCpuGame,
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
              onSubmit: multiplayerGame.handleMultiplayerComboSubmit,
              playablePrimes: multiplayerGame.playablePrimes,
              onRematch: undefined,
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
