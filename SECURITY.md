# Security Policy

## Our security posture

Windows Snipping Recorder is a **local-only** application. Its core security properties are:

- Captures and recordings never leave the device — no upload, no cloud, no share links.
- No telemetry, analytics, or crash reporting off-device.
- Sensitive data (screen content, audio, personal files under `data/`, logs) is protected by treating every byte as private-by-default.
- Protected content (e.g., DRM video) must surface a clear, explicit error — never a bypass.

A bug that breaks any of these properties is treated as a security vulnerability.

## Supported versions

| Version | Status |
|---|---|
| Latest release | ✅ Supported |
| `main` branch | ⚠️ Best effort (pre-1.0, no formal release support) |
| Older releases | ❌ Unsupported |

## Preventing accidental secret commits

- Never commit passwords, API keys, OAuth tokens, `.env` files, private keys, signing certificates, databases, captures, recordings, logs, or customer data.
- Keep local values in ignored files such as `.env.local`; commit only a redacted `.env.example` when configuration documentation is needed.
- Run `gitleaks detect --source . --log-opts="--all" --redact` before every push. CI also runs the same secret scan for every push and pull request.
- If a secret is exposed, revoke or rotate it immediately. Removing the file in a later commit is insufficient: rewrite the affected Git history and force-push only after rotation.

## Reporting a vulnerability

**Please do not open a public issue for security vulnerabilities.**

Report privately using GitHub's **private vulnerability reporting**:

1. Open the repository's **Security** tab → **Report a vulnerability**.
2. Describe the issue, the affected component (web prototype vs. planned native capture), and minimal steps to reproduce.
3. Include Windows version/build, and any relevant configuration — **but never attach personal screen recordings or audio**.

You'll receive an acknowledgment within 7 days and a target for a fix. If private reporting is unavailable on the repository, email the maintainer directly through the contact listed on their GitHub profile, referencing this project.

## Scope

In scope:

- Local file handling of captures/recordings (path traversal, symlink issues, accidental exposure).
- Native capture/audio boundary once implemented (permissions, device enumeration, protected-content handling).
- Any code path that could exfiltrate screen, audio, or personal data.
- Build/dependency supply-chain issues (CI, lockfiles).

Out of scope:

- Vulnerabilities in third-party dependencies that are not reachable from this app's code — report those upstream.

## Processing expectations

- Acknowledgment: within 7 days.
- Status update: within 30 days.
- We coordinate disclosure and credit reporters unless they prefer anonymity.