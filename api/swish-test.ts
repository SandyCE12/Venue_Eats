import https from "https";
import crypto from "crypto";

interface ApiRequest {
  method?: string;
  query?: Record<string, string | string[] | undefined>;
}

interface ApiResponse {
  status: (statusCode: number) => ApiResponse;
  json: (data: any) => void;
  end: () => void;
}

export default async function handler(req: ApiRequest, res: ApiResponse) {
  const env = (process.env.SWISH_ENVIRONMENT || "production").toLowerCase().trim();
  const certB64 = process.env.SWISH_CLIENT_CERT_BASE64 || "";
  const keyB64 = process.env.SWISH_CLIENT_KEY_BASE64 || "";
  const merchantNumber = (process.env.SWISH_MERCHANT_NUMBER || "").replace(/[\s\-\+]/g, "");
  const callbackUrl = process.env.SWISH_CALLBACK_URL || "https://venue-eats.vercel.app/api/swish-callback";

  const host =
    env === "test" || env === "mss" || env === "sandbox"
      ? "mss.cpc.getswish.net"
      : "cpc.getswish.net";

  const diagnostics: Record<string, any> = {
    environment_configured: env,
    target_host: host,
    has_cert_base64: Boolean(certB64 && certB64.length > 50),
    cert_base64_length: certB64.length,
    has_key_base64: Boolean(keyB64 && keyB64.length > 50),
    key_base64_length: keyB64.length,
    merchant_number: merchantNumber || "MISSING",
    callback_url: callbackUrl,
  };

  if (!certB64 || !keyB64) {
    return res.status(200).json({
      status: "ERROR",
      message: "Certificates are missing in Vercel environment variables.",
      diagnostics,
    });
  }

  let certText = "";
  let keyText = "";
  try {
    certText = Buffer.from(certB64, "base64").toString("utf-8");
    keyText = Buffer.from(keyB64, "base64").toString("utf-8");

    diagnostics.cert_header = certText.substring(0, 35);
    diagnostics.cert_valid_pem = certText.includes("-----BEGIN CERTIFICATE-----");
    diagnostics.key_header = keyText.substring(0, 35);
    diagnostics.key_valid_pem = keyText.includes("-----BEGIN") && keyText.includes("PRIVATE KEY-----");
  } catch (err: any) {
    return res.status(200).json({
      status: "ERROR",
      message: "Failed to decode base64 certificate or key.",
      error: err.message,
      diagnostics,
    });
  }

  const instructionUUID = crypto.randomUUID().replace(/-/g, "").toUpperCase();
  const testPayload = {
    payeePaymentReference: "DIAGTEST" + Date.now().toString().slice(-6),
    callbackUrl,
    payeeAlias: merchantNumber,
    currency: "SEK",
    amount: "1.00",
    message: "Diagnostic Test Payment",
  };

  try {
    const bodyStr = JSON.stringify(testPayload);

    const agent = new https.Agent({
      cert: certText,
      key: keyText,
      rejectUnauthorized: false,
    });

    const result = await new Promise<{
      statusCode: number;
      headers: Record<string, any>;
      body: string;
    }>((resolve, reject) => {
      const options: https.RequestOptions = {
        hostname: host,
        port: 443,
        path: `/swish-cpcapi/api/v2/paymentrequests/${instructionUUID}`,
        method: "PUT",
        agent,
        headers: {
          "Content-Type": "application/json",
          "Content-Length": Buffer.byteLength(bodyStr),
        },
      };

      const request = https.request(options, (response) => {
        let respBody = "";
        response.on("data", (chunk) => (respBody += chunk));
        response.on("end", () => {
          resolve({
            statusCode: response.statusCode ?? 0,
            headers: response.headers,
            body: respBody,
          });
        });
      });

      request.on("error", (err) => reject(err));
      request.write(bodyStr);
      request.end();
    });

    diagnostics.swish_response_status = result.statusCode;
    diagnostics.swish_response_headers = result.headers;
    diagnostics.swish_response_body = result.body;

    if (result.statusCode === 201) {
      return res.status(200).json({
        status: "SUCCESS",
        message: "Swish bank accepted the connection! Enterprise token generated successfully.",
        token: result.headers["paymentrequesttoken"] || null,
        diagnostics,
      });
    } else {
      return res.status(200).json({
        status: "REJECTED_BY_BANK",
        message: `Swish bank responded with HTTP ${result.statusCode}`,
        diagnostics,
      });
    }
  } catch (netErr: any) {
    return res.status(200).json({
      status: "TLS_CONNECTION_FAILED",
      message: "The mTLS handshake to Swish could not be established.",
      error: netErr.message,
      errorCode: netErr.code,
      diagnostics,
    });
  }
}
