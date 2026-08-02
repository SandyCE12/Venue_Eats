import React, { useState, useEffect } from "react";
import { DEFAULT_VENDORS, MANAGED_EVENTS } from "../data";
import { Vendor, MenuItem, Order, OrderStatus, ManagedEvent, EventStatus } from "../types";
import { 
  Smartphone, 
  Store, 
  Building2,
  ShoppingBag, 
  Plus, 
  Minus, 
  Trash2, 
  Clock, 
  AlertCircle, 
  CheckCircle, 
  TrendingUp, 
  ToggleLeft, 
  ToggleRight,
  ChevronRight,
  ArrowLeft,
  Bell,
  Fingerprint,
  RotateCcw,
  Sparkles,
  ShieldCheck,
  CloudLightning,
  LogIn,
  QrCode,
  Utensils,
  Ticket,
  Check,
  X,
  XCircle,
  History,
  MapPin,
  LogOut,
  Activity,
  Users,
  Zap,
  MessageSquare,
  Bot,
  Settings,
  Map,
  Monitor,
  Columns
} from "lucide-react";
import { 
  db, 
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
import SwishPaymentGateway from "./SwishPaymentGateway";
import OrderStatusTracker from "./OrderStatusTracker";
import VendorAnalytics from "./VendorAnalytics";
import TableQrGenerator from "./TableQrGenerator";
import { AdminSalesCharts } from "./AdminSalesCharts";
import SupportChat from "./SupportChat";
import VendorSettings from "./VendorSettings";
import EventMap from "./EventMap";
import SuperAdminConsole from "./SuperAdminConsole";

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

interface AppSimulatorProps {
  user: User | null;
  handleSignIn: () => Promise<void>;
}

export default function AppSimulator({ user, handleSignIn }: AppSimulatorProps) {
  // Sync state between client and vendor
  const [vendors, setVendors] = useState<Vendor[]>(DEFAULT_VENDORS);
  const [orders, setOrders] = useState<Order[]>([]);
  const [activeVendorId, setActiveVendorId] = useState<string>("v1");
  const [customerCart, setCustomerCart] = useState<{ [itemId: string]: number }>({});
  const [customerName, setCustomerName] = useState("Lars");
  const [currentOrder, setCurrentOrder] = useState<Order | null>(null);
  const [activeCustomerTab, setActiveCustomerTab] = useState<"home" | "tracker" | "history" | "support" | "map">("home");
  const [attendeeSearchQuery, setAttendeeSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [vendorViewStyle, setVendorViewStyle] = useState<"grid" | "pills">("grid");
  
  // Customization overlay state
  const [customizingItem, setCustomizingItem] = useState<MenuItem | null>(null);
  const [selectedExtrasForCustomizing, setSelectedExtrasForCustomizing] = useState<string[]>([]);
  
  // Interface Toggle
  const [showSwishFlow, setShowSwishFlow] = useState(false);
  const [swishProcessing, setSwishProcessing] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);

  // Vendor Role Active Tab in dashboard
  const [vendorRoleTab, setVendorRoleTab] = useState<"orders" | "menu" | "analytics" | "support" | "settings">("orders");
  const [selectedVendorForConsole, setSelectedVendorForConsole] = useState<string>("v1");
  const [showQrModal, setShowQrModal] = useState(false);
  const [activeTable, setActiveTable] = useState<string | null>(null);
  const [showQueueMonitor, setShowQueueMonitor] = useState(true);

  // Multi-Event Super Admin State
  const [managedEvents, setManagedEvents] = useState<ManagedEvent[]>(MANAGED_EVENTS);
  const [activeEventId, setActiveEventId] = useState<string>("evt-001");
  const activeEvent = managedEvents.find(e => e.id === activeEventId) || managedEvents[0];

  // Global Web App & Portal Layout View Mode
  const [viewLayoutMode, setViewLayoutMode] = useState<"split" | "attendee" | "vendor" | "admin" | "superadmin">("split");

  // Event Organizer & Super Admin Mode
  const [rightPanelMode, setRightPanelMode] = useState<"vendor" | "admin" | "superadmin">("vendor");
  const [adminTab, setAdminTab] = useState<"vendors" | "map" | "activity" | "analytics">("vendors");

  const handleSelectActiveEvent = (eventId: string) => {
    setActiveEventId(eventId);
    const ev = managedEvents.find(e => e.id === eventId);
    if (ev) {
      setNotification(`Switched active event context to "${ev.name}"!`);
    }
  };

  const handleAddNewEvent = (newEvent: ManagedEvent) => {
    setManagedEvents(prev => [newEvent, ...prev]);
    setNotification(`Successfully created new event "${newEvent.name}"!`);
  };

  const handleUpdateEventStatus = (eventId: string, newStatus: EventStatus) => {
    setManagedEvents(prev => prev.map(e => e.id === eventId ? { ...e, status: newStatus } : e));
    setNotification(`Updated event status to "${newStatus}"!`);
  };

  const handleUpdateEventMap = (eventId: string, mapUrl: string) => {
    setManagedEvents(prev => prev.map(e => e.id === eventId ? { ...e, mapImageUrl: mapUrl } : e));
    setNotification(`🗺️ Venue Map updated for festival! Client app map synced.`);
    logActivity(`Event Admin published updated venue map image layout.`, "admin", "success");
  };

  const [adminVendorSubTab, setAdminVendorSubTab] = useState<"all" | "pending" | "approved" | "rejected">("all");
  
  // Quick Add Vendor form fields state (inside Admin Dashboard)
  const [adminNewVendorName, setAdminNewVendorName] = useState("");
  const [adminNewVendorCuisine, setAdminNewVendorCuisine] = useState("");
  const [adminNewVendorLogo, setAdminNewVendorLogo] = useState("🍛");
  const [adminNewVendorLocation, setAdminNewVendorLocation] = useState("");
  const [adminNewVendorStallNumber, setAdminNewVendorStallNumber] = useState("");
  const [adminNewVendorPin, setAdminNewVendorPin] = useState("");
  const [adminNewVendorEmail, setAdminNewVendorEmail] = useState("");
  const [adminFormOpen, setAdminFormOpen] = useState(false);

  // Search/Filter states for Admin Orders sub-tab
  const [adminOrderSearch, setAdminOrderSearch] = useState("");
  const [adminOrderVendorFilter, setAdminOrderVendorFilter] = useState("all");
  const [adminOrderStatusFilter, setAdminOrderStatusFilter] = useState("all");

  // Activity Log Stream State
  const [activityLogs, setActivityLogs] = useState<Array<{
    id: string;
    timestamp: string;
    type: "info" | "success" | "warning" | "alert";
    message: string;
    category: "order" | "vendor" | "system" | "admin";
  }>>([
    {
      id: "log_1",
      timestamp: new Date(Date.now() - 3600000 * 3).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      type: "success",
      message: "Namaste Stockholm Festival Core System Online: Cloud synchronization and real-time queues active.",
      category: "system"
    },
    {
      id: "log_2",
      timestamp: new Date(Date.now() - 3600000 * 2.5).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      type: "info",
      message: "Pre-seeded festival vendors synced to central registry (Delhi Street, Bombay Cutting, Kerala Coastal, Jaipur Palace).",
      category: "system"
    },
    {
      id: "log_3",
      timestamp: new Date(Date.now() - 3600000 * 2).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      type: "success",
      message: "Table QR Code scanning system verified. 12 table points armed.",
      category: "system"
    },
    {
      id: "log_4",
      timestamp: new Date(Date.now() - 3600000 * 1.5).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      type: "info",
      message: "Swish proxy channels and dynamic wait-time balance algorithms configured.",
      category: "system"
    },
    {
      id: "log_5",
      timestamp: new Date(Date.now() - 60000 * 10).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      type: "success",
      message: "Organizer Admin Dashboard unlocked. Audit logs active for live vendor registration.",
      category: "admin"
    }
  ]);

  // Activity Log Helper
  const logActivity = (
    message: string, 
    category: "order" | "vendor" | "system" | "admin", 
    type: "info" | "success" | "warning" | "alert" = "info"
  ) => {
    const newLog = {
      id: `log_${Date.now()}_${Math.random().toString(36).substring(2, 5)}`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      type,
      message,
      category
    };
    setActivityLogs(prev => [newLog, ...prev]);
  };

  // Vendor Authentication & Registration State
  const [loggedInVendorId, setLoggedInVendorId] = useState<string | null>(null);
  const [vendorLoginPin, setVendorLoginPin] = useState<string>("");
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isRegisteringNewVendor, setIsRegisteringNewVendor] = useState<boolean>(false);

  // New Vendor Registration Fields State
  const [newVendorName, setNewVendorName] = useState<string>("");
  const [newVendorCuisine, setNewVendorCuisine] = useState<string>("");
  const [newVendorLogo, setNewVendorLogo] = useState<string>("🍛");
  const [newVendorLocation, setNewVendorLocation] = useState<string>("");
  const [newVendorPin, setNewVendorPin] = useState<string>("");
  const [newVendorEmail, setNewVendorEmail] = useState<string>("manager@dosahub.se");
  const [newVendorSwish, setNewVendorSwish] = useState<string>("123 543 21 09");
  const [emailVerificationCode, setEmailVerificationCode] = useState<string>("");
  const [enteredVerificationCode, setEnteredVerificationCode] = useState<string>("");
  const [isEmailVerified, setIsEmailVerified] = useState<boolean>(false);
  const [showVerificationCodeInput, setShowVerificationCodeInput] = useState<boolean>(false);
  const [verificationNotification, setVerificationNotification] = useState<string | null>(null);

  // Vendor Sign In State (Secure email path)
  const [signInMethod, setSignInMethod] = useState<"quick" | "email">("quick");
  const [signInEmail, setSignInEmail] = useState<string>("");
  const [signInEnteredCode, setSignInEnteredCode] = useState<string>("");
  const [signInSentCode, setSignInSentCode] = useState<string>("");
  const [isSignInEmailVerified, setIsSignInEmailVerified] = useState<boolean>(false);
  const [showSignInCodeInput, setShowSignInCodeInput] = useState<boolean>(false);

  // Expandable form toggles
  const [showAddMenuForm, setShowAddMenuForm] = useState<boolean>(false);
  
  // New Menu Item Form States
  const [newItemName, setNewItemName] = useState<string>("");
  const [newItemDesc, setNewItemDesc] = useState<string>("");
  const [newItemPrice, setNewItemPrice] = useState<number>(110);
  const [newItemCategory, setNewItemCategory] = useState<"Food" | "Drink" | "Snack" | "Dessert">("Food");
  const [newItemImage, setNewItemImage] = useState<string>("https://images.unsplash.com/photo-1601050690597-df056fb4ce78?w=500&auto=format&fit=crop&q=60");

  // Inline location editing state
  const [isEditingLocation, setIsEditingLocation] = useState<boolean>(false);
  const [editLocationText, setEditLocationText] = useState<string>("");

  // Admin Authentication & Registration State
  const [admins, setAdmins] = useState<Array<{
    id: string;
    name: string;
    email: string;
    pin: string;
  }>>([
    {
      id: "admin_1",
      name: "Sandy",
      email: "sandy@creativeventsnordic.com",
      pin: "9999"
    },
    {
      id: "admin_2",
      name: "Lars",
      email: "lars@venueeat.se",
      pin: "8888"
    }
  ]);
  const [loggedInAdminId, setLoggedInAdminId] = useState<string | null>(null);
  const [adminLoginPin, setAdminLoginPin] = useState<string>("");
  const [adminLoginError, setAdminLoginError] = useState<string | null>(null);
  const [isRegisteringNewAdmin, setIsRegisteringNewAdmin] = useState<boolean>(false);

  // New Admin Registration Fields State
  const [newAdminName, setNewAdminName] = useState<string>("");
  const [newAdminEmail, setNewAdminEmail] = useState<string>("");
  const [newAdminPin, setNewAdminPin] = useState<string>("");
  const [adminEmailVerificationCode, setAdminEmailVerificationCode] = useState<string>("");
  const [adminEnteredVerificationCode, setAdminEnteredVerificationCode] = useState<string>("");
  const [isAdminEmailVerified, setIsAdminEmailVerified] = useState<boolean>(false);
  const [showAdminVerificationCodeInput, setShowAdminVerificationCodeInput] = useState<boolean>(false);
  const [adminVerificationNotification, setAdminVerificationNotification] = useState<string | null>(null);

  // Admin Sign In State (Secure email path)
  const [adminSignInMethod, setAdminSignInMethod] = useState<"quick" | "email">("quick");
  const [adminSignInEmail, setAdminSignInEmail] = useState<string>("");
  const [adminSignInEnteredCode, setAdminSignInEnteredCode] = useState<string>("");
  const [adminSignInSentCode, setAdminSignInSentCode] = useState<string>("");
  const [isAdminSignInEmailVerified, setIsAdminSignInEmailVerified] = useState<boolean>(false);
  const [showAdminSignInCodeInput, setShowAdminSignInCodeInput] = useState<boolean>(false);
  const [selectedAdminForConsole, setSelectedAdminForConsole] = useState<string>("admin_1");

  // Lock selectedVendorForConsole to loggedInVendorId when logged in
  useEffect(() => {
    if (loggedInVendorId) {
      setSelectedVendorForConsole(loggedInVendorId);
    }
  }, [loggedInVendorId]);

  // Background Auto-Simulate Live Customer Traffic State & Effects
  const [isAutoTrafficEnabled, setIsAutoTrafficEnabled] = useState<boolean>(false); // Disabled by default so orders are not placed automatically unless requested
  const [prevActiveOrdersCount, setPrevActiveOrdersCount] = useState<number>(0);

  const playIncomingOrderSound = () => {
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return;
      const ctx = new AudioContextClass();
      
      // Tone 1: 523.25 Hz (C5) for 100ms
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = "sine";
      osc1.frequency.setValueAtTime(523.25, ctx.currentTime);
      gain1.gain.setValueAtTime(0.08, ctx.currentTime);
      gain1.gain.exponentialRampToValueAtTime(0.005, ctx.currentTime + 0.12);
      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.start();
      osc1.stop(ctx.currentTime + 0.12);
      
      // Tone 2: 659.25 Hz (E5) after 110ms
      setTimeout(() => {
        try {
          const osc2 = ctx.createOscillator();
          const gain2 = ctx.createGain();
          osc2.type = "sine";
          osc2.frequency.setValueAtTime(659.25, ctx.currentTime);
          gain2.gain.setValueAtTime(0.08, ctx.currentTime);
          gain2.gain.exponentialRampToValueAtTime(0.005, ctx.currentTime + 0.12);
          osc2.connect(gain2);
          gain2.connect(ctx.destination);
          osc2.start();
          osc2.stop(ctx.currentTime + 0.12);
        } catch (e) {}
      }, 110);
    } catch (e) {
      console.warn("Audio Context not supported or blocked by browser policy:", e);
    }
  };

  // Keep track of new active orders for the currently logged in vendor to play audio chimes
  useEffect(() => {
    const activeId = loggedInVendorId || selectedVendorForConsole;
    if (activeId) {
      const activeCount = orders.filter(
        o => o.vendorId === activeId && o.status === "Placed"
      ).length;
      
      if (activeCount > prevActiveOrdersCount) {
        playIncomingOrderSound();
      }
      setPrevActiveOrdersCount(activeCount);
    } else {
      setPrevActiveOrdersCount(0);
    }
  }, [orders, loggedInVendorId, selectedVendorForConsole]);

  // Keep latest traffic simulation function in a ref to avoid resetting the interval on order/vendor changes
  const simulateCallbackRef = React.useRef<() => void>();
  useEffect(() => {
    simulateCallbackRef.current = () => {
      const approvedVendors = vendors.filter(v => v.isApproved === true);
      if (approvedVendors.length === 0) return;

      // Select a random approved vendor
      const randomVendor = approvedVendors[Math.floor(Math.random() * approvedVendors.length)];
      handleSimulateOrderSpike(randomVendor.id);
    };
  });

  // Background Auto-Simulate Live Customer Traffic Loop
  useEffect(() => {
    if (!isAutoTrafficEnabled) return;

    const interval = setInterval(() => {
      if (simulateCallbackRef.current) {
        simulateCallbackRef.current();
      }
    }, 12000); // snappy 12 second intervals for live interactive testing!

    return () => clearInterval(interval);
  }, [isAutoTrafficEnabled]);

  // Live Timer states for accelerated demo countdown
  const [lastTimerSyncTime, setLastTimerSyncTime] = useState<number>(Date.now());
  const [timerTick, setTimerTick] = useState<number>(0);

  // Sync timer sync-time when order stats or time change
  useEffect(() => {
    setLastTimerSyncTime(Date.now());
  }, [currentOrder?.estimatedPrepTime, currentOrder?.status]);

  // Keep re-rendering every 250ms for live timer ticks
  useEffect(() => {
    if (currentOrder && currentOrder.status === "Preparing") {
      const interval = setInterval(() => {
        setTimerTick(t => t + 1);
      }, 250);
      return () => clearInterval(interval);
    }
  }, [currentOrder?.status]);

  // Sync currentOrder with orders list (for real-time Firestore and local updates)
  useEffect(() => {
    if (currentOrder) {
      const updated = orders.find(o => o.id === currentOrder.id);
      if (updated) {
        if (updated.status !== currentOrder.status || updated.estimatedPrepTime !== currentOrder.estimatedPrepTime) {
          setCurrentOrder(updated);
        }
      }
    }
  }, [orders, currentOrder]);

  // Wait time estimation algorithm based on active orders in queue for a vendor
  const estimateVendorWaitTime = (vendorId: string) => {
    // Get active orders (Placed or Preparing) for this specific vendor
    const activeVendorOrdersCount = orders.filter(
      o => o.vendorId === vendorId && (o.status === "Placed" || o.status === "Preparing")
    ).length;
    
    // Algorithm: Base prep time is 3 minutes. Each existing active order in queue adds 3 minutes.
    // If the vendor is very busy (> 3 active orders), let's add an extra overhead factor (e.g. 1.2x) representing kitchen stress.
    const basePrepPerOrder = 3; // minutes
    const baseTime = 3; // minimum wait time if there are no active orders (base preparation time for a fresh order)
    
    let totalMinutes = baseTime + (activeVendorOrdersCount * basePrepPerOrder);
    
    // Add heat/congestion multiplier for busy queues
    if (activeVendorOrdersCount > 3) {
      totalMinutes = Math.round(totalMinutes * 1.2);
    }
    
    return {
      minutes: totalMinutes,
      activeCount: activeVendorOrdersCount,
      congestionLevel: activeVendorOrdersCount === 0 ? "Fast" : activeVendorOrdersCount <= 2 ? "Moderate" : "Busy",
      colorClass: activeVendorOrdersCount === 0 
        ? "text-emerald-700 bg-emerald-50 border-emerald-200/50" 
        : activeVendorOrdersCount <= 2 
        ? "text-amber-700 bg-amber-50 border-amber-200/50" 
        : "text-rose-700 bg-rose-50 border-rose-200/50"
    };
  };

  const getAcceleratedCountdown = () => {
    if (!currentOrder || currentOrder.status !== "Preparing") return "00:00";
    
    const elapsedMs = Date.now() - lastTimerSyncTime;
    const intervalMs = 10000; // 10s per simulated minute
    
    const elapsedFraction = Math.min(1, elapsedMs / intervalMs);
    
    // Calculate simulated minutes and seconds
    const totalSimSeconds = Math.max(0, (currentOrder.estimatedPrepTime * 60) - Math.floor(elapsedFraction * 60));
    
    const mins = Math.floor(totalSimSeconds / 60);
    const secs = totalSimSeconds % 60;
    
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // Load / Sync with Firestore when user logged in
  useEffect(() => {
    if (!user) {
      // Clear Firestore states and fall back to local defaults
      setVendors(DEFAULT_VENDORS);
      setOrders([]);
      return;
    }

    const vendorsPath = `users/${user.uid}/vendors`;
    const ordersPath = `users/${user.uid}/orders`;

    // Subscribe to vendors
    const unsubscribeVendors = onSnapshot(
      collection(db, "users", user.uid, "vendors"), 
      (snapshot) => {
        if (snapshot.empty) {
          // Seed default vendors
          DEFAULT_VENDORS.forEach(async (vendor) => {
            const docPath = `${vendorsPath}/${vendor.id}`;
            try {
              await setDoc(doc(db, "users", user.uid, "vendors", vendor.id), vendor);
            } catch (err) {
              handleFirestoreError(err, OperationType.WRITE, docPath);
            }
          });
        } else {
          const loadedVendors: Vendor[] = [];
          snapshot.forEach((docSnap) => {
            const vendorData = docSnap.data() as Vendor;
            // Auto-heal existing Firestore data: default vendors should be approved by default
            if (["v1", "v2", "v3", "v4"].includes(vendorData.id) && vendorData.isApproved !== true && vendorData.isApproved !== "rejected") {
              vendorData.isApproved = true;
              updateDoc(docSnap.ref, { isApproved: true }).catch((e) => {
                console.warn("Failed to update auto-heal isApproved for vendor:", vendorData.id, e);
              });
            }
            loadedVendors.push(vendorData);
          });
          loadedVendors.sort((a, b) => a.id.localeCompare(b.id));
          setVendors(loadedVendors);
        }
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, vendorsPath);
      }
    );

    // Subscribe to orders
    const q = query(collection(db, "users", user.uid, "orders"));
    const unsubscribeOrders = onSnapshot(
      q, 
      (snapshot) => {
        const loadedOrders: Order[] = [];
        snapshot.forEach((doc) => {
          loadedOrders.push({ ...doc.data(), id: doc.id } as Order);
        });
        // Sort orders descending by timestamp/id
        loadedOrders.sort((a, b) => b.id.localeCompare(a.id));
        setOrders(loadedOrders);
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, ordersPath);
      }
    );

    return () => {
      unsubscribeVendors();
      unsubscribeOrders();
    };
  }, [user]);

  // Set initial customer name to user's display name if signed in
  useEffect(() => {
    if (user && user.displayName) {
      setCustomerName(user.displayName.split(" ")[0]);
    }
  }, [user]);

  // Notification automatic dismiss
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => {
        setNotification(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  // Handle active countdown for current order
  useEffect(() => {
    if (currentOrder && currentOrder.status === "Preparing") {
      const timer = setInterval(async () => {
        if (currentOrder.estimatedPrepTime > 1) {
          const nextPrepTime = currentOrder.estimatedPrepTime - 1;
          if (user) {
            try {
              await updateDoc(doc(db, "users", user.uid, "orders", currentOrder.id), cleanUndefined({
                estimatedPrepTime: nextPrepTime
              }));
            } catch (err) {
              handleFirestoreError(err, OperationType.UPDATE, `users/${user.uid}/orders/${currentOrder.id}`);
            }
          } else {
            // guest mode countdown
            setOrders(prevOrders => {
              const updated = prevOrders.map(o => 
                o.id === currentOrder.id 
                  ? { ...o, estimatedPrepTime: nextPrepTime } 
                  : o
              );
              const currentUpdated = updated.find(o => o.id === currentOrder.id);
              if (currentUpdated) {
                setCurrentOrder(currentUpdated);
              }
              return updated;
            });
          }
        }
      }, 10000); // decrement estimated time every 10s for live demonstration
      return () => clearInterval(timer);
    }
  }, [currentOrder, user]);

  // Keep currentOrder state synced with real-time orders list changes (e.g. from vendor updates)
  useEffect(() => {
    if (currentOrder) {
      const liveOrder = orders.find(o => o.id === currentOrder.id);
      if (liveOrder && JSON.stringify(liveOrder) !== JSON.stringify(currentOrder)) {
        setCurrentOrder(liveOrder);
      }
    }
  }, [orders, currentOrder]);

  // Vendor actions
  const updateOrderStatus = async (orderId: string, newStatus: OrderStatus) => {
    const updatedOrder = orders.find(o => o.id === orderId);
    if (!updatedOrder) return;

    if (user) {
      try {
        await updateDoc(doc(db, "users", user.uid, "orders", orderId), cleanUndefined({ status: newStatus }));
        // Local feedback is handled by onSnapshot
      } catch (err) {
        handleFirestoreError(err, OperationType.UPDATE, `users/${user.uid}/orders/${orderId}`);
      }
    } else {
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
    }
    
    // Log to Admin console
    logActivity(
      `Order #${updatedOrder.queueNumber} (${updatedOrder.customerName}) status updated to: ${newStatus}`, 
      "order", 
      newStatus === "Completed" ? "success" : newStatus === "Ready" ? "info" : "warning"
    );

    const label = 
      newStatus === "Preparing" ? "is being prepared by the chef!" :
      newStatus === "Ready" ? "is cooked and ready for pickup!" :
      "has been picked up and completed.";

    // Notify attendee in real-time
    if (currentOrder && currentOrder.id === orderId) {
      setCurrentOrder(prev => prev ? { ...prev, status: newStatus } : null);
      setNotification(`🔔 Your order ${updatedOrder.queueNumber} ${label}`);
    }
  };

  // Toggle item availability
  const toggleItemStock = async (vendorId: string, itemId: string) => {
    const updatedVendors = vendors.map(v => {
      if (v.id === vendorId) {
        return {
          ...v,
          menu: v.menu.map(m => m.id === itemId ? { ...m, stock: !m.stock } : m)
        };
      }
      return v;
    });

    const vendor = vendors.find(v => v.id === vendorId);
    const item = vendor?.menu.find(m => m.id === itemId);
    if (vendor && item) {
      logActivity(
        `Stall "${vendor.name}" toggled "${item.name}" availability to: ${item.stock ? "Out of Stock" : "In Stock"}`, 
        "vendor", 
        "warning"
      );
    }

    if (user) {
      const targetVendor = updatedVendors.find(v => v.id === vendorId);
      if (targetVendor) {
        try {
          await setDoc(doc(db, "users", user.uid, "vendors", vendorId), cleanUndefined(targetVendor));
        } catch (err) {
          handleFirestoreError(err, OperationType.WRITE, `users/${user.uid}/vendors/${vendorId}`);
        }
      }
    } else {
      setVendors(updatedVendors);
    }
  };

  // Update item price
  const updateItemPrice = async (vendorId: string, itemId: string, newPrice: number) => {
    const updatedVendors = vendors.map(v => {
      if (v.id === vendorId) {
        return {
          ...v,
          menu: v.menu.map(m => m.id === itemId ? { ...m, price: Math.max(0, newPrice) } : m)
        };
      }
      return v;
    });

    const vendor = vendors.find(v => v.id === vendorId);
    const item = vendor?.menu.find(m => m.id === itemId);
    if (vendor && item) {
      logActivity(
        `Stall "${vendor.name}" changed price of "${item.name}" to ${Math.max(0, newPrice)} kr`, 
        "vendor", 
        "info"
      );
    }

    if (user) {
      const targetVendor = updatedVendors.find(v => v.id === vendorId);
      if (targetVendor) {
        try {
          await setDoc(doc(db, "users", user.uid, "vendors", vendorId), cleanUndefined(targetVendor));
        } catch (err) {
          handleFirestoreError(err, OperationType.WRITE, `users/${user.uid}/vendors/${vendorId}`);
        }
      }
    } else {
      setVendors(updatedVendors);
    }
  };

  // Add menu item to vendor
  const addMenuItem = async (vendorId: string, item: Omit<MenuItem, "id">) => {
    const newItem: MenuItem = {
      ...item,
      id: `m_${Date.now()}_${Math.floor(Math.random() * 100)}`,
      stock: true,
      extras: []
    };
    const updatedVendors = vendors.map(v => {
      if (v.id === vendorId) {
        return { ...v, menu: [...v.menu, newItem] };
      }
      return v;
    });
    
    if (user) {
      const targetVendor = updatedVendors.find(v => v.id === vendorId);
      if (targetVendor) {
        try {
          await setDoc(doc(db, "users", user.uid, "vendors", vendorId), cleanUndefined(targetVendor));
        } catch (err) {
          handleFirestoreError(err, OperationType.WRITE, `users/${user.uid}/vendors/${vendorId}`);
        }
      }
    } else {
      setVendors(updatedVendors);
    }
  };

  // Update vendor location
  const updateVendorLocation = async (vendorId: string, newLocation: string) => {
    const updatedVendors = vendors.map(v => {
      if (v.id === vendorId) {
        return { ...v, location: newLocation };
      }
      return v;
    });

    if (user) {
      const targetVendor = updatedVendors.find(v => v.id === vendorId);
      if (targetVendor) {
        try {
          await setDoc(doc(db, "users", user.uid, "vendors", vendorId), cleanUndefined({ ...targetVendor, location: newLocation }), { merge: true });
        } catch (err) {
          handleFirestoreError(err, OperationType.WRITE, `users/${user.uid}/vendors/${vendorId}`);
        }
      }
    } else {
      setVendors(updatedVendors);
    }
  };

  // Register new vendor profile
  const handleRegisterVendor = async (name: string, cuisine: string, logo: string, location: string, pin: string, email: string, swishNumber: string, stallNumber?: string) => {
    const newVendorId = `v_${Date.now()}`;
    const newVendor: Vendor = {
      id: newVendorId,
      name: name.trim(),
      cuisine: cuisine.trim() || "Indian Street Food",
      logo: logo || "🍛",
      rating: 5.0,
      location: location.trim() || "Kungsträdgården East Lane",
      stallNumber: stallNumber?.trim() || `Stall #${vendors.length + 1}`,
      pin: pin.trim() || "1234",
      email: email.trim().toLowerCase(),
      swishNumber: swishNumber.trim() || "123 456 78 90",
      isApproved: false, // Default to pending approval
      menu: [
        {
          id: `m_${Date.now()}_s1`,
          name: "Signature Festival Bowl",
          description: "Fresh traditional specialty prepared on-the-spot for Namaste Stockholm visitors.",
          price: 120,
          category: "Food",
          imageUrl: "https://images.unsplash.com/photo-1601050690597-df056fb4ce78?w=500&auto=format&fit=crop&q=60",
          stock: true,
          extras: []
        }
      ]
    };

    const updatedVendors = [...vendors, newVendor];
    if (user) {
      try {
        await setDoc(doc(db, "users", user.uid, "vendors", newVendor.id), cleanUndefined(newVendor));
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, `users/${user.uid}/vendors/${newVendor.id}`);
      }
    } else {
      setVendors(updatedVendors);
    }

    logActivity(`New food stall registered: "${name}" (${cuisine}) - Pending organizer approval.`, "vendor", "warning");

    setLoggedInVendorId(newVendorId);
    setSelectedVendorForConsole(newVendorId);
    setNotification(`🎉 ${name} successfully registered! Waiting for Event Organizer Approval.`);
    
    // Reset registration form and verification states
    setNewVendorName("");
    setNewVendorCuisine("");
    setNewVendorLogo("🍛");
    setNewVendorLocation("");
    setNewVendorPin("");
    setNewVendorEmail("");
    setIsEmailVerified(false);
    setShowVerificationCodeInput(false);
    setEmailVerificationCode("");
    setEnteredVerificationCode("");
  };

  // Update vendor profile settings
  const handleUpdateVendorProfile = async (vendorId: string, updatedFields: Partial<Vendor>) => {
    const updatedVendors = vendors.map(v => v.id === vendorId ? { ...v, ...updatedFields } : v);
    if (user) {
      try {
        const vendorRef = doc(db, "users", user.uid, "vendors", vendorId);
        await updateDoc(vendorRef, cleanUndefined(updatedFields));
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, `users/${user.uid}/vendors/${vendorId}`);
      }
    } else {
      setVendors(updatedVendors);
    }
    setNotification("⚙️ Food stall profile updated successfully!");
    logActivity(`Food stall profile settings updated for "${selectedVendorObj?.name || vendorId}".`, "vendor", "success");
  };

  // Compound cart keys and helpers for Extras/Add-ons
  const parseCartKey = (key: string) => {
    const [itemId, extrasPart] = key.split("__");
    const extraIds = extrasPart ? extrasPart.split(",") : [];
    return { itemId, extraIds };
  };

  const getCartKey = (itemId: string, extraIds: string[]) => {
    if (extraIds.length === 0) return itemId;
    return `${itemId}__${[...extraIds].sort().join(",")}`;
  };

  const getItemQuantityInCart = (itemId: string) => {
    return Object.entries(customerCart).reduce((sum: number, [key, qty]) => {
      const { itemId: id } = parseCartKey(key);
      return id === itemId ? sum + (qty as number) : sum;
    }, 0);
  };

  // Attendee Cart Actions
  const activeVendorObj = vendors.find(v => v.id === activeVendorId && v.isApproved === true) || vendors.find(v => v.isApproved === true) || vendors[0];

  const addToCart = (itemId: string) => {
    // Validate if item in stock
    const item = activeVendorObj.menu.find(m => m.id === itemId);
    if (!item || !item.stock) return;

    if (item.extras && item.extras.length > 0) {
      // Open the customization overlay
      setCustomizingItem(item);
      setSelectedExtrasForCustomizing([]);
    } else {
      addToCartWithExtras(itemId, []);
    }
  };

  const addToCartWithExtras = (itemId: string, extraIds: string[]) => {
    const cartKey = getCartKey(itemId, extraIds);
    setCustomerCart(prev => ({
      ...prev,
      [cartKey]: (prev[cartKey] || 0) + 1
    }));
  };

  const removeFromCart = (itemId: string) => {
    setCustomerCart(prev => {
      // Find the first cartKey that belongs to this itemId
      const matchingKey = Object.keys(prev).find(k => parseCartKey(k).itemId === itemId);
      if (!matchingKey) return prev;

      const copy = { ...prev };
      if (copy[matchingKey] > 1) {
        copy[matchingKey] -= 1;
      } else {
        delete copy[matchingKey];
      }
      return copy;
    });
  };

  const clearCart = () => {
    setCustomerCart({});
  };

  const getCartTotal = () => {
    return Object.entries(customerCart).reduce((acc, [cartKey, qty]) => {
      const { itemId, extraIds } = parseCartKey(cartKey);
      const item = activeVendorObj.menu.find(m => m.id === itemId);
      if (!item) return acc;

      const extrasCost = (item.extras || [])
        .filter(ext => extraIds.includes(ext.id))
        .reduce((sum, ext) => sum + ext.price, 0);

      const quantity = qty as number;
      return acc + (item.price + extrasCost) * quantity;
    }, 0);
  };

  // Vendor actions for Extras / Add-ons management
  const addExtraOption = async (vendorId: string, itemId: string, name: string, price: number) => {
    if (!name.trim()) return;

    const newExtra = {
      id: `ext_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      name: name.trim(),
      price: Math.max(0, price)
    };

    const updatedVendors = vendors.map(v => {
      if (v.id === vendorId) {
        return {
          ...v,
          menu: v.menu.map(m => {
            if (m.id === itemId) {
              const currentExtras = m.extras || [];
              return { ...m, extras: [...currentExtras, newExtra] };
            }
            return m;
          })
        };
      }
      return v;
    });

    if (user) {
      const targetVendor = updatedVendors.find(v => v.id === vendorId);
      if (targetVendor) {
        try {
          await setDoc(doc(db, "users", user.uid, "vendors", vendorId), cleanUndefined(targetVendor));
        } catch (err) {
          handleFirestoreError(err, OperationType.WRITE, `users/${user.uid}/vendors/${vendorId}`);
        }
      }
    } else {
      setVendors(updatedVendors);
    }
  };

  const removeExtraOption = async (vendorId: string, itemId: string, extraId: string) => {
    const updatedVendors = vendors.map(v => {
      if (v.id === vendorId) {
        return {
          ...v,
          menu: v.menu.map(m => {
            if (m.id === itemId) {
              const currentExtras = m.extras || [];
              return { ...m, extras: currentExtras.filter(ext => ext.id !== extraId) };
            }
            return m;
          })
        };
      }
      return v;
    });

    if (user) {
      const targetVendor = updatedVendors.find(v => v.id === vendorId);
      if (targetVendor) {
        try {
          await setDoc(doc(db, "users", user.uid, "vendors", vendorId), cleanUndefined(targetVendor));
        } catch (err) {
          handleFirestoreError(err, OperationType.WRITE, `users/${user.uid}/vendors/${vendorId}`);
        }
      }
    } else {
      setVendors(updatedVendors);
    }
  };

  // Swish flow
  const triggerSwishCheckout = () => {
    if (Object.keys(customerCart).length === 0) return;
    setShowSwishFlow(true);
  };

  const confirmSwishPayment = async (
    finalCustomerName: string, 
    vendorSwishPaid: number, 
    platformSwishPaid: number,
    paymentMethodUsed: string = "Swish"
  ) => {
    if (Object.keys(customerCart).length === 0) return;

    // Create new order
    const newQueueNumber = orders.length > 0 ? Math.max(...orders.map(o => o.queueNumber)) + 1 : 101;
    const orderItems = Object.entries(customerCart).map(([cartKey, qty]) => {
      const { itemId, extraIds } = parseCartKey(cartKey);
      const item = activeVendorObj.menu.find(m => m.id === itemId)!;
      const selectedExtras = (item.extras || []).filter(ext => extraIds.includes(ext.id));
      return { 
        menuItem: item, 
        quantity: qty as number,
        selectedExtras: selectedExtras.length > 0 ? selectedExtras : undefined
      };
    });

    const finalCustName = finalCustomerName || customerName || "Guest User";
    const displayNameWithTable = activeTable 
      ? `${finalCustName} (Table ${activeTable})`
      : finalCustName;

    const newOrder: Order = {
      id: `ord_${Date.now()}`,
      vendorId: activeVendorId,
      vendorName: activeVendorObj.name,
      items: orderItems,
      status: "Placed",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      paymentMethod: (paymentMethodUsed as any) || "Swish",
      totalAmount: getCartTotal() + platformSwishPaid,
      queueNumber: newQueueNumber,
      customerName: displayNameWithTable,
      estimatedPrepTime: estimateVendorWaitTime(activeVendorId).minutes,
      vendorSwishPaid: vendorSwishPaid,
      platformSwishPaid: platformSwishPaid
    };

    // Clear client state immediately and synchronously to prevent race conditions or stale cart displays
    setCustomerCart({});
    setCurrentOrder(newOrder);
    setActiveCustomerTab("tracker");

    if (user) {
      try {
        await setDoc(doc(db, "users", user.uid, "orders", newOrder.id), cleanUndefined(newOrder));
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, `users/${user.uid}/orders/${newOrder.id}`);
      }
    } else {
      setOrders(prev => [newOrder, ...prev]);
    }
    
    setNotification(`🎉 Order #${newQueueNumber} placed! Split payout successfully processed via ${paymentMethodUsed}.`);
    logActivity(`${paymentMethodUsed} Split Payment Successful: Order #${newQueueNumber}. Vendor "${activeVendorObj.name}" received ${vendorSwishPaid.toFixed(2)} kr directly. Platform Fee ${platformSwishPaid.toFixed(2)} kr routed to VenueEat.`, "order", "success");
  };

  const handleSimulateScan = (tableNumber: string) => {
    // Select the vendor currently displayed in the console
    setActiveVendorId(selectedVendorForConsole);
    // Set the table number state
    setActiveTable(tableNumber);
    // Clear the existing cart
    setCustomerCart({});
    // Reset order status view if they were tracking a different order
    setCurrentOrder(null);
    // Switch to home tab to show menu
    setActiveCustomerTab("home");
    // Close the QR modal
    setShowQrModal(false);
    // Trigger notification
    const matchedVendor = vendors.find(v => v.id === selectedVendorForConsole);
    setNotification(`📱 Scanned Table ${tableNumber} QR! Opened menu for ${matchedVendor ? matchedVendor.name : "Vendor"}`);
  };

  const handleSimulateOrderSpike = async (vId: string) => {
    const targetVendor = vendors.find(v => v.id === vId);
    if (!targetVendor || targetVendor.menu.length === 0) return;

    // Pick 1 random menu item
    const randomItem = targetVendor.menu[Math.floor(Math.random() * targetVendor.menu.length)];
    const orderItems = [{
      menuItem: randomItem,
      quantity: Math.floor(Math.random() * 2) + 1, // 1 or 2
    }];

    const names = ["Nils", "Linnéa", "Kalle", "Astrid", "Björn", "Freja", "Sven", "Elin", "Gustav", "Malin", "Priya", "Arjun", "Zara"];
    const randomName = names[Math.floor(Math.random() * names.length)];
    const simulatedName = `${randomName}`;

    // Get sequential queue number
    const nextQueueNumber = orders.length > 0 
      ? Math.max(...orders.map(o => o.queueNumber)) + 1 
      : 101;

    const totalAmount = randomItem.price * orderItems[0].quantity;
    const simPlatformFee = Math.max(2.00, Math.round(totalAmount * 0.035 * 100) / 100);
    const simVendorShare = Math.max(0, Math.round((totalAmount - simPlatformFee) * 100) / 100);

    const newOrder: Order = {
      id: `ord_sim_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      vendorId: vId,
      vendorName: targetVendor.name,
      items: orderItems,
      status: "Placed",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      paymentMethod: "Swish",
      totalAmount: totalAmount,
      queueNumber: nextQueueNumber,
      customerName: simulatedName,
      estimatedPrepTime: estimateVendorWaitTime(vId).minutes,
      vendorSwishPaid: simVendorShare,
      platformSwishPaid: simPlatformFee
    };

    if (user) {
      try {
        await setDoc(doc(db, "users", user.uid, "orders", newOrder.id), cleanUndefined(newOrder));
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, `users/${user.uid}/orders/${newOrder.id}`);
      }
    } else {
      setOrders(prev => [newOrder, ...prev]);
    }

    setNotification(`⚡ Simulated split payout order (#${nextQueueNumber}) added to ${targetVendor.name}!`);
    logActivity(`[Simulation] Swish Split Payment Successful: Order #${nextQueueNumber}. Vendor "${targetVendor.name}" received ${simVendorShare.toFixed(2)} kr directly. Platform Fee ${simPlatformFee.toFixed(2)} kr routed to VenueEat.`, "order", "success");
  };

  const handleClearActiveOrders = async (vId: string) => {
    const activeOrdersToComplete = orders.filter(
      o => o.vendorId === vId && o.status !== "Completed"
    );

    if (activeOrdersToComplete.length === 0) return;

    if (user) {
      try {
        for (const order of activeOrdersToComplete) {
          await updateDoc(doc(db, "users", user.uid, "orders", order.id), { status: "Completed" });
        }
      } catch (err) {
        handleFirestoreError(err, OperationType.UPDATE, `users/${user.uid}/orders`);
      }
    } else {
      setOrders(prev => 
        prev.map(o => o.vendorId === vId && o.status !== "Completed" ? { ...o, status: "Completed" as OrderStatus } : o)
      );
    }
    setNotification(`✅ Completed all active orders in queue for this food station.`);
  };

  // Vendor Console stats
  const selectedVendorObj = vendors.find(v => v.id === selectedVendorForConsole) || vendors[0];
  const vendorOrders = orders.filter(o => o.vendorId === selectedVendorForConsole);
  const activeVendorOrders = vendorOrders.filter(o => o.status !== "Completed");
  const completedVendorOrders = vendorOrders.filter(o => o.status === "Completed");
  const totalVendorSales = completedVendorOrders.reduce((acc, o) => acc + o.totalAmount, 0);

  // Clean / Reset demo state
  const handleResetSimulator = async () => {
    if (user) {
      try {
        // Reset vendors to defaults in Firestore
        for (const vendor of DEFAULT_VENDORS) {
          await setDoc(doc(db, "users", user.uid, "vendors", vendor.id), cleanUndefined(vendor));
        }
        // Delete all orders in Firestore
        for (const order of orders) {
          await deleteDoc(doc(db, "users", user.uid, "orders", order.id));
        }
        setNotification("🔄 Cloud Firestore state reset to initial defaults.");
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, `users/${user.uid}`);
      }
    } else {
      setOrders([]);
      setCurrentOrder(null);
      setCustomerCart({});
      setVendors(DEFAULT_VENDORS);
      setNotification("🔄 Local Simulator reset to initial parameters.");
    }
  };

  // Admin Action: Approve / Revoke Vendor
  const handleApproveVendor = async (vendorId: string, approveState: boolean = true) => {
    const updatedVendors = vendors.map(v => v.id === vendorId ? { ...v, isApproved: approveState } : v);
    const vendorObj = vendors.find(v => v.id === vendorId);
    
    if (user) {
      try {
        await updateDoc(doc(db, "users", user.uid, "vendors", vendorId), { isApproved: approveState });
        // Local state will update via onSnapshot
      } catch (err) {
        handleFirestoreError(err, OperationType.UPDATE, `users/${user.uid}/vendors/${vendorId}`);
      }
    } else {
      setVendors(updatedVendors);
    }

    logActivity(
      `Organizer ${approveState ? "APPROVED" : "REVOKED approval for"} food stall "${vendorObj?.name || vendorId}"!`, 
      "admin", 
      approveState ? "success" : "warning"
    );
    setNotification(`👑 Stall ${vendorObj?.name || ""} ${approveState ? "approved and live" : "suspended"}.`);
  };

  // Admin Action: Reject Vendor Registration Submission
  const handleRejectVendor = async (vendorId: string) => {
    const updatedVendors = vendors.map(v => v.id === vendorId ? { ...v, isApproved: "rejected" } : v);
    const vendorObj = vendors.find(v => v.id === vendorId);
    
    if (user) {
      try {
        await updateDoc(doc(db, "users", user.uid, "vendors", vendorId), { isApproved: "rejected" });
        // Local state will update via onSnapshot
      } catch (err) {
        handleFirestoreError(err, OperationType.UPDATE, `users/${user.uid}/vendors/${vendorId}`);
      }
    } else {
      setVendors(updatedVendors);
    }

    logActivity(
      `Organizer REJECTED food stall registration for "${vendorObj?.name || vendorId}".`, 
      "admin", 
      "alert"
    );
    setNotification(`❌ Stall "${vendorObj?.name || ""}" registration rejected.`);
  };

  // Admin Action: Delete / Remove Vendor Completely
  const handleRemoveVendor = async (vendorId: string) => {
    const vendorObj = vendors.find(v => v.id === vendorId);
    
    if (user) {
      try {
        await deleteDoc(doc(db, "users", user.uid, "vendors", vendorId));
        // Local state will update via onSnapshot
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, `users/${user.uid}/vendors/${vendorId}`);
      }
    } else {
      setVendors(prev => prev.filter(v => v.id !== vendorId));
    }

    logActivity(`Organizer DELETED food stall "${vendorObj?.name || vendorId}" from festival registry.`, "admin", "alert");
    setNotification(`🗑️ Food stall "${vendorObj?.name || ""}" deleted completely.`);
  };

  // Admin Action: Quick Add Vendor
  const handleAdminAddVendor = async (name: string, cuisine: string, logo: string, location: string, pin: string, email: string, stallNumber?: string, swishNumber?: string) => {
    const newVendorId = `v_${Date.now()}`;
    const newVendor: Vendor = {
      id: newVendorId,
      name: name.trim(),
      cuisine: cuisine.trim() || "Street Food",
      logo: logo || "🍛",
      rating: 5.0,
      location: location.trim() || "Kungsträdgården Central Row",
      stallNumber: stallNumber?.trim() || `Stall #${vendors.length + 1}`,
      pin: pin.trim() || "1234",
      email: email.trim().toLowerCase(),
      swishNumber: swishNumber || "123 " + Math.floor(100 + Math.random() * 900) + " 88 99",
      isApproved: true, // Admin-created vendors are approved by default!
      menu: [
        {
          id: `m_${Date.now()}_s1`,
          name: "Festival Tasting Platter",
          description: "A combination of curated delicacies designed especially for Namaste Stockholm visitors.",
          price: 130,
          category: "Food",
          imageUrl: "https://images.unsplash.com/photo-1601050690597-df056fb4ce78?w=500&auto=format&fit=crop&q=60",
          stock: true,
          extras: []
        }
      ]
    };

    if (user) {
      try {
        await setDoc(doc(db, "users", user.uid, "vendors", newVendor.id), cleanUndefined(newVendor));
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, `users/${user.uid}/vendors/${newVendor.id}`);
      }
    } else {
      setVendors(prev => [...prev, newVendor]);
    }

    logActivity(`Organizer ADDED and APPROVED food stall: "${name}" (${cuisine}).`, "admin", "success");
    setNotification(`👑 Added and approved "${name}" successfully!`);
  };

  const renderAdminLoginGate = () => {
    return (
      <div className="space-y-6 py-4 animate-fadeIn text-left" id="admin-login-gate">
        <div className="space-y-2 text-center md:text-left">
          <div className="text-[10px] text-amber-400 font-mono font-bold uppercase tracking-wider flex items-center justify-center md:justify-start gap-1.5">
            <ShieldCheck className="w-4 h-4 text-amber-400 animate-pulse" />
            Organizer Master Authentication
          </div>
          <h2 className="font-display font-black text-2xl text-white">Event Admin Console</h2>
          <p className="text-xs text-zinc-400 max-w-md font-medium leading-relaxed">
            Access the master festival command center to approve/suspend food stalls, monitor live Swish transaction logs, and analyze Recharts performance metrics.
          </p>
        </div>

        {/* Login/Register Admin Tab Toggle */}
        <div className="flex bg-zinc-950 p-1 rounded-2xl border border-zinc-800 text-xs font-bold w-full sm:w-80">
          <button
            type="button"
            onClick={() => {
              setIsRegisteringNewAdmin(false);
              setAdminLoginError(null);
            }}
            className={`flex-1 py-2 rounded-xl transition-all cursor-pointer text-center font-bold ${
              !isRegisteringNewAdmin ? "bg-amber-500 text-white shadow-md border border-amber-400" : "text-zinc-400 hover:text-white font-medium"
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setIsRegisteringNewAdmin(true);
              setAdminLoginError(null);
            }}
            className={`flex-1 py-2 rounded-xl transition-all cursor-pointer text-center font-bold ${
              isRegisteringNewAdmin ? "bg-amber-500 text-white shadow-md border border-amber-400" : "text-zinc-400 hover:text-white font-medium"
            }`}
          >
            Register Admin
          </button>
        </div>

        {!isRegisteringNewAdmin ? (
          /* ADMIN SIGN IN FORM */
          <form 
            onSubmit={(e) => {
              e.preventDefault();
              setAdminLoginError(null);

              if (adminSignInMethod === "quick") {
                const selectedAdmin = admins.find(a => a.id === selectedAdminForConsole);
                if (!selectedAdmin) {
                  setAdminLoginError("Invalid organizer selected.");
                  return;
                }
                if (adminLoginPin === selectedAdmin.pin) {
                  setLoggedInAdminId(selectedAdmin.id);
                  setNotification(`👑 Welcome back, Master Admin ${selectedAdmin.name}! Control center unlocked.`);
                  logActivity(`Organizer "${selectedAdmin.name}" logged in via PIN access.`, "admin", "info");
                } else {
                  setAdminLoginError(`Incorrect security PIN for ${selectedAdmin.name}. Please try again!`);
                }
              } else {
                // Email Sign-In Path
                const selectedAdmin = admins.find(a => a.email.trim().toLowerCase() === adminSignInEmail.trim().toLowerCase());
                if (!selectedAdmin) {
                  setAdminLoginError(`No registered organizer found with email "${adminSignInEmail}". Please try registering a new account.`);
                  return;
                }
                if (!isAdminSignInEmailVerified) {
                  setAdminLoginError("Please click 'Send Code' and verify your email address first.");
                  return;
                }
                if (adminLoginPin === selectedAdmin.pin) {
                  setLoggedInAdminId(selectedAdmin.id);
                  setNotification(`👑 Welcome back, Master Admin ${selectedAdmin.name}! Verified Email access unlocked.`);
                  logActivity(`Organizer "${selectedAdmin.name}" logged in via secure verified email path.`, "admin", "info");
                } else {
                  setAdminLoginError(`Incorrect security PIN. Please check and try again.`);
                }
              }
            }}
            className="space-y-4"
          >
            {/* Sign In Method Selector */}
            <div className="flex bg-zinc-950 p-1 rounded-xl border border-zinc-900 gap-1">
              <button
                type="button"
                onClick={() => {
                  setAdminSignInMethod("quick");
                  setAdminLoginError(null);
                }}
                className={`flex-1 py-1.5 text-[10px] font-bold rounded-lg transition-all cursor-pointer ${
                  adminSignInMethod === "quick" ? "bg-zinc-900 text-amber-400 border border-amber-500/10 shadow-sm" : "text-zinc-500 hover:text-zinc-300"
                }`}
              >
                Quick PIN Access
              </button>
              <button
                type="button"
                onClick={() => {
                  setAdminSignInMethod("email");
                  setAdminLoginError(null);
                }}
                className={`flex-1 py-1.5 text-[10px] font-bold rounded-lg transition-all cursor-pointer ${
                  adminSignInMethod === "email" ? "bg-zinc-900 text-amber-400 border border-amber-500/10 shadow-sm" : "text-zinc-500 hover:text-zinc-300"
                }`}
              >
                Secure Email Log In
              </button>
            </div>

            {adminSignInMethod === "quick" ? (
              <>
                <div className="space-y-1.5 animate-fadeIn">
                  <label className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider font-mono">Select Organizer</label>
                  <select
                    value={selectedAdminForConsole}
                    onChange={(e) => {
                      setSelectedAdminForConsole(e.target.value);
                      setAdminLoginError(null);
                    }}
                    className="w-full bg-zinc-950 border-2 border-zinc-800 rounded-2xl px-4 py-3 text-sm font-bold text-white focus:outline-none focus:border-amber-500 cursor-pointer"
                  >
                    {admins.map(a => (
                      <option key={a.id} value={a.id}>👤 {a.name} ({a.email})</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5 animate-fadeIn">
                  <div className="flex justify-between items-center">
                    <label className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider font-mono">Organizer Master PIN</label>
                    <span className="text-[9px] text-zinc-500 font-mono">See PIN below if needed</span>
                  </div>
                  <input
                    type="password"
                    maxLength={4}
                    placeholder="Enter 4-digit PIN"
                    value={adminLoginPin}
                    onChange={(e) => setAdminLoginPin(e.target.value.replace(/\D/g, ''))}
                    className="w-full bg-zinc-950 border-2 border-zinc-800 rounded-2xl px-4 py-3 text-sm font-mono text-center tracking-widest text-amber-400 font-black focus:outline-none focus:border-amber-500"
                    required
                  />
                  <p className="text-[9px] text-zinc-500 font-medium">Default: Sandy (9999) or Lars (8888)</p>
                </div>
              </>
            ) : (
              /* Secure Email Auth Tab */
              <div className="space-y-3.5 animate-fadeIn">
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center flex-wrap gap-2">
                    <label className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider font-mono">Registered Admin Email</label>
                    {isAdminSignInEmailVerified ? (
                      <span className="text-[9px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-md font-bold uppercase tracking-wider flex items-center gap-1">
                        <Check className="w-2.5 h-2.5 text-emerald-500" /> Identity Verified
                      </span>
                    ) : (
                      <span className="text-[9px] bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded-md font-bold uppercase tracking-wider">
                        Unverified
                      </span>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <input
                      type="email"
                      placeholder="e.g., sandy@creativeventsnordic.com"
                      value={adminSignInEmail}
                      disabled={isAdminSignInEmailVerified}
                      onChange={(e) => {
                        setAdminSignInEmail(e.target.value);
                        setAdminLoginError(null);
                      }}
                      className="flex-1 bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-200 focus:outline-none focus:border-amber-500 font-bold disabled:opacity-60 disabled:cursor-not-allowed"
                      required
                    />
                    {!isAdminSignInEmailVerified && (
                      <button
                        type="button"
                        onClick={() => {
                          const matched = admins.find(a => a.email.trim().toLowerCase() === adminSignInEmail.trim().toLowerCase());
                          if (!matched) {
                            setAdminLoginError(`No registered organizer found with email "${adminSignInEmail}". Try registering a new account or sign in with PIN!`);
                            return;
                          }

                          const code = Math.floor(1000 + Math.random() * 9000).toString();
                          setAdminSignInSentCode(code);
                          setShowAdminSignInCodeInput(true);
                          setNotification(`✉️ Admin access code sent to ${adminSignInEmail}`);
                          setAdminVerificationNotification(`✉️ [SIMULATED EMAIL INBOX] A secure organizer login OTP has been sent to "${adminSignInEmail}". Code: ${code}`);
                        }}
                        className="bg-zinc-900 hover:bg-zinc-850 border border-zinc-850 text-zinc-200 hover:text-white font-bold text-[10px] px-3 py-2 rounded-xl transition-all cursor-pointer active:scale-95 uppercase tracking-wider"
                      >
                        {showAdminSignInCodeInput ? "Resend" : "Send Code"}
                      </button>
                    )}
                  </div>
                </div>

                {/* Simulated inbox notification */}
                {adminVerificationNotification && !isAdminSignInEmailVerified && (
                  <div className="bg-amber-500/10 border border-amber-500/20 p-3 rounded-xl text-[10.5px] text-amber-400 font-bold leading-relaxed flex items-start gap-2.5">
                    <Sparkles className="w-4 h-4 shrink-0 mt-0.5 animate-pulse text-amber-400" />
                    <span>{adminVerificationNotification}</span>
                  </div>
                )}

                {showAdminSignInCodeInput && !isAdminSignInEmailVerified && (
                  <div className="space-y-1.5 pt-1 border-t border-zinc-900 animate-fadeIn">
                    <label className="text-[9px] text-zinc-400 font-bold uppercase tracking-wider font-mono block text-left">Enter 4-Digit Admin OTP</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        maxLength={4}
                        placeholder="e.g., 1234"
                        value={adminSignInEnteredCode}
                        onChange={(e) => setAdminSignInEnteredCode(e.target.value.replace(/\D/g, ''))}
                        className="flex-1 bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs font-mono text-center tracking-widest text-zinc-200 focus:outline-none focus:border-amber-500 font-black"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          if (adminSignInEnteredCode === adminSignInSentCode) {
                            setIsAdminSignInEmailVerified(true);
                            setAdminVerificationNotification(null);
                            setNotification("✓ Identity verified! Enter PIN below to unlock console.");
                          } else {
                            setAdminLoginError("Invalid verification OTP. Please try again.");
                          }
                        }}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] px-4 py-2 rounded-xl transition-all cursor-pointer active:scale-95 uppercase tracking-wider"
                      >
                        Verify OTP
                      </button>
                    </div>
                  </div>
                )}

                {isAdminSignInEmailVerified && (
                  <div className="space-y-1.5 animate-fadeIn">
                    <label className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider font-mono">Enter Admin Master PIN</label>
                    <input
                      type="password"
                      maxLength={4}
                      placeholder="Enter 4-digit PIN"
                      value={adminLoginPin}
                      onChange={(e) => setAdminLoginPin(e.target.value.replace(/\D/g, ''))}
                      className="w-full bg-zinc-950 border-2 border-zinc-800 rounded-2xl px-4 py-3 text-sm font-mono text-center tracking-widest text-amber-400 font-black focus:outline-none focus:border-amber-500"
                      required
                    />
                  </div>
                )}
              </div>
            )}

            {adminLoginError && (
              <div className="p-3.5 bg-rose-500/10 border border-rose-500/20 rounded-2xl flex items-start gap-2.5 text-rose-400 text-xs font-bold leading-relaxed">
                <AlertCircle className="w-4.5 h-4.5 shrink-0 mt-0.5" />
                <span>{adminLoginError}</span>
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-amber-500 hover:bg-amber-600 active:scale-98 text-white font-display font-black py-3 rounded-2xl text-xs transition-all shadow-lg flex items-center justify-center gap-1.5 cursor-pointer uppercase tracking-wider border-b-2 border-amber-400 mt-2"
            >
              <LogIn className="w-4 h-4" />
              Unlock Admin Console
            </button>
          </form>
        ) : (
          /* REGISTER NEW ADMIN FORM */
          <form 
            onSubmit={(e) => {
              e.preventDefault();
              setAdminLoginError(null);
              if (!newAdminName.trim()) {
                setAdminLoginError("Organizer name is required.");
                return;
              }
              if (!isAdminEmailVerified) {
                setAdminLoginError("Please click 'Verify Email' and enter the simulated verification OTP first.");
                return;
              }
              if (!newAdminPin.trim() || newAdminPin.length < 4) {
                setAdminLoginError("Please choose a secure 4-digit master access PIN.");
                return;
              }

              const newId = `admin_${Date.now()}`;
              const registeredAdmin = {
                id: newId,
                name: newAdminName.trim(),
                email: newAdminEmail.trim().toLowerCase(),
                pin: newAdminPin.trim()
              };

              setAdmins(prev => [...prev, registeredAdmin]);
              setLoggedInAdminId(newId);
              setSelectedAdminForConsole(newId);
              
              // Log registration activity
              logActivity(`Registered NEW master organizer account for "${newAdminName.trim()}" (${newAdminEmail.trim().toLowerCase()}).`, "admin", "success");
              setNotification(`👑 Successfully registered and logged in as ${newAdminName.trim()}!`);

              // Reset registration state fields
              setNewAdminName("");
              setNewAdminEmail("");
              setNewAdminPin("");
              setIsAdminEmailVerified(false);
              setShowAdminVerificationCodeInput(false);
              setAdminVerificationNotification(null);
            }}
            className="space-y-4"
          >
            <div className="space-y-1.5">
              <label className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider font-mono">Organizer Full Name</label>
              <input
                type="text"
                placeholder="e.g., Lars Stockholm"
                value={newAdminName}
                onChange={(e) => setNewAdminName(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-850 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500 font-bold"
                required
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider font-mono">Organizer Email Address</label>
                {isAdminEmailVerified && (
                  <span className="text-[9px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-md font-bold uppercase">
                    Verified
                  </span>
                )}
              </div>
              <div className="flex gap-2">
                <input
                  type="email"
                  placeholder="e.g., lars@creativeventsnordic.com"
                  value={newAdminEmail}
                  disabled={isAdminEmailVerified}
                  onChange={(e) => {
                    setNewAdminEmail(e.target.value);
                    setAdminLoginError(null);
                  }}
                  className="flex-1 bg-zinc-950 border border-zinc-850 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500 font-bold disabled:opacity-50"
                  required
                />
                {!isAdminEmailVerified && (
                  <button
                    type="button"
                    onClick={() => {
                      if (!newAdminEmail.includes("@")) {
                        setAdminLoginError("Please enter a valid email address.");
                        return;
                      }
                      const code = Math.floor(1000 + Math.random() * 9000).toString();
                      setAdminEmailVerificationCode(code);
                      setShowAdminVerificationCodeInput(true);
                      setNotification(`✉️ Organizer registration OTP sent to ${newAdminEmail}`);
                      setAdminVerificationNotification(`✉️ [SIMULATED EMAIL INBOX] A secure organizer registration OTP was sent to "${newAdminEmail}". Verification code: ${code}`);
                    }}
                    className="bg-zinc-900 hover:bg-zinc-850 border border-zinc-850 text-zinc-200 hover:text-white font-bold text-[10px] px-3 py-2 rounded-xl transition-all cursor-pointer active:scale-95 uppercase tracking-wider"
                  >
                    {showAdminVerificationCodeInput ? "Resend" : "Verify Email"}
                  </button>
                )}
              </div>
            </div>

            {adminVerificationNotification && !isAdminEmailVerified && (
              <div className="bg-amber-500/10 border border-amber-500/20 p-3 rounded-xl text-[10.5px] text-amber-400 font-bold leading-relaxed flex items-start gap-2.5">
                <Sparkles className="w-4 h-4 shrink-0 mt-0.5 animate-pulse text-amber-400" />
                <span>{adminVerificationNotification}</span>
              </div>
            )}

            {showAdminVerificationCodeInput && !isAdminEmailVerified && (
              <div className="space-y-1.5 pt-1 border-t border-zinc-900 animate-fadeIn">
                <label className="text-[9px] text-zinc-400 font-bold uppercase tracking-wider font-mono block text-left">Enter 4-Digit Verification OTP</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    maxLength={4}
                    placeholder="e.g., 5555"
                    value={adminEnteredVerificationCode}
                    onChange={(e) => setAdminEnteredVerificationCode(e.target.value.replace(/\D/g, ''))}
                    className="flex-1 bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs font-mono text-center tracking-widest text-zinc-200 focus:outline-none focus:border-amber-500 font-black"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (adminEnteredVerificationCode === adminEmailVerificationCode) {
                        setIsAdminEmailVerified(true);
                        setAdminVerificationNotification(null);
                        setNotification("✓ Email verified! Choose a master PIN below to register.");
                      } else {
                        setAdminLoginError("Invalid registration code. Please check and try again.");
                      }
                    }}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] px-4 py-2 rounded-xl transition-all cursor-pointer active:scale-95 uppercase tracking-wider"
                  >
                    Confirm Code
                  </button>
                </div>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider font-mono">Create 4-Digit Organizer PIN</label>
              <input
                type="password"
                maxLength={4}
                placeholder="Choose a 4-digit PIN (e.g., 1234)"
                value={newAdminPin}
                onChange={(e) => setNewAdminPin(e.target.value.replace(/\D/g, ''))}
                className="w-full bg-zinc-950 border border-zinc-850 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500 font-mono tracking-widest text-center font-black"
                required
              />
            </div>

            {adminLoginError && (
              <div className="p-3.5 bg-rose-500/10 border border-rose-500/20 rounded-2xl flex items-start gap-2.5 text-rose-400 text-xs font-bold leading-relaxed">
                <AlertCircle className="w-4.5 h-4.5 shrink-0 mt-0.5" />
                <span>{adminLoginError}</span>
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-amber-500 hover:bg-amber-600 active:scale-98 text-white font-display font-black py-3 rounded-2xl text-xs transition-all shadow-lg flex items-center justify-center gap-1.5 cursor-pointer uppercase tracking-wider border-b-2 border-amber-400"
            >
              <Sparkles className="w-4 h-4 text-white" />
              Register Organizer Account
            </button>
          </form>
        )}
      </div>
    );
  };

  const renderEventAdminConsole = () => {
    // KPI Calculations
    const approvedCount = vendors.filter(v => v.isApproved === true).length;
    const pendingCount = vendors.filter(v => v.isApproved === false || v.isApproved === undefined).length;
    
    const completedOrders = orders.filter(o => o.status === "Completed");
    const totalSales = completedOrders.reduce((sum, o) => sum + o.totalAmount, 0);
    const totalOrdersCount = orders.length;

    // Direct account-to-account Swish split calculations
    const platformRevenue = completedOrders.reduce((sum, o) => {
      if (o.platformSwishPaid !== undefined) return sum + o.platformSwishPaid;
      // Fallback platform fee calculation (3.5% commission, min 2.00 SEK)
      const fee = Math.max(2.00, Math.round(o.totalAmount * 0.035 * 100) / 100);
      return sum + fee;
    }, 0);

    const vendorPayouts = completedOrders.reduce((sum, o) => {
      if (o.vendorSwishPaid !== undefined) return sum + o.vendorSwishPaid;
      // Fallback vendor payout calculation
      const fee = Math.max(2.00, Math.round(o.totalAmount * 0.035 * 100) / 100);
      return sum + (o.totalAmount - fee);
    }, 0);

    const currentAdmin = admins.find(a => a.id === loggedInAdminId) || admins[0];

    return (
      <div className="space-y-6 text-left animate-fadeIn">
        {/* Admin Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-zinc-800 pb-5">
          <div>
            <div className="text-[10px] text-amber-400 font-mono font-bold uppercase tracking-wider flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-amber-400 animate-pulse" />
              Namaste Stockholm Festival Control Center
            </div>
            <h2 className="font-display font-black text-2xl text-white mt-1">Event Organizer Admin</h2>
            <p className="text-xs text-zinc-400 font-medium">
              {currentAdmin?.name || "Sandy"} ({currentAdmin?.email || "sandy@creativeventsnordic.com"}) • Global Event Director
            </p>
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <button
              onClick={() => {
                setLoggedInAdminId(null);
                setNotification("🔒 Logged out from Event Admin Console.");
              }}
              className="flex-1 sm:flex-none text-[10px] uppercase tracking-wider font-bold bg-zinc-950 border border-zinc-850 hover:border-zinc-700 text-zinc-400 hover:text-white px-3.5 py-2.5 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 active:scale-95 shadow-sm"
              title="Log out from Admin session"
            >
              <LogOut className="w-3.5 h-3.5" />
              Sign Out
            </button>
            <button
              onClick={() => handleResetSimulator()}
              className="flex-1 sm:flex-none text-[10px] uppercase tracking-wider font-bold bg-zinc-950 border border-zinc-800 hover:border-red-500/30 hover:bg-red-500/5 text-zinc-400 hover:text-red-400 px-3.5 py-2.5 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 active:scale-95 shadow-sm"
              title="Reset festival database state"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset State
            </button>
          </div>
        </div>

        {/* KPI Dashboard Cards with Swish Split details */}
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3.5">
          <div className="bg-zinc-950 p-3.5 rounded-2xl border border-zinc-800/80 text-left">
            <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider block font-mono">Approved Stalls</span>
            <div className="text-lg font-mono font-black text-emerald-400 flex items-center gap-1.5 mt-0.5">
              <span className="inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
              {approvedCount}
            </div>
          </div>
          <div className="bg-zinc-950 p-3.5 rounded-2xl border border-zinc-800/80 text-left">
            <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider block font-mono">Pending Stalls</span>
            <div className={`text-lg font-mono font-black flex items-center gap-1.5 mt-0.5 ${pendingCount > 0 ? "text-amber-400 animate-pulse" : "text-zinc-500"}`}>
              {pendingCount > 0 ? (
                <span className="inline-flex h-2 w-2 rounded-full bg-amber-500 animate-ping"></span>
              ) : (
                <span className="inline-flex h-2 w-2 rounded-full bg-zinc-700"></span>
              )}
              {pendingCount}
            </div>
          </div>
          <div className="bg-zinc-950 p-3.5 rounded-2xl border border-zinc-850 text-left">
            <span className="text-[9px] text-zinc-400 font-bold uppercase tracking-wider block font-mono text-amber-500">VenueEat Platform Fee</span>
            <div className="text-lg font-mono font-black text-amber-400 mt-0.5">
              {platformRevenue.toFixed(2)} <span className="text-[10px] text-zinc-500 font-bold uppercase">kr</span>
            </div>
            <span className="text-[8px] text-zinc-500 block leading-tight">3.5% Direct Split Account</span>
          </div>
          <div className="bg-zinc-950 p-3.5 rounded-2xl border border-zinc-850 text-left">
            <span className="text-[9px] text-zinc-400 font-bold uppercase tracking-wider block font-mono text-emerald-500">Vendor Swish Payouts</span>
            <div className="text-lg font-mono font-black text-emerald-400 mt-0.5">
              {vendorPayouts.toFixed(2)} <span className="text-[10px] text-zinc-500 font-bold uppercase">kr</span>
            </div>
            <span className="text-[8px] text-zinc-500 block leading-tight">Direct Swish Settlement</span>
          </div>
          <div className="bg-zinc-950 p-3.5 rounded-2xl border border-zinc-800/80 text-left">
            <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider block font-mono">Completed Sales</span>
            <div className="text-lg font-mono font-black text-white mt-0.5">
              {totalSales} <span className="text-[10px] text-zinc-500 font-bold uppercase">kr</span>
            </div>
            <span className="text-[8px] text-zinc-500 block leading-tight">Gross festival trade</span>
          </div>
          <div className="bg-zinc-950 p-3.5 rounded-2xl border border-zinc-800/80 text-left">
            <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider block font-mono">Total Orders</span>
            <div className="text-lg font-mono font-black text-orange-400 mt-0.5">
              {totalOrdersCount}
            </div>
            <span className="text-[8px] text-zinc-500 block leading-tight">Simulated & user orders</span>
          </div>
        </div>

        {/* Sub-tabs switch */}
        <div className="flex bg-zinc-950 p-1 rounded-xl border border-zinc-800 text-xs font-bold gap-1 overflow-x-auto scrollbar-none">
          <button
            onClick={() => setAdminTab("vendors")}
            className={`flex-1 py-2 px-2.5 rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 whitespace-nowrap ${
              adminTab === "vendors" ? "bg-zinc-800 text-orange-400 border border-zinc-700 shadow-sm" : "text-zinc-500 hover:text-zinc-300"
            }`}
          >
            <Store className="w-3.5 h-3.5 shrink-0" />
            Food Stalls ({vendors.length})
          </button>
          <button
            onClick={() => setAdminTab("map")}
            className={`flex-1 py-2 px-2.5 rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 whitespace-nowrap ${
              adminTab === "map" ? "bg-zinc-800 text-orange-400 border border-zinc-700 shadow-sm" : "text-zinc-500 hover:text-zinc-300"
            }`}
          >
            <MapPin className="w-3.5 h-3.5 shrink-0" />
            Event Map Upload
          </button>
          <button
            onClick={() => setAdminTab("activity")}
            className={`flex-1 py-2 px-2.5 rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 whitespace-nowrap ${
              adminTab === "activity" ? "bg-zinc-800 text-orange-400 border border-zinc-700 shadow-sm" : "text-zinc-500 hover:text-zinc-300"
            }`}
          >
            <History className="w-3.5 h-3.5 shrink-0" />
            Audit Logs
          </button>
          <button
            onClick={() => setAdminTab("analytics")}
            className={`flex-1 py-2 px-2.5 rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 whitespace-nowrap ${
              adminTab === "analytics" ? "bg-zinc-800 text-orange-400 border border-zinc-700 shadow-sm" : "text-zinc-500 hover:text-zinc-300"
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5 shrink-0" />
            Live Insights
          </button>
        </div>

        {/* VENDORS TAB */}
        {adminTab === "vendors" && (
          <div className="space-y-5 animate-fadeIn">
            {/* Quick Register vendor widget */}
            <div className="bg-zinc-950 rounded-2xl border border-zinc-850 p-4 space-y-4">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-orange-500/10 rounded-lg text-orange-400">
                    <Plus className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-display font-black text-sm text-white uppercase tracking-tight">Direct Vendor Provisioning</h4>
                    <p className="text-[10px] text-zinc-500">Add and instantly approve a custom Stockholm food vendor</p>
                  </div>
                </div>
                <button
                  onClick={() => setAdminFormOpen(!adminFormOpen)}
                  className="text-[10px] font-black uppercase text-orange-400 hover:text-orange-300 transition-colors px-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded-xl cursor-pointer"
                >
                  {adminFormOpen ? "Close Form" : "Open Form"}
                </button>
              </div>

              {adminFormOpen && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 border-t border-zinc-900 pt-4 animate-fadeIn">
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-zinc-500 uppercase tracking-wider block font-mono">Stall Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Saffron Delights"
                      value={adminNewVendorName}
                      onChange={(e) => setAdminNewVendorName(e.target.value)}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs font-bold text-white focus:outline-none focus:border-orange-500"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-zinc-500 uppercase tracking-wider block font-mono">Cuisine Specialities</label>
                    <input
                      type="text"
                      placeholder="e.g. Punjabi Samosas & Chai"
                      value={adminNewVendorCuisine}
                      onChange={(e) => setAdminNewVendorCuisine(e.target.value)}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs font-bold text-white focus:outline-none focus:border-orange-500"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-zinc-500 uppercase tracking-wider block font-mono">Stall Logo (Emoji)</label>
                    <select
                      value={adminNewVendorLogo}
                      onChange={(e) => setAdminNewVendorLogo(e.target.value)}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs font-bold text-white focus:outline-none focus:border-orange-500 cursor-pointer"
                    >
                      <option value="🍛">🍛 Curry Bowl</option>
                      <option value="🫓">🫓 Naan Bread</option>
                      <option value="🍢">🍢 Tandoori Skewers</option>
                      <option value="🍵">🍵 Cutting Chai</option>
                      <option value="🥭">🥭 Mango Lassi</option>
                      <option value="🧁">🧁 Indian Sweets</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-zinc-500 uppercase tracking-wider block font-mono">Location Row</label>
                    <input
                      type="text"
                      placeholder="e.g. Central Fountain Row"
                      value={adminNewVendorLocation}
                      onChange={(e) => setAdminNewVendorLocation(e.target.value)}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs font-bold text-white focus:outline-none focus:border-orange-500"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-orange-400 uppercase tracking-wider block font-mono">Stall Number</label>
                    <input
                      type="text"
                      placeholder="e.g. Stall #05"
                      value={adminNewVendorStallNumber}
                      onChange={(e) => setAdminNewVendorStallNumber(e.target.value)}
                      className="w-full bg-zinc-900 border border-orange-500/40 rounded-xl px-3 py-2 text-xs font-bold text-white focus:outline-none focus:border-orange-500 font-mono"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-zinc-500 uppercase tracking-wider block font-mono">Security PIN (4 digits)</label>
                    <input
                      type="text"
                      maxLength={4}
                      placeholder="1234"
                      value={adminNewVendorPin}
                      onChange={(e) => setAdminNewVendorPin(e.target.value)}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs font-bold text-white focus:outline-none focus:border-orange-500 font-mono"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-zinc-500 uppercase tracking-wider block font-mono">Vendor Email Address</label>
                    <input
                      type="email"
                      placeholder="contact@stall.se"
                      value={adminNewVendorEmail}
                      onChange={(e) => setAdminNewVendorEmail(e.target.value)}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs font-bold text-white focus:outline-none focus:border-orange-500"
                    />
                  </div>
                  <div className="sm:col-span-2 pt-2">
                    <button
                      onClick={() => {
                        if (!adminNewVendorName.trim()) return;
                        handleAdminAddVendor(
                          adminNewVendorName,
                          adminNewVendorCuisine,
                          adminNewVendorLogo,
                          adminNewVendorLocation,
                          adminNewVendorPin || "1234",
                          adminNewVendorEmail || `info@${adminNewVendorName.toLowerCase().replace(/\s+/g, '')}.se`,
                          adminNewVendorStallNumber
                        );
                        // reset admin form fields
                        setAdminNewVendorName("");
                        setAdminNewVendorCuisine("");
                        setAdminNewVendorLocation("");
                        setAdminNewVendorStallNumber("");
                        setAdminNewVendorPin("");
                        setAdminNewVendorEmail("");
                        setAdminFormOpen(false);
                      }}
                      disabled={!adminNewVendorName.trim()}
                      className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:bg-zinc-800 disabled:text-zinc-500 active:scale-95 text-white font-display font-black py-2.5 rounded-xl text-xs transition-all shadow-md flex items-center justify-center gap-1 cursor-pointer uppercase tracking-wider"
                    >
                      <Plus className="w-4 h-4 shrink-0" />
                      Add & Approve Food Stall
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Vendor List */}
            <div className="space-y-4">
              {/* Category Sub-Tabs Selector */}
              <div className="flex flex-wrap items-center gap-2 border-b border-zinc-900 pb-3">
                <button
                  onClick={() => setAdminVendorSubTab("all")}
                  className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1.5 ${
                    adminVendorSubTab === "all"
                      ? "bg-zinc-850 text-white border border-zinc-700 font-bold"
                      : "bg-transparent text-zinc-500 hover:text-zinc-300 border border-transparent"
                  }`}
                >
                  All Stalls ({vendors.length})
                </button>
                <button
                  onClick={() => setAdminVendorSubTab("pending")}
                  className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1.5 ${
                    adminVendorSubTab === "pending"
                      ? "bg-amber-500/10 text-amber-400 border border-amber-500/30 font-bold animate-pulse"
                      : "bg-transparent text-zinc-500 hover:text-zinc-300 border border-transparent"
                  }`}
                >
                  <Clock className="w-3.5 h-3.5" />
                  Pending Requests ({vendors.filter(v => v.isApproved === false || v.isApproved === undefined).length})
                </button>
                <button
                  onClick={() => setAdminVendorSubTab("approved")}
                  className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1.5 ${
                    adminVendorSubTab === "approved"
                      ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-bold"
                      : "bg-transparent text-zinc-500 hover:text-zinc-300 border border-transparent"
                  }`}
                >
                  <CheckCircle className="w-3.5 h-3.5" />
                  Approved & Live ({vendors.filter(v => v.isApproved === true).length})
                </button>
                <button
                  onClick={() => setAdminVendorSubTab("rejected")}
                  className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1.5 ${
                    adminVendorSubTab === "rejected"
                      ? "bg-rose-500/10 text-rose-400 border border-rose-500/30 font-bold"
                      : "bg-transparent text-zinc-500 hover:text-zinc-300 border border-transparent"
                  }`}
                >
                  <XCircle className="w-3.5 h-3.5" />
                  Rejected Submissions ({vendors.filter(v => v.isApproved === "rejected").length})
                </button>
              </div>

              {(() => {
                // Filter vendors based on sub-tab
                const filteredVendors = vendors.filter((v) => {
                  if (adminVendorSubTab === "pending") return v.isApproved === false || v.isApproved === undefined;
                  if (adminVendorSubTab === "approved") return v.isApproved === true;
                  if (adminVendorSubTab === "rejected") return v.isApproved === "rejected";
                  return true;
                });

                if (filteredVendors.length === 0) {
                  let emptyMsg = "No food stalls found.";
                  if (adminVendorSubTab === "pending") emptyMsg = "No pending registration requests. All caught up!";
                  if (adminVendorSubTab === "approved") emptyMsg = "No approved and active food stalls found.";
                  if (adminVendorSubTab === "rejected") emptyMsg = "No rejected registration submissions found.";

                  return (
                    <div className="text-center py-10 text-zinc-500 font-medium text-xs bg-zinc-950 rounded-2xl border border-zinc-850">
                      {emptyMsg}
                    </div>
                  );
                }

                return (
                  <div className="grid grid-cols-1 gap-3">
                    {filteredVendors.map((vendor) => {
                      const isApproved = vendor.isApproved === true;
                      const isRejected = vendor.isApproved === "rejected";
                      const isPending = vendor.isApproved === false || vendor.isApproved === undefined;
                      const vendorOrdersList = orders.filter(o => o.vendorId === vendor.id);
                      const vendorSales = vendorOrdersList.filter(o => o.status === "Completed").reduce((s, o) => s + o.totalAmount, 0);

                      return (
                        <div key={vendor.id} className="bg-zinc-950 p-4 rounded-2xl border border-zinc-850 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:border-zinc-800 transition-all">
                          <div className="flex items-start gap-3 text-left">
                            <span className="text-3xl filter drop-shadow-sm mt-0.5 shrink-0">{vendor.logo}</span>
                            <div className="space-y-1">
                              <div className="flex items-center gap-2 flex-wrap">
                                <h5 className="font-display font-black text-sm text-white uppercase tracking-tight leading-tight">{vendor.name}</h5>
                                {vendor.stallNumber && (
                                  <span className="inline-flex px-2 py-0.5 rounded-md text-[9px] font-mono font-black uppercase border bg-orange-500/20 text-orange-400 border-orange-500/30">
                                    {vendor.stallNumber}
                                  </span>
                                )}
                                {isApproved && (
                                  <span className="inline-flex px-2 py-0.5 rounded-md text-[9px] font-black uppercase font-mono border bg-emerald-500/10 text-emerald-400 border-emerald-500/20">
                                    Approved & Live
                                  </span>
                                )}
                                {isPending && (
                                  <span className="inline-flex px-2 py-0.5 rounded-md text-[9px] font-black uppercase font-mono border bg-amber-500/10 text-amber-400 border-amber-500/20 animate-pulse">
                                    Pending Approval
                                  </span>
                                )}
                                {isRejected && (
                                  <span className="inline-flex px-2 py-0.5 rounded-md text-[9px] font-black uppercase font-mono border bg-rose-500/10 text-rose-400 border-rose-500/20">
                                    Rejected
                                  </span>
                                )}
                              </div>
                              <p className="text-[10px] text-zinc-400 font-bold font-mono">{vendor.cuisine}</p>
                              
                              {/* Metadata list */}
                              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] text-zinc-500 pt-1 font-medium">
                                <span className="flex items-center gap-0.5"><MapPin className="w-3 h-3 text-zinc-600" /> {vendor.location}</span>
                                <span className="flex items-center gap-0.5 text-zinc-500">PIN: <strong className="font-mono text-zinc-300 font-bold">{vendor.pin || "1234"}</strong></span>
                                <span className="text-zinc-500">{vendor.email}</span>
                                <span className="flex items-center gap-1 text-emerald-400 font-bold bg-emerald-500/5 px-1.5 py-0.5 rounded border border-emerald-500/10">Swish Payout: <strong className="font-mono text-emerald-300">{vendor.swishNumber || "123 456 78 90"}</strong></span>
                              </div>

                              {/* Sales & Orders metrics */}
                              <div className="flex items-center gap-3 pt-1 text-[10px] text-zinc-400">
                                <span>Orders: <strong className="font-mono text-white">{vendorOrdersList.length}</strong></span>
                                <span>Sales: <strong className="font-mono text-emerald-400">{vendorSales} kr</strong></span>
                              </div>
                            </div>
                          </div>

                          {/* Direct Controls */}
                          <div className="flex items-center gap-2 self-end sm:self-center">
                            {isApproved ? (
                              <button
                                onClick={() => handleApproveVendor(vendor.id, false)}
                                className="text-[10px] font-black uppercase text-zinc-400 hover:text-white bg-zinc-900 border border-zinc-800 hover:border-zinc-700 px-3 py-2 rounded-xl transition-all cursor-pointer active:scale-95"
                                title="Temporarily suspend stall and hide from guest maps"
                              >
                                Suspend
                              </button>
                            ) : (
                              <>
                                <button
                                  onClick={() => handleApproveVendor(vendor.id, true)}
                                  className="text-[10px] font-black uppercase text-white bg-emerald-600 hover:bg-emerald-500 border border-emerald-500/30 px-3 py-2 rounded-xl transition-all cursor-pointer active:scale-95 flex items-center gap-1"
                                  title="Approve vendor and broadcast live on client map"
                                >
                                  <Check className="w-3.5 h-3.5" />
                                  Approve
                                </button>
                                
                                {!isRejected && (
                                  <button
                                    onClick={() => handleRejectVendor(vendor.id)}
                                    className="text-[10px] font-black uppercase text-zinc-400 hover:text-rose-400 bg-zinc-900 border border-zinc-800 hover:border-rose-500/30 px-3 py-2 rounded-xl transition-all cursor-pointer active:scale-95 flex items-center gap-1"
                                    title="Reject vendor registration submission"
                                  >
                                    <X className="w-3.5 h-3.5" />
                                    Reject
                                  </button>
                                )}
                              </>
                            )}
                            <button
                              onClick={() => handleRemoveVendor(vendor.id)}
                              className="text-[10px] font-black uppercase text-red-400 hover:text-red-300 bg-zinc-900 border border-zinc-800 hover:border-red-500/30 p-2 rounded-xl transition-all cursor-pointer active:scale-95"
                              title="Delete vendor stall from system completely"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              })()}
            </div>
          </div>
        )}

        {/* EVENT MAP UPLOAD TAB */}
        {adminTab === "map" && (
          <div className="space-y-5 animate-fadeIn">
            <div className="bg-zinc-950 rounded-2xl border border-zinc-850 p-5 space-y-4">
              <div className="flex justify-between items-start flex-wrap gap-3">
                <div>
                  <div className="text-[10px] text-orange-400 font-mono font-bold uppercase tracking-wider flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5" /> Event Organizer Map Manager
                  </div>
                  <h4 className="font-display font-black text-lg text-white mt-1">
                    Upload Festival Venue Blueprint
                  </h4>
                  <p className="text-xs text-zinc-400 font-medium">
                    Upload an architectural blueprint, satellite overlay, or custom venue diagram. Attendees will see this background map with live food stall pin locations and stall numbers.
                  </p>
                </div>

                {activeEvent.mapImageUrl && (
                  <button
                    onClick={() => handleUpdateEventMap(activeEventId, "")}
                    className="text-[10px] font-mono font-bold text-rose-400 hover:text-rose-300 bg-rose-500/10 border border-rose-500/20 px-3 py-1.5 rounded-xl transition-all cursor-pointer"
                  >
                    Reset Map
                  </button>
                )}
              </div>

              {/* Map Upload & Preset Options */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Upload File / Custom URL */}
                <div className="space-y-3 bg-zinc-900/80 p-4 rounded-xl border border-zinc-800">
                  <label className="text-xs font-bold text-zinc-300 block uppercase font-mono tracking-wider">
                    Upload Custom Map Image
                  </label>
                  
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onload = (uploadEv) => {
                          if (uploadEv.target?.result) {
                            handleUpdateEventMap(activeEventId, uploadEv.target.result as string);
                          }
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                    className="text-xs text-zinc-400 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-mono file:font-bold file:bg-orange-500 file:text-white hover:file:bg-orange-600 cursor-pointer w-full"
                  />

                  <div className="flex items-center gap-2 pt-1">
                    <span className="text-[10px] font-mono font-bold text-zinc-500 uppercase">OR Image URL:</span>
                    <input
                      type="url"
                      placeholder="https://..."
                      value={activeEvent.mapImageUrl || ""}
                      onChange={(e) => handleUpdateEventMap(activeEventId, e.target.value)}
                      className="flex-1 bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-1.5 text-xs text-white font-mono focus:outline-none focus:border-orange-500"
                    />
                  </div>
                </div>

                {/* Preset Maps Gallery */}
                <div className="space-y-2 bg-zinc-900/80 p-4 rounded-xl border border-zinc-800">
                  <label className="text-xs font-bold text-zinc-300 block uppercase font-mono tracking-wider">
                    Or Choose Venue Layout Preset
                  </label>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <button
                      onClick={() => handleUpdateEventMap(activeEventId, "https://images.unsplash.com/photo-1511578314322-379afb476865?w=1000&auto=format&fit=crop&q=80")}
                      className="p-2.5 rounded-xl bg-zinc-950 hover:bg-zinc-800 border border-zinc-800 hover:border-orange-500/50 text-left transition-all cursor-pointer group"
                    >
                      <div className="font-bold text-white text-[11px] group-hover:text-orange-400">Park Festival Plaza</div>
                      <div className="text-[9px] text-zinc-500 font-mono">Kungsträdgården Lawn</div>
                    </button>
                    <button
                      onClick={() => handleUpdateEventMap(activeEventId, "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1000&auto=format&fit=crop&q=80")}
                      className="p-2.5 rounded-xl bg-zinc-950 hover:bg-zinc-800 border border-zinc-800 hover:border-orange-500/50 text-left transition-all cursor-pointer group"
                    >
                      <div className="font-bold text-white text-[11px] group-hover:text-orange-400">Night Market Alley</div>
                      <div className="text-[9px] text-zinc-500 font-mono">Street Food Row</div>
                    </button>
                  </div>
                </div>
              </div>

              {/* Live Preview of Map for Admin */}
              {(() => {
                const approvedStallsList = vendors.filter(v => v.isApproved === true);
                return (
                  <div className="space-y-2 pt-2">
                    <div className="flex justify-between items-center text-xs font-mono font-bold text-zinc-400">
                      <span className="uppercase">Live Client Map Broadcast Preview</span>
                      <span className="text-emerald-400 flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                        {approvedStallsList.length} Approved Stalls Positioned
                      </span>
                    </div>
                    <div className="rounded-2xl overflow-hidden border border-zinc-800 shadow-xl bg-zinc-950">
                      <EventMap
                        vendors={approvedStallsList}
                        activeVendorId={activeVendorId}
                        onSelectVendor={(id) => setActiveVendorId(id)}
                        mapImageUrl={activeEvent.mapImageUrl}
                        estimateWaitTime={estimateVendorWaitTime}
                      />
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>
        )}

        {/* AUDIT LOG TAB */}
        {adminTab === "activity" && (
          <div className="space-y-4 animate-fadeIn">
            <div className="flex items-center justify-between">
              <h4 className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider font-mono">Live Festival Audit Trail ({activityLogs.length})</h4>
              <button
                onClick={() => setActivityLogs([])}
                className="text-[9px] uppercase font-bold text-zinc-500 hover:text-white transition-colors"
              >
                Clear History
              </button>
            </div>

            <div className="bg-zinc-950 border border-zinc-850 rounded-2xl overflow-hidden">
              <div className="p-2 border-b border-zinc-900 flex justify-between items-center text-xs text-zinc-500 font-bold font-mono bg-zinc-950/50">
                <span className="pl-2">LOG MESSAGE STREAM</span>
                <span className="pr-2">REAL-TIME TIME STAMP</span>
              </div>
              <div className="divide-y divide-zinc-900 max-h-[360px] overflow-y-auto scrollbar-thin scrollbar-thumb-zinc-800 pr-1 text-xs">
                {activityLogs.length === 0 ? (
                  <div className="text-center py-12 text-zinc-600 font-medium italic">
                    Log stream empty. Trigger actions on stalls to populate logs!
                  </div>
                ) : (
                  activityLogs.map((log) => {
                    // Decide color scheme
                    const typeColor = 
                      log.type === "success" ? "text-emerald-400 border-emerald-500/10 bg-emerald-500/5" :
                      log.type === "warning" ? "text-amber-400 border-amber-500/10 bg-amber-500/5" :
                      log.type === "alert" ? "text-red-400 border-red-500/10 bg-red-500/5" :
                      "text-sky-400 border-sky-500/10 bg-sky-500/5";

                    const badgeText = log.category.toUpperCase();

                    return (
                      <div key={log.id} className="p-3 hover:bg-zinc-900/40 transition-colors flex justify-between items-start gap-4">
                        <div className="flex items-start gap-2.5 text-left">
                          <span className={`inline-flex px-1.5 py-0.5 rounded text-[8px] font-black uppercase font-mono tracking-wider shrink-0 border ${typeColor}`}>
                            {badgeText}
                          </span>
                          <span className="text-zinc-300 leading-normal font-medium">{log.message}</span>
                        </div>
                        <span className="text-[10px] text-zinc-500 font-mono font-bold shrink-0 pt-0.5">{log.timestamp}</span>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
            
            {/* Live simulator tip */}
            <p className="text-[10px] text-zinc-500 text-center font-bold font-mono leading-normal">
              💡 TIP: Trigger client-side checkout orders or toggle kitchen statuses to see live events streaming here instantly!
            </p>
          </div>
        )}

        {/* ANALYTICS TAB */}
        {adminTab === "analytics" && (
          <div className="space-y-5 animate-fadeIn">
            {/* Rich Recharts Analytics Component */}
            <AdminSalesCharts orders={orders} vendors={vendors} />

            {/* Event Diagnostics and wait times */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-zinc-950 p-4 rounded-2xl border border-zinc-850 text-left space-y-2">
                <h5 className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider font-mono">Attendee Flow Density</h5>
                <p className="text-xs text-zinc-300 font-medium">
                  Average active order backlog is currently <strong className="text-orange-400 font-mono">{(orders.filter(o => o.status !== "Completed").length / Math.max(vendors.length, 1)).toFixed(1)} orders</strong> per station.
                </p>
                <div className="text-[10px] text-zinc-500 leading-normal">
                  The automatic load-balanced algorithm is redistributing queue times smoothly to minimize customer Swedish summer heat fatigue.
                </div>
              </div>

              <div className="bg-zinc-950 p-4 rounded-2xl border border-zinc-850 text-left space-y-2">
                <h5 className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider font-mono">Kitchen Speed Performance</h5>
                <div className="space-y-1.5 pt-1">
                  <div className="flex justify-between text-[10px] font-bold">
                    <span className="text-zinc-500">Avg Preparation Speed:</span>
                    <span className="text-zinc-300 font-mono">~3.5m / order</span>
                  </div>
                  <div className="flex justify-between text-[10px] font-bold">
                    <span className="text-zinc-500">Order Fulfilment Rate:</span>
                    <span className="text-emerald-400 font-mono">
                      {totalOrdersCount > 0 
                        ? `${Math.round((orders.filter(o => o.status === "Completed").length / totalOrdersCount) * 100)}%` 
                        : "100%"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderAttendeeFullWebApp = () => {
    const approvedStalls = vendors.filter(v => v.isApproved !== "rejected");
    const cartItemKeys = Object.keys(customerCart);
    const totalCartCount = Object.values(customerCart).reduce((sum: number, qty) => sum + (Number(qty) || 0), 0);

    // Filter menu items for selected active vendor
    const currentMenu = activeVendorObj.menu || [];
    const filteredMenu = currentMenu.filter(item => {
      const matchesSearch = attendeeSearchQuery === "" || 
        item.name.toLowerCase().includes(attendeeSearchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(attendeeSearchQuery.toLowerCase()) ||
        (item.tags && item.tags.some(t => t.toLowerCase().includes(attendeeSearchQuery.toLowerCase())));

      if (!matchesSearch) return false;

      if (selectedCategory === "all") return true;
      if (selectedCategory === "mains") return !item.tags?.includes("Drink") && !item.tags?.includes("Sides") && !item.tags?.includes("Dessert");
      if (selectedCategory === "drinks") return item.tags?.includes("Drink") || item.name.toLowerCase().includes("soda") || item.name.toLowerCase().includes("water") || item.name.toLowerCase().includes("beer");
      if (selectedCategory === "vegan") return item.tags?.some(t => t.toLowerCase().includes("vegan") || t.toLowerCase().includes("veg"));
      
      return true;
    });

    return (
      <div className="bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950 p-4 md:p-8 rounded-3xl border-4 border-zinc-800 shadow-2xl flex flex-col items-center justify-center relative animate-fadeIn overflow-hidden">
        {/* Ambient Glows */}
        <div className="absolute -top-32 -left-32 w-80 h-80 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 -right-32 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Top Info Header */}
        <div className="w-full max-w-[420px] flex justify-between items-center mb-3 text-xs text-zinc-400 font-mono z-10 px-2">
          <div className="flex items-center gap-2">
            <Smartphone className="w-4 h-4 text-orange-400" />
            <span className="font-bold text-white uppercase tracking-wider text-[11px]">Attendee Mobile App</span>
          </div>
          <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2.5 py-0.5 rounded-full text-[10px] font-bold">
            PWA Mobile Layout
          </span>
        </div>

        {/* SMARTPHONE DEVICE FRAME */}
        <div className="w-full max-w-[420px] bg-zinc-950 rounded-[44px] p-3 border-[6px] border-zinc-800 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9)] relative flex flex-col justify-between z-10 overflow-hidden h-[780px]">
          
          {/* Top Speaker & Notch */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 bg-zinc-950 w-28 h-5 rounded-b-xl z-50 flex items-center justify-center">
            <div className="w-10 h-1 bg-zinc-800 rounded-full mb-0.5" />
          </div>

          {/* Mobile Status Bar */}
          <div className="flex justify-between items-center px-5 pt-2 pb-1 text-[10px] font-mono font-bold text-zinc-400 z-40 select-none bg-zinc-900/90 border-b border-zinc-800/80 rounded-t-[36px] shrink-0">
            <span>09:41</span>
            <div className="flex items-center gap-1.5">
              <span className="text-[9px] text-orange-400 font-semibold">Kungsträdgården</span>
              <div className="w-5 h-2.5 border border-zinc-600 rounded-xs p-0.5 flex items-center">
                <div className="bg-emerald-500 h-full w-3.5 rounded-2xs" />
              </div>
            </div>
          </div>

          {/* INNER MOBILE SCREEN VIEWPORT */}
          <div className="flex-1 bg-zinc-50 rounded-b-[32px] overflow-hidden flex flex-col justify-between text-zinc-900 relative z-10">
            
            {/* Table QR Generator Modal */}
            <TableQrGenerator
              vendor={activeVendorObj}
              isOpen={showQrModal}
              onClose={() => setShowQrModal(false)}
              onSimulateScan={handleSimulateScan}
            />

            {/* Swish Payment Modal */}
            <SwishPaymentGateway
              isOpen={showSwishFlow}
              onClose={() => setShowSwishFlow(false)}
              amount={getCartTotal()}
              vendorName={activeVendorObj.name}
              vendorSwishNumber={activeVendorObj.swishNumber || "123 918 27 36"}
              customerName={customerName}
              onCustomerNameChange={setCustomerName}
              onPaymentSuccess={confirmSwishPayment}
              nextQueueNumber={orders.length > 0 ? Math.max(...orders.map(o => o.queueNumber)) + 1 : 101}
            />

            {/* Customization Overlay */}
            {customizingItem && (
              <div className="fixed inset-0 bg-zinc-950/70 z-50 flex items-center justify-center p-4 animate-fadeIn">
                <div className="bg-white text-zinc-900 rounded-3xl p-5 max-w-xs w-full space-y-3 shadow-2xl animate-scaleUp border-2 border-zinc-200">
                  <div className="flex justify-between items-start border-b border-zinc-100 pb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{customizingItem.image}</span>
                      <div>
                        <h4 className="font-display font-black text-sm text-zinc-900">{customizingItem.name}</h4>
                        <span className="font-mono font-bold text-xs text-orange-600">{customizingItem.price} kr</span>
                      </div>
                    </div>
                    <button
                      onClick={() => { setCustomizingItem(null); setSelectedExtrasForCustomizing([]); }}
                      className="p-1 rounded-xl hover:bg-zinc-100 text-zinc-400 hover:text-zinc-700 transition-all cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  {customizingItem.extras && customizingItem.extras.length > 0 && (
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-mono font-bold uppercase text-zinc-500 block">Select Optional Extras</label>
                      <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                        {customizingItem.extras.map(extra => {
                          const isSelected = selectedExtrasForCustomizing.includes(extra.id);
                          return (
                            <button
                              key={extra.id}
                              onClick={() => {
                                if (isSelected) {
                                  setSelectedExtrasForCustomizing(prev => prev.filter(id => id !== extra.id));
                                } else {
                                  setSelectedExtrasForCustomizing(prev => [...prev, extra.id]);
                                }
                              }}
                              className={`w-full p-2.5 rounded-xl border-2 flex justify-between items-center text-xs transition-all cursor-pointer ${
                                isSelected ? "bg-orange-50 border-orange-500 text-orange-950 font-bold" : "bg-zinc-50 border-zinc-200 text-zinc-700 hover:bg-zinc-100"
                              }`}
                            >
                              <span className="flex items-center gap-1.5 text-[11px]">
                                <span className={`w-3.5 h-3.5 rounded-md border flex items-center justify-center text-[9px] ${isSelected ? "bg-orange-500 text-white border-orange-500" : "border-zinc-300"}`}>
                                  {isSelected && "✓"}
                                </span>
                                {extra.name}
                              </span>
                              <span className="font-mono font-black text-[11px] text-zinc-900">+{extra.price} kr</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  <div className="pt-2 flex gap-2">
                    <button
                      onClick={() => { setCustomizingItem(null); setSelectedExtrasForCustomizing([]); }}
                      className="flex-1 py-2 rounded-xl border border-zinc-200 text-xs font-bold text-zinc-600 hover:bg-zinc-50 cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => {
                        addToCartWithExtras(customizingItem.id, selectedExtrasForCustomizing);
                        setCustomizingItem(null);
                        setSelectedExtrasForCustomizing([]);
                      }}
                      className="flex-1 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-display font-black text-xs cursor-pointer shadow-md uppercase tracking-wider"
                    >
                      Add to Cart
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Mobile Web App Top Header */}
            <div className="bg-gradient-to-r from-zinc-950 via-zinc-900 to-zinc-950 text-white p-3 border-b border-zinc-800 flex items-center justify-between gap-2 shadow-md shrink-0">
              <div className="flex items-center gap-2 overflow-hidden">
                <span className="text-2xl p-1 bg-zinc-800 rounded-xl border border-zinc-700 shrink-0">{activeVendorObj.logo}</span>
                <div className="truncate text-left">
                  <div className="flex items-center gap-1.5">
                    <h3 className="font-display font-black text-sm text-white truncate">{activeVendorObj.name}</h3>
                    {activeTable && (
                      <span className="bg-emerald-950 text-emerald-400 border border-emerald-500/40 text-[9px] font-mono font-bold px-1.5 py-0.2 rounded-md shrink-0">
                        T#{activeTable}
                      </span>
                    )}
                  </div>
                  <p className="text-[10px] text-zinc-400 font-medium truncate">100% Swish Mobile Order & Ticket</p>
                </div>
              </div>

              <button
                onClick={() => setShowQrModal(true)}
                className="p-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white text-[10px] font-bold border border-zinc-700 cursor-pointer flex items-center gap-1 shrink-0"
                title="Table QR Code"
              >
                <QrCode className="w-3.5 h-3.5 text-orange-400" />
                <span className="text-[10px] font-mono font-bold">QR</span>
              </button>
            </div>

            {/* SCROLLABLE MAIN CONTENT AREA */}
            <div className="flex-1 overflow-y-auto p-3 space-y-3 pb-24 scrollbar-none text-left">
              {activeCustomerTab === "home" && (
                <div className="space-y-3">
                  
                  {/* PROMINENT ALL VENDORS DIRECTORY GRID (EASILY SEEN, NO SCROLLING NEEDED) */}
                  <div className="bg-white rounded-2xl p-2.5 border border-zinc-200/80 shadow-2xs space-y-2">
                    <div className="flex justify-between items-center px-1">
                      <div className="flex items-center gap-1.5">
                        <Store className="w-3.5 h-3.5 text-orange-500" />
                        <span className="font-display font-black text-xs text-zinc-900 uppercase tracking-wide">
                          Festival Food Stalls
                        </span>
                        <span className="bg-orange-100 text-orange-800 text-[9px] font-mono font-bold px-1.5 py-0.2 rounded-md">
                          {approvedStalls.length}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 bg-zinc-100 p-0.5 rounded-lg border border-zinc-200">
                        <button
                          onClick={() => setVendorViewStyle("grid")}
                          className={`px-1.5 py-0.5 text-[9px] font-bold rounded-md transition-all cursor-pointer ${
                            vendorViewStyle === "grid" ? "bg-white text-zinc-900 shadow-2xs" : "text-zinc-500 hover:text-zinc-800"
                          }`}
                        >
                          Grid
                        </button>
                        <button
                          onClick={() => setVendorViewStyle("pills")}
                          className={`px-1.5 py-0.5 text-[9px] font-bold rounded-md transition-all cursor-pointer ${
                            vendorViewStyle === "pills" ? "bg-white text-zinc-900 shadow-2xs" : "text-zinc-500 hover:text-zinc-800"
                          }`}
                        >
                          Bar
                        </button>
                      </div>
                    </div>

                    {/* VENDOR SELECTION GRID (2x2 GRID - ALL 4 STALLS VISIBLE INSTANTLY) */}
                    {vendorViewStyle === "grid" ? (
                      <div className="grid grid-cols-2 gap-1.5">
                        {approvedStalls.map((v) => {
                          const isSelected = v.id === activeVendorId;
                          const waitInfo = estimateVendorWaitTime(v.id);
                          
                          // Determine short cuisine tag based on name/items
                          const cuisineTag = 
                            v.name.toLowerCase().includes("smash") || v.name.toLowerCase().includes("burger") ? "Burgers & Fries" :
                            v.name.toLowerCase().includes("taco") || v.name.toLowerCase().includes("churro") ? "Tacos & Churros" :
                            v.name.toLowerCase().includes("bowl") || v.name.toLowerCase().includes("green") ? "Salads & Vegan" :
                            v.name.toLowerCase().includes("gelato") || v.name.toLowerCase().includes("ice") ? "Gelato & Sweets" :
                            "Food Stall";

                          return (
                            <button
                              key={v.id}
                              onClick={() => setActiveVendorId(v.id)}
                              className={`p-2 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between gap-1 relative overflow-hidden ${
                                isSelected
                                  ? "bg-gradient-to-br from-orange-500 to-amber-600 text-white border-orange-600 shadow-md ring-2 ring-orange-400/50"
                                  : "bg-zinc-50 hover:bg-orange-50/60 text-zinc-800 border-zinc-200 hover:border-orange-300"
                              }`}
                            >
                              <div className="flex justify-between items-start">
                                <span className={`text-2xl p-1 rounded-lg ${isSelected ? "bg-white/20" : "bg-white border border-zinc-200 shadow-2xs"}`}>
                                  {v.logo}
                                </span>
                                {isSelected ? (
                                  <span className="bg-white text-orange-600 text-[8px] font-mono font-black px-1.5 py-0.5 rounded-full uppercase tracking-wider shadow-2xs">
                                    Active Menu
                                  </span>
                                ) : (
                                  <span className="text-[9px] font-mono font-bold text-zinc-500 bg-zinc-200/80 px-1.5 py-0.5 rounded-md">
                                    ⏱️ {waitInfo.minutes}m
                                  </span>
                                )}
                              </div>

                              <div>
                                <span className={`font-display font-black text-[11px] leading-tight block truncate ${isSelected ? "text-white" : "text-zinc-900"}`}>
                                  {v.name}
                                </span>
                                <span className={`text-[9px] font-medium block truncate ${isSelected ? "text-orange-100" : "text-zinc-500"}`}>
                                  {cuisineTag}
                                </span>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    ) : (
                      /* HORIZONTAL PILL CAROUSEL ALTERNATIVE */
                      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                        {approvedStalls.map((v) => {
                          const isSelected = v.id === activeVendorId;
                          const waitInfo = estimateVendorWaitTime(v.id);
                          return (
                            <button
                              key={v.id}
                              onClick={() => setActiveVendorId(v.id)}
                              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                                isSelected
                                  ? "bg-orange-500 text-white border-orange-600 shadow-sm font-bold"
                                  : "bg-white hover:bg-zinc-100 text-zinc-700 border-zinc-200"
                              }`}
                            >
                              <span className="text-base">{v.logo}</span>
                              <div className="text-left leading-tight">
                                <span className="text-[11px] font-black block">{v.name}</span>
                                <span className={`text-[9px] font-mono block ${isSelected ? "text-orange-100" : "opacity-75"}`}>{waitInfo.minutes}m wait</span>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* ACTIVE VENDOR BANNER & SEARCH/FILTER CONTROL */}
                  <div className="bg-white rounded-2xl border border-zinc-200 p-2.5 space-y-2.5 shadow-2xs">
                    <div className="flex justify-between items-center border-b border-zinc-100 pb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl p-1 bg-orange-50 rounded-xl border border-orange-100">{activeVendorObj.logo}</span>
                        <div>
                          <h3 className="font-display font-black text-xs text-zinc-900 leading-tight">
                            {activeVendorObj.name}
                          </h3>
                          <p className="text-[10px] text-zinc-500 font-medium">
                            {activeVendorObj.menu.length} delicious items available
                          </p>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-[9px] font-mono font-bold px-2 py-0.5 rounded-full inline-block">
                          ⚡ ~3m avg prep
                        </span>
                      </div>
                    </div>

                    {/* SEARCH & CATEGORY FILTER PILLS */}
                    <div className="space-y-1.5">
                      {/* Search Bar */}
                      <div className="relative">
                        <input
                          type="text"
                          placeholder={`Search ${activeVendorObj.name} menu...`}
                          value={attendeeSearchQuery}
                          onChange={(e) => setAttendeeSearchQuery(e.target.value)}
                          className="w-full bg-zinc-50 border border-zinc-200 rounded-xl pl-8 pr-8 py-1.5 text-xs text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:border-orange-500 font-medium"
                        />
                        <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-400 text-xs">🔍</span>
                        {attendeeSearchQuery && (
                          <button
                            onClick={() => setAttendeeSearchQuery("")}
                            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-700 text-xs"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>

                      {/* Category Quick Tags */}
                      <div className="flex items-center gap-1 overflow-x-auto pb-0.5 scrollbar-none">
                        {[
                          { id: "all", label: "All Items" },
                          { id: "mains", label: "🍔 Mains" },
                          { id: "drinks", label: "🥤 Drinks" },
                          { id: "vegan", label: "🌱 Veg / Vegan" }
                        ].map((cat) => (
                          <button
                            key={cat.id}
                            onClick={() => setSelectedCategory(cat.id)}
                            className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                              selectedCategory === cat.id
                                ? "bg-zinc-900 text-white shadow-2xs"
                                : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200 border border-zinc-200/60"
                            }`}
                          >
                            {cat.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* COMPACT HIGH-DENSITY MENU ITEM ROWS (EASY TO FOLLOW, minimal scrolling needed) */}
                  <div className="space-y-1.5">
                    {filteredMenu.length === 0 ? (
                      <div className="bg-white rounded-2xl border border-zinc-200 p-6 text-center space-y-1 text-zinc-500">
                        <p className="text-xs font-bold">No menu items match "{attendeeSearchQuery}"</p>
                        <button
                          onClick={() => { setAttendeeSearchQuery(""); setSelectedCategory("all"); }}
                          className="text-[10px] text-orange-600 font-bold hover:underline cursor-pointer"
                        >
                          Reset filters
                        </button>
                      </div>
                    ) : (
                      filteredMenu.map((item) => {
                        const cartCount = Object.entries(customerCart)
                          .filter(([k]) => parseCartKey(k).itemId === item.id)
                          .reduce((s, [, q]) => s + (Number(q) || 0), 0);
                        const isSoldOut = item.isSoldOut;

                        return (
                          <div
                            key={item.id}
                            className={`bg-white rounded-xl border p-2 flex items-center justify-between gap-2 transition-all shadow-2xs ${
                              isSoldOut ? "border-zinc-200 opacity-60" : "border-zinc-200/80 hover:border-orange-400"
                            }`}
                          >
                            {/* Left: Thumbnail & Details */}
                            <div className="flex items-center gap-2 overflow-hidden flex-1">
                              <span className="text-2xl p-1.5 bg-orange-50/70 rounded-xl border border-orange-100/80 shrink-0">
                                {item.image}
                              </span>
                              <div className="truncate space-y-0.5">
                                <div className="flex items-center gap-1.5 truncate">
                                  <h4 className="font-display font-black text-[11px] text-zinc-900 truncate leading-tight">
                                    {item.name}
                                  </h4>
                                  {item.tags && item.tags.length > 0 && (
                                    <span className="text-[8px] font-mono font-bold bg-orange-100/70 text-orange-800 px-1 py-0.1 rounded shrink-0">
                                      {item.tags[0]}
                                    </span>
                                  )}
                                </div>
                                <p className="text-[10px] text-zinc-500 truncate leading-tight">
                                  {item.description}
                                </p>
                              </div>
                            </div>

                            {/* Right: Price & Add Action */}
                            <div className="flex items-center gap-2 shrink-0">
                              <span className="font-mono font-black text-xs text-zinc-900">
                                {item.price} kr
                              </span>

                              {isSoldOut ? (
                                <span className="text-[9px] font-mono font-bold text-rose-600 bg-rose-50 px-2 py-1 rounded-lg">
                                  Sold
                                </span>
                              ) : cartCount > 0 ? (
                                <div className="flex items-center bg-orange-50 border border-orange-300 rounded-lg p-0.5">
                                  <button
                                    onClick={() => removeFromCart(item.id)}
                                    className="w-5 h-5 rounded bg-white text-orange-600 flex items-center justify-center font-bold hover:bg-orange-100 cursor-pointer shadow-2xs"
                                  >
                                    <Minus className="w-3 h-3" />
                                  </button>
                                  <span className="font-mono font-black text-[11px] text-orange-950 px-1.5">
                                    {cartCount}
                                  </span>
                                  <button
                                    onClick={() => addToCart(item.id)}
                                    className="w-5 h-5 rounded bg-orange-500 text-white flex items-center justify-center font-bold hover:bg-orange-600 cursor-pointer shadow-2xs"
                                  >
                                    <Plus className="w-3 h-3" />
                                  </button>
                                </div>
                              ) : (
                                <button
                                  onClick={() => {
                                    if (item.extras && item.extras.length > 0) {
                                      setCustomizingItem(item);
                                      setSelectedExtrasForCustomizing([]);
                                    } else {
                                      addToCart(item.id);
                                    }
                                  }}
                                  className="py-1 px-2.5 rounded-lg bg-orange-500 hover:bg-orange-600 active:scale-95 text-white font-display font-black text-[10px] transition-all shadow-2xs flex items-center gap-0.5 cursor-pointer uppercase tracking-wider shrink-0"
                                >
                                  <Plus className="w-3 h-3 stroke-[3px]" />
                                  <span>Add</span>
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              )}

              {activeCustomerTab === "map" && (
                <EventMap
                  vendors={approvedStalls}
                  activeVendorId={activeVendorId}
                  onSelectVendor={(id) => {
                    setActiveVendorId(id);
                    setActiveCustomerTab("home");
                  }}
                  onBackToMenu={() => setActiveCustomerTab("home")}
                  mapImageUrl={activeEvent.mapImageUrl}
                  estimateWaitTime={estimateVendorWaitTime}
                />
              )}

              {activeCustomerTab === "tracker" && (
                <div className="space-y-3">
                  {currentOrder ? (
                    <div className="bg-white border-2 border-zinc-200 rounded-2xl p-4 space-y-3 shadow-xs">
                      <OrderStatusTracker
                        order={currentOrder}
                        getAcceleratedCountdown={getAcceleratedCountdown}
                      />
                    </div>
                  ) : (
                    <div className="py-10 text-center space-y-2 bg-white rounded-2xl border-2 border-dashed border-zinc-200 p-4">
                      <Ticket className="w-8 h-8 mx-auto text-zinc-400" />
                      <p className="text-xs font-bold text-zinc-600">No active ticket right now.</p>
                      <button
                        onClick={() => setActiveCustomerTab("home")}
                        className="text-[11px] text-orange-600 font-bold hover:underline cursor-pointer"
                      >
                        Browse menu & order via Swish
                      </button>
                    </div>
                  )}
                </div>
              )}

              {activeCustomerTab === "history" && (
                <div className="space-y-3">
                  <h3 className="font-display font-black text-sm text-zinc-950 flex items-center gap-1.5">
                    <History className="w-4 h-4 text-orange-500" />
                    Festival Order Receipts
                  </h3>
                  {orders.length === 0 ? (
                    <p className="text-xs text-zinc-500 italic py-4">No past orders recorded yet.</p>
                  ) : (
                    orders.map((o) => (
                      <div key={o.id} className="bg-white p-3 rounded-2xl border border-zinc-200 space-y-1.5 text-xs shadow-2xs">
                        <div className="flex justify-between items-center font-bold">
                          <span className="font-mono text-orange-600">#AQ-{o.queueNumber}</span>
                          <span className="text-[10px] text-zinc-500">{new Date(o.timestamp).toLocaleTimeString()}</span>
                        </div>
                        <div className="space-y-0.5 text-[11px]">
                          {o.items.map((it, idx) => (
                            <div key={idx} className="flex justify-between text-zinc-700">
                              <span>{it.menuItem.name} x{it.quantity}</span>
                              <span className="font-mono font-bold">{it.menuItem.price * it.quantity} kr</span>
                            </div>
                          ))}
                        </div>
                        <div className="border-t border-zinc-150 pt-1 flex justify-between font-mono font-black text-xs text-zinc-900">
                          <span>Swish Paid:</span>
                          <span>{o.totalAmount} SEK</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {activeCustomerTab === "support" && (
                <SupportChat
                  type="customer"
                  vendorName={activeVendorObj.name}
                  customerName={customerName}
                />
              )}
            </div>

            {/* Floating Mobile Checkout Bar (Right above bottom tab bar) */}
            {cartItemKeys.length > 0 && activeCustomerTab === "home" && (
              <div className="absolute bottom-14 left-2.5 right-2.5 bg-zinc-950 text-white p-2.5 rounded-2xl shadow-2xl border-2 border-orange-500/60 flex items-center justify-between gap-2 z-40 animate-slideUp">
                <div className="flex items-center gap-2">
                  <div className="bg-orange-500 text-white p-2 rounded-xl relative">
                    <ShoppingBag className="w-4 h-4" />
                    <span className="absolute -top-1.5 -right-1.5 bg-white text-orange-600 text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center shadow-xs">
                      {totalCartCount}
                    </span>
                  </div>
                  <div className="leading-tight">
                    <span className="text-[8px] text-zinc-400 uppercase font-mono font-bold block">Total</span>
                    <span className="font-mono font-black text-xs text-white">{getCartTotal()} SEK</span>
                  </div>
                </div>

                <button
                  onClick={() => setShowSwishFlow(true)}
                  className="bg-orange-500 hover:bg-orange-600 active:scale-95 text-white px-3.5 py-2 rounded-xl font-display font-black text-xs transition-all shadow-md flex items-center gap-1 cursor-pointer uppercase tracking-wider"
                >
                  <span>Swish Pay</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* NATIVE MOBILE BOTTOM TAB BAR */}
            <div className="bg-white/95 backdrop-blur-md border-t border-zinc-200 py-1.5 px-2 flex justify-around items-center text-[10px] font-bold text-zinc-500 z-30 shrink-0">
              <button
                onClick={() => setActiveCustomerTab("home")}
                className={`flex flex-col items-center gap-0.5 px-2 py-0.5 rounded-xl transition-all cursor-pointer ${
                  activeCustomerTab === "home" ? "text-orange-600 font-black" : "text-zinc-500 hover:text-zinc-800"
                }`}
              >
                <Utensils className="w-4 h-4" />
                <span className="text-[9px]">Menu</span>
              </button>

              <button
                onClick={() => setActiveCustomerTab("map")}
                className={`flex flex-col items-center gap-0.5 px-2 py-0.5 rounded-xl transition-all cursor-pointer ${
                  activeCustomerTab === "map" ? "text-orange-600 font-black" : "text-zinc-500 hover:text-zinc-800"
                }`}
              >
                <Map className="w-4 h-4" />
                <span className="text-[9px]">Map</span>
              </button>

              <button
                onClick={() => setActiveCustomerTab("tracker")}
                className={`flex flex-col items-center gap-0.5 px-2 py-0.5 rounded-xl transition-all cursor-pointer relative ${
                  activeCustomerTab === "tracker" ? "text-orange-600 font-black" : "text-zinc-500 hover:text-zinc-800"
                }`}
              >
                <Ticket className="w-4 h-4" />
                <span className="text-[9px]">Ticket</span>
                {currentOrder && currentOrder.status !== "Completed" && (
                  <span className="w-2 h-2 bg-emerald-500 rounded-full animate-ping absolute top-0.5 right-1" />
                )}
              </button>

              <button
                onClick={() => setActiveCustomerTab("history")}
                className={`flex flex-col items-center gap-0.5 px-2 py-0.5 rounded-xl transition-all cursor-pointer ${
                  activeCustomerTab === "history" ? "text-orange-600 font-black" : "text-zinc-500 hover:text-zinc-800"
                }`}
              >
                <History className="w-4 h-4" />
                <span className="text-[9px]">Receipts</span>
              </button>

              <button
                onClick={() => setActiveCustomerTab("support")}
                className={`flex flex-col items-center gap-0.5 px-2 py-0.5 rounded-xl transition-all cursor-pointer ${
                  activeCustomerTab === "support" ? "text-orange-600 font-black" : "text-zinc-500 hover:text-zinc-800"
                }`}
              >
                <MessageSquare className="w-4 h-4" />
                <span className="text-[9px]">AI Help</span>
              </button>
            </div>

            {/* iOS Home Bar Line */}
            <div className="bg-zinc-100 pb-1 pt-0.5 flex justify-center shrink-0">
              <div className="w-28 h-1 bg-zinc-400/70 rounded-full" />
            </div>

          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-8" id="app-simulator">
      
      {/* Banner controller */}
      <div className="bg-white rounded-3xl p-6 border-2 border-zinc-200 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-orange-100 rounded-2xl text-orange-600 border border-orange-200 shadow-sm shrink-0">
            <Store className="w-6 h-6" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="font-display font-black text-zinc-900 text-base md:text-lg italic">Real-time Dual Simulation</h3>
              {user ? (
                <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-200 shadow-xs uppercase font-mono animate-pulse">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" /> Cloud Synced
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-700 text-[10px] font-bold px-2 py-0.5 rounded-full border border-amber-200 shadow-xs uppercase font-mono">
                  <CloudLightning className="w-3.5 h-3.5 text-amber-500" /> Local Offline Mode
                </span>
              )}
            </div>
            <p className="text-xs text-zinc-500 font-medium">
              {user 
                ? `Welcome, ${user.displayName}! All your vendor stock updates, menu pricing, and orders are stored securely in Cloud Firestore in real time.`
                : "Interact with the Attendee App (left) and see changes instantly push to the Vendor Dashboard (right). Sign in to activate persistent database sync!"
              }
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 w-full md:w-auto">
          {!user && (
            <button
              onClick={handleSignIn}
              className="flex-1 md:flex-none flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-2xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold transition-all shadow-md shadow-orange-500/10 cursor-pointer active:scale-95"
            >
              <LogIn className="w-4 h-4" />
              Sign In to Sync
            </button>
          )}
          <button 
            onClick={handleResetSimulator}
            className="flex-1 md:flex-none flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-2xl border-2 border-zinc-200 text-xs font-bold text-zinc-600 hover:text-zinc-950 hover:bg-zinc-50 hover:border-zinc-300 transition-all cursor-pointer active:scale-95"
          >
            <RotateCcw className="w-4 h-4" />
            Reset Data
          </button>
        </div>
      </div>

      {/* Synchronized Notification Bubble */}
      {notification && (
        <div className="bg-zinc-900 border-4 border-zinc-800 text-orange-400 font-display text-xs md:text-sm px-5 py-4 rounded-3xl flex items-center gap-3 shadow-xl animate-bounce max-w-xl mx-auto font-bold border-t-orange-400">
          <Bell className="w-5 h-5 text-orange-500 animate-pulse shrink-0" />
          <span className="flex-1">{notification}</span>
        </div>
      )}

      {/* PORTAL VIEW LAYOUT MODE SELECTOR */}
      <div className="bg-zinc-900 text-white rounded-3xl p-4 md:p-5 border-4 border-zinc-800 shadow-xl flex flex-col lg:flex-row justify-between items-center gap-4 text-left">
        <div className="flex items-center gap-3">
          <div className="bg-orange-500 text-white p-2.5 rounded-2xl shadow-md shrink-0">
            <Monitor className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-display font-black text-sm md:text-base text-white tracking-tight">
                Select Web App Portal Mode
              </h3>
              <span className="bg-orange-500/20 text-orange-400 border border-orange-500/30 text-[9px] font-mono font-bold px-2 py-0.5 rounded-full uppercase">
                {viewLayoutMode === "split" ? "Dual Simulator" : "Full Web App"}
              </span>
            </div>
            <p className="text-xs text-zinc-400 font-medium">
              Choose a dedicated full-width Web App portal or use the side-by-side interactive simulator.
            </p>
          </div>
        </div>

        <div className="flex bg-zinc-950 p-1.5 rounded-2xl border border-zinc-800 text-xs font-bold w-full lg:w-auto overflow-x-auto gap-1">
          <button
            onClick={() => setViewLayoutMode("attendee")}
            className={`px-3.5 py-2 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 whitespace-nowrap ${
              viewLayoutMode === "attendee"
                ? "bg-orange-500 text-white font-black shadow-md"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            <Smartphone className="w-4 h-4" />
            <span>Attendee App</span>
          </button>

          <button
            onClick={() => setViewLayoutMode("vendor")}
            className={`px-3.5 py-2 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 whitespace-nowrap ${
              viewLayoutMode === "vendor"
                ? "bg-orange-500 text-white font-black shadow-md"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            <Store className="w-4 h-4" />
            <span>Vendor Kitchen</span>
          </button>

          <button
            onClick={() => setViewLayoutMode("admin")}
            className={`px-3.5 py-2 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 whitespace-nowrap ${
              viewLayoutMode === "admin"
                ? "bg-orange-500 text-white font-black shadow-md"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Event Admin</span>
          </button>

          <button
            onClick={() => setViewLayoutMode("superadmin")}
            className={`px-3.5 py-2 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 whitespace-nowrap ${
              viewLayoutMode === "superadmin"
                ? "bg-purple-600 text-white font-black shadow-md"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>Super Admin</span>
          </button>

          <button
            onClick={() => setViewLayoutMode("split")}
            className={`px-3.5 py-2 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 whitespace-nowrap ${
              viewLayoutMode === "split"
                ? "bg-zinc-800 text-zinc-100 font-black border border-zinc-700 shadow-md"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            <Columns className="w-4 h-4" />
            <span>Dual View</span>
          </button>
        </div>
      </div>

      {/* RENDER DEDICATED FULL-WIDTH WEB APP PORTALS OR DUAL VIEW */}
      {viewLayoutMode === "attendee" ? (
        renderAttendeeFullWebApp()
      ) : viewLayoutMode === "vendor" || viewLayoutMode === "admin" || viewLayoutMode === "superadmin" ? (
        <div className="bg-zinc-900 text-white rounded-3xl p-6 md:p-8 border-4 border-zinc-800 shadow-xl space-y-6 text-left animate-fadeIn">
          {viewLayoutMode === "superadmin" ? (
            <SuperAdminConsole
              events={managedEvents}
              activeEventId={activeEventId}
              onSelectActiveEvent={handleSelectActiveEvent}
              onAddNewEvent={handleAddNewEvent}
              onUpdateEventStatus={handleUpdateEventStatus}
            />
          ) : viewLayoutMode === "admin" ? (
            loggedInAdminId ? (
              renderEventAdminConsole()
            ) : (
              renderAdminLoginGate()
            )
          ) : loggedInVendorId ? (
            <div className="space-y-6">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-zinc-800 pb-5">
                <div className="flex items-center gap-3">
                  <span className="text-3xl p-2.5 bg-zinc-800 rounded-2xl border border-zinc-700">{selectedVendorObj.logo}</span>
                  <div>
                    <h3 className="font-display font-black text-xl text-white">{selectedVendorObj.name} Kitchen Portal</h3>
                    <p className="text-xs text-zinc-400 font-medium">100% Real-time Order Stream & Menu Controls</p>
                  </div>
                </div>
                <button
                  onClick={() => setLoggedInVendorId(null)}
                  className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-bold border border-zinc-700 cursor-pointer"
                >
                  Log Out Stall
                </button>
              </div>

              <div className="flex bg-zinc-950 p-1.5 rounded-2xl border border-zinc-800 text-xs font-bold overflow-x-auto gap-1">
                <button
                  onClick={() => setVendorRoleTab("live_orders")}
                  className={`flex-1 py-2.5 px-4 rounded-xl transition-all cursor-pointer whitespace-nowrap ${
                    vendorRoleTab === "live_orders" ? "bg-orange-500 text-white font-black" : "text-zinc-400 hover:text-white"
                  }`}
                >
                  Live Orders Queue
                </button>
                <button
                  onClick={() => setVendorRoleTab("menu_management")}
                  className={`flex-1 py-2.5 px-4 rounded-xl transition-all cursor-pointer whitespace-nowrap ${
                    vendorRoleTab === "menu_management" ? "bg-orange-500 text-white font-black" : "text-zinc-400 hover:text-white"
                  }`}
                >
                  Stock & Pricing
                </button>
                <button
                  onClick={() => setVendorRoleTab("analytics")}
                  className={`flex-1 py-2.5 px-4 rounded-xl transition-all cursor-pointer whitespace-nowrap ${
                    vendorRoleTab === "analytics" ? "bg-orange-500 text-white font-black" : "text-zinc-400 hover:text-white"
                  }`}
                >
                  Analytics & Revenue
                </button>
                <button
                  onClick={() => setVendorRoleTab("settings")}
                  className={`flex-1 py-2.5 px-4 rounded-xl transition-all cursor-pointer whitespace-nowrap ${
                    vendorRoleTab === "settings" ? "bg-orange-500 text-white font-black" : "text-zinc-400 hover:text-white"
                  }`}
                >
                  Swish & Profile
                </button>
              </div>

              {vendorRoleTab === "analytics" ? (
                <VendorAnalytics vendor={selectedVendorObj} orders={vendorOrders} />
              ) : vendorRoleTab === "settings" ? (
                <VendorSettings vendor={selectedVendorObj} onUpdateVendorProfile={handleUpdateVendorProfile} />
              ) : vendorRoleTab === "support" ? (
                <SupportChat type="vendor" vendorName={selectedVendorObj.name} />
              ) : (
                <div className="space-y-4">
                  <h4 className="font-display font-black text-sm text-white uppercase tracking-wider font-mono">
                    Active Kitchen Orders ({vendorOrders.length})
                  </h4>
                  {vendorOrders.length === 0 ? (
                    <p className="text-xs text-zinc-500 italic py-6">No incoming orders right now. Switch to Attendee view to place a test order!</p>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {vendorOrders.map(o => (
                        <div key={o.id} className="bg-zinc-950 p-4 rounded-2xl border border-zinc-800 space-y-3">
                          <div className="flex justify-between items-center">
                            <span className="font-mono font-black text-orange-400 text-base">#AQ-{o.queueNumber}</span>
                            <span className="text-[10px] bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full font-bold">{o.status}</span>
                          </div>
                          <div className="space-y-1 text-xs">
                            {o.items.map((it, idx) => (
                              <div key={idx} className="flex justify-between text-zinc-300">
                                <span>{it.menuItem.name} x{it.quantity}</span>
                                <span className="font-mono font-bold text-white">{it.menuItem.price * it.quantity} kr</span>
                              </div>
                            ))}
                          </div>
                          <div className="border-t border-zinc-800 pt-2 flex justify-between items-center text-xs">
                            <span className="text-zinc-400 font-medium">Customer: {o.customerName || "Guest"}</span>
                            <span className="font-mono font-black text-emerald-400">{o.totalAmount} SEK</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4 text-left py-4">
              <h2 className="font-display font-black text-2xl text-white">Vendor Partner Portal</h2>
              <p className="text-xs text-zinc-400">Select your food stall to log in to the kitchen terminal:</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 pt-2">
                {vendors.map(v => (
                  <button
                    key={v.id}
                    onClick={() => {
                      setLoggedInVendorId(v.id);
                      setSelectedVendorForConsole(v.id);
                      setNotification(`👨‍🍳 Switched to ${v.name} Kitchen Console.`);
                    }}
                    className="p-4 rounded-2xl bg-zinc-950 hover:bg-orange-600/20 hover:border-orange-500 text-white text-xs font-bold transition-all border border-zinc-800 cursor-pointer flex flex-col items-start gap-2 group"
                  >
                    <span className="text-3xl group-hover:scale-110 transition-transform">{v.logo}</span>
                    <div>
                      <span className="font-black text-sm block text-left">{v.name}</span>
                      <span className="text-[10px] text-zinc-400 font-mono block text-left">{v.cuisine}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        /* DUAL SIMULATOR VIEW MODE */
        <div className="space-y-8 animate-fadeIn">
          {/* Main Dual Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* LEFT COLUMN: Attendee Smartphone Mockup (5 columns) */}
        <div className="lg:col-span-5 flex justify-center">
          <div className="w-full max-w-[340px] aspect-[9/19] bg-zinc-950 rounded-[44px] p-3.5 border-4 border-zinc-800 shadow-2xl relative overflow-hidden flex flex-col justify-between">
            {/* Phone Speaker & Notch */}
            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 bg-zinc-950 w-28 h-6 rounded-b-2xl z-50 flex items-center justify-center">
              <div className="w-12 h-1 bg-zinc-800 rounded-full mb-1"></div>
            </div>

            {/* Simulated Status Bar */}
              <div className="flex justify-between items-center px-4 pt-1 pb-1.5 text-[10px] font-mono text-zinc-400 z-40 select-none">
                <span>09:41</span>
                <div className="flex items-center gap-1.5">
                  <span>5G (Kungsträdgården)</span>
                  <div className="w-5 h-2.5 border border-zinc-700 rounded-sm p-0.5 flex items-center">
                    <div className="bg-emerald-500 h-full w-4 rounded-xs"></div>
                  </div>
                </div>
              </div>

            {/* PHONE INNER CANVAS */}
            <div className="flex-1 bg-zinc-50 rounded-[28px] overflow-hidden flex flex-col justify-between text-zinc-800 relative z-10 pt-2 pb-3">
              
              {/* Conditional Swish Popup Frame */}
              <SwishPaymentGateway
                isOpen={showSwishFlow}
                onClose={() => setShowSwishFlow(false)}
                amount={getCartTotal()}
                vendorName={activeVendorObj.name}
                vendorSwishNumber={activeVendorObj.swishNumber || "123 918 27 36"}
                customerName={customerName}
                onCustomerNameChange={setCustomerName}
                onPaymentSuccess={confirmSwishPayment}
                nextQueueNumber={orders.length > 0 ? Math.max(...orders.map(o => o.queueNumber)) + 1 : 101}
              />

              {/* Inside Phone Content */}
              <div className="flex-1 flex flex-col justify-between overflow-hidden">
                {activeCustomerTab === "tracker" ? (
                  // ATTENDEE TRACKER SCREEN
                  <div className="flex-1 flex flex-col justify-between px-4 pt-1.5 overflow-hidden animate-fadeIn">
                    {/* Tracker Header */}
                    <div className="flex justify-between items-center border-b border-zinc-200/60 pb-2">
                      <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" /> Live Ticket
                      </span>
                      <button
                        onClick={() => setActiveCustomerTab("home")}
                        className="text-[10px] text-orange-600 font-black hover:underline uppercase tracking-wider cursor-pointer"
                      >
                        Back to Menu
                      </button>
                    </div>

                    {currentOrder ? (
                      <div className="flex-1 flex flex-col justify-between overflow-hidden">
                        {/* Real-time Order Status Tracker Component */}
                        <div className="flex-1 overflow-y-auto py-2.5 my-1 pr-0.5 scrollbar-none space-y-3">
                          <OrderStatusTracker 
                            order={currentOrder} 
                            getAcceleratedCountdown={getAcceleratedCountdown} 
                          />
                        </div>

                        {/* Order summary list */}
                        <div className="bg-zinc-100 rounded-2xl p-3 border-2 border-zinc-200/60 space-y-1.5 text-left shadow-inner mb-2.5">
                          <span className="text-[9px] text-zinc-400 font-mono font-bold block uppercase tracking-wider">Your Order Items</span>
                          <div className="space-y-1.5 max-h-20 overflow-y-auto pr-1">
                            {currentOrder.items.map((it, idx) => {
                              const extrasCost = (it.selectedExtras || []).reduce((s, e) => s + e.price, 0);
                              const itemTotal = (it.menuItem.price + extrasCost) * it.quantity;
                              return (
                                <div key={idx} className="space-y-0.5 border-b border-zinc-200/40 last:border-none pb-1.5 last:pb-0">
                                  <div className="flex justify-between text-[11px] text-zinc-600 font-bold leading-tight">
                                    <span>{it.menuItem.name} <span className="font-mono text-[9px] text-zinc-400 font-bold">x{it.quantity}</span></span>
                                    <span className="font-mono text-zinc-700 font-black">{itemTotal} kr</span>
                                  </div>
                                  {it.selectedExtras && it.selectedExtras.length > 0 && (
                                    <p className="text-[8.5px] text-orange-600 font-extrabold pl-1.5 leading-none">
                                      + {it.selectedExtras.map(e => `${e.name} (+${e.price} kr)`).join(", ")}
                                    </p>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                          <div className="border-t-2 border-zinc-200/60 pt-1.5 flex justify-between text-[11px] font-black text-zinc-800">
                            <span>Total Paid:</span>
                            <span className="font-mono text-zinc-950">{currentOrder.totalAmount} kr</span>
                          </div>
                        </div>

                        {/* Customer action button */}
                        {currentOrder.status === "Ready" ? (
                          <button
                            onClick={() => updateOrderStatus(currentOrder.id, "Completed")}
                            className="w-full bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-display font-bold py-2 rounded-xl transition-all shadow-md text-xs cursor-pointer mb-2 border-b-2 border-emerald-500 shrink-0"
                          >
                            Verify Collection with Staff
                          </button>
                        ) : currentOrder.status === "Completed" ? (
                          <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-2 rounded-xl text-[9px] font-bold text-center mb-2 shrink-0">
                            ✓ Food picked up! Enjoy your meal!
                          </div>
                        ) : (
                          <div className="bg-zinc-100 border border-zinc-200 text-zinc-500 p-2 rounded-xl text-[8px] font-semibold text-center mb-2 shrink-0 leading-tight">
                            Show this screen to staff at the counter when notified that order is ready.
                          </div>
                        )}
                      </div>
                    ) : (
                      /* No Active Order tracked state, show history or empty state */
                      <div className="flex-1 flex flex-col justify-between overflow-hidden py-3">
                        {orders.filter(o => o.customerName.includes(customerName)).length > 0 ? (
                          <div className="space-y-2 text-left flex flex-col h-full overflow-hidden">
                            <span className="text-[9px] font-black text-zinc-400 uppercase tracking-wider font-mono px-1 shrink-0">Your Order History</span>
                            <div className="space-y-1.5 flex-1 overflow-y-auto pr-1">
                              {orders.filter(o => o.customerName.includes(customerName)).map((o) => (
                                <button
                                  key={o.id}
                                  onClick={() => setCurrentOrder(o)}
                                  className="w-full bg-white border-2 border-zinc-200 hover:border-orange-400 p-2 rounded-xl text-left flex justify-between items-center transition-all cursor-pointer"
                                >
                                  <div className="space-y-0.5 min-w-0">
                                    <div className="flex items-center gap-1.5">
                                      <span className="text-[10px] font-mono font-black text-zinc-800">#{o.queueNumber}</span>
                                      <span className={`text-[8px] font-black uppercase font-mono px-1.5 py-0.5 rounded ${
                                        o.status === "Completed" ? "bg-emerald-50 text-emerald-600 border border-emerald-200/60" :
                                        o.status === "Ready" ? "bg-orange-100 text-orange-600 animate-pulse border border-orange-200" :
                                        "bg-zinc-100 text-zinc-600 border border-zinc-200"
                                      }`}>{o.status}</span>
                                    </div>
                                    <p className="text-[9px] text-zinc-400 truncate max-w-[140px] font-semibold">{o.vendorName}</p>
                                  </div>
                                  <span className="text-xs font-bold font-mono text-zinc-950 shrink-0">{o.totalAmount} kr</span>
                                </button>
                              ))}
                            </div>
                          </div>
                        ) : (
                          <div className="flex-1 flex flex-col items-center justify-center text-center p-4 space-y-3 my-auto">
                            <div className="p-2.5 bg-zinc-100 rounded-full text-zinc-400">
                              <Ticket className="w-6 h-6" />
                            </div>
                            <div className="space-y-0.5">
                              <h4 className="text-[11px] font-black text-zinc-800 uppercase tracking-wider">No Active Orders</h4>
                              <p className="text-[9px] text-zinc-500 leading-relaxed max-w-[180px] mx-auto font-medium">
                                You don't have any order being actively tracked. Scan a table QR or pick a vendor to place one!
                              </p>
                            </div>
                            <button
                              onClick={() => setActiveCustomerTab("home")}
                              className="bg-orange-500 hover:bg-orange-600 text-white text-[9px] font-black px-3.5 py-1.5 rounded-lg transition-all cursor-pointer uppercase tracking-wider shadow-md active:scale-95 border-b-2 border-orange-600"
                            >
                              Explore Vendors
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ) : activeCustomerTab === "support" ? (
                  // ATTENDEE SUPPORT CHAT BOT SCREEN
                  <div className="flex-1 flex flex-col justify-between overflow-hidden animate-fadeIn">
                    <SupportChat 
                      type="customer" 
                      customerName={customerName} 
                    />
                  </div>
                ) : activeCustomerTab === "history" ? (
                  // ATTENDEE HISTORY SCREEN
                  <div className="flex-1 flex flex-col justify-between px-4 pt-1.5 overflow-hidden animate-fadeIn">
                    {/* History Header */}
                    <div className="flex justify-between items-center border-b border-zinc-200/60 pb-2 shrink-0">
                      <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1 font-mono">
                        <History className="w-3.5 h-3.5" /> Order History
                      </span>
                      <button
                        onClick={() => setActiveCustomerTab("home")}
                        className="text-[10px] text-orange-600 font-black hover:underline uppercase tracking-wider cursor-pointer font-mono"
                      >
                        Back to Menu
                      </button>
                    </div>

                    {/* Content Area */}
                    <div className="flex-1 overflow-y-auto py-2.5 my-1 pr-0.5 scrollbar-none space-y-3 flex flex-col">
                      
                      {/* Sync Status / Authentication Banner */}
                      {user ? (
                        <div className="bg-emerald-50 border border-emerald-100 p-2.5 rounded-2xl flex items-center justify-between shrink-0">
                          <div className="flex items-center gap-2 min-w-0 text-left">
                            <img
                              src={user.photoURL || undefined}
                              alt={user.displayName || "User"}
                              referrerPolicy="no-referrer"
                              className="w-6.5 h-6.5 rounded-full border border-emerald-300 object-cover shrink-0"
                            />
                            <div className="min-w-0">
                              <p className="text-[9px] font-black text-emerald-950 truncate leading-none mb-0.5">{user.displayName}</p>
                              <p className="text-[8px] text-emerald-600 font-bold uppercase tracking-wider font-mono leading-none">Cloud Synced Account</p>
                            </div>
                          </div>
                          <span className="text-[7px] bg-emerald-500 text-white font-mono font-black px-1 py-0.5 rounded uppercase leading-none">Synced</span>
                        </div>
                      ) : (
                        <div className="bg-amber-50/80 border border-amber-200 p-2.5 rounded-2xl text-left space-y-1.5 shrink-0">
                          <div className="space-y-0.5">
                            <span className="text-[8px] text-amber-700 font-black uppercase tracking-wider font-mono block">Guest Mode Active</span>
                            <p className="text-[9px] text-amber-900 leading-tight font-medium">
                              Orders are currently saved locally. Sign in to save your order history to the cloud permanently!
                            </p>
                          </div>
                          <button
                            onClick={handleSignIn}
                            className="w-full bg-amber-500 hover:bg-amber-600 active:scale-95 text-white font-mono font-black py-1 rounded-xl text-[8.5px] transition-all shadow-xs flex items-center justify-center gap-1 uppercase tracking-wider cursor-pointer"
                          >
                            <LogIn className="w-2.5 h-2.5" /> Link History to Google
                          </button>
                        </div>
                      )}

                      {/* History List */}
                      {orders.length === 0 ? (
                        <div className="flex-1 flex flex-col items-center justify-center text-center p-4 space-y-2.5 my-auto">
                          <div className="p-2.5 bg-zinc-150 rounded-full text-zinc-400">
                            <History className="w-5 h-5" />
                          </div>
                          <div className="space-y-0.5">
                            <h4 className="text-[10px] font-black text-zinc-800 uppercase tracking-wider font-mono">No Orders Found</h4>
                            <p className="text-[8.5px] text-zinc-500 leading-relaxed max-w-[180px] mx-auto font-semibold">
                              You haven't placed any orders in this session yet. Grab some delicious festival street food to start!
                            </p>
                          </div>
                          <button
                            onClick={() => setActiveCustomerTab("home")}
                            className="bg-orange-500 hover:bg-orange-600 text-white text-[8px] font-black px-3 py-1.5 rounded-lg transition-all cursor-pointer uppercase tracking-wider shadow-xs border-b border-orange-600 font-mono"
                          >
                            Go to Menu
                          </button>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {orders.map((o) => {
                            const totalQty = o.items.reduce((sum, item) => sum + item.quantity, 0);
                            const isActive = o.status !== "Completed";
                            return (
                              <div
                                key={o.id}
                                className="bg-white border-2 border-zinc-200/80 hover:border-zinc-300 p-2.5 rounded-2xl text-left flex flex-col gap-2 transition-all shadow-xs"
                              >
                                <div className="flex justify-between items-start gap-1">
                                  <div className="min-w-0">
                                    <div className="flex items-center gap-1.5 flex-wrap">
                                      <span className="text-[10px] font-mono font-black text-zinc-800">#{o.queueNumber}</span>
                                      <span className={`text-[7.5px] font-black uppercase font-mono px-1.5 py-0.5 rounded leading-none ${
                                        o.status === "Completed" ? "bg-emerald-50 text-emerald-600 border border-emerald-200/60" :
                                        o.status === "Ready" ? "bg-orange-100 text-orange-600 animate-pulse border border-orange-200" :
                                        o.status === "Preparing" ? "bg-amber-50 text-amber-600 border border-amber-200/60" :
                                        "bg-blue-50 text-blue-600 border border-blue-200/60"
                                      }`}>{o.status}</span>
                                    </div>
                                    <p className="text-[9.5px] text-zinc-700 font-bold truncate mt-0.5">{o.vendorName}</p>
                                    <p className="text-[8px] text-zinc-400 font-mono font-semibold">{o.timestamp} • {totalQty} {totalQty === 1 ? 'item' : 'items'}</p>
                                  </div>
                                  <div className="text-right shrink-0">
                                    <span className="text-[11px] font-black font-mono text-zinc-950 block">{o.totalAmount} kr</span>
                                    <span className="text-[7px] text-zinc-400 font-bold uppercase tracking-wider font-mono block mt-0.5">Paid with Swish</span>
                                  </div>
                                </div>

                                {/* Item breakdown */}
                                <div className="bg-zinc-50 rounded-xl p-1.5 border border-zinc-100 space-y-1">
                                  {o.items.map((item, idx) => {
                                    const extraIds = (item.selectedExtras || []).map(e => e.id);
                                    const extrasCost = (item.selectedExtras || []).reduce((s, e) => s + e.price, 0);
                                    return (
                                      <div key={idx} className="text-[8.5px] leading-tight text-zinc-600 font-bold">
                                        <div className="flex justify-between">
                                          <span className="truncate max-w-[140px]">{item.menuItem.name} <span className="text-[7.5px] text-zinc-400 font-mono">x{item.quantity}</span></span>
                                          <span className="font-mono text-zinc-700">{(item.menuItem.price + extrasCost) * item.quantity} kr</span>
                                        </div>
                                        {item.selectedExtras && item.selectedExtras.length > 0 && (
                                          <p className="text-[7.5px] text-orange-500 font-black pl-1 truncate max-w-[180px]">
                                            + {item.selectedExtras.map(e => e.name).join(", ")}
                                          </p>
                                        )}
                                      </div>
                                    );
                                  })}
                                </div>

                                {/* Actions */}
                                <div className="flex gap-1.5 mt-0.5">
                                  <button
                                    onClick={() => {
                                      setCurrentOrder(o);
                                      setActiveCustomerTab("tracker");
                                    }}
                                    className={`flex-1 font-mono font-black text-[8px] py-1.5 rounded-xl uppercase tracking-wider text-center cursor-pointer transition-all active:scale-95 ${
                                      isActive 
                                        ? "bg-orange-500 text-white shadow-xs hover:bg-orange-600" 
                                        : "bg-zinc-100 text-zinc-600 border border-zinc-200 hover:bg-zinc-200"
                                    }`}
                                  >
                                    {isActive ? "Track Live Order" : "View Ticket / Receipt"}
                                  </button>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                ) : activeCustomerTab === "map" ? (
                  // ATTENDEE MAP SCREEN
                  <div className="flex-1 flex flex-col justify-between overflow-hidden animate-fadeIn h-full">
                    <EventMap 
                      vendors={vendors}
                      activeVendorId={activeVendorId}
                      onSelectVendor={setActiveVendorId}
                      onBackToMenu={() => setActiveCustomerTab("home")}
                      estimateWaitTime={estimateVendorWaitTime}
                    />
                  </div>
                ) : (
                  // ATTENDEE MENU VIEW
                  <div className="flex-1 flex flex-col justify-between overflow-hidden animate-fadeIn">
                    
                    {/* Menu Top Section */}
                    <div className="px-3 space-y-2 pt-1 shrink-0">
                      
                      {/* Event Banner */}
                      <div className="bg-zinc-900 text-white p-2.5 rounded-2xl flex items-center justify-between border border-zinc-800">
                        <div className="space-y-0.5">
                          <span className="text-[8px] text-orange-400 font-black block uppercase tracking-wider leading-none">Active Event</span>
                          <span className="font-display font-black text-[10px] uppercase truncate block max-w-36">GÄRDET OUTDOOR</span>
                        </div>
                        <span className="text-[8px] bg-zinc-800 text-zinc-400 px-1.5 py-0.5 rounded-sm font-mono border border-zinc-700 font-bold">LIVE ACCESS</span>
                      </div>

                      {/* Vendor Partner CTA Banner */}
                      <div className="bg-gradient-to-r from-orange-500/10 to-amber-500/10 border border-orange-500/20 p-2 rounded-2xl flex items-center justify-between gap-1.5 animate-fadeIn">
                        <div className="space-y-0.5 text-left">
                          <span className="text-[7.5px] text-orange-600 font-black block uppercase tracking-wider leading-none">Are you a food vendor?</span>
                          <span className="text-[9.5px] font-black text-zinc-800 leading-tight block">Partner with VenueEat</span>
                        </div>
                        <button
                          onClick={() => {
                            setRightPanelMode("vendor");
                            setLoggedInVendorId(null);
                            setIsRegisteringNewVendor(true);
                            setNotification("ℹ️ Opened vendor registration in the Partner Portal!");
                            setTimeout(() => {
                              const element = document.getElementById("right-portal-view");
                              if (element) {
                                element.scrollIntoView({ behavior: "smooth" });
                              }
                            }, 50);
                          }}
                          className="bg-orange-500 hover:bg-orange-600 active:scale-95 text-white font-mono font-black text-[7.5px] uppercase tracking-wider px-2 py-1.5 rounded-lg border border-orange-400/30 shadow-xs transition-all cursor-pointer whitespace-nowrap"
                        >
                          Register Stall
                        </button>
                      </div>

                      {activeTable && (
                        <div className="bg-orange-50 border border-orange-200 text-orange-800 px-3 py-1 rounded-xl flex items-center justify-between text-[10px] font-bold animate-fadeIn">
                          <span className="flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse"></span>
                            📍 Ordering to Table {activeTable}
                          </span>
                          <button 
                            onClick={() => setActiveTable(null)}
                            className="text-orange-600 hover:text-orange-800 text-[8px] font-black uppercase tracking-wider underline cursor-pointer"
                          >
                            Clear
                          </button>
                        </div>
                      )}

                      {/* Vendor selector */}
                      <div className="space-y-1">
                        <label className="text-[9px] text-zinc-400 font-black uppercase tracking-wider block">Browse Stalls</label>
                        <div className="flex gap-1.5 overflow-x-auto scrollbar-none pb-1">
                          {vendors.filter(v => v.isApproved === true).length === 0 ? (
                            <span className="text-[9px] text-zinc-400 font-bold italic py-1.5 pl-1">No live food stalls active.</span>
                          ) : (
                            vendors.filter(v => v.isApproved === true).map((v) => (
                              <button
                                key={v.id}
                                onClick={() => { setActiveVendorId(v.id); clearCart(); }}
                                className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-[10px] font-bold transition-all shrink-0 cursor-pointer ${
                                  activeVendorId === v.id
                                    ? "bg-orange-500 text-white shadow-md border border-orange-400 scale-[1.02]"
                                    : "bg-white border-2 border-zinc-200 text-zinc-600 hover:bg-zinc-50 hover:border-zinc-300"
                                }`}
                              >
                                <span>{v.logo}</span>
                                <span>{v.name.split(" ")[0]}</span>
                              </button>
                            ))
                          )}
                        </div>
                      </div>

                      {/* Dynamic Queue Wait Time & Congestion indicator */}
                      {(() => {
                        const waitInfo = estimateVendorWaitTime(activeVendorId);
                        return (
                          <div className={`p-2 rounded-xl border flex items-center justify-between transition-all duration-300 shadow-xs ${waitInfo.colorClass}`}>
                            <div className="flex items-center gap-1.5">
                              <Clock className="w-3.5 h-3.5 shrink-0 text-zinc-600" />
                              <div className="text-left">
                                <span className="text-[8px] font-black uppercase block tracking-wider leading-none text-zinc-400">Est. Queue Wait</span>
                                <span className="text-[9px] font-bold font-mono leading-none">
                                  {waitInfo.minutes} mins • {waitInfo.activeCount} in queue
                                </span>
                              </div>
                            </div>
                            <span className="text-[8px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-full border border-current font-mono scale-90">
                              {waitInfo.congestionLevel}
                            </span>
                          </div>
                        );
                      })()}
                    </div>

                    {/* Menu Items List */}
                    <div className="flex-1 overflow-y-auto px-3 py-2 space-y-2.5 max-h-[190px]">
                      <div className="flex justify-between items-center px-1">
                        <span className="text-[9px] text-zinc-400 font-black uppercase tracking-wider">{activeVendorObj.cuisine} Menu</span>
                        <span className="text-[9px] text-orange-600 font-bold">★ {activeVendorObj.rating} rating</span>
                      </div>

                      {activeVendorObj.menu.map((item) => (
                        <div
                          key={item.id}
                          className={`flex gap-2.5 bg-white p-2 rounded-2xl border-2 border-zinc-200/80 shadow-xs transition-all relative hover:border-zinc-300 ${
                            !item.stock ? "opacity-60" : ""
                          }`}
                        >
                          {/* Image */}
                          <img
                            src={item.imageUrl}
                            alt={item.name}
                            referrerPolicy="no-referrer"
                            className="w-12 h-12 rounded-xl object-cover bg-zinc-100 shrink-0 border border-zinc-150"
                          />

                          {/* Text */}
                          <div className="flex-1 min-w-0 flex flex-col justify-between">
                            <div>
                              <div className="flex justify-between items-start w-full">
                                <h5 className="font-display font-black text-zinc-900 text-[10px] truncate leading-tight">{item.name}</h5>
                                <span className="font-mono font-black text-[10px] text-zinc-800 shrink-0 pl-1">{item.price} kr</span>
                              </div>
                              <p className="text-[8px] text-zinc-400 font-semibold line-clamp-2 leading-snug mt-0.5">{item.description}</p>
                            </div>

                            {/* Action button */}
                            <div className="flex justify-between items-center mt-1">
                              <span className="text-[7px] bg-zinc-100 text-zinc-500 font-bold px-1 py-0.5 rounded font-mono uppercase tracking-wider">{item.category}</span>
                              
                              {!item.stock ? (
                                <span className="text-[8px] text-rose-500 font-black uppercase tracking-wider">SOLD OUT</span>
                              ) : getItemQuantityInCart(item.id) > 0 ? (
                                <div className="flex items-center gap-1">
                                  <button
                                    onClick={() => removeFromCart(item.id)}
                                    className="w-3.5 h-3.5 bg-zinc-200 text-zinc-700 rounded-full flex items-center justify-center text-[9px] font-black cursor-pointer active:scale-90"
                                  >
                                    -
                                  </button>
                                  <span className="font-mono text-[9px] font-black text-zinc-800">{getItemQuantityInCart(item.id)}</span>
                                  <button
                                    onClick={() => addToCart(item.id)}
                                    className="w-3.5 h-3.5 bg-orange-500 text-white rounded-full flex items-center justify-center text-[9px] font-black cursor-pointer active:scale-90"
                                  >
                                    +
                                  </button>
                                </div>
                              ) : (
                                <button
                                  onClick={() => addToCart(item.id)}
                                  className="bg-zinc-900 hover:bg-orange-500 text-white text-[8px] px-2 py-1 rounded-lg font-bold hover:scale-[1.02] active:scale-95 transition-all cursor-pointer uppercase tracking-wider"
                                >
                                  Add +
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Cart Summary Drawer bottom */}
                    <div className="border-t-2 border-zinc-200/60 bg-white px-3 py-2 space-y-1.5 shrink-0">
                      {Object.keys(customerCart).length > 0 ? (
                        <div className="space-y-1.5">
                          {/* List of customized cart items */}
                          <div className="max-h-16 overflow-y-auto pr-0.5 space-y-1 border-b border-zinc-100 pb-1.5 scrollbar-none">
                            {Object.entries(customerCart).map(([cartKey, qty]) => {
                              const { itemId, extraIds } = parseCartKey(cartKey);
                              const item = activeVendorObj.menu.find(m => m.id === itemId);
                              if (!item) return null;
                              const selectedExtras = (item.extras || []).filter(ext => extraIds.includes(ext.id));
                              const extrasCost = selectedExtras.reduce((s, e) => s + e.price, 0);
                              const numericQty = qty as number;
                              return (
                                <div key={cartKey} className="flex flex-col text-[10px] text-zinc-600 font-bold leading-none py-0.5">
                                  <div className="flex justify-between items-center">
                                    <span className="truncate max-w-[130px]">{item.name} <span className="text-[8px] text-zinc-400 font-mono">x{numericQty}</span></span>
                                    <span className="font-mono text-zinc-800">{(item.price + extrasCost) * numericQty} kr</span>
                                  </div>
                                  {selectedExtras.length > 0 && (
                                    <span className="text-[7.5px] text-orange-500 font-black pl-1 truncate max-w-[170px]">
                                      + {selectedExtras.map(e => e.name).join(", ")}
                                    </span>
                                  )}
                                </div>
                              );
                            })}
                          </div>

                          <div className="space-y-1 text-[10px] px-0.5 border-b border-zinc-100 pb-1.5">
                            <div className="flex justify-between text-zinc-500 font-bold">
                              <span>Mat & Tillval (Subtotal)</span>
                              <span className="font-mono">{getCartTotal()} kr</span>
                            </div>
                            <div className="flex justify-between text-orange-600 font-extrabold">
                              <span>VenueEat Serviceavgift (3.5%)</span>
                              <span className="font-mono">+{(Math.round(getCartTotal() * 0.035 * 100) / 100).toFixed(2)} kr</span>
                            </div>
                            <div className="flex justify-between text-[11px] text-zinc-900 font-black pt-0.5">
                              <span>Totalt att betala</span>
                              <span className="font-mono text-emerald-600 font-black">{(getCartTotal() + Math.round(getCartTotal() * 0.035 * 100) / 100).toFixed(2)} kr</span>
                            </div>
                          </div>
                          <button
                            onClick={triggerSwishCheckout}
                            className="w-full bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-display font-black py-2 rounded-xl text-[10px] transition-all shadow-md flex items-center justify-center gap-1 cursor-pointer uppercase tracking-wider border-b-2 border-emerald-500"
                          >
                            <ShoppingBag className="w-3 h-3" />
                            Order via Swish
                          </button>
                        </div>
                      ) : (
                        <div className="text-center py-1.5 text-zinc-400 space-y-0.5">
                          <ShoppingBag className="w-4 h-4 mx-auto text-zinc-300" />
                          <p className="text-[8px] font-black leading-relaxed uppercase tracking-wider text-zinc-500">Scan QR • Place Swish Order • Pick Up</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Persistent Tab Bar Menu Navigator */}
                <div className="border-t border-zinc-200 bg-white py-1 px-4 flex justify-around items-center shrink-0 z-20">
                  <button
                    onClick={() => setActiveCustomerTab("home")}
                    className={`flex flex-col items-center gap-0.5 transition-all duration-200 cursor-pointer ${
                      activeCustomerTab === "home"
                        ? "text-orange-500 scale-105"
                        : "text-zinc-400 hover:text-zinc-600"
                    }`}
                  >
                    <Utensils className="w-4 h-4" />
                    <span className="text-[8px] font-black uppercase tracking-wider font-mono">Menu</span>
                  </button>

                  <button
                    onClick={() => setActiveCustomerTab("map")}
                    className={`flex flex-col items-center gap-0.5 transition-all duration-200 cursor-pointer ${
                      activeCustomerTab === "map"
                        ? "text-orange-500 scale-105"
                        : "text-zinc-400 hover:text-zinc-600"
                    }`}
                  >
                    <Map className="w-4 h-4" />
                    <span className="text-[8px] font-black uppercase tracking-wider font-mono">Map</span>
                  </button>

                  <button
                    onClick={() => setActiveCustomerTab("tracker")}
                    className={`flex flex-col items-center gap-0.5 transition-all duration-200 relative cursor-pointer ${
                      activeCustomerTab === "tracker"
                        ? "text-orange-500 scale-105"
                        : "text-zinc-400 hover:text-zinc-600"
                    }`}
                  >
                    <Ticket className="w-4 h-4" />
                    {currentOrder && currentOrder.status !== "Completed" && (
                      <span className="absolute top-0 right-1 w-1.5 h-1.5 bg-orange-500 rounded-full animate-ping" />
                    )}
                    {currentOrder && currentOrder.status !== "Completed" && (
                      <span className="absolute top-0 right-1 w-1.5 h-1.5 bg-orange-500 rounded-full" />
                    )}
                    <span className="text-[8px] font-black uppercase tracking-wider font-mono">Tracker</span>
                  </button>

                  <button
                    onClick={() => setActiveCustomerTab("history")}
                    className={`flex flex-col items-center gap-0.5 transition-all duration-200 relative cursor-pointer ${
                      activeCustomerTab === "history"
                        ? "text-orange-500 scale-105"
                        : "text-zinc-400 hover:text-zinc-600"
                    }`}
                  >
                    <History className="w-4 h-4" />
                    {user && orders.length > 0 && (
                      <span className="absolute top-0 right-1 w-1 h-1 bg-emerald-500 rounded-full animate-pulse" />
                    )}
                    <span className="text-[8px] font-black uppercase tracking-wider font-mono">History</span>
                  </button>

                  <button
                    onClick={() => setActiveCustomerTab("support")}
                    className={`flex flex-col items-center gap-0.5 transition-all duration-200 relative cursor-pointer ${
                      activeCustomerTab === "support"
                        ? "text-orange-500 scale-105"
                        : "text-zinc-400 hover:text-zinc-600"
                    }`}
                  >
                    <MessageSquare className="w-4 h-4" />
                    <span className="text-[8px] font-black uppercase tracking-wider font-mono">Support</span>
                  </button>
                </div>

                {/* Customization Overlay bottom-sheet */}
                {customizingItem && (
                  <div className="absolute inset-0 bg-zinc-950/70 z-30 flex flex-col justify-end animate-fadeIn">
                    <div className="bg-white text-zinc-900 rounded-t-3xl p-4.5 space-y-4 max-h-[90%] overflow-y-auto shadow-2xl animate-slideUp border-t border-zinc-200">
                      {/* Header */}
                      <div className="flex justify-between items-start">
                        <div className="flex gap-2">
                          <img
                            src={customizingItem.imageUrl}
                            alt={customizingItem.name}
                            referrerPolicy="no-referrer"
                            className="w-10 h-10 rounded-lg object-cover bg-zinc-100 border border-zinc-200 shrink-0"
                          />
                          <div className="text-left">
                            <h4 className="font-display font-black text-[11px] text-zinc-950 leading-tight">{customizingItem.name}</h4>
                            <p className="text-[8.5px] text-zinc-500 font-medium leading-tight line-clamp-1 mt-0.5">{customizingItem.description}</p>
                          </div>
                        </div>
                        <button
                          onClick={() => setCustomizingItem(null)}
                          className="p-1 bg-zinc-100 hover:bg-zinc-200 text-zinc-500 rounded-full transition-all cursor-pointer active:scale-90"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Extras Options List */}
                      <div className="space-y-2 text-left">
                        <span className="text-[9px] text-zinc-400 font-black uppercase tracking-wider block font-mono">Select Add-ons (Optional)</span>
                        <div className="space-y-1.5 max-h-[140px] overflow-y-auto pr-1">
                          {(customizingItem.extras || []).map((ext) => {
                            const isSelected = selectedExtrasForCustomizing.includes(ext.id);
                            return (
                              <button
                                key={ext.id}
                                onClick={() => {
                                  setSelectedExtrasForCustomizing(prev =>
                                    prev.includes(ext.id) ? prev.filter(id => id !== ext.id) : [...prev, ext.id]
                                  );
                                }}
                                className={`w-full flex items-center justify-between p-2 rounded-xl border-2 text-[10px] font-bold transition-all text-left cursor-pointer ${
                                  isSelected
                                    ? "border-orange-500 bg-orange-50/50 text-orange-950"
                                    : "border-zinc-200 bg-white text-zinc-600 hover:border-zinc-300"
                                }`}
                              >
                                <span className="flex items-center gap-1.5">
                                  <span className={`w-3.5 h-3.5 rounded flex items-center justify-center border-2 ${
                                    isSelected ? "border-orange-500 bg-orange-500 text-white" : "border-zinc-300 bg-white"
                                  }`}>
                                    {isSelected && <Check className="w-2.5 h-2.5 stroke-[3px]" />}
                                  </span>
                                  {ext.name}
                                </span>
                                <span className="font-mono font-black text-zinc-800">+{ext.price} kr</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Price Calculator & Confirm button */}
                      <div className="border-t border-zinc-100 pt-3 space-y-3">
                        <div className="flex justify-between items-center text-xs px-0.5">
                          <span className="text-zinc-500 font-bold uppercase text-[9px] font-mono">Calculated Price</span>
                          <span className="font-display font-black text-xs text-zinc-900 font-mono">
                            {customizingItem.price + (customizingItem.extras || [])
                              .filter(e => selectedExtrasForCustomizing.includes(e.id))
                              .reduce((s, e) => s + e.price, 0)
                            } kr
                          </span>
                        </div>

                        <button
                          onClick={() => {
                            addToCartWithExtras(customizingItem.id, selectedExtrasForCustomizing);
                            setCustomizingItem(null);
                            setSelectedExtrasForCustomizing([]);
                          }}
                          className="w-full bg-orange-500 hover:bg-orange-600 active:scale-95 text-white font-display font-black py-2 rounded-xl text-[10px] transition-all shadow-md flex items-center justify-center gap-1 cursor-pointer uppercase tracking-wider"
                        >
                          <Plus className="w-3.5 h-3.5 stroke-[3px]" />
                          Add to Order
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

             {/* RIGHT COLUMN: Vendor Kitchen Monitor (7 columns) */}
        <div id="right-portal-view" className="lg:col-span-7 bg-zinc-900 text-white rounded-3xl p-6 md:p-8 border-4 border-zinc-800 shadow-xl space-y-6">
          
          {/* ARCHITECTURAL PANEL SELECTOR */}
          <div className="flex bg-zinc-950 p-1.5 rounded-2xl border border-zinc-800 text-xs font-bold w-full shadow-inner gap-1">
            <button
              onClick={() => setRightPanelMode("vendor")}
              className={`flex-1 py-2.5 px-2 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                rightPanelMode === "vendor" ? "bg-zinc-800 text-orange-400 border border-zinc-700 shadow-sm font-black" : "text-zinc-500 hover:text-zinc-300 font-medium"
              }`}
            >
              <Store className="w-4 h-4 shrink-0" />
              Vendor Portal
            </button>
            <button
              onClick={() => setRightPanelMode("admin")}
              className={`flex-1 py-2.5 px-2 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                rightPanelMode === "admin" ? "bg-gradient-to-r from-orange-500 to-amber-500 text-white border border-orange-400/40 shadow-md font-black" : "text-zinc-500 hover:text-zinc-300 font-medium"
              }`}
            >
              <ShieldCheck className="w-4 h-4 shrink-0 text-amber-300" />
              Event Admin
            </button>
            <button
              onClick={() => setRightPanelMode("superadmin")}
              className={`flex-1 py-2.5 px-2 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                rightPanelMode === "superadmin" ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white border border-purple-400/40 shadow-md font-black" : "text-zinc-500 hover:text-zinc-300 font-medium"
              }`}
            >
              <Building2 className="w-4 h-4 shrink-0 text-purple-300" />
              Super Admin Hub
            </button>
          </div>

          {rightPanelMode === "superadmin" ? (
            <SuperAdminConsole
              events={managedEvents}
              activeEventId={activeEventId}
              onSelectActiveEvent={handleSelectActiveEvent}
              onAddNewEvent={handleAddNewEvent}
              onUpdateEventStatus={handleUpdateEventStatus}
            />
          ) : rightPanelMode === "admin" ? (
            loggedInAdminId ? (
              renderEventAdminConsole()
            ) : (
              renderAdminLoginGate()
            )
          ) : !loggedInVendorId ? (
            /* VENDOR PORTAL LOGIN GATE */
            <div className="space-y-6 py-4 animate-fadeIn text-left">
              <div className="space-y-2 text-center md:text-left">
                <div className="text-[10px] text-orange-400 font-mono font-bold uppercase tracking-wider flex items-center justify-center md:justify-start gap-1.5">
                  <Fingerprint className="w-4 h-4 text-orange-500 animate-pulse" />
                  Partner Portal Authentication
                </div>
                <h2 className="font-display font-black text-2xl text-white">Vendor Partner Portal</h2>
                <p className="text-xs text-zinc-400 max-w-md font-medium leading-relaxed">
                  Sign in to access your custom real-time kitchen orders, manage live menu stock availability, customize pricing, and analyze Namaste Stockholm performance stats.
                </p>
              </div>

              {/* Login/Register Tab Toggle */}
              <div className="flex bg-zinc-950 p-1 rounded-2xl border-2 border-zinc-800 text-xs font-bold w-full sm:w-80">
                <button
                  type="button"
                  onClick={() => {
                    setIsRegisteringNewVendor(false);
                    setLoginError(null);
                  }}
                  className={`flex-1 py-2 rounded-xl transition-all cursor-pointer text-center ${
                    !isRegisteringNewVendor ? "bg-orange-500 text-white shadow-md border border-orange-400" : "text-zinc-400 hover:text-white"
                  }`}
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsRegisteringNewVendor(true);
                    setLoginError(null);
                  }}
                  className={`flex-1 py-2 rounded-xl transition-all cursor-pointer text-center ${
                    isRegisteringNewVendor ? "bg-orange-500 text-white shadow-md border border-orange-400" : "text-zinc-400 hover:text-white"
                  }`}
                >
                  Register Stall
                </button>
              </div>

              {!isRegisteringNewVendor ? (
                /* SIGN IN FORM */
                <form 
                  onSubmit={(e) => {
                    e.preventDefault();
                    setLoginError(null);

                    if (signInMethod === "quick") {
                      const selectedVendor = vendors.find(v => v.id === selectedVendorForConsole);
                      if (!selectedVendor) {
                        setLoginError("Invalid vendor selected.");
                        return;
                      }
                      const correctPin = selectedVendor.pin || "1234"; // default pin fallback
                      if (vendorLoginPin === correctPin) {
                        setLoggedInVendorId(selectedVendor.id);
                        setNotification(`👨‍🍳 Welcome back, ${selectedVendor.name}! Portal unlocked.`);
                      } else {
                        setLoginError(`Incorrect security PIN for ${selectedVendor.name}. Please try again!`);
                      }
                    } else {
                      // Email Sign-In Path
                      const selectedVendor = vendors.find(v => v.email?.trim().toLowerCase() === signInEmail.trim().toLowerCase());
                      if (!selectedVendor) {
                        setLoginError(`No registered food stall found with email "${signInEmail}". Please make sure you entered the correct email address or register a new stall.`);
                        return;
                      }
                      if (!isSignInEmailVerified) {
                        setLoginError("Please click 'Send Code' and verify your email address to log in.");
                        return;
                      }
                      const correctPin = selectedVendor.pin || "1234";
                      if (vendorLoginPin === correctPin) {
                        setLoggedInVendorId(selectedVendor.id);
                        setSelectedVendorForConsole(selectedVendor.id);
                        setNotification(`👨‍🍳 Welcome back, ${selectedVendor.name}! Portal unlocked via Verified Email.`);
                      } else {
                        setLoginError(`Incorrect security PIN. Please check and try again.`);
                      }
                    }
                  }}
                  className="space-y-4"
                >
                  {/* Sign In Method Selector */}
                  <div className="flex bg-zinc-950 p-1 rounded-xl border border-zinc-900 gap-1">
                    <button
                      type="button"
                      onClick={() => {
                        setSignInMethod("quick");
                        setLoginError(null);
                      }}
                      className={`flex-1 py-1.5 text-[10px] font-bold rounded-lg transition-all cursor-pointer ${
                        signInMethod === "quick" ? "bg-zinc-900 text-orange-400 border border-orange-500/10 shadow-sm" : "text-zinc-500 hover:text-zinc-300"
                      }`}
                    >
                      Quick PIN Access
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setSignInMethod("email");
                        setLoginError(null);
                      }}
                      className={`flex-1 py-1.5 text-[10px] font-bold rounded-lg transition-all cursor-pointer ${
                        signInMethod === "email" ? "bg-zinc-900 text-orange-400 border border-orange-500/10 shadow-sm" : "text-zinc-500 hover:text-zinc-300"
                      }`}
                    >
                      Secure Email Log In
                    </button>
                  </div>

                  {signInMethod === "quick" ? (
                    <>
                      <div className="space-y-1.5 animate-fadeIn">
                        <label className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider font-mono">Select Your Food Stall</label>
                        <select
                          value={selectedVendorForConsole}
                          onChange={(e) => {
                            setSelectedVendorForConsole(e.target.value);
                            setLoginError(null);
                          }}
                          className="w-full bg-zinc-950 border-2 border-zinc-800 rounded-2xl px-4 py-3 text-sm font-bold text-white focus:outline-none focus:border-orange-500 cursor-pointer"
                        >
                          {vendors.map(v => (
                            <option key={v.id} value={v.id}>{v.logo} {v.name} {v.email ? `(${v.email})` : ""}</option>
                          ))}
                        </select>
                      </div>

                      <div className="space-y-1.5 animate-fadeIn">
                        <div className="flex justify-between items-center">
                          <label className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider font-mono">Secure Access PIN</label>
                          <span className="text-[9px] text-zinc-500 font-mono">See PIN below options if needed</span>
                        </div>
                        <input
                          type="password"
                          maxLength={4}
                          placeholder="Enter 4-digit PIN (e.g., 1111)"
                          value={vendorLoginPin}
                          onChange={(e) => setVendorLoginPin(e.target.value.replace(/\D/g, ''))}
                          className="w-full bg-zinc-950 border-2 border-zinc-800 rounded-2xl px-4 py-3 text-sm font-mono text-center tracking-widest text-orange-400 font-black focus:outline-none focus:border-orange-500"
                          required
                        />
                      </div>
                    </>
                  ) : (
                    /* Secure Email Authentication Tab */
                    <div className="space-y-3.5 animate-fadeIn">
                      <div className="space-y-1.5">
                        <div className="flex justify-between items-center flex-wrap gap-2">
                          <label className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider font-mono">Registered Vendor Email</label>
                          {isSignInEmailVerified ? (
                            <span className="text-[9px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-md font-bold uppercase tracking-wider flex items-center gap-1">
                              <Check className="w-2.5 h-2.5 text-emerald-500" /> Identity Verified
                            </span>
                          ) : (
                            <span className="text-[9px] bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded-md font-bold uppercase tracking-wider">
                              Unverified
                            </span>
                          )}
                        </div>

                        <div className="flex gap-2">
                          <input
                            type="email"
                            placeholder="e.g., delhi@venueeat.se"
                            value={signInEmail}
                            disabled={isSignInEmailVerified}
                            onChange={(e) => {
                              setSignInEmail(e.target.value);
                              setLoginError(null);
                            }}
                            className="flex-1 bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-200 focus:outline-none focus:border-orange-500 font-bold disabled:opacity-60 disabled:cursor-not-allowed"
                            required
                          />
                          {!isSignInEmailVerified && (
                            <button
                              type="button"
                              onClick={() => {
                                const matched = vendors.find(v => v.email?.trim().toLowerCase() === signInEmail.trim().toLowerCase());
                                if (!matched) {
                                  setLoginError(`No registered stall found with email "${signInEmail}". Try "delhi@venueeat.se", "bombay@venueeat.se", or register a new one!`);
                                  return;
                                }

                                const code = Math.floor(1000 + Math.random() * 9000).toString();
                                setSignInSentCode(code);
                                setShowSignInCodeInput(true);
                                setNotification(`✉️ Access code sent to ${signInEmail}`);
                                setVerificationNotification(`✉️ [SIMULATED EMAIL INBOX] A secure access link and 4-digit login OTP were sent to "${signInEmail}". Login code: ${code}`);
                              }}
                              className="bg-zinc-900 hover:bg-zinc-850 border border-zinc-850 text-zinc-200 hover:text-white font-bold text-[10px] px-3 py-2 rounded-xl transition-all cursor-pointer active:scale-95 uppercase tracking-wider"
                            >
                              {showSignInCodeInput ? "Resend" : "Send Code"}
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Simulated verification email notice */}
                      {verificationNotification && !isSignInEmailVerified && (
                        <div className="bg-orange-500/10 border border-orange-500/20 p-3 rounded-xl text-[10.5px] text-orange-400 font-bold leading-relaxed flex items-start gap-2.5">
                          <Sparkles className="w-4 h-4 shrink-0 mt-0.5 animate-pulse text-orange-500" />
                          <span>{verificationNotification}</span>
                        </div>
                      )}

                      {showSignInCodeInput && !isSignInEmailVerified && (
                        <div className="space-y-1.5 pt-1 border-t border-zinc-900 animate-fadeIn">
                          <label className="text-[9px] text-zinc-400 font-bold uppercase tracking-wider font-mono block text-left">Enter 4-Digit Login OTP</label>
                          <div className="flex gap-2">
                            <input
                              type="text"
                              maxLength={4}
                              placeholder="e.g., 9999"
                              value={signInEnteredCode}
                              onChange={(e) => setSignInEnteredCode(e.target.value.replace(/\D/g, ''))}
                              className="flex-1 bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs font-mono text-center tracking-widest text-zinc-200 focus:outline-none focus:border-orange-500 font-black"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                if (signInEnteredCode === signInSentCode) {
                                  setIsSignInEmailVerified(true);
                                  setVerificationNotification(null);
                                  setNotification("✓ Identity verified! Please enter your 4-digit PIN below to login.");
                                } else {
                                  setLoginError("Invalid verification code. Please check and try again.");
                                }
                              }}
                              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] px-4 py-2 rounded-xl transition-all cursor-pointer active:scale-95 uppercase tracking-wider"
                            >
                              Verify OTP
                            </button>
                          </div>
                        </div>
                      )}

                      {isSignInEmailVerified && (
                        <div className="space-y-1.5 animate-fadeIn">
                          <label className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider font-mono">Enter Secure Access PIN</label>
                          <input
                            type="password"
                            maxLength={4}
                            placeholder="e.g., 1111"
                            value={vendorLoginPin}
                            onChange={(e) => setVendorLoginPin(e.target.value.replace(/\D/g, ''))}
                            className="w-full bg-zinc-950 border-2 border-zinc-800 rounded-2xl px-4 py-3 text-sm font-mono text-center tracking-widest text-orange-400 font-black focus:outline-none focus:border-orange-500"
                            required
                          />
                        </div>
                      )}
                    </div>
                  )}

                  {loginError && (
                    <div className="p-3.5 bg-rose-500/10 border border-rose-500/20 rounded-2xl flex items-start gap-2.5 text-rose-400 text-xs font-bold leading-relaxed">
                      <AlertCircle className="w-4.5 h-4.5 shrink-0 mt-0.5" />
                      <span>{loginError}</span>
                    </div>
                  )}

                  <button
                    type="submit"
                    className="w-full bg-orange-500 hover:bg-orange-600 active:scale-98 text-white font-display font-black py-3 rounded-2xl text-xs transition-all shadow-lg flex items-center justify-center gap-1.5 cursor-pointer uppercase tracking-wider border-b-2 border-orange-400 mt-2"
                  >
                    <LogIn className="w-4 h-4" />
                    Unlock Partner Dashboard
                  </button>
                </form>
              ) : (
                /* REGISTER NEW VENDOR FORM */
                <form 
                  onSubmit={(e) => {
                    e.preventDefault();
                    setLoginError(null);
                    if (!newVendorName.trim()) {
                      setLoginError("Vendor/Stall name is required.");
                      return;
                    }
                    if (!isEmailVerified) {
                      setLoginError("Please click 'Verify Email' and enter the 4-digit code sent to your email to proceed.");
                      return;
                    }
                    if (!newVendorPin.trim() || newVendorPin.length < 4) {
                      setLoginError("Please enter a 4-digit security PIN.");
                      return;
                    }
                    if (!newVendorSwish.trim()) {
                      setLoginError("Please enter a Swish payout number.");
                      return;
                    }
                    handleRegisterVendor(
                      newVendorName,
                      newVendorCuisine,
                      newVendorLogo,
                      newVendorLocation,
                      newVendorPin,
                      newVendorEmail,
                      newVendorSwish
                    );
                  }}
                  className="space-y-4 max-h-[350px] overflow-y-auto pr-1 scrollbar-thin"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider font-mono">Stall Name</label>
                      <input
                        type="text"
                        placeholder="e.g., Delhi Dosa Hub"
                        value={newVendorName}
                        onChange={(e) => setNewVendorName(e.target.value)}
                        className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2.5 text-xs text-zinc-200 focus:outline-none focus:border-orange-500 font-bold"
                        required
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider font-mono">Cuisine Specialty</label>
                      <input
                        type="text"
                        placeholder="e.g., South Indian Fast Food"
                        value={newVendorCuisine}
                        onChange={(e) => setNewVendorCuisine(e.target.value)}
                        className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2.5 text-xs text-zinc-200 focus:outline-none focus:border-orange-500 font-bold"
                        required
                      />
                    </div>
                  </div>

                  {/* Email verification step */}
                  <div className="space-y-1.5 bg-zinc-950/80 p-4 border border-zinc-850 rounded-2xl">
                    <div className="flex justify-between items-center flex-wrap gap-2">
                      <label className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider font-mono">Stall Contact Email</label>
                      {isEmailVerified ? (
                        <span className="text-[9px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-md font-bold uppercase tracking-wider flex items-center gap-1">
                          <Check className="w-2.5 h-2.5 text-emerald-500" /> Email Verified
                        </span>
                      ) : (
                        <span className="text-[9px] bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded-md font-bold uppercase tracking-wider">
                          Verification Required
                        </span>
                      )}
                    </div>
                    
                    <div className="flex gap-2">
                      <input
                        type="email"
                        placeholder="e.g., manager@dosahub.se"
                        value={newVendorEmail}
                        disabled={isEmailVerified}
                        onChange={(e) => {
                          setNewVendorEmail(e.target.value);
                          setLoginError(null);
                        }}
                        className="flex-1 bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-200 focus:outline-none focus:border-orange-500 font-bold disabled:opacity-60 disabled:cursor-not-allowed"
                        required
                      />
                      {!isEmailVerified && (
                        <button
                          type="button"
                          onClick={() => {
                            if (!newVendorEmail.trim() || !newVendorEmail.includes("@")) {
                              setLoginError("Please enter a valid email address to verify.");
                              return;
                            }
                            // Generate random 4-digit code
                            const code = Math.floor(1000 + Math.random() * 9000).toString();
                            setEmailVerificationCode(code);
                            setShowVerificationCodeInput(true);
                            setNotification(`✉️ Activation Code Sent: ${code}`);
                            setVerificationNotification(`✉️ [SIMULATED EMAIL INBOX] A secure registration link and 4-digit code were sent to "${newVendorEmail}". Activation code: ${code}`);
                          }}
                          className="bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 text-zinc-200 hover:text-white font-bold text-[10px] px-3.5 py-2 rounded-xl transition-all cursor-pointer active:scale-95 uppercase tracking-wider"
                        >
                          {showVerificationCodeInput ? "Resend" : "Send Code"}
                        </button>
                      )}
                    </div>

                    {/* Simulated verification email notice */}
                    {verificationNotification && !isEmailVerified && (
                      <div className="bg-orange-500/10 border border-orange-500/20 p-3 rounded-xl text-[10.5px] text-orange-400 font-bold leading-relaxed flex items-start gap-2.5 animate-fadeIn">
                        <Sparkles className="w-4 h-4 shrink-0 mt-0.5 animate-pulse text-orange-500" />
                        <span>{verificationNotification}</span>
                      </div>
                    )}

                    {showVerificationCodeInput && !isEmailVerified && (
                      <div className="space-y-1.5 pt-2.5 border-t border-zinc-900 animate-fadeIn">
                        <label className="text-[9px] text-zinc-400 font-bold uppercase tracking-wider font-mono block text-left">Enter 4-Digit Activation Code</label>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            maxLength={4}
                            placeholder="e.g., 1234"
                            value={enteredVerificationCode}
                            onChange={(e) => setEnteredVerificationCode(e.target.value.replace(/\D/g, ''))}
                            className="flex-1 bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs font-mono text-center tracking-widest text-zinc-200 focus:outline-none focus:border-orange-500 font-black"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              if (enteredVerificationCode === emailVerificationCode) {
                                setIsEmailVerified(true);
                                setVerificationNotification(null);
                                setNotification("✓ Email address verified! Registration unlocked.");
                              } else {
                                setLoginError("Invalid verification code. Please check and try again.");
                              }
                            }}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] px-4 py-2 rounded-xl transition-all cursor-pointer active:scale-95 uppercase tracking-wider"
                          >
                            Verify Code
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider font-mono">Kungsträdgården Location</label>
                      <input
                        type="text"
                        placeholder="e.g., Booth #12, East Stage"
                        value={newVendorLocation}
                        onChange={(e) => setNewVendorLocation(e.target.value)}
                        className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2.5 text-xs text-zinc-200 focus:outline-none focus:border-orange-500 font-bold"
                        required
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider font-mono">Stall Logo Emoji</label>
                      <select
                        value={newVendorLogo}
                        onChange={(e) => setNewVendorLogo(e.target.value)}
                        className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2.5 text-xs text-zinc-200 focus:outline-none focus:border-orange-500 font-bold cursor-pointer"
                      >
                        <option value="🍛">🍛 Curry / Thali</option>
                        <option value="🦁">🦁 Samosa / Lion</option>
                        <option value="🥥">🥥 South Indian Coconut</option>
                        <option value="🧁">🧁 Sweets / Dessert</option>
                        <option value="🫓">🫓 Naan / Roti</option>
                        <option value="☕">☕ Masala Chai</option>
                        <option value="🥗">🥗 Salad / Chaat</option>
                        <option value="🍗">🍗 Tandoori Chicken</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider font-mono">Choose 4-Digit Login PIN</label>
                      <input
                        type="password"
                        maxLength={4}
                        placeholder="e.g., 5555"
                        value={newVendorPin}
                        onChange={(e) => setNewVendorPin(e.target.value.replace(/\D/g, ''))}
                        className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2.5 text-xs font-mono text-center tracking-widest text-orange-400 font-black focus:outline-none focus:border-orange-500"
                        required
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider font-mono">Swish Payout Number</label>
                      <input
                        type="text"
                        placeholder="e.g., 123 456 78 90"
                        value={newVendorSwish}
                        onChange={(e) => setNewVendorSwish(e.target.value)}
                        className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2.5 text-xs font-mono text-center tracking-wider text-emerald-400 font-black focus:outline-none focus:border-emerald-500"
                        required
                      />
                    </div>
                  </div>

                  {loginError && (
                    <div className="p-3.5 bg-rose-500/10 border border-rose-500/20 rounded-2xl flex items-start gap-2.5 text-rose-400 text-xs font-bold leading-relaxed">
                      <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                      <span>{loginError}</span>
                    </div>
                  )}

                  <button
                    type="submit"
                    className="w-full bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white font-display font-black py-3 rounded-2xl text-xs transition-all shadow-lg flex items-center justify-center gap-1.5 cursor-pointer uppercase tracking-wider border-b-2 border-emerald-500 mt-2"
                  >
                    <Sparkles className="w-4 h-4" />
                    Register & Open Dashboard
                  </button>
                </form>
              )}
            </div>
          ) : (
            <>
              {/* Dashboard Header */}
              <div className="flex flex-col md:flex-row md:items-center justify-between border-b-2 border-zinc-800 pb-5 gap-4">
                <div className="space-y-2">
                  <div className="text-[10px] text-orange-400 font-mono font-bold uppercase tracking-wider flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    Vendor Management Portal
                  </div>
                  
                  <div className="flex items-center gap-2.5 flex-wrap">
                    {/* Logged in vendor profile badge */}
                    <div className="bg-zinc-950 border-2 border-zinc-800 rounded-2xl px-4 py-2 flex items-center gap-2.5">
                      <span className="text-xl shrink-0">{selectedVendorObj.logo}</span>
                      <div className="min-w-0 text-left">
                        <span className="font-display font-black text-xs block leading-tight text-white truncate max-w-[150px] sm:max-w-[180px]">{selectedVendorObj.name}</span>
                        <span className="text-[9px] font-bold text-zinc-500 flex items-center gap-1 leading-none mt-0.5">
                          <MapPin className="w-3 h-3 text-orange-500 shrink-0" />
                          <span className="truncate max-w-[120px]">{selectedVendorObj.location || "Kungsträdgården"}</span>
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => setShowQrModal(true)}
                      className="bg-zinc-950 hover:bg-zinc-900 border-2 border-zinc-800 hover:border-zinc-700 rounded-xl px-3 py-2 text-[10px] font-bold text-zinc-300 hover:text-white flex items-center gap-1.5 transition-all shadow-md cursor-pointer active:scale-95 shrink-0 h-10"
                      title="Generate printable table signage QR stands"
                    >
                      <QrCode className="w-4 h-4 text-orange-500 animate-pulse" />
                      <span>Table QR</span>
                    </button>

                    <button
                      onClick={() => {
                        setLoggedInVendorId(null);
                        setVendorLoginPin("");
                        setNotification("🚪 Logged out from food stall portal.");
                        // Reset Registration Email Verification states
                        setNewVendorEmail("");
                        setIsEmailVerified(false);
                        setShowVerificationCodeInput(false);
                        setEmailVerificationCode("");
                        setEnteredVerificationCode("");
                        setVerificationNotification(null);
                        // Reset Sign In Email Verification states
                        setSignInEmail("");
                        setSignInEnteredCode("");
                        setSignInSentCode("");
                        setIsSignInEmailVerified(false);
                        setShowSignInCodeInput(false);
                      }}
                      className="bg-zinc-950 hover:bg-zinc-900 border-2 border-zinc-800 hover:border-zinc-700 hover:text-rose-400 rounded-xl px-3 py-2 text-[10px] font-bold text-zinc-400 flex items-center gap-1.5 transition-all cursor-pointer active:scale-95 shrink-0 h-10"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>

                {/* Dashboard Sub-navigation tabs */}
                <div className="flex flex-wrap gap-1.5 rounded-2xl bg-zinc-950 p-1 border-2 border-zinc-800 self-start text-xs font-bold">
                  <button
                    onClick={() => setVendorRoleTab("orders")}
                    className={`px-4 py-2 rounded-xl transition-all cursor-pointer ${
                      vendorRoleTab === "orders" ? "bg-orange-500 text-white shadow-md border border-orange-400" : "text-zinc-400 hover:text-white"
                    }`}
                  >
                    Kitchen Orders ({activeVendorOrders.length})
                  </button>
                  <button
                    onClick={() => setVendorRoleTab("menu")}
                    className={`px-4 py-2 rounded-xl transition-all cursor-pointer ${
                      vendorRoleTab === "menu" ? "bg-orange-500 text-white shadow-md border border-orange-400" : "text-zinc-400 hover:text-white"
                    }`}
                  >
                    Menu & Stock
                  </button>
                  <button
                    onClick={() => setVendorRoleTab("analytics")}
                    className={`px-4 py-2 rounded-xl transition-all cursor-pointer ${
                      vendorRoleTab === "analytics" ? "bg-orange-500 text-white shadow-md border border-orange-400" : "text-zinc-400 hover:text-white"
                    }`}
                  >
                    Analytics
                  </button>
                  <button
                    onClick={() => setVendorRoleTab("support")}
                    className={`px-4 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
                      vendorRoleTab === "support" ? "bg-orange-500 text-white shadow-md border border-orange-400" : "text-zinc-400 hover:text-white"
                    }`}
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    AI Support Coach
                  </button>
                  <button
                    onClick={() => setVendorRoleTab("settings")}
                    className={`px-4 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
                      vendorRoleTab === "settings" ? "bg-orange-500 text-white shadow-md border border-orange-400" : "text-zinc-400 hover:text-white"
                    }`}
                  >
                    <Settings className="w-3.5 h-3.5 shrink-0" />
                    Stall Profile
                  </button>
                </div>
              </div>

              {/* Status/Approval Banner */}
              {selectedVendorObj.isApproved !== true && (
                <div className={`p-4 rounded-3xl border text-left mt-4 ${
                  selectedVendorObj.isApproved === "rejected" 
                    ? "bg-rose-500/10 border-rose-500/30 text-rose-400" 
                    : "bg-amber-500/10 border-amber-500/30 text-amber-400"
                }`}>
                  <div className="flex items-start gap-3">
                    {selectedVendorObj.isApproved === "rejected" ? (
                      <XCircle className="w-5 h-5 shrink-0 mt-0.5 text-rose-500" />
                    ) : (
                      <Clock className="w-5 h-5 shrink-0 mt-0.5 text-amber-500 animate-pulse" />
                    )}
                    <div className="space-y-1.5">
                      <h5 className="font-display font-black text-xs uppercase tracking-wider">
                        {selectedVendorObj.isApproved === "rejected" 
                          ? "Stall Registration Rejected" 
                          : "Stall Pending Organizer Approval"}
                      </h5>
                      <p className="text-[11px] text-zinc-300 leading-relaxed font-medium">
                        {selectedVendorObj.isApproved === "rejected" 
                          ? "This food stall registration has been rejected by the festival organizers. It will not appear on the festival map or menu list for attendees."
                          : "Your food stall registration is pending approval by the festival organizers. Your stall is NOT visible to festival attendees yet, which is why you are not receiving any orders."}
                      </p>
                      <p className="text-[11px] text-zinc-400 leading-relaxed font-bold">
                        {selectedVendorObj.isApproved === "rejected"
                          ? "Please contact festival administration to appeal or update your details."
                          : "To fix this: Go to 'Event Admin Console' at the top right, sign in, go to the 'Food Stall Registry' tab, find your stall under 'Pending Requests', and click 'Approve Stall' to make it live!"}
                      </p>
                      {selectedVendorObj.isApproved !== "rejected" && (
                        <div className="pt-1.5 flex gap-2">
                          <button
                            type="button"
                            onClick={async () => {
                              await handleApproveVendor(selectedVendorObj.id, true);
                              setNotification(`👑 Approved "${selectedVendorObj.name}" directly! Your stall is now live.`);
                            }}
                            className="bg-amber-500 hover:bg-amber-600 text-zinc-950 font-display font-black text-[10px] uppercase px-3 py-1.5 rounded-lg transition-all cursor-pointer shadow-sm"
                          >
                            Simulate Instant Admin Approval
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2.1: Kitchen Incoming Order Tickets */}
          {vendorRoleTab === "orders" && (
            <div className="space-y-4 animate-fadeIn">
              <div className="flex justify-between items-center">
                <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Live Active Kitchen Board</h4>
                <span className="text-[10px] font-mono text-zinc-500 font-bold">Webhook: connected</span>
              </div>

              {/* Interactive Live Traffic Simulator Controller */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-zinc-950 p-4 rounded-3xl border border-zinc-800 text-left">
                <div className="space-y-1">
                  <div className="text-[10px] font-black uppercase text-zinc-300 tracking-wider font-mono flex items-center gap-1.5">
                    <span className={`inline-flex h-2.5 w-2.5 rounded-full ${isAutoTrafficEnabled ? "bg-emerald-500 animate-pulse shadow-sm shadow-emerald-500/50" : "bg-zinc-600"}`}></span>
                    Live Customer Traffic Simulator
                  </div>
                  <p className="text-[11px] text-zinc-400 leading-normal font-medium max-w-md">
                    {isAutoTrafficEnabled 
                      ? "Enabled. Automatically generating realistic Swish-split client orders in real time to simulate high-demand peak rushes at Stockholm's Kungsträdgården!" 
                      : "Disabled. Paused background simulation. Turn on to let mock attendees place orders automatically so you can watch live tickets populate."}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setIsAutoTrafficEnabled(!isAutoTrafficEnabled);
                    setNotification(isAutoTrafficEnabled ? "⏸️ Background traffic paused." : "▶️ Background traffic resumed! Live orders will start arriving.");
                  }}
                  className={`px-4 py-2 rounded-xl font-display font-black text-[10px] uppercase tracking-wider border transition-all cursor-pointer shadow-sm shrink-0 active:scale-95 ${
                    isAutoTrafficEnabled 
                      ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/25" 
                      : "bg-zinc-900 text-zinc-400 border-zinc-800 hover:text-white hover:border-zinc-700"
                  }`}
                >
                  {isAutoTrafficEnabled ? "Pause Traffic" : "Resume Traffic"}
                </button>
              </div>

              {activeVendorOrders.length === 0 ? (
                <div className="border-2 border-dashed border-zinc-800 rounded-3xl p-12 text-center text-zinc-500 space-y-4">
                  <span className="text-4xl block">👨‍🍳</span>
                  <div className="space-y-2">
                    <p className="font-display font-black text-zinc-300 italic">All tickets cleared!</p>
                    <p className="text-xs text-zinc-500 max-w-sm mx-auto font-medium">Use the Attendee phone on the left to add items to the cart and pay via Swish to trigger a new order instantly.</p>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {activeVendorOrders.map((ord) => (
                    <div
                      key={ord.id}
                      className={`rounded-3xl border-2 p-5 flex flex-col justify-between space-y-4 shadow-md bg-zinc-950 transition-all ${
                        ord.status === "Placed" ? "border-orange-500/50" : "border-zinc-800"
                      }`}
                    >
                      <div className="space-y-3">
                        {/* Ticket meta */}
                        <div className="flex justify-between items-start border-b-2 border-zinc-900 pb-3">
                          <div>
                            <span className="font-display font-black text-xl text-white font-mono">#{ord.queueNumber}</span>
                            <span className="block text-[9px] text-zinc-500 font-bold font-mono uppercase tracking-wider">Time: {ord.timestamp} | {ord.customerName}</span>
                          </div>
                          
                          <span className={`text-[9px] font-black px-2.5 py-0.5 rounded-full uppercase border ${
                            ord.status === "Placed" ? "bg-orange-500/10 text-orange-400 border-orange-500/20" :
                            "bg-sky-500/10 text-sky-400 border-sky-500/20"
                          }`}>
                            {ord.status}
                          </span>
                        </div>

                         {/* Items listed */}
                        <div className="space-y-1.5 pl-1 text-left">
                          {ord.items.map((it, idx) => (
                            <div key={idx} className="space-y-0.5 border-b border-zinc-900/60 last:border-none pb-1.5 last:pb-0">
                              <div className="flex justify-between text-xs text-zinc-300 font-bold">
                                <span>{it.menuItem.name}</span>
                                <span className="font-mono text-zinc-500 font-black">x{it.quantity}</span>
                              </div>
                              {it.selectedExtras && it.selectedExtras.length > 0 && (
                                <p className="text-[10px] text-orange-400 font-black pl-1.5 leading-tight">
                                  + {it.selectedExtras.map(e => `${e.name} (+${e.price} kr)`).join(", ")}
                                </p>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* CTAs */}
                      <div className="border-t-2 border-zinc-900 pt-3 flex items-center justify-between gap-2">
                        <span className="font-mono text-xs font-black text-zinc-400">{ord.totalAmount} kr</span>
                        
                        {ord.status === "Placed" ? (
                          <button
                            onClick={() => updateOrderStatus(ord.id, "Preparing")}
                            className="bg-orange-500 hover:bg-orange-600 active:scale-95 text-white font-display font-black text-xs px-3.5 py-2 rounded-xl transition-all cursor-pointer shadow-md shadow-orange-500/10 uppercase tracking-wider"
                          >
                            Accept & Cook
                          </button>
                        ) : ord.status === "Preparing" ? (
                          <button
                            onClick={() => updateOrderStatus(ord.id, "Ready")}
                            className="bg-sky-600 hover:bg-sky-700 active:scale-95 text-white font-display font-black text-xs px-3.5 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-1 shadow-md shadow-sky-500/10 uppercase tracking-wider"
                          >
                            <CheckCircle className="w-4.5 h-4.5" />
                            Notify Ready
                          </button>
                        ) : (
                          <button
                            onClick={() => updateOrderStatus(ord.id, "Completed")}
                            className="bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-display font-black text-xs px-3.5 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-1 shadow-md shadow-emerald-500/10 uppercase tracking-wider"
                          >
                            <CheckCircle className="w-4.5 h-4.5" />
                            Complete & Serve
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 2.2: Menu and Stock Management */}
          {vendorRoleTab === "menu" && (
            <div className="space-y-4 animate-fadeIn">
              
              {/* Event Location & Booth Setup */}
              <div className="bg-zinc-950 border-2 border-zinc-800 rounded-3xl p-5 text-left space-y-3 shadow-md">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="min-w-0">
                    <span className="text-[9px] text-zinc-500 font-mono font-bold uppercase tracking-wider block">Booth Setup at Namaste Stockholm</span>
                    <span className="text-xs text-zinc-200 font-black flex items-center gap-1.5 mt-0.5">
                      <MapPin className="w-3.5 h-3.5 text-orange-500 shrink-0" />
                      Location: <span className="text-orange-400 truncate">{selectedVendorObj.location || "Kungsträdgården Square"}</span>
                    </span>
                  </div>

                  <button
                    onClick={() => {
                      if (isEditingLocation) {
                        updateVendorLocation(selectedVendorObj.id, editLocationText);
                        setIsEditingLocation(false);
                      } else {
                        setEditLocationText(selectedVendorObj.location || "");
                        setIsEditingLocation(true);
                      }
                    }}
                    className="bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 text-zinc-200 hover:text-white font-bold text-[10px] px-3.5 py-1.5 rounded-xl transition-all cursor-pointer active:scale-95 uppercase tracking-wider shrink-0"
                  >
                    {isEditingLocation ? "Save Changes" : "Update Location"}
                  </button>
                </div>

                {isEditingLocation && (
                  <div className="flex gap-2 items-center animate-fadeIn border-t border-zinc-900 pt-3">
                    <input
                      type="text"
                      placeholder="e.g., Booth #14, by the Main Fountain"
                      value={editLocationText}
                      onChange={(e) => setEditLocationText(e.target.value)}
                      className="flex-1 bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-200 focus:outline-none focus:border-orange-500 font-bold"
                    />
                    <button
                      onClick={() => setIsEditingLocation(false)}
                      className="text-zinc-500 hover:text-zinc-300 text-[10px] font-bold uppercase tracking-wider cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </div>

              {/* Add Menu Item Panel */}
              <div className="bg-zinc-950 border-2 border-zinc-800 rounded-3xl p-5 text-left space-y-4 shadow-md">
                <button
                  type="button"
                  onClick={() => setShowAddMenuForm(!showAddMenuForm)}
                  className="w-full flex items-center justify-between text-left focus:outline-none"
                >
                  <div className="space-y-0.5">
                    <span className="text-[9px] text-zinc-500 font-mono font-bold uppercase tracking-wider block">Menu Expansion</span>
                    <span className="text-xs font-black text-zinc-200 flex items-center gap-1.5 italic">
                      <Plus className="w-4 h-4 text-orange-500 shrink-0" />
                      Upload New Menu Item
                    </span>
                  </div>
                  <span className="bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-lg px-2.5 py-1 text-[9px] font-bold text-zinc-400 uppercase tracking-wider transition-all">
                    {showAddMenuForm ? "Collapse Form" : "Expand Form"}
                  </span>
                </button>

                {showAddMenuForm && (
                  <form
                    onSubmit={async (e) => {
                      e.preventDefault();
                      if (!newItemName.trim() || !newItemDesc.trim()) return;
                      await addMenuItem(selectedVendorObj.id, {
                        name: newItemName.trim(),
                        description: newItemDesc.trim(),
                        price: newItemPrice,
                        category: newItemCategory,
                        imageUrl: newItemImage,
                        stock: true
                      });
                      setNewItemName("");
                      setNewItemDesc("");
                      setNewItemPrice(110);
                      setShowAddMenuForm(false);
                      setNotification(`🍽️ Uploaded "${newItemName}" to your live festival menu!`);
                    }}
                    className="space-y-3.5 border-t border-zinc-900 pt-3.5 animate-fadeIn"
                  >
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-[9px] text-zinc-400 font-bold uppercase tracking-wider font-mono">Item Name</label>
                        <input
                          type="text"
                          placeholder="e.g., Crispy Masala Dosa"
                          value={newItemName}
                          onChange={(e) => setNewItemName(e.target.value)}
                          className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-200 focus:outline-none focus:border-orange-500 font-bold"
                          required
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[9px] text-zinc-400 font-bold uppercase tracking-wider font-mono">Price (SEK)</label>
                        <input
                          type="number"
                          placeholder="Price in SEK"
                          value={newItemPrice}
                          onChange={(e) => setNewItemPrice(parseInt(e.target.value) || 0)}
                          className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs font-mono font-bold text-orange-400 focus:outline-none focus:border-orange-500"
                          required
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-[9px] text-zinc-400 font-bold uppercase tracking-wider font-mono">Category</label>
                        <select
                          value={newItemCategory}
                          onChange={(e) => setNewItemCategory(e.target.value as any)}
                          className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs font-bold text-zinc-200 focus:outline-none focus:border-orange-500 cursor-pointer"
                        >
                          <option value="Food">Food</option>
                          <option value="Drink">Drink</option>
                          <option value="Snack">Snack</option>
                          <option value="Dessert">Dessert</option>
                        </select>
                      </div>
                      <div className="space-y-1">
                        <label className="text-[9px] text-zinc-400 font-bold uppercase tracking-wider font-mono">Image Preset / Illustration</label>
                        <select
                          value={newItemImage}
                          onChange={(e) => setNewItemImage(e.target.value)}
                          className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs font-bold text-zinc-200 focus:outline-none focus:border-orange-500 cursor-pointer"
                        >
                          <option value="https://images.unsplash.com/photo-1601050690597-df056fb4ce78?w=500&auto=format&fit=crop&q=60">🍛 Samosa / Chaat (Unsplash)</option>
                          <option value="https://images.unsplash.com/photo-1624462966581-bc6d768cbce5?w=500&auto=format&fit=crop&q=60">🌯 Naan Wrap (Unsplash)</option>
                          <option value="https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=500&auto=format&fit=crop&q=60">🥤 Mango Lassi (Unsplash)</option>
                          <option value="https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500&auto=format&fit=crop&q=60">🥘 South Indian Dosa (Unsplash)</option>
                          <option value="https://images.unsplash.com/photo-1562376502-6f769499c886?w=500&auto=format&fit=crop&q=60">🍚 Tandoori Biryani (Unsplash)</option>
                          <option value="https://images.unsplash.com/photo-1509440159596-0249088772ff?w=500&auto=format&fit=crop&q=60">🍩 Hot Gulab Jamun (Unsplash)</option>
                        </select>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[9px] text-zinc-400 font-bold uppercase tracking-wider font-mono">Item Description</label>
                      <textarea
                        placeholder="Describe the dish ingredients, spice level, or key details..."
                        value={newItemDesc}
                        onChange={(e) => setNewItemDesc(e.target.value)}
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-200 focus:outline-none focus:border-orange-500 font-medium h-16 resize-none"
                        required
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full bg-orange-500 hover:bg-orange-600 text-white font-display font-black py-2.5 rounded-xl text-xs uppercase tracking-wider transition-all shadow-md active:scale-[0.98] cursor-pointer"
                    >
                      Upload Item to Live Menu
                    </button>
                  </form>
                )}
              </div>

              <div className="flex justify-between items-center pt-2">
                <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Live Item Stock Control</h4>
                <span className="text-[10px] font-mono text-zinc-500 font-bold">Toggling sold out instantly disables items in attendee view</span>
              </div>

              <div className="space-y-3">
                {selectedVendorObj.menu.map((item) => (
                  <div
                    key={item.id}
                    className="bg-zinc-950 border-2 border-zinc-800 rounded-3xl p-5 flex flex-col gap-4 hover:border-zinc-700 transition-all shadow-md text-left"
                  >
                    <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 w-full">
                      <div className="flex items-center gap-3">
                        <img
                          src={item.imageUrl}
                          alt={item.name}
                          referrerPolicy="no-referrer"
                          className="w-12 h-12 rounded-xl object-cover bg-zinc-900 border-2 border-zinc-800 shrink-0"
                        />
                        <div>
                          <h5 className="font-display font-black text-xs md:text-sm text-zinc-200">{item.name}</h5>
                          <p className="text-[10px] text-zinc-500 font-medium">{item.description}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 self-end md:self-auto">
                        {/* Price input */}
                        <div className="flex items-center gap-2 text-xs">
                          <span className="text-zinc-500 font-bold uppercase text-[10px] tracking-wider">Price:</span>
                          <input
                            type="number"
                            value={item.price}
                            onChange={(e) => updateItemPrice(selectedVendorForConsole, item.id, parseInt(e.target.value) || 0)}
                            className="w-16 bg-zinc-900 border-2 border-zinc-800 rounded-lg px-2 py-1.5 font-mono font-black text-orange-400 focus:outline-none focus:border-orange-500 text-center text-xs"
                          />
                          <span className="text-zinc-400 font-bold font-mono">kr</span>
                        </div>

                        {/* Stock toggle */}
                        <button
                          onClick={() => toggleItemStock(selectedVendorForConsole, item.id)}
                          className="flex items-center gap-1 text-xs cursor-pointer focus:outline-none"
                        >
                          {item.stock ? (
                            <div className="flex items-center gap-1.5 text-emerald-400 font-bold">
                              <span className="text-[10px] uppercase tracking-wider">In Stock</span>
                              <ToggleRight className="w-8 h-8 text-emerald-500" />
                            </div>
                          ) : (
                            <div className="flex items-center gap-1.5 text-rose-500 font-bold">
                              <span className="text-[10px] uppercase tracking-wider">Sold Out</span>
                              <ToggleLeft className="w-8 h-8 text-rose-500" />
                            </div>
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Extras / Add-ons Manager section */}
                    <div className="border-t border-zinc-900 pt-4 w-full space-y-3">
                      <div className="flex justify-between items-center flex-wrap gap-1">
                        <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider font-mono">Add-ons & Extras Configuration</span>
                        <span className="text-[9px] text-zinc-500 font-medium">Attendees can select these when adding to cart</span>
                      </div>

                      {/* Add Extra Form */}
                      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 bg-zinc-900/40 p-2.5 rounded-2xl border border-zinc-900/80">
                        <input
                          type="text"
                          placeholder="Add-on Name (e.g., Extra Cheese)"
                          id={`new-extra-name-${item.id}`}
                          className="flex-1 bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-1.5 text-[10px] text-zinc-200 focus:outline-none focus:border-orange-500 font-bold"
                        />
                        <div className="w-full sm:w-28 flex items-center justify-between sm:justify-start gap-2">
                          <input
                            type="number"
                            placeholder="Price"
                            id={`new-extra-price-${item.id}`}
                            className="w-16 bg-zinc-950 border border-zinc-800 rounded-xl px-2 py-1.5 font-mono text-[10px] font-bold text-orange-400 text-center focus:outline-none focus:border-orange-500"
                          />
                          <span className="text-[10px] text-zinc-500 font-bold font-mono">kr</span>
                        </div>
                        <button
                          onClick={() => {
                            const nameInput = document.getElementById(`new-extra-name-${item.id}`) as HTMLInputElement;
                            const priceInput = document.getElementById(`new-extra-price-${item.id}`) as HTMLInputElement;
                            if (nameInput && priceInput) {
                              const name = nameInput.value;
                              const price = parseInt(priceInput.value) || 0;
                              if (name.trim()) {
                                addExtraOption(selectedVendorForConsole, item.id, name, price);
                                nameInput.value = "";
                                priceInput.value = "";
                              }
                            }
                          }}
                          className="bg-orange-500 hover:bg-orange-600 text-white font-bold text-[9px] px-3.5 py-2 rounded-xl flex items-center justify-center gap-1 transition-all cursor-pointer active:scale-95 uppercase tracking-wider shadow-md shrink-0"
                        >
                          <Plus className="w-3 h-3 stroke-[3px]" /> Add Option
                        </button>
                      </div>

                      {/* Extras list */}
                      {item.extras && item.extras.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                          {item.extras.map((ext) => (
                            <div
                              key={ext.id}
                              className="bg-zinc-900/60 border border-zinc-900/80 rounded-xl px-2.5 py-1.5 flex justify-between items-center text-[10px] text-zinc-300 font-bold hover:border-zinc-800 hover:bg-zinc-900 transition-all"
                            >
                              <div className="min-w-0 text-left pr-1">
                                <span className="block text-zinc-200 truncate leading-tight">{ext.name}</span>
                                <span className="text-[9px] text-orange-400 font-mono font-bold font-black">+{ext.price} kr</span>
                              </div>
                              <button
                                onClick={() => removeExtraOption(selectedVendorForConsole, item.id, ext.id)}
                                className="p-1 text-zinc-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-all cursor-pointer active:scale-90"
                                title="Delete add-on option"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-[10px] text-zinc-600 font-bold italic text-left pl-1">No custom add-ons configured for this item yet. Use the form above to add some!</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 2.3: Analytics */}
          {vendorRoleTab === "analytics" && (
            <VendorAnalytics 
              vendor={selectedVendorObj} 
              orders={vendorOrders} 
            />
          )}

          {/* TAB 2.4: Support AI Coach */}
          {vendorRoleTab === "support" && (
            <div className="h-[480px] animate-fadeIn">
              <SupportChat 
                type="vendor" 
                vendorName={selectedVendorObj.name} 
              />
            </div>
          )}

          {/* TAB 2.5: Stall Settings (Swish Integration & Profile) */}
          {vendorRoleTab === "settings" && (
            <div className="animate-fadeIn">
              <VendorSettings 
                vendor={selectedVendorObj}
                onUpdateVendorProfile={handleUpdateVendorProfile}
              />
            </div>
          )}
        </>)}
      </div>
      </div>
      </div>
      )}

      {/* Table QR Code Generator Modal */}
      <TableQrGenerator
        vendor={selectedVendorObj}
        isOpen={showQrModal}
        onClose={() => setShowQrModal(false)}
        onSimulateScan={handleSimulateScan}
      />
    </div>
  );
}
