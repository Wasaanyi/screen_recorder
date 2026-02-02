# CLAUDE.md

Project context for Claude Code.

## Project Overview

Screen Recorder is an Electron desktop application for recording screens with webcam overlay, annotations, and video editing. It targets Windows, macOS, and Linux.

## Tech Stack

- **Electron 28** (main process) + **React 18** (renderer) + **TypeScript**
- **Vite 5** for build tooling with `vite-plugin-electron`
- **Tailwind CSS** for styling
- **FFmpeg** (bundled via `ffmpeg-static` / `ffprobe-static`) for video processing
- **electron-builder** for packaging (NSIS, DMG, AppImage, deb)

## Architecture

The app uses a multi-window architecture with 4 renderer processes:

| Window | Path | Purpose |
|--------|------|---------|
| Control | `src/renderer/control/` | Main UI - source selection, recording controls, settings |
| Overlay | `src/renderer/overlay/` | Transparent fullscreen canvas for annotations |
| Webcam | `src/renderer/webcam/` | Floating webcam preview |
| Editor | `src/renderer/editor/` | Video timeline, trim, export |

**Main process** (`src/main/`): Window management, IPC handlers, recording state, FFmpeg operations, system tray.

**Preload** (`src/preload/index.js`): Context bridge exposing `window.electronAPI`. Written in CommonJS (required by Electron).

**Shared** (`src/shared/`): TypeScript types, IPC channel constants, app constants.

## Key Patterns

- IPC channels are defined in `src/shared/ipc-channels.ts` and duplicated in `src/preload/index.js` (preload can't import ES modules)
- Recording uses MediaRecorder in renderer, streams chunks to main process via IPC, writes to disk as WebM, then converts to MP4 via FFmpeg
- FFmpeg binaries are ASAR-unpacked (`asarUnpack` in package.json) and path-resolved in `src/main/ffmpeg.ts`
- Platform-specific code is guarded by `process.platform` checks (darwin/win32/linux)

## Build & Run

```bash
npm run dev            # Development with hot-reload
npm run build:app      # TypeScript + Vite build (no packaging)
npm run package        # Package for Windows
npm run package:mac    # Package for macOS (must run on macOS)
npm run package:linux  # Package for Linux
npm run typecheck      # Type checking only
```

## Important Files

- `package.json` `"build"` section: electron-builder configuration for all platforms
- `build/entitlements.mac.plist`: macOS permissions (camera, microphone, hardened runtime)
- `scripts/afterPack.js`: Post-packaging hook to set FFmpeg binary permissions on macOS/Linux
- `scripts/generate-icons.js`: Generates all icon sizes from `assets/icons/screen-recorder-icon.svg`
- `.github/workflows/release.yml`: CI/CD pipeline building on Windows, macOS, and Linux runners

## Conventions

- Version is tracked in both `package.json` and `src/shared/constants.ts` (keep in sync)
- Commit messages follow conventional commits (`feat:`, `fix:`, `chore:`)
- Git tags trigger CI builds (`v*` pattern, e.g., `v1.1.0`)
- Default recording output: `~/Videos/Screen Recordings` (Windows/Linux), `~/Movies/Screen Recordings` (macOS)
