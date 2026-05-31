import { describe, expect, it } from 'vitest';
import {
  ASSET_UNIVERSE,
  createCoinGeckoSimplePriceUrl,
  mapCoinGeckoResponse,
} from './marketData';

describe('market data mapping', () => {
  it('builds a CoinGecko simple price URL for multiple assets', () => {
    const url = createCoinGeckoSimplePriceUrl(['bitcoin', 'ethereum']);

    expect(url).toContain('/api/coingecko/simple/price');
    expect(url).toContain('ids=bitcoin%2Cethereum');
    expect(url).toContain('vs_currencies=usd');
    expect(url).toContain('include_24hr_change=true');
    expect(url).toContain('include_last_updated_at=true');
  });

  it('maps CoinGecko simple price payloads to terminal quotes', () => {
    const quotes = mapCoinGeckoResponse(
      {
        bitcoin: {
          usd: 73000,
          usd_24h_change: 1.23,
          usd_24h_vol: 123456,
          last_updated_at: 1780231749,
        },
      },
      ASSET_UNIVERSE.slice(0, 2),
    );

    expect(quotes).toEqual([
      {
        id: 'bitcoin',
        symbol: 'BTC',
        name: 'Bitcoin',
        category: 'crypto',
        price: 73000,
        change24h: 1.23,
        volume24h: 123456,
        lastUpdatedAt: 1780231749,
        source: 'CoinGecko',
      },
    ]);
  });

  it('skips unsupported or missing prices from provider payloads', () => {
    const quotes = mapCoinGeckoResponse(
      {
        bitcoin: {
          usd_24h_change: 1.23,
          usd_24h_vol: 123456,
        },
        ethereum: {
          usd: 2000,
          usd_24h_change: null,
          usd_24h_vol: null,
        },
      },
      ASSET_UNIVERSE.slice(0, 2),
    );

    expect(quotes).toEqual([
      expect.objectContaining({
        id: 'ethereum',
        price: 2000,
        change24h: 0,
        volume24h: 0,
      }),
    ]);
  });
});
