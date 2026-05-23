# Notizie24 / Nano Slim Landing

Lightweight Next.js rebuild of the Notizie24 advertorial landing page.

## Requirements

- Node.js 20 or newer
- pnpm 9 or newer

## Local Run

```bash
pnpm install
pnpm dev
```

Open `http://localhost:3000`.

## Production Build

```bash
pnpm install
pnpm build
```

## Run On A Node Server/VPS

This project uses Next.js standalone output.

```bash
pnpm install
pnpm build
PORT=3000 node .next/standalone/server.js
```

Serve it behind Nginx/Caddy/Apache as a reverse proxy to port `3000`.

## Deploy On Vercel

1. Upload/import this project to Vercel.
2. Framework preset: Next.js.
3. Install command: `pnpm install`.
4. Build command: `pnpm build`.
5. Output directory: leave default.

## Notes

- The lead form redirects to `/your-submission-was-successful/`.
- Dates visible on the page are replaced in the browser with yesterday's date on each visit.
- The countdown starts from 15 minutes on every page load.
- The lower "Leer mas" image areas link to the form block.
