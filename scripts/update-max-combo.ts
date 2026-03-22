/**
 * One-time script: upsert a player's max combo into the Supabase leaderboard.
 *
 * Usage:
 *   bun run scripts/update-max-combo.ts <playerName> <maxCombo>.
 *
 * Example:
 *   bun run scripts/update-max-combo.ts Hsiii 12.
 */

import { createClient } from '@supabase/supabase-js';

import type { Database } from '../src/lib/database.types';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL ?? '';
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY ?? '';

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    console.error(
        '[Error] Missing env vars. Make sure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set in .env.local'
    );
    process.exit(1);
}

const [playerName, rawCombo] = process.argv.slice(2);

if (!playerName || !rawCombo) {
    console.error(
        'Usage: bun run scripts/update-max-combo.ts <playerName> <maxCombo>'
    );
    process.exit(1);
}

const maxCombo = Number(rawCombo);
if (!Number.isFinite(maxCombo) || maxCombo < 0) {
    console.error(`[Error] Invalid maxCombo value: "${rawCombo}"`);
    process.exit(1);
}

const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY);

console.log(
    `[Info] Upserting: player_name="${playerName}", max_combo=${maxCombo}`
);

const { data, error } = await supabase
    .from('combo_leaderboard')
    .upsert(
        {
            player_name: playerName,
            max_combo: maxCombo,
        } as Database['public']['Tables']['combo_leaderboard']['Insert'],
        { onConflict: 'player_name' }
    )
    .select();

if (error) {
    console.error('[Error] Supabase error:', error.message);
    process.exit(1);
}

console.log('[Success] Done! Upserted row:', data);
