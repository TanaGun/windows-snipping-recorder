# Windows Snipping Recorder

A **local-only** screen capture and recording utility for **Windows 10 and Windows 11** — built in public, with privacy as a hard requirement.

**Status: early prototype.** The current prototype is a browser-based (Vite + React) UI. Native Windows capture — screen region/window/display capture via Windows Graphics Capture, system audio via WASAPI loopback, and microphone mixing — is **planned but not yet implemented** (see [Roadmap](#roadmap) and [product brief](docs/product-brief.md)).

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

**Current prototype (browser UI):**
- React + Vite + TypeScript frontend scaffold.
- Native integration contract (enums, request types, capability manifest) defined in `src-tauri/src/lib.rs` — compile-time documentation of the planned capture/audio boundary, **not a working implementation**.

**Planned (native, via Tauri):**
- Region / window / full-display capture.
- Recording with system audio (WASAPI loopback), microphone, or both, with A/V sync.
- Explicit, user-friendly errors for protected content, missing devices, and permission failures.

## Roadmap

1. **Prototype UI** — browser-based capture UX (in progress).
2. **Tauri shell** — native window + secure local file access.
3. **Native capture** — Windows Graphics Capture (region/window/display).
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

The current browser prototype is intentionally a UI simulation: it does not capture screens, access devices, write media files, copy to the clipboard, or make network requests. CI runs `npm run build`; lint is skipped until a dedicated lint script is added.

### Future — Tauri native build (planned)

When the Tauri shell and native capture land, a full desktop build additionally requires:

- **Rust** toolchain via [rustup](https://rustup.rs) (stable).
- **Microsoft C++ Build Tools** — Visual Studio Build Tools with the "Desktop development with C++" workload.
- **WebView2 Runtime** — preinstalled on Windows 11; installable on Windows 10.

The crate contract in `src-tauri/` intentionally does **not** compile until the Tauri dependency set is installed, so a plain `npm run build` never depends on native prerequisites.

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