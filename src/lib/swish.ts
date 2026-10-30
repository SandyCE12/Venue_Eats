export interface SwishPaymentResult {
  paymentId: string;
  token: string;
  deepLink: string;
  isSimulated?: boolean;
  error?: string;
}

/**
 * Universal Swish Recipient:
 * Central verified Swish account for all platform payments.
 * Reads from VITE_UNIVERSAL_SWISH_NUMBER in .env if provided, or defaults to 1230197665.
 */
export const UNIVERSAL_SWISH_NUMBER: string =
  (typeof import.meta !== "undefined" && (import.meta as any).env?.VITE_UNIVERSAL_SWISH_NUMBER) ||
  "1230197665";

/**
 * Generates the universal native Swish URL scheme supported by the Swish mobile app on iOS and Android.
 * Format: swish://payment?data={"version":1,"payee":{"value":"..."},"amount":{"value":...},"message":{"value":"..."}}
 */
export function buildNativeSwishDeepLink(
  payeeNumber: string = UNIVERSAL_SWISH_NUMBER,
  amount: number,
  message: string
): string {
  // Strip spaces, dashes, and extra formatting
  let cleanPayee = (payeeNumber || UNIVERSAL_SWISH_NUMBER).replace(/[\s\-\+]/g, "");

  const payload = {
    version: 1,
    payee: { value: cleanPayee },
    amount: { value: Math.round(Number(amount || 0) * 100) / 100 },
    message: { value: (message || "VenueEat Beställning").slice(0, 50) }
  };

  return `swish://payment?data=${encodeURIComponent(JSON.stringify(payload))}`;
}

/**
 * Returns the official Getswish QR code URL recognized directly by the Swish mobile app camera.
 * Can be called with either (payee, amount, message) or (deepLink).
 */
export function getSwishQrCodeUrl(
  payeeOrDeepLink: string,
  amount?: number,
  message?: string
): string {
  if (typeof amount === "number") {
    const cleanPayee = (payeeOrDeepLink || UNIVERSAL_SWISH_NUMBER).replace(/[\s\-\+]/g, "");
    const formattedAmount = (Math.round(amount * 100) / 100).toFixed(2);
    const cleanMessage = encodeURIComponent((message || "VenueEat Beställning").slice(0, 50));
    return `/api/swish-qr?payee=${cleanPayee}&amount=${formattedAmount}&message=${cleanMessage}`;
  }

  // Parse deep link if provided
  try {
    if (payeeOrDeepLink.includes("data=")) {
      const dataStr = decodeURIComponent(payeeOrDeepLink.split("data=")[1]);
      const data = JSON.parse(dataStr);
      const payee = (data?.payee?.value || UNIVERSAL_SWISH_NUMBER).replace(/[\s\-\+]/g, "");
      const amt = Number(data?.amount?.value || 0).toFixed(2);
      const msg = encodeURIComponent(String(data?.message?.value || "VenueEat Beställning").slice(0, 50));
      return `/api/swish-qr?payee=${payee}&amount=${amt}&message=${msg}`;
    }
  } catch {
    // fallback
  }

  const cleanPayee = (payeeOrDeepLink || UNIVERSAL_SWISH_NUMBER).replace(/[\s\-\+]/g, "");
  return `/api/swish-qr?payee=${cleanPayee}&amount=0.00&message=VenueEat`;
}

/**
 * Calls the /api/swish-initiate function or falls back to native direct Swish deep link.
 * Guarantees that mobile Swish app opens with pre-filled payment details and auto-redirect return URL.
 */
export async function initiateSwishPayment(
  amount: number,
  orderId: string,
  message: string,
  vendorSwishNumber?: string
): Promise<SwishPaymentResult> {
  const targetPayee = vendorSwishNumber || UNIVERSAL_SWISH_NUMBER;
  const nativeLink = buildNativeSwishDeepLink(targetPayee, amount, message);
  const currentUrl = typeof window !== "undefined" ? window.location.href : "https://venue-eats.vercel.app";

  try {
    const response = await fetch("/api/swish-initiate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        amount,
        orderId,
        message,
        payeeNumber: vendorSwishNumber,
        returnUrl: currentUrl,
      }),
    });

    if (response.ok) {
      const data = await response.json();
      if (data && data.paymentId) {
        const finalDeepLink = data.deepLink || nativeLink;
        return {
          ...data,
          deepLink: finalDeepLink,
        };
      }
    }
  } catch (err) {
    console.warn("Swish initiate API error, falling back to native link:", err);
  }

  // Resilient fallback: Always guarantees a functional payment deep link
  const fallbackId = `swish_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  return {
    paymentId: fallbackId,
    token: `token_${fallbackId}`,
    deepLink: nativeLink,
    isSimulated: true,
  };
}

/**
 * Polls /api/swish-status for payment result.
 * Returns: "CREATED" | "PAID" | "DECLINED" | "CANCELLED" | "ERROR"
 */
export async function checkSwishPaymentStatus(paymentId: string): Promise<{
  status: string;
  orderId?: string;
  amount?: string;
}> {
  try {
    const response = await fetch(`/api/swish-status?paymentId=${paymentId}`);
    if (response.ok) {
      const data = await response.json();
      if (data && data.status) {
        return data;
      }
    }
  } catch (err) {
    console.warn("Swish status check error:", err);
  }

  return { status: "CREATED", amount: "0.00" };
}


/**
 * Opens the Swish deep link.
 * On mobile: switches to the Swish app.
 * On desktop: link won't open (Swish is mobile only) — caller handles this case.
 */
export function openSwishApp(deepLink: string): void {
  window.location.href = deepLink;
}

/**
 * Detects whether the user is on a mobile device (iPhone / Android).
 * Swish deep links only work on mobile.
 */
export function isMobileDevice(): boolean {
  return /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
}

/**
 * Generates a temporary order ID for the payment request.
 * Must be unique per payment attempt — we use timestamp + random.
 */
export function generateOrderRef(): string {
  // Swish API (Bankgirot) strictly requires payeePaymentReference to be 1-35 characters
  // matching regex ^[a-zA-Z0-9-]{1,35}$ (underscores "_" are prohibited).
  const timestamp = Date.now().toString();
  const rand = Math.random().toString(36).substring(2, 7);
  return `ve-${timestamp}-${rand}`.slice(0, 35);
}
