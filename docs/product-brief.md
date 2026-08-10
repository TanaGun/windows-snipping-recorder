# Product Brief — Windows Snipping Recorder

**Status:** Draft · **Last updated:** 2026-08 · **License:** MIT · **Platform:** Windows 10 & 11 only

## 1. Summary

Windows Snipping Recorder is a privacy-first, local-only screen capture and recording utility for Windows 10/11. Users can capture a region, window, or the full display and record it — optionally with system audio and/or microphone — with every byte staying on their machine. No account, no cloud, no share links, no telemetry.

## 2. Problem & motivation

Existing screen recorders sit on a spectrum: built-in options (Xbox Game Bar, Snipping Tool) are limited; feature-complete tools increasingly push cloud upload, account creation, telemetry, and subscription pricing. Users who want "just capture this region and record it, locally, with audio" have no clean option that is open source, Windows-native, and explicitly local-only.

## 3. Goals

- One-click capture of a screen region, window, or display on Windows 10/11.
- Recording with **system audio** (WASAPI loopback), **microphone**, both, or neither, with correct A/V sync.
- Storage is local files only; the app never initiates network I/O except (optionally, and never silently) version checks.
- Clear, actionable error messages — especially for protected content, missing devices, and permission failures.
- Open source (MIT), auditable, and documented well enough that a user can verify the privacy claims in the code.

## 4. Non-goals (explicitly out of scope)

- Cloud storage, sharing, or sync of any kind.
- Accounts, licensing servers, or DRM'd output.
- Telemetry/analytics/crash reporting.
- macOS/Linux support.
- Video editing, effects, or transcoding pipelines beyond the minimum needed to produce a playable file.

## 5. Target users

- Developers, trainers, and support staff recording on-screen demos locally.
- Privacy-conscious users who refuse cloud-bound recorders.
- Anyone on Windows 10/11 who wants a dependable "record this region with audio" tool.

## 6. Architecture

**Current (prototype):** a browser-based UI built with React + Vite + TypeScript. It exercises capture/recording UX flows without any native code. The `src-tauri` crate currently contains a **compile-time contract only** (capture source and audio request types, capability manifest) — it documents the planned native boundary but implements no capture or audio. It intentionally does not compile until the Tauri dependency set is installed.

**Planned (native):** a Tauri shell hosting the same UI, with native modules for:

- **Windows Graphics Capture** — region/window/display frame capture.
- **WASAPI loopback** — system audio capture.
- **Microphone capture** — WASAPI capture + mixing with system audio.
- **Encoding/muxing** — timestamped A/V muxing via an encoder such as FFmpeg.

All planned native modules are Windows 10/11 only. DRM-protected content will produce an explicit error; the app will never attempt to bypass OS/DRM protections.

## 7. Privacy principles (binding)

1. **Local-first by construction.** Screen frames and audio live in memory and on local disk only.
2. **No hidden I/O.** Any future network feature (e.g., manual version check) must be explicit, documented, and opt-in.
3. **Auditable.** Privacy claims must be verifiable from the source; CI blocks nothing that hides behavior.
4. **Clean failure.** When capture is blocked (protected content, permission, device), the user gets a clear error — not silent behavior.

## 8. Roadmap

| Milestone | Scope |
|---|---|
| M1 — Prototype UI | Browser-based capture UX (current) |
| M2 — Tauri shell | Native window, file access, capability checks |
| M3 — Native capture | Windows Graphics Capture: region/window/display |
| M4 — System audio | WASAPI loopback recording |
| M5 — Microphone | Mic capture + mixing + A/V sync |
| M6 — Release | Installers, code signing (optional), GitHub Releases |

## 9. Risks & open questions

- **Permission UX:** Windows screen-capture permissions (Graphics Capture consent) must be surfaced cleanly.
- **Protected content:** behavior matrix for DRM media needs user testing.
- **Encoding cost:** real-time A/V mux performance targets to be validated on mid-range hardware.
- **Audio device changes:** hot-plug and default-device switching during recordings.
- **Tauri supply chain:** native dependencies must stay pinned and audited.

Measured against [acceptance criteria](acceptance-criteria.md).