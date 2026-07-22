export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[];

export type Database = {
    graphql_public: {
        Tables: {
            [_ in never]: never;
        };
        Views: {
            [_ in never]: never;
        };
        Functions: {
            graphql: {
                Args: {
                    extensions?: Json;
                    operationName?: string;
                    query?: string;
                    variables?: Json;
                };
                Returns: Json;
            };
        };
        Enums: {
            [_ in never]: never;
        };
        CompositeTypes: {
            [_ in never]: never;
        };
    };
    public: {
        Tables: {
            combo_leaderboard: {
                Row: {
                    experience: number;
                    games_played: number;
                    high_score: number;
                    losses: number;
                    max_combo: number;
                    player_name: string;
                    ties: number;
                    updated_at: string;
                    user_id: string;
                    wins: number;
                };
                Insert: {
                    experience?: number;
                    games_played?: number;
                    high_score?: number;
                    losses?: number;
                    max_combo?: number;
                    player_name: string;
                    ties?: number;
                    updated_at?: string;
                    user_id: string;
                    wins?: number;
                };
                Update: {
                    experience?: number;
                    games_played?: number;
                    high_score?: number;
                    losses?: number;
                    max_combo?: number;
                    player_name?: string;
                    ties?: number;
                    updated_at?: string;
                    user_id?: string;
                    wins?: number;
                };
                Relationships: [];
            };
            friendships: {
                Row: {
                    created_at: string;
                    friend_id: string;
                    id: string;
                    user_id: string;
                };
                Insert: {
                    created_at?: string;
                    friend_id: string;
                    id?: string;
                    user_id: string;
                };
                Update: {
                    created_at?: string;
                    friend_id?: string;
                    id?: string;
                    user_id?: string;
                };
                Relationships: [];
            };
        };
        Views: {
            [_ in never]: never;
        };
        Functions: {
            add_solo_exp: {
                Args: { p_exp_gain: number; p_user_id: string };
                Returns: undefined;
            };
            claim_player_name: {
                Args: { p_player_name: string };
                Returns: {
                    experience: number;
                    games_played: number;
                    high_score: number;
                    losses: number;
                    max_combo: number;
                    player_name: string;
                    ties: number;
                    updated_at: string;
                    user_id: string;
                    wins: number;
                };
                SetofOptions: {
                    from: '*';
                    to: 'combo_leaderboard';
                    isOneToOne: true;
                    isSetofReturn: false;
                };
            };
            record_match_result: {
                Args: {
                    p_is_tie: boolean;
                    p_is_winner: boolean;
                    p_user_id: string;
                };
                Returns: undefined;
            };
            submit_solo_score: {
                Args: { p_max_combo?: number; p_score: number };
                Returns: {
                    experience: number;
                    games_played: number;
                    high_score: number;
                    losses: number;
                    max_combo: number;
                    player_name: string;
                    ties: number;
                    updated_at: string;
                    user_id: string;
                    wins: number;
                };
                SetofOptions: {
                    from: '*';
                    to: 'combo_leaderboard';
                    isOneToOne: true;
                    isSetofReturn: false;
                };
            };
        };
        Enums: {
            [_ in never]: never;
        };
        CompositeTypes: {
            [_ in never]: never;
        };
    };
};

type DatabaseWithoutInternals = Omit<Database, '__InternalSupabase'>;

type DefaultSchema = DatabaseWithoutInternals[Extract<
    keyof Database,
    'public'
>];

export type Tables<
    DefaultSchemaTableNameOrOptions extends
        | keyof (DefaultSchema['Tables'] & DefaultSchema['Views'])
        | { schema: keyof DatabaseWithoutInternals },
    TableName extends (DefaultSchemaTableNameOrOptions extends {
        schema: keyof DatabaseWithoutInternals;
    }
        ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
              DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])
        : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
}
    ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
          DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])[TableName] extends {
          Row: infer R;
      }
        ? R
        : never
    : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema['Tables'] &
            DefaultSchema['Views'])
      ? (DefaultSchema['Tables'] &
            DefaultSchema['Views'])[DefaultSchemaTableNameOrOptions] extends {
            Row: infer R;
        }
          ? R
          : never
      : never;

export type TablesInsert<
    DefaultSchemaTableNameOrOptions extends
        | keyof DefaultSchema['Tables']
        | { schema: keyof DatabaseWithoutInternals },
    TableName extends (DefaultSchemaTableNameOrOptions extends {
        schema: keyof DatabaseWithoutInternals;
    }
        ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
        : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
}
    ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
          Insert: infer I;
      }
        ? I
        : never
    : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
      ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
            Insert: infer I;
        }
          ? I
          : never
      : never;

export type TablesUpdate<
    DefaultSchemaTableNameOrOptions extends
        | keyof DefaultSchema['Tables']
        | { schema: keyof DatabaseWithoutInternals },
    TableName extends (DefaultSchemaTableNameOrOptions extends {
        schema: keyof DatabaseWithoutInternals;
    }
        ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
        : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
}
    ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
          Update: infer U;
      }
        ? U
        : never
    : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
      ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
            Update: infer U;
        }
          ? U
          : never
      : never;

export type Enums<
    DefaultSchemaEnumNameOrOptions extends
        | keyof DefaultSchema['Enums']
        | { schema: keyof DatabaseWithoutInternals },
    EnumName extends (DefaultSchemaEnumNameOrOptions extends {
        schema: keyof DatabaseWithoutInternals;
    }
        ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums']
        : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
}
    ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums'][EnumName]
    : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema['Enums']
      ? DefaultSchema['Enums'][DefaultSchemaEnumNameOrOptions]
      : never;

export type CompositeTypes<
    PublicCompositeTypeNameOrOptions extends
        | keyof DefaultSchema['CompositeTypes']
        | { schema: keyof DatabaseWithoutInternals },
    CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
        schema: keyof DatabaseWithoutInternals;
    }
        ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes']
        : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
}
    ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes'][CompositeTypeName]
    : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema['CompositeTypes']
      ? DefaultSchema['CompositeTypes'][PublicCompositeTypeNameOrOptions]
      : never;

export const Constants = {
    graphql_public: {
        Enums: {},
    },
    public: {
        Enums: {},
    },
} as const;
