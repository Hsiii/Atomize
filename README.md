# Atomize

Atomize is an installable React + Vite PWA built around fast prime factorization. The current build focuses on a polished solo mode and a lightweight real-time multiplayer room flow.

## What the game is

- Each stage starts with a target number.
- That number is built from prime factors.
- You enter primes from the keypad to divide the number down to `1`.
- Faster and cleaner clears build combo and score.
- Mistakes break momentum and cost survivability.

## Game rules

### Solo mode

1. A run starts with `500` HP.
2. Each stage is generated from prime factors and displayed as one target number.
3. You build a prime queue from the keypad, then submit it.
4. Each correct prime divides the current value immediately.
5. If a submitted prime is not a remaining factor, you lose `1` HP, your combo resets, and you lose `1` second from the timer.
6. If you submit extra buffered primes after a stage is already cleared, that also counts as a mistake.
7. A correct prime that does not finish the stage gives `10` score.
8. Clearing a stage gives `50` base score plus a combo bonus of `15 x current combo`.
9. Every cleared stage increments combo by `1` and advances difficulty.
10. Every fifth cleared stage restores `1` HP, up to the `500` HP cap.

### Stage generation

- Early stages use fewer factors and a smaller set of primes.
- Difficulty ramps by increasing factor count and the range of playable primes.
- Stage values are capped so targets stay readable and playable.

### Multiplayer

- Multiplayer uses Supabase Realtime channels.
- The room host acts as the temporary authority for room state.
- Shared seed synchronization keeps both players on the same deterministic match flow.
- Without Supabase environment variables, solo mode still works and multiplayer remains disabled.

## Simplest local installation

This is the fastest way to run the game locally for solo mode.

### Requirements

- Bun `1.2.5` or later

### Steps

1. Install dependencies:

```bash
bun install
```

2. Start the dev server:

```bash
bun run dev:web
```

3. Open the app in your browser:

```text
http://127.0.0.1:5173
```

That is enough for solo mode.

## Local multiplayer setup

To enable multiplayer locally, create `.env.local` in the repository root:

```bash
VITE_SUPABASE_URL=your-project-url
VITE_SUPABASE_ANON_KEY=your-anon-key
```

Then restart the dev server if it is already running.

## PWA installation guide

Atomize ships with a web app manifest and standalone display mode, so it can be installed like an app.

### iPhone or iPad (Safari)

1. Open Atomize in Safari.
2. Tap the Share button.
3. Choose `Add to Home Screen`.
4. Confirm the app name and tap `Add`.

### Android (Chrome)

1. Open Atomize in Chrome.
2. Tap the browser menu.
3. Choose `Install app` or `Add to Home screen`.
4. Confirm the install prompt.

### Desktop (Chrome, Edge, or other Chromium browsers)

1. Open Atomize in the browser.
2. Click the install icon in the address bar, if shown.
3. Or open the browser menu and choose `Install Atomize`.
4. Confirm the install prompt.

### Notes about installation

- The installed app launches in standalone mode instead of a normal browser tab.
- For the best install experience, use a secure deployed URL. Browser support for installing from plain local development URLs is limited and inconsistent.
- Updates are delivered through the PWA registration flow, so refreshing or reopening the app after a deployment should pick up the latest version.

## Scripts

- `bun run dev:web` - start the local Vite dev server on port `5173`
- `bun run build` - type-check and build the production bundle
- `bun run check` - run TypeScript checks only
- `bun run lint` - run ESLint

## Project structure

- `src` - PWA frontend source
- `src/core` - shared game rules and multiplayer helpers
- `src/hooks` - solo and multiplayer gameplay hooks
- `src/lib` - app helpers and Supabase integration

## Deploy to Vercel

Deploy from the repository root.

### Vercel project settings

- Framework preset: Vite
- Root Directory: `.`
- Install Command: `bun install`
- Build Command: `bun run build`
- Output Directory: `dist`

The repository already includes [vercel.json](vercel.json) with these values.

### Required environment variables

Add these in the Vercel project environment settings:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

These are frontend variables, so Vercel injects them into the client build.

After adding or changing them, redeploy the site. Vite bakes `VITE_*` values into the build output, so an existing deployment will keep the old values.

If you are testing a Vercel preview deployment, make sure the variables are added to the `Preview` environment too. Setting them only for `Production` will not populate preview builds.

## Current scope

### Included now

- Installable PWA shell
- Solo endless gameplay loop
- Deterministic stage generation and factor resolution
- Supabase Realtime room flow
- Shared multiplayer protocol and resolution helpers

### Explicitly deferred

- Matchmaking and ranked ladder
- Auth, persistence, and player profiles
- Full reconnection recovery
- Analytics and live ops features
- Audio, particles, and advanced battle effects
