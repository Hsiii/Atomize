import { useState } from 'react';
import type { JSX, SyntheticEvent } from 'react';

import { uiText } from '../../app-state';
import { persistPlayerName } from '../../lib/app-helpers';
import { supabaseAuthClient } from '../../lib/supabase';
import { ActionButton } from '../game/ui/ActionButton';

import './LoginScreen.css';

type LoginScreenProps = {
    onLoginSuccess: () => void;
    onPlayAsGuest: () => void;
};

export function LoginScreen({
    onLoginSuccess,
    onPlayAsGuest,
}: LoginScreenProps): JSX.Element {
    const [mode, setMode] = useState<'login' | 'signup' | undefined>(undefined);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [displayName, setDisplayName] = useState('');
    const [error, setError] = useState<string | undefined>(undefined);
    const [loading, setLoading] = useState(false);

    async function handleSubmit(e: SyntheticEvent<HTMLFormElement>) {
        e.preventDefault();
        setError(undefined);

        if (!supabaseAuthClient) {
            setError('Auth not configured in .env');
            return;
        }

        setLoading(true);

        if (mode === 'login') {
            const { error: authError } =
                await supabaseAuthClient.auth.signInWithPassword({
                    email,
                    password,
                });

            if (authError) {
                setError(uiText.loginError);
            } else {
                onLoginSuccess();
            }
        } else {
            if (!displayName.trim()) {
                setError('Please enter a display name');
                setLoading(false);
                return;
            }

            const { data, error: authError } =
                await supabaseAuthClient.auth.signUp({
                    email,
                    password,
                    options: {
                        data: {
                            display_name: displayName.trim(),
                        },
                    },
                });

            if (authError) {
                setError(authError.message);
            } else if (data.user?.identities?.length === 0) {
                setError(uiText.emailInUse);
            } else {
                persistPlayerName(displayName.trim());
                setError(uiText.signUpSuccess);
                setMode('login');
            }
        }

        setLoading(false);
    }

    const submitLabel = mode === 'login' ? uiText.login : uiText.signUp;

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
                        {mode === undefined ? (
                            <div className='login-actions'>
                                <ActionButton
                                    onClick={() => {
                                        setError(undefined);
                                        setMode('login');
                                    }}
                                    variant='primary'
                                >
                                    {uiText.login}
                                </ActionButton>
                                <ActionButton
                                    onClick={() => {
                                        setError(undefined);
                                        setMode('signup');
                                    }}
                                    variant='secondary'
                                >
                                    {uiText.signUp}
                                </ActionButton>
                                <div className='login-divider'>
                                    <span className='login-divider-line' />
                                    <span className='login-divider-text'>
                                        or
                                    </span>
                                    <span className='login-divider-line' />
                                </div>
                                <ActionButton
                                    onClick={() => {
                                        onPlayAsGuest();
                                    }}
                                    variant='secondary'
                                >
                                    {uiText.playAsGuest}
                                </ActionButton>
                            </div>
                        ) : (
                            <form
                                className='login-form'
                                onSubmit={(e) => {
                                    handleSubmit(e).catch(() => undefined);
                                }}
                            >
                                {error && (
                                    <div className='login-error'>{error}</div>
                                )}
                                {mode === 'signup' && (
                                    <input
                                        className='dialog-input'
                                        onChange={(e) => {
                                            setDisplayName(e.target.value);
                                        }}
                                        placeholder={uiText.displayName}
                                        required
                                        type='text'
                                        value={displayName}
                                    />
                                )}
                                <input
                                    className='dialog-input'
                                    onChange={(e) => {
                                        setEmail(e.target.value);
                                    }}
                                    placeholder={uiText.email}
                                    required
                                    type='email'
                                    value={email}
                                />
                                <input
                                    className='dialog-input'
                                    onChange={(e) => {
                                        setPassword(e.target.value);
                                    }}
                                    placeholder={uiText.password}
                                    required
                                    type='password'
                                    value={password}
                                />
                                <ActionButton
                                    disabled={loading}
                                    type='submit'
                                    variant='primary'
                                >
                                    {loading
                                        ? uiText.waitingShort
                                        : submitLabel}
                                </ActionButton>
                                <ActionButton
                                    onClick={() => {
                                        setError(undefined);
                                        setMode(undefined);
                                    }}
                                    variant='secondary'
                                >
                                    {uiText.back}
                                </ActionButton>
                            </form>
                        )}
                    </div>
                </div>
            </section>
        </main>
    );
}
