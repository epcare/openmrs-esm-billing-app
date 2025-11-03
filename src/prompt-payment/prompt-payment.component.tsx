import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Button,
  ComposedModal,
  Heading,
  ModalBody,
  ModalFooter,
  StructuredListBody,
  StructuredListCell,
  StructuredListHead,
  StructuredListRow,
  StructuredListWrapper,
  InlineLoading,
} from '@carbon/react';
import styles from './prompt-payment.scss';
import { navigate, useConfig, usePatient } from '@openmrs/esm-framework';
import { type ConfigObject } from '../config-schema';
import { usePatientBills } from '../billing.resource';
import { convertToCurrency, extractString } from '../helpers';

const PromptPaymentModal: React.FC = () => {
  const { t } = useTranslation();
  const { patientUuid } = usePatient();
  const { patientBills: bills, isLoading, error, mutate } = usePatientBills(patientUuid ?? '');
  const [showModal, setShowModal] = useState({ billingModal: true });
  const { enforceBillPayment, defaultCurrency } = useConfig<ConfigObject>();

  const closeButtonText = enforceBillPayment
    ? t('naviagetBack', 'Navigate back')
    : t('proceedToCare', 'Proceed to care');

  const handleCloseModal = () => {
    enforceBillPayment
      ? navigate({ to: `\${openmrsSpaBase}/home` })
      : setShowModal((prevState) => ({ ...prevState, billingModal: false }));
  };

  const lineItems = bills
    .filter((bill) => bill.status !== 'PAID')
    .flatMap((bill) => bill.lineItems)
    .filter((lineItem) => lineItem.paymentStatus !== 'PAID');

  if (lineItems.length === 0) {
    return null;
  }

  return (
    <ComposedModal preventCloseOnClickOutside open={showModal.billingModal}>
      {isLoading ? (
        <ModalBody>
          <Heading className={styles.modalTitle}>{t('billingStatus', 'Billing status')}</Heading>
          <InlineLoading
            status="active"
            iconDescription="Loading"
            description={t('verifyingPatientBills', 'Verifying patient bills')}
          />
        </ModalBody>
      ) : (
        <ModalBody>
          <Heading className={styles.modalTitle}>{t('patientBillingAlert', 'Patient Billing Alert')}</Heading>
          <p className={styles.bodyShort02}>
            {t('billSettlementMessage', 'The current patient has pending bill. Advise patient to settle bill.')}
          </p>
          <StructuredListWrapper isCondensed>
            <StructuredListHead>
              <StructuredListRow head>
                <StructuredListCell head>{t('item', 'Item')}</StructuredListCell>
                <StructuredListCell head>{t('quantity', 'Quantity')}</StructuredListCell>
                <StructuredListCell head>{t('unitPrice', 'Unit Price')}</StructuredListCell>
                <StructuredListCell head>{t('paymentstatus', 'Payment status')}</StructuredListCell>
                <StructuredListCell head>{t('total', 'Total')}</StructuredListCell>
              </StructuredListRow>
            </StructuredListHead>
            <StructuredListBody>
              {lineItems.map((lineItem) => {
                return (
                  <StructuredListRow key={lineItem.uuid}>
                    <StructuredListCell>{extractString(lineItem.billableService || lineItem.item)}</StructuredListCell>
                    <StructuredListCell>{lineItem.quantity}</StructuredListCell>
                    <StructuredListCell>{convertToCurrency(lineItem.price, defaultCurrency)}</StructuredListCell>
                    <StructuredListCell>{lineItem.paymentStatus}</StructuredListCell>
                    <StructuredListCell>
                      {convertToCurrency(lineItem.quantity * lineItem.price, defaultCurrency)}
                    </StructuredListCell>
                  </StructuredListRow>
                );
              })}
            </StructuredListBody>
          </StructuredListWrapper>
          {!enforceBillPayment && (
            <p className={styles.providerMessage}>
              {t(
                'providerMessage',
                'By clicking Proceed to care, you acknowledge that you have advised the patient to settle the bill.',
              )}
            </p>
          )}
        </ModalBody>
      )}
      <ModalFooter>
        <Button kind="secondary" onClick={() => navigate({ to: `\${openmrsSpaBase}/home` })}>
          {t('cancel', 'Cancel')}
        </Button>
        <Button kind="danger" onClick={handleCloseModal}>
          {closeButtonText}
        </Button>
      </ModalFooter>
    </ComposedModal>
  );
};

export default PromptPaymentModal;
