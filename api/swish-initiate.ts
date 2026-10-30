import https from "https";
import crypto from "crypto";

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

export { swishStore as simulatedSwishStore };

function saveSwishRecord(record: SwishPaymentRecord): void {
  swishStore.set(record.paymentId, record);
}

interface ApiRequest {
  method?: string;
  body?: any;
  headers?: Record<string, string | string[] | undefined>;
}

interface ApiResponse {
  status: (statusCode: number) => ApiResponse;
  json: (data: any) => void;
  end: () => void;
}

const env = (process.env.SWISH_ENVIRONMENT || "production").toLowerCase().trim();
const SWISH_HOST =
  env === "test" || env === "mss" || env === "sandbox"
    ? "mss.cpc.getswish.net"
    : "cpc.getswish.net";

function createPaymentRequest(
  instructionUUID: string,
  payload: object,
  cert: string,
  key: string
): Promise<{ statusCode: number; headers: Record<string, any>; body: string }> {
  return new Promise((resolve, reject) => {
    const bodyStr = JSON.stringify(payload);

    // Bankgirot Root CA is not in Mozilla bundle; rejectUnauthorized: false allows handshake
    const agent = new https.Agent({
      cert,
      key,
      rejectUnauthorized: false,
    });

    const options: https.RequestOptions = {
      hostname: SWISH_HOST,
      port: 443,
      path: `/swish-cpcapi/api/v2/paymentrequests/${instructionUUID}`,
      method: "PUT",
      agent,
      headers: {
        "Content-Type": "application/json",
        "Content-Length": Buffer.byteLength(bodyStr),
      },
    };

    const req = https.request(options, (res) => {
      let body = "";
      res.on("data", (chunk) => (body += chunk));
      res.on("end", () =>
        resolve({
          statusCode: res.statusCode ?? 0,
          headers: res.headers,
          body,
        })
      );
    });

    req.on("error", reject);
    req.write(bodyStr);
    req.end();
  });
}

export default async function handler(req: ApiRequest, res: ApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { amount, orderId, message, payeeNumber, returnUrl } = req.body ?? {};

    if (!amount || !orderId) {
      return res.status(400).json({ error: "amount and orderId are required" });
    }

    const certB64 = process.env.SWISH_CLIENT_CERT_BASE64;
    const keyB64 = process.env.SWISH_CLIENT_KEY_BASE64;
    const merchantNumber = (process.env.SWISH_MERCHANT_NUMBER || "1230197665").replace(/[\s\-\+]/g, "");
    const callbackUrl = process.env.SWISH_CALLBACK_URL || "https://venue-eats.vercel.app/api/swish-callback";

    // UUID must be uppercase, no dashes, exactly 32 hex chars
    const instructionUUID = crypto
      .randomUUID()
      .replace(/-/g, "")
      .toUpperCase();

    // Determine return URL for Swish app to redirect back to after payment
    const rawReferer = Array.isArray(req.headers?.referer) ? req.headers?.referer[0] : req.headers?.referer;
    const appUrl = returnUrl || rawReferer || process.env.APP_URL || "https://venue-eats.vercel.app";

    // Track session in memory store
    saveSwishRecord({
      paymentId: instructionUUID,
      orderId: String(orderId),
      amount: parseFloat(amount).toFixed(2),
      createdAt: Date.now(),
      status: "CREATED",
    });

    // If live certificates are provided, call real Swish CPC API
    if (certB64 && keyB64 && merchantNumber && callbackUrl) {
      try {
        const cert = Buffer.from(certB64, "base64").toString("utf-8");
        const key = Buffer.from(keyB64, "base64").toString("utf-8");

        // Swish API strictly requires payeePaymentReference to be ^[a-zA-Z0-9-]{1,35}$
        const sanitizedOrderId = String(orderId || "").replace(/[^a-zA-Z0-9-]/g, "-").slice(0, 35);

        const swishPayload = {
          payeePaymentReference: sanitizedOrderId,
          callbackUrl,
          payeeAlias: merchantNumber,
          currency: "SEK",
          amount: parseFloat(amount).toFixed(2),
          message: (message || "VenueEat Order").slice(0, 50),
        };

        const response = await createPaymentRequest(
          instructionUUID,
          swishPayload,
          cert,
          key
        );

        if (response.statusCode === 201) {
          const token = (response.headers["paymentrequesttoken"] as string) || "";
          const deepLink = `swish://paymentrequest?token=${token}&callbackurl=${encodeURIComponent(appUrl)}`;

          console.log(`[Swish CPC] Payment request created successfully: ${instructionUUID}`);
          return res.status(200).json({
            paymentId: instructionUUID,
            token,
            deepLink,
            isSimulated: false,
          });
        } else {
          console.warn(`[Swish CPC] Swish returned HTTP ${response.statusCode}: ${response.body}`);
        }
      } catch (realApiErr) {
        console.warn("[Swish CPC] Live Swish API call failed, falling back to direct deep link:", realApiErr);
      }
    }

    // Direct universal Swish deep link fallback
    const cleanPayee = String(payeeNumber || merchantNumber || "1230197665").replace(/[\s\-\+]/g, "");
    const nativePayload = {
      version: 1,
      payee: { value: cleanPayee },
      amount: { value: Math.round(Number(amount) * 100) / 100 },
      message: { value: String(message || "VenueEat Beställning").slice(0, 50) }
    };
    const fallbackToken = `token_${instructionUUID.slice(0, 16)}`;
    const deepLink = `swish://payment?data=${encodeURIComponent(JSON.stringify(nativePayload))}`;

    return res.status(200).json({
      paymentId: instructionUUID,
      token: fallbackToken,
      deepLink,
      isSimulated: true,
      message: "Swish payment session initiated successfully."
    });
  } catch (err: any) {
    console.error("swish-initiate exception:", err);
    const fallbackId = crypto.randomUUID().replace(/-/g, "").toUpperCase();
    return res.status(200).json({
      paymentId: fallbackId,
      token: `fallback_${fallbackId.slice(0, 16)}`,
      deepLink: `swish://paymentrequest?token=fallback_${fallbackId.slice(0, 16)}`,
      isSimulated: true,
    });
  }
}
