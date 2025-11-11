import React, { useContext, useMemo } from 'react';
import dayjs from 'dayjs';
import isEmpty from 'lodash-es/isEmpty';
import sortBy from 'lodash-es/sortBy';
import useSWR, { mutate } from 'swr';
import {
  formatDate,
  parseDate,
  openmrsFetch,
  useSession,
  useVisit,
  restBaseUrl,
  useOpenmrsFetchAll,
} from '@openmrs/esm-framework';
import { apiBasePath } from './constants';
import type { FacilityDetail, MappedBill, PatientInvoice, StockItem } from './types';
import SelectedDateContext from './hooks/selectedDateContext';

export const useBills = (patientUuid: string = '', billStatus: string = '') => {
  const { selectedDate } = useContext(SelectedDateContext);
  const url = `${apiBasePath}bill?q=&v=full`;

  const patientUrl = `${apiBasePath}bill?patientUuid=${patientUuid}&v=full`;

  const { data, error, isLoading, isValidating, mutate } = useSWR<{ data: { results: Array<PatientInvoice> } }>(
    isEmpty(patientUuid) ? url : patientUrl,
    openmrsFetch,
  );

  const mapBillProperties = (bill: PatientInvoice): MappedBill & { dateCreatedRaw?: string | null } => ({
    id: bill?.id,
    uuid: bill?.uuid,
    patientName: bill?.patient?.display.split('-')?.[1],
    identifier: bill?.patient?.display.split('-')?.[0],
    patientUuid: bill?.patient?.uuid,
    status: bill.lineItems.some((item) => item.paymentStatus === 'PENDING') ? 'PENDING' : 'PAID',
    receiptNumber: bill?.receiptNumber,
    cashier: bill?.cashier,
    cashPointUuid: bill?.cashPoint?.uuid,
    cashPointName: bill?.cashPoint?.name,
    cashPointLocation: bill?.cashPoint?.location?.display,
    dateCreatedRaw: bill?.dateCreated ?? null,
    dateCreated: bill?.dateCreated ? formatDate(parseDate(bill.dateCreated), { mode: 'wide' }) : '--',
    lineItems: bill?.lineItems,
    billingService: bill?.lineItems.map((bill) => bill?.item || bill?.billableService || '--').join('  '),
    payments: bill?.payments,
    display: bill?.display,
    totalAmount: bill?.lineItems?.map((item) => item.price * item.quantity).reduce((prev, curr) => prev + curr, 0),
  });

  const sortedBills = sortBy(data?.data?.results ?? [], ['dateCreated']).reverse();
  const filteredBills = billStatus === '' ? sortedBills : sortedBills?.filter((bill) => bill?.status === billStatus);
  const mappedResults = filteredBills?.map((bill) => mapBillProperties(bill));

  const dateFilteredBills = React.useMemo(() => {
    if (!selectedDate) return mappedResults;
    const start = dayjs(selectedDate).startOf('day');
    const end = dayjs(selectedDate).endOf('day');
    return mappedResults.filter((b) => {
      const raw = b.dateCreatedRaw;
      if (!raw) return false;
      const when = dayjs(raw);
      return (when.isAfter(start) && when.isBefore(end)) || when.isSame(start, 'minute') || when.isSame(end, 'minute');
    });
  }, [mappedResults, selectedDate]);

  return {
    bills: mappedResults,
    dateFilteredBills,
    error,
    isLoading,
    isValidating,
    mutate,
  };
};

export const useBill = (billUuid: string) => {
  const url = `${apiBasePath}bill/${billUuid}`;
  const { data, error, isLoading, isValidating, mutate } = useSWR<{ data: PatientInvoice }>(
    billUuid ? url : null,
    openmrsFetch,
  );

  const mapBillProperties = (bill: PatientInvoice): MappedBill => ({
    id: bill?.id,
    uuid: bill?.uuid,
    patientName: bill?.patient?.display.split('-')?.[1],
    identifier: bill?.patient?.display.split('-')?.[0],
    patientUuid: bill?.patient?.uuid,
    status:
      bill.lineItems.length > 1
        ? bill.lineItems.some((item) => item.paymentStatus === 'PENDING')
          ? 'PENDING'
          : 'PAID'
        : bill.status,
    receiptNumber: bill?.receiptNumber,
    cashier: bill?.cashier,
    cashPointUuid: bill?.cashPoint?.uuid,
    cashPointName: bill?.cashPoint?.name,
    cashPointLocation: bill?.cashPoint?.location?.display,
    dateCreated: bill?.dateCreated ? formatDate(parseDate(bill.dateCreated), { mode: 'wide' }) : '--',
    lineItems: bill?.lineItems,
    billingService: bill?.lineItems.map((bill) => bill.item).join(' '),
    payments: bill.payments,
    totalAmount: bill?.lineItems?.map((item) => item.price * item.quantity).reduce((prev, curr) => prev + curr, 0),
    tenderedAmount: bill?.payments?.map((item) => item.amountTendered).reduce((prev, curr) => prev + curr, 0),
  });

  const formattedBill = data?.data ? mapBillProperties(data?.data) : null;

  return {
    bill: formattedBill,
    error,
    isLoading,
    isValidating,
    mutate,
  };
};

