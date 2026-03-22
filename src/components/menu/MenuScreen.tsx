import { useEffect, useRef, useState } from 'react';
import type { JSX } from 'react';
import { Check, Crown, Plus, User, X } from 'lucide-react';

import type { OnlineLobbyUser } from '../../app-state';
import { uiText } from '../../app-state';
import { loadBestScore } from '../../lib/app-helpers';
import { supabaseAuthClient } from '../../lib/supabase';
import { ActionButton } from '../game/ui/ActionButton';

import './MenuScreen.css';

type MenuScreenProps = {
    playerName: string;
    opponentName: string | undefined;
    isCpuOpponent?: boolean;
    isInRoom: boolean;
    isCurrentPlayerReady: boolean;
    isOpponentReady: boolean;
    onlineUsers: OnlineLobbyUser[];
    toastMessage: string | undefined;
    toastId: number;
    onStartSoloGame: () => void;
    onStartCpuGame: () => void | Promise<void>;
    onInvitePlayer: (targetPlayerId: string) => void | Promise<void>;
    onPrefetchInviteUsers: () => void;
    onToggleReady: () => void | Promise<void>;
    pendingInvitation: { fromName: string; roomCode: string } | undefined;
    onAcceptInvitation: () => void | Promise<void>;
    onDeclineInvitation: () => void;
    onOpenAuth: () => void;
    onOpenAccount: () => void;
    isGuest: boolean;
};

