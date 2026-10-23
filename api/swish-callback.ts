import { swishStore, saveSwishRecord } from "./_swishStore";

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
 * We store the status in Firestore + swishStore so any serverless instance polling /api/swish-status detects it immediately.
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
      const record = {
        paymentId: id,
        orderId: payeePaymentReference || existing?.orderId || id,
        amount: String(amount || existing?.amount || "0"),
        status: (status || "PAID") as any,
        createdAt: existing?.createdAt || Date.now(),
        datePaid: datePaid || new Date().toISOString(),
        payerAlias,
      };

      await saveSwishRecord(record);
      console.log(`[Swish Callback] Persisted paymentId=${id} with status=${status || "PAID"}`);
    }
  } catch (err) {
    console.error("[Swish Callback] parse error:", err);
  }

  // Must always return 200 — Swish retries if it gets anything else
  return res.status(200).end();
}
