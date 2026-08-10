# Windows Snipping Recorder

A **local-only** screen capture and recording utility for **Windows 10 and Windows 11** — built in public, with privacy as a hard requirement.

**Status: early native build.** The Tauri desktop app now captures the primary display to a local PNG file. Region/window capture, recording, WASAPI system audio, microphone mixing, annotation, clipboard, and history remain planned (see [Roadmap](#roadmap) and [product brief](docs/product-brief.md)).

## Why this project exists

It should be trivially easy to capture a region of your screen and record it — with system audio and/or your microphone — without sending a single byte to a cloud service, without creating an account, and without telemetry. Windows Snipping Recorder is that tool.

## Hard requirements

This project will never:

- Upload captures or recordings anywhere (no cloud storage, no share links).
- Require an account or sign-in.
- Collect, transmit, or log analytics/telemetry.
- Attempt to bypass OS or DRM copy-protection for protected content (e.g., DRM video playback). Protected-content capture will fail with a clear, explicit error.

Everything runs locally on your machine. Recordings stay in your folders until you delete them.

## Platform support

| Component | Support |
|---|---|
| Web prototype UI | Windows 10 / 11 (dev-tested on Windows; see [Building](#building)) |
| Native capture + audio (planned) | **Windows 10 / 11 only** — Windows Graphics Capture + WASAPI. Not macOS/Linux. |

## Features

**Working in the current native build:**
- Tauri 2 + React + TypeScript Windows desktop application.
- Primary-display and drag-selected region PNG capture using Windows GDI (`CAPTUREBLT`).
- Visible-window picker and window-bounds PNG capture using Windows GDI (`CAPTUREBLT`).
- Captures save locally under `Pictures\\SnipRecord\\captures` (no network requests).
- NSIS installer build pipeline.

**Planned next:**
- Recording with system audio (WASAPI loopback), microphone, or both, with A/V sync.
- Annotation and local history.
- Explicit errors for protected content, missing devices, and permission failures.

After any native capture, SnipRecord displays the actual local PNG in the preview and can copy it to the Windows clipboard. The saved PNG stays under `Pictures\SnipRecord\captures`.

## Roadmap

1. **Primary-display PNG capture** — complete in the early Tauri build.
2. **Region and window selection** — next capture milestone.
3. **Annotation, clipboard, and local history** — local file workflow.
4. **System audio** — WASAPI loopback.
5. **Microphone mixing** — A/V sync + encoding (FFmpeg-based pipeline planned).
6. **Release** — signed/unsigned installers via GitHub Releases.

Tracked in the [product brief](docs/product-brief.md) and measured against the [acceptance criteria](docs/acceptance-criteria.md).

## Building

### Current prototype — browser UI

The prototype is a standard Vite + React app. Requirements:

- [Node.js](https://nodejs.org) **20.19+** (or 22.x LTS) and npm.

```bash
npm ci            # install locked dependencies
npm run dev       # start the Vite development server
npm run build     # type-check and create the production bundle in dist/
```

Use the native desktop build for real capture:

```bash
npm run tauri:dev      # run the Windows desktop application
npm run tauri:build    # create an NSIS installer
```

The browser UI is a visual preview only. Real primary-display capture is available only in the Tauri desktop application; it writes a PNG locally and makes no network requests. Region/window capture, recording, audio, clipboard, and annotation are not implemented yet. CI runs `npm run build`; lint is skipped until a dedicated lint script is added.

### Native build prerequisites

A full desktop build requires:

- **Rust** toolchain via [rustup](https://rustup.rs) (stable).
- **Microsoft C++ Build Tools** — Visual Studio Build Tools with the "Desktop development with C++" workload.
- **WebView2 Runtime** — preinstalled on Windows 11; installable on Windows 10.

`npm run build` builds the web bundle without native prerequisites. `npm run tauri:build` requires the Windows native toolchain above.

## Project layout

```
src/            React + Vite + TypeScript frontend
src-tauri/      Tauri/Rust native integration contract (capture/audio planned)
docs/           product brief, acceptance criteria
.github/        CI, release workflow, issue templates
```

User recordings and app data (`captures/`, `recordings/`, `output/`, `data/`, `logs/`) are git-ignored and never published.

## Contributing & security

- [CONTRIBUTING.md](CONTRIBUTING.md) — how to build, test, and submit changes. PRs that add cloud upload, accounts, or telemetry will be closed on sight.
- [SECURITY.md](SECURITY.md) — how to report a vulnerability.

## License

MIT — see [LICENSE](LICENSE).