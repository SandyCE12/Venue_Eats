# Firestore Security Specification - VenueEat

This document defines the security boundaries, data invariants, and verification strategies for the VenueEat food queue simulator database.

## 1. Data Invariants
1. **Sandbox Isolation**: All data is segmented under `/users/{userId}` paths. A user can only access their own sandbox (`userId == request.auth.uid`). No cross-tenant reads or writes are permitted.
2. **Strict Identity**: Document writes must ensure `request.auth.uid` is verified and matches the path's sandbox `userId`.
3. **Data Integrity**:
   - **Vendor**: Must have an `id`, `name` (max 100 chars), `cuisine` (max 100 chars), `logo` (max 10 chars), `rating` (0 to 5), and a list of `menu` items.
   - **Order**: Must have a `status` within `["Placed", "Preparing", "Ready", "Completed"]`, positive `totalAmount`, positive `queueNumber`, and valid metadata.
4. **State Transitions**: Once an order status is set, it can only progress in the chronological sequence: `Placed` -> `Preparing` -> `Ready` -> `Completed`. Retrogression or invalid statuses are strictly rejected.

---

## 2. The "Dirty Dozen" Malicious Payloads

The following 12 payloads attempt to bypass identity, integrity, or state boundaries and must be blocked with `PERMISSION_DENIED`.

### Payload 1: Unauthenticated Read (Identity)
- **Path**: `/users/user123/vendors/v1`
- **Auth State**: Unauthenticated
- **Operation**: `get`
- **Expected Outcome**: Rejected

### Payload 2: Unauthenticated Write (Identity)
- **Path**: `/users/user123/orders/order99`
- **Auth State**: Unauthenticated
- **Operation**: `create`
- **Expected Outcome**: Rejected

### Payload 3: Tenant Cross-Talk / Sandbox Bypass (Identity)
- **Path**: `/users/victim_uid/vendors/v1`
- **Auth State**: Authenticated as `attacker_uid`
- **Operation**: `get`
- **Expected Outcome**: Rejected

### Payload 4: Identity Spoofing Write (Identity)
- **Path**: `/users/victim_uid/orders/order99`
- **Auth State**: Authenticated as `attacker_uid`
- **Operation**: `create`
- **Expected Outcome**: Rejected

### Payload 5: Vendor Shadow Key Injection (Integrity)
- **Path**: `/users/user123/vendors/v1`
- **Auth State**: Authenticated as `user123`
- **Operation**: `create`
- **Payload**:
  ```json
  {
    "id": "v1",
    "name": "Burger Joint",
    "cuisine": "American",
    "logo": "🍔",
    "rating": 5,
    "menu": [],
    "adminBypass": true
  }
  ```
- **Reason for Rejection**: Extraneous/shadow field `adminBypass` is present.

### Payload 6: Vendor Rating Out-Of-Bounds (Integrity)
- **Path**: `/users/user123/vendors/v1`
- **Auth State**: Authenticated as `user123`
- **Operation**: `create`
- **Payload**:
  ```json
  {
    "id": "v1",
    "name": "Burger Joint",
    "cuisine": "American",
    "logo": "🍔",
    "rating": 99.9,
    "menu": []
  }
  ```
- **Reason for Rejection**: `rating` exceeds maximum of 5.

### Payload 7: Vendor Contact Overlength (Integrity)
- **Path**: `/users/user123/vendors/v1`
- **Auth State**: Authenticated as `user123`
- **Operation**: `create`
- **Payload**:
  ```json
  {
    "id": "v1",
    "name": "Burger Joint",
    "cuisine": "American",
    "logo": "🍔",
    "rating": 4.5,
    "menu": [],
    "email": "very_long_spammed_email_address_designed_to_bloat_the_database_and_cause_denial_of_wallet_exhaustion_attacks@attacker.com"
  }
  ```
- **Reason for Rejection**: `email` exceeds 100 character length limit.

### Payload 8: Order Missing Mandated Vendor ID (Integrity)
- **Path**: `/users/user123/orders/order99`
- **Auth State**: Authenticated as `user123`
- **Operation**: `create`
- **Payload**:
  ```json
  {
    "id": "order99",
    "vendorName": "Burger Joint",
    "items": [],
    "status": "Placed",
    "timestamp": "2026-07-14T10:00:00Z",
    "paymentMethod": "Swish",
    "totalAmount": 150,
    "queueNumber": 10,
    "customerName": "Kalle",
    "estimatedPrepTime": 5
  }
  ```
- **Reason for Rejection**: Missing required field `vendorId`.

### Payload 9: Order Negative Value Poisoning (Integrity)
- **Path**: `/users/user123/orders/order99`
- **Auth State**: Authenticated as `user123`
- **Operation**: `create`
- **Payload**:
  ```json
  {
    "id": "order99",
    "vendorId": "v1",
    "vendorName": "Burger Joint",
    "items": [],
    "status": "Placed",
    "timestamp": "2026-07-14T10:00:00Z",
    "paymentMethod": "Swish",
    "totalAmount": -500.0,
    "queueNumber": 10,
    "customerName": "Kalle",
    "estimatedPrepTime": 5
  }
  ```
- **Reason for Rejection**: `totalAmount` is negative.

