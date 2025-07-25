import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import BillableServices from './billable-services.component';
import { useBillableServicesAndItems } from './billable-service.resource';

// ✅ Mock the hook
jest.mock('./billable-service.resource', () => ({
  useBillableServices: jest.fn(),
  useBillableServicesAndItems: jest.fn(),
}));

// ✅ Mock the empty state
jest.mock('@openmrs/esm-patient-common-lib', () => ({
  EmptyState: jest.fn(({ displayText, headerTitle }) => (
    <div data-testid="empty-state">
      <h1>{headerTitle}</h1>
      <p>{displayText}</p>
      <p>There are no services to display</p>
    </div>
  )),
}));

// ✅ Framework mocks
jest.mock('@openmrs/esm-framework', () => ({
  useLayoutType: jest.fn(() => 'desktop'),
  isDesktop: jest.fn(() => true),
  useConfig: jest.fn(() => ({
    billableServices: {
      pageSizes: [10, 20, 30, 40, 50],
      pageSize: 10,
    },
  })),
  usePagination: jest.fn().mockImplementation((data) => ({
    currentPage: 1,
    goTo: jest.fn(),
    results: data,
    paginated: true,
  })),
  navigate: jest.fn(),
  ErrorState: jest.fn(({ error }) => <div>Error: {error?.message || error}</div>),
}));

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, fallback: string) => fallback || key,
  }),
}));

const mockedUseBillableServicesAndItems = useBillableServicesAndItems as jest.Mock;

describe('useBillableServicesAndItems', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders empty state when there are no services and items', () => {
    mockedUseBillableServicesAndItems.mockReturnValue({
      billableServicesAndItems: [],
      isLoading: false,
      error: null,
    });

    render(<BillableServices />);

    expect(screen.getByTestId('empty-state')).toBeInTheDocument();
    expect(screen.getByText('Billable Services')).toBeInTheDocument();
    expect(screen.getByText('There are no services to display')).toBeInTheDocument();
  });

  it('renders services and items in the table', () => {
    const mockServices = [
      {
        uuid: 'a1',
        name: 'Item 1',
        shortName: 'I1',
        serviceType: { display: 'Dispensing' },
        serviceStatus: 'ENABLED',
        servicePrices: [{ uuid: 'p1', name: 'Cash', price: 100, paymentMode: { uuid: 'm1', name: 'Cash' } }],
      },
      {
        uuid: 'a2',
        name: 'Item 2',
        shortName: 'I2',
        serviceType: { display: 'Laboratory' },
        serviceStatus: 'ENABLED',
        servicePrices: [{ uuid: 'p2', name: 'Insurance', price: 500, paymentMode: { uuid: 'm2', name: 'Insurance' } }],
      },
    ];

    mockedUseBillableServicesAndItems.mockReturnValue({
      billableServicesAndItems: mockServices,
      isLoading: false,
      error: null,
    });

    render(<BillableServices />);

    expect(screen.getByText('Item 1')).toBeInTheDocument();
    expect(screen.getByText('Item 2')).toBeInTheDocument();
    expect(screen.getByText('Dispensing')).toBeInTheDocument();
    expect(screen.getByText('Laboratory')).toBeInTheDocument();
    expect(screen.getByText((content) => content.includes('Cash'))).toBeInTheDocument();
    expect(screen.getByText((content) => content.includes('Insurance'))).toBeInTheDocument();
  });

  it('shows error state on fetch failure', () => {
    mockedUseBillableServicesAndItems.mockReturnValue({
      billableServicesAndItems: [],
      isLoading: false,
      error: new Error('Failed to load services'),
    });

    render(<BillableServices />);

    expect(screen.getByText(/Failed to load services/i)).toBeInTheDocument();
  });
});
