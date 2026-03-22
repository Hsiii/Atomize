export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[];

export interface Database {
    public: {
        Tables: {
            combo_leaderboard: {
                Row: {
                    high_score: number;
                    max_combo: number;
                    player_name: string;
                    updated_at: string | null;
                    user_id: string;
                };
                Insert: {
                    high_score?: number;
                    max_combo?: number;
                    player_name: string;
                    updated_at?: string | null;
                    user_id: string;
                };
                Update: {
                    high_score?: number;
                    max_combo?: number;
                    player_name?: string;
                    updated_at?: string | null;
                    user_id?: string;
                };
                Relationships: [];
            };
        };
        Views: Record<never, never>;
        Functions: Record<never, never>;
        Enums: Record<never, never>;
        CompositeTypes: Record<never, never>;
    };
}
