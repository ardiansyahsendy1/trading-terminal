# Security Review Workflow

This repository uses a lightweight security foundation for dependency hygiene, pull request review, and secret prevention.

## Dependency Review

Current dependency baseline:

- Runtime dependencies: React, React DOM, Recharts
- Development dependencies: Vite, TypeScript, Vitest, Tailwind CSS, React plugin for Vite, Node types
- Lockfile: `package-lock.json`
- CI install command: `npm ci`

Security checks:

```bash
npm run security:audit
npm run security:secrets
npm run security:check
```

The `Security` GitHub Actions workflow runs:

- `npm audit --audit-level=moderate` on pushes, pull requests, manual dispatch, and a weekly schedule
- GitHub dependency review on pull requests
- a repository secret scan using `scripts/security-secret-scan.mjs`

## API Keys and Environment Variables

Do not commit real API keys, tokens, passwords, private keys, cookies, or service credentials.

Use this local setup pattern:

```bash
copy .env.example .env.local
```

Then set real values only in `.env.local`.

Important browser rule:

- Values exposed to Vite client code are public in the browser bundle.
- Do not put private API keys in `VITE_*` variables.
- Secret-backed features should run through a server-side API, serverless function, or local maintainer script.

The current market data integration does not require an API key. It uses CoinGecko public quotes through the Vite proxy configured in `vite.config.ts`.

The current AI-assisted workflow also does not require an API key. It generates local summaries, portfolio notes, and research prompt responses from dashboard state. If a future model-backed provider is added, keep provider calls outside browser-delivered code and document the required secret in `.env.example`.

## Pull Request Security Checklist

Every pull request should use `.github/pull_request_template.md` and confirm:

- no secrets were committed
- dependency changes were reviewed
- new environment variables are documented in `.env.example`
- unsafe DOM sinks were avoided
- network loading, error, and fallback states were considered

## Secret Prevention

The repository ignores local environment files:

- `.env`
- `.env.*`
- `*.local`

The only committed environment file should be `.env.example`, and it must contain placeholders or empty values only.

Run the secret scan before pushing:

```bash
npm run security:secrets
```

If the scan flags a real secret:

1. Remove the secret from the repository.
2. Rotate or revoke the exposed credential.
3. Re-run `npm run security:check`.
4. Document any new safe configuration in `.env.example`.

## Frontend Security Notes

Trading Terminal is a React/Vite frontend. Keep these defaults:

- Render untrusted strings through normal React JSX escaping.
- Avoid `dangerouslySetInnerHTML`, `innerHTML`, `document.write`, `eval`, and string-based timers.
- Treat `localStorage` as non-sensitive UI state only.
- Validate provider responses before using them in calculations or UI.
- Keep secret-bearing integrations out of browser-delivered code.
