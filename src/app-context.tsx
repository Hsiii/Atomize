import { createContext, useContext } from 'react';
import type { JSX } from 'react';
import type { Session } from '@supabase/supabase-js';

import type { LeaderboardEntry } from './components/menu/LeaderboardScreen';
import type { useLocalCpuGame } from './hooks/useLocalCpuGame';
import type { useMultiplayerGame } from './hooks/useMultiplayerGame';
import type { useSoloGame } from './hooks/useSoloGame';
import type { useTutorialGame } from './hooks/useTutorialGame';

export type AppContextValue = {
    session: Session | undefined;
    isGuest: boolean;
    playerName: string;
    soloGame: ReturnType<typeof useSoloGame>;
    multiplayerGame: ReturnType<typeof useMultiplayerGame>;
    localCpuGame: ReturnType<typeof useLocalCpuGame>;
    tutorialGame: ReturnType<typeof useTutorialGame>;
    leaderboardData: readonly LeaderboardEntry[] | undefined;
    handleEditName: (name: string) => Promise<string | undefined>;
    handleLogout: () => void;
    handleTutorialReturn: () => void;
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
