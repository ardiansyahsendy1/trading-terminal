# Trading Terminal Roadmap

This roadmap defines the public direction for Trading Terminal. It is intentionally high level so contributors can understand the sequence of work without depending on private planning notes.

## Phase 1 - Project Foundation

Goal: make the repository understandable, contributor-friendly, and safe to extend.

- [x] Replace starter-template content with project-specific documentation
- [x] Add MIT License
- [x] Define public roadmap
- [x] Add issue templates
- [x] Add contribution guidelines
- [x] Add basic testing workflow

## Phase 2 - Core Trading Interface

Goal: turn the current terminal prototype into a clearer market dashboard foundation.

- [x] Replace the windowed prototype first screen with a dashboard-first trading layout
- [x] Add a dedicated watchlist surface for tracked instruments
- [x] Add a basic portfolio tracker model and view
- [x] Create a reusable market data service boundary
- [x] Improve responsive behavior for smaller screens

Implementation notes:

- The first integration uses CoinGecko public crypto quotes through a Vite proxy.
- Watchlist selection and portfolio holdings are persisted in local storage.
- The portfolio model is covered by unit tests for value, cost basis, P/L, allocation, and holding upserts.
- The dashboard is verified at desktop and mobile viewport widths.

## Phase 3 - AI-Assisted Workflow

Goal: make AI features useful for research while keeping user expectations clear.

- [ ] Add AI-generated market summaries for selected assets
- [ ] Add AI-assisted portfolio notes
- [ ] Add natural-language research prompts
- [ ] Document required API keys and safe local configuration
- [ ] Add maintainer automation for issue triage and changelog drafting

## Phase 4 - Reliability and Security

Goal: improve confidence for contributors and users before expanding integrations.

- [ ] Expand unit test coverage for trading calculations and UI workflows
- [ ] Add end-to-end smoke tests for the terminal
- [ ] Add dependency scanning
- [ ] Add a pull request security checklist
- [ ] Add a release checklist

## Phase 5 - Advanced Trading Research

Goal: support deeper experimentation without turning the project into financial advice.

- [ ] Add alerting for price levels and volatility changes
- [ ] Add a backtesting module for historical scenarios
- [ ] Add strategy comparison tools
- [ ] Add exportable research reports
- [ ] Improve plugin architecture for custom data providers and analysis tools

## Contribution Priorities

Good first areas:

- Documentation improvements
- Issue template improvements
- Indicator calculation tests
- Watchlist UI experiments
- Market data provider research

Higher-risk areas:

- Live data integrations
- AI prompt behavior
- Trading or portfolio calculations
- Security-sensitive configuration

All user-facing trading features should keep the educational disclaimer visible in documentation and avoid presenting generated output as financial advice.