export function MenuScreen({
    playerName,
    opponentName,
    isCpuOpponent = false,
    isInRoom,
    isCurrentPlayerReady,
    isOpponentReady,
    onlineUsers,
    toastMessage,
    toastId,
    onStartSoloGame,
    onStartCpuGame,
    onInvitePlayer,
    onPrefetchInviteUsers,
    onToggleReady,
    pendingInvitation,
    onAcceptInvitation,
    onDeclineInvitation,
    onOpenAuth,
    onOpenAccount,
    isGuest,
}: MenuScreenProps): JSX.Element {
    const [showInviteDialog, setShowInviteDialog] = useState(false);
    const [showLeaderboardDialog, setShowLeaderboardDialog] = useState(false);
    const [leaderboardData, setLeaderboardData] = useState<
        Array<{ player_name: string; max_combo: number }>
    >([]);
    const [loadingLeaderboard, setLoadingLeaderboard] = useState(false);
    const [invitedIds, setInvitedIds] = useState<Set<string>>(new Set());
    const [visibleToast, setVisibleToast] = useState<string | undefined>(
        undefined
    );
    const toastTimeoutRef = useRef<
        ReturnType<typeof globalThis.setTimeout> | undefined
    >(undefined);
    const leaderboardRequestRef = useRef<Promise<void> | undefined>(undefined);

    useEffect(() => {
        if (!toastMessage) {
            return undefined;
        }

        showMenuToast(toastMessage);
        return undefined;
    }, [toastId, toastMessage]);

    useEffect(
        () => () => {
            if (toastTimeoutRef.current !== undefined) {
                globalThis.clearTimeout(toastTimeoutRef.current);
            }
        },
        []
    );

    const hasOpponent = Boolean(opponentName);
    const isCurrentPlayerGuest = !playerName.trim();
    const isOpponentGuest = !opponentName?.trim();
    const displayPlayerName = isCurrentPlayerGuest ? uiText.guest : playerName;
    const displayOpponentName = isOpponentGuest
        ? uiText.guest
        : (opponentName ?? '');
    const initials = playerName.slice(0, 1).toUpperCase();
    const opponentInitials = (opponentName ?? '').slice(0, 1).toUpperCase();
    const shouldShowReadyAction = isInRoom && hasOpponent;
    const shouldShowStartAction = !shouldShowReadyAction;
    const showCurrentReadyIndicator = hasOpponent && isCurrentPlayerReady;
    const showOpponentReadyIndicator = hasOpponent && isOpponentReady;
    const readyButtonClassName = `menu-start-btn${isCurrentPlayerReady ? ' menu-start-btn-ready' : ''}`;
    const readyButtonLabel = uiText.ready;

    useEffect(() => {
        if (!hasOpponent) {
            return;
        }

        setShowInviteDialog(false);
    }, [hasOpponent]);

    useEffect(() => {
        if (!isInRoom) {
            setInvitedIds(new Set());
        }
    }, [isInRoom]);

    function showMenuToast(message: string) {
        if (toastTimeoutRef.current !== undefined) {
            globalThis.clearTimeout(toastTimeoutRef.current);
        }

        setVisibleToast(message);
        toastTimeoutRef.current = globalThis.setTimeout(
            (nextValue: undefined) => {
                setVisibleToast(nextValue);
                toastTimeoutRef.current = undefined;
            },
            2200,
            undefined
        );
    }

    function handleInvite(targetPlayerId: string) {
        detachAction(onInvitePlayer(targetPlayerId));
        setInvitedIds((prev: ReadonlySet<string>) => {
            const nextInvitedIds = new Set(prev);

            nextInvitedIds.add(targetPlayerId);
            return nextInvitedIds;
        });
    }

    function handleOpenInviteDialog() {
        onPrefetchInviteUsers();
        setShowInviteDialog(true);
    }

    function handleStartCpuGame() {
        setShowInviteDialog(false);
        detachAction(onStartCpuGame());
    }

    async function loadLeaderboard() {
        if (leaderboardRequestRef.current) {
            await leaderboardRequestRef.current;
            return;
        }

        setLoadingLeaderboard(true);

        const fallbackToLocal = () => {
            const localBest = loadBestScore();
            if (localBest.maxCombo > 0) {
                setLeaderboardData([
                    {
                        player_name: playerName || uiText.guest,
                        max_combo: localBest.maxCombo,
                    },
                ]);
            }
            setLoadingLeaderboard(false);
        };

        const client = supabaseAuthClient;
        if (!client) {
            fallbackToLocal();
            return;
        }

        const request = (async () => {
            try {
                const response = await client
                    .from('combo_leaderboard')
                    .select('player_name, max_combo')
                    .order('max_combo', { ascending: false })
                    .limit(10);

                const data = response.data as Array<{
                    player_name: string;
                    max_combo: number;
                }> | null;
                const { error } = response;

                if (!error && (data?.length ?? 0) > 0) {
                    setLeaderboardData(data ?? []);
                    setLoadingLeaderboard(false);
                    return;
                }

                fallbackToLocal();
            } catch {
                fallbackToLocal();
            } finally {
                leaderboardRequestRef.current = undefined;
            }
        })();

        leaderboardRequestRef.current = request;
        await request;
    }

    useEffect(() => {
        if (showLeaderboardDialog || leaderboardData.length > 0) {
            return;
        }

        detachAction(loadLeaderboard());
    }, [leaderboardData.length, showLeaderboardDialog]);

    function handleOpenLeaderboardDialog() {
        setShowLeaderboardDialog(true);
        if (leaderboardData.length === 0 && !leaderboardRequestRef.current) {
            detachAction(loadLeaderboard());
        }
    }

    return (
        <main className='app-shell fullscreen-shell'>
            <section className='screen screen-menu'>
                <div className='menu-layout'>
                    <div className='menu-top-right-actions'>
                        <button
                            className='icon-action-btn'
                            onClick={handleOpenLeaderboardDialog}
                            title={uiText.leaderboardTitle}
                            type='button'
                        >
                            <Crown size={24} />
                        </button>
                        <button
                            className='icon-action-btn'
                            onClick={() => {
                                if (isGuest) {
                                    onOpenAuth();
                                    return;
                                }

                                onOpenAccount();
                            }}
                            title={
                                isGuest ? uiText.signIn : uiText.accountTitle
                            }
                            type='button'
                        >
                            <User size={24} />
                        </button>
                    </div>
                    <div className='menu-title-orb' />
                    <h1 className='hero-title'>
                        <span>{uiText.titleLead}</span>
                        <span
                            aria-hidden='true'
                            className='hero-title-filled-o'
                        />
                        <span>{uiText.titleTail}</span>
                    </h1>

                    <div className='menu-content'>
                        <div className='menu-slots'>
                            <div className='menu-slot-column'>
                                <div className='slot-circle-shell'>
                                    <button
                                        className='slot-circle slot-p1'
                                        onClick={() => {
                                            if (isGuest) {
                                                onOpenAuth();
                                                return;
                                            }

                                            onOpenAccount();
                                        }}
                                        type='button'
                                    >
                                        {isCurrentPlayerGuest ? (
                                            <span className='slot-guest-dot' />
                                        ) : (
                                            <span className='slot-initials'>
                                                {initials}
                                            </span>
                                        )}
                                    </button>
                                    {showCurrentReadyIndicator ? (
                                        <span
                                            aria-hidden='true'
                                            className='slot-status-indicator'
                                        >
                                            <Check className='slot-status-check' />
                                        </span>
                                    ) : undefined}
                                </div>
                                <span className='slot-name'>
                                    {displayPlayerName}
                                </span>
                            </div>

                            {hasOpponent ? (
                                <div className='menu-slot-column'>
                                    <div className='slot-circle-shell'>
                                        <div className='slot-circle slot-p2-filled'>
                                            {isOpponentGuest ? (
                                                <span className='slot-guest-dot' />
                                            ) : (
                                                <span className='slot-initials'>
                                                    {opponentInitials}
                                                </span>
                                            )}
                                        </div>
                                        {showOpponentReadyIndicator ? (
                                            <span
                                                aria-hidden='true'
                                                className='slot-status-indicator'
                                            >
                                                <Check className='slot-status-check' />
                                            </span>
                                        ) : undefined}
                                    </div>
                                    <span
                                        className={`slot-name${isCpuOpponent ? ' slot-name-cpu' : ''}`}
                                    >
                                        {displayOpponentName}
                                    </span>
                                </div>
                            ) : (
                                <div className='menu-slot-column'>
                                    <div className='slot-circle-shell'>
                                        <button
                                            className={`slot-circle slot-p2-empty${isInRoom ? ' slot-p2-empty-waiting' : ''}`}
                                            onClick={() => {
                                                handleOpenInviteDialog();
                                            }}
                                            onFocus={onPrefetchInviteUsers}
                                            onPointerDown={
                                                onPrefetchInviteUsers
                                            }
                                            onPointerEnter={
                                                onPrefetchInviteUsers
                                            }
                                            type='button'
                                        >
                                            <Plus className='slot-plus-icon' />
                                        </button>
                                    </div>
                                    {isInRoom ? (
                                        <span className='slot-name'>
                                            {uiText.waitingShort}
                                        </span>
                                    ) : undefined}
                                </div>
                            )}
                        </div>

                        {shouldShowReadyAction ? (
                            <ActionButton
                                aria-pressed={isCurrentPlayerReady}
                                className={readyButtonClassName}
                                onClick={() => {
                                    detachAction(onToggleReady());
                                }}
                                variant='primary'
                            >
                                {readyButtonLabel}
                            </ActionButton>
                        ) : undefined}
                        {shouldShowStartAction ? (
                            <ActionButton
                                className='menu-start-btn'
                                onClick={onStartSoloGame}
                                variant='primary'
                            >
                                {uiText.start}
                            </ActionButton>
                        ) : undefined}
                    </div>
                </div>

                {visibleToast ? (
                    <div aria-live='polite' className='menu-toast-layer'>
                        <div className='menu-toast'>{visibleToast}</div>
                    </div>
                ) : undefined}

                {showInviteDialog ? (
                    <div
                        className='dialog-scrim'
                        onClick={() => {
                            setShowInviteDialog(false);
                        }}
                        role='presentation'
                    >
                        <div
                            className='dialog-panel dialog-invite'
                            onClick={(event) => {
                                event.stopPropagation();
                            }}
                            role='dialog'
                        >
                            <header className='dialog-header'>
                                <span className='dialog-title'>
                                    {uiText.inviteTitle}
                                </span>
                                <button
                                    className='dialog-close'
                                    onClick={() => {
                                        setShowInviteDialog(false);
                                    }}
                                    type='button'
                                >
                                    <X size={18} />
                                </button>
                            </header>
                            <div className='dialog-body'>
                                <ul className='invite-list'>
                                    <li className='invite-row'>
                                        <span className='invite-name invite-name-cpu'>
                                            {uiText.cpu}
                                        </span>
                                        <button
                                            className='invite-btn'
                                            onClick={handleStartCpuGame}
                                            type='button'
                                        >
                                            {uiText.inviteButton}
                                        </button>
                                    </li>

                                    {onlineUsers.map((user) => {
                                        const isUserInGame =
                                            user.status === 'in-game';
                                        const isUserInTeam =
                                            user.status === 'in-team';
                                        const isInvited = invitedIds.has(
                                            user.playerId
                                        );
                                        const isDisabled =
                                            isUserInGame ||
                                            isUserInTeam ||
                                            isInvited;
                                        let inviteButtonLabel: string =
                                            uiText.inviteButton;

                                        if (isUserInGame) {
                                            inviteButtonLabel = uiText.inGame;
                                        } else if (isUserInTeam) {
                                            inviteButtonLabel = uiText.inTeam;
                                        } else if (isInvited) {
                                            inviteButtonLabel = uiText.invited;
                                        }

                                        return (
                                            <li
                                                className='invite-row'
                                                key={user.playerId}
                                            >
                                                <span className='invite-name'>
                                                    {user.name}
                                                </span>
                                                <button
                                                    className={`invite-btn${isDisabled ? ' invite-btn-disabled' : ''}`}
                                                    disabled={isDisabled}
                                                    onClick={() => {
                                                        handleInvite(
                                                            user.playerId
                                                        );
                                                    }}
                                                    type='button'
                                                >
                                                    {inviteButtonLabel}
                                                </button>
                                            </li>
                                        );
                                    })}
                                </ul>
                            </div>
                        </div>
                    </div>
                ) : undefined}
                {pendingInvitation ? (
                    <div className='dialog-scrim' role='presentation'>
                        <div
                            className='dialog-panel dialog-invitation'
                            role='alertdialog'
                        >
                            <div className='dialog-body invitation-body'>
                                <p className='invitation-text'>
                                    <strong>
                                        {pendingInvitation.fromName}
                                    </strong>{' '}
                                    {uiText.inviteReceived}
                                </p>
                            </div>
                            <div className='dialog-actions invitation-actions'>
                                <ActionButton
                                    onClick={onDeclineInvitation}
                                    variant='danger'
                                >
                                    {uiText.decline}
                                </ActionButton>
                                <ActionButton
                                    onClick={() => {
                                        detachAction(onAcceptInvitation());
                                    }}
                                    variant='primary'
                                >
                                    {uiText.accept}
                                </ActionButton>
                            </div>
                        </div>
                    </div>
                ) : undefined}

                {showLeaderboardDialog ? (
                    <div
                        className='dialog-scrim'
                        onClick={() => {
                            setShowLeaderboardDialog(false);
                        }}
                        role='presentation'
                    >
                        <div
                            className='dialog-panel dialog-invite dialog-leaderboard'
                            onClick={(event) => {
                                event.stopPropagation();
                            }}
                            role='dialog'
                        >
                            <header className='dialog-header'>
                                <span className='dialog-title'>
                                    {uiText.leaderboardTitle}
                                </span>
                                <button
                                    className='dialog-close'
                                    onClick={() => {
                                        setShowLeaderboardDialog(false);
                                    }}
                                    type='button'
                                >
                                    <X size={18} />
                                </button>
                            </header>
                            <div className='dialog-body'>
                                {loadingLeaderboard && (
                                    <p className='invite-empty'>
                                        {uiText.waitingShort}
                                    </p>
                                )}
                                {!loadingLeaderboard &&
                                    leaderboardData.length > 0 && (
                                        <table className='leaderboard-table'>
                                            <thead>
                                                <tr>
                                                    <th className='col-rank'>
                                                        {uiText.rank}
                                                    </th>
                                                    <th className='col-player'>
                                                        {uiText.player}
                                                    </th>
                                                    <th className='col-combo'>
                                                        {uiText.highestCombo}
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {leaderboardData.map(
                                                    (entry, idx) => {
                                                        const rowClassName =
                                                            idx === 0
                                                                ? 'leaderboard-row leaderboard-row-first'
                                                                : 'leaderboard-row';

                                                        return (
                                                            <tr
                                                                className={
                                                                    rowClassName
                                                                }
                                                                key={`${entry.player_name}-${entry.max_combo}-${idx}`}
                                                            >
                                                                <td className='col-rank'>
                                                                    <span className='leaderboard-rank-badge'>
                                                                        #
                                                                        {idx +
                                                                            1}
                                                                    </span>
                                                                </td>
                                                                <td className='col-player'>
                                                                    <span className='leaderboard-player-name'>
                                                                        {
                                                                            entry.player_name
                                                                        }
                                                                    </span>
                                                                </td>
                                                                <td className='col-combo'>
                                                                    <span className='leaderboard-combo-value'>
                                                                        {
                                                                            entry.max_combo
                                                                        }
                                                                    </span>
                                                                </td>
                                                            </tr>
                                                        );
                                                    }
                                                )}
                                            </tbody>
                                        </table>
                                    )}
                                {!loadingLeaderboard &&
                                    leaderboardData.length === 0 && (
                                        <p className='invite-empty'>
                                            {uiText.leaderboardEmpty}
                                        </p>
                                    )}
                            </div>
                        </div>
                    </div>
                ) : undefined}
            </section>
        </main>
    );
}

function detachAction(result: void | Promise<void>) {
    Promise.resolve(result).catch(() => undefined);
}
