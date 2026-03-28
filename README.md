# [Atomize](https://atomize.hsichen.dev)

A web app game built around fast prime factorization.

## Game modes

### Solo

Challenge your best score and grind your skills.

### Duel

Face off against a friend in real time. Outsmart them with faster factorization and hit them hard with the combos.

## PWA (web app) installation

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

## Install for development

1. Install dependencies with [Bun](https://bun.com/):

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

To enable multiplayer locally, create `.env.local` in the repository root:

```bash
VITE_SUPABASE_URL=your-project-url
VITE_SUPABASE_ANON_KEY=your-anon-key
```
