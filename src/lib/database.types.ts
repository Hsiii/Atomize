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
                    user_id: string;
                    player_name: string;
                    max_combo: number;
                    inserted_at: string;
                };
                Insert: {
                    user_id: string;
                    player_name: string;
                    max_combo: number;
                    inserted_at?: string;
                };
                Update: {
                    user_id?: string;
                    player_name?: string;
                    max_combo?: number;
                    inserted_at?: string;
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
