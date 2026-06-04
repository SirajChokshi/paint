# Agents

## Cursor Cloud specific instructions

This is a pnpm monorepo with two packages: `pixel-paint` (core canvas library) and `app` (React SPA).

### Prerequisites

- Node.js 24 (see `.nvmrc`)
- pnpm 10.17.1 (managed via corepack, see `packageManager` in root `package.json`)

Cloud VM shells may default to an older Node version. Before any `pnpm` command, activate Node 24:

```bash
export NVM_DIR="$HOME/.nvm" && . "$NVM_DIR/nvm.sh" && nvm use 24
```

After `pnpm install`, run `pnpm build` once before starting the dev server (the update script does not run builds automatically).

### Quick reference

| Task | Command |
|------|---------|
| Install deps | `pnpm install` |
| Build library | `pnpm build` |
| Dev server | `pnpm dev:app` (serves at `http://localhost:5173`) |
| Lint | `pnpm -F app lint` |
| Type check | `cd app && npx tsc --noEmit` |
| Production build | `pnpm build:app` |

### Important notes

- The `pixel-paint` library must be built (`pnpm build`) before the app can start, since `app` depends on it via `workspace:*` and resolves from `pixel-paint/dist/`.
- The `pnpm.onlyBuiltDependencies` field in the root `package.json` allows build scripts for `@parcel/watcher`, `@swc/core`, and `esbuild` to run non-interactively during `pnpm install`.
- There are no backend services, databases, or external dependencies. The entire app is a client-side SPA using `localStorage` for persistence.
- The Vite dev server supports HMR. If you change `pixel-paint` source, you need to rebuild it (`pnpm build`) for changes to be picked up by the app.
