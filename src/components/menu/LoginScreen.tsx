import { useState } from 'react';
import type { JSX } from 'react';

import { uiText } from '../../app-state';
import { getSupabaseConfig, supabaseAuthClient } from '../../lib/supabase';
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

        if (!supabaseAuthClient) {
            setError(uiText.authUnavailable);
            return;
        }

        const supabaseConfig = getSupabaseConfig();

        if (!supabaseConfig) {
            setError(uiText.authUnavailable);
            return;
        }

        setLoading(true);

        try {
            const settingsResponse = await globalThis.fetch(
                new URL('/auth/v1/settings', supabaseConfig.url),
                {
                    headers: {
                        apikey: supabaseConfig.anonKey,
                    },
                }
            );

            if (!settingsResponse.ok) {
                setError(uiText.loginError);
                setLoading(false);
                return;
            }

            const settings = (await settingsResponse.json()) as {
                external?: Record<string, boolean | undefined>;
            };

            if (!settings.external?.google) {
                setError(uiText.googleProviderDisabled);
                setLoading(false);
                return;
            }
        } catch {
            setError(uiText.loginError);
            setLoading(false);
            return;
        }

        const { data, error: authError } =
            await supabaseAuthClient.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    redirectTo: globalThis.location.origin,
                    skipBrowserRedirect: true,
                },
            });

        if (authError || !data.url) {
            setError(uiText.loginError);
            setLoading(false);
            return;
        }

        const popup = globalThis.open(
            data.url,
            'google-sign-in',
            'popup,width=500,height=600'
        );

        if (!popup) {
            setError(uiText.popupBlocked);
            setLoading(false);
            return;
        }

        const pollTimer = setInterval(() => {
            if (popup.closed) {
                clearInterval(pollTimer);
                setLoading(false);
            }
        }, 500);
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
