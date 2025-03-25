import React, { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { DateFilterInput } from './date-filter/date-filter-section';
import { EmptyStateComponent } from './empty-state/empty-state.component';
import { useGetills } from '../../billing.resource';
import DataList from './data-table/data-table.component';
import styles from './bill-report.scss';
import { formatDate, parseDate } from '@openmrs/esm-framework';

const BillingReports = () => {
  const { t } = useTranslation();
  const currentDate = new Date();
  const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
  const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
  const [dateArray, setDateArray] = useState([startOfMonth, endOfMonth]);
  const [data, setData] = useState([]);
  const [hasUpdatedBillData, setHasUpdatedBillData] = useState(true);
  const { billItems } = useGetills();

  const headerData = [
    {
      header: t('date', 'Date'),
      key: 'date',
    },
    {
      header: t('identifier', 'Identifier'),
      key: 'identifier',
    },
    {
      header: t('patientName', 'Patient Names'),
      key: 'name',
    },
    {
      header: t('billedItems', 'Billed Items'),
      key: 'billedItems',
    },
    {
      header: t('amount', 'Amount'),
      key: 'amount',
    },
    {
      header: t('billStatus', 'Bill Status'),
      key: 'status',
    },
    {
      header: t('mode', 'Payment Mode'),
      key: 'mode',
    },
  ];

  const handleOnChangeRange = (dates: Array<Date>) => {
    setDateArray(dates);
  };

  const processBillReport = useCallback(() => {
    const dataArray = [];
    const filteredArray = billItems?.filter((item) => {
      const itemDate = new Date(item.dateCreated);
      return itemDate >= dateArray[0] && itemDate <= dateArray[1];
    });

    filteredArray?.forEach((item) => {
      dataArray.push({
        date: formatDate(parseDate(item.dateCreated), { mode: 'standard', noToday: true, time: false }),
        name: item?.patient?.display.split('-')?.[1],
        identifier: item?.patient?.display.split('-')?.[0],
        billedItems: item?.lineItems
          ?.map((bill) =>
            bill?.item && bill?.quantity > 0 ? `${bill.item}(${bill.quantity})` : bill?.billableService || null,
          )
          ?.filter(Boolean)
          ?.join(', '),
        amount: item?.payments?.[0]?.amount.toLocaleString(),
        status: item?.status,
        mode:
          item?.payments?.length > 1
            ? item?.payments
                ?.map((payment) => `${payment?.instanceType?.name} (${payment?.amountTendered.toLocaleString()})`)
                ?.join(' & ')
            : item?.payments?.[0]?.instanceType?.name,
      });
    });

    return dataArray;
  }, [billItems, dateArray]);
  const updateBillReport = () => {
    setData(processBillReport);
  };

  useEffect(() => {
    if (hasUpdatedBillData && billItems?.length > 0) {
      setData(processBillReport);
      setHasUpdatedBillData(false);
    }
  }, [billItems, hasUpdatedBillData, processBillReport]);

  return (
    <>
      <DateFilterInput
        handleOnChangeRange={handleOnChangeRange}
        updateBillReport={updateBillReport}
        dateValue={dateArray}
      />

      {data.length > 0 ? (
        <div className={styles.billTableContainer}>
          <DataList data={data} columns={headerData} />
        </div>
      ) : (
        <EmptyStateComponent title={`Click on one of the profiles above`} />
      )}
    </>
  );
};

export default BillingReports;
