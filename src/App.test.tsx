import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import App from '../App';

// Mock ResizeObserver (required for Recharts)
class ResizeObserverMock {
  observe = vi.fn();
  unobserve = vi.fn();
  disconnect = vi.fn();
}
window.ResizeObserver = ResizeObserverMock as any;

// Mock market data to prevent real API calls
vi.mock('../lib/marketData', () => ({
  fetchMarketQuotes: vi.fn().mockResolvedValue([]),
  FALLBACK_QUOTES: [],
}));

describe('App Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the Trading Terminal header and description', async () => {
    render(<App />);

    // Wait for any async updates
    await waitFor(() => {
      expect(screen.getByText('Trading Terminal')).toBeInTheDocument();
    });

    expect(
      screen.getByText(/Market dashboard for crypto watchlists/i)
    ).toBeInTheDocument();
  });

  it('renders portfolio summary metrics', async () => {
    render(<App />);

    await waitFor(() => {
      expect(screen.getByText('Portfolio Value')).toBeInTheDocument();
      expect(screen.getByText('Unrealized P/L')).toBeInTheDocument();
      expect(screen.getByText('Cost Basis')).toBeInTheDocument();
      expect(screen.getByText('Tracked Assets')).toBeInTheDocument();
    });
  });
});