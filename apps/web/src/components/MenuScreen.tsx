import type { ChangeEvent } from 'react';
import { Settings, X } from 'lucide-react';

import { uiText } from '../app-state';
import { ActionButton } from './ActionButton';

type MenuScreenProps = {
    isSettingsOpen: boolean;
    nameDraft: string;
    onStartSingleGame: () => void;
    onStartCreateRoomFlow: () => void;
    onStartJoinRoomFlow: () => void;
    onOpenSettings: () => void;
    onCloseSettings: () => void;
    onNameDraftChange: (value: string) => void;
    onSaveName: () => void;
};

export function MenuScreen({
    isSettingsOpen,
    nameDraft,
    onStartSingleGame,
    onStartCreateRoomFlow,
    onStartJoinRoomFlow,
    onOpenSettings,
    onCloseSettings,
    onNameDraftChange,
    onSaveName,
}: MenuScreenProps) {
    const handleNameChange = (event: ChangeEvent<HTMLInputElement>) => {
        onNameDraftChange(event.target.value);
    };

    return (
        <main className='app-shell fullscreen-shell'>
            <section className='screen screen-menu'>
                <button
                    type='button'
                    className='icon-action floating-settings-button'
                    onClick={onOpenSettings}
                    aria-label={uiText.settings}
                >
                    <Settings className='control-icon' aria-hidden='true' />
                </button>

                <div className='menu-stack'>
                    <p className='eyebrow'>{uiText.eyebrow}</p>
                    <h1 className='hero-title'>{uiText.title}</h1>
                    <div className='action-stack menu-actions'>
                        <ActionButton
                            variant='primary'
                            onClick={onStartSingleGame}
                        >
                            {uiText.singlePlayer}
                        </ActionButton>
                        <ActionButton
                            variant='secondary'
                            onClick={onStartCreateRoomFlow}
                        >
                            {uiText.createRoom}
                        </ActionButton>
                        <ActionButton
                            variant='secondary'
                            onClick={onStartJoinRoomFlow}
                        >
                            {uiText.joinRoom}
                        </ActionButton>
                    </div>
                </div>

                {isSettingsOpen ? (
                    <div
                        className='settings-modal-scrim'
                        role='presentation'
                        onClick={onCloseSettings}
                    >
                        <section
                            className='settings-modal'
                            role='dialog'
                            aria-modal='true'
                            aria-label={uiText.settings}
                            onClick={(event) => event.stopPropagation()}
                        >
                            <header className='settings-modal-header'>
                                <span className='label'>
                                    {uiText.playerName}
                                </span>
                                <button
                                    type='button'
                                    className='icon-action'
                                    onClick={onCloseSettings}
                                    aria-label={uiText.close}
                                >
                                    <X
                                        className='control-icon'
                                        aria-hidden='true'
                                    />
                                </button>
                            </header>

                            <label className='field settings-field'>
                                <input
                                    value={nameDraft}
                                    onChange={handleNameChange}
                                    maxLength={24}
                                    placeholder={uiText.namePlaceholder}
                                    autoFocus
                                />
                            </label>

                            <div className='settings-actions'>
                                <ActionButton
                                    variant='primary'
                                    onClick={onSaveName}
                                >
                                    {uiText.saveName}
                                </ActionButton>
                            </div>
                        </section>
                    </div>
                ) : null}
            </section>
        </main>
    );
}
