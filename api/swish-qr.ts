import https from "https";

interface ApiRequest {
  method?: string;
  query?: Record<string, string | string[] | undefined>;
}

interface ApiResponse {
  status: (statusCode: number) => ApiResponse;
  setHeader: (name: string, value: string) => void;
  send: (body: any) => void;
  json: (data: any) => void;
  end: () => void;
}

/**
 * Official Swish Prefilled QR Code Generator
 * Requests authentic Swish QR code with embedded logo from Getswish API (mpc.getswish.net).
 * Recognized directly by the Swish mobile app camera.
 */
export default async function handler(req: ApiRequest, res: ApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const rawPayee = String(req.query?.payee || "1230197665");
  const cleanPayee = rawPayee.replace(/[\s\-\+]/g, "");
  const amountNum = parseFloat(String(req.query?.amount || "0"));
  const cleanAmount = isNaN(amountNum) ? 0 : Math.round(amountNum * 100) / 100;
  const rawMessage = String(req.query?.message || "VenueEat Beställning");
  const cleanMessage = rawMessage.slice(0, 50);

  const payload = JSON.stringify({
    format: "png",
    payee: { value: cleanPayee, editable: false },
    amount: { value: cleanAmount, editable: false },
    message: { value: cleanMessage, editable: false },
    size: 300,
    border: 1,
  });

  try {
    const pngBuffer = await new Promise<Buffer>((resolve, reject) => {
      const swishReq = https.request(
        "https://mpc.getswish.net/qrg-swish/api/v1/prefilled",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Content-Length": Buffer.byteLength(payload),
          },
          timeout: 4000,
        },
        (swishRes) => {
          if (swishRes.statusCode !== 200) {
            return reject(new Error(`Swish QR API returned status ${swishRes.statusCode}`));
          }
          const chunks: Buffer[] = [];
          swishRes.on("data", (chunk) => chunks.push(Buffer.from(chunk)));
          swishRes.on("end", () => resolve(Buffer.concat(chunks)));
        }
      );

      swishReq.on("error", reject);
      swishReq.on("timeout", () => {
        swishReq.destroy();
        reject(new Error("Swish QR API timeout"));
      });
      swishReq.write(payload);
      swishReq.end();
    });

    res.setHeader("Content-Type", "image/png");
    res.setHeader("Cache-Control", "public, max-age=3600, s-maxage=3600");
    return res.status(200).send(pngBuffer);
  } catch (err) {
    console.warn("Official Getswish QR API failed, falling back to Swish QR format image:", err);

    // Fallback: Swish standard QR format payload: C<payee>;<amount>;<message>;0
    const swishQrString = `C${cleanPayee};${cleanAmount.toFixed(2)};${encodeURIComponent(cleanMessage)};0`;
    const fallbackUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&margin=10&data=${encodeURIComponent(swishQrString)}`;

    res.setHeader("Location", fallbackUrl);
    return res.status(302).end();
  }
}
