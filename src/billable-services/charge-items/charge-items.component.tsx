import React, { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
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
import { ArrowRight } from '@carbon/react/icons';
import { useLayoutType, isDesktop, usePagination, ErrorState } from '@openmrs/esm-framework';
import { EmptyState } from '@openmrs/esm-patient-common-lib';
import { useBillableCommodities, useBillableServices } from '../billable-service.resource';
import styles from '../billable-services.scss';
import AddBillableStock from './charge-items-modal.component';
import classNames from 'classnames';

const BillableStock = () => {
  const { t } = useTranslation();
  const layout = useLayoutType();
  const responsiveSize = isDesktop(layout) ? 'lg' : 'sm';

  const { billableCommodities: chargeItems, isLoading, isValidating, error } = useBillableCommodities();

  const [searchString, setSearchString] = useState('');
  const [pageSize, setPageSize] = useState(10);
  const [showOverlay, setShowOverlay] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  const headerData = [
    { header: t('itemName', 'Item Name'), key: 'itemName' },
    { header: t('price', 'Price'), key: 'price' },
    { header: t('paymentMode', 'Payment Mode'), key: 'paymentMode' },
    { header: t('actions', 'Actions'), key: 'actions' },
  ];

  const searchResults = useMemo(() => {
    if (!chargeItems) return [];
    if (searchString.trim() === '') return chargeItems;

    const search = searchString.toLowerCase();
    return chargeItems.filter((item) => Object.values(item).some((val) => `${val}`.toLowerCase().includes(search)));
  }, [searchString, chargeItems]);

  const { paginated, goTo, results, currentPage } = usePagination(searchResults, pageSize);
  const rowData = [];

  if (results) {
    results.forEach((item, index) => {
      rowData.push({
        id: `${index}`,
        uuid: item.uuid,
        itemName: item.item || '--',
        price: item.price ?? '--',
        paymentMode: item.paymentMode?.name || '--',
        actions: (
          <TableCell>
            <OverflowMenu size="sm" flipped>
              <OverflowMenuItem
                itemText={t('editBillableStock', 'Edit billable stock')}
                onClick={() => handleEditItem(item)}
              />
            </OverflowMenu>
          </TableCell>
        ),
      });
    });
  }

  const handleSearch = useCallback(
    (e) => {
      goTo(1);
      setSearchString(e.target.value);
    },
    [goTo],
  );

  const handleEditItem = useCallback((item) => {
    setEditingItem(item);
    setShowOverlay(true);
  }, []);

  const closeModal = useCallback(() => {
    setShowOverlay(false);
    setEditingItem(null);
  }, []);

  if (isLoading) {
    return <InlineLoading status="active" iconDescription="Loading" description="Loading data..." />;
  }
  if (error) {
    return <ErrorState headerTitle={t('billableStock', 'Billable Stock')} error={error} />;
  }
  if (!chargeItems || chargeItems.length === 0) {
    return (
      <EmptyState
        displayText={t('billableStock', 'Billable Stock')}
        headerTitle={t('billableStock', 'Billable Stock')}
        launchForm={() => setShowOverlay(true)}
      />
    );
  }

  return (
    <>
      <div className={styles.serviceContainer}>
        <FilterableTableHeader
          handleSearch={handleSearch}
          isValidating={isValidating}
          layout={layout}
          responsiveSize={responsiveSize}
          t={t}
          onAddNew={() => setShowOverlay(true)}
        />
        <DataTable
          isSortable
          rows={rowData}
          headers={headerData}
          size={responsiveSize}
          useZebraStyles={rowData?.length > 1}>
          {({ rows, headers, getRowProps, getTableProps }) => (
            <TableContainer>
              <Table {...getTableProps()} aria-label="charge item list">
                <TableHead>
                  <TableRow>
                    {headers.map((header) => (
                      <TableHeader key={header.key}>{header.header}</TableHeader>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {rows.map((row) => (
                    <TableRow key={row.id} {...getRowProps({ row })}>
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
        {paginated && (
          <Pagination
            forwardText="Next page"
            backwardText="Previous page"
            page={currentPage}
            pageSize={pageSize}
            pageSizes={[10, 20, 30, 40, 50]}
            totalItems={searchResults.length}
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

      {showOverlay && (
        <Modal
          open={showOverlay}
          modalHeading={t('billableStock', 'Billable Stock')}
          primaryButtonText={null}
          secondaryButtonText={t('cancel', 'Cancel')}
          onRequestClose={closeModal}
          onSecondarySubmit={closeModal}
          size="lg"
          passiveModal={true}>
          <AddBillableStock editingItem={editingItem} onClose={closeModal} />
        </Modal>
      )}
    </>
  );
};

function FilterableTableHeader({ layout, handleSearch, isValidating, responsiveSize, t, onAddNew }) {
  return (
    <>
      <div className={styles.headerContainer}>
        <div
          className={classNames({
            [styles.tabletHeading]: !isDesktop(layout),
            [styles.desktopHeading]: isDesktop(layout),
          })}>
          <h4>{t('stockList', 'Stock list')}</h4>
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
        <Button
          size={responsiveSize}
          kind="primary"
          renderIcon={(props) => <ArrowRight size={16} {...props} />}
          onClick={onAddNew}
          iconDescription={t('addNewStock', 'Add new stock')}>
          {t('addNewStock', 'Add new stock')}
        </Button>
      </div>
    </>
  );
}

export default BillableStock;
