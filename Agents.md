# Codex Agent Notes

This repository hosts the tesouroQR React + Capacitor app. Use this as a quick brief whenever you spin up Codex/Copilot tools.

## Tech Stack
- React 19 (Vite 6)
- Tailwind-style utility classes (via global CSS)
- Capacitor 7 for native shells, Camera plugin for gallery access
- Drag & drop via `@dnd-kit`

## Common Commands
```bash
npm install            # install deps
npm run dev            # Vite dev server
npm run build          # production build -> dist/
npm run build -- --outDir dist-experimental   # alt bundle for testing
npx cap copy android   # sync web assets to Android
npx cap open android   # open Android Studio project
```

## Mobile Testing Tips
- Copy `dist-experimental/` into `android/app/src/main/assets/public` when testing feature builds.
- Run `npx cap sync android` after changing native config (manifest, plugins).
- Android drag requires a short long-press (150 ms). Ensure sensors import `TouchSensor`.

## Coding Guidelines
- Keep QR codes in `tesouroQR-XX` order; resequence after changes.
- Hint images default to blank; require explicit selection.
- Avoid committing build artifacts: `dist/`, `dist-experimental/`, `android/app/build/`, `.idea/`, `android/.gradle/`, `node_modules/.vite/`.
- Add concise comments only when logic isn’t obvious.

## Workflow Reminders
- Prefer `git pull --rebase` before pushing to avoid non-fast-forward errors.
- Use `npm run build && npx cap copy android` before creating APKs.
- For icons: Android Studio ➜ *Image Asset* or `npx capacitor-assets generate --icon icon.png`.

## Useful Paths
- Web entry: `App.tsx`
- Setup UI: `components/SetupGame.tsx`
- Play mode: `components/PlayGame.tsx`
- Types: `types.ts`
- Capacitor config: `capacitor.config.ts`

Keep this file updated whenever tooling or workflows change.
