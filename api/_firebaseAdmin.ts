import fs from "fs";
import path from "path";
import { initializeApp, getApps, cert, App } from "firebase-admin/app";
import { getFirestore, Firestore } from "firebase-admin/firestore";

let cachedApp: App | null = null;
let cachedDb: Firestore | null = null;

export function getFirebaseAdminDb(): Firestore | null {
  if (cachedDb) return cachedDb;

  const existingApps = getApps();
  if (existingApps.length > 0) {
    cachedApp = existingApps[0]!;
    cachedDb = getFirestore(cachedApp);
    return cachedDb;
  }

  try {
    let serviceAccount: any = null;

    const localKeyPath = path.resolve(process.cwd(), "serviceAccountKey.json");
    if (fs.existsSync(localKeyPath)) {
      const raw = fs.readFileSync(localKeyPath, "utf-8");
      serviceAccount = JSON.parse(raw);
    } else if (process.env.FIREBASE_SERVICE_ACCOUNT_BASE64) {
      const decoded = Buffer.from(process.env.FIREBASE_SERVICE_ACCOUNT_BASE64, "base64").toString("utf-8");
      serviceAccount = JSON.parse(decoded);
    } else if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
      serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
    }

    if (serviceAccount) {
      cachedApp = initializeApp({
        credential: cert(serviceAccount),
      });
      cachedDb = getFirestore(cachedApp);
      return cachedDb;
    }

    return null;
  } catch (err) {
    console.error("[Firebase Admin] Init failed:", err);
    return null;
  }
}
