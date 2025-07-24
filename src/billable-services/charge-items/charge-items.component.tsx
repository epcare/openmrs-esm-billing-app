import React, { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Controller, useForm } from 'react-hook-form';
import { Button, Form, InlineNotification, ModalBody, ModalFooter, ModalHeader, Search, Stack , Layer } from '@carbon/react';
import { useDebounce, useLayoutType } from '@openmrs/esm-framework';
import styles from './charge-items-form.scss';
import { type BillableItem } from '../../types';

interface ChargeItemFormProps {
  close(): () => void;
}

const ChargeItemForm: React.FC<ChargeItemFormProps> = ({ close }) => {
  const { t } = useTranslation();
  const isTablet = useLayoutType() === 'tablet';
  const [selectedItem, setSelectedItem] = useState<BillableItem>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [errorMessage, setErrorMessage] = useState(null);
  const debouncedSearchTerm = useDebounce(searchTerm);

  const searchInputRef = useRef(null);
  const handleSearchTermChange = (event: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(event.target.value);

  const {
    control,
    formState: { errors },
  } = useForm<{ search: string }>({
    defaultValues: {
      search: '',
    },
  });

  return (
    <Form>
      <ModalHeader closeModal={close} title={t('searchItem', 'Search Billable Item')} />
      <ModalBody>
        <Stack gap={5} className={styles.languageOptionsContainer}>
          <Controller
            name="search"
            control={control}
            render={({ field: { onChange, value, onBlur } }) => (
              <ResponsiveWrapper isTablet={isTablet}>
                <Search
                  ref={searchInputRef}
                  size="md"
                  id="conceptsSearch"
                  labelText={t('enterConcept', 'Associated concept')}
                  placeholder={t('searchConcepts', 'Search associated concept')}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    onChange(e);
                    handleSearchTermChange(e);
                  }}
                  onBlur={onBlur}
                  onClear={() => {
                    setSearchTerm('');
                    setSelectedItem(null);
                  }}
                  value={(() => {
                    if (selectedItem) {
                      return selectedItem.drugName;
                    }
                    if (debouncedSearchTerm) {
                      return value;
                    }
                    return '';
                  })()}
                />
              </ResponsiveWrapper>
            )}
          />

          {errorMessage && (
            <InlineNotification
              kind="error"
              onClick={() => setErrorMessage(null)}
              subtitle={errorMessage}
              title={t('error', 'Error')}
            />
          )}
        </Stack>
      </ModalBody>
      <ModalFooter>
        <Button kind="secondary" onClick={close}>
          {t('cancel', 'Cancel')}
        </Button>
        <Button className={styles.submitButton} type="submit">
          <span>{t('submit', 'Submit')}</span>
        </Button>
      </ModalFooter>
    </Form>
  );
};

function ResponsiveWrapper({ children, isTablet }: { children: React.ReactNode; isTablet: boolean }) {
  return isTablet ? <Layer>{children}</Layer> : <>{children}</>;
}

export default ChargeItemForm;
