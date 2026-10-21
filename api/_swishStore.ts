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
  // Global declaration so instances share memory when possible
  var __swishPaymentStore: Map<string, SwishPaymentRecord> | undefined;
}

export const swishStore: Map<string, SwishPaymentRecord> =
  globalThis.__swishPaymentStore || (globalThis.__swishPaymentStore = new Map<string, SwishPaymentRecord>());
