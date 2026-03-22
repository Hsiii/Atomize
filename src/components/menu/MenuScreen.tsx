import { useEffect, useRef, useState } from 'react';
import type { JSX } from 'react';
import { Check, Crown, Lock, Mail, Plus, User, X } from 'lucide-react';

import type { OnlineLobbyUser } from '../../app-state';
import { uiText } from '../../app-state';
import { loadBestScore } from '../../lib/app-helpers';
import {
    startEmailSignIn,
    startGooglePopupSignIn,
    supabaseAuthClient,
} from '../../lib/supabase';
import { ActionButton } from '../game/ui/ActionButton';

import './MenuScreen.css';

function GoogleMark(): JSX.Element {
    return (
        <svg
            aria-hidden='true'
            className='auth-google-mark'
            viewBox='0 0 24 24'
        >
            <path
                d='M21.81 12.23c0-.72-.06-1.25-.19-1.8H12.2v3.56h5.53c-.11.88-.72 2.2-2.07 3.09l-.02.12 3 2.28.21.02c1.91-1.73 2.96-4.27 2.96-7.27Z'
                fill='#4285F4'
            />
            <path
                d='M12.2 21.88c2.71 0 4.98-.87 6.64-2.37l-3.19-2.42c-.85.58-1.99.99-3.45.99-2.65 0-4.89-1.73-5.69-4.12l-.12.01-3.12 2.37-.04.11c1.65 3.2 5.04 5.43 8.97 5.43Z'
                fill='#34A853'
            />
            <path
                d='M6.51 13.96a5.8 5.8 0 0 1-.33-1.94c0-.67.12-1.31.31-1.94l-.01-.13-3.16-2.41-.1.04A9.78 9.78 0 0 0 2.17 12c0 1.56.37 3.03 1.05 4.42l3.29-2.46Z'
                fill='#FBBC05'
            />
            <path
                d='M12.2 5.92c1.84 0 3.08.78 3.79 1.43l2.77-2.65C17.17 3.25 14.91 2.12 12.2 2.12c-3.93 0-7.32 2.23-8.97 5.43l3.27 2.49c.82-2.39 3.06-4.12 5.7-4.12Z'
                fill='#EA4335'
            />
        </svg>
    );
}

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
    onEditName: (name: string) => Promise<string | undefined>;
    pendingInvitation: { fromName: string; roomCode: string } | undefined;
    onAcceptInvitation: () => void | Promise<void>;
    onDeclineInvitation: () => void;
    onLogout: () => void;
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
    onEditName,
    pendingInvitation,
    onAcceptInvitation,
    onDeclineInvitation,
    onLogout,
    isGuest,
}: MenuScreenProps): JSX.Element {
    const [showInviteDialog, setShowInviteDialog] = useState(false);
    const [showProfileDialog, setShowProfileDialog] = useState(false);
    const [showUserMenuDialog, setShowUserMenuDialog] = useState(false);
    const [showAuthDialog, setShowAuthDialog] = useState(false);
    const [showLeaderboardDialog, setShowLeaderboardDialog] = useState(false);
    const [leaderboardData, setLeaderboardData] = useState<
        Array<{ player_name: string; max_combo: number }>
    >([]);
    const [loadingLeaderboard, setLoadingLeaderboard] = useState(false);
    const [invitedIds, setInvitedIds] = useState<Set<string>>(new Set());
    const [editingName, setEditingName] = useState(playerName);
    const [visibleToast, setVisibleToast] = useState<string | undefined>(
        undefined
    );
    const [authEmail, setAuthEmail] = useState('');
    const [authPassword, setAuthPassword] = useState('');
    const [authLoading, setAuthLoading] = useState(false);
    const [emailLoading, setEmailLoading] = useState(false);
    const [nameSaving, setNameSaving] = useState(false);
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

    useEffect(() => {
        setEditingName(playerName);
    }, [playerName]);

    useEffect(() => {
        if (isGuest) {
            return;
        }

        setAuthLoading(false);
        setEmailLoading(false);
        setShowAuthDialog(false);
    }, [isGuest]);

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

    async function handleProfileSave() {
        const trimmed = editingName.trim();

        if (!trimmed) {
            setShowProfileDialog(false);
            return;
        }

        if (
            normalizeMenuPlayerName(trimmed) !==
                normalizeMenuPlayerName(playerName) &&
            isNameAlreadyUsed(trimmed)
        ) {
            showMenuToast(uiText.nameInUse);
            return;
        }

        setNameSaving(true);
        const nextError = await onEditName(trimmed);
        setNameSaving(false);

        if (nextError) {
            showMenuToast(nextError);
            return;
        }

        setShowProfileDialog(false);
    }

    function isNameAlreadyUsed(nextName: string): boolean {
        const nextNameKey = normalizeMenuPlayerName(nextName);
        const usedNames = [
            opponentName,
            ...onlineUsers.map((user) => user.name),
        ];

        return usedNames.some(
            (usedName) => normalizeMenuPlayerName(usedName) === nextNameKey
        );
    }

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

    function handleOpenProfileDialog() {
        setEditingName(playerName);
        setShowProfileDialog(true);
    }

    function handleOpenUserMenuDialog() {
        setShowUserMenuDialog(true);
    }

    function handleCloseUserMenuDialog() {
        setShowUserMenuDialog(false);
    }

    function handleOpenAuthDialog() {
        setAuthEmail('');
        setAuthPassword('');
        setShowAuthDialog(true);
    }

    function handleCloseAuthDialog() {
        setAuthLoading(false);
        setEmailLoading(false);
        setShowAuthDialog(false);
    }

    async function handleEmailLogin() {
        setEmailLoading(true);

        const nextError = await startEmailSignIn(authEmail, authPassword);

        setEmailLoading(false);

        if (nextError) {
            showMenuToast(nextError);
            return;
        }

        setShowAuthDialog(false);
    }

    async function handleGoogleLogin() {
        setAuthLoading(true);

        const nextError = await startGooglePopupSignIn();

        if (nextError) {
            showMenuToast(nextError);
            setAuthLoading(false);
            return;
        }

        setAuthLoading(false);
        setShowAuthDialog(false);
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
                                    handleOpenAuthDialog();
                                    return;
                                }

                                handleOpenUserMenuDialog();
                            }}
                            title={isGuest ? uiText.signIn : uiText.settings}
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
                                            handleOpenProfileDialog();
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

                {showProfileDialog ? (
                    <div
                        className='dialog-scrim'
                        onClick={() => {
                            setShowProfileDialog(false);
                        }}
                        role='presentation'
                    >
                        <div
                            className='dialog-panel'
                            onClick={(event) => {
                                event.stopPropagation();
                            }}
                            role='dialog'
                        >
                            <header className='dialog-header'>
                                <span className='dialog-title'>
                                    {uiText.editName}
                                </span>
                                <button
                                    className='dialog-close'
                                    onClick={() => {
                                        setShowProfileDialog(false);
                                    }}
                                    type='button'
                                >
                                    <X size={18} />
                                </button>
                            </header>
                            <div className='dialog-body'>
                                <input
                                    className='dialog-input'
                                    maxLength={8}
                                    onChange={(event) => {
                                        setEditingName(event.target.value);
                                    }}
                                    onKeyDown={(event) => {
                                        if (event.key === 'Enter') {
                                            detachAction(handleProfileSave());
                                        }
                                    }}
                                    placeholder={uiText.namePlaceholder}
                                    value={editingName}
                                />
                            </div>
                            <div className='dialog-actions'>
                                <ActionButton
                                    disabled={nameSaving}
                                    onClick={() => {
                                        detachAction(handleProfileSave());
                                    }}
                                    variant='primary'
                                >
                                    {nameSaving
                                        ? uiText.waitingShort
                                        : uiText.saveName}
                                </ActionButton>
                            </div>
                        </div>
                    </div>
                ) : undefined}

                {showUserMenuDialog ? (
                    <div
                        className='dialog-scrim'
                        onClick={handleCloseUserMenuDialog}
                        role='presentation'
                    >
                        <div
                            className='dialog-panel'
                            onClick={(event) => {
                                event.stopPropagation();
                            }}
                            role='dialog'
                        >
                            <header className='dialog-header'>
                                <span className='dialog-title'>
                                    {displayPlayerName}
                                </span>
                                <button
                                    className='dialog-close'
                                    onClick={handleCloseUserMenuDialog}
                                    type='button'
                                >
                                    <X size={18} />
                                </button>
                            </header>
                            <div className='dialog-actions dialog-actions-top'>
                                <ActionButton
                                    onClick={onLogout}
                                    variant='danger'
                                >
                                    {uiText.logout}
                                </ActionButton>
                            </div>
                        </div>
                    </div>
                ) : undefined}

                {showAuthDialog ? (
                    <div
                        className='dialog-scrim'
                        onClick={handleCloseAuthDialog}
                        role='presentation'
                    >
                        <div
                            className='dialog-panel'
                            onClick={(event) => {
                                event.stopPropagation();
                            }}
                            role='dialog'
                        >
                            <header className='dialog-header'>
                                <span className='dialog-title'>
                                    {uiText.signIn}
                                </span>
                                <button
                                    className='dialog-close'
                                    onClick={handleCloseAuthDialog}
                                    type='button'
                                >
                                    <X size={18} />
                                </button>
                            </header>
                            <div className='dialog-body auth-dialog-body'>
                                <div className='auth-section auth-email-block'>
                                    <span className='auth-section-title'>
                                        {uiText.withEmail}
                                    </span>
                                    <label className='auth-field'>
                                        <Mail
                                            aria-hidden='true'
                                            className='auth-field-icon'
                                        />
                                        <input
                                            autoCapitalize='none'
                                            autoComplete='email'
                                            className='dialog-input auth-field-input'
                                            inputMode='email'
                                            onChange={(event) => {
                                                setAuthEmail(
                                                    event.target.value
                                                );
                                            }}
                                            onKeyDown={(event) => {
                                                if (event.key === 'Enter') {
                                                    detachAction(
                                                        handleEmailLogin()
                                                    );
                                                }
                                            }}
                                            placeholder={
                                                uiText.emailPlaceholder
                                            }
                                            type='email'
                                            value={authEmail}
                                        />
                                    </label>
                                    <label className='auth-field'>
                                        <Lock
                                            aria-hidden='true'
                                            className='auth-field-icon'
                                        />
                                        <input
                                            autoComplete='current-password'
                                            className='dialog-input auth-field-input'
                                            onChange={(event) => {
                                                setAuthPassword(
                                                    event.target.value
                                                );
                                            }}
                                            onKeyDown={(event) => {
                                                if (event.key === 'Enter') {
                                                    detachAction(
                                                        handleEmailLogin()
                                                    );
                                                }
                                            }}
                                            placeholder={
                                                uiText.passwordPlaceholder
                                            }
                                            type='password'
                                            value={authPassword}
                                        />
                                    </label>
                                    <ActionButton
                                        disabled={emailLoading || authLoading}
                                        onClick={() => {
                                            detachAction(handleEmailLogin());
                                        }}
                                        variant='primary'
                                    >
                                        {emailLoading
                                            ? uiText.waitingShort
                                            : uiText.emailPasswordAction}
                                    </ActionButton>
                                </div>
                                <div className='auth-section auth-google-block'>
                                    <span className='auth-section-title'>
                                        {uiText.withGoogle}
                                    </span>
                                    <button
                                        aria-label={uiText.continueWithGoogle}
                                        className='auth-google-button'
                                        disabled={authLoading || emailLoading}
                                        onClick={() => {
                                            detachAction(handleGoogleLogin());
                                        }}
                                        type='button'
                                    >
                                        <span className='auth-google-button-content'>
                                            <GoogleMark />
                                        </span>
                                    </button>
                                </div>
                            </div>
                        </div>
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

                                {onlineUsers.length === 0 ? (
                                    <p className='invite-empty'>
                                        {uiText.noOnlinePlayers}
                                    </p>
                                ) : undefined}
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

function normalizeMenuPlayerName(value: string | undefined): string {
    return (value ?? '').trim().replaceAll(/\s+/g, ' ').toLowerCase();
}

function detachAction(result: void | Promise<void>) {
    Promise.resolve(result).catch(() => undefined);
}
