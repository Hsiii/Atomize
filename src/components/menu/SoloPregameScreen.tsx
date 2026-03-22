import type { JSX } from 'react';

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
                <header className='solo-pregame-header-band'>
                    <BackButton onBack={onBack} />
                    <h1 className='solo-pregame-title'>{uiText.soloTitle}</h1>
                </header>

                <div className='solo-pregame-desc'>
                    <p className='solo-pregame-desc-text'>{uiText.soloGoal}</p>
                </div>

                <div className='solo-pregame-body'>
                    <h2 className='solo-pregame-lb-label'>
                        {uiText.soloLeaderboard}
                    </h2>
                    <table className='solo-pregame-lb-table'>
                        <thead>
                            <tr>
                                <th className='col-rank'>{uiText.rank}</th>
                                <th className='col-player'>{uiText.player}</th>
                                <th className='col-score'>{uiText.score}</th>
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
                                        <td className='col-rank'>
                                            <span className='solo-lb-rank'>
                                                #{idx + 1}
                                            </span>
                                        </td>
                                        <td className='col-player'>
                                            <span className='solo-lb-name'>
                                                {entry.player_name}
                                            </span>
                                        </td>
                                        <td className='col-score'>
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
                                        <td className='col-rank'>
                                            <span className='solo-lb-rank'>
                                                &#8212;
                                            </span>
                                        </td>
                                        <td className='col-player'>
                                            <span className='solo-lb-name'>
                                                {displayName}
                                            </span>
                                        </td>
                                        <td className='col-score'>
                                            <span className='solo-lb-score'>
                                                {playerScore}
                                            </span>
                                        </td>
                                    </tr>
                                </>
                            )}
                        </tbody>
                    </table>

                    <div className='solo-pregame-divider' />

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
