import { configSchema } from './config-schema';
import { createDashboardLink } from '@openmrs/esm-patient-common-lib';
import { createLeftPanelLink } from './left-panel-link.component';
import { dashboardMeta } from './dashboard.meta';
import { defineConfigSchema, getAsyncLifecycle, getSyncLifecycle } from '@openmrs/esm-framework';
import appMenu from './billable-services/billable-services-menu-item/item.component';
import BillableServiceHome from './billable-services/billable-services-home.component';
import BillableServicesCardLink from './billable-services-admin-card-link.component';
import BillHistory from './bill-history/bill-history.component';
import BillingCheckInForm from './billing-form/billing-checkin-form.component';
import RequirePaymentModal from './modal/require-payment-modal.component';
import RootComponent from './root.component';
import ServiceMetrics from './billable-services/dashboard/service-metrics.component';
import VisitAttributeTags from './invoice/payments/visit-tags/visit-attribute.component';
import BillablesConfigurationTabs from './billable-services/billables-config-tabs/billable-config-tabs.component';
import BillableStock from './billable-commodities/billable-commodities.component';
import AddBillableStock from './billable-commodities/add-billable-commodity.component';
import DeleteBillableCommodity from './billable-commodities/delete-billable-commodity.component';

const moduleName = '@epcare/esm-billing-app';

const options = {
  featureName: 'billing',
  moduleName,
};

// t('billing', 'Billing')
export const billingDashboardLink = getSyncLifecycle(
  createLeftPanelLink({
    name: 'billing',
    title: 'Billing',
  }),
  options,
);

export const importTranslation = require.context('../translations', false, /.json$/, 'lazy');

export function startupApp() {
  defineConfigSchema(moduleName, configSchema);
}

export const billingSummaryDashboardLink = getSyncLifecycle(
  createDashboardLink({ ...dashboardMeta, moduleName }),
  options,
);

export const billableServicesAppMenuItem = getSyncLifecycle(appMenu, options);

export const billableServicesCardLink = getSyncLifecycle(BillableServicesCardLink, options);

export const billableServicesHome = getSyncLifecycle(BillableServiceHome, options);

export const billablesConfigurationTab = getSyncLifecycle(BillablesConfigurationTabs, options);

export const billableCommodities = getSyncLifecycle(BillableStock, options);

export const billableCommoditiesModal = getSyncLifecycle(AddBillableStock, options);

export const deleteBillableCommoditiesModal = getSyncLifecycle(DeleteBillableCommodity, options);

export const billingCheckInForm = getSyncLifecycle(BillingCheckInForm, options);

export const billingPatientSummary = getSyncLifecycle(BillHistory, options);

export const requirePaymentModal = getSyncLifecycle(RequirePaymentModal, options);

export const root = getSyncLifecycle(RootComponent, options);

export const serviceMetrics = getSyncLifecycle(ServiceMetrics, options);

export const visitAttributeTags = getSyncLifecycle(VisitAttributeTags, options);

export const editBillLineItemDialog = getAsyncLifecycle(() => import('./bill-item-actions/edit-bill-item.component'), {
  featureName: 'edit bill line item',
  moduleName,
});

// t('billingForm', 'Billing form')
export const billingFormWorkspace = getAsyncLifecycle(() => import('./billing-form/billing-form.component'), options);

export const chargeItemsModal = getAsyncLifecycle(
  () => import('./billable-commodities/add-billable-commodity.component'),
  { featureName: 'charge-item-modal', moduleName },
);
