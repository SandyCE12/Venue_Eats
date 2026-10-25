export interface SwishPaymentRecord {
  paymentId: string;
  orderId: string;
  amount: string;
  status: "CREATED" | "PAID" | "DECLINED" | "CANCELLED" | "ERROR";
  createdAt: number;
  datePaid?: string;
  payerAlias?: string;
}

declare global {
  var __swishPaymentStore: Map<string, SwishPaymentRecord> | undefined;
}

export const swishStore: Map<string, SwishPaymentRecord> =
  globalThis.__swishPaymentStore || (globalThis.__swishPaymentStore = new Map<string, SwishPaymentRecord>());

export async function saveSwishRecord(record: SwishPaymentRecord): Promise<void> {
  swishStore.set(record.paymentId, record);
}

export async function getSwishRecord(paymentId: string): Promise<SwishPaymentRecord | null> {
  return swishStore.get(paymentId) || null;
}
