# Release Checklist

Use this checklist before tagging or publishing a Trading Terminal release.

## 1. Scope

- [ ] Confirm the release goal and included issues or pull requests.
- [ ] Confirm there are no unrelated changes in the release branch.
- [ ] Review README, ROADMAP, and docs for user-visible changes.
- [ ] Confirm the educational and non-financial-advice disclaimer still applies to new features.

## 2. Local Verification

Run the full local gate:

```bash
npm ci
npm run security:check
npm test
npm run test:e2e
npm run build
npx tsc --noEmit
```

Expected result:

- [ ] Dependency install is reproducible with `npm ci`.
- [ ] Secret scan passes.
- [ ] Dependency audit reports no moderate-or-higher vulnerabilities.
- [ ] Unit tests pass.
- [ ] End-to-end tests pass.
- [ ] Production build succeeds.
- [ ] TypeScript reports no errors.

## 3. Security Review

- [ ] Review any dependency changes in `package.json` and `package-lock.json`.
- [ ] Confirm `.env`, `.env.*`, and `*.local` files are not staged.
- [ ] Confirm `.env.example` contains placeholders only.
- [ ] Confirm no API keys or secret-backed logic are shipped to browser-delivered code.
- [ ] Confirm new network requests have loading, error, and fallback states.
- [ ] Confirm no unsafe DOM sinks were added.

## 4. Browser Smoke Test

Run the app locally:

```bash
npm run dev
```

Then verify:

- [ ] Dashboard loads at `http://127.0.0.1:3000/`.
- [ ] Market data source is visible.
- [ ] Watchlist assets render.
- [ ] Portfolio tracker renders current value, cost basis, P/L, and allocation.
- [ ] Holding input can add or update a holding.
- [ ] Desktop viewport has no horizontal overflow.
- [ ] Mobile viewport has no horizontal overflow.
- [ ] Browser console has no unexpected errors.

## 5. CI and GitHub

- [ ] GitHub Actions `Test` workflow passes.
- [ ] GitHub Actions `Security` workflow passes.
- [ ] Relevant issues are linked or closed with implementation evidence.
- [ ] Release notes mention user-visible changes, security changes, and known limitations.

## 6. Tagging

Use semantic versioning once the project begins publishing releases.

```bash
git tag v0.1.0
git push origin v0.1.0
```

Do not tag until the local and GitHub verification gates are green.
