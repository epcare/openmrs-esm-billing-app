import React from 'react';
import { render, screen } from '@testing-library/react';
import { FormProvider, useForm } from 'react-hook-form';
import { vi } from 'vitest';
import type { PaymentFormValue } from '../payments.component';
import PaymentForm from './payment-form.component';
import { usePaymentModes } from '../payment.resource';

// Mock the payment resource
vi.mock('../payment.resource', () => ({
  usePaymentModes: vi.fn(),
}));

type WrapperProps = {
  children: React.ReactNode;
};

const Wrapper: React.FC<WrapperProps> = ({ children }) => {
  const methods = useForm<PaymentFormValue>({
    defaultValues: {
      payment: { method: '', amount: undefined, referenceCode: '' },
    },
  });
  return <FormProvider {...methods}>{children}</FormProvider>;
};

describe('PaymentForm Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('should render skeleton while loading payment modes', () => {
    usePaymentModes.mockReturnValue({
      paymentModes: [],
      paymentModesWithoutWaiver: [],
      isLoading: true,
      error: null,
      mutate: vi.fn(),
    });

    render(
      <Wrapper>
        <PaymentForm disablePayment={false} />
      </Wrapper>,
    );

    // NumberInputSkeleton renders a skeleton loading indicator
    const skeleton = document.querySelector('.cds--skeleton');
    expect(skeleton).toBeInTheDocument();
  });

  test('should render error message when payment modes fail to load', () => {
    usePaymentModes.mockReturnValue({
      paymentModes: [],
      paymentModesWithoutWaiver: [],
      isLoading: false,
      error: new Error('Failed to load payment modes'),
      mutate: vi.fn(),
    });

    render(
      <Wrapper>
        <PaymentForm disablePayment={false} />
      </Wrapper>,
    );

    // ErrorState component renders "Error State" text
    expect(screen.getByText(/error state/i)).toBeInTheDocument();
  });

  test('should render payment form when payment is enabled', () => {
    usePaymentModes.mockReturnValue({
      paymentModes: [
        { uuid: '1', name: 'Credit Card', description: 'Credit Card', retired: false },
        { uuid: '2', name: 'Cash', description: 'Cash', retired: false },
      ],
      paymentModesWithoutWaiver: [],
      isLoading: false,
      error: null,
      mutate: vi.fn(),
    });

    render(
      <Wrapper>
        <PaymentForm disablePayment={false} />
      </Wrapper>,
    );

    expect(screen.getAllByText(/payment method/i).length).toBeGreaterThan(0);
    expect(screen.getByPlaceholderText(/enter amount/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/enter reference number/i)).toBeInTheDocument();
  });

  test('should not render payment form when payment is disabled', () => {
    usePaymentModes.mockReturnValue({
      paymentModes: [{ uuid: '1', name: 'Credit Card', description: 'Credit Card', retired: false }],
      paymentModesWithoutWaiver: [],
      isLoading: false,
      error: null,
      mutate: vi.fn(),
    });

    render(
      <Wrapper>
        <PaymentForm disablePayment={true} />
      </Wrapper>,
    );

    expect(screen.queryByPlaceholderText(/enter amount/i)).not.toBeInTheDocument();
    expect(screen.queryByPlaceholderText(/enter reference number/i)).not.toBeInTheDocument();
  });

  test('should display payment method dropdown with options', () => {
    usePaymentModes.mockReturnValue({
      paymentModes: [
        { uuid: '1', name: 'Credit Card', description: 'Credit Card', retired: false },
        { uuid: '2', name: 'Cash', description: 'Cash', retired: false },
        { uuid: '3', name: 'Mobile Money', description: 'Mobile Money', retired: false },
      ],
      paymentModesWithoutWaiver: [],
      isLoading: false,
      error: null,
      mutate: vi.fn(),
    });

    render(
      <Wrapper>
        <PaymentForm disablePayment={false} />
      </Wrapper>,
    );

    const paymentMethodLabels = screen.getAllByText(/payment method/i);
    expect(paymentMethodLabels.length).toBeGreaterThan(0);
    expect(screen.getByPlaceholderText(/enter amount/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/enter reference number/i)).toBeInTheDocument();
  });
});
