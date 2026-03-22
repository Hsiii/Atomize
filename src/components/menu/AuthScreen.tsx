import { useEffect, useState } from 'react';
import type { JSX, SyntheticEvent } from 'react';

import { uiText } from '../../app-state';
import {
    startEmailSignIn,
    startEmailSignUp,
    startGooglePopupSignIn,
} from '../../lib/supabase';
import { ActionButton } from '../game/ui/ActionButton';
import { BackButton } from '../ui/BackButton';

import './AuthScreen.css';

type AuthScreenProps = {
    initialMode: 'login' | 'signup';
    onAuthSuccess: () => void;
    onBack: () => void;
};

type AuthStatus = {
    tone: 'error' | 'success';
    message: string;
};

function GoogleMark(): JSX.Element {
    return (
        <svg
            aria-hidden='true'
            className='auth-page-google-mark'
            viewBox='0 0 24 24'
        >
            <path
                d='M21.81 12.23c0-.72-.06-1.25-.19-1.8H12.2v3.56h5.53c-.11.88-.72 2.2-2.07 3.09l-.02.12 3 2.28.21.02c1.91-1.73 2.96-4.27 2.96-7.27Z'
                fill='#4285F4'
            />
            <path
                d='M12.2 21.88c2.71 0 4.98-.87 6.64-2.37l-3.19-2.42c-.85.58-1.99.99-3.45.99-2.65 0-4.89-1.73-5.69-4.12l-.12.01-3.12 2.37-.04.11c1.65 3.2 5.04 5.43 8.97 5.43Z'
                fill='#34A853'
            />
            <path
                d='M6.51 13.96a5.8 5.8 0 0 1-.33-1.94c0-.67.12-1.31.31-1.94l-.01-.13-3.16-2.41-.1.04A9.78 9.78 0 0 0 2.17 12c0 1.56.37 3.03 1.05 4.42l3.29-2.46Z'
                fill='#FBBC05'
            />
            <path
                d='M12.2 5.92c1.84 0 3.08.78 3.79 1.43l2.77-2.65C17.17 3.25 14.91 2.12 12.2 2.12c-3.93 0-7.32 2.23-8.97 5.43l3.27 2.49c.82-2.39 3.06-4.12 5.7-4.12Z'
                fill='#EA4335'
            />
        </svg>
    );
}

