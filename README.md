# Trading Terminal

Open-source AI-assisted trading terminal built with TypeScript and Vite.

Trading Terminal is an early-stage open-source project for building a modern market dashboard for developers, researchers, and retail traders. The goal is to provide a transparent, customizable, and extensible terminal for monitoring markets, managing watchlists, reviewing portfolio data, and experimenting with AI-assisted trading insights.

> Status: early-stage public repository. The project is under active development and is being prepared for broader contributor participation.

## Vision

Most trading dashboards are closed, expensive, or difficult to customize. Trading Terminal aims to become a lightweight open-source alternative that developers can inspect, modify, and extend based on their own research and workflow.

The long-term vision is to support:

- Market data dashboards
- Custom watchlists
- Portfolio tracking
- AI-assisted market summaries
- Alerts and notifications
- Backtesting workflows
- Research-friendly trading analytics
- Secure and maintainable open-source development practices

## Planned Features

### 1. Market Dashboard

A clean dashboard for monitoring selected assets, price movements, market conditions, and important trading signals.

### 2. Watchlist

A customizable watchlist for tracking stocks, crypto assets, forex pairs, commodities, or other supported instruments.

### 3. Portfolio Tracker

A simple portfolio view to help users monitor holdings, allocation, performance, and historical changes.

### 4. AI Insight Layer

AI-assisted summaries for market movement, watchlist changes, portfolio notes, and research workflows.

### 5. Alerts

Configurable alerts for price levels, percentage movement, volatility, or custom trading conditions.

### 6. Backtesting

A future module for testing trading ideas against historical data before applying them in real market conditions.

## Roadmap

See [ROADMAP.md](ROADMAP.md) for the public project roadmap and contribution priorities.

### Phase 1 - Project Foundation

- [x] Replace starter-template content with project-specific documentation
- [x] Add MIT License
- [x] Define public roadmap
- [x] Add issue templates
- [x] Add contribution guidelines
- [x] Add basic testing workflow

### Phase 2 - Core Trading Interface

- [x] Build market dashboard layout
- [x] Add asset watchlist
- [x] Add basic portfolio tracker
- [x] Add market data integration
- [x] Add responsive UI improvements

### Phase 3 - AI-Assisted Workflow

- [ ] Add AI-generated market summaries
- [ ] Add AI-assisted portfolio notes
- [ ] Add natural-language research prompts
- [ ] Add documentation automation
- [ ] Add maintainer automation for issue triage and changelog drafting

### Phase 4 - Reliability and Security

- [x] Add unit tests
- [x] Add end-to-end tests
- [x] Add security review workflow
- [x] Add dependency scanning
- [x] Add release checklist

### Phase 5 - Advanced Trading Research

- [x] Add alerting system
- [x] Add backtesting module
- [x] Add strategy comparison tools
- [x] Add exportable reports
- [x] Improve developer plugin architecture

## Tech Stack

- TypeScript
- Vite
- React
- Node.js

## Getting Started

### Prerequisites

Install Node.js and npm.

### Installation

```bash
npm install
```

### Run Locally

```bash
npm run dev
```

### Build

```bash
npm run build
```

### Test

```bash
npm test
```

Run end-to-end tests:

```bash
npm run test:e2e
```

## Market Data

The current dashboard uses CoinGecko public market data for crypto quotes. Local development routes browser requests through the Vite proxy at `/api/coingecko/*` to avoid CORS issues while keeping the client free of API keys.

If the provider is unavailable or rate-limited, the dashboard keeps the interface usable with fallback sample prices and shows a data warning.

## Security

See [docs/security.md](docs/security.md) for the repository security workflow, dependency audit commands, pull request checklist expectations, secret scanning, and safe API key handling.

Run the security checks locally:

```bash
npm run security:check
```

## Release Checklist

See [docs/release-checklist.md](docs/release-checklist.md) for the local, security, browser, and CI gates to complete before tagging or publishing a release.

## Advanced Research

Phase 5 adds local-only research tools: alert evaluation for price and volatility rules, a baseline backtesting comparison, exportable Markdown reports, and a small plugin registry for future data, analysis, and report adapters.

## Open Source Goals

This repository is being developed as an open-source project with the following goals:

- Make trading dashboard development more transparent
- Help developers learn how trading tools can be structured
- Create a foundation for AI-assisted market research workflows
- Improve documentation, testing, and release discipline
- Build a contributor-friendly repository over time

## Contributing

Contributions are welcome as the project matures. Good first areas include documentation, UI improvements, market data integration, testing, and security review.

See [CONTRIBUTING.md](CONTRIBUTING.md) for setup, issue, and pull request guidelines.

Suggested contribution areas:

- Improve README and documentation
- Add issue templates
- Add tests
- Improve dashboard components
- Add market data providers
- Review security practices
- Improve developer experience

## Disclaimer

This project is for educational, research, and software development purposes only. It is not financial advice, investment advice, or a recommendation to buy or sell any asset. Users are responsible for their own research and risk management.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.
