// Import scripts for Firebase v10/v11 compat in service worker
importScripts("https://www.gstatic.com/firebasejs/10.13.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.13.0/firebase-messaging-compat.js");

// Initialize Firebase with the project credentials
firebase.initializeApp({
  apiKey: "AIzaSyB-OnsCKvYaqmhZeKf_eKT1CH5yuDcEpt4",
  authDomain: "gen-lang-client-0646101630.firebaseapp.com",
  projectId: "gen-lang-client-0646101630",
  storageBucket: "gen-lang-client-0646101630.firebasestorage.app",
  messagingSenderId: "862771983478",
  appId: "1:862771983478:web:b25c899bbc01ef82a45b57",
});

const messaging = firebase.messaging();

// Handle background push messages when webapp is closed or phone is locked
messaging.onBackgroundMessage((payload) => {
  console.log("[firebase-messaging-sw.js] Received background push message:", payload);

  const notificationTitle = payload.notification?.title || "🍔 Your Food is Ready!";
  const notificationOptions = {
    body: payload.notification?.body || "Your order is ready for pickup!",
    icon: payload.notification?.icon || "/favicon.ico",
    badge: "/favicon.ico",
    vibrate: [300, 150, 300, 150, 300],
    tag: payload.data?.orderId || "venueeat-order-ready",
    renotify: true,
    requireInteraction: true, // Keep notification prominent until customer interacts
    data: {
      url: payload.data?.url || "/",
      orderId: payload.data?.orderId,
    },
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

// Handle notification click to bring user directly back to their order ticket
self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const targetUrl = event.notification.data?.url || "/";

  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then((windowClients) => {
      // Focus existing window if open
      for (const client of windowClients) {
        if (client.url.includes(self.location.origin) && "focus" in client) {
          return client.focus();
        }
      }
      // If no open window, open a new window to the target URL
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );
});
