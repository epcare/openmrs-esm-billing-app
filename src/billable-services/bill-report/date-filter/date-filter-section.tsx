import React from 'react';
import { DatePicker, DatePickerInput, Button } from '@carbon/react';
import { PartitionAuto } from '@carbon/react/icons';
import styles from './date-filter.scss';

export const DateFilterInput = (props) => {
  const { dateValue, handleOnChangeRange, updateBillReport } = props;
  return (
    <div className={styles.datePicker}>
      <DatePicker
        datePickerType="range"
        aria-label="Date Range Filter"
        onChange={handleOnChangeRange}
        value={dateValue}
        dateFormat="d/m/Y">
        <DatePickerInput id="date-picker-input-id-start" placeholder="dd/mm/yyyy" labelText="Start date" size="sm" />
        <DatePickerInput id="date-picker-input-id-end" placeholder="dd/mm/yyyy" labelText="End date" size="sm" />
      </DatePicker>
      <Button size="sm" kind="tertiary" onClick={updateBillReport} className={styles.updateTransaction}>
        <PartitionAuto />
        <span> UPDATE</span>
      </Button>
    </div>
  );
};
