<div align="center">
  <img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# tesouroQR

tesouroQR is a drag-and-drop treasure hunt builder and QR-code powered play experience. Gamemasters configure photo hints, lock them to QR codes, and deploy to mobile via Capacitor.

## Features

- **Configurar Jogo** – visually reorder pistas with draggable cards, pick gallery photos, and automatically map hints to `tesouroQR-01..10` codes.
- **Play Mode** – scan QR codes to reveal the next hint image until the treasure is found.
- **Persistent storage** – saves configured hunts to `localStorage` on web; native builds use the same data bundle.
- **Capacitor mobile shell** – ready to run on Android (and iOS if added) with camera + gallery permissions.

## Quick Start

### Requirements

- Node.js 18+
- npm 10+

### Install & Run (Web)

```bash
npm install
npm run dev
```

Optional: set `GEMINI_API_KEY` in `.env.local` if you plan to call Gemini APIs (not required for current flow).

### Production Build (Web)

```bash
npm run build
npm run preview   # optional local preview
```

## Mobile (Capacitor) Workflow

1. **Build web assets**
   - Stable: `npm run build`
   - Experimental: `npm run build -- --outDir dist-experimental`
2. **Sync to Android**
   ```bash
   npx cap copy android            # uses dist/
   # or copy dist-experimental manually to android/app/src/main/assets/public
   ```
3. **Run in Android Studio**
   ```bash
   npx cap open android
   ```
   Choose a device/emulator, hit ▶, and grant camera + photo permissions when prompted.
4. **Icons/Splash** – use Android Studio’s *Image Asset* wizard (res ➜ New ➜ Image Asset) or `npx capacitor-assets generate --icon icon.png`.

Permissions already included:

- `android.permission.CAMERA`
- `android.permission.READ_MEDIA_IMAGES` (Android 13+)
- `android.permission.READ_EXTERNAL_STORAGE` (Android 12-)

## Testing Drag & Drop on Device

- Long-press a pista thumbnail ~150 ms, then drag to reorder.
- Tap **Escolher foto** to pull from the native gallery (Capacitor Camera plugin).
- QR codes stay bound to their position (`Pista 1 → tesouroQR-01`).

## Experimental Builds

Keep `dist-experimental/` separate to avoid overwriting stable assets:

```bash
npm run build -- --outDir dist-experimental
rm -rf android/app/src/main/assets/public
cp -R dist-experimental android/app/src/main/assets/public
```

Restore stable by copying back your backup under `android/app/src/main/assets/public-stable-*` or re-running `npm run build && npx cap copy android`.

## Resources

- AI Studio App: https://ai.studio/apps/drive/130PbfGrcJQr04Cvq3368KwFOr8wle6zn
- Capacitor docs: https://capacitorjs.com/docs

## Troubleshooting

- **Drag fails on mobile** – ensure you long-press first; sensors require a short delay. Reinstall after running `npx cap sync android`.
- **Camera/gallery blocked** – verify HTTPS (or localhost) in dev and that permissions are granted in Android settings.
- **Push rejected** – `git pull --rebase origin main`, resolve conflicts, then push.
