import { createClient } from '@supabase/supabase-js';
import type { SupabaseClient } from '@supabase/supabase-js';

import { uiText } from '../app-state';
import type { Database } from './database.types';

export type SupabaseConfig = {
    url: string;
    anonKey: string;
};

const SUPABASE_ENV_KEYS = [
    'VITE_SUPABASE_URL',
    'VITE_SUPABASE_ANON_KEY',
] as const;

export function getMissingSupabaseEnvVars(): readonly string[] {
    return SUPABASE_ENV_KEYS.filter((key) => !import.meta.env[key]);
}

export function getSupabaseConfig(): SupabaseConfig | undefined {
    const url = import.meta.env.VITE_SUPABASE_URL;
    const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

    if (!url || !anonKey) {
        return undefined;
    }

    return { url, anonKey };
}

export const supabaseAuthClient: SupabaseClient<Database> | undefined = (() => {
    const config = getSupabaseConfig();
    return config ? createClient(config.url, config.anonKey) : undefined;
})();

export function createRealtimeClient(): SupabaseClient<Database> | undefined {
    const config = getSupabaseConfig();

    if (!config) {
        return undefined;
    }

    return createClient(config.url, config.anonKey, {
        auth: {
            persistSession: false,
            autoRefreshToken: false,
        },
        realtime: {
            params: {
                eventsPerSecond: 40,
            },
        },
    });
}

export async function startGooglePopupSignIn(): Promise<string | undefined> {
    if (!supabaseAuthClient) {
        return uiText.authUnavailable;
    }

    const supabaseConfig = getSupabaseConfig();

    if (!supabaseConfig) {
        return uiText.authUnavailable;
    }

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
            return uiText.loginError;
        }

        const settings = (await settingsResponse.json()) as {
            external?: Record<string, boolean | undefined>;
        };

        if (!settings.external?.google) {
            return uiText.googleProviderDisabled;
        }
    } catch {
        return uiText.loginError;
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
        return uiText.loginError;
    }

    const popup = globalThis.open(
        data.url,
        'google-sign-in',
        'popup,width=500,height=600'
    );

    if (!popup) {
        return uiText.popupBlocked;
    }

    return undefined;
}
