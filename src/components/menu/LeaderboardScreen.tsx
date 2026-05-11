import { useEffect, useRef, useState } from 'react';
import type { JSX } from 'react';
import { Trophy } from 'lucide-react';

import { uiText } from '../../app-state';
import {
    getGuestDisplayName,
    loadBestScore,
    normalizeHistoricSoloHighScore,
} from '../../lib/app-helpers';
import { supabaseAuthClient } from '../../lib/supabase';
import { BackButton } from '../ui/BackButton';

import './LeaderboardScreen.css';

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

type LeaderboardScreenProps = {
    playerName: string;
    prefetchedData: readonly LeaderboardEntry[] | undefined;
    onBack: () => void;
};

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
            .limit(100);

        const data = response.data as LeaderboardEntry[] | null;
        if (!response.error && (data?.length ?? 0) > 0) {
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

export function LeaderboardScreen({
    playerName,
    prefetchedData,
    onBack,
}: LeaderboardScreenProps): JSX.Element {
    const [leaderboardData, setLeaderboardData] = useState<
        readonly LeaderboardEntry[]
    >(prefetchedData ?? []);
    const [loading, setLoading] = useState(!prefetchedData);
    const requestRef = useRef<Promise<void> | undefined>(undefined);

    useEffect(() => {
        if (prefetchedData || requestRef.current) {
            return;
        }

        const request = fetchLeaderboardData(playerName).then(
            (data: readonly LeaderboardEntry[]) => {
                setLeaderboardData(data);
                setLoading(false);
                requestRef.current = undefined;
            }
        );

        requestRef.current = request;
    }, [playerName, prefetchedData]);

    return (
        <main className='app-shell fullscreen-shell leaderboard-page-shell'>
            <section className='screen leaderboard-page-screen'>
                <header className='page-header-band'>
                    <div className='page-title-row'>
                        <BackButton onBack={onBack} />
                        <h1 className='page-title'>
                            {uiText.leaderboardTitle}
                        </h1>
                    </div>
                    <Trophy className='page-hero-icon' strokeWidth={2} />
                    <p className='page-tagline'>{uiText.leaderboardGoal}</p>
                </header>

                <div className='leaderboard-page-body'>
                    {loading && (
                        <p className='leaderboard-page-empty'>
                            {uiText.waitingShort}
                        </p>
                    )}
                    {!loading && leaderboardData.length > 0 && (
                        <table className='leaderboard-page-table'>
                            <thead>
                                <tr>
                                    <th className='col-rank'>{uiText.rank}</th>
                                    <th className='col-player'>
                                        {uiText.player}
                                    </th>
                                    <th className='col-combo'>
                                        {uiText.highScore}
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {leaderboardData.map((entry, idx) => {
                                    const rowClassName =
                                        idx === 0
                                            ? 'leaderboard-row leaderboard-row-first'
                                            : 'leaderboard-row';

                                    return (
                                        <tr
                                            className={rowClassName}
                                            key={`${entry.player_name}-${entry.high_score}-${idx}`}
                                        >
                                            <td className='col-rank'>
                                                <span className='leaderboard-rank-badge'>
                                                    #{idx + 1}
                                                </span>
                                            </td>
                                            <td className='col-player'>
                                                <span className='leaderboard-player-name'>
                                                    {entry.player_name}
                                                </span>
                                            </td>
                                            <td className='col-combo'>
                                                <span className='leaderboard-combo-value'>
                                                    {entry.high_score}
                                                </span>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    )}
                    {!loading && leaderboardData.length === 0 && (
                        <p className='leaderboard-page-empty'>
                            {uiText.leaderboardEmpty}
                        </p>
                    )}
                </div>
            </section>
        </main>
    );
}
