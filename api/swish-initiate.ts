import type { VercelRequest, VercelResponse } from "@vercel/node";
import https from "https";

const SWISH_HOST =
  process.env.SWISH_ENVIRONMENT === "production"
    ? "cpc.getswish.net"
    : "mss.cpc.getswish.net";

function createPaymentRequest(
  instructionUUID: string,
  payload: object,
  cert: string,
  key: string
): Promise<{ statusCode: number; headers: Record<string, any>; body: string }> {
  return new Promise((resolve, reject) => {
    const bodyStr = JSON.stringify(payload);
    const options: https.RequestOptions = {
      hostname: SWISH_HOST,
      port: 443,
      path: `/swish-cpcapi/api/v2/paymentrequests/${instructionUUID}`,
      method: "PUT",
      cert,
      key,
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

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { amount, orderId, message } = req.body ?? {};

    if (!amount || !orderId) {
      return res.status(400).json({ error: "amount and orderId are required" });
    }

    const certB64 = process.env.SWISH_CLIENT_CERT_BASE64;
    const keyB64 = process.env.SWISH_CLIENT_KEY_BASE64;
    const merchantNumber = process.env.SWISH_MERCHANT_NUMBER;
    const callbackUrl = process.env.SWISH_CALLBACK_URL;

    if (!certB64 || !keyB64 || !merchantNumber || !callbackUrl) {
      console.error("Missing Swish env variables");
      return res.status(500).json({ error: "Swish not configured on server" });
    }

    const cert = Buffer.from(certB64, "base64").toString("utf-8");
    const key = Buffer.from(keyB64, "base64").toString("utf-8");

    // UUID must be uppercase, no dashes, exactly 32 hex chars
    const instructionUUID = crypto
      .randomUUID()
      .replace(/-/g, "")
      .toUpperCase();

    const swishPayload = {
      payeePaymentReference: orderId,
      callbackUrl,
      payeeAlias: merchantNumber,
      currency: "SEK",
      amount: parseFloat(amount).toFixed(2),
      message: (message || "VenueEat Order").slice(0, 50), // Swish max 50 chars
    };

    const response = await createPaymentRequest(
      instructionUUID,
      swishPayload,
      cert,
      key
    );

    if (response.statusCode === 201) {
      const token = response.headers["paymentrequesttoken"] as string;
      const deepLink = `swish://paymentrequest?token=${token}&callbackurl=${encodeURIComponent(
        "https://venue-eats.vercel.app"
      )}`;

      return res.status(200).json({
        paymentId: instructionUUID,
        token,
        deepLink,
      });
    }

    // Swish returned an error — parse and forward
    let errorDetails = response.body;
    try {
      errorDetails = JSON.parse(response.body);
    } catch {
      // leave as raw string
    }

    console.error("Swish API error:", response.statusCode, errorDetails);
    return res.status(200).json({
      error: "Swish payment initiation failed",
      swishStatus: response.statusCode,
      details: errorDetails,
    });
  } catch (err: any) {
    console.error("swish-initiate exception:", err);
    return res.status(200).json({
      error: "Internal error initiating Swish payment",
      message: err.message,
    });
  }
}
