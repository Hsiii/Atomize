import type { JSX } from 'react';
import { Timer } from 'lucide-react';

import { uiText } from '../../app-state';
import type { BestScoreRecord } from '../../lib/app-helpers';
import { getGuestDisplayName } from '../../lib/app-helpers';
import { ActionButton } from '../game/ui/ActionButton';
import { BackButton } from '../ui/BackButton';
import type { LeaderboardEntry } from './LeaderboardScreen';

import './SoloPregameScreen.css';

type SoloPregameScreenProps = {
    bestScore: BestScoreRecord;
    leaderboardData: readonly LeaderboardEntry[] | undefined;
    playerName: string;
    onBack: () => void;
    onStart: () => void;
};

const LEADERBOARD_DISPLAY_LIMIT = 5;

export function SoloPregameScreen({
    bestScore,
    leaderboardData,
    playerName,
    onBack,
    onStart,
}: SoloPregameScreenProps): JSX.Element {
    const displayName = playerName.trim() || getGuestDisplayName();
    const playerScore = bestScore.score;

    // Build visible leaderboard: top N entries, then the player row at bottom
    const topEntries = (leaderboardData ?? []).slice(
        0,
        LEADERBOARD_DISPLAY_LIMIT
    );
    const isPlayerInTop = topEntries.some(
        (e) => e.player_name === displayName && e.high_score === playerScore
    );

    return (
        <main className='app-shell fullscreen-shell solo-pregame-shell'>
            <section className='screen solo-pregame-screen'>
                <header className='solo-pregame-header'>
                    <BackButton onBack={onBack} />
                    <div className='solo-pregame-header-blob'>
                        <Timer
                            aria-hidden='true'
                            className='solo-pregame-mode-icon'
                        />
                        <h1 className='solo-pregame-title'>
                            {uiText.soloTitle}
                        </h1>
                    </div>
                </header>

                <div className='solo-pregame-body'>
                    <div className='solo-pregame-leaderboard'>
                        <table className='solo-lb-table'>
                            <thead>
                                <tr>
                                    <th className='solo-lb-col-rank' />
                                    <th className='solo-lb-col-name'>
                                        {uiText.player}
                                    </th>
                                    <th className='solo-lb-col-score'>
                                        {uiText.score}
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {topEntries.map((entry, idx) => {
                                    const isFirst = idx === 0;
                                    const isMe =
                                        entry.player_name === displayName &&
                                        entry.high_score === playerScore;
                                    const rowClass = [
                                        'solo-lb-row',
                                        isFirst ? 'solo-lb-row-first' : '',
                                        isMe ? 'solo-lb-row-me' : '',
                                    ]
                                        .filter(Boolean)
                                        .join(' ');

                                    return (
                                        <tr
                                            className={rowClass}
                                            key={`${entry.player_name}-${idx}`}
                                        >
                                            <td className='solo-lb-col-rank'>
                                                <span className='solo-lb-rank'>
                                                    {idx + 1}
                                                </span>
                                            </td>
                                            <td className='solo-lb-col-name'>
                                                <span className='solo-lb-name'>
                                                    {entry.player_name}
                                                </span>
                                            </td>
                                            <td className='solo-lb-col-score'>
                                                <span className='solo-lb-score'>
                                                    {entry.high_score}
                                                </span>
                                            </td>
                                        </tr>
                                    );
                                })}
                                {isPlayerInTop ? undefined : (
                                    <>
                                        {topEntries.length > 0 ? (
                                            <tr className='solo-lb-row solo-lb-row-gap'>
                                                <td
                                                    className='solo-lb-ellipsis'
                                                    colSpan={3}
                                                >
                                                    &#8942;
                                                </td>
                                            </tr>
                                        ) : undefined}
                                        <tr className='solo-lb-row solo-lb-row-me'>
                                            <td className='solo-lb-col-rank'>
                                                <span className='solo-lb-rank'>
                                                    &#8212;
                                                </span>
                                            </td>
                                            <td className='solo-lb-col-name'>
                                                <span className='solo-lb-name'>
                                                    {displayName}
                                                </span>
                                            </td>
                                            <td className='solo-lb-col-score'>
                                                <span className='solo-lb-score'>
                                                    {playerScore}
                                                </span>
                                            </td>
                                        </tr>
                                    </>
                                )}
                            </tbody>
                        </table>
                    </div>

                    <ActionButton
                        className='solo-pregame-start-btn'
                        onClick={onStart}
                        variant='primary'
                    >
                        {uiText.go}
                    </ActionButton>
                </div>
            </section>
        </main>
    );
}
