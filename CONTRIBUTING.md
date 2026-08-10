# Contributing to Windows Snipping Recorder

Thanks for wanting to help! This project is public, MIT-licensed, and built around one non-negotiable constraint: **everything stays on the user's machine**.

## Ground rules

- **No cloud.** No upload, no cloud sync, no share links, no accounts.
- **No telemetry.** No analytics, no crash reporting that leaves the device, no usage tracking.
- **No DRM bypass.** Protected content must fail with a clear error — never attempt to work around OS/DRM protections.
- **Windows 10/11 only** for native capture/audio. Design for one platform and do it well.
- Keep recordings out of git. Never commit captures, logs, or `data/` output (see `.gitignore`).

PRs that violate the ground rules will be closed without review. These are product requirements, not style preferences — see [docs/product-brief.md](docs/product-brief.md).

## Getting started

1. Fork the repository and clone your fork.
2. Install [Node.js 20.19+](https://nodejs.org) and npm.
3. Install dependencies: `npm ci`
4. Run the dev server: `npm run dev`

### Native (Tauri) work — planned

Native capture/audio work will additionally require the Rust toolchain (via [rustup](https://rustup.rs)) and the Windows C++ Build Tools (Visual Studio Build Tools, "Desktop development with C++" workload). The current `src-tauri` crate is a compile-time contract only and is **not** a working implementation — do not assume capture or audio works until the acceptance criteria ([docs/acceptance-criteria.md](docs/acceptance-criteria.md)) say otherwise.

## Making changes

- Open an issue or draft PR early for anything non-trivial — the scope here is small and focused.
- Keep changes minimal and reviewable. One logical change per PR.
- Frontend changes: verify with `npm run build` (and `npm run lint`, if defined) on **Windows**.
- Native changes: run `cargo test` inside `src-tauri/` and confirm the crate builds on Windows.
- Do not bump dependencies casually; use `npm ci` and commit `package-lock.json`.

## Commit style

- Small, descriptive commits in the imperative mood: `Add region-selection overlay`, `Fix microphone flag not persisting`.
- Reference issues where relevant.
- Conventional prefixes (feat:, fix:, docs:, ci:, chore:) are welcome, not required.

## Tests

- Any logic worth keeping is worth a test. Rust-side unit tests live beside the code (`cargo test`).
- Frontend tests are planned; until a harness exists, manual verification via the dev server is acceptable — note what you verified in the PR description.

## Code of conduct

Be respectful, constructive, and patient. Harassment of any kind is not tolerated. This project is for everyone.

## License

By contributing you agree that your contributions are licensed under the [MIT License](LICENSE).