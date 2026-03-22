import { useState } from 'react';
import type { JSX } from 'react';

import { uiText } from '../../app-state';
import { startGooglePopupSignIn } from '../../lib/supabase';
import { ActionButton } from '../game/ui/ActionButton';

import './LoginScreen.css';

type LoginScreenProps = {
    onPlayAsGuest: () => void;
};

export function LoginScreen({ onPlayAsGuest }: LoginScreenProps): JSX.Element {
    const [error, setError] = useState<string | undefined>(undefined);
    const [loading, setLoading] = useState(false);

    async function handleGoogleLogin() {
        setError(undefined);

        setLoading(true);
        const nextError = await startGooglePopupSignIn();

        if (nextError) {
            setError(nextError);
            setLoading(false);
            return;
        }

        setLoading(false);
    }

    return (
        <main className='app-shell fullscreen-shell'>
            <section className='screen screen-menu screen-login'>
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

                    <div className='menu-content login-content'>
                        <div className='login-actions'>
                            {error ? (
                                <div className='login-error'>{error}</div>
                            ) : undefined}
                            <ActionButton
                                disabled={loading}
                                onClick={() => {
                                    handleGoogleLogin().catch(() => {
                                        setError(uiText.loginError);
                                        setLoading(false);
                                    });
                                }}
                                variant='primary'
                            >
                                {loading
                                    ? uiText.waitingShort
                                    : uiText.continueWithGoogle}
                            </ActionButton>
                            <ActionButton
                                onClick={() => {
                                    onPlayAsGuest();
                                }}
                                variant='secondary'
                            >
                                {uiText.playAsGuest}
                            </ActionButton>
                        </div>
                    </div>
                </div>
            </section>
        </main>
    );
}
