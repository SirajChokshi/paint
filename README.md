# Paint

A browser-based pixel art editor built as a pnpm monorepo.

## Packages

- **pixel-paint** — core canvas library (drawing, palettes, history)
- **app** — React SPA that powers the editor UI

## Development

Requires Node.js 24 and pnpm 10.17.1.

```bash
pnpm install
pnpm build        # build pixel-paint (required before running the app)
pnpm dev:app      # start the dev server at http://localhost:5173
```

Other useful commands:

```bash
pnpm -F app lint
pnpm -F app test
pnpm build:app    # production build
```
