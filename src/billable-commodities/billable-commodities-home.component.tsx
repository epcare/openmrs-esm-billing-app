import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { navigate } from '@openmrs/esm-framework';
import BillableCommodities from './billable-commodities.component';
import styles from '../billable-services/billable-services.scss';

const BillableCommoditiesHome: React.FC = () => {
  const { t } = useTranslation();
  const basePath = `${window.spaBase}/billable-commodities`;

  return (
    <BrowserRouter basename={`${window.spaBase}/billable-commodities`}>
      <main className={styles.mainSection}>
        <section>
          <Routes>
            <Route path="/" element={<BillableCommodities />} />
          </Routes>
        </section>
      </main>
    </BrowserRouter>
  );
};

export default BillableCommoditiesHome;
