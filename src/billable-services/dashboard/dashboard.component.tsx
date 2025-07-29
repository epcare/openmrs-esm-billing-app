import React from 'react';
import styles from './dashboard.scss';
import { ExtensionSlot } from '@openmrs/esm-framework';
import BillablesConfigurationTabs from '../billables-config-tabs/billable-config-tabs.component';

export default function BillableServicesDashboard() {
  return (
    <main className={styles.container}>
      <ExtensionSlot name="billing-home-tiles-slot" />
      <main className={styles.servicesTableContainer}>
        <BillablesConfigurationTabs />
      </main>
    </main>
  );
}
