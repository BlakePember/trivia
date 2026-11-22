# Trivia — Solo, Practice & Live Multiplayer

Interactive trivia web game featuring **Single Player** (Classic Run, Blitz 60s, Survival), a **Category Practice Studio** (with deep Geography quizzes like World Flags, World Capitals, Landmarks, Extremes, US States, and Currencies plus Science, History, Pop Culture, and Tech), and **Real-Time Multiplayer** powered by **Cloudflare Workers + Durable Objects**.

## Architecture
- **Frontend (`src/`):** React 19 + TypeScript + Vite SPA with offline vector SVG flags (`country-flag-icons`), Web Audio sound effects, dark/light themes, localStorage records & mastery tracking, and native WebSockets ([src/services/realtime.ts](./src/services/realtime.ts)).
- **Shared Question Bank & Scoring (`shared/`):** Pure TypeScript question catalog & generators ([shared/catalog.ts](./shared/catalog.ts)), datasets ([shared/data/](./shared/data/)), scoring & accent-insensitive fuzzy matcher ([shared/scoring.ts](./shared/scoring.ts)), and wire protocol ([shared/protocol.ts](./shared/protocol.ts)), shared identically between the browser and Cloudflare Durable Objects.
- **Cloudflare Workers + Durable Objects (`worker/`):**
  - `TriviaLobbyDO` ([worker/lobbyDO.ts](./worker/lobbyDO.ts)) — SQLite-backed public room directory, live online presence, room creation, and Quick Match queues (`All Categories`, `Geography Mix`, `World Flags`, `World Capitals`) using the WebSocket Hibernation API.
  - `TriviaRoomDO` ([worker/roomDO.ts](./worker/roomDO.ts)) — One isolated SQLite-backed Durable Object per room code (`getByName(code)`), handling authoritative server-side answer validation (answers never leaked during active rounds), Durable Object Alarms for synchronized timers & optional AI bots, live room chat, and final podiums.

## Running Locally
```bash
npm install
npm run dev
```

`@cloudflare/vite-plugin` runs both the React frontend (with HMR) and the local Cloudflare Workers + Durable Objects runtime together on **http://localhost:5174**.

Run unit tests and typechecks:
```bash
npm test
npm run typecheck
npm run build
```

## Production Deployment
- **Frontend + Backend (Cloudflare Workers + Durable Objects):** Hosted together on Cloudflare Workers at `https://trivia.blakepember.net` (Worker `trivia-api`, configured in [cloudflare.config.ts](./cloudflare.config.ts)).
- **Manual deploy:** Sign in once with `npx cf auth login` and run `npm run deploy`.
- **Automatic deploy:** [.github/workflows/ci.yml](./.github/workflows/ci.yml) runs unit tests and builds on every PR/push, and deploys to Cloudflare Workers on pushes to `main` when `CLOUDFLARE_API_TOKEN` is configured in GitHub repository secrets.
