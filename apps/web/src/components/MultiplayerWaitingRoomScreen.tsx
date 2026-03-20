import type { JSX } from 'react';
import { ArrowLeft, Check, Copy } from 'lucide-react';

import type { MultiplayerState, OnlineLobbyUser } from '../app-state';
import { uiText } from '../app-state';

type MultiplayerWaitingRoomScreenProps = {
    activeToastMessage: string | undefined;
    codeCopied: boolean;
    multiplayer: MultiplayerState;
    onlineUsers: OnlineLobbyUser[];
    onBack: () => void;
    onCopyCode: () => void;
    onInvitePlayer: (targetPlayerId: string) => void;
    onToggleReady: () => void;
};

export function MultiplayerWaitingRoomScreen({
    activeToastMessage,
    codeCopied,
    multiplayer,
    onlineUsers,
    onBack,
    onCopyCode,
    onInvitePlayer,
    onToggleReady,
}: MultiplayerWaitingRoomScreenProps): JSX.Element {
    const currentPlayer = multiplayer.snapshot?.players.find(
        (player) => player.id === multiplayer.playerId
    );
    const opponentPlayer = multiplayer.snapshot?.players.find(
        (player) => player.id !== multiplayer.playerId
    );
    const hasOpponent = Boolean(opponentPlayer);
    const isCurrentReady = currentPlayer?.ready ?? false;
    const isOpponentReady = opponentPlayer?.ready ?? false;

    return (
        <main className='app-shell fullscreen-shell'>
            <section className='screen lobby-screen lobby-room'>
                <header className='lobby-bar'>
                    <button
                        className='lobby-bar-back'
                        onClick={onBack}
                        type='button'
                    >
                        <ArrowLeft size={20} />
                    </button>
                    <div className='lobby-bar-code'>
                        <span className='lobby-bar-digits'>
                            {multiplayer.roomId}
                        </span>
                        <button
                            className='lobby-bar-copy'
                            onClick={onCopyCode}
                            type='button'
                        >
                            {codeCopied ? (
                                <Check size={14} />
                            ) : (
                                <Copy size={14} />
                            )}
                        </button>
                    </div>
                </header>

                <div className='lobby-arena'>
                    <div className='arena-player arena-p1'>
                        <span className='arena-label'>P1</span>
                        <span className='arena-name'>
                            {currentPlayer?.name ?? '-'}
                        </span>
                        {hasOpponent ? (
                            <span
                                className={`arena-ready-badge${isCurrentReady ? ' arena-ready-badge-on' : ''}`}
                            >
                                {isCurrentReady ? 'Ready' : 'Not Ready'}
                            </span>
                        ) : undefined}
                    </div>

                    <div className='arena-center'>
                        <span className='arena-vs'>VS</span>
                    </div>

                    <div
                        className={`arena-player arena-p2${
                            opponentPlayer ? '' : ' arena-p2-open'
                        }`}
                    >
                        <span className='arena-label'>P2</span>
                        <span
                            className={`arena-name${
                                opponentPlayer ? '' : ' arena-name-waiting'
                            }`}
                        >
                            {opponentPlayer?.name ?? '?'}
                        </span>
                        {hasOpponent ? (
                            <span
                                className={`arena-ready-badge${isOpponentReady ? ' arena-ready-badge-on' : ''}`}
                            >
                                {isOpponentReady ? 'Ready' : 'Not Ready'}
                            </span>
                        ) : undefined}
                    </div>

                    {!hasOpponent && onlineUsers.length > 0 ? (
                        <ul className='arena-challengers'>
                            {onlineUsers.map((user) => (
                                <li
                                    className='arena-challenger'
                                    key={user.playerId}
                                >
                                    <span className='arena-challenger-name'>
                                        {user.name}
                                    </span>
                                    <button
                                        className='arena-challenger-invite'
                                        onClick={() => {
                                            onInvitePlayer(user.playerId);
                                        }}
                                        type='button'
                                    >
                                        {uiText.inviteButton}
                                    </button>
                                </li>
                            ))}
                        </ul>
                    ) : undefined}
                </div>

                {hasOpponent && !isCurrentReady ? (
                    <div className='arena-ready-action'>
                        <button
                            className='arena-ready-button'
                            onClick={onToggleReady}
                            type='button'
                        >
                            Ready
                        </button>
                    </div>
                ) : undefined}

                {activeToastMessage ? (
                    <div aria-live='polite' className='waiting-toast-layer'>
                        <div className='waiting-toast'>
                            {activeToastMessage}
                        </div>
                    </div>
                ) : undefined}
            </section>
        </main>
    );
}
