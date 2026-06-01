import type { AssetQuote } from './marketData';
import type { PortfolioSummary } from './portfolio';

export type PriceSnapshot = {
  time: string;
  [assetId: string]: string | number;
};

export type AlertRule = {
  id: string;
  assetId: string;
  kind: 'above' | 'below' | 'move';
  threshold: number;
};

export type AlertResult = AlertRule & {
  symbol: string;
  message: string;
  triggered: boolean;
};

export type StrategyResult = {
  name: string;
  returnPct: number;
  trades: number;
  maxDrawdownPct: number;
};

export type ResearchPlugin = {
  id: string;
  name: string;
  kind: 'data' | 'analysis' | 'report';
  description: string;
  enabled: boolean;
};

export const DEFAULT_ALERTS: AlertRule[] = [
  { id: 'btc-breakout', assetId: 'bitcoin', kind: 'above', threshold: 75000 },
  { id: 'eth-risk', assetId: 'ethereum', kind: 'below', threshold: 1800 },
  { id: 'sol-volatility', assetId: 'solana', kind: 'move', threshold: 2 },
];

export const DEFAULT_PLUGINS: ResearchPlugin[] = [
  { id: 'coingecko-provider', name: 'CoinGecko Provider', kind: 'data', description: 'Public crypto quote adapter', enabled: true },
  { id: 'simple-backtester', name: 'Simple Backtester', kind: 'analysis', description: 'Baseline momentum and hold comparison', enabled: true },
  { id: 'markdown-exporter', name: 'Markdown Exporter', kind: 'report', description: 'Research report generator', enabled: true },
];

export const evaluateAlerts = (
  alerts: AlertRule[],
  quoteMap: Record<string, AssetQuote>,
): AlertResult[] =>
  alerts.flatMap((alert) => {
    const quote = quoteMap[alert.assetId];
    if (!quote) return [];

    const triggered =
      alert.kind === 'above'
        ? quote.price >= alert.threshold
        : alert.kind === 'below'
          ? quote.price <= alert.threshold
          : Math.abs(quote.change24h) >= alert.threshold;
    const basis = alert.kind === 'move' ? `${quote.change24h.toFixed(2)}% 24h move` : `$${quote.price.toLocaleString()}`;

    return [{
      ...alert,
      symbol: quote.symbol,
      triggered,
      message: `${quote.symbol} ${triggered ? 'triggered' : 'watching'} ${alert.kind} ${alert.threshold}: ${basis}`,
    }];
  });

export const runBacktest = (history: PriceSnapshot[], assetId: string): StrategyResult[] => {
  const prices = history.map((snapshot) => Number(snapshot[assetId])).filter((price) => Number.isFinite(price) && price > 0);
  if (prices.length < 2) return [];

  const start = prices[0];
  const end = prices.at(-1) ?? start;
  const holdReturn = ((end - start) / start) * 100;
  let cash = start;
  let position = 0;
  let peak = start;
  let maxDrawdownPct = 0;
  let trades = 0;

  for (let index = 1; index < prices.length; index += 1) {
    const previous = prices[index - 1];
    const current = prices[index];
    if (current > previous && position === 0) {
      position = cash / current;
      cash = 0;
      trades += 1;
    } else if (current < previous && position > 0) {
      cash = position * current;
      position = 0;
      trades += 1;
    }

    const equity = cash + position * current;
    peak = Math.max(peak, equity);
    maxDrawdownPct = Math.min(maxDrawdownPct, ((equity - peak) / peak) * 100);
  }

  const momentumEquity = cash + position * end;

  return [
    { name: 'Buy and Hold', returnPct: holdReturn, trades: 1, maxDrawdownPct: Math.min(0, holdReturn) },
    { name: 'Momentum Flip', returnPct: ((momentumEquity - start) / start) * 100, trades, maxDrawdownPct },
  ];
};

export const exportResearchReport = (
  selectedSymbol: string,
  portfolio: PortfolioSummary,
  alerts: AlertResult[],
  strategies: StrategyResult[],
) => [
  `# Trading Terminal Research Report`,
  ``,
  `Selected asset: ${selectedSymbol}`,
  `Portfolio value: $${portfolio.totalValue.toFixed(2)}`,
  `Unrealized P/L: $${portfolio.totalPnl.toFixed(2)}`,
  ``,
  `## Alerts`,
  ...alerts.map((alert) => `- ${alert.message}`),
  ``,
  `## Strategy Comparison`,
  ...strategies.map((strategy) => `- ${strategy.name}: ${strategy.returnPct.toFixed(2)}%, ${strategy.trades} trades`),
].join('\n');
