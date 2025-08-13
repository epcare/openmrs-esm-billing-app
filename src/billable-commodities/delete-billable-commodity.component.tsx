import { Modal, ModalBody, ModalFooter, Button, InlineLoading } from '@carbon/react';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import styles from '../billable-commodities/charge-items-form.scss';
import { apiBasePath, handleMutate } from '../constants';
import { deleteBillableCommodity } from '../billable-services/billable-service.resource';
import { showSnackbar } from '@openmrs/esm-framework';

export const DeleteBillableCommodity: React.FC<{ deletingItem?: any; onClose: () => void }> = ({
  onClose,
  deletingItem,
}) => {
  const { t } = useTranslation();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async (e) => {
    e.preventDefault();
    if (!deletingItem?.uuid) return;

    setIsDeleting(true);
    try {
      await deleteBillableCommodity(deletingItem.uuid);
      handleMutate(`${apiBasePath}cashierItemPrice`);

      showSnackbar({
        isLowContrast: true,
        title: t('deleteBillableCommoditySuccessTitle', 'Delete Billable Commodity'),
        kind: 'success',
        subtitle: t('deleteBillableCommoditySuccessMessage', 'Billable commodity deleted successfully'),
      });

      onClose();
    } catch (error) {
      showSnackbar({
        title: t('deleteBillableCommodityErrorTitle', 'Error Deleting Billable Commodity'),
        kind: 'error',
        isLowContrast: true,
        subtitle: error?.message || t('unexpectedError', 'An unexpected error occurred.'),
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <ModalBody>
        <span className={styles.deleteText}>
          {t('deleteBillableCommodityConfirm', 'Are you sure you want to delete the billable commodity')}{' '}
          <strong>{deletingItem?.item}</strong>?
        </span>
      </ModalBody>
      <ModalFooter>
        <Button kind="secondary" onClick={onClose} disabled={isDeleting}>
          {t('cancel', 'Cancel')}
        </Button>
        <Button type="submit" kind="danger" onClick={handleDelete} disabled={isDeleting}>
          {isDeleting ? (
            <InlineLoading description={t('deleting', 'Deleting...')} />
          ) : (
            <span>{t('delete', 'Delete')}</span>
          )}
        </Button>
      </ModalFooter>
    </>
  );
};

export default DeleteBillableCommodity;
