# Contributing to Trading Terminal

Thanks for your interest in Trading Terminal. This project is early-stage, so the best contributions are clear, focused, and easy to review.

## Ways to Contribute

- Improve documentation and examples
- Add tests for trading calculations and UI behavior
- Research market data providers
- Improve the dashboard, watchlist, and portfolio tracker
- Review dependency and API key handling
- Suggest contributor-friendly issues

## Local Setup

Install dependencies:

```bash
npm install
```

Run the app locally:

```bash
npm run dev
```

Run tests:

```bash
npm test
```

Build the app:

```bash
npm run build
```

## Pull Request Guidelines

- Keep each pull request focused on one change.
- Link the related issue when possible.
- Include tests for logic changes.
- Update documentation when behavior, setup, or configuration changes.
- Do not commit secrets, API keys, tokens, or private account data.
- Keep trading and AI output framed as educational and research-oriented.

## Issue Guidelines

Before opening an issue:

- Search existing issues for related work.
- Use the most relevant issue template.
- Include screenshots or reproduction steps for UI bugs.
- Include provider names, API requirements, and rate-limit notes for market data proposals.

## Security and Responsible Use

Trading Terminal is for educational, research, and software development purposes only. It is not financial advice.

Do not submit:

- Real brokerage credentials
- Private API keys
- Personal financial account data
- Claims that the project can guarantee trading results

If you find a security concern, open a minimal issue that describes the impact without exposing secrets or exploit details.
