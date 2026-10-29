import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { getDefaultsFromConfigSchema, useConfig } from '@openmrs/esm-framework';
import { useBillMetricsData } from '../billing.resource';
import { BillStatus } from '../types';
import { configSchema, type BillingConfig } from '../config-schema';
import MetricsCards from './metrics-cards.component';

const mockUseBillMetricsData = vi.mocked<typeof useBillMetricsData>(useBillMetricsData);
const mockUseConfig = vi.mocked(useConfig<BillingConfig>);

vi.mock('../billing.resource', () => ({
  useBillMetricsData: vi.fn(),
}));

describe('MetricsCards', () => {
  beforeEach(() => {
    mockUseConfig.mockReturnValue({ ...getDefaultsFromConfigSchema(configSchema), defaultCurrency: 'USD' });
  });

  it('renders loading state', () => {
    mockUseBillMetricsData.mockReturnValue({
      isLoading: true,
      bills: [],
      error: null,
      isValidating: false,
      mutate: vi.fn(),
    });
    renderMetricsCards();
    expect(screen.getByText(/Loading bill metrics.../i)).toBeInTheDocument();
  });

  it('renders error state', () => {
    mockUseBillMetricsData.mockReturnValue({
      isLoading: false,
      bills: [],
      error: new Error('Internal server error'),
      isValidating: false,
      mutate: vi.fn(),
    });
    renderMetricsCards();
    expect(screen.getByText(/error state/i)).toBeInTheDocument();
  });

  it('renders metrics cards', () => {
    mockUseBillMetricsData.mockReturnValue({
      isLoading: false,
      bills: [
        { status: BillStatus.PAID, totalAmount: 100 },
        { status: BillStatus.PENDING, totalAmount: 50 },
      ],
      error: null,
      isValidating: false,
      mutate: vi.fn(),
    });
    renderMetricsCards();
    expect(screen.getByRole('heading', { name: /cumulative bills/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /pending bills/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /paid bills/i })).toBeInTheDocument();
  });
});

function renderMetricsCards() {
  render(<MetricsCards />);
}
