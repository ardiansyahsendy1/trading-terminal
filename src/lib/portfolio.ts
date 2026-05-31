import type { AssetQuote } from './marketData';

export type PortfolioHolding = {
  assetId: string;
  quantity: number;
  averageCost: number;
};

export type HoldingDraft = PortfolioHolding;

export type PortfolioRow = PortfolioHolding & {
  symbol: string;
  name: string;
  currentPrice: number;
  value: number;
  cost: number;
  pnl: number;
  allocation: number;
};

export type PortfolioSummary = {
  rows: PortfolioRow[];
  totalValue: number;
  totalCost: number;
  totalPnl: number;
};

export const buildPortfolioSummary = (
  holdings: PortfolioHolding[],
  quoteMap: Record<string, AssetQuote>,
): PortfolioSummary => {
  const rowsWithoutAllocation = holdings.flatMap((holding) => {
    const quote = quoteMap[holding.assetId];

    if (!quote || holding.quantity <= 0) {
      return [];
    }

    const value = holding.quantity * quote.price;
    const cost = holding.quantity * holding.averageCost;

    return [
      {
        ...holding,
        symbol: quote.symbol,
        name: quote.name,
        currentPrice: quote.price,
        value,
        cost,
        pnl: value - cost,
        allocation: 0,
      },
    ];
  });

  const totalValue = rowsWithoutAllocation.reduce((sum, row) => sum + row.value, 0);
  const totalCost = rowsWithoutAllocation.reduce((sum, row) => sum + row.cost, 0);

  return {
    rows: rowsWithoutAllocation.map((row) => ({
      ...row,
      allocation: totalValue === 0 ? 0 : (row.value / totalValue) * 100,
    })),
    totalValue,
    totalCost,
    totalPnl: totalValue - totalCost,
  };
};

export const upsertHolding = (
  holdings: PortfolioHolding[],
  draft: HoldingDraft,
): PortfolioHolding[] => {
  if (draft.quantity <= 0) {
    return holdings.filter((holding) => holding.assetId !== draft.assetId);
  }

  const nextHolding = {
    assetId: draft.assetId,
    quantity: draft.quantity,
    averageCost: Math.max(0, draft.averageCost),
  };

  if (!holdings.some((holding) => holding.assetId === draft.assetId)) {
    return [...holdings, nextHolding];
  }

  return holdings.map((holding) => (holding.assetId === draft.assetId ? nextHolding : holding));
};
