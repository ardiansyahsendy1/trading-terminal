# AI-Assisted Workflow

Trading Terminal uses local AI-assist primitives for the first Phase 3 implementation. The dashboard generates market summaries, portfolio notes, and natural-language research responses from the current quote, portfolio, alert, and strategy state.

This keeps the browser bundle free of private API keys while still giving contributors a stable interface for future model-backed providers.

## User-Facing Features

- Market summaries describe the selected asset, 24-hour movement, volume, watchlist leader, and triggered alerts.
- Portfolio notes summarize portfolio posture, concentration, and review candidates.
- Natural-language research prompts return a concise research response with a non-financial-advice guardrail.
- Documentation automation drafts Phase 3 documentation notes from completed items.
- Maintainer automation drafts issue triage and changelog sections from supplied issue/change lists.

## API Keys

No API key is required for the current browser workflow.

If a future model-backed provider is added:

- keep `OPENAI_API_KEY` or other private keys in `.env.local`;
- do not expose private keys through `VITE_*` variables;
- run model-backed calls through a server-side route, serverless function, or local maintainer script;
- document new environment variables in `.env.example` and `docs/security.md`.

## Maintainer Scripts

Run local automation drafts with:

```bash
npm run docs:ai
npm run maintainers:digest
```

The scripts are deterministic and do not call external AI services.
