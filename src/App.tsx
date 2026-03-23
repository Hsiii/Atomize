import { useCallback, useEffect, useRef, useState } from 'react';
import type { JSX } from 'react';
import type { Session, SupabaseClient } from '@supabase/supabase-js';
import { Outlet, useLocation, useNavigate } from '@tanstack/react-router';

import { AppProvider } from './app-context';
import type { AppContextValue } from './app-context';
import { seoText, uiText } from './app-state';
import type { PendingInvitation, Screen } from './app-state';
import { ActionButton } from './components/game/ui/ActionButton';
import { fetchLeaderboardData } from './components/menu/LeaderboardScreen';
import type { LeaderboardEntry } from './components/menu/LeaderboardScreen';
import { useLocalCpuGame } from './hooks/useLocalCpuGame';
import { useMultiplayerGame } from './hooks/useMultiplayerGame';
import { useSoloGame } from './hooks/useSoloGame';
import { useTutorialGame } from './hooks/useTutorialGame';
import { BurstTransition } from './components/ui/BurstTransition';
import {
    detachPromise,
    getInitialPlayerName,
    isGuestModeEnabled,
    loadBestScore,
    markTutorialComplete,
    persistPlayerName,
    saveBestScore,
    setGuestModeEnabled,
} from './lib/app-helpers';
import type { Database } from './lib/database.types';
import { GOOGLE_AUTH_POPUP_NAME, supabaseAuthClient } from './lib/supabase';

type SeoContent = {
    description: string;
    title: string;
};

function upsertMetaTag({
    content,
    name,
    property,
}: {
    content: string;
    name?: string;
    property?: string;
}) {
    if (typeof document === 'undefined') {
        return;
    }

    const selector = name
        ? `meta[name="${name}"]`
        : `meta[property="${property}"]`;
    let metaElement = document.head.querySelector<HTMLMetaElement>(selector);

    if (!metaElement) {
        metaElement = document.createElement('meta');

        if (name) {
            metaElement.name = name;
        }

        if (property) {
            metaElement.setAttribute('property', property);
        }

        document.head.append(metaElement);
    }

    metaElement.content = content;
}

