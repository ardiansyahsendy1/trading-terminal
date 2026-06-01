import type { AssetDefinition } from './marketData';
import type { PortfolioHolding } from './portfolio';

const knownAssetIds = (assets: AssetDefinition[]) => new Set(assets.map((asset) => asset.id));

export const validateWatchlistIds = (
  value: unknown,
  assets: AssetDefinition[],
  fallback: string[],
): string[] => {
  if (!Array.isArray(value)) return fallback;

  const ids = knownAssetIds(assets);
  const validIds = value.filter((item): item is string => typeof item === 'string' && ids.has(item));
  return validIds.length > 0 ? [...new Set(validIds)] : fallback;
};

export const validateHoldings = (
  value: unknown,
  assets: AssetDefinition[],
  fallback: PortfolioHolding[],
): PortfolioHolding[] => {
  if (!Array.isArray(value)) return fallback;

  const ids = knownAssetIds(assets);
  const validHoldings = value.flatMap((item): PortfolioHolding[] => {
    if (!item || typeof item !== 'object') return [];

    const holding = item as Record<string, unknown>;
    const { assetId, quantity, averageCost } = holding;

    if (
      typeof assetId !== 'string' ||
      !ids.has(assetId) ||
      typeof quantity !== 'number' ||
      !Number.isFinite(quantity) ||
      quantity <= 0 ||
      typeof averageCost !== 'number' ||
      !Number.isFinite(averageCost) ||
      averageCost < 0
    ) {
      return [];
    }

    return [{ assetId, quantity, averageCost }];
  });

  return validHoldings.length > 0 ? validHoldings : fallback;
};
