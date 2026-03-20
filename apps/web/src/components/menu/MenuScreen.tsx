import { useEffect, useState } from 'react';
import type { JSX } from 'react';
import { Plus, User, X } from 'lucide-react';

import type { OnlineLobbyUser } from '../../app-state';
import { uiText } from '../../app-state';

import { ActionButton } from '../game/ui/ActionButton';

import './MenuScreen.css';

type MenuScreenProps = {
    playerName: string;
    opponentName: string | null;
    isInRoom: boolean;
    isCurrentPlayerReady: boolean;
    isOpponentReady: boolean;
    multiplayerCountdownValue: number | null;
    onlineUsers: OnlineLobbyUser[];
    toastMessage: string | null;
    toastId: number;
    onStartSoloGame: () => void;
    onInvitePlayer: (targetPlayerId: string) => void;
    onPrefetchInviteUsers: () => void;
    onToggleReady: () => void;
    onEditName: (name: string) => void;
    pendingInvitation: { fromName: string; roomCode: string } | null;
    onAcceptInvitation: () => void;
    onDeclineInvitation: () => void;
};

export function MenuScreen({
    playerName,
    opponentName,
    isInRoom,
    isCurrentPlayerReady,
    isOpponentReady,
    multiplayerCountdownValue,
    onlineUsers,
    toastMessage,
    toastId,
    onStartSoloGame,
    onInvitePlayer,
    onPrefetchInviteUsers,
    onToggleReady,
    onEditName,
    pendingInvitation,
    onAcceptInvitation,
    onDeclineInvitation,
}: MenuScreenProps): JSX.Element {
    const [showInviteDialog, setShowInviteDialog] = useState(false);
    const [showProfileDialog, setShowProfileDialog] = useState(false);
    const [invitedIds, setInvitedIds] = useState<Set<string>>(new Set());
    const [editingName, setEditingName] = useState(playerName);
    const [visibleToast, setVisibleToast] = useState<string | undefined>(
        undefined
    );

    useEffect(() => {
        if (!toastMessage) {
            setVisibleToast(undefined);
            return undefined;
        }

        setVisibleToast(toastMessage);

        const timer = globalThis.setTimeout(
            (nextValue: undefined) => {
                setVisibleToast(nextValue);
            },
            2200,
            undefined
        );

        return () => {
            globalThis.clearTimeout(timer);
        };
    }, [toastId, toastMessage]);

    const hasOpponent = Boolean(opponentName);
    const isGuest = playerName === uiText.guest;
    const initials = playerName.slice(0, 1).toUpperCase();
    const opponentInitials = (opponentName ?? '').slice(0, 1).toUpperCase();
    const shouldShowReadyAction = isInRoom && hasOpponent;
    const shouldShowSoloStart = !shouldShowReadyAction && !isInRoom;
    const isMultiplayerCountdown = multiplayerCountdownValue !== null;
    const showCurrentReadyBadge = hasOpponent && isCurrentPlayerReady;
    const showOpponentReadyBadge = hasOpponent && isOpponentReady;
    let readyButtonLabel: string = isCurrentPlayerReady
        ? uiText.cancelReady
        : uiText.ready;

    if (isMultiplayerCountdown && isCurrentPlayerReady) {
        readyButtonLabel = `${uiText.cancelReady} (${String(multiplayerCountdownValue)})`;
    }

    useEffect(() => {
        if (!hasOpponent) {
            return;
        }

        setShowInviteDialog(false);
    }, [hasOpponent]);

    function handleProfileSave() {
        const trimmed = editingName.trim();

        if (trimmed) {
            onEditName(trimmed);
        }

        setShowProfileDialog(false);
    }

    function handleInvite(targetPlayerId: string) {
        onInvitePlayer(targetPlayerId);
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

    return (
        <main className='app-shell fullscreen-shell'>
            <section className='screen screen-menu'>
                <div className='menu-layout'>
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
                                <button
                                    className='slot-circle slot-p1'
                                    onClick={() => {
                                        setEditingName(playerName);
                                        setShowProfileDialog(true);
                                    }}
                                    type='button'
                                >
                                    {isGuest ? (
                                        <User className='slot-user-icon' />
                                    ) : (
                                        <span className='slot-initials'>
                                            {initials}
                                        </span>
                                    )}
                                </button>
                                <span className='slot-name'>{playerName}</span>
                                <span
                                    className={`slot-ready-badge${showCurrentReadyBadge ? ' slot-ready-badge-on' : ' slot-ready-badge-placeholder'}`}
                                >
                                    {uiText.ready}
                                </span>
                            </div>

                            {hasOpponent ? (
                                <div className='menu-slot-column'>
                                    <div className='slot-circle slot-p2-filled'>
                                        <span className='slot-initials'>
                                            {opponentInitials}
                                        </span>
                                    </div>
                                    <span className='slot-name'>
                                        {opponentName}
                                    </span>
                                    <span
                                        className={`slot-ready-badge${showOpponentReadyBadge ? ' slot-ready-badge-on' : ' slot-ready-badge-placeholder'}`}
                                    >
                                        {uiText.ready}
                                    </span>
                                </div>
                            ) : (
                                <div className='menu-slot-column'>
                                    <button
                                        className='slot-circle slot-p2-empty'
                                        onClick={() => {
                                            handleOpenInviteDialog();
                                        }}
                                        onFocus={onPrefetchInviteUsers}
                                        onPointerDown={onPrefetchInviteUsers}
                                        onPointerEnter={onPrefetchInviteUsers}
                                        type='button'
                                    >
                                        <Plus className='slot-plus-icon' />
                                    </button>
                                    <span className='slot-ready-badge slot-ready-badge-placeholder'>
                                        {uiText.ready}
                                    </span>
                                </div>
                            )}
                        </div>

                        {isInRoom && !hasOpponent ? (
                            <div className='menu-room-hint-block'>
                                <span className='menu-room-hint'>
                                    {uiText.waitingForPlayer}
                                </span>
                            </div>
                        ) : undefined}

                        {shouldShowReadyAction ? (
                            <ActionButton
                                className='menu-start-btn'
                                onClick={onToggleReady}
                                variant='primary'
                            >
                                {readyButtonLabel}
                            </ActionButton>
                        ) : undefined}

                        {shouldShowSoloStart ? (
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
                                    maxLength={24}
                                    onChange={(event) => {
                                        setEditingName(event.target.value);
                                    }}
                                    onKeyDown={(event) => {
                                        if (event.key === 'Enter') {
                                            handleProfileSave();
                                        }
                                    }}
                                    placeholder={uiText.namePlaceholder}
                                    value={editingName}
                                />
                            </div>
                            <div className='dialog-actions'>
                                <ActionButton
                                    onClick={handleProfileSave}
                                    variant='primary'
                                >
                                    {uiText.saveName}
                                </ActionButton>
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
                                {onlineUsers.length === 0 ? (
                                    <p className='invite-empty'>
                                        {uiText.noOnlinePlayers}
                                    </p>
                                ) : (
                                    <ul className='invite-list'>
                                        {onlineUsers.map((user) => {
                                            const isUserInGame =
                                                user.status === 'in-game';
                                            const isInvited =
                                                invitedIds.has(user.playerId);
                                            const isDisabled =
                                                isUserInGame || isInvited;
                                            let inviteButtonLabel: string =
                                                uiText.inviteButton;

                                            if (isUserInGame) {
                                                inviteButtonLabel =
                                                    uiText.inGame;
                                            } else if (isInvited) {
                                                inviteButtonLabel =
                                                    uiText.invited;
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
                                )}
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
                                    variant='secondary'
                                >
                                    {uiText.decline}
                                </ActionButton>
                                <ActionButton
                                    onClick={onAcceptInvitation}
                                    variant='primary'
                                >
                                    {uiText.accept}
                                </ActionButton>
                            </div>
                        </div>
                    </div>
                ) : undefined}
            </section>
        </main>
    );
}
