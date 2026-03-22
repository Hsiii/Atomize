import { useEffect, useState } from 'react';
import type { JSX } from 'react';
import type { Session, SupabaseClient } from '@supabase/supabase-js';

import type { Screen } from './app-state';
import { MultiplayerGameScreen } from './components/game/MultiplayerGameScreen';
import { SingleGameScreen } from './components/game/SingleGameScreen';
import { LoginScreen } from './components/menu/LoginScreen';
import { MenuScreen } from './components/menu/MenuScreen';
import { useLocalCpuGame } from './hooks/useLocalCpuGame';
import { useMultiplayerGame } from './hooks/useMultiplayerGame';
import { useSoloGame } from './hooks/useSoloGame';
import { useTutorialGame } from './hooks/useTutorialGame';
import {
    detachPromise,
    formatCountdown,
    getInitialPlayerName,
    isGuestModeEnabled,
    isTutorialComplete,
    markTutorialComplete,
    persistPlayerName,
    saveBestScore,
    setGuestModeEnabled,
} from './lib/app-helpers';
import type { Database } from './lib/database.types';
import { supabaseAuthClient } from './lib/supabase';

export default function App(): JSX.Element {
    const [screen, setScreen] = useState<Screen>(() =>
        isTutorialComplete() ? 'menu' : 'tutorial'
    );
    const [sessionLoading, setSessionLoading] = useState(true);
    const [session, setSession] = useState<Session | undefined>(undefined);
    const [isGuest, setIsGuest] = useState(() => isGuestModeEnabled());

    useEffect(() => {
        if (!supabaseAuthClient) {
            setSessionLoading(false);
            return undefined;
        }

        const authClient: SupabaseClient<Database> = supabaseAuthClient;
        detachPromise(
            authClient.auth.getSession().then(({ data }) => {
                setSession(data.session ?? undefined);
                if (data.session?.user.user_metadata.display_name) {
                    const name = data.session.user.user_metadata.display_name;
                    setPlayerName(name);
                    persistPlayerName(name);
                }
                // Restore best combo from account and merge with local storage.
                const userId = data.session?.user.id;
                if (userId) {
                    detachPromise(
                        Promise.resolve(
                            authClient
                                .from('combo_leaderboard')
                                .select('max_combo')
                                .eq('user_id', userId)
                                .maybeSingle()
                        ).then((response) => {
                            const scoreData = response.data as {
                                max_combo: number;
                            } | null;
                            if (scoreData?.max_combo) {
                                saveBestScore(0, scoreData.max_combo);
                            }
                        })
                    );
                }
                setSessionLoading(false);
            })
        );

        const {
            data: { subscription },
        } = supabaseAuthClient.auth.onAuthStateChange(
            (_event, currentSession) => {
                setSession(currentSession ?? undefined);
                if (currentSession?.user.user_metadata.display_name) {
                    const name = currentSession.user.user_metadata.display_name;
                    setPlayerName(name);
                    persistPlayerName(name);
                }
            }
        );

        return () => {
            subscription.unsubscribe();
        };
    }, []);

    const [playerName, setPlayerName] = useState(() => getInitialPlayerName());
    const soloGame = useSoloGame({
        screen,
        onScreenChange: setScreen,
        onNewBest: (_score, maxCombo) => {
            const userId = session?.user.id;
            if (!supabaseAuthClient || !userId || !playerName) {
                return;
            }
            detachPromise(
                Promise.resolve(
                    supabaseAuthClient.from('combo_leaderboard').upsert(
                        {
                            user_id: userId,
                            player_name: playerName,
                            max_combo: maxCombo,
                        },
                        { onConflict: 'user_id' }
                    )
                )
            );
        },
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
        if (!supabaseAuthClient || !session) {
            return;
        }
        const userId = session.user.id;
        // Update display name in account metadata.
        detachPromise(
            supabaseAuthClient.auth
                .updateUser({ data: { display_name: name } })
                .then(() => undefined)
        );
        // Sync updated name to this account's leaderboard row.
        detachPromise(
            Promise.resolve(
                supabaseAuthClient
                    .from('combo_leaderboard')
                    .update({ player_name: name })
                    .eq('user_id', userId)
            )
        );
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

    if (sessionLoading) {
        return <main className='app-shell fullscreen-shell' />;
    }

    if (!isGuest && !session && screen !== 'login') {
        return (
            <LoginScreen
                onLoginSuccess={() => {
                    setIsGuest(false);
                    setGuestModeEnabled(false);
                    setScreen(isTutorialComplete() ? 'menu' : 'tutorial');
                }}
                onPlayAsGuest={() => {
                    setIsGuest(true);
                    setGuestModeEnabled(true);
                    setPlayerName('');
                    persistPlayerName('');
                    setScreen(isTutorialComplete() ? 'menu' : 'tutorial');
                }}
            />
        );
    }

    if (screen === 'login') {
        return (
            <LoginScreen
                onLoginSuccess={() => {
                    setIsGuest(false);
                    setGuestModeEnabled(false);
                    setScreen(isTutorialComplete() ? 'menu' : 'tutorial');
                }}
                onPlayAsGuest={() => {
                    setIsGuest(true);
                    setGuestModeEnabled(true);
                    setScreen(isTutorialComplete() ? 'menu' : 'tutorial');
                }}
            />
        );
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
                isGuest={isGuest}
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
                onLogout={() => {
                    if (supabaseAuthClient) {
                        detachPromise(supabaseAuthClient.auth.signOut());
                    }
                    setIsGuest(false);
                    setGuestModeEnabled(false);
                    setPlayerName('');
                    persistPlayerName('');
                }}
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
