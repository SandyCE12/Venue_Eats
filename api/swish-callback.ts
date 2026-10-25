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

const swishStore: Map<string, SwishPaymentRecord> =
  globalThis.__swishPaymentStore || (globalThis.__swishPaymentStore = new Map<string, SwishPaymentRecord>());

function saveSwishRecord(record: SwishPaymentRecord): void {
  swishStore.set(record.paymentId, record);
}

interface ApiRequest {
  method?: string;
  body?: any;
}

interface ApiResponse {
  status: (statusCode: number) => ApiResponse;
  end: () => void;
}

/**
 * Swish Handel server-to-server callback.
 * Swish calls this URL after a payment is PAID, DECLINED, or CANCELLED.
 */
export default async function handler(req: ApiRequest, res: ApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).end();
  }

  try {
    const { id, payeePaymentReference, status, amount, datePaid, payerAlias } = req.body ?? {};
    console.log(
      `[Swish Callback Received] id=${id} orderId=${payeePaymentReference} status=${status} amount=${amount}`
    );

    if (id) {
      const existing = swishStore.get(id);
      const record: SwishPaymentRecord = {
        paymentId: id,
        orderId: payeePaymentReference || existing?.orderId || id,
        amount: String(amount || existing?.amount || "0"),
        status: (status || "PAID") as any,
        createdAt: existing?.createdAt || Date.now(),
        datePaid: datePaid || new Date().toISOString(),
        payerAlias,
      };

      saveSwishRecord(record);
      console.log(`[Swish Callback] Persisted paymentId=${id} with status=${status || "PAID"}`);
    }
  } catch (err) {
    console.error("[Swish Callback] parse error:", err);
  }

  // Must always return 200 — Swish retries if it gets anything else
  return res.status(200).end();
}
