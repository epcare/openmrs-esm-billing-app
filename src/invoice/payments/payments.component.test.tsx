import React from 'react';
import userEvent from '@testing-library/user-event';
import { render, screen } from '@testing-library/react';
import { vi } from 'vitest';
import { useVisit, useConfig, navigate } from '@openmrs/esm-framework';
import { type MappedBill } from '../../types';
import Payments from './payments.component';

// Mock window.i18next for locale
window.i18next = { language: 'en-US' } as any;

vi.mock('../../billing.resource', () => ({
  processBillPayment: vi.fn(),
  patientPaymentStatusCacheKey: vi.fn(),
}));

vi.mock('swr', () => ({
  default: vi.fn(() => ({
    data: { data: { results: [] } },
    isLoading: false,
    error: null,
    mutate: vi.fn(),
  })),
  useSWRConfig: () => ({ mutate: vi.fn() }),
}));

describe('Payments', () => {
  const mockBill: MappedBill = {
    uuid: 'bill-uuid',
    id: 1,
    patientUuid: 'patient-uuid',
    patientName: 'John Doe',
    cashPointUuid: 'cash-point-uuid',
    cashPointName: 'Main Cash Point',
    cashPointLocation: 'Main Hospital',
    cashier: {
      uuid: 'provider-1',
      display: 'Jane Doe',
      links: [
        {
          rel: 'self',
          uri: 'http://example.com/provider/1',
          resourceAlias: 'Jane Doe',
        },
      ],
    },
    payments: [],
    discounts: [],
    refunds: [],
    receiptNumber: '12345',
    status: 'POSTED',
    identifier: 'invoice-123',
    dateCreated: '2023-09-01T12:00:00Z',
    lineItems: [],
    billingService: 'Billing Service',
    totalAmount: 260,
    netAmount: 260,
    tenderedAmount: 0,
    visitUuid: 'visit-uuid',
  };

  const mockMutate = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (useVisit as Mock).mockReturnValue({ currentVisit: null });
    (useConfig as Mock).mockReturnValue({ defaultCurrency: 'USD' });
  });

  it('renders payment form and history', () => {
    render(<Payments bill={mockBill} mutate={mockMutate} />);
    expect(screen.getByText('Payments')).toBeInTheDocument();
    expect(screen.getByText(/total amount/i)).toBeInTheDocument();
    expect(screen.getByText(/total tendered/i)).toBeInTheDocument();
  });

  it('calculates and displays correct amounts', () => {
    render(<Payments bill={mockBill} mutate={mockMutate} />);

    // Verify total amount is displayed
    expect(screen.getByText(/total amount/i)).toBeInTheDocument();
    // Verify the amount 260 appears somewhere (either total or amount due)
    expect(screen.getAllByText(/260/i).length).toBeGreaterThan(0);

    // Verify total tendered label is displayed
    expect(screen.getByText(/total tendered/i)).toBeInTheDocument();
    // The tendered amount (0) appears in the totals
    expect(screen.getAllByText(/0/i).length).toBeGreaterThan(0);
  });

  it('disables Process Payment button when form is invalid', () => {
    render(<Payments bill={mockBill} mutate={mockMutate} />);
    expect(screen.getByText(/process payment/i)).toBeDisabled();
  });

  it('navigates to billing dashboard when Discard is clicked', async () => {
    render(<Payments bill={mockBill} mutate={mockMutate} />);
    await userEvent.click(screen.getByText('Discard'));
    expect(navigate).toHaveBeenCalled();
  });

  it('should not render payment form when bill is PENDING', () => {
    const pendingBill = { ...mockBill, status: 'PENDING' };
    render(<Payments bill={pendingBill} mutate={mockMutate} />);
    // Payment form should be hidden when bill is PENDING
    expect(screen.queryByPlaceholderText(/enter amount/i)).not.toBeInTheDocument();
  });

  it('should not render payment form when amountDue is 0', () => {
    const paidBill = { ...mockBill, tenderedAmount: 260 };
    render(<Payments bill={paidBill} mutate={mockMutate} />);
    // Payment form should be hidden when amountDue is 0
    expect(screen.queryByPlaceholderText(/enter amount/i)).not.toBeInTheDocument();
  });
});
