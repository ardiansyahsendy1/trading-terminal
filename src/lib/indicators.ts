export type IndicatorDataPoint = {
  close: number;
};

export const calculateSMA = (
  data: IndicatorDataPoint[],
  period: number,
): (number | undefined)[] => {
  if (period > data.length) return [];

  const result = Array(period - 1).fill(undefined);

  for (let i = period - 1; i < data.length; i++) {
    const sum = data
      .slice(i - period + 1, i + 1)
      .reduce((acc, val) => acc + val.close, 0);
    result.push(sum / period);
  }

  return result;
};

export const calculateEMA = (
  data: IndicatorDataPoint[],
  period: number,
): (number | undefined)[] => {
  if (period > data.length) return [];

  const k = 2 / (period + 1);
  const result: (number | undefined)[] = Array(period - 1).fill(undefined);
  let ema = data.slice(0, period).reduce((acc, val) => acc + val.close, 0) / period;

  result.push(ema);

  for (let i = period; i < data.length; i++) {
    ema = (data[i].close - ema) * k + ema;
    result.push(ema);
  }

  return result;
};
