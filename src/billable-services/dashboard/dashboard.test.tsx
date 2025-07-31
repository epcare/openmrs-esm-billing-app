import React from 'react';
import { render } from '@testing-library/react';
import BillableServicesDashboard from './dashboard.component';

beforeAll(() => {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: jest.fn().mockImplementation((query) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: jest.fn(),
      removeListener: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    })),
  });
});

jest.mock('@openmrs/esm-framework', () => ({
  ExtensionSlot: () => <div data-testid="extension-slot" />,
  useConfig: () => ({}),
  useStore: () => [null, jest.fn()],
  createGlobalStore: jest.fn(() => ({
    getState: jest.fn(),
    setState: jest.fn(),
    subscribe: jest.fn(),
  })),
  translateFrom: jest.fn(() => (key: string) => key),
  useOpenmrsFetchAll: jest.fn(() => ({
    data: [],
    isLoading: false,
    error: null,
  })),
  useOpenmrsFetch: jest.fn(() => ({
    data: null,
    isLoading: false,
    error: null,
  })),
  useSession: jest.fn(() => ({ user: { uuid: 'test-user' } })),
  navigate: jest.fn(),
  useLayoutType: jest.fn(() => 'desktop'),
  isDesktop: jest.fn(() => true),
  usePagination: jest.fn().mockImplementation((data) => ({
    currentPage: 1,
    goTo: jest.fn(),
    results: data,
    paginated: true,
  })),
}));

test('renders an empty state when there are no services', () => {
  render(<BillableServicesDashboard />);
});
