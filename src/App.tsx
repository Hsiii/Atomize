import { useEffect, useState } from 'react';
import type { JSX } from 'react';

import type { Screen } from './app-state';
import { MultiplayerGameScreen } from './components/game/MultiplayerGameScreen';
import { SingleGameScreen } from './components/game/SingleGameScreen';
import { MenuScreen } from './components/menu/MenuScreen';
import { useMultiplayerGame } from './hooks/useMultiplayerGame';
import { useSoloGame } from './hooks/useSoloGame';
import {
    detachPromise,
    formatCountdown,
    getInitialPlayerName,
    persistPlayerName,
} from './lib/app-helpers';

export default function App(): JSX.Element {
    const [screen, setScreen] = useState<Screen>('menu');
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

    useEffect(() => {
        persistPlayerName(playerName);
    }, [playerName]);

    function handleEditName(name: string) {
        setPlayerName(name);
    }

    async function returnToMenu() {
        await multiplayerGame.resetMultiplayerGame();
        soloGame.resetSoloGame();
        setScreen('menu');
    }

    if (screen === 'menu') {
        return (
            <MenuScreen
                isCurrentPlayerReady={multiplayerGame.isCurrentPlayerReady}
                isInRoom={multiplayerGame.isInRoom}
                isOpponentReady={multiplayerGame.isOpponentReady}
                multiplayerCountdownValue={
                    multiplayerGame.multiplayerCountdownValue
                }
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
                onStartSoloGame={soloGame.startSingleGame}
                onToggleReady={() => {
                    detachPromise(multiplayerGame.toggleReady());
                }}
                opponentName={multiplayerGame.opponentName}
                pendingInvitation={multiplayerGame.pendingInvitation}
                playerName={playerName}
                toastId={multiplayerGame.lobbyToast.id}
                toastMessage={multiplayerGame.lobbyToast.message}
            />
        );
    }

    if (screen === 'single') {
        return (
            <SingleGameScreen
                formatCountdown={formatCountdown}
                isSoloComboRunning={soloGame.isSoloComboRunning}
                onBack={returnToMenu}
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

    return (
        <MultiplayerGameScreen
            currentMultiplayerPlayer={multiplayerGame.currentMultiplayerPlayer}
            isMultiplayerComboRunning={
                multiplayerGame.isMultiplayerComboRunning
            }
            isMultiplayerInputDisabled={
                multiplayerGame.isMultiplayerInputDisabled
            }
            multiplayerPrimeQueue={multiplayerGame.multiplayerPrimeQueue}
            multiplayerSnapshot={multiplayerGame.multiplayer.snapshot}
            onBack={returnToMenu}
            onSubmit={multiplayerGame.handleMultiplayerComboSubmit}
            playablePrimes={multiplayerGame.playablePrimes}
        />
    );
}
