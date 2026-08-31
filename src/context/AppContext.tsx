import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { DEFAULT_VENDORS, MANAGED_EVENTS } from "../data";
import { Vendor, MenuItem, Order, OrderStatus, ManagedEvent, EventStatus, CartEntry } from "../types";
import { 
  db, 
  auth, 
  googleProvider, 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged, 
  collection, 
  doc, 
  setDoc, 
  onSnapshot, 
  query, 
  deleteDoc, 
  updateDoc, 
  OperationType, 
  handleFirestoreError 
} from "../lib/firebase";
import type { User } from "../lib/firebase";

export interface ActivityLog {
  id: string;
  timestamp: string;
  type: "info" | "success" | "warning" | "alert";
  message: string;
  category: "order" | "vendor" | "system" | "admin";
}

interface AppContextType {
  user: User | null;
  vendors: Vendor[];
  orders: Order[];
  managedEvents: ManagedEvent[];
  activityLogs: ActivityLog[];
  activeVendorId: string;
  customerCart: { [itemId: string]: number };
  customerName: string;
  activeTable: string | null;
  currentOrder: Order | null;
  activeEventId: string;
  loggedInVendorId: string | null;
  loggedInAdminId: string | null;
  isSuperAdminAuthenticated: boolean;
  notification: string | null;
  eventMapUrl?: string;
  attendeeTab: "menu" | "orders" | "map" | "support";
  ordersSubTab: "live" | "history";
  selectedVendorStallId: string | null;
  showCartDrawer: boolean;
  cartEntries: CartEntry[];
  
  // Setters & Actions
  setAttendeeTab: React.Dispatch<React.SetStateAction<"menu" | "orders" | "map" | "support">>;
  setOrdersSubTab: React.Dispatch<React.SetStateAction<"live" | "history">>;
  setSelectedVendorStallId: React.Dispatch<React.SetStateAction<string | null>>;
  setShowCartDrawer: React.Dispatch<React.SetStateAction<boolean>>;
  setCartEntries: React.Dispatch<React.SetStateAction<CartEntry[]>>;
  setActiveVendorId: (id: string) => void;
  setCustomerCart: React.Dispatch<React.SetStateAction<{ [itemId: string]: number }>>;
  addToCart: (itemId: string, qty?: number) => void;
  removeFromCart: (itemId: string) => void;
  clearCart: () => void;
  setCustomerName: (name: string) => void;
  setActiveTable: (table: string | null) => void;
  setCurrentOrder: (order: Order | null) => void;
  setActiveEventId: (id: string) => void;
  setLoggedInVendorId: (id: string | null) => void;
  setLoggedInAdminId: (id: string | null) => void;
  setIsSuperAdminAuthenticated: (val: boolean) => void;
  setNotification: (msg: string | null) => void;
  handleUpdateEventMapUrl: (url: string | undefined) => void;
  
