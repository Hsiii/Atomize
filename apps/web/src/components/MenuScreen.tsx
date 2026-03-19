import type { JSX } from 'react';
import { Plus, Search, UserRound } from 'lucide-react';

import { uiText } from '../app-state';

import './MenuScreen.css';

type MenuScreenProps = {
    onStartSingleGame: () => void;
    onStartCreateRoomFlow: () => void;
    onStartJoinRoomFlow: () => void;
};

export function MenuScreen({
    onStartSingleGame,
    onStartCreateRoomFlow,
    onStartJoinRoomFlow,
}: MenuScreenProps): JSX.Element {
    return (
        <main className='app-shell fullscreen-shell'>
            <section className='screen screen-menu'>
                <div className='menu-stack'>
                    <div aria-label={uiText.title} className='menu-title-orb'>
                        <h1 className='hero-title'>{uiText.title}</h1>
                    </div>

                    <div
                        aria-label={uiText.title}
                        className='menu-actions'
                        role='group'
                    >
                        <button
                            className='menu-blob-button menu-blob-button-solo'
                            onClick={onStartSingleGame}
                            type='button'
                        >
                            <UserRound
                                aria-hidden='true'
                                className='menu-blob-icon'
                            />
                            <span className='menu-blob-text'>
                                {uiText.menuSolo}
                            </span>
                        </button>
                        <button
                            className='menu-blob-button'
                            onClick={onStartCreateRoomFlow}
                            type='button'
                        >
                            <Plus
                                aria-hidden='true'
                                className='menu-blob-icon'
                            />
                            <span className='menu-blob-text'>
                                {uiText.menuNewRoom}
                            </span>
                        </button>
                        <button
                            className='menu-blob-button'
                            onClick={onStartJoinRoomFlow}
                            type='button'
                        >
                            <Search
                                aria-hidden='true'
                                className='menu-blob-icon'
                            />
                            <span className='menu-blob-text'>
                                {uiText.menuJoinRoom}
                            </span>
                        </button>
                    </div>
                </div>
            </section>
        </main>
    );
}
