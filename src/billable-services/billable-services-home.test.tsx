import React from 'react';
import { render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import BillableServiceHome from './billable-services-home.component';

vi.mock('../billing-header/billing-header.component', () => ({
  default: () => <div>Billing header</div>,
}));

vi.mock('./billables-config-tabs/billables-config-tabs.component', () => ({
  default: () => <div>Billables configuration tabs</div>,
}));

vi.mock('./bill-report/billing-reports.component', () => ({
  default: () => <div>Billing reports</div>,
}));

vi.mock('./cash-point/cash-point-configuration.component', () => ({ default: () => null }));
vi.mock('./payment-modes/payment-modes-config.component', () => ({ default: () => null }));
vi.mock('../discounts/admin/discount-requests.component', () => ({ default: () => null }));
vi.mock('../refunds/admin/refund-requests.component', () => ({ default: () => null }));

describe('BillableServiceHome', () => {
  afterEach(() => {
    window.history.replaceState({}, '', '/');
  });

  it.each(['/spa/billable-services/', '/spa/billable-services/billable-commodities'])(
    'renders the billables tabs at %s',
    (path) => {
      window.history.replaceState({}, '', path);

      render(<BillableServiceHome />);

      expect(screen.getByText('Billables configuration tabs')).toBeInTheDocument();
    },
  );

  it('preserves the billing reports route', () => {
    window.history.replaceState({}, '', '/spa/billable-services/bill-report');

    render(<BillableServiceHome />);

    expect(screen.getByText('Billing reports')).toBeInTheDocument();
  });
});
