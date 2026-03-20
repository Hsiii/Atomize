import type { JSX } from 'react';
import { ArrowLeft, Check, Copy } from 'lucide-react';

import type { MultiplayerState, OnlineLobbyUser } from '../app-state';
import { uiText } from '../app-state';

type MultiplayerWaitingRoomScreenProps = {
    activeToastMessage: string | undefined;
    codeCopied: boolean;
    multiplayer: MultiplayerState;
    multiplayerCountdownValue: number | null;
    onlineUsers: OnlineLobbyUser[];
    onBack: () => void;
    onCopyCode: () => void;
    onInvitePlayer: (targetPlayerId: string) => void;
};

export function MultiplayerWaitingRoomScreen({
    activeToastMessage,
    codeCopied,
    multiplayer,
    multiplayerCountdownValue,
    onlineUsers,
    onBack,
    onCopyCode,
    onInvitePlayer,
}: MultiplayerWaitingRoomScreenProps): JSX.Element {
    const currentPlayer = multiplayer.snapshot?.players.find(
        (player) => player.id === multiplayer.playerId
    );
    const opponentPlayer = multiplayer.snapshot?.players.find(
        (player) => player.id !== multiplayer.playerId
    );
    const isCountdown = multiplayer.snapshot?.status === 'countdown';
    const hasOpponent = Boolean(opponentPlayer);

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
                    </div>

                    <div className='arena-center'>
                        <span className='arena-vs'>
                            {isCountdown
                                ? (multiplayerCountdownValue ?? 3)
                                : 'VS'}
                        </span>
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
                    </div>

                    {!hasOpponent && !isCountdown && onlineUsers.length > 0 ? (
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
