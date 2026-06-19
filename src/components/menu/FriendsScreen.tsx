import { useEffect, useMemo, useState } from 'react';
import type { JSX, SyntheticEvent } from 'react';
import { Loader2, UserPlus, UsersRound, X } from 'lucide-react';

import { uiText } from '../../app-state';
import { supabaseAuthClient } from '../../lib/supabase';
import { ActionButton } from '../game/ui/ActionButton';
import { BackButton } from '../ui/BackButton';

import './FriendsScreen.css';

type FriendsScreenProps = {
    playerName: string;
    userId: string;
    onBack: () => void;
};

type FriendProfile = {
    user_id: string;
    player_name: string;
    high_score: number;
};

type FriendStatus = {
    tone: 'error' | 'success';
    message: string;
};

type FriendshipRow = {
    id: string;
    created_at: string | null;
    friend_id: string;
    user_id: string;
};

type FriendsLoadResult = {
    friends: FriendProfile[];
    status?: FriendStatus;
};

function normalizePlayerName(value: string): string {
    return value.trim().split(' ').filter(Boolean).join(' ').toLowerCase();
}

function detachFriendAction(action: Promise<void>, onError: () => void) {
    // eslint-disable-next-line unicorn/prefer-await
    action.catch(onError);
}

async function fetchFriends(userId: string): Promise<FriendsLoadResult> {
    if (!supabaseAuthClient) {
        return { friends: [] };
    }

    const friendshipsResponse = await supabaseAuthClient
        .from('friendships')
        .select('id, user_id, friend_id, created_at')
        .or(`user_id.eq.${userId},friend_id.eq.${userId}`)
        .order('created_at', { ascending: false });

    if (friendshipsResponse.error) {
        return {
            friends: [],
            status: { message: uiText.friendsLoadError, tone: 'error' },
        };
    }

    const rows: FriendshipRow[] = friendshipsResponse.data;
    const nextFriendIds: string[] = [
        ...new Set(
            rows
                .map((friendship) =>
                    friendship.user_id === userId
                        ? friendship.friend_id
                        : friendship.user_id
                )
                .filter((id) => id !== userId)
        ),
    ];

    if (nextFriendIds.length === 0) {
        return { friends: [] };
    }

    const profilesResponse = await supabaseAuthClient
        .from('combo_leaderboard')
        .select('user_id, player_name, high_score')
        .in('user_id', nextFriendIds);

    if (profilesResponse.error) {
        return {
            friends: [],
            status: { message: uiText.friendsLoadError, tone: 'error' },
        };
    }

    const profiles: FriendProfile[] = profilesResponse.data;
    const profileById = new Map(
        profiles.map((profile) => [profile.user_id, profile])
    );

    return {
        friends: nextFriendIds
            .map((id) => profileById.get(id))
            .filter((profile): profile is FriendProfile => Boolean(profile)),
    };
}

