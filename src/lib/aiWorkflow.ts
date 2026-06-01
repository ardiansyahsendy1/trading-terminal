import type { AssetQuote } from './marketData';
import type { PortfolioSummary } from './portfolio';
import type { AlertResult, StrategyResult } from './research';

export type MarketSummary = {
  headline: string;
  bullets: string[];
};

export type PortfolioNote = {
  title: string;
  body: string;
};

export type PromptResponse = {
  prompt: string;
  answer: string;
};

const currency = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 2 });

const percent = new Intl.NumberFormat('en-US', { maximumFractionDigits: 2, minimumFractionDigits: 2 });

export const generateMarketSummary = (
  selectedQuote: AssetQuote | undefined,
  watchlistRows: AssetQuote[],
  alerts: AlertResult[],
): MarketSummary => {
  const quote = selectedQuote ?? watchlistRows[0];
  const strongestMove = [...watchlistRows].sort((left, right) => Math.abs(right.change24h) - Math.abs(left.change24h))[0];
  const triggeredAlerts = alerts.filter((alert) => alert.triggered);

  if (!quote) {
    return { headline: 'Market summary is waiting for quote data.', bullets: ['Refresh market data to generate a summary.'] };
  }

  return {
    headline: `${quote.symbol} is ${quote.change24h >= 0 ? 'firm' : 'under pressure'} at ${currency.format(quote.price)}.`,
    bullets: [
      `${quote.name} shows a ${percent.format(quote.change24h)}% 24h move on reported volume of ${currency.format(quote.volume24h)}.`,
      strongestMove ? `${strongestMove.symbol} has the largest watchlist move at ${percent.format(strongestMove.change24h)}%.` : 'No watchlist comparison is available yet.',
      triggeredAlerts.length > 0 ? `${triggeredAlerts.length} alert rule is active for follow-up.` : 'No alert rule is currently triggered.',
    ],
  };
};

export const generatePortfolioNotes = (portfolio: PortfolioSummary): PortfolioNote[] => {
  const largest = [...portfolio.rows].sort((left, right) => right.allocation - left.allocation)[0];
  const weakest = [...portfolio.rows].sort((left, right) => left.pnl - right.pnl)[0];

  return [
    {
      title: 'Portfolio posture',
      body: portfolio.totalPnl >= 0
        ? `The tracked portfolio is positive by ${currency.format(portfolio.totalPnl)} against a ${currency.format(portfolio.totalCost)} cost basis.`
        : `The tracked portfolio is down ${currency.format(Math.abs(portfolio.totalPnl))}; review position sizing before adding exposure.`,
    },
    {
      title: 'Concentration check',
      body: largest ? `${largest.symbol} is the largest allocation at ${percent.format(largest.allocation)}%.` : 'No active holdings are available for allocation analysis.',
    },
    {
      title: 'Review candidate',
      body: weakest ? `${weakest.symbol} has the weakest unrealized P/L at ${currency.format(weakest.pnl)}.` : 'Add holdings to generate review candidates.',
    },
  ];
};

export const answerResearchPrompt = (
  prompt: string,
  summary: MarketSummary,
  portfolio: PortfolioSummary,
  strategies: StrategyResult[],
): PromptResponse => {
  const normalized = prompt.trim() || 'What should I review first?';
  const bestStrategy = [...strategies].sort((left, right) => right.returnPct - left.returnPct)[0];

  return {
    prompt: normalized,
    answer: [
      summary.headline,
      `Portfolio value is ${currency.format(portfolio.totalValue)} with unrealized P/L of ${currency.format(portfolio.totalPnl)}.`,
      bestStrategy ? `${bestStrategy.name} is leading the local comparison at ${percent.format(bestStrategy.returnPct)}%.` : 'Strategy comparison needs more price snapshots.',
      'Use this as research context only, not financial advice.',
    ].join(' '),
  };
};

export const buildDocumentationAutomation = (phase: string, completedItems: string[]) => [
  `## ${phase} Documentation Draft`,
  '',
  ...completedItems.map((item) => `- ${item}`),
  '',
  'Keep the disclaimer visible and document any API key requirements before merging.',
].join('\n');

export const buildMaintainerAutomation = (openIssues: string[], changes: string[]) => [
  '# Maintainer Automation Draft',
  '',
  '## Issue Triage',
  ...(openIssues.length > 0 ? openIssues.map((issue) => `- Review ${issue}`) : ['- No open issues supplied.']),
  '',
  '## Changelog Draft',
  ...changes.map((change) => `- ${change}`),
].join('\n');
