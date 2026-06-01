import { describe, expect, it } from 'vitest';
import { FALLBACK_QUOTES } from './marketData';
import { buildPortfolioSummary } from './portfolio';
import {
  answerResearchPrompt,
  buildDocumentationAutomation,
  buildMaintainerAutomation,
  generateMarketSummary,
  generatePortfolioNotes,
} from './aiWorkflow';

const quoteMap = Object.fromEntries(FALLBACK_QUOTES.map((quote) => [quote.id, quote]));
const portfolio = buildPortfolioSummary([{ assetId: 'bitcoin', quantity: 1, averageCost: 70000 }], quoteMap);

describe('AI-assisted workflow', () => {
  it('generates a market summary from selected quotes', () => {
    const summary = generateMarketSummary(FALLBACK_QUOTES[0], FALLBACK_QUOTES.slice(0, 3), []);

    expect(summary.headline).toContain('BTC');
    expect(summary.bullets).toHaveLength(3);
  });

  it('generates portfolio notes from holdings', () => {
    const notes = generatePortfolioNotes(portfolio);

    expect(notes.map((note) => note.title)).toEqual(['Portfolio posture', 'Concentration check', 'Review candidate']);
    expect(notes[0].body).toContain('positive');
  });

  it('answers a natural-language research prompt with guardrails', () => {
    const summary = generateMarketSummary(FALLBACK_QUOTES[0], FALLBACK_QUOTES.slice(0, 3), []);
    const response = answerResearchPrompt('What changed?', summary, portfolio, []);

    expect(response.prompt).toBe('What changed?');
    expect(response.answer).toContain('not financial advice');
  });

  it('drafts documentation and maintainer automation output', () => {
    expect(buildDocumentationAutomation('Phase 3', ['Added summaries'])).toContain('Phase 3 Documentation Draft');
    expect(buildMaintainerAutomation(['#1 Improve README'], ['Added AI workflow'])).toContain('Changelog Draft');
  });
});
