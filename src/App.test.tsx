import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import App from '../App';

// Mock ResizeObserver (needed for Recharts)
class ResizeObserverMock {
  observe = vi.fn();
  unobserve = vi.fn();
  disconnect = vi.fn();
}
window.ResizeObserver = ResizeObserverMock as any;

// Simple mock for market data to prevent real API calls
vi.mock('../lib/marketData', () => ({
  fetchMarketQuotes: vi.fn().mockResolvedValue([]),
  FALLBACK_QUOTES: [],
}));

describe('App Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the Trading Terminal header and description', () => {
    render(<App />);

    expect(screen.getByText('Trading Terminal')).toBeInTheDocument();
    expect(
      screen.getByText(/Market dashboard for crypto watchlists/i)
    ).toBeInTheDocument();
  });

  it('renders portfolio summary section', () => {
    render(<App />);

    expect(screen.getByText('Portfolio Value')).toBeInTheDocument();
    expect(screen.getByText('Unrealized P/L')).toBeInTheDocument();
    expect(screen.getByText('Cost Basis')).toBeInTheDocument();
    expect(screen.getByText('Tracked Assets')).toBeInTheDocument();
  });
});