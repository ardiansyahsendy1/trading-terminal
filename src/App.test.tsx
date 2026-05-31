import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import App from '../App';
import { FALLBACK_QUOTES } from './lib/marketData';

// Mock the fetchMarketQuotes function to avoid real network requests during testing
vi.mock('./lib/marketData', async () => {
  const actual = await vi.importActual<typeof import('./lib/marketData')>('./lib/marketData');
  return {
    ...actual,
    fetchMarketQuotes: vi.fn().mockResolvedValue(actual.FALLBACK_QUOTES),
  };
});

// Mock ResizeObserver which is used by Recharts/useElementSize and not present in JSDOM by default
class ResizeObserverMock {
  observe = vi.fn();
  unobserve = vi.fn();
  disconnect = vi.fn();
}
window.ResizeObserver = ResizeObserverMock;

describe('App Component', () => {
  it('renders the Trading Terminal header and subtext', async () => {
    render(<App />);

    expect(screen.getByText('Trading Terminal')).toBeInTheDocument();
    expect(
      screen.getByText(/Market dashboard for crypto watchlists, portfolio exposure/i)
    ).toBeInTheDocument();
  });

  it('renders portfolio summary metrics correctly', async () => {
    render(<App />);

    expect(screen.getByText('Portfolio Value')).toBeInTheDocument();
    expect(screen.getByText('Unrealized P/L')).toBeInTheDocument();
    expect(screen.getByText('Cost Basis')).toBeInTheDocument();
    expect(screen.getByText('Tracked Assets')).toBeInTheDocument();
  });
});