### Payload 10: Order Malformed Queue Number (Integrity)
- **Path**: `/users/user123/orders/order99`
- **Auth State**: Authenticated as `user123`
- **Operation**: `create`
- **Payload**:
  ```json
  {
    "id": "order99",
    "vendorId": "v1",
    "vendorName": "Burger Joint",
    "items": [],
    "status": "Placed",
    "timestamp": "2026-07-14T10:00:00Z",
    "paymentMethod": "Swish",
    "totalAmount": 150,
    "queueNumber": -1,
    "customerName": "Kalle",
    "estimatedPrepTime": 5
  }
  ```
- **Reason for Rejection**: `queueNumber` must be a positive integer.

### Payload 11: Order Malformed Status Value (Integrity)
- **Path**: `/users/user123/orders/order99`
- **Auth State**: Authenticated as `user123`
- **Operation**: `create`
- **Payload**:
  ```json
  {
    "id": "order99",
    "vendorId": "v1",
    "vendorName": "Burger Joint",
    "items": [],
    "status": "SPOOFED_STATUS",
    "timestamp": "2026-07-14T10:00:00Z",
    "paymentMethod": "Swish",
    "totalAmount": 150,
    "queueNumber": 10,
    "customerName": "Kalle",
    "estimatedPrepTime": 5
  }
  ```
- **Reason for Rejection**: `status` is not in allowed status enum.

### Payload 12: Order Backwards Status Transition (State)
- **Path**: `/users/user123/orders/order99`
- **Auth State**: Authenticated as `user123`
- **Existing Document**: `status: "Ready"`
- **Operation**: `update`
- **Payload**:
  ```json
  {
    "status": "Placed"
  }
  ```
- **Reason for Rejection**: Backwards transition from "Ready" to "Placed" is forbidden.

---

## 3. Test Runner Simulation (`firestore.rules.test.ts`)

```typescript
import { 
  initializeTestEnvironment, 
  RulesTestEnvironment 
} from "@firebase/rules-unit-testing";
import { 
  setDoc, 
  getDoc, 
  updateDoc 
} from "firebase/firestore";

let testEnv: RulesTestEnvironment;

beforeAll(async () => {
  testEnv = await initializeTestEnvironment({
    projectId: "venueeat-test-project",
    firestore: {
      host: "localhost",
      port: 8080,
    }
  });
});

afterAll(async () => {
  await testEnv.cleanup();
});

describe("VenueEat Security Rules Assertions", () => {
  beforeEach(async () => {
    await testEnv.clearFirestore();
  });

  it("blocks unauthenticated reads and writes (Payload 1 & 2)", async () => {
    const unauthedDb = testEnv.unauthenticatedContext().firestore();
    const vendorRef = doc(unauthedDb, "users/user123/vendors/v1");
    await expect(getDoc(vendorRef)).rejects.toThrow();

    const orderRef = doc(unauthedDb, "users/user123/orders/order99");
    await expect(setDoc(orderRef, { id: "order99" })).rejects.toThrow();
  });

  it("blocks tenant cross-talk (Payload 3 & 4)", async () => {
    const attackerDb = testEnv.authenticatedContext("attacker_uid").firestore();
    const victimVendorRef = doc(attackerDb, "users/victim_uid/vendors/v1");
    await expect(getDoc(victimVendorRef)).rejects.toThrow();

    const victimOrderRef = doc(attackerDb, "users/victim_uid/orders/order99");
    await expect(setDoc(victimOrderRef, { id: "order99" })).rejects.toThrow();
  });

  it("blocks shadow keys and validation overrides on vendors (Payload 5, 6, 7)", async () => {
    const userDb = testEnv.authenticatedContext("user123").firestore();
    const vendorRef = doc(userDb, "users/user123/vendors/v1");

    // Payload 5
    await expect(setDoc(vendorRef, {
      id: "v1",
      name: "Burger Joint",
      cuisine: "American",
      logo: "🍔",
      rating: 5,
      menu: [],
      adminBypass: true
    })).rejects.toThrow();

    // Payload 6
    await expect(setDoc(vendorRef, {
      id: "v1",
      name: "Burger Joint",
      cuisine: "American",
      logo: "🍔",
      rating: 99.9,
      menu: []
    })).rejects.toThrow();
  });

  it("enforces order schema and non-negative amounts (Payload 8, 9, 10, 11)", async () => {
    const userDb = testEnv.authenticatedContext("user123").firestore();
    const orderRef = doc(userDb, "users/user123/orders/order99");

    // Payload 8: missing vendorId
    await expect(setDoc(orderRef, {
      id: "order99",
      vendorName: "Burger Joint",
      items: [],
      status: "Placed",
      timestamp: "2026-07-14T10:00:00Z",
      paymentMethod: "Swish",
      totalAmount: 150,
      queueNumber: 10,
      customerName: "Kalle",
      estimatedPrepTime: 5
    })).rejects.toThrow();

    // Payload 9: negative totalAmount
    await expect(setDoc(orderRef, {
      id: "order99",
      vendorId: "v1",
      vendorName: "Burger Joint",
      items: [],
      status: "Placed",
      timestamp: "2026-07-14T10:00:00Z",
      paymentMethod: "Swish",
      totalAmount: -500.0,
      queueNumber: 10,
      customerName: "Kalle",
      estimatedPrepTime: 5
    })).rejects.toThrow();
  });
});
