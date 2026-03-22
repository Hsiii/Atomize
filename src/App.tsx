import { useEffect, useState } from 'react';
import type { JSX } from 'react';
import type { Session, SupabaseClient } from '@supabase/supabase-js';

import { uiText } from './app-state';
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
    isGuestModeEnabled,
    isTutorialComplete,
    loadBestScore,
    markTutorialComplete,
    persistPlayerName,
    saveBestScore,
    setGuestModeEnabled,
} from './lib/app-helpers';
import type { Database } from './lib/database.types';
import { supabaseAuthClient } from './lib/supabase';

const GOOGLE_AUTH_POPUP_NAME = 'google-sign-in';

function isGoogleAuthPopupWindow(): boolean {
    return Boolean(
        window.opener &&
        window.opener !== globalThis &&
        window.name === GOOGLE_AUTH_POPUP_NAME
    );
}

function finishGoogleAuthPopup() {
    if (!isGoogleAuthPopupWindow()) {
        return;
    }

    globalThis.requestAnimationFrame(() => {
        try {
            window.opener?.focus();
        } catch {
            return;
        }

        window.close();
    });
}

function normalizePlayerName(value: string): string {
    return value.trim().replaceAll(/\s+/g, ' ').toLowerCase();
}

function isUniqueViolation(
    error: { code?: string } | null | undefined
): boolean {
    return error?.code === '23505';
}

function getAuthDisplayName(
    userMetadata: Record<string, unknown> | undefined,
    email: string | undefined
): string | undefined {
    const candidateValues = [
        userMetadata?.display_name,
        userMetadata?.full_name,
        userMetadata?.name,
        userMetadata?.preferred_username,
        email?.split('@')[0],
    ];

    for (const candidate of candidateValues) {
        if (typeof candidate !== 'string') {
            continue;
        }

        const normalizedName = candidate
            .trim()
            .replaceAll(/\s+/g, ' ')
            .slice(0, 8);

        if (normalizedName) {
            return normalizedName;
        }
    }

    return undefined;
}

function buildUniqueLeaderboardName(
    preferredName: string,
    takenNames: ReadonlySet<string>
): string {
    const trimmedName = preferredName
        .trim()
        .replaceAll(/\s+/g, ' ')
        .slice(0, 8);

    if (!takenNames.has(normalizePlayerName(trimmedName))) {
        return trimmedName;
    }

    for (let suffix = 2; suffix < 100; suffix++) {
        const suffixText = String(suffix);
        const candidateName = `${trimmedName.slice(0, Math.max(1, 8 - suffixText.length))}${suffixText}`;

        if (!takenNames.has(normalizePlayerName(candidateName))) {
            return candidateName;
        }
    }

    return `${trimmedName.slice(0, 6)}99`;
}

