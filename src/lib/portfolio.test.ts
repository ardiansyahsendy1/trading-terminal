import { describe, expect, it } from 'vitest';
import { buildPortfolioSummary, upsertHolding } from './portfolio';
import type { AssetQuote } from './marketData';

const quoteMap: Record<string, AssetQuote> = {
  bitcoin: {
    id: 'bitcoin',
    symbol: 'BTC',
    name: 'Bitcoin',
    category: 'crypto',
    price: 70000,
    change24h: 1,
    volume24h: 1000,
    source: 'CoinGecko',
  },
  ethereum: {
    id: 'ethereum',
    symbol: 'ETH',
    name: 'Ethereum',
    category: 'crypto',
    price: 2000,
    change24h: -1,
    volume24h: 1000,
    source: 'CoinGecko',
  },
};

describe('portfolio model', () => {
  it('calculates value, pnl, and allocation from holdings and quotes', () => {
    const summary = buildPortfolioSummary(
      [
        { assetId: 'bitcoin', quantity: 0.1, averageCost: 60000 },
        { assetId: 'ethereum', quantity: 1, averageCost: 2500 },
      ],
      quoteMap,
    );

    expect(summary.totalValue).toBe(9000);
    expect(summary.totalCost).toBe(8500);
    expect(summary.totalPnl).toBe(500);
    expect(summary.rows[0].allocation).toBeCloseTo(77.7777);
    expect(summary.rows[1].pnl).toBe(-500);
  });

  it('upserts and removes holdings from draft input', () => {
    const added = upsertHolding([], { assetId: 'bitcoin', quantity: 0.2, averageCost: 50000 });
    const updated = upsertHolding(added, { assetId: 'bitcoin', quantity: 0.3, averageCost: 55000 });
    const removed = upsertHolding(updated, { assetId: 'bitcoin', quantity: 0, averageCost: 55000 });

    expect(added).toEqual([{ assetId: 'bitcoin', quantity: 0.2, averageCost: 50000 }]);
    expect(updated).toEqual([{ assetId: 'bitcoin', quantity: 0.3, averageCost: 55000 }]);
    expect(removed).toEqual([]);
  });
});
