import React, { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import classNames from 'classnames';
import {
  Button,
  DataTable,
  InlineLoading,
  Layer,
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
import { ArrowRight } from '@carbon/react/icons';
import {
  useLayoutType,
  isDesktop,
  useConfig,
  usePagination,
  ErrorState,
  EmptyCard,
  launchWorkspace2,
} from '@openmrs/esm-framework';
import { type BillableService } from '../types/index';
import { useBillableServices } from './billable-service.resource';
import styles from './billable-services.scss';

const BillableServices = () => {
  const { t } = useTranslation();
  const { billableServices, isLoading, isValidating, error, mutate } = useBillableServices();
  const layout = useLayoutType();
  const config = useConfig();
  const [searchString, setSearchString] = useState('');
  const responsiveSize = isDesktop(layout) ? 'lg' : 'sm';
  const pageSizes = [10, 20, 30, 40, 50];
  const [pageSize, setPageSize] = useState(10);

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
      header: t('serviceStatus', 'Service Status'),
      key: 'status',
    },
    {
      header: t('prices', 'Prices'),
      key: 'prices',
    },
  ];

  const launchBillableServiceForm = useCallback(() => {
    launchWorkspace2('billable-service-form', {
      onWorkspaceClose: mutate,
    });
  }, [mutate]);

  const searchResults: BillableService[] = useMemo(() => {
    const flatBillableServices = Array.isArray(billableServices) ? billableServices.flat() : billableServices;

    if (flatBillableServices !== undefined && flatBillableServices.length > 0) {
      if (searchString && searchString.trim() !== '') {
        const search = searchString.toLowerCase();
        return flatBillableServices.filter((service: BillableService) =>
          Object.entries(service).some(([header, value]) => {
            return header === 'uuid' ? false : `${value}`.toLowerCase().includes(search);
          }),
        );
      }
    }
    return flatBillableServices;
  }, [searchString, billableServices]);

  const { goTo, results: paginatedList, currentPage } = usePagination(searchResults, pageSize);
  const rowData = [];

  if (paginatedList) {
    paginatedList.forEach((service, index) => {
      const s = {
        id: `${index}`,
        uuid: service.uuid,
        serviceName: service.name,
        shortName: service.shortName,
        serviceType: service?.serviceType?.display,
        status: service.serviceStatus,
        prices: '--',
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

  const handleEditService = useCallback(
    (service: BillableService) => {
      launchWorkspace2('billable-service-form', {
        serviceToEdit: service,
        onWorkspaceClose: mutate,
      });
    },
    [mutate],
  );

  if (isLoading) {
    return <InlineLoading status="active" iconDescription="Loading" description="Loading data..." />;
  }
  if (error) {
    return <ErrorState headerTitle={t('billableService', 'Billable Service')} error={error} />;
  }
  if (billableServices.length === 0) {
    return (
      <EmptyCard
        displayText={t('billableService', 'Billable service')}
        headerTitle={t('billableService', 'Billable service')}
        launchForm={launchBillableServiceForm}
      />
    );
  }

  return (
    <>
      {billableServices?.length > 0 ? (
        <div className={styles.serviceContainer}>
          <FilterableTableHeader
            handleSearch={handleSearch}
            isValidating={isValidating}
            layout={layout}
            responsiveSize={responsiveSize}
            searchString={searchString}
            t={t}
            launchForm={launchBillableServiceForm}
          />
          <DataTable
            isSortable
            rows={rowData}
            headers={headerData}
            size={responsiveSize}
            useZebraStyles={rowData?.length > 1 ? true : false}
            overflowMenuOnHover={isDesktop(layout)}>
            {({ rows, headers, getRowProps, getTableProps, getHeaderProps }) => (
              <TableContainer>
                <Table {...getTableProps()} aria-label="service list">
                  <TableHead>
                    <TableRow>
                      {headers.map((header) => (
                        <TableHeader
                          {...getHeaderProps({
                            header,
                          })}
                          key={header.key}>
                          {header.header}
                        </TableHeader>
                      ))}
                      <TableHeader aria-label={t('actions', 'Actions')} />
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
                        <TableCell className="cds--table-column-menu">
                          <OverflowMenu size="lg" flipped>
                            <OverflowMenuItem
                              className={styles.menuItem}
                              itemText={t('editBillableService', 'Edit billable service')}
                              onClick={() =>
                                handleEditService(paginatedList.find((service) => service.uuid === row.id))
                              }
                            />
                          </OverflowMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </DataTable>
          {searchResults?.length === 0 && (
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
          <Pagination
            forwardText="Next page"
            backwardText="Previous page"
            page={currentPage}
            pageSize={pageSize}
            pageSizes={pageSizes}
            totalItems={searchResults?.length}
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
        </div>
      ) : (
        <EmptyCard
          launchForm={launchBillableServiceForm}
          displayText={t('noServicesToDisplay', 'There are no services to display')}
          headerTitle={t('billableService', 'Billable service')}
        />
      )}
    </>
  );
};

function FilterableTableHeader({ layout, handleSearch, isValidating, responsiveSize, t, searchString, launchForm }) {
  return (
    <>
      <div className={styles.headerContainer}>
        <div
          className={classNames({
            [styles.tabletHeading]: !isDesktop(layout),
            [styles.desktopHeading]: isDesktop(layout),
          })}>
          <h4>{t('servicesList', 'Services list')}</h4>
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
          value={searchString}
          size={responsiveSize}
        />
        <Button
          size={responsiveSize}
          kind="primary"
          renderIcon={(props) => <ArrowRight size={16} {...props} />}
          onClick={launchForm}
          iconDescription={t('addNewBillableService', 'Add new billable service')}>
          {t('addNewService', 'Add new service')}
        </Button>
      </div>
    </>
  );
}
export default BillableServices;
