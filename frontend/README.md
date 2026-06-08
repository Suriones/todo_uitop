# Todo Manager — Frontend

Next.js static app deployed to GitHub Pages.

## Development

```bash
npm install
npm run dev
```

Open **http://localhost:3000**

The app auto-detects whether the backend is running on `http://localhost:4000`.
- **Backend available** → data saved to SQLite via API
- **Backend unavailable** → demo mode, data saved in browser localStorage

To run the backend locally, see the [root README](../README.md).

## Build

```bash
npm run build   # outputs static files to ./out
```

## Tests

```bash
npm test
```
