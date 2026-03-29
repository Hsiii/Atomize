import { useEffect, useState } from 'react';
import type { JSX, SyntheticEvent } from 'react';
import { CircleUserRound, Loader2 } from 'lucide-react';

import { uiText } from '../../app-state';
import { ActionButton } from '../game/ui/ActionButton';
import { BackButton } from '../ui/BackButton';
import { supabaseAuthClient } from '../../lib/supabase';
import { loadBestScore } from '../../lib/app-helpers';

import './AccountScreen.css';
import './SoloPregameScreen.css';
import '../game/ui/ScoreDialog.css';

type AccountScreenProps = {
    playerName: string;
    userId: string;
    onEditName: (name: string) => Promise<string | undefined>;
    onLogout: () => void;
    onBack: () => void;
};

type AccountStatus = {
    tone: 'error' | 'success';
    message: string;
};

type ProfileStats = {
    games_played: number;
    wins: number;
    losses: number;
    max_combo: number;
    high_score: number;
};

export function AccountScreen({
    playerName,
    userId,
    onEditName,
    onLogout,
    onBack,
}: AccountScreenProps): JSX.Element {
    const [editingName, setEditingName] = useState(playerName);
    const [isEditing, setIsEditing] = useState(false);
    const [saving, setSaving] = useState(false);
    const [status, setStatus] = useState<AccountStatus | undefined>(undefined);

    const [stats, setStats] = useState<ProfileStats | undefined>(undefined);
    const [loadingStats, setLoadingStats] = useState(true);

    useEffect(() => {
        let mounted = true;

        async function fetchStats() {
            if (!supabaseAuthClient) {
                if (mounted) {
                    setLoadingStats(false);
                }
                return;
            }

            try {
                const { data, error } = await supabaseAuthClient
                    .from('combo_leaderboard')
                    .select('games_played, wins, losses, max_combo, high_score')
                    .eq('user_id', userId)
                    .single();

                if (mounted && !error) {
                    setStats(data as ProfileStats);
                } else if (mounted) {
                    const localBest = loadBestScore();
                    setStats({
                        games_played: 0,
                        wins: 0,
                        losses: 0,
                        max_combo: localBest.maxCombo || 0,
                        high_score: localBest.score || 0,
                    });
                }
            } catch {
                if (mounted) {
                    setLoadingStats(false);
                }
            } finally {
                if (mounted) {
                    setLoadingStats(false);
                }
            }
        }

        Promise.resolve(fetchStats()).catch(() => undefined);

        return () => {
            mounted = false;
        };
    }, [userId]);

    function openEditDialog() {
        setEditingName(playerName);
        setStatus(undefined);
        setIsEditing(true);
    }

    function closeEditDialog() {
        setIsEditing(false);
        setStatus(undefined);
    }

    async function submitNameSave() {
        const trimmed = editingName.trim();

        if (!trimmed || trimmed === playerName) {
            closeEditDialog();
            return;
        }

        setStatus(undefined);
        setSaving(true);

        const nextError = await onEditName(trimmed);

        setSaving(false);

        if (nextError) {
            setStatus({ message: nextError, tone: 'error' });
            return;
        }

        setStatus({ message: uiText.nameSaved, tone: 'success' });
        setIsEditing(false);
    }

    function handleSubmit(event: SyntheticEvent<HTMLFormElement>) {
        event.preventDefault();
        Promise.resolve(submitNameSave()).catch(() => undefined);
    }

    const winRate =
        stats && stats.games_played > 0
            ? Math.round((stats.wins / stats.games_played) * 100)
            : 0;

    let statsContent: JSX.Element;

    if (loadingStats) {
        statsContent = (
            <div className='account-stats-loading'>
                <Loader2 size={32} />
            </div>
        );
    } else if (stats) {
        statsContent = (
            <div className='solo-pregame-pb account-stats-centered'>
                <div className='solo-pregame-pb-stat'>
                    <span className='solo-pregame-pb-label'>
                        {uiText.winRate}
                    </span>
                    <span className='solo-pregame-pb-value'>{winRate}%</span>
                </div>
                <div className='solo-pregame-pb-stat'>
                    <span className='solo-pregame-pb-label'>
                        {uiText.gamesPlayed}
                    </span>
                    <span className='solo-pregame-pb-value'>
                        {stats.games_played}
                    </span>
                </div>
                <div className='solo-pregame-pb-stat'>
                    <span className='solo-pregame-pb-label'>
                        {uiText.highScore}
                    </span>
                    <span className='solo-pregame-pb-value'>
                        {stats.high_score}
                    </span>
                </div>
                <div className='solo-pregame-pb-stat'>
                    <span className='solo-pregame-pb-label'>
                        {uiText.maxCombo}
                    </span>
                    <span className='solo-pregame-pb-value'>
                        {stats.max_combo}
                    </span>
                </div>
            </div>
        );
    } else {
        statsContent = (
            <p className='account-page-error'>Could not load stats.</p>
        );
    }

    return (
        <main className='app-shell fullscreen-shell account-page-shell'>
            <section className='screen account-page-screen'>
                <header className='page-header-band'>
                    <div className='page-title-row'>
                        <BackButton onBack={onBack} />
                        <h1 className='page-title'>{uiText.accountTitle}</h1>
                    </div>
                    <CircleUserRound
                        className='page-hero-icon'
                        strokeWidth={2}
                    />

                    <div className='account-page-name-display'>
                        <button
                            className='account-name-badge'
                            onClick={openEditDialog}
                            type='button'
                        >
                            {playerName}
                        </button>
                    </div>
                </header>

                <div className='account-page-body'>
                    <div className='account-stats-container'>
                        {statsContent}
                    </div>

                    <section className='account-page-section account-page-logout-section'>
                        <div
                            aria-hidden='true'
                            className='account-page-divider'
                        />

                        <ActionButton
                            className='account-page-primary-action'
                            onClick={onLogout}
                            variant='danger'
                        >
                            {uiText.logout}
                        </ActionButton>
                    </section>
                </div>
            </section>

            {isEditing ? (
                <div
                    className='score-dialog-scrim'
                    onClick={(e) => {
                        if (e.target === e.currentTarget) {
                            closeEditDialog();
                        }
                    }}
                    role='presentation'
                >
                    <section
                        aria-labelledby='edit-name-title'
                        aria-modal='true'
                        className='score-dialog'
                        role='dialog'
                    >
                        <header className='score-dialog-header'>
                            <span
                                className='score-dialog-title'
                                id='edit-name-title'
                            >
                                {uiText.editName}
                            </span>
                        </header>

                        <form
                            className='account-edit-dialog-body'
                            onSubmit={handleSubmit}
                        >
                            <input
                                autoCapitalize='words'
                                autoComplete='nickname'
                                autoFocus
                                className='account-page-input'
                                disabled={saving}
                                maxLength={8}
                                onChange={(event) => {
                                    setEditingName(event.target.value);
                                }}
                                placeholder={uiText.namePlaceholder}
                                value={editingName}
                            />

                            {status ? (
                                <p
                                    aria-live='polite'
                                    className={`account-page-status account-page-status-${status.tone}`}
                                >
                                    {status.message}
                                </p>
                            ) : undefined}

                            <div className='score-dialog-actions'>
                                <ActionButton
                                    onClick={closeEditDialog}
                                    variant='secondary'
                                >
                                    {uiText.cancel}
                                </ActionButton>
                                <ActionButton
                                    disabled={saving}
                                    onClick={() => {
                                        Promise.resolve(
                                            submitNameSave()
                                        ).catch(() => undefined);
                                    }}
                                    variant='primary'
                                >
                                    {saving ? (
                                        <Loader2 size={20} />
                                    ) : (
                                        uiText.saveName
                                    )}
                                </ActionButton>
                            </div>
                        </form>
                    </section>
                </div>
            ) : undefined}
        </main>
    );
}
