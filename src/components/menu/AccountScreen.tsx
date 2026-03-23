import { useState } from 'react';
import type { JSX, SyntheticEvent } from 'react';
import { CircleUserRound } from 'lucide-react';

import { uiText } from '../../app-state';
import { ActionButton } from '../game/ui/ActionButton';
import { BackButton } from '../ui/BackButton';

import './AccountScreen.css';

type AccountScreenProps = {
    playerName: string;
    onEditName: (name: string) => Promise<string | undefined>;
    onLogout: () => void;
    onBack: () => void;
};

type AccountStatus = {
    tone: 'error' | 'success';
    message: string;
};

export function AccountScreen({
    playerName,
    onEditName,
    onLogout,
    onBack,
}: AccountScreenProps): JSX.Element {
    const [editingName, setEditingName] = useState(playerName);
    const [saving, setSaving] = useState(false);
    const [status, setStatus] = useState<AccountStatus | undefined>(undefined);

    async function submitNameSave() {
        const trimmed = editingName.trim();

        if (!trimmed) {
            return;
        }

        setStatus(undefined);
        setSaving(true);

        const nextError = await onEditName(trimmed);

        setSaving(false);

        if (nextError) {
            setStatus({ message: nextError, tone: 'error' });
            return;
        }

        setStatus({ message: uiText.nameSaved, tone: 'success' });
    }

    function handleSubmit(event: SyntheticEvent<HTMLFormElement>) {
        event.preventDefault();
        Promise.resolve(submitNameSave()).catch(() => undefined);
    }

    return (
        <main className='app-shell fullscreen-shell account-page-shell'>
            <section className='screen account-page-screen'>
                <header className='page-header-band'>
                    <div className='page-title-row'>
                        <BackButton onBack={onBack} />
                        <h1 className='page-title'>{uiText.accountTitle}</h1>
                    </div>
                    <CircleUserRound
                        className='page-hero-icon'
                        strokeWidth={2}
                    />
                    <p className='page-tagline'>{uiText.accountGoal}</p>
                </header>

                <div className='account-page-body'>
                    <form
                        className='account-page-section account-page-form'
                        onSubmit={handleSubmit}
                    >
                        <label className='account-page-field-block'>
                            <span className='label'>{uiText.playerName}</span>
                            <input
                                autoCapitalize='words'
                                autoComplete='nickname'
                                className='account-page-input'
                                maxLength={8}
                                onChange={(event) => {
                                    setEditingName(event.target.value);
                                }}
                                placeholder={uiText.namePlaceholder}
                                value={editingName}
                            />
                        </label>

                        <ActionButton
                            className='account-page-primary-action'
                            disabled={saving}
                            type='submit'
                            variant='primary'
                        >
                            {saving ? uiText.savingName : uiText.saveName}
                        </ActionButton>
                    </form>

                    {status ? (
                        <p
                            aria-live='polite'
                            className={`account-page-status account-page-status-${status.tone}`}
                        >
                            {status.message}
                        </p>
                    ) : undefined}

                    <section className='account-page-section account-page-logout-section'>
                        <div
                            aria-hidden='true'
                            className='account-page-divider'
                        />

                        <ActionButton
                            className='account-page-primary-action'
                            onClick={onLogout}
                            variant='danger'
                        >
                            {uiText.logout}
                        </ActionButton>
                    </section>
                </div>
            </section>
        </main>
    );
}
