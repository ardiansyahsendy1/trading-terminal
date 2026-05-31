import { cleanup, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import App from './App';

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

describe('App', () => {
  beforeEach(() => {
    window.localStorage.clear();
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        new Response(JSON.stringify(coinGeckoFixture), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }),
      ),
    );
  });

  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
  });

  it('renders the trading terminal dashboard with fetched market data', async () => {
    render(<App />);

    expect(screen.getByRole('heading', { name: 'Trading Terminal' })).toBeTruthy();
    expect(screen.getByRole('heading', { name: 'Portfolio Tracker' })).toBeTruthy();

    await waitFor(() => {
      expect(screen.getByText('Source: CoinGecko')).toBeTruthy();
    });

    expect(screen.getAllByRole('button', { name: /BTC/ }).length).toBeGreaterThan(0);
  });
});