  handleSignIn: () => Promise<void>;
  handleSignOut: () => Promise<void>;
  logActivity: (message: string, category: "order" | "vendor" | "system" | "admin", type?: "info" | "success" | "warning" | "alert") => void;
  confirmSwishPayment: (
    custName: string, 
    activeVendorObj: Vendor, 
    cartTotal: number, 
    itemsInCart: Array<{ menuItem: MenuItem; quantity: number; selectedExtras?: any[] }>,
    paymentMethodUsed?: string
  ) => Promise<Order>;
  updateOrderStatus: (orderId: string, newStatus: OrderStatus) => Promise<void>;
  handleUpdateVendorProfile: (updatedVendorOrId: Vendor | string, updatedFields?: Partial<Vendor>) => Promise<void>;
  handleApproveVendor: (vendorId: string) => Promise<void>;
  handleSuspendVendor: (vendorId: string) => Promise<void>;
  handleAddNewVendor: (newVendor: Vendor) => Promise<void>;
  handleUpdateEventStatus: (eventId: string, newStatus: EventStatus) => void;
  handleAddNewEvent: (newEvent: ManagedEvent) => void;
  estimateVendorWaitTime: (vendorId: string) => { minutes: number; activeCount: number; congestionLevel: "Low" | "Medium" | "High" };
  /** The event the attendee has chosen from the selector screen (localStorage-backed). null = show selector. */
  selectedUserEventId: string | null;
  setSelectedUserEventId: (id: string | null) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// Helper to deeply sanitize objects going to Firestore (Firestore doesn't allow undefined values)
function cleanUndefined<T>(obj: T): T {
  if (obj === undefined) {
    return null as any;
  }
  if (obj === null || typeof obj !== "object") {
    return obj;
  }
  if (Array.isArray(obj)) {
    return obj.map(cleanUndefined) as any;
  }
  const result: any = {};
  for (const key of Object.keys(obj as any)) {
    const val = (obj as any)[key];
    if (val !== undefined) {
      result[key] = cleanUndefined(val);
    }
  }
  return result;
}

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [vendors, setVendors] = useState<Vendor[]>(DEFAULT_VENDORS);
  const [orders, setOrders] = useState<Order[]>([]);
  const [activeVendorId, setActiveVendorId] = useState<string>("v1");
  const [customerCart, setCustomerCart] = useState<{ [itemId: string]: number }>({});
  const [customerName, setCustomerName] = useState("Lars");
  const [activeTable, setActiveTable] = useState<string | null>(null);
  const [currentOrder, setCurrentOrder] = useState<Order | null>(null);
  const [managedEvents, setManagedEvents] = useState<ManagedEvent[]>(MANAGED_EVENTS);
  const [selectedUserEventId, _setSelectedUserEventId] = useState<string | null>(() => {
    return localStorage.getItem("venueeat_selected_event_id") || null;
  });
  const [activeEventId, setActiveEventId] = useState<string>(() => {
    return localStorage.getItem("venueeat_selected_event_id") || "evt-001";
  });
  const [notification, setNotification] = useState<string | null>(null);

  // Attendee event selection — persisted in localStorage so push notifications can reference it later
  const setSelectedUserEventId = (id: string | null) => {
    _setSelectedUserEventId(id);
    if (id) {
      localStorage.setItem("venueeat_selected_event_id", id);
      setActiveEventId(id);
    } else {
      localStorage.removeItem("venueeat_selected_event_id");
    }
  };
  const [eventMapUrl, setEventMapUrl] = useState<string | undefined>(() => {
    return localStorage.getItem("venueeat_event_map_url") || undefined;
  });
  
  // Attendee navigation and cart drawer global states
  const [attendeeTab, setAttendeeTab] = useState<"menu" | "orders" | "map" | "support">("menu");
  const [ordersSubTab, setOrdersSubTab] = useState<"live" | "history">("live");
  const [selectedVendorStallId, setSelectedVendorStallId] = useState<string | null>(null);
  const [showCartDrawer, setShowCartDrawer] = useState<boolean>(false);
  const [cartEntries, setCartEntries] = useState<CartEntry[]>([]);

  const handleUpdateEventMapUrl = (url: string | undefined) => {
    setEventMapUrl(url);
    if (url) {
      localStorage.setItem("venueeat_event_map_url", url);
      logActivity("Event organizer updated custom festival map layout.", "admin", "success");
      setNotification("Custom venue map saved & published to festival app.");
    } else {
      localStorage.removeItem("venueeat_event_map_url");
      logActivity("Event organizer reset map to default interactive SVG layout.", "admin", "info");
      setNotification("Reset to default interactive festival map.");
    }
  };

  // Portal auth states
  const [loggedInVendorId, setLoggedInVendorId] = useState<string | null>(null);
  const [loggedInAdminId, setLoggedInAdminId] = useState<string | null>(null);
  const [isSuperAdminAuthenticated, setIsSuperAdminAuthenticated] = useState<boolean>(false);

  // Activity logs
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([
    {
      id: "log_1",
      timestamp: new Date(Date.now() - 3600000 * 3).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      type: "success",
      message: "VenueEat Stockholm Core System Online: Real-time order sync and Swish Handel APIs active.",
      category: "system"
    },
    {
      id: "log_2",
      timestamp: new Date(Date.now() - 3600000 * 2.5).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      type: "info",
      message: "Synced festival vendors (Delhi Street Sensation, Bombay Cutting, Kerala Coastal, Jaipur Palace Sweets).",
      category: "system"
    },
    {
      id: "log_3",
      timestamp: new Date(Date.now() - 3600000 * 2).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      type: "success",
      message: "Table QR Code scanning system verified. 12 table points ready.",
      category: "system"
    }
  ]);

