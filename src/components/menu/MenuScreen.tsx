import { useEffect, useState } from 'react';
import type { JSX } from 'react';
import { Check, Plus, X } from 'lucide-react';

import type { OnlineLobbyUser } from '../../app-state';
import { uiText } from '../../app-state';
import { isGuestName } from '../../lib/app-helpers';
import { ActionButton } from '../game/ui/ActionButton';

import './MenuScreen.css';

type MenuScreenProps = {
    playerName: string;
    opponentName: string | undefined;
    isInRoom: boolean;
    isCurrentPlayerReady: boolean;
    isOpponentReady: boolean;
    onlineUsers: OnlineLobbyUser[];
    toastMessage: string | undefined;
    toastId: number;
    onStartSoloGame: () => void;
    onInvitePlayer: (targetPlayerId: string) => void | Promise<void>;
    onPrefetchInviteUsers: () => void;
    onToggleReady: () => void | Promise<void>;
    onEditName: (name: string) => void;
    pendingInvitation: { fromName: string; roomCode: string } | undefined;
    onAcceptInvitation: () => void | Promise<void>;
    onDeclineInvitation: () => void;
};

export function MenuScreen({
    playerName,
    opponentName,
    isInRoom,
    isCurrentPlayerReady,
    isOpponentReady,
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
    const isCurrentPlayerGuest = isGuestName(playerName);
    const isOpponentGuest = isGuestName(opponentName);
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

    function handleProfileSave() {
        const trimmed = editingName.trim();

        if (trimmed) {
            onEditName(trimmed);
        }

        setShowProfileDialog(false);
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
                                <div className='slot-circle-shell'>
                                    <button
                                        className='slot-circle slot-p1'
                                        onClick={() => {
                                            setEditingName(playerName);
                                            setShowProfileDialog(true);
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
                                <span className='slot-name'>{playerName}</span>
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
                                    <span className='slot-name'>
                                        {opponentName}
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
                                                inviteButtonLabel =
                                                    uiText.inGame;
                                            } else if (isUserInTeam) {
                                                inviteButtonLabel =
                                                    uiText.inTeam;
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
            </section>
        </main>
    );
}

function detachAction(result: void | Promise<void>) {
    Promise.resolve(result).catch(() => undefined);
}
