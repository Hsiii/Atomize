import { useEffect, useRef, useState } from 'react';
import type { JSX } from 'react';

import { uiText } from '../../app-state';
import { getGuestDisplayName, loadBestScore } from '../../lib/app-helpers';
import { supabaseAuthClient } from '../../lib/supabase';
import { BackButton } from '../ui/BackButton';

import './LeaderboardScreen.css';

export type LeaderboardEntry = {
    player_name: string;
    high_score: number;
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
            .select('player_name, high_score')
            .gt('high_score', 0)
            .order('high_score', { ascending: false })
            .limit(10);

        const data = response.data as LeaderboardEntry[] | null;
        if (!response.error && (data?.length ?? 0) > 0) {
            return data ?? [];
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
                <header className='leaderboard-page-header-band'>
                    <div className='page-title-row'>
                        <BackButton onBack={onBack} />
                        <h1 className='page-title'>
                            {uiText.leaderboardTitle}
                        </h1>
                    </div>
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
