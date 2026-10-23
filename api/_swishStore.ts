import { getFirebaseAdminDb } from "./_firebaseAdmin";

export interface SwishPaymentRecord {
  paymentId: string;
  orderId: string;
  amount: string;
  status: "CREATED" | "PAID" | "DECLINED" | "CANCELLED" | "ERROR";
  createdAt: number;
  datePaid?: string;
  payerAlias?: string;
}

declare global {
  var __swishPaymentStore: Map<string, SwishPaymentRecord> | undefined;
}

export const swishStore: Map<string, SwishPaymentRecord> =
  globalThis.__swishPaymentStore || (globalThis.__swishPaymentStore = new Map<string, SwishPaymentRecord>());

export async function saveSwishRecord(record: SwishPaymentRecord): Promise<void> {
  swishStore.set(record.paymentId, record);
  try {
    const db = getFirebaseAdminDb();
    if (db) {
      await db.collection("swish_sessions").doc(record.paymentId).set(record, { merge: true });
    }
  } catch (err) {
    console.warn("[SwishStore] Firestore save error:", err);
  }
}

export async function getSwishRecord(paymentId: string): Promise<SwishPaymentRecord | null> {
  if (swishStore.has(paymentId)) {
    const rec = swishStore.get(paymentId)!;
    if (rec.status === "PAID") return rec;
  }
  try {
    const db = getFirebaseAdminDb();
    if (db) {
      const snap = await db.collection("swish_sessions").doc(paymentId).get();
      if (snap.exists) {
        const data = snap.data() as SwishPaymentRecord;
        swishStore.set(paymentId, data);
        return data;
      }
    }
  } catch (err) {
    console.warn("[SwishStore] Firestore get error:", err);
  }
  return swishStore.get(paymentId) || null;
}