export function AuthScreen({
    initialMode,
    onAuthSuccess,
    onBack,
}: AuthScreenProps): JSX.Element {
    const [mode, setMode] = useState<'login' | 'signup'>(initialMode);
    const [userName, setUserName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [emailLoading, setEmailLoading] = useState(false);
    const [googleLoading, setGoogleLoading] = useState(false);
    const [status, setStatus] = useState<AuthStatus | undefined>(undefined);

    useEffect(() => {
        setMode(initialMode);
        setUserName('');
        setEmail('');
        setPassword('');
        setStatus(undefined);
    }, [initialMode]);

    function switchMode(nextMode: 'login' | 'signup') {
        setMode(nextMode);
        setUserName('');
        setEmail('');
        setPassword('');
        setStatus(undefined);
    }

    async function submitEmailAuth() {
        setStatus(undefined);
        setEmailLoading(true);

        if (mode === 'login') {
            const nextError = await startEmailSignIn(email, password);

            setEmailLoading(false);

            if (nextError) {
                setStatus({ message: nextError, tone: 'error' });
                return;
            }

            onAuthSuccess();
            return;
        }

        const result = await startEmailSignUp(userName, email, password);

        setEmailLoading(false);

        if (result.error) {
            setStatus({ message: result.error, tone: 'error' });
            return;
        }

        if (result.requiresEmailConfirmation) {
            setMode('login');
            setPassword('');
            setStatus({
                message: uiText.signupConfirmation,
                tone: 'success',
            });
            return;
        }

        onAuthSuccess();
    }

    function handleEmailAuth(event: SyntheticEvent<HTMLFormElement>) {
        event.preventDefault();
        Promise.resolve(submitEmailAuth()).catch(() => undefined);
    }

    async function submitGoogleAuth() {
        setStatus(undefined);
        setGoogleLoading(true);

        const nextError = await startGooglePopupSignIn();

        setGoogleLoading(false);

        if (nextError) {
            setStatus({ message: nextError, tone: 'error' });
            return;
        }

        onAuthSuccess();
    }

    function handleGoogleAuth() {
        Promise.resolve(submitGoogleAuth()).catch(() => undefined);
    }

    const isLogin = mode === 'login';
    const title = isLogin ? uiText.signIn : uiText.signUp;
    const submitLabel = isLogin
        ? uiText.emailPasswordAction
        : uiText.emailSignupAction;
    const googleLabel = uiText.continueWithGoogle;

    return (
        <main className='app-shell fullscreen-shell auth-page-shell'>
            <section className='screen auth-page-screen'>
                <header className='auth-page-header-band'>
                    <BackButton onBack={onBack} />
                    <h1 className='auth-page-title'>{title}</h1>
                </header>

                <div className='auth-page-body'>
                    <form
                        className='auth-page-section auth-page-form'
                        onSubmit={handleEmailAuth}
                    >
                        {isLogin ? undefined : (
                            <label className='auth-page-field-block'>
                                <span className='label'>{uiText.userName}</span>
                                <input
                                    autoCapitalize='words'
                                    autoComplete='nickname'
                                    className='auth-page-input'
                                    maxLength={8}
                                    onChange={(event) => {
                                        setUserName(event.target.value);
                                    }}
                                    placeholder={uiText.userNamePlaceholder}
                                    value={userName}
                                />
                            </label>
                        )}

                        <label className='auth-page-field-block'>
                            <span className='label'>{uiText.email}</span>
                            <input
                                autoCapitalize='none'
                                autoComplete='email'
                                className='auth-page-input'
                                inputMode='email'
                                onChange={(event) => {
                                    setEmail(event.target.value);
                                }}
                                placeholder={uiText.emailPlaceholder}
                                type='email'
                                value={email}
                            />
                        </label>

                        <label className='auth-page-field-block'>
                            <span className='label'>{uiText.password}</span>
                            <input
                                autoComplete={
                                    isLogin
                                        ? 'current-password'
                                        : 'new-password'
                                }
                                className='auth-page-input'
                                onChange={(event) => {
                                    setPassword(event.target.value);
                                }}
                                placeholder={uiText.passwordPlaceholder}
                                type='password'
                                value={password}
                            />
                        </label>

                        <ActionButton
                            className='auth-page-primary-action'
                            disabled={emailLoading || googleLoading}
                            type='submit'
                            variant='primary'
                        >
                            {emailLoading ? uiText.waitingShort : submitLabel}
                        </ActionButton>
                    </form>

                    <section className='auth-page-section auth-page-social-section'>
                        <div aria-hidden='true' className='auth-page-divider'>
                            <span className='auth-page-divider-line' />
                            <span className='auth-page-divider-text'>
                                {uiText.authDivider}
                            </span>
                            <span className='auth-page-divider-line' />
                        </div>

                        <button
                            className='auth-page-google-button'
                            disabled={emailLoading || googleLoading}
                            onClick={handleGoogleAuth}
                            type='button'
                        >
                            <GoogleMark />
                            <span>{googleLabel}</span>
                        </button>
                    </section>

                    <section className='auth-page-section auth-page-footer-section'>
                        <p className='auth-page-footer-copy'>
                            {isLogin
                                ? uiText.firstTimePrompt
                                : uiText.alreadyHaveAccountPrompt}{' '}
                            <button
                                className='auth-page-switch-button'
                                onClick={() => {
                                    switchMode(isLogin ? 'signup' : 'login');
                                }}
                                type='button'
                            >
                                {isLogin ? uiText.signUp : uiText.signIn}
                            </button>
                        </p>
                    </section>

                    {status ? (
                        <p
                            aria-live='polite'
                            className={`auth-page-status auth-page-status-${status.tone}`}
                        >
                            {status.message}
                        </p>
                    ) : undefined}
                </div>
            </section>
        </main>
    );
}
