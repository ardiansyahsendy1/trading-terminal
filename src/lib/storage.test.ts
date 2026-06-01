import { describe, expect, it } from 'vitest';
import { ASSET_UNIVERSE, DEFAULT_WATCHLIST_IDS } from './marketData';
import { validateHoldings, validateWatchlistIds } from './storage';

const fallbackHoldings = [{ assetId: 'bitcoin', quantity: 0.1, averageCost: 60000 }];

describe('local storage migration guards', () => {
  it('filters unknown watchlist assets and removes duplicates', () => {
    expect(validateWatchlistIds(['bitcoin', 'bitcoin', 'unknown'], ASSET_UNIVERSE, DEFAULT_WATCHLIST_IDS)).toEqual([
      'bitcoin',
    ]);
  });

  it('falls back when persisted watchlist is invalid or empty', () => {
    expect(validateWatchlistIds('bitcoin', ASSET_UNIVERSE, DEFAULT_WATCHLIST_IDS)).toEqual(DEFAULT_WATCHLIST_IDS);
    expect(validateWatchlistIds(['unknown'], ASSET_UNIVERSE, DEFAULT_WATCHLIST_IDS)).toEqual(DEFAULT_WATCHLIST_IDS);
  });

  it('filters malformed holdings while preserving valid rows', () => {
    expect(
      validateHoldings(
        [
          { assetId: 'bitcoin', quantity: 1, averageCost: 70000 },
          { assetId: 'unknown', quantity: 1, averageCost: 1 },
          { assetId: 'ethereum', quantity: -1, averageCost: 2000 },
          { assetId: 'solana', quantity: 1, averageCost: Number.NaN },
        ],
        ASSET_UNIVERSE,
        fallbackHoldings,
      ),
    ).toEqual([{ assetId: 'bitcoin', quantity: 1, averageCost: 70000 }]);
  });

  it('falls back when no persisted holdings are valid', () => {
    expect(validateHoldings([{ assetId: 'unknown', quantity: 1, averageCost: 1 }], ASSET_UNIVERSE, fallbackHoldings)).toEqual(
      fallbackHoldings,
    );
  });
});
