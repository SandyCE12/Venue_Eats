import fs from "fs";
import path from "path";
import { initializeApp, getApps, cert, App } from "firebase-admin/app";
import { getMessaging, Message } from "firebase-admin/messaging";

interface ApiRequest {
  method?: string;
  body?: any;
}

interface ApiResponse {
  status: (statusCode: number) => ApiResponse;
  json: (data: any) => void;
  end: () => void;
}

function getFirebaseAdmin(): App | null {
  const existingApps = getApps();
  if (existingApps.length > 0) {
    return existingApps[0]!;
  }

  try {
    let serviceAccount: any = null;

    // 1. Check local serviceAccountKey.json file
    const localKeyPath = path.resolve(process.cwd(), "serviceAccountKey.json");
    if (fs.existsSync(localKeyPath)) {
      const raw = fs.readFileSync(localKeyPath, "utf-8");
      serviceAccount = JSON.parse(raw);
    } 
    // 2. Check base64 environment variable (for Vercel deployment)
    else if (process.env.FIREBASE_SERVICE_ACCOUNT_BASE64) {
      const decoded = Buffer.from(process.env.FIREBASE_SERVICE_ACCOUNT_BASE64, "base64").toString("utf-8");
      serviceAccount = JSON.parse(decoded);
    }
    // 3. Check JSON string environment variable
    else if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
      serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
    }

    if (serviceAccount) {
      return initializeApp({
        credential: cert(serviceAccount),
      });
    }

    console.warn("[FCM Backend] No Firebase service account credentials found.");
    return null;
  } catch (err) {
    console.error("[FCM Backend] Failed to initialize Firebase Admin:", err);
    return null;
  }
}

/**
 * Dispatches a background food ready push notification to the attendee's phone via Firebase Cloud Messaging.
 * Works even when the attendee's browser tab is closed or the phone is locked.
 */
export default async function handler(req: ApiRequest, res: ApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed. Use POST." });
  }

  try {
    const { orderId, fcmToken, queueNumber, vendorName, stallNumber } = req.body ?? {};

    if (!orderId || !queueNumber || !vendorName) {
      return res.status(400).json({ error: "orderId, queueNumber, and vendorName are required" });
    }

    if (!fcmToken) {
      console.log(`[FCM Backend] Order #${queueNumber} has no fcmToken attached. Skipping push notification.`);
      return res.status(200).json({
        skipped: true,
        message: "No FCM token available for this order.",
      });
    }

    const adminApp = getFirebaseAdmin();
    if (!adminApp) {
      return res.status(200).json({
        skipped: true,
        message: "Firebase Admin is not configured. Notification simulated.",
      });
    }

    const title = `🍔 Maten är klar! / Order #${queueNumber} is Ready!`;
    const stallInfo = stallNumber ? ` vid ${stallNumber}` : "";
    const body = `Din beställning #${queueNumber} hos ${vendorName} är klar att hämtas${stallInfo}!`;

    const message: Message = {
      token: fcmToken,
      notification: {
        title,
        body,
      },
      data: {
        orderId: String(orderId),
        queueNumber: String(queueNumber),
        vendorName: String(vendorName),
        url: `/?orderId=${orderId}&alert=ready`,
      },
      webpush: {
        fcmOptions: {
          link: `/?orderId=${orderId}&alert=ready`,
        },
        notification: {
          icon: "/favicon.ico",
          badge: "/favicon.ico",
          vibrate: [300, 150, 300, 150, 300],
          requireInteraction: true,
          tag: `venueeat-order-${orderId}`,
        },
      },
    };

    const messaging = getMessaging(adminApp);
    const response = await messaging.send(message);
    console.log(`[FCM Backend] Push notification sent successfully for Order #${queueNumber}:`, response);

    return res.status(200).json({
      success: true,
      messageId: response,
      orderId,
    });
  } catch (err: any) {
    console.error("[FCM Backend] Error sending FCM notification:", err);
    return res.status(200).json({
      success: false,
      error: err.message || "Failed to dispatch push notification",
    });
  }
}
