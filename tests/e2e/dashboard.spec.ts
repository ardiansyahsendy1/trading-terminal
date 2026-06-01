import { expect, test } from '@playwright/test';

const coinGeckoFixture = {
  bitcoin: {
    usd: 74000,
    usd_24h_change: 1.25,
    usd_24h_vol: 18000000000,
    last_updated_at: 1780231749,
  },
  ethereum: {
    usd: 2100,
    usd_24h_change: -0.5,
    usd_24h_vol: 7000000000,
    last_updated_at: 1780231749,
  },
  solana: {
    usd: 85,
    usd_24h_change: 2.1,
    usd_24h_vol: 1200000000,
    last_updated_at: 1780231749,
  },
  cardano: {
    usd: 0.25,
    usd_24h_change: 0.4,
    usd_24h_vol: 250000000,
    last_updated_at: 1780231749,
  },
  chainlink: {
    usd: 8,
    usd_24h_change: -1,
    usd_24h_vol: 240000000,
    last_updated_at: 1780231749,
  },
  'avalanche-2': {
    usd: 14,
    usd_24h_change: 0.8,
    usd_24h_vol: 310000000,
    last_updated_at: 1780231749,
  },
};

test.beforeEach(async ({ page }) => {
  await page.route('**/api/coingecko/simple/price**', async (route) => {
    await route.fulfill({
      contentType: 'application/json',
      body: JSON.stringify(coinGeckoFixture),
    });
  });
});

test('renders market dashboard with mocked market data', async ({ page }) => {
  await page.goto('/');

  await expect(page.getByRole('heading', { name: 'Trading Terminal' })).toBeVisible();
  await expect(page.getByText('Source: CoinGecko')).toBeVisible();
  await expect(page.locator('.text-xs.uppercase', { hasText: 'Portfolio Value' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'AI Insight Layer' })).toBeVisible();
  await expect(page.getByText('Market Summary')).toBeVisible();
  await expect(page.getByText('Portfolio Notes')).toBeVisible();
  await expect(page.getByLabel('Research Prompt')).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Portfolio Tracker' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Asset Watchlist' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Alerts' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Backtesting' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Research Report' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Plugin Architecture' })).toBeVisible();
  await expect(page.getByRole('button', { name: /BTC/ }).first()).toBeVisible();

  const chartCount = await page.locator('.recharts-wrapper').count();
  expect(chartCount).toBeGreaterThanOrEqual(2);
});

test('updates portfolio holdings from the input form', async ({ page }) => {
  await page.goto('/');

  await page.getByLabel('Asset').selectOption('chainlink');
  await page.getByLabel('Quantity').fill('10');
  await page.getByLabel('Average Cost').fill('7');
  await page.getByRole('button', { name: 'Save Holding' }).click();

  await expect(page.getByRole('cell', { name: 'LINK' })).toBeVisible();
  await expect(page.getByRole('cell', { name: '$80.00' })).toBeVisible();
});

test('recovers from malformed local storage state', async ({ page }) => {
  await page.addInitScript(() => {
    window.localStorage.setItem('terminal-watchlist-v1', '{not-json');
    window.localStorage.setItem('terminal-portfolio-v1', JSON.stringify([{ assetId: 'unknown', quantity: -1 }]));
  });

  await page.goto('/');

  await expect(page.getByRole('heading', { name: 'Trading Terminal' })).toBeVisible();
  await expect(page.getByRole('button', { name: /BTC/ }).first()).toBeVisible();
  await expect(page.getByRole('row', { name: /BTC Bitcoin/ })).toBeVisible();
});

test('stays within the mobile viewport width', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');

  const dimensions = await page.evaluate(() => ({
    innerWidth: window.innerWidth,
    scrollWidth: document.documentElement.scrollWidth,
  }));

  expect(dimensions.scrollWidth).toBeLessThanOrEqual(dimensions.innerWidth);
});
