import { useEffect, useState } from 'react';
import type { JSX } from 'react';
import { Bot, Check, Swords, Users } from 'lucide-react';

import type { OnlineLobbyUser } from '../../app-state';
import { uiText } from '../../app-state';
import { getGuestDisplayName } from '../../lib/app-helpers';
import { ActionButton } from '../game/ui/ActionButton';
import { BackButton } from '../ui/BackButton';

import './OpponentPickerScreen.css';

type OpponentPickerScreenProps = {
    playerName: string;
    opponentName: string | undefined;
    isCpuOpponent: boolean;
    isInRoom: boolean;
    isCurrentPlayerReady: boolean;
    isOpponentReady: boolean;
    onlineUsers: OnlineLobbyUser[];
    onStartCpuGame: () => void | Promise<void>;
    onInvitePlayer: (targetPlayerId: string) => void | Promise<void>;
    onPrefetchInviteUsers: () => void;
    onToggleReady: () => void | Promise<void>;
    onBack: () => void;
};

export function OpponentPickerScreen({
    playerName,
    opponentName,
    isCpuOpponent,
    isInRoom,
    isCurrentPlayerReady,
    isOpponentReady,
    onlineUsers,
    onStartCpuGame,
    onInvitePlayer,
    onPrefetchInviteUsers,
    onToggleReady,
    onBack,
}: OpponentPickerScreenProps): JSX.Element {
    const [invitedIds, setInvitedIds] = useState<Set<string>>(new Set());
    const hasOpponent = Boolean(opponentName);

    useEffect(() => {
        onPrefetchInviteUsers();
    }, []);

    useEffect(() => {
        if (!isInRoom) {
            setInvitedIds(new Set());
        }
    }, [isInRoom]);

    function handleInvite(targetPlayerId: string) {
        detachAction(onInvitePlayer(targetPlayerId));
        setInvitedIds((prev: ReadonlySet<string>) => {
            const nextInvitedIds = new Set(prev);
            nextInvitedIds.add(targetPlayerId);
            return nextInvitedIds;
        });
    }

    function handleStartCpuGame() {
        detachAction(onStartCpuGame());
    }

    const isOpponentGuest = !opponentName?.trim();
    const displayPlayerName = playerName.trim()
        ? playerName
        : getGuestDisplayName();
    const displayOpponentName = isOpponentGuest
        ? getGuestDisplayName()
        : (opponentName ?? '');
    const playerInitial = playerName.slice(0, 1).toUpperCase();
    const opponentInitial = (opponentName ?? '').slice(0, 1).toUpperCase();

    if (hasOpponent) {
        const readyButtonClassName = `vs-ready-btn${isCurrentPlayerReady ? ' vs-ready-btn-active' : ''}`;
        return (
            <main className='app-shell fullscreen-shell opponent-picker-shell'>
                <section className='screen vs-screen'>
                    <BackButton onBack={onBack} />
                    <div className='vs-layout'>
                        <div className='vs-player-column'>
                            <div className='vs-avatar-wrap'>
                                <div className='vs-avatar vs-avatar-self'>
                                    {playerInitial ? (
                                        <span className='vs-avatar-initial'>
                                            {playerInitial}
                                        </span>
                                    ) : (
                                        <span className='vs-avatar-dot' />
                                    )}
                                </div>
                                {isCurrentPlayerReady ? (
                                    <span className='vs-ready-badge'>
                                        <Check
                                            className='vs-ready-check'
                                            size={12}
                                        />
                                    </span>
                                ) : undefined}
                            </div>
                            <span className='vs-player-name'>
                                {displayPlayerName}
                            </span>
                        </div>

                        <span className='vs-divider'>{uiText.vs}</span>

                        <div className='vs-player-column'>
                            <div className='vs-avatar-wrap'>
                                <div className='vs-avatar vs-avatar-opponent'>
                                    {isCpuOpponent ? (
                                        <Bot className='vs-avatar-bot-icon' />
                                    ) : undefined}
                                    {!isCpuOpponent && opponentInitial ? (
                                        <span className='vs-avatar-initial'>
                                            {opponentInitial}
                                        </span>
                                    ) : undefined}
                                    {!isCpuOpponent && !opponentInitial ? (
                                        <span className='vs-avatar-dot' />
                                    ) : undefined}
                                </div>
                                {isOpponentReady ? (
                                    <span className='vs-ready-badge'>
                                        <Check
                                            className='vs-ready-check'
                                            size={12}
                                        />
                                    </span>
                                ) : undefined}
                            </div>
                            <span className='vs-player-name'>
                                {displayOpponentName}
                            </span>
                        </div>
                    </div>
                    <ActionButton
                        aria-pressed={isCurrentPlayerReady}
                        className={readyButtonClassName}
                        onClick={() => {
                            detachAction(onToggleReady());
                        }}
                        variant='primary'
                    >
                        {uiText.ready}
                    </ActionButton>
                </section>
            </main>
        );
    }

    return (
        <main className='app-shell fullscreen-shell opponent-picker-shell'>
            <section className='screen opponent-picker-screen'>
                <header className='opponent-picker-header'>
                    <BackButton onBack={onBack} />
                    <div className='opponent-picker-header-blob'>
                        <Swords
                            aria-hidden='true'
                            className='opponent-picker-mode-icon'
                        />
                        <h1 className='opponent-picker-title'>
                            {uiText.battleTitle}
                        </h1>
                    </div>
                </header>

                <div className='opponent-picker-body'>
                    <button
                        className='atombot-card'
                        onClick={handleStartCpuGame}
                        type='button'
                    >
                        <div className='atombot-blob'>
                            <Bot
                                aria-hidden='true'
                                className='atombot-blob-icon'
                            />
                        </div>
                        <span className='atombot-card-name'>
                            {uiText.atomBotLabel}
                        </span>
                        <span className='atombot-card-hint'>
                            {uiText.atomBotHint}
                        </span>
                    </button>

                    <div className='online-section'>
                        <h2 className='online-section-title'>
                            <Users
                                aria-hidden='true'
                                className='online-section-icon'
                            />
                            {uiText.onlinePlayersSection}
                        </h2>

                        {onlineUsers.length === 0 ? (
                            <div className='online-empty-state'>
                                <p className='online-empty'>
                                    {uiText.noPlayersOnline}
                                </p>
                                <p className='online-empty-hint'>
                                    {uiText.noPlayersOnlineHint}
                                </p>
                            </div>
                        ) : (
                            <ul className='online-list'>
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
                                    let buttonLabel: string =
                                        uiText.inviteButton;

                                    if (isUserInGame) {
                                        buttonLabel = uiText.inGame;
                                    } else if (isUserInTeam) {
                                        buttonLabel = uiText.inTeam;
                                    } else if (isInvited) {
                                        buttonLabel = uiText.invited;
                                    }

                                    return (
                                        <li
                                            className='online-row'
                                            key={user.playerId}
                                        >
                                            <div className='online-player-avatar'>
                                                <span className='online-player-initial'>
                                                    {user.name
                                                        .slice(0, 1)
                                                        .toUpperCase()}
                                                </span>
                                            </div>
                                            <span className='online-name'>
                                                {user.name}
                                            </span>
                                            <button
                                                className={`online-invite-btn${isDisabled ? ' online-invite-btn-disabled' : ''}`}
                                                disabled={isDisabled}
                                                onClick={() => {
                                                    handleInvite(user.playerId);
                                                }}
                                                type='button'
                                            >
                                                {buttonLabel}
                                            </button>
                                        </li>
                                    );
                                })}
                            </ul>
                        )}
                    </div>
                </div>
            </section>
        </main>
    );
}

function detachAction(result: void | Promise<void>) {
    Promise.resolve(result).catch(() => undefined);
}
