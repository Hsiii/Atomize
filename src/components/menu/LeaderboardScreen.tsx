import { useEffect, useRef, useState } from 'react';
import type { JSX } from 'react';

import { uiText } from '../../app-state';
import { loadBestScore } from '../../lib/app-helpers';
import { supabaseAuthClient } from '../../lib/supabase';
import { BackButton } from '../ui/BackButton';

import './LeaderboardScreen.css';

export type LeaderboardEntry = {
    player_name: string;
    max_combo: number;
};

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
        if (localBest.maxCombo > 0) {
            return [
                {
                    player_name: playerName || getGuestDisplayName(),
                    max_combo: localBest.maxCombo,
                },
            ];
        }
        return [];
    }

    try {
        const response = await client
            .from('combo_leaderboard')
            .select('player_name, max_combo')
            .order('max_combo', { ascending: false })
            .limit(10);

        const data = response.data as LeaderboardEntry[] | null;
        if (!response.error && (data?.length ?? 0) > 0) {
            return data ?? [];
        }
    } catch {
        // Fall through to local fallback.
    }

    const localBest = loadBestScore();
    if (localBest.maxCombo > 0) {
        return [
            {
                player_name: playerName || getGuestDisplayName(),
                max_combo: localBest.maxCombo,
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
                <header className='leaderboard-page-header-band'>
                    <BackButton onBack={onBack} />
                    <h1 className='leaderboard-page-title'>
                        {uiText.leaderboardTitle}
                    </h1>
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
                                        {uiText.highestCombo}
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
                                            key={`${entry.player_name}-${entry.max_combo}-${idx}`}
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
                                                    {entry.max_combo}
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
