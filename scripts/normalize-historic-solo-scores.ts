import { createClient } from '@supabase/supabase-js';

import { normalizeHistoricSoloHighScore } from '../src/lib/app-helpers';
import type { Database } from '../src/lib/database.types';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL ?? '';
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY ?? '';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY ?? '';
const SUPABASE_KEY = SUPABASE_SERVICE_ROLE_KEY || SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
    console.error(
        '[Error] Missing env vars. Set VITE_SUPABASE_URL and either SUPABASE_SERVICE_ROLE_KEY or VITE_SUPABASE_ANON_KEY in .env.local'
    );
    process.exit(1);
}

const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_KEY);

const { data, error } = await supabase
    .from('combo_leaderboard')
    .select('user_id, player_name, high_score, updated_at')
    .gt('high_score', 0);

if (error) {
    console.error('[Error] Failed to load leaderboard rows:', error.message);
    process.exit(1);
}

const candidates = data
    .map((row) => ({
        ...row,
        normalizedHighScore: normalizeHistoricSoloHighScore(
            row.high_score,
            row.updated_at
        ),
    }))
    .filter((row) => row.normalizedHighScore !== row.high_score);

if (candidates.length === 0) {
    console.log('[Info] No historic solo scores needed normalization.');
    process.exit(0);
}

console.log(
    `[Info] Normalizing ${candidates.length} historic solo score(s) in Supabase.`
);

const updateResults = await Promise.all(
    candidates.map(async (candidate) => {
        const { data: upsertedRows, error: updateError } = await supabase
            .from('combo_leaderboard')
            .upsert(
                {
                    user_id: candidate.user_id,
                    player_name: candidate.player_name,
                    high_score: candidate.normalizedHighScore,
                },
                { onConflict: 'user_id' }
            )
            .select('user_id, high_score');

        return {
            candidate,
            updateError,
            upsertedRows,
        };
    })
);

let failedUpdate: (typeof updateResults)[number] | undefined;

for (const result of updateResults) {
    if (result.updateError) {
        failedUpdate = result;
        break;
    }
}

if (failedUpdate?.updateError) {
    if (
        failedUpdate.updateError.message.includes(
            'row-level security policy'
        ) &&
        !SUPABASE_SERVICE_ROLE_KEY
    ) {
        console.error(
            "[Error] Historic score migration needs SUPABASE_SERVICE_ROLE_KEY because the anon key cannot rewrite other players' leaderboard rows."
        );
        process.exit(1);
    }

    console.error(
        `[Error] Failed to update ${failedUpdate.candidate.player_name}: ${failedUpdate.updateError.message}`
    );
    process.exit(1);
}

for (const { candidate } of updateResults) {
    console.log(
        `[Updated] ${candidate.player_name}: ${candidate.high_score} -> ${candidate.normalizedHighScore}`
    );
}

console.log('[Success] Historic solo score normalization complete.');
