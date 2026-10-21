import { getMessaging, getToken, onMessage, Messaging } from "firebase/messaging";
import { app } from "./firebase";

export const FCM_VAPID_PUBLIC_KEY =
  "BJfaOnsDR9JJrFiGybHBEFMPZEkEqm179cTdRkPL1AptMaxRD8slpzlAnXAtGU0-PfU7hnkXZVXnZgXH-5bX1HA";

let messagingInstance: Messaging | null = null;

function getMessagingClient(): Messaging | null {
  if (typeof window === "undefined") return null;
  if (!isPushNotificationSupported()) return null;

  if (!messagingInstance) {
    try {
      messagingInstance = getMessaging(app);
    } catch (err) {
      console.warn("FCM getMessaging initialization note:", err);
      return null;
    }
  }
  return messagingInstance;
}

/**
 * Checks if the user's browser / OS supports Web Push notifications
 */
export function isPushNotificationSupported(): boolean {
  if (typeof window === "undefined") return false;
  return (
    "Notification" in window &&
    "serviceWorker" in navigator &&
    "PushManager" in window
  );
}

/**
 * Gets current notification permission status: 'granted' | 'denied' | 'default' | 'unsupported'
 */
export function getNotificationPermissionState(): NotificationPermission | "unsupported" {
  if (!isPushNotificationSupported()) return "unsupported";
  return Notification.permission;
}

/**
 * Requests browser permission and generates an FCM device token using the VAPID key.
 * Can be called when the attendee clicks "Enable food ready alerts" or automatically upon checkout.
 */
export async function requestNotificationPermissionAndToken(): Promise<{
  token: string | null;
  status: NotificationPermission | "unsupported" | "error";
  error?: string;
}> {
  if (!isPushNotificationSupported()) {
    return { token: null, status: "unsupported" };
  }

  try {
    const permission = await Notification.requestPermission();
    if (permission !== "granted") {
      return { token: null, status: permission };
    }

    // Register our Firebase messaging service worker
    const registration = await navigator.serviceWorker.register(
      "/firebase-messaging-sw.js",
      { scope: "/" }
    );
    await navigator.serviceWorker.ready;

    const messaging = getMessagingClient();
    if (!messaging) {
      return { token: null, status: "error", error: "FCM client unavailable" };
    }

    const token = await getToken(messaging, {
      vapidKey: FCM_VAPID_PUBLIC_KEY,
      serviceWorkerRegistration: registration,
    });

    if (token) {
      try {
        localStorage.setItem("venueeat_fcm_token", token);
      } catch {}
      return { token, status: "granted" };
    }

    return { token: null, status: "error", error: "No token returned by FCM" };
  } catch (err: any) {
    console.warn("FCM token retrieval error:", err);
    return { token: null, status: "error", error: err.message || "Failed to retrieve FCM token" };
  }
}

/**
 * Listens for FCM push messages while the attendee has the webapp open in the foreground.
 */
export function listenForForegroundPushMessages(
  callback: (payload: { title?: string; body?: string; data?: Record<string, string> }) => void
): () => void {
  const messaging = getMessagingClient();
  if (!messaging) return () => {};

  return onMessage(messaging, (payload) => {
    callback({
      title: payload.notification?.title,
      body: payload.notification?.body,
      data: payload.data as Record<string, string> | undefined,
    });
  });
}
