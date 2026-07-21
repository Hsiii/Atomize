import { createContext, useContext } from 'react';
import type { JSX } from 'react';
import type { Session } from '@supabase/supabase-js';

import type { useLocalCpuGame } from './hooks/useLocalCpuGame';
import type { useMultiplayerGame } from './hooks/useMultiplayerGame';
import type { useSoloGame } from './hooks/useSoloGame';
import type { useTutorialGame } from './hooks/useTutorialGame';
import type { LeaderboardEntry } from './lib/leaderboard';

export type ProfileStats = {
    games_played: number;
    wins: number;
    losses: number;
    max_combo: number;
    high_score: number;
    experience: number;
    updated_at?: string | null;
};

export type AppContextValue = {
    session: Session | undefined;
    isGuest: boolean;
    pathname: string;
    playerName: string;
    playerLevel: number | undefined;
    accountStats: ProfileStats | undefined;
    soloGame: ReturnType<typeof useSoloGame>;
    multiplayerGame: ReturnType<typeof useMultiplayerGame>;
    localCpuGame: ReturnType<typeof useLocalCpuGame>;
    tutorialGame: ReturnType<typeof useTutorialGame>;
    leaderboardData: readonly LeaderboardEntry[] | undefined;
    handleEditName: (name: string) => Promise<string | undefined>;
    handleLogout: () => void;
    handleTutorialReturn: () => void;
    navigateTo: (targetPath: string) => void;
    returnToMenu: () => Promise<void>;
};

const AppContext = createContext<AppContextValue | undefined>(undefined);

export function AppProvider({
    children,
    value,
}: {
    children: React.ReactNode;
    value: AppContextValue;
}): JSX.Element {
    return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useAppContext(): AppContextValue {
    const ctx = useContext(AppContext);

    if (!ctx) {
        throw new Error('useAppContext must be used within AppProvider');
    }

    return ctx;
}
