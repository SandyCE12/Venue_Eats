export interface SwishPaymentResult {
  paymentId: string;
  token: string;
  deepLink: string;
  error?: string;
}

/**
 * Calls the Vercel /api/swish-initiate function to create a real Swish payment request.
 * Returns the deep link to open the Swish app and the paymentId to poll for status.
 */
export async function initiateSwishPayment(
  amount: number,
  orderId: string,
  message: string
): Promise<SwishPaymentResult> {
  const response = await fetch("/api/swish-initiate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ amount, orderId, message }),
  });

  const data = await response.json();

  if (data.error) {
    throw new Error(data.error);
  }

  return data as SwishPaymentResult;
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
  const response = await fetch(`/api/swish-status?paymentId=${paymentId}`);
  if (!response.ok) throw new Error("Status check failed");
  return response.json();
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
