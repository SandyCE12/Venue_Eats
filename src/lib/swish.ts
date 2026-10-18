export interface SwishPaymentResult {
  paymentId: string;
  token: string;
  deepLink: string;
  isSimulated?: boolean;
  error?: string;
}

/**
 * Generates the universal native Swish URL scheme supported by the Swish mobile app on iOS and Android.
 * Format: swish://payment?data={"version":1,"payee":{"value":"..."},"amount":{"value":...},"message":{"value":"..."}}
 */
export function buildNativeSwishDeepLink(
  payeeNumber: string,
  amount: number,
  message: string
): string {
  // Strip spaces, dashes, and extra formatting
  let cleanPayee = (payeeNumber || "123 918 27 36").replace(/[\s\-\+]/g, "");

  const payload = {
    version: 1,
    payee: { value: cleanPayee },
    amount: { value: Math.round(Number(amount || 0) * 100) / 100 },
    message: { value: (message || "VenueEat Beställning").slice(0, 50) }
  };

  return `swish://payment?data=${encodeURIComponent(JSON.stringify(payload))}`;
}

/**
 * Returns a high-res QR code URL that can be scanned by the Swish app on mobile
 */
export function getSwishQrCodeUrl(deepLink: string, size = 220): string {
  return `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&margin=10&data=${encodeURIComponent(deepLink)}`;
}

/**
 * Calls the /api/swish-initiate function or falls back to native direct Swish deep link.
 * Guarantees that mobile Swish app opens with pre-filled payment details.
 */
export async function initiateSwishPayment(
  amount: number,
  orderId: string,
  message: string,
  vendorSwishNumber?: string
): Promise<SwishPaymentResult> {
  const nativeLink = buildNativeSwishDeepLink(vendorSwishNumber || "123 918 27 36", amount, message);

  try {
    const response = await fetch("/api/swish-initiate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount, orderId, message, payeeNumber: vendorSwishNumber }),
    });

    if (response.ok) {
      const data = await response.json();
      if (data && data.paymentId) {
        // If API returned a simulated session, use the native universal deep link so the real Swish app opens
        const finalDeepLink = data.isSimulated ? nativeLink : (data.deepLink || nativeLink);
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
  return `ve_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
}
