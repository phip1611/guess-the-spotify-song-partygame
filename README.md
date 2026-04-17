# Song Game

A realtime party game built with Angular, Socket.IO, and the Spotify Web API.

One player acts as the game master, chooses a playlist, starts rounds, and awards points. Other players join from their phones and use a buzzer UI.

## Stack

- UI: Angular 21, Angular Material, Bootstrap 5, zoneless change detection, signals where practical
- Backend: Node 24, Express 5, Socket.IO 4, TypeScript ESM
- Shared protocol: `common-ts/socket-events.ts`

## Prerequisites

- Node `24.14.0`
- npm
- a Spotify app configuration that allows your local redirect URL, usually `http://localhost:4200/spotify-redirect`

The repo pins Node in `.nvmrc`.

## Install

Install dependencies in both app folders:

```bash
cd ui && npm ci
cd ../server-node && npm ci
```

## Local Development

Recommended full-stack workflow from the repo root:

```bash
npm run dev
```

This starts:

- the backend on `http://localhost:8080`
- the Angular dev server on `http://localhost:4200`

The UI uses same-origin Socket.IO in the browser and proxies `/socket.io` and `/info` from the Angular dev server to the backend, so local browser traffic stays consistent.

You can also run the services separately:

```bash
npm run dev:server
npm run dev:ui
```

## Tests

Run everything from the repo root:

```bash
npm test
```

Or individually:

```bash
npm run test:server
npm run test:ui
npm run typecheck:ui
npm run build:server
```

## Production Build

Backend build:

```bash
npm run build:server
```

UI production build:

```bash
npm run build:ui
```

The Angular production config disables remote font inlining so the build works in offline or sandboxed environments.

## Docker

Build the image:

```bash
npm run docker:build
```

Run it:

```bash
docker run --rm -p 8080:8080 song-game
```

The Docker image builds the Angular UI and backend in separate stages and serves the compiled UI from the backend.

## Gameplay

- Open `http://localhost:4200` during local development, or `http://localhost:8080` when running the built server/image.
- The game master logs into Spotify and starts a game from a playlist.
- Players join via `/game/:id`.
- The server forwards:
  - game master -> players: `GM_START_NEXT_ROUND`, `GM_ENABLE_BUZZER`
  - players -> game master: `PLAYER_REGISTER`, `PLAYER_BUZZER`

## Notes

- The backend keeps reconnect metadata so clients can recover from temporary disconnects.
- Spotify redirect and join URLs are derived from the current browser origin.
- The `/info` endpoint exists for debugging and inspection.
