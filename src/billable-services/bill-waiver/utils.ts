import { type OpenmrsResource } from '@openmrs/esm-framework';
import type { BillableService, LineItem, MappedBill } from '../../types';

export const createBillWaiverPayload = (
  bill: MappedBill,
  amountWaived: number,
  totalAmount: number,
  lineItems: Array<LineItem>,
  billableLineItems: Array<BillableService>,
) => {
  const { cashier } = bill;
  const waiverUuid = findBillableServiceWaiverUuid(billableLineItems);

  const billPayment = {
    amount: parseFloat(totalAmount.toFixed(2)),
    amountTendered: parseFloat(Number(amountWaived).toFixed(2)),
    attributes: [],
    instanceType: waiverUuid,
  };

  const processedLineItems = lineItems.map((lineItem) => ({
    ...lineItem,
    billableService: findBillableServiceUuid(billableLineItems, lineItem),
    paymentStatus: 'PENDING',
  }));

  const processedPayment = {
    cashPoint: bill.cashPointUuid,
    cashier: cashier.uuid,
    lineItems: processedLineItems,
    payments: [...bill.payments, billPayment],
    patient: bill.patientUuid,
  };

  return processedPayment;
};

const findBillableServiceUuid = (billableService: Array<OpenmrsResource>, lineItems: LineItem) => {
  return billableService.find((service) => service.name === lineItems.billableService)?.uuid ?? null;
};

export const findBillableServiceWaiverUuid = (billableServices: Array<BillableService>): string | null => {
  for (const service of billableServices) {
    if (service.servicePrices?.length) {
      const firstPrice = service.servicePrices[0];
      if (firstPrice?.paymentMode?.uuid) {
        return firstPrice.paymentMode.uuid;
      }
    }
  }
  return null;
};
