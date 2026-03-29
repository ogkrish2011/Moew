# Workspace

## Overview

pnpm workspace monorepo using TypeScript. Contains a full-stack Discord bot dashboard with React frontend and Express backend.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (ESM bundle)
- **Frontend**: React + Vite + Tailwind CSS + shadcn/ui + Framer Motion
- **Bot**: discord.js

## Structure

```text
artifacts-monorepo/
├── artifacts/
│   ├── api-server/         # Express API server (bot backend + Discord OAuth)
│   └── bot-dashboard/      # React dashboard frontend (Vite)
├── lib/
│   ├── api-spec/           # OpenAPI spec + Orval codegen config
│   ├── api-client-react/   # Generated React Query hooks
│   ├── api-zod/            # Generated Zod schemas from OpenAPI
│   └── db/                 # Drizzle ORM schema + DB connection
├── pnpm-workspace.yaml
├── tsconfig.base.json
├── tsconfig.json
└── package.json
```

## Features

### Bot Dashboard (artifacts/bot-dashboard)
- Discord OAuth login (session-based, httpOnly cookies)
- Real-time stats overview (guildCount, userCount, channelCount, ping, uptime)
- SSE (Server-Sent Events) at `/api/sse/events` for live activity feed
- Bot management: set status, activity, reconnect
- Server list with guild icons
- Settings with 6 themes: dark, light, midnight, ocean, forest, sunset
- Theme persisted to localStorage

### API Server (artifacts/api-server)
- Discord bot connection via discord.js (auto-connects on startup)
- Session-based auth with PostgreSQL sessions table
- Routes: `/api/auth/*`, `/api/bot/*`, `/api/stats/*`, `/api/settings`, `/api/sse/events`
- SSE heartbeat every 15s

## Database Schema

- `sessions` — OAuth sessions (id, userId, userData, expiresAt)
- `settings` — Dashboard settings (key/value store)
- `bot_events` — Bot event log (type, description, guildId, timestamp)

## Required Secrets

- `DISCORD_BOT_TOKEN` — bot token from Discord Developer Portal
- `DISCORD_CLIENT_ID` — OAuth application client ID
- `DISCORD_CLIENT_SECRET` — OAuth application client secret
- `SESSION_SECRET` — Express session secret
- `DATABASE_URL` — PostgreSQL connection string (auto-set by Replit)

## Discord OAuth Setup

The redirect URI must be set in your Discord application:
- Development: `https://<your-replit-domain>/api/auth/discord/callback`
- Production: `https://<your-deployed-domain>/api/auth/discord/callback`

## TypeScript & Composite Projects

Every package extends `tsconfig.base.json` which sets `composite: true`. The root `tsconfig.json` lists all packages as project references.

## Packages

### `artifacts/api-server` (`@workspace/api-server`)

Express 5 API server with Discord bot integration.

- Entry: `src/index.ts` — reads `PORT`, starts Express, inits Discord bot, SSE heartbeat
- App: `src/app.ts` — CORS, cookies, pino logging, session middleware
- Routes: `src/routes/` — health, auth, bot, stats, settings, sse
- Bot: `src/lib/discordBot.ts` — discord.js client, event logging, presence
- Auth: `src/lib/auth.ts` — session creation/validation, middleware
- SSE: `src/lib/sse.ts` — SSE client management and broadcast

### `artifacts/bot-dashboard` (`@workspace/bot-dashboard`)

React + Vite frontend dashboard.

- Pages: login, dashboard, bot management, servers, settings
- Theme system: 6 themes via CSS custom properties + localStorage
- Real-time: SSE hook + polling for stats

### `lib/db` (`@workspace/db`)

Database layer. Schema in `src/schema/`: sessions, settings, events.
