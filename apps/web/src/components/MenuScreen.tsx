import type { ChangeEvent, JSX } from 'react';
import { Settings, X } from 'lucide-react';

import { uiText } from '../app-state';
import { ActionButton } from './ActionButton';
import { IconButton } from './IconButton';

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
}: MenuScreenProps): JSX.Element {
    const handleNameChange = (event: ChangeEvent<HTMLInputElement>) => {
        onNameDraftChange(event.target.value);
    };

    return (
        <main className='app-shell fullscreen-shell'>
            <section className='screen screen-menu'>
                <IconButton
                    className='floating-settings-button'
                    icon={
                        <Settings aria-hidden='true' className='control-icon' />
                    }
                    label={uiText.settings}
                    onClick={onOpenSettings}
                />

                <div className='menu-stack'>
                    <p className='eyebrow'>{uiText.eyebrow}</p>
                    <h1 className='hero-title'>{uiText.title}</h1>
                    <div className='action-stack menu-actions'>
                        <ActionButton
                            onClick={onStartSingleGame}
                            variant='primary'
                        >
                            {uiText.singlePlayer}
                        </ActionButton>
                        <ActionButton
                            onClick={onStartCreateRoomFlow}
                            variant='secondary'
                        >
                            {uiText.createRoom}
                        </ActionButton>
                        <ActionButton
                            onClick={onStartJoinRoomFlow}
                            variant='secondary'
                        >
                            {uiText.joinRoom}
                        </ActionButton>
                    </div>
                </div>

                {isSettingsOpen ? (
                    <div
                        className='settings-modal-scrim'
                        onClick={onCloseSettings}
                        role='presentation'
                    >
                        <section
                            aria-label={uiText.settings}
                            aria-modal='true'
                            className='settings-modal'
                            onClick={(event) => {
                                event.stopPropagation();
                            }}
                            role='dialog'
                        >
                            <header className='settings-modal-header'>
                                <span className='label'>
                                    {uiText.playerName}
                                </span>
                                <IconButton
                                    icon={
                                        <X
                                            aria-hidden='true'
                                            className='control-icon'
                                        />
                                    }
                                    label={uiText.close}
                                    onClick={onCloseSettings}
                                />
                            </header>

                            <label className='field settings-field'>
                                <input
                                    autoFocus
                                    maxLength={24}
                                    onChange={handleNameChange}
                                    placeholder={uiText.namePlaceholder}
                                    value={nameDraft}
                                />
                            </label>

                            <div className='settings-actions'>
                                <ActionButton
                                    onClick={onSaveName}
                                    variant='primary'
                                >
                                    {uiText.saveName}
                                </ActionButton>
                            </div>
                        </section>
                    </div>
                ) : undefined}
            </section>
        </main>
    );
}
