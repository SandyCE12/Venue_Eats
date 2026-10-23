import https from "https";
import { swishStore, getSwishRecord, saveSwishRecord } from "./_swishStore";

interface ApiRequest {
  method?: string;
  query?: Record<string, string | string[] | undefined>;
  body?: any;
}

interface ApiResponse {
  status: (statusCode: number) => ApiResponse;
  json: (data: any) => void;
  end: () => void;
}

const SWISH_HOST =
  process.env.SWISH_ENVIRONMENT === "production"
    ? "cpc.getswish.net"
    : "mss.cpc.getswish.net";

function getPaymentStatus(
  paymentId: string,
  cert: string,
  key: string
): Promise<{ statusCode: number; body: string }> {
  return new Promise((resolve, reject) => {
    // Bankgirot Root CA requires rejectUnauthorized: false in Node
    const agent = new https.Agent({
      cert,
      key,
      rejectUnauthorized: false,
    });

    const options: https.RequestOptions = {
      hostname: SWISH_HOST,
      port: 443,
      // NOTE: Swish CPC API uses /api/v1/ for GET payment status queries (/api/v2/ is PUT only)
      path: `/swish-cpcapi/api/v1/paymentrequests/${paymentId}`,
      method: "GET",
      agent,
      headers: {
        Accept: "application/json",
      },
    };

    const req = https.request(options, (res) => {
      let body = "";
      res.on("data", (chunk) => (body += chunk));
      res.on("end", () =>
        resolve({ statusCode: res.statusCode ?? 0, body })
      );
    });

    req.on("error", reject);
    req.end();
  });
}

export default async function handler(req: ApiRequest, res: ApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed. Use GET to check payment status." });
  }

  try {
    const { paymentId } = req.query ?? {};

    if (!paymentId || typeof paymentId !== "string") {
      return res.status(400).json({ error: "paymentId query param required" });
    }

    // 1. Check shared store and Firestore for already confirmed payment
    const cachedSession = await getSwishRecord(paymentId);
    if (cachedSession && cachedSession.status === "PAID") {
      return res.status(200).json({
        status: "PAID",
        amount: cachedSession.amount,
        orderId: cachedSession.orderId,
        datePaid: cachedSession.datePaid || new Date().toISOString(),
      });
    }

    const certB64 = process.env.SWISH_CLIENT_CERT_BASE64;
    const keyB64 = process.env.SWISH_CLIENT_KEY_BASE64;

    // 2. Query real Swish CPC API if certificates are configured
    if (certB64 && keyB64) {
      try {
        const cert = Buffer.from(certB64, "base64").toString("utf-8");
        const key = Buffer.from(keyB64, "base64").toString("utf-8");

        const response = await getPaymentStatus(paymentId, cert, key);

        if (response.statusCode === 200) {
          const data = JSON.parse(response.body);
          // Swish CPC statuses: CREATED | PAID | DECLINED | ERROR | CANCELLED
          const status = data.status || "CREATED";

          const updatedRecord = {
            paymentId,
            orderId: data.payeePaymentReference || cachedSession?.orderId || paymentId,
            amount: String(data.amount || cachedSession?.amount || "0"),
            status,
            createdAt: cachedSession?.createdAt || Date.now(),
            datePaid: data.datePaid || (status === "PAID" ? new Date().toISOString() : undefined),
            payerAlias: data.payerAlias || cachedSession?.payerAlias,
          };

          await saveSwishRecord(updatedRecord as any);

          console.log(`[Swish Status] Live CPC query for ${paymentId}: ${status}`);

          return res.status(200).json({
            status,
            amount: String(data.amount || "0"),
            orderId: data.payeePaymentReference || paymentId,
            datePaid: data.datePaid ?? null,
          });
        } else {
          console.log(`[Swish Status] Live CPC query returned HTTP ${response.statusCode}: ${response.body}`);
        }
      } catch (cpcErr) {
        console.warn("[Swish Status] Live CPC query error:", cpcErr);
      }
    }

    // 3. Fallback to session store status or default CREATED
    const currentSession = (await getSwishRecord(paymentId)) || swishStore.get(paymentId);
    return res.status(200).json({
      status: currentSession?.status || "CREATED",
      amount: currentSession?.amount || "0.00",
      orderId: currentSession?.orderId || paymentId,
    });
  } catch (err: any) {
    console.error("swish-status exception:", err);
    return res.status(200).json({ status: "CREATED", error: err.message });
  }
}
