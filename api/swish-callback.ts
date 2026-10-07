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
 * We log the event — the frontend detects the result by polling /api/swish-status.
 */
export default function handler(req: ApiRequest, res: ApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).end();
  }

  try {
    const { id, payeePaymentReference, status, amount } = req.body ?? {};
    console.log(
      `[Swish Callback] paymentId=${id} orderId=${payeePaymentReference} status=${status} amount=${amount}`
    );
  } catch (err) {
    console.error("[Swish Callback] parse error:", err);
  }

  // Must always return 200 — Swish retries if it gets anything else
  return res.status(200).end();
}
