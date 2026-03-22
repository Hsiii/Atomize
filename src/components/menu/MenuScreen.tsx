import { useEffect, useRef, useState } from 'react';
import type { JSX } from 'react';
import { Crown, Play, Swords, Timer, User } from 'lucide-react';

import { uiText } from '../../app-state';

import './MenuScreen.css';

type MenuScreenProps = {
    toastMessage: string | undefined;
    toastId: number;
    onOpenAuth: () => void;
    onOpenAccount: () => void;
    onOpenLeaderboard: () => void;
    onOpenSolo: () => void;
    onOpenBattle: () => void;
    onOpenTutorial?: () => void;
    isGuest: boolean;
    needsTutorial?: boolean;
};

export function MenuScreen({
    toastMessage,
    toastId,
    onOpenAuth,
    onOpenAccount,
    onOpenLeaderboard,
    onOpenSolo,
    onOpenBattle,
    onOpenTutorial,
    isGuest,
    needsTutorial,
}: MenuScreenProps): JSX.Element {
    const [visibleToast, setVisibleToast] = useState<string | undefined>(
        undefined
    );
    const toastTimeoutRef = useRef<
        ReturnType<typeof globalThis.setTimeout> | undefined
    >(undefined);

    useEffect(() => {
        if (!toastMessage) {
            return undefined;
        }

        showMenuToast(toastMessage);
        return undefined;
    }, [toastId, toastMessage]);

    useEffect(
        () => () => {
            if (toastTimeoutRef.current !== undefined) {
                globalThis.clearTimeout(toastTimeoutRef.current);
            }
        },
        []
    );

    function showMenuToast(message: string) {
        if (toastTimeoutRef.current !== undefined) {
            globalThis.clearTimeout(toastTimeoutRef.current);
        }

        setVisibleToast(message);
        toastTimeoutRef.current = globalThis.setTimeout(
            (nextValue: undefined) => {
                setVisibleToast(nextValue);
                toastTimeoutRef.current = undefined;
            },
            2200,
            undefined
        );
    }

    return (
        <main className='app-shell fullscreen-shell'>
            <section className='screen screen-menu'>
                <div className='menu-layout'>
                    {!needsTutorial && (
                        <div className='menu-top-right-actions'>
                            <button
                                className='icon-action-btn'
                                onClick={onOpenLeaderboard}
                                title={uiText.leaderboardTitle}
                                type='button'
                            >
                                <Crown size={24} />
                            </button>
                            <button
                                className='icon-action-btn'
                                onClick={() => {
                                    if (isGuest) {
                                        onOpenAuth();
                                        return;
                                    }

                                    onOpenAccount();
                                }}
                                title={
                                    isGuest
                                        ? uiText.signIn
                                        : uiText.accountTitle
                                }
                                type='button'
                            >
                                <User size={24} />
                            </button>
                        </div>
                    )}
                    <div className='menu-title-orb' />
                    <h1 className='hero-title'>
                        <span>{uiText.titleLead}</span>
                        <span
                            aria-hidden='true'
                            className='hero-title-filled-o'
                        />
                        <span>{uiText.titleTail}</span>
                    </h1>

                    <div className='menu-content'>
                        {needsTutorial ? (
                            <div className='menu-mode-cards'>
                                <button
                                    className='mode-card mode-card-tutorial'
                                    onClick={onOpenTutorial}
                                    type='button'
                                >
                                    <div className='mode-card-blob'>
                                        <Play
                                            aria-hidden='true'
                                            className='mode-card-icon'
                                        />
                                        <span className='mode-card-title'>
                                            {uiText.menuPlay}
                                        </span>
                                    </div>
                                </button>
                            </div>
                        ) : (
                            <div className='menu-mode-cards'>
                                <button
                                    className='mode-card mode-card-solo'
                                    onClick={onOpenSolo}
                                    type='button'
                                >
                                    <div className='mode-card-blob'>
                                        <Timer
                                            aria-hidden='true'
                                            className='mode-card-icon'
                                        />
                                        <span className='mode-card-title'>
                                            {uiText.soloTitle}
                                        </span>
                                    </div>
                                </button>
                                <button
                                    className='mode-card mode-card-battle'
                                    onClick={onOpenBattle}
                                    type='button'
                                >
                                    <div className='mode-card-blob'>
                                        <Swords
                                            aria-hidden='true'
                                            className='mode-card-icon'
                                        />
                                        <span className='mode-card-title'>
                                            {uiText.battleTitle}
                                        </span>
                                    </div>
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {visibleToast ? (
                    <div aria-live='polite' className='menu-toast-layer'>
                        <div className='menu-toast'>{visibleToast}</div>
                    </div>
                ) : undefined}
            </section>
        </main>
    );
}