async function syncAuthenticatedLeaderboardProfile({
    authClient,
    currentSession,
    fallbackName,
    onPlayerName,
}: {
    authClient: SupabaseClient<Database>;
    currentSession: Session;
    fallbackName: string | undefined;
    onPlayerName: (name: string) => void;
}) {
    const userId = currentSession.user.id;
    const fallbackMaxCombo = loadBestScore().maxCombo;
    const existingRecordResponse = await authClient
        .from('combo_leaderboard')
        .select('player_name, max_combo')
        .eq('user_id', userId)
        .maybeSingle();

    if (existingRecordResponse.error) {
        return;
    }

    const existingRecord = existingRecordResponse.data as {
        player_name: string;
        max_combo: number;
    } | null;
    const nextMaxCombo = Math.max(
        existingRecord?.max_combo ?? 0,
        fallbackMaxCombo
    );

    if (nextMaxCombo > 0) {
        saveBestScore(0, nextMaxCombo);
    }

    let nextPlayerName = existingRecord?.player_name.trim() ?? fallbackName;

    if (!nextPlayerName) {
        return;
    }

    if (!existingRecord?.player_name) {
        const availabilityResponse = await authClient
            .from('combo_leaderboard')
            .select('user_id, player_name');

        if (availabilityResponse.error) {
            return;
        }

        const takenNames = new Set(
            availabilityResponse.data
                .filter((entry) => entry.user_id !== userId)
                .map((entry) => normalizePlayerName(entry.player_name))
        );

        nextPlayerName = buildUniqueLeaderboardName(nextPlayerName, takenNames);
    }

    const upsertResponse = await authClient.from('combo_leaderboard').upsert(
        {
            user_id: userId,
            player_name: nextPlayerName,
            max_combo: nextMaxCombo,
        },
        { onConflict: 'user_id' }
    );

    if (upsertResponse.error) {
        return;
    }

    onPlayerName(nextPlayerName);
    persistPlayerName(nextPlayerName);

    if (currentSession.user.user_metadata.display_name !== nextPlayerName) {
        detachPromise(
            authClient.auth
                .updateUser({ data: { display_name: nextPlayerName } })
                .then(() => undefined)
        );
    }
}

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
            authClient.auth.getSession().then(async ({ data }) => {
                setSession(data.session ?? undefined);
                if (data.session) {
                    setIsGuest(false);
                    setGuestModeEnabled(false);
                    finishGoogleAuthPopup();
                    await syncAuthenticatedLeaderboardProfile({
                        authClient,
                        currentSession: data.session,
                        fallbackName: getAuthDisplayName(
                            data.session.user.user_metadata as
                                | Record<string, unknown>
                                | undefined,
                            data.session.user.email
                        ),
                        onPlayerName: setPlayerName,
                    });
                }
                setSessionLoading(false);
            })
        );

        const {
            data: { subscription },
        } = supabaseAuthClient.auth.onAuthStateChange(
            (_event, currentSession) => {
                setSession(currentSession ?? undefined);
                if (currentSession) {
                    setIsGuest(false);
                    setGuestModeEnabled(false);
                    finishGoogleAuthPopup();
                    detachPromise(
                        syncAuthenticatedLeaderboardProfile({
                            authClient,
                            currentSession,
                            fallbackName: getAuthDisplayName(
                                currentSession.user.user_metadata as
                                    | Record<string, unknown>
                                    | undefined,
                                currentSession.user.email
                            ),
                            onPlayerName: setPlayerName,
                        })
                    );
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

    async function handleEditName(name: string): Promise<string | undefined> {
        const normalizedNextName = normalizePlayerName(name);
        const normalizedCurrentName = normalizePlayerName(playerName);

        if (
            supabaseAuthClient &&
            normalizedNextName !== normalizedCurrentName
        ) {
            let availabilityQuery = supabaseAuthClient
                .from('combo_leaderboard')
                .select('user_id, player_name');

            if (session) {
                availabilityQuery = availabilityQuery.neq(
                    'user_id',
                    session.user.id
                );
            }

            const availabilityResponse = await availabilityQuery;

            if (availabilityResponse.error) {
                return uiText.nameSaveError;
            }

            const nameIsTaken = availabilityResponse.data.some(
                (entry) =>
                    normalizePlayerName(entry.player_name) ===
                    normalizedNextName
            );

            if (nameIsTaken) {
                return uiText.nameInUse;
            }
        }

        if (!supabaseAuthClient || !session) {
            setPlayerName(name);
            return undefined;
        }

        const userId = session.user.id;

        const currentRecordResponse = await supabaseAuthClient
            .from('combo_leaderboard')
            .select('max_combo')
            .eq('user_id', userId)
            .maybeSingle();

        if (currentRecordResponse.error) {
            return uiText.nameSaveError;
        }

        const nextMaxCombo =
            currentRecordResponse.data?.max_combo ?? loadBestScore().maxCombo;
        const upsertResponse = await supabaseAuthClient
            .from('combo_leaderboard')
            .upsert(
                {
                    user_id: userId,
                    player_name: name,
                    max_combo: nextMaxCombo,
                },
                { onConflict: 'user_id' }
            );

        if (isUniqueViolation(upsertResponse.error)) {
            return uiText.nameInUse;
        }

        if (upsertResponse.error) {
            return uiText.nameSaveError;
        }

        setPlayerName(name);
        persistPlayerName(name);
        detachPromise(
            supabaseAuthClient.auth
                .updateUser({ data: { display_name: name } })
                .then(() => undefined)
        );

        return undefined;
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
                isGuest={isGuest || !session}
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
                    setIsGuest(true);
                    setGuestModeEnabled(true);
                    setPlayerName('');
                    persistPlayerName('');
                    setScreen('menu');
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
