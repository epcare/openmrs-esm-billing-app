import React, { type ComponentProps, useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import classNames from 'classnames';
import {
  Button,
  DataTable,
  InlineLoading,
  Layer,
  Modal,
  OverflowMenu,
  OverflowMenuItem,
  Pagination,
  Search,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableHeader,
  TableRow,
  Tile,
} from '@carbon/react';
import { ArrowRight, OverflowMenuVertical } from '@carbon/react/icons';
import {
  useLayoutType,
  isDesktop,
  useConfig,
  usePagination,
  ErrorState,
  navigate,
  launchWorkspace,
  showModal,
  ChevronDownIcon,
  ChevronUpIcon,
} from '@openmrs/esm-framework';
import { EmptyState } from '@openmrs/esm-patient-common-lib';
import { type BillableService } from '../types/index';
import { useBillableServices, useBillableServicesAndItems } from './billable-service.resource';
import AddBillableService from './create-edit/add-billable-service.component';
import styles from './billable-services.scss';

const BillableServices = () => {
  const { t } = useTranslation();
  const { billableServicesAndItems, error, isLoading, isValidating } = useBillableServicesAndItems();
  const layout = useLayoutType();
  const config = useConfig();
  const [searchString, setSearchString] = useState('');
  const responsiveSize = isDesktop(layout) ? 'lg' : 'sm';
  const pageSizes = config?.billableServicesAndItems?.pageSizes ?? [10, 20, 30, 40, 50];
  const [pageSize, setPageSize] = useState(config?.billableServicesAndItems?.pageSize ?? 10);

  const [showOverlay, setShowOverlay] = useState(false);
  const [editingService, setEditingService] = useState(null);

  const headerData = [
    {
      header: t('serviceName', 'Service Name'),
      key: 'serviceName',
    },
    {
      header: t('shortName', 'Short Name'),
      key: 'shortName',
    },
    {
      header: t('serviceType', 'Service Type'),
      key: 'serviceType',
    },
    {
      header: t('status', 'Service Status'),
      key: 'status',
    },
    {
      header: t('prices', 'Prices'),
      key: 'prices',
    },
    {
      header: t('actions', 'Actions'),
      key: 'actions',
    },
  ];

  const launchBillableServiceForm = useCallback(() => {
    navigate({ to: window.getOpenmrsSpaBase() + 'billable-services/add-service' });
    setEditingService(null);
    setShowOverlay(true);
  }, []);

  const { paginated, goTo, results, currentPage } = usePagination<BillableService>(billableServicesAndItems, pageSize);
  const rowData = [];

  if (results) {
    results.forEach((service, index) => {
      const s = {
        id: `${index}`,
        uuid: service.uuid,
        serviceName: service?.name,
        shortName: service?.shortName,
        serviceType: service?.serviceType?.display,
        status: service.serviceStatus,
        prices: '--',
        actions: (
          <OverflowMenu size="sm" flipped>
            <OverflowMenuItem
              itemText={t('editBillableService', 'Edit Billable Service')}
              onClick={() => handleEditService(service)}
            />
          </OverflowMenu>
        ),
      };
      let cost = '';
      service.servicePrices.forEach((price) => {
        cost += `${price.name} (${price.price}) `;
      });
      s.prices = cost;
      rowData.push(s);
    });
  }

  const handleSearch = useCallback(
    (e) => {
      goTo(1);
      setSearchString(e.target.value);
    },
    [goTo, setSearchString],
  );
  const handleEditService = useCallback((service) => {
    setEditingService(service);
    setShowOverlay(true);
  }, []);

  const closeModal = useCallback(() => {
    setShowOverlay(false);
    setEditingService(null);
  }, []);

  const launchChargeItemModal = useCallback(() => {
    const dispose = showModal('charge-item-modal', {
      closeModal: () => dispose(),
      size: 'sm',
    });
  }, []);

  if (isLoading) {
    return <InlineLoading status="active" iconDescription="Loading" description="Loading data..." />;
  }

  if (error) {
    return <ErrorState headerTitle={t('billableService', 'Billable Service')} error={error} />;
  }

  if (billableServicesAndItems.length === 0) {
    return (
      <EmptyState
        displayText={t('billableServices', 'Billable Services')}
        headerTitle={t('billableService', 'Billable Service')}
        launchForm={launchBillableServiceForm}
      />
    );
  }

  return (
    <>
      {billableServicesAndItems?.length > 0 ? (
        <div className={styles.serviceContainer}>
          <FilterableTableHeader
            handleClick={launchChargeItemModal}
            handleSearch={handleSearch}
            isValidating={isValidating}
            layout={layout}
            responsiveSize={responsiveSize}
            t={t}
          />
          <DataTable
            isSortable
            rows={rowData}
            headers={headerData}
            size={responsiveSize}
            useZebraStyles={rowData?.length > 1 ? true : false}>
            {({ rows, headers, getRowProps, getTableProps }) => (
              <TableContainer>
                <Table {...getTableProps()} aria-label="service list">
                  <TableHead>
                    <TableRow>
                      {headers.map((header) => (
                        <TableHeader key={header.key}>{header.header}</TableHeader>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {rows.map((row) => (
                      <TableRow
                        key={row.id}
                        {...getRowProps({
                          row,
                        })}>
                        {row.cells.map((cell) => (
                          <TableCell key={cell.id}>{cell.value}</TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </DataTable>
          {billableServicesAndItems?.length === 0 && (
            <div className={styles.filterEmptyState}>
              <Layer level={0}>
                <Tile className={styles.filterEmptyStateTile}>
                  <p className={styles.filterEmptyStateContent}>
                    {t('noMatchingServicesToDisplay', 'No matching services to display')}
                  </p>
                  <p className={styles.filterEmptyStateHelper}>{t('checkFilters', 'Check the filters above')}</p>
                </Tile>
              </Layer>
            </div>
          )}
          {paginated && (
            <Pagination
              forwardText="Next page"
              backwardText="Previous page"
              page={currentPage}
              pageSize={pageSize}
              pageSizes={pageSizes}
              totalItems={billableServicesAndItems?.length}
              className={styles.pagination}
              size={responsiveSize}
              onChange={({ pageSize: newPageSize, page: newPage }) => {
                if (newPageSize !== pageSize) {
                  setPageSize(newPageSize);
                }
                if (newPage !== currentPage) {
                  goTo(newPage);
                }
              }}
            />
          )}
        </div>
      ) : (
        <EmptyState
          launchForm={launchBillableServiceForm}
          displayText={t('noServicesToDisplay', 'There are no commodities and services to display')}
          headerTitle={t('billableService', 'Billable commoditiy and service')}
        />
      )}
      {showOverlay && (
        <Modal
          open={showOverlay}
          modalHeading={t('billableService', 'Billable Service')}
          primaryButtonText={null}
          secondaryButtonText={t('cancel', 'Cancel')}
          onRequestClose={closeModal}
          onSecondarySubmit={closeModal}
          size="lg"
          passiveModal={true}>
          <AddBillableService editingService={editingService} onClose={closeModal} />
        </Modal>
      )}
    </>
  );
};

function FilterableTableHeader({ layout, handleSearch, isValidating, responsiveSize, t, handleClick }) {
  const [isExpanded, setIsExpanded] = useState(false);
  return (
    <>
      <div className={styles.headerContainer}>
        <div
          className={classNames({
            [styles.tabletHeading]: !isDesktop(layout),
            [styles.desktopHeading]: isDesktop(layout),
          })}>
          <h4>{t('commoditiesAndservicesList', 'Commodities and Services list')}</h4>
        </div>
        <div className={styles.backgroundDataFetchingIndicator}>
          <span>{isValidating ? <InlineLoading /> : null}</span>
        </div>
      </div>
      <div className={styles.actionsContainer}>
        <Search
          labelText=""
          placeholder={t('filterTable', 'Filter table')}
          onChange={handleSearch}
          size={responsiveSize}
        />
        <OverflowMenu
          onOpen={() => setIsExpanded(true)}
          onClose={() => setIsExpanded(false)}
          renderIcon={(props: ComponentProps<typeof ChevronUpIcon>) => (
            <span className={styles.actionsTrigger}>
              {t('actions', 'Actions')}
              &nbsp;&nbsp;
              {isExpanded ? <ChevronUpIcon size={16} {...props} /> : <ChevronDownIcon size={16} />}
            </span>
          )}
          menuOffset={() => ({ top: 0, left: -100 })}
          className={styles.newOverflowMenu}>
          <OverflowMenuItem
            itemText={t('addService', 'Add service')}
            onClick={() => {
              navigate({ to: window.getOpenmrsSpaBase() + 'billable-services/add-service' });
            }}
          />
          <OverflowMenuItem itemText={t('addCommodity', 'Add commodity')} onClick={handleClick} />
        </OverflowMenu>
      </div>
    </>
  );
}
export default BillableServices;
