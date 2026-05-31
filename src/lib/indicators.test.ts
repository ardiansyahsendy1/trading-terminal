import { describe, expect, it } from 'vitest';
import { calculateEMA, calculateSMA } from './indicators';

const prices = [10, 12, 14, 16, 18].map((close) => ({ close }));

describe('indicator calculations', () => {
  it('calculates a simple moving average with warmup values', () => {
    expect(calculateSMA(prices, 3)).toEqual([
      undefined,
      undefined,
      12,
      14,
      16,
    ]);
  });

  it('calculates an exponential moving average from the first full period', () => {
    expect(calculateEMA(prices, 3)).toEqual([
      undefined,
      undefined,
      12,
      14,
      16,
    ]);
  });

  it('returns an empty result when the period is longer than the series', () => {
    expect(calculateSMA(prices, 10)).toEqual([]);
    expect(calculateEMA(prices, 10)).toEqual([]);
  });
});