function applySeoContent({ description, title }: SeoContent) {
    if (typeof document === 'undefined') {
        return;
    }

    document.title = title;
    upsertMetaTag({ name: 'description', content: description });
    upsertMetaTag({ property: 'og:title', content: title });
    upsertMetaTag({ property: 'og:description', content: description });
    upsertMetaTag({ name: 'twitter:title', content: title });
    upsertMetaTag({ name: 'twitter:description', content: description });
}

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
    const fallbackHighScore = loadBestScore().score;
    const existingRecordResponse = await authClient
        .from('combo_leaderboard')
        .select('player_name, high_score')
        .eq('user_id', userId)
        .maybeSingle();

    if (existingRecordResponse.error) {
        return;
    }

    const existingRecord = existingRecordResponse.data as {
        player_name: string;
        high_score: number;
    } | null;
    const nextHighScore = Math.max(
        existingRecord?.high_score ?? 0,
        fallbackHighScore
    );

    if (nextHighScore > 0) {
        saveBestScore(nextHighScore, 0);
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
            high_score: nextHighScore,
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

const SCREEN_TO_PATH = {
    'tutorial': '/tutorial',
    'single': '/solo/play',
    'multi-game': '/battle/play',
    'menu': '/',
} as const;

function deriveScreen(pathname: string): Screen {
    if (pathname === '/tutorial') {
        return 'tutorial';
    }

    if (pathname === '/solo/play') {
        return 'single';
    }

    if (pathname === '/battle/play') {
        return 'multi-game';
    }

    return 'menu';
}

export default function App(): JSX.Element {
    const location = useLocation();
    const navigate = useNavigate();
    const screen = deriveScreen(location.pathname);

    const navigateRef = useRef<ReturnType<typeof useNavigate>>(navigate);
    navigateRef.current = navigate;

    const [pendingTransitionScreen, setPendingTransitionScreen] = useState<Screen | undefined>(undefined);

    const onScreenChange = useCallback((nextScreen: Screen) => {
        // Intercept transitions strictly requiring the burst effect
        if (nextScreen === 'multi-game') {
            setPendingTransitionScreen(nextScreen);
        } else {
            detachPromise(navigateRef.current({ to: SCREEN_TO_PATH[nextScreen] }));
        }
    }, []);

    const [leaderboardData, setLeaderboardData] = useState<
        readonly LeaderboardEntry[] | undefined
    >(undefined);
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
        onScreenChange,
        onNewBest: (score) => {
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
                            high_score: score,
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
        onScreenChange,
    });
    const localCpuGame = useLocalCpuGame({
        playerName,
        screen,
        onScreenChange,
    });
    const tutorialGame = useTutorialGame({
        playerName,
        screen,
        onScreenChange,
    });

    useEffect(() => {
        if (screen === 'tutorial' && !tutorialGame.isTutorialActive) {
            tutorialGame.startTutorialGame();
        }
    }, [screen, tutorialGame.isTutorialActive]);

    useEffect(() => {
        persistPlayerName(playerName);
    }, [playerName]);

    useEffect(() => {
        if (screen !== 'menu' || sessionLoading || leaderboardData) {
            return;
        }

        detachPromise(
            fetchLeaderboardData(playerName).then(setLeaderboardData)
        );
    }, [screen, sessionLoading, leaderboardData, playerName]);

    useEffect(() => {
        let seoContent: SeoContent = {
            description: seoText.defaultDescription,
            title: seoText.defaultTitle,
        };

        switch (location.pathname) {
            case '/': {
                seoContent = {
                    description: seoText.menuDescription,
                    title: seoText.menuTitle,
                };
                break;
            }

            case '/tutorial': {
                seoContent = {
                    description: seoText.tutorialDescription,
                    title: seoText.tutorialTitle,
                };
                break;
            }

            case '/solo':
            case '/solo/play': {
                seoContent = {
                    description: seoText.singleDescription,
                    title: seoText.singleTitle,
                };
                break;
            }

            case '/battle':
            case '/battle/play': {
                seoContent = {
                    description: seoText.multiplayerDescription,
                    title: seoText.multiplayerTitle,
                };
                break;
            }

            case '/login': {
                seoContent = {
                    description: seoText.loginDescription,
                    title: seoText.loginTitle,
                };
                break;
            }

            case '/signup': {
                seoContent = {
                    description: seoText.signupDescription,
                    title: seoText.signupTitle,
                };
                break;
            }

            case '/account': {
                seoContent = {
                    description: seoText.accountDescription,
                    title: seoText.accountTitle,
                };
                break;
            }

            case '/leaderboard': {
                seoContent = {
                    description: seoText.leaderboardDescription,
                    title: seoText.leaderboardTitle,
                };
                break;
            }

            default: {
                break;
            }
        }

        applySeoContent(seoContent);
    }, [location.pathname]);

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
            .select('high_score')
            .eq('user_id', userId)
            .maybeSingle();

        if (currentRecordResponse.error) {
            return uiText.nameSaveError;
        }

        const nextHighScore =
            currentRecordResponse.data?.high_score ?? loadBestScore().score;
        const upsertResponse = await supabaseAuthClient
            .from('combo_leaderboard')
            .upsert(
                {
                    user_id: userId,
                    player_name: name,
                    high_score: nextHighScore,
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
        setLeaderboardData(undefined);
        detachPromise(navigate({ to: '/' }));
    }

    function handleTutorialReturn() {
        markTutorialComplete();
        tutorialGame.resetTutorialGame();
        detachPromise(navigate({ to: '/' }));
    }

    function handleLogout() {
        if (supabaseAuthClient) {
            detachPromise(supabaseAuthClient.auth.signOut());
        }

        setIsGuest(true);
        setGuestModeEnabled(true);
        setPlayerName('');
        persistPlayerName('');
    }

    if (sessionLoading) {
        return <main className='app-shell fullscreen-shell' />;
    }

    const contextValue: AppContextValue = {
        session,
        isGuest,
        playerName,
        soloGame,
        multiplayerGame,
        localCpuGame,
        tutorialGame,
        leaderboardData,
        handleEditName,
        handleLogout,
        handleTutorialReturn,
        returnToMenu,
    };

    const pendingInvitation =
        screen !== 'menu' || localCpuGame.isInRoom
            ? undefined
            : multiplayerGame.pendingInvitation;

    function handleAcceptInvitation() {
        detachPromise(multiplayerGame.handleAcceptInvitation());
        detachPromise(navigate({ to: '/battle' }));
    }

    function handleDeclineInvitation() {
        multiplayerGame.handleDeclineInvitation();
    }

    return (
        <AppProvider value={contextValue}>
            <Outlet />
            {pendingTransitionScreen ? (
                <BurstTransition 
                    onComplete={() => {
                        const targetScreen = pendingTransitionScreen;
                        // Execute actual navigation after the full burst sequence finishes
                        detachPromise(navigate({ to: SCREEN_TO_PATH[targetScreen] }));
                        setPendingTransitionScreen(undefined);
                    }} 
                />
            ) : undefined}
            {pendingInvitation ? (
                <InvitationDialog
                    onAccept={handleAcceptInvitation}
                    onDecline={handleDeclineInvitation}
                    pendingInvitation={pendingInvitation}
                />
            ) : undefined}
        </AppProvider>
    );
}

function InvitationDialog({
    onAccept,
    onDecline,
    pendingInvitation,
}: {
    onAccept: () => void;
    onDecline: () => void;
    pendingInvitation: PendingInvitation;
}): JSX.Element {
    return (
        <div className='dialog-scrim' role='presentation'>
            <div className='dialog-panel dialog-invitation' role='alertdialog'>
                <div className='dialog-body invitation-body'>
                    <p className='invitation-text'>
                        <strong>{pendingInvitation.fromName}</strong>{' '}
                        {uiText.inviteReceived}
                    </p>
                </div>
                <div className='dialog-actions invitation-actions'>
                    <ActionButton onClick={onDecline} variant='danger'>
                        {uiText.decline}
                    </ActionButton>
                    <ActionButton onClick={onAccept} variant='primary'>
                        {uiText.accept}
                    </ActionButton>
                </div>
            </div>
        </div>
    );
}
