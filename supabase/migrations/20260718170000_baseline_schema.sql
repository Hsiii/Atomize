create table if not exists public.combo_leaderboard (
  user_id uuid primary key references auth.users (id) on delete cascade,
  player_name text not null,
  high_score integer not null default 0 check (high_score >= 0),
  max_combo integer not null default 0 check (max_combo >= 0),
  games_played integer not null default 0 check (games_played >= 0),
  wins integer not null default 0 check (wins >= 0),
  losses integer not null default 0 check (losses >= 0),
  ties integer not null default 0 check (ties >= 0),
  experience integer not null default 0 check (experience >= 0),
  updated_at timestamptz not null default now()
);

alter table public.combo_leaderboard enable row level security;

create table if not exists public.friendships (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  user_id uuid not null references auth.users (id) on delete cascade,
  friend_id uuid not null references auth.users (id) on delete cascade,
  constraint friendships_no_self check (user_id <> friend_id)
);

create unique index if not exists friendships_unique_pair_idx
on public.friendships (
  least(user_id, friend_id),
  greatest(user_id, friend_id)
);

alter table public.friendships enable row level security;

grant select, insert, delete on table public.friendships to authenticated;

drop policy if exists "Users can read their friendships" on public.friendships;
create policy "Users can read their friendships"
on public.friendships
for select
to authenticated
using ((select auth.uid()) = user_id or (select auth.uid()) = friend_id);

drop policy if exists "Users can add their friendships" on public.friendships;
create policy "Users can add their friendships"
on public.friendships
for insert
to authenticated
with check ((select auth.uid()) = user_id and user_id <> friend_id);

drop policy if exists "Users can remove their friendships" on public.friendships;
create policy "Users can remove their friendships"
on public.friendships
for delete
to authenticated
using ((select auth.uid()) = user_id or (select auth.uid()) = friend_id);
