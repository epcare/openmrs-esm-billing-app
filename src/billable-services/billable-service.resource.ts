import useSWR from 'swr';
import { type OpenmrsResource, openmrsFetch, restBaseUrl, useOpenmrsFetchAll, useConfig } from '@openmrs/esm-framework';
import { type CashierItem, type ServiceConcept } from '../types';
import { apiBasePath, serviceConceptUuid } from '../constants';
import { type BillableService } from '../types/index';

type ResponseObject = {
  results: Array<OpenmrsResource>;
};

export const useBillableServices = () => {
  const url = `${apiBasePath}billableService?v=custom:(uuid,name,shortName,serviceStatus,concept:(uuid,display,name:(name)),serviceType:(display),servicePrices:(uuid,name,price,paymentMode:(uuid,name)))`;
  const { data, isLoading, isValidating, error, mutate } = useOpenmrsFetchAll<BillableService[]>(url);

  return {
    billableServices: data ?? [],
    isLoading,
    isValidating,
    error,
    mutate,
  };
};

export function useServiceTypes() {
  const url = `${restBaseUrl}/concept/${serviceConceptUuid}?v=custom:(setMembers:(uuid,display))`;

  const { data, error, isLoading } = useSWR<{ data }>(url, openmrsFetch);

  return {
    serviceTypes: data?.data?.setMembers ?? [],
    error,
    isLoading,
  };
}

export const usePaymentModes = () => {
  const url = `${apiBasePath}paymentMode`;

  const { data, error, isLoading } = useSWR<{ data: ResponseObject }>(url, openmrsFetch);

  return {
    paymentModes: data?.data.results ?? [],
    error,
    isLoading,
  };
};

export const createBillableSerice = (payload: any) => {
  const url = `${apiBasePath}api/billable-service`;
  return openmrsFetch(url, {
    method: 'POST',
    body: payload,
    headers: {
      'Content-Type': 'application/json',
    },
  });
};

export const createBillableCommodity = (payload: any) => {
  const url = `${apiBasePath}cashierItemPrice`;
  return openmrsFetch(url, {
    method: 'POST',
    body: payload,
    headers: {
      'Content-Type': 'application/json',
    },
  });
};

export function useConceptsSearch(conceptToLookup: string) {
  const conditionsSearchUrl = `${restBaseUrl}/conceptsearch?q=${conceptToLookup}`;

  const { data, error, isLoading } = useSWR<{ data: { results: Array<ServiceConcept> } }, Error>(
    conceptToLookup ? conditionsSearchUrl : null,
    openmrsFetch,
  );

  return {
    searchResults: data?.data?.results ?? [],
    error: error,
    isSearching: isLoading,
  };
}

export function useBillableCommodities() {
  const apiURL = `${apiBasePath}cashierItemPrice?v=default`;

  const { data, error, isLoading, isValidating } = useSWR<{ data: { results: Array<CashierItem> } }, Error>(
    apiURL,
    openmrsFetch,
  );

  const filteredCommodities = (data?.data?.results ?? []).filter(
    (commodity) => commodity.item && commodity.item.trim() !== '',
  );

  return {
    billableCommodities: filteredCommodities,
    error,
    isLoading,
    isValidating,
  };
}

export const updateBillableService = (uuid: string, payload: any) => {
  const url = `${apiBasePath}billableService/${uuid}`;
  return openmrsFetch(url, {
    method: 'POST',
    body: JSON.stringify(payload),
    headers: {
      'Content-Type': 'application/json',
    },
  });
};

export const updateBillableCommodity = (uuid: string, payload: any) => {
  const url = `${apiBasePath}cashierItemPrice/${uuid}`;
  return openmrsFetch(url, {
    method: 'POST',
    body: JSON.stringify(payload),
    headers: {
      'Content-Type': 'application/json',
    },
  });
};

export const deleteBillableCommodity = (uuid: string) => {
  const url = `${apiBasePath}cashierItemPrice/${uuid}`;

  return openmrsFetch(url, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
  });
};
