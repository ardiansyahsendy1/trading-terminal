export type AssetDefinition = {
  id: string;
  symbol: string;
  name: string;
  category: 'crypto';
};

export type AssetQuote = AssetDefinition & {
  price: number;
  change24h: number;
  volume24h: number;
  lastUpdatedAt?: number;
  source: 'CoinGecko' | 'Fallback';
};

type CoinGeckoPrice = {
  usd?: number;
  usd_24h_change?: number | null;
  usd_24h_vol?: number | null;
  last_updated_at?: number;
};

export type CoinGeckoSimplePriceResponse = Record<string, CoinGeckoPrice>;

export const COINGECKO_SIMPLE_PRICE_URL = '/api/coingecko/simple/price';

export const ASSET_UNIVERSE: AssetDefinition[] = [
  { id: 'bitcoin', symbol: 'BTC', name: 'Bitcoin', category: 'crypto' },
  { id: 'ethereum', symbol: 'ETH', name: 'Ethereum', category: 'crypto' },
  { id: 'solana', symbol: 'SOL', name: 'Solana', category: 'crypto' },
  { id: 'cardano', symbol: 'ADA', name: 'Cardano', category: 'crypto' },
  { id: 'chainlink', symbol: 'LINK', name: 'Chainlink', category: 'crypto' },
  { id: 'avalanche-2', symbol: 'AVAX', name: 'Avalanche', category: 'crypto' },
];

export const DEFAULT_WATCHLIST_IDS = ['bitcoin', 'ethereum', 'solana', 'cardano'];

export const FALLBACK_QUOTES: AssetQuote[] = [
  { ...ASSET_UNIVERSE[0], price: 73853, change24h: 0.4, volume24h: 16816459262, source: 'Fallback' },
  { ...ASSET_UNIVERSE[1], price: 2021.55, change24h: 0.33, volume24h: 6706625794, source: 'Fallback' },
  { ...ASSET_UNIVERSE[2], price: 82.78, change24h: 0.72, volume24h: 1288876926, source: 'Fallback' },
  { ...ASSET_UNIVERSE[3], price: 0.2374, change24h: 1.15, volume24h: 263952277, source: 'Fallback' },
  { ...ASSET_UNIVERSE[4], price: 7.82, change24h: -0.65, volume24h: 245000000, source: 'Fallback' },
  { ...ASSET_UNIVERSE[5], price: 13.4, change24h: 0.18, volume24h: 301000000, source: 'Fallback' },
];

export const createCoinGeckoSimplePriceUrl = (assetIds: string[], currency = 'usd') => {
  const params = new URLSearchParams({
    ids: assetIds.join(','),
    vs_currencies: currency,
    include_24hr_change: 'true',
    include_24hr_vol: 'true',
    include_last_updated_at: 'true',
  });

  return `${COINGECKO_SIMPLE_PRICE_URL}?${params.toString()}`;
};

export const mapCoinGeckoResponse = (
  response: CoinGeckoSimplePriceResponse,
  assets: AssetDefinition[],
): AssetQuote[] =>
  assets.flatMap((asset) => {
    const price = response[asset.id];

    if (typeof price?.usd !== 'number') {
      return [];
    }

    return [
      {
        ...asset,
        price: price.usd,
        change24h: price.usd_24h_change ?? 0,
        volume24h: price.usd_24h_vol ?? 0,
        lastUpdatedAt: price.last_updated_at,
        source: 'CoinGecko',
      },
    ];
  });

export const fetchMarketQuotes = async (assets: AssetDefinition[]): Promise<AssetQuote[]> => {
  const response = await fetch(createCoinGeckoSimplePriceUrl(assets.map((asset) => asset.id)));

  if (!response.ok) {
    throw new Error(`CoinGecko request failed with ${response.status}`);
  }

  const data = (await response.json()) as CoinGeckoSimplePriceResponse;
  const quotes = mapCoinGeckoResponse(data, assets);

  if (quotes.length === 0) {
    throw new Error('CoinGecko returned no supported quotes');
  }

  return quotes;
};
