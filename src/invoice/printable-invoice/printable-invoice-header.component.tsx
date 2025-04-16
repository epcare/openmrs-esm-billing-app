import React from 'react';
import { type PatientDetails } from '../../types';
import { useConfig, useSession } from '@openmrs/esm-framework';
import { useTranslation } from 'react-i18next';
import styles from './printable-invoice-header.scss';
interface PrintableInvoiceHeaderProps {
  patientDetails: PatientDetails;
  facility: string;
}

const PrintableInvoiceHeader: React.FC<PrintableInvoiceHeaderProps> = ({ patientDetails, facility }) => {
  const { t } = useTranslation();
  const { logo } = useConfig({ externalModuleName: '@ugandaemr/esm-login-app' });
  const { sessionLocation, user } = useSession();
  const location = sessionLocation?.display;

  return (
    <div className={styles.container}>
      <div className={styles.printableHeader}>
        <p className={styles.heading}>{t('invoice', 'Invoice')}</p>
        {logo?.src && <img className={styles.img} width={110} height={40} src={logo.src} alt={logo.alt} />}
      </div>

      <div className={styles.printableBody}>
        <div className={styles.billDetails}>
          <p className={styles.itemHeading}>{t('billedTo', 'Billed to')}</p>
          <p className={styles.itemLabel}>{patientDetails?.name}</p>
          <p className={styles.itemLabel}>{patientDetails?.county}</p>
          <p className={styles.itemLabel}>
            {patientDetails?.subCounty}
            {patientDetails?.city ? `, ${patientDetails?.city}` : null}
          </p>
        </div>

        <div className={styles.facilityDetails}>
          <p className={styles.facilityName}>{facility}</p>
          <p className={styles.itemLabel}>{location}</p>
        </div>
      </div>
    </div>
  );
};

export default PrintableInvoiceHeader;
