import { createClient } from '@supabase/supabase-js';
import type { SupabaseClient } from '@supabase/supabase-js';

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

export function createRealtimeClient(): SupabaseClient | undefined {
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
                eventsPerSecond: 10,
            },
        },
    });
}
