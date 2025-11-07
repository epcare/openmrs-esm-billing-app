import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { deleteBillableService } from './billable-service.resource';
import { apiBasePath, handleMutate } from '../constants';
import { showSnackbar } from '@openmrs/esm-framework';
import { ModalBody, ModalFooter, Button, InlineLoading } from '@carbon/react';

const DeleteBillableService: React.FC<{ deletingService?: any; onClose: () => void }> = ({
  deletingService,
  onClose,
}) => {
  const { t } = useTranslation();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteService = async (e) => {
    e.preventDefault();
    if (!deletingService?.uuid) return;

    setIsDeleting(true);
    try {
      await deleteBillableService(deletingService.uuid);
      handleMutate(`${apiBasePath}billableService`);

      showSnackbar({
        isLowContrast: true,
        title: t('deleteBillableServiceSuccessTitle', 'Delete billable commodity'),
        kind: 'success',
        subtitle: t('deleteBillableServiceSuccessMessage', 'Billable ervice deleted successfully'),
      });

      onClose();
    } catch (e) {
      showSnackbar({
        title: t('deleteBillableServiceErrorTitle', 'Error deleting billable service'),
        kind: 'error',
        isLowContrast: true,
        subtitle: e?.message || t('unexpectedError', 'An unexpected error occurred.'),
      });
    } finally {
      setIsDeleting(false);
    }
  };
  return (
    <>
      <ModalBody>
        <span>
          {t('deleteBillableCommodityConfirm', 'Are you sure you want to delete')}{' '}
          <strong>{deletingService?.name}</strong> {t('fromTheBillableService', 'from the billable services')}?
        </span>
      </ModalBody>
      <ModalFooter>
        <Button kind="secondary" onClick={onClose} disabled={isDeleting}>
          {t('cancel', 'Cancel')}
        </Button>
        <Button type="submit" kind="danger" onClick={handleDeleteService} disabled={isDeleting}>
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

export default DeleteBillableService;
