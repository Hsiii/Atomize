# WallPrime MVP

WallPrime is an iOS-friendly PWA math game built around fast prime factorization. The MVP prioritizes a polished solo loop and a minimal real-time multiplayer foundation.

## MVP scope

### Included now

- Installable React + Vite PWA shell
- Shared game-core package for deterministic stage generation and factor resolution
- Solo endless mode with combo, streak reset, and health pressure
- Supabase Realtime room flow with host-validated shared-seed match sync
- Shared room protocol types and deterministic multiplayer resolution helpers

### Explicitly deferred

- Matchmaking and ranked ladder
- Auth, persistence, and player profiles
- Reconnection recovery beyond a basic room session token
- Production deployment and analytics
- Audio, particles, and advanced battle effects

## Core gameplay loop

1. Generate a target number from prime factors between 2 and 53.
2. The player taps prime buttons to divide out matching factors.
3. Correct partial inputs reduce the remaining value.
4. A wrong input breaks combo and costs health.
5. Clearing a stage increments combo and advances difficulty.

## Multiplayer MVP

This version uses Supabase Realtime channels. The room host acts as the temporary authority for room state, validates joins and prime selections in the client, and broadcasts updated snapshots through Supabase.

## Supabase setup

Create `apps/web/.env.local` with:

```bash
VITE_SUPABASE_URL=your-project-url
VITE_SUPABASE_ANON_KEY=your-anon-key
```

Without these variables, solo mode still works but multiplayer stays disabled.

## Workspace layout

- `apps/web`: PWA frontend
- `apps/server`: legacy local WebSocket prototype
- `packages/game-core`: shared game rules and multiplayer event types

## Scripts

- `bun run dev:web`
- `bun run dev:server`
- `bun run build`
- `bun run check`

## Deploy to Vercel

Deploy from the repository root, not from `apps/web`, so the workspace dependency on `@wallprime/game-core` resolves correctly.

### Vercel project settings

- Framework preset: Vite
- Root Directory: `.`
- Install Command: `bun install`
- Build Command: `bun run --cwd apps/web build`
- Output Directory: `apps/web/dist`

The repository already includes [vercel.json](vercel.json) with these values.

### Required environment variables

Add these in the Vercel project environment settings:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

These are frontend variables, so Vercel injects them into the client build.

### Notes

- `localhost` works for development without HTTPS, but the deployed Vercel domain will automatically use HTTPS.
- Multiplayer still uses Supabase Realtime with client-side host authority in this MVP, so deployment does not change the current trust model.