  // Firebase auth state observer
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  // Dismiss notification automatically
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  const logActivity = (
    message: string, 
    category: "order" | "vendor" | "system" | "admin", 
    type: "info" | "success" | "warning" | "alert" = "info"
  ) => {
    const newLog: ActivityLog = {
      id: `log_${Date.now()}_${Math.random().toString(36).substring(2, 5)}`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      type,
      message,
      category
    };
    setActivityLogs(prev => [newLog, ...prev]);
  };

  // Firestore Realtime Synchronization
  useEffect(() => {
    const vendorsPath = "vendors";
    const unsubscribeVendors = onSnapshot(
      collection(db, vendorsPath),
      (snapshot) => {
        if (!snapshot.empty) {
          const loadedVendors: Vendor[] = [];
          const loadedVendorIds = new Set<string>();
          snapshot.forEach((docSnap) => {
            const vData = { id: docSnap.id, ...docSnap.data() } as Vendor;
            loadedVendors.push(vData);
            loadedVendorIds.add(docSnap.id);
          });

          // Automatically seed any new default demo vendors not yet stored in Firestore
          DEFAULT_VENDORS.forEach(async (v) => {
            if (!loadedVendorIds.has(v.id)) {
              try {
                await setDoc(doc(db, "vendors", v.id), cleanUndefined(v));
              } catch (err) {
                console.warn("Could not seed default vendor:", v.id, err);
              }
            }
          });

          // Merge any unseeded default vendors into local state for immediate responsiveness
          const mergedVendors = [...loadedVendors];
          DEFAULT_VENDORS.forEach((dv) => {
            if (!loadedVendorIds.has(dv.id)) {
              mergedVendors.push(dv);
            }
          });
          setVendors(mergedVendors);
        } else {
          // Initialize default vendors if collection is empty
          DEFAULT_VENDORS.forEach(async (v) => {
            try {
              await setDoc(doc(db, "vendors", v.id), cleanUndefined(v));
            } catch (err) {
              console.warn("Could not seed default vendor:", err);
            }
          });
          setVendors(DEFAULT_VENDORS);
        }
      },
      (error) => handleFirestoreError(error, OperationType.GET, vendorsPath)
    );

    const ordersPath = "orders";
    const unsubscribeOrders = onSnapshot(
      collection(db, ordersPath),
      (snapshot) => {
        const loadedOrders: Order[] = [];
        const seenOrderIds = new Set<string>();

        snapshot.forEach((docSnap) => {
          if (!seenOrderIds.has(docSnap.id)) {
            seenOrderIds.add(docSnap.id);
            loadedOrders.push({ id: docSnap.id, ...docSnap.data() } as Order);
          }
        });

        loadedOrders.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
        setOrders(loadedOrders);

        // Keep currentOrder in sync if tracked
        if (currentOrder) {
          const matchingUpdatedOrder = loadedOrders.find(o => o.id === currentOrder.id);
          if (matchingUpdatedOrder) {
            setCurrentOrder(matchingUpdatedOrder);
          }
        }
      },
      (error) => handleFirestoreError(error, OperationType.GET, ordersPath)
    );

    return () => {
      unsubscribeVendors();
      unsubscribeOrders();
    };
  }, []);

  // Cart actions
  const addToCart = (itemId: string, qty = 1) => {
    setCustomerCart(prev => ({
      ...prev,
      [itemId]: (prev[itemId] || 0) + qty
    }));
  };

  const removeFromCart = (itemId: string) => {
    setCustomerCart(prev => {
      const updated = { ...prev };
      if (updated[itemId] > 1) {
        updated[itemId] -= 1;
      } else {
        delete updated[itemId];
      }
      return updated;
    });
  };

  const clearCart = () => setCustomerCart({});

