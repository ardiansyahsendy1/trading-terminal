import { describe, expect, it } from 'vitest';
import { FALLBACK_QUOTES } from './marketData';
import {
  DEFAULT_ALERTS,
  evaluateAlerts,
  exportResearchReport,
  runBacktest,
  type PriceSnapshot,
} from './research';
import { buildPortfolioSummary } from './portfolio';

const quoteMap = Object.fromEntries(FALLBACK_QUOTES.map((quote) => [quote.id, quote]));

describe('research tools', () => {
  it('evaluates price and move alerts against current quotes', () => {
    const alerts = evaluateAlerts(DEFAULT_ALERTS, quoteMap);

    expect(alerts).toHaveLength(3);
    expect(alerts.map((alert) => alert.symbol)).toEqual(['BTC', 'ETH', 'SOL']);
    expect(alerts.some((alert) => alert.triggered)).toBe(false);
  });

  it('runs baseline strategy comparisons from price snapshots', () => {
    const history: PriceSnapshot[] = [
      { time: '09:00', bitcoin: 100 },
      { time: '10:00', bitcoin: 110 },
      { time: '11:00', bitcoin: 105 },
      { time: '12:00', bitcoin: 120 },
    ];

    expect(runBacktest(history, 'bitcoin')).toEqual([
      { name: 'Buy and Hold', returnPct: 20, trades: 1, maxDrawdownPct: 0 },
      expect.objectContaining({ name: 'Momentum Flip', trades: 3 }),
    ]);
  });

  it('exports a markdown research report', () => {
    const portfolio = buildPortfolioSummary([{ assetId: 'bitcoin', quantity: 1, averageCost: 70000 }], quoteMap);
    const report = exportResearchReport('BTC', portfolio, evaluateAlerts(DEFAULT_ALERTS, quoteMap), []);

    expect(report).toContain('# Trading Terminal Research Report');
    expect(report).toContain('Selected asset: BTC');
    expect(report).toContain('Portfolio value: $73853.00');
  });
});
