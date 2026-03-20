import { useEffect, useState } from 'react';
import type { JSX } from 'react';
import { Plus, X } from 'lucide-react';

import type { OnlineLobbyUser, PendingInvitation } from '../app-state';
import { uiText } from '../app-state';

import { ActionButton } from './ActionButton';

import './MenuScreen.css';

type MenuScreenProps = {
    playerName: string;
    opponentName: string | null;
    countdownValue: number | null;
    onlineUsers: OnlineLobbyUser[];
    toastMessage: string | null;
    toastId: number;
    onStartSoloGame: () => void;
    onInvitePlayer: (targetPlayerId: string) => void;
    onEditName: (name: string) => void;
    pendingInvitation: PendingInvitation | null;
    onAcceptInvitation: () => void;
    onDeclineInvitation: () => void;
};

export function MenuScreen({
    playerName,
    opponentName,
    countdownValue,
    onlineUsers,
    toastMessage,
    toastId,
    onStartSoloGame,
    onInvitePlayer,
    onEditName,
    pendingInvitation,
    onAcceptInvitation,
    onDeclineInvitation,
}: MenuScreenProps): JSX.Element {
    const [showInviteDialog, setShowInviteDialog] = useState(false);
    const [showProfileDialog, setShowProfileDialog] = useState(false);
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
    const isCountingDown = countdownValue !== null;
    const initials = playerName.slice(0, 2).toUpperCase();

    function handleProfileSave() {
        const trimmed = editingName.trim();

        if (trimmed) {
            onEditName(trimmed);
        }

        setShowProfileDialog(false);
    }

    function handleInvite(targetPlayerId: string) {
        onInvitePlayer(targetPlayerId);
        setShowInviteDialog(false);
    }

    return (
        <main className='app-shell fullscreen-shell'>
            <section className='screen screen-menu'>
                <div className='menu-layout'>
                    <div className='menu-title-orb'>
                        <h1 className='hero-title'>
                            <span>{uiText.titleLead}</span>
                            <span
                                aria-hidden='true'
                                className='hero-title-filled-o'
                            />
                            <span>{uiText.titleTail}</span>
                        </h1>
                    </div>

                    <div className='menu-content'>
                        <div className='menu-slots'>
                            <button
                                className='slot-circle slot-p1'
                                onClick={() => {
                                    setEditingName(playerName);
                                    setShowProfileDialog(true);
                                }}
                                type='button'
                            >
                                <span className='slot-initials'>
                                    {initials}
                                </span>
                                <span className='slot-name'>{playerName}</span>
                            </button>

                            {hasOpponent ? (
                                <div className='slot-circle slot-p2-filled'>
                                    <span className='slot-initials'>
                                        {(opponentName ?? '')
                                            .slice(0, 2)
                                            .toUpperCase()}
                                    </span>
                                    <span className='slot-name'>
                                        {opponentName}
                                    </span>
                                </div>
                            ) : (
                                <button
                                    className='slot-circle slot-p2-empty'
                                    disabled={isCountingDown}
                                    onClick={() => {
                                        setShowInviteDialog(true);
                                    }}
                                    type='button'
                                >
                                    <Plus className='slot-plus-icon' />
                                </button>
                            )}
                        </div>

                        {isCountingDown && (
                            <div className='menu-countdown'>
                                <span
                                    className='countdown-number'
                                    key={countdownValue}
                                >
                                    {countdownValue}
                                </span>
                            </div>
                        )}

                        <ActionButton
                            className='menu-start-btn'
                            disabled={isCountingDown}
                            onClick={onStartSoloGame}
                            variant='primary'
                        >
                            {uiText.start}
                        </ActionButton>
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

                                            return (
                                                <li
                                                    className='invite-row'
                                                    key={user.playerId}
                                                >
                                                    <span className='invite-name'>
                                                        {user.name}
                                                    </span>
                                                    <button
                                                        className={`invite-btn${isUserInGame ? ' invite-btn-disabled' : ''}`}
                                                        disabled={isUserInGame}
                                                        onClick={() => {
                                                            handleInvite(
                                                                user.playerId
                                                            );
                                                        }}
                                                        type='button'
                                                    >
                                                        {isUserInGame
                                                            ? uiText.inGame
                                                            : uiText.inviteButton}
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
