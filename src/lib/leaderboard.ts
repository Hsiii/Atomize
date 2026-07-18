import {
    getGuestDisplayName,
    loadBestScore,
    normalizeHistoricSoloHighScore,
} from './app-helpers';
import { supabaseAuthClient } from './supabase';

export type LeaderboardEntry = {
    player_name: string;
    high_score: number;
    updated_at?: string | null;
};

function sortLeaderboardEntries(
    entries: readonly LeaderboardEntry[]
): readonly LeaderboardEntry[] {
    const sortedEntries: LeaderboardEntry[] = [];

    for (const entry of entries) {
        const insertIndex = sortedEntries.findIndex(
            (candidate) => candidate.high_score < entry.high_score
        );

        if (insertIndex === -1) {
            sortedEntries.push(entry);
            continue;
        }

        sortedEntries.splice(insertIndex, 0, entry);
    }

    return sortedEntries;
}

export async function fetchLeaderboardData(
    playerName: string
): Promise<readonly LeaderboardEntry[]> {
    const client = supabaseAuthClient;
    if (!client) {
        const localBest = loadBestScore();
        if (localBest.score > 0) {
            return [
                {
                    player_name: playerName || getGuestDisplayName(),
                    high_score: localBest.score,
                },
            ];
        }
        return [];
    }

    try {
        const response = await client
            .from('combo_leaderboard')
            .select('player_name, high_score, updated_at')
            .gt('high_score', 0)
            .order('high_score', { ascending: false })
            .limit(100);

        const data = response.data as LeaderboardEntry[] | null;
        if (!response.error) {
            const normalizedEntries = (data ?? []).map((entry) => ({
                ...entry,
                high_score: normalizeHistoricSoloHighScore(
                    entry.high_score,
                    entry.updated_at
                ),
            }));

            return sortLeaderboardEntries(normalizedEntries).slice(0, 10);
        }
    } catch {
        // Fall through to local fallback.
    }

    const localBest = loadBestScore();
    if (localBest.score > 0) {
        return [
            {
                player_name: playerName || getGuestDisplayName(),
                high_score: localBest.score,
            },
        ];
    }
    return [];
}