export const processBillPayment = (payload, billUuid: string) => {
  const url = `${apiBasePath}bill/${billUuid}`;

  return openmrsFetch(url, {
    method: 'POST',
    body: payload,
    headers: {
      'Content-Type': 'application/json',
    },
  });
};

export function useDefaultFacility() {
  const url = `${restBaseUrl}/kenyaemr/default-facility`;
  const { authenticated } = useSession();

  const { data, isLoading } = useSWR<{ data: FacilityDetail }>(authenticated ? url : null, openmrsFetch);

  return { data: data?.data, isLoading: isLoading };
}

export const usePatientPaymentInfo = (patientUuid: string) => {
  const { currentVisit } = useVisit(patientUuid);
  const attributes = currentVisit?.attributes ?? [];
  const paymentInformation = attributes
    .map((attribute) => ({
      name: attribute.attributeType.name,
      value: attribute.value,
    }))
    .filter(({ name }) => name === 'Insurance scheme' || name === 'Policy Number');

  return paymentInformation;
};

export function useFetchSearchResults(searchVal, category) {
  let url = ``;
  if (category == 'Commodity') {
    url = `${restBaseUrl}/stockmanagement/stockitem?v=default&limit=10&q=${searchVal}`;
  } else {
    url = `${apiBasePath}billableService?v=custom:(uuid,name,shortName,serviceStatus,serviceType:(display),servicePrices:(uuid,name,price,paymentMode))&limit=10&serviceName=${searchVal}`;
  }
  const { data, error, isLoading, isValidating } = useSWR(searchVal ? url : null, openmrsFetch, {});

  return { data: data?.data, error, isLoading: isLoading, isValidating };
}

export function useFetchChargeItems(searchValue: string) {
  const apiUrl = `${restBaseUrl}/stockmanagement/stockitem?v=default&limit=10&q=${searchValue}`;

  const { data, isLoading, error } = useSWR<{ data: { results: Array<StockItem> } }, Error>(
    searchValue ? apiUrl : null,
    openmrsFetch,
  );

  return {
    searchResults: data?.data?.results ?? [],
    error,
    isLoading,
  };
}

export const processBillItems = (payload) => {
  const url = `${apiBasePath}bill`;
  return openmrsFetch(url, {
    method: 'POST',
    body: payload,
    headers: {
      'Content-Type': 'application/json',
    },
  });
};

export const updateBillItems = (payload) => {
  const url = `${apiBasePath}bill/${payload.uuid}`;
  return openmrsFetch(url, {
    method: 'POST',
    body: payload,
    headers: {
      'Content-Type': 'application/json',
    },
  });
};

export const useStockItems = () => {
  const url = `${restBaseUrl}/stockmanagement/stockitem`;
  const { data, isLoading, isValidating, error, mutate } = useOpenmrsFetchAll<StockItem[]>(url);

  return {
    stockItems: data ?? [],
    isLoadingItem: isLoading,
    isValidating,
    error,
    mutate,
  };
};

export const useGetills = () => {
  const url = `${apiBasePath}bill?q=&v=full`;
  const { data, isLoading, isValidating, error, mutate } = useOpenmrsFetchAll(url);

  return {
    billItems: (data as any[]) ?? [],
    isLoadingItems: isLoading,
    isValidating,
    error,
    mutate,
  };
};

export function useFacilityName() {
  const apiURL = `${restBaseUrl}/systemsetting/ugandaemr.healthCenterName`;

  const { data, error, isLoading } = useSWR<{ data }, Error>(apiURL, openmrsFetch);

  return {
    facility: data?.data?.value ?? '',
    isLoadingFacility: isLoading,
    isError: error,
  };
}

export function usePatientBills(patientUuid: string) {
  const apiUrl = patientUuid ? `${apiBasePath}bill?patientUuid=${patientUuid}&v=full` : null;

  const { data, isLoading, error } = useSWR<{ data: { results: Array<PatientInvoice> } }, Error>(apiUrl, openmrsFetch);

  const patientBills = useMemo(() => {
    return data?.data?.results ?? [];
  }, [data?.data?.results]);
  return {
    patientBills: patientBills ?? [],
    isLoading,
    error,
    mutate,
  };
}
