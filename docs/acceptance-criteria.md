# Acceptance Criteria — Windows Snipping Recorder

Each criterion is testable and has an explicit **status**. "Planned" criteria are **not** satisfied today; nothing here claims native capture or audio is implemented.

Legend: ✅ Met · 🚧 In progress · ⬜ Planned (not implemented)

## A. Prototype UI (browser, current)

| ID | Criterion | Status |
|---|---|---|
| P-01 | The app launches in a browser via `npm run dev` on Windows 10/11 with no native prerequisites. | 🚧 (scaffold in progress; no entry point committed yet) |
| P-02 | The UI exposes region / window / display capture modes and system-audio / microphone toggles. | 🚧 (UI scaffold; capture modes are placeholders) |
| P-03 | The UI never initiates network requests to non-local hosts. | ✅ (by construction: no fetch/XHR/WebSocket code paths exist) |
| P-04 | `npm ci && npm run build` completes on `windows-latest` CI. | 🚧 (workflow in place; requires `build` script to be added) |
| P-05 | `npm run lint` passes when a `lint` script is defined. | 🚧 (script not yet defined; CI skips gracefully) |

## B. Native capture (planned — Windows Graphics Capture)

| ID | Criterion | Status |
|---|---|---|
| N-01 | Region capture records exactly the selected rectangle at the chosen frame rate. | ⬜ |
| N-02 | Window capture follows a chosen window regardless of position/occlusion (per Windows Graphics Capture). | ⬜ |
| N-03 | Display/full-screen capture records a selected monitor at native resolution. | ⬜ |
| N-04 | Protected/DRM content yields an explicit error; capture never silently produces black/empty frames without explanation, and no bypass is attempted. | ⬜ |
| N-05 | Capture of an unavailable device (disconnected monitor, destroyed window) fails fast with a clear message. | ⬜ |

## C. System audio (planned — WASAPI loopback)

| ID | Criterion | Status |
|---|---|---|
| S-01 | System audio is recorded when enabled, in sync with video. | ⬜ |
| S-02 | Changing the default output device during a recording does not crash; behavior is documented. | ⬜ |
| S-03 | When a recording uses only system audio, the microphone is not captured. | ⬜ |
| S-04 | System audio capture is marked "planned" in the UI until implemented — the app must not imply it works. | ⬜ (UI is scaffold; native audio is contract-only) |

## D. Microphone (planned)

| ID | Criterion | Status |
|---|---|---|
| M-01 | Microphone audio is captured when enabled, at the selected input device. | ⬜ |
| M-02 | Mic + system audio are mixed with correct A/V sync (timestamped muxing). | ⬜ |
| M-03 | Mikeless capture works; a missing/revoked mic permission fails with a clear error. | ⬜ |

## E. Privacy & data handling

| ID | Criterion | Status |
|---|---|---|
| PR-01 | Recordings and captures are written only to local paths under the user's control (`captures/`, `output/`, `data/`). | ✅ (no capture code exists; paths are git-ignored by design) |
| PR-02 | No account, cloud upload, share link, or telemetry exists in any code path. | ✅ (by construction) |
| PR-03 | No screenshots or recordings are ever committed to the repository. | ✅ (enforced by `.gitignore`) |
| PR-04 | App logs contain no screen content or audio and are opt-in for support. | ✅ (no logging implementation; log dirs ignored) |

## F. Platform & release

| ID | Criterion | Status |
|---|---|---|
| R-01 | The app runs only on Windows 10/11; prerequisites are documented in README. | ✅ (documented) |
| R-02 | Publishing a `v*` tag triggers CI build + GitHub Release automatically. | ✅ (workflow in place; first release pending) |
| R-03 | Pre-1.0: releases are labeled clearly and prior versions are unsupported per SECURITY.md. | ✅ (documented) |
| R-04 | Native installers (NSIS/MSI) produce a runnable app on clean Windows 10/11. | ⬜ |

## Acceptance rule

A feature is "done" only when its criteria are ✅ **and** verified on a clean Windows 10/11 machine — browser prototypes do not satisfy native criteria (B–D).