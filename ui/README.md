# UI

Angular 21 frontend for the Song Game.

## Local Run

From `ui/`:

```bash
npm start
```

This serves the app on `http://localhost:4200`.

For full local functionality, run the backend on `http://localhost:8080` as well. The Angular dev server proxies Socket.IO traffic to that backend.

## Commands

```bash
npm start
npm run build
npm run typecheck
npm test -- --watch=false --browsers=ChromeHeadless --progress=false
```

For the full project workflow, use the repo root `README.md`.