export function FriendsScreen({
    playerName,
    userId,
    onBack,
}: FriendsScreenProps): JSX.Element {
    const [friends, setFriends] = useState<FriendProfile[]>([]);
    const [loadingFriends, setLoadingFriends] = useState(true);
    const [friendName, setFriendName] = useState('');
    const [saving, setSaving] = useState(false);
    const [removingFriendId, setRemovingFriendId] = useState<
        string | undefined
    >(undefined);
    const [status, setStatus] = useState<FriendStatus | undefined>(undefined);

    const friendIds = useMemo(
        () => new Set(friends.map((friend) => friend.user_id)),
        [friends]
    );

    useEffect(() => {
        let mounted = true;

        async function loadMountedFriends() {
            setLoadingFriends(true);
            // eslint-disable-next-line unicorn/no-declarations-before-early-exit
            const result = await fetchFriends(userId);

            if (!mounted) {
                return;
            }

            setFriends(result.friends);
            setStatus(result.status);
            setLoadingFriends(false);
        }

        detachFriendAction(loadMountedFriends(), () => {
            if (!mounted) {
                return;
            }

            setStatus({
                message: uiText.friendsLoadError,
                tone: 'error',
            });
            setLoadingFriends(false);
        });

        return () => {
            mounted = false;
        };
    }, [userId]);

    async function addFriend() {
        if (!supabaseAuthClient) {
            setStatus({ message: uiText.authUnavailable, tone: 'error' });
            return;
        }

        const normalizedName = normalizePlayerName(friendName);

        if (!normalizedName) {
            return;
        }

        if (normalizedName === normalizePlayerName(playerName)) {
            setStatus({ message: uiText.friendsSelfError, tone: 'error' });
            return;
        }

        setSaving(true);
        setStatus(undefined);

        const profileResponse = await supabaseAuthClient
            .from('combo_leaderboard')
            .select('user_id, player_name, high_score')
            .ilike('player_name', friendName.trim())
            .maybeSingle();

        if (profileResponse.error) {
            setStatus({ message: uiText.friendsAddError, tone: 'error' });
            setSaving(false);
            return;
        }

        const targetProfile: FriendProfile | null = profileResponse.data;

        if (!targetProfile) {
            setStatus({ message: uiText.friendsNotFoundError, tone: 'error' });
            setSaving(false);
            return;
        }

        if (
            targetProfile.user_id === userId ||
            friendIds.has(targetProfile.user_id)
        ) {
            setStatus({
                message:
                    targetProfile.user_id === userId
                        ? uiText.friendsSelfError
                        : uiText.friendsDuplicateError,
                tone: 'error',
            });
            setSaving(false);
            return;
        }

        const existingFriendshipResponse = await supabaseAuthClient
            .from('friendships')
            .select('id')
            .or(
                `and(user_id.eq.${userId},friend_id.eq.${targetProfile.user_id}),and(user_id.eq.${targetProfile.user_id},friend_id.eq.${userId})`
            )
            .maybeSingle();

        if (existingFriendshipResponse.error) {
            setStatus({ message: uiText.friendsAddError, tone: 'error' });
            setSaving(false);
            return;
        }

        if (existingFriendshipResponse.data) {
            setStatus({ message: uiText.friendsDuplicateError, tone: 'error' });
            setSaving(false);
            return;
        }

        const insertResponse = await supabaseAuthClient
            .from('friendships')
            .insert({ user_id: userId, friend_id: targetProfile.user_id });

        if (insertResponse.error) {
            setStatus({ message: uiText.friendsAddError, tone: 'error' });
            setSaving(false);
            return;
        }

        setFriends((prev: readonly FriendProfile[]) => [
            targetProfile,
            ...prev,
        ]);
        setFriendName('');
        setStatus({ message: uiText.friendsAddSuccess, tone: 'success' });
        setSaving(false);
    }

    async function removeFriend(friendId: string) {
        if (!supabaseAuthClient) {
            return;
        }

        setRemovingFriendId(friendId);
        setStatus(undefined);

        const removalResponse = await supabaseAuthClient
            .from('friendships')
            .delete()
            .or(
                `and(user_id.eq.${userId},friend_id.eq.${friendId}),and(user_id.eq.${friendId},friend_id.eq.${userId})`
            );

        if (removalResponse.error) {
            setStatus({ message: uiText.friendsRemoveError, tone: 'error' });
            setRemovingFriendId(undefined);
            return;
        }

        setFriends((prev: readonly FriendProfile[]) =>
            prev.filter((friend) => friend.user_id !== friendId)
        );
        setRemovingFriendId(undefined);
    }

    function handleSubmit(event: SyntheticEvent<HTMLFormElement>) {
        event.preventDefault();
        detachFriendAction(addFriend(), () => {
            setStatus({ message: uiText.friendsAddError, tone: 'error' });
            setSaving(false);
        });
    }

    let friendsContent: JSX.Element;

    if (loadingFriends) {
        friendsContent = (
            <div className='friends-loading'>
                <Loader2 size={32} />
            </div>
        );
    } else if (friends.length === 0) {
        friendsContent = (
            <div className='friends-empty-state'>
                <p className='friends-empty'>{uiText.friendsEmpty}</p>
                <p className='friends-empty-hint'>{uiText.friendsEmptyHint}</p>
            </div>
        );
    } else {
        friendsContent = (
            <ul className='friends-list'>
                {friends.map((friend) => (
                    <li className='friends-row' key={friend.user_id}>
                        <div className='friends-avatar'>
                            <span className='friends-avatar-initial'>
                                {friend.player_name.slice(0, 1).toUpperCase()}
                            </span>
                        </div>
                        <span className='friends-name'>
                            {friend.player_name}
                        </span>
                        <span className='friends-score'>
                            {friend.high_score}
                        </span>
                        <button
                            aria-label={`${uiText.remove} ${friend.player_name}`}
                            className='friends-remove-btn'
                            disabled={removingFriendId === friend.user_id}
                            onClick={() => {
                                detachFriendAction(
                                    removeFriend(friend.user_id),
                                    () => {
                                        setStatus({
                                            message: uiText.friendsRemoveError,
                                            tone: 'error',
                                        });
                                        setRemovingFriendId(undefined);
                                    }
                                );
                            }}
                            title={uiText.remove}
                            type='button'
                        >
                            {removingFriendId === friend.user_id ? (
                                <Loader2 size={18} />
                            ) : (
                                <X size={18} />
                            )}
                        </button>
                    </li>
                ))}
            </ul>
        );
    }

    return (
        <main className='app-shell fullscreen-shell friends-page-shell'>
            <section className='screen friends-page-screen'>
                <header className='page-header-band'>
                    <div className='page-title-row'>
                        <BackButton onBack={onBack} />
                        <h1 className='page-title'>{uiText.friendsTitle}</h1>
                    </div>
                    <UsersRound className='page-hero-icon' strokeWidth={2} />
                    <p className='page-tagline'>{uiText.friendsGoal}</p>
                </header>

                <div className='friends-page-body'>
                    <form className='friends-add-form' onSubmit={handleSubmit}>
                        <input
                            autoCapitalize='words'
                            autoComplete='off'
                            className='friends-add-input'
                            disabled={saving}
                            maxLength={8}
                            onChange={(event) => {
                                setFriendName(event.target.value);
                            }}
                            placeholder={uiText.friendsAddPlaceholder}
                            value={friendName}
                        />
                        <ActionButton
                            aria-label={uiText.friendsAddLabel}
                            className='friends-add-btn'
                            disabled={saving || !friendName.trim()}
                            title={uiText.friendsAddLabel}
                            type='submit'
                            variant='primary'
                        >
                            {saving ? (
                                <Loader2 size={20} />
                            ) : (
                                <UserPlus size={20} />
                            )}
                        </ActionButton>
                    </form>

                    {status ? (
                        <p
                            aria-live='polite'
                            className={`friends-status friends-status-${status.tone}`}
                        >
                            {status.message}
                        </p>
                    ) : undefined}

                    <section
                        aria-label={uiText.friendsTitle}
                        className='friends-list-section'
                    >
                        {friendsContent}
                    </section>
                </div>
            </section>
        </main>
    );
}
