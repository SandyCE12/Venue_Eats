import type { VercelRequest, VercelResponse } from "@vercel/node";
import https from "https";

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
    const options: https.RequestOptions = {
      hostname: SWISH_HOST,
      port: 443,
      path: `/swish-cpcapi/api/v2/paymentrequests/${paymentId}`,
      method: "GET",
      cert,
      key,
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

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { paymentId } = req.query;

    if (!paymentId || typeof paymentId !== "string") {
      return res.status(400).json({ error: "paymentId query param required" });
    }

    const certB64 = process.env.SWISH_CLIENT_CERT_BASE64;
    const keyB64 = process.env.SWISH_CLIENT_KEY_BASE64;

    if (!certB64 || !keyB64) {
      return res.status(500).json({ error: "Swish not configured" });
    }

    const cert = Buffer.from(certB64, "base64").toString("utf-8");
    const key = Buffer.from(keyB64, "base64").toString("utf-8");

    const response = await getPaymentStatus(paymentId, cert, key);

    if (response.statusCode === 200) {
      const data = JSON.parse(response.body);
      // Normalize status: CREATED | PAID | DECLINED | ERROR | CANCELLED
      return res.status(200).json({
        status: data.status,
        amount: data.amount,
        orderId: data.payeePaymentReference,
        datePaid: data.datePaid ?? null,
      });
    }

    return res.status(200).json({ status: "ERROR", raw: response.statusCode });
  } catch (err: any) {
    console.error("swish-status exception:", err);
    return res.status(200).json({ status: "ERROR", message: err.message });
  }
}