  // Auth helper
  const handleSignIn = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
      setNotification("Successfully signed in!");
    } catch (err: any) {
      console.warn("Sign-in error:", err);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      setNotification("Signed out.");
    } catch (err) {
      console.warn("Sign out error:", err);
    }
  };

  // Swish Payment Confirmation & Firestore creation
  const confirmSwishPayment = async (
    custName: string,
    activeVendorObj: Vendor,
    cartTotal: number,
    itemsInCart: Array<{ menuItem: MenuItem; quantity: number; selectedExtras?: any[] }>,
    paymentMethodUsed = "Swish Handel"
  ): Promise<Order> => {
    const newQueueNumber = orders.length > 0 ? Math.max(...orders.map(o => o.queueNumber)) + 1 : 101;
    const finalCustName = custName.trim() || "Guest";
    const displayNameWithTable = activeTable 
      ? `${finalCustName} (Table ${activeTable})`
      : finalCustName;

    const vendorSwishPaid = cartTotal * 0.965; // 96.5% direct vendor share
    const platformSwishPaid = cartTotal * 0.035; // 3.5% venueeat platform fee

    const newOrderObj: Order = {
      id: `ord_${Date.now()}_${Math.random().toString(36).substring(2, 5)}`,
      queueNumber: newQueueNumber,
      vendorId: activeVendorObj.id,
      vendorName: activeVendorObj.name,
      customerName: displayNameWithTable,
      items: itemsInCart,
      totalAmount: cartTotal,
      vendorSwishShareSEK: vendorSwishPaid,
      platformFeeSEK: platformSwishPaid,
      status: "Placed",
      createdAt: Date.now(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      estimatedPrepTimeMinutes: 8
    };

    try {
      await setDoc(doc(db, "orders", newOrderObj.id), cleanUndefined(newOrderObj));
    } catch (err) {
      console.warn("Firestore order create error:", err);
    }

    setOrders(prev => [newOrderObj, ...prev.filter(o => o.id !== newOrderObj.id)]);
    setCurrentOrder(newOrderObj);
    clearCart();
    setNotification(`Order #${newQueueNumber} placed successfully via ${paymentMethodUsed}!`);
    logActivity(`${paymentMethodUsed} Payment Successful: Order #${newQueueNumber}. Vendor "${activeVendorObj.name}" received ${vendorSwishPaid.toFixed(2)} kr directly. Platform Fee ${platformSwishPaid.toFixed(2)} kr routed.`, "order", "success");

    return newOrderObj;
  };

  // Update order status
  const updateOrderStatus = async (orderId: string, newStatus: OrderStatus) => {
    const targetOrder = orders.find(o => o.id === orderId);
    if (!targetOrder) return;

    const updatedOrder = { ...targetOrder, status: newStatus };
    try {
      await updateDoc(doc(db, "orders", orderId), cleanUndefined({ status: newStatus }));
    } catch (err) {
      console.warn("Firestore order update error:", err);
    }

    setOrders(prev => prev.map(o => o.id === orderId ? updatedOrder : o));
    if (currentOrder?.id === orderId) {
      setCurrentOrder(updatedOrder);
    }
    setNotification(`Order #${targetOrder.queueNumber} marked as ${newStatus}!`);
    logActivity(`Order #${targetOrder.queueNumber} status updated to ${newStatus} by ${targetOrder.vendorName}.`, "order", "info");
  };

  // Vendor actions
  const handleUpdateVendorProfile = async (
    updatedVendorOrId: Vendor | string,
    updatedFields?: Partial<Vendor>
  ) => {
    let targetVendor: Vendor | undefined;
    if (typeof updatedVendorOrId === "string") {
      const existing = vendors.find(v => v.id === updatedVendorOrId);
      if (!existing) return;
      targetVendor = { ...existing, ...(updatedFields || {}) };
    } else {
      targetVendor = updatedVendorOrId;
    }

    try {
      await setDoc(doc(db, "vendors", targetVendor.id), cleanUndefined(targetVendor));
    } catch (err) {
      console.warn("Firestore vendor profile update error:", err);
    }
    setVendors(prev => prev.map(v => v.id === targetVendor!.id ? targetVendor! : v));
    setNotification(`Updated menu & settings for ${targetVendor.name}`);
    logActivity(`Vendor profile for "${targetVendor.name}" updated.`, "vendor", "info");
  };

  const handleApproveVendor = async (vendorId: string) => {
    const v = vendors.find(ven => ven.id === vendorId);
    if (!v) return;
    const updated = { ...v, isApproved: true };
    try {
      await updateDoc(doc(db, "vendors", vendorId), cleanUndefined({ isApproved: true }));
    } catch (err) {
      console.warn("Firestore vendor approve error:", err);
    }
    setVendors(prev => prev.map(ven => ven.id === vendorId ? updated : ven));
    setNotification(`Approved vendor stall "${v.name}"!`);
    logActivity(`Vendor stall "${v.name}" approved by Event Admin.`, "admin", "success");
  };

  const handleSuspendVendor = async (vendorId: string) => {
    const v = vendors.find(ven => ven.id === vendorId);
    if (!v) return;
    const updated = { ...v, isApproved: "rejected" as const };
    try {
      await updateDoc(doc(db, "vendors", vendorId), cleanUndefined({ isApproved: "rejected" }));
    } catch (err) {
      console.warn("Firestore vendor suspend error:", err);
    }
    setVendors(prev => prev.map(ven => ven.id === vendorId ? updated : ven));
    setNotification(`Suspended vendor stall "${v.name}".`);
    logActivity(`Vendor stall "${v.name}" suspended by Event Admin.`, "admin", "warning");
  };

  const handleAddNewVendor = async (newVendor: Vendor) => {
    try {
      await setDoc(doc(db, "vendors", newVendor.id), cleanUndefined(newVendor));
    } catch (err) {
      console.warn("Firestore add vendor error:", err);
    }
    setVendors(prev => [newVendor, ...prev]);
    setNotification(`Registered new food stall "${newVendor.name}"!`);
    logActivity(`New food stall registered: "${newVendor.name}" (${newVendor.cuisine}).`, "vendor", "success");
  };

  const handleUpdateEventStatus = (eventId: string, newStatus: EventStatus) => {
    setManagedEvents(prev => prev.map(e => e.id === eventId ? { ...e, status: newStatus } : e));
    setNotification(`Updated event status to "${newStatus}"!`);
  };

  const handleAddNewEvent = (newEvent: ManagedEvent) => {
    setManagedEvents(prev => [newEvent, ...prev]);
    setNotification(`Created new event "${newEvent.name}"!`);
  };

  const estimateVendorWaitTime = (vendorId: string) => {
    const activeOrders = orders.filter(
      (o) => o.vendorId === vendorId && (o.status === "Placed" || o.status === "Preparing")
    );
    const activeCount = activeOrders.length;
    let minutes = 5;
    let congestionLevel: "Low" | "Medium" | "High" = "Low";

    if (activeCount === 0) {
      minutes = 5;
      congestionLevel = "Low";
    } else if (activeCount <= 2) {
      minutes = 8;
      congestionLevel = "Low";
    } else if (activeCount <= 5) {
      minutes = 15;
      congestionLevel = "Medium";
    } else {
      minutes = 22;
      congestionLevel = "High";
    }

    return { minutes, activeCount, congestionLevel };
  };

  return (
    <AppContext.Provider
      value={{
        user,
        vendors,
        orders,
        managedEvents,
        activityLogs,
        activeVendorId,
        customerCart,
        customerName,
        activeTable,
        currentOrder,
        activeEventId,
        loggedInVendorId,
        loggedInAdminId,
        isSuperAdminAuthenticated,
        notification,
        eventMapUrl,
        attendeeTab,
        ordersSubTab,
        selectedVendorStallId,
        showCartDrawer,
        cartEntries,
        
        setAttendeeTab,
        setOrdersSubTab,
        setSelectedVendorStallId,
        setShowCartDrawer,
        setCartEntries,
        setActiveVendorId,
        setCustomerCart,
        addToCart,
        removeFromCart,
        clearCart,
        setCustomerName,
        setActiveTable,
        setCurrentOrder,
        setActiveEventId,
        setLoggedInVendorId,
        setLoggedInAdminId,
        setIsSuperAdminAuthenticated,
        setNotification,
        handleUpdateEventMapUrl,
        
        handleSignIn,
        handleSignOut,
        logActivity,
        confirmSwishPayment,
        updateOrderStatus,
        handleUpdateVendorProfile,
        handleApproveVendor,
        handleSuspendVendor,
        handleAddNewVendor,
        handleUpdateEventStatus,
        handleAddNewEvent,
        estimateVendorWaitTime,
        selectedUserEventId,
        setSelectedUserEventId
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
};
