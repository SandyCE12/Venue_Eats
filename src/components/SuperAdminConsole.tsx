import React, { useState } from "react";
import { 
  Building2, 
  Calendar, 
  MapPin, 
  Users, 
  TrendingUp, 
  Plus, 
  Search, 
  Download, 
  Filter, 
  CheckCircle2, 
  Clock, 
  DollarSign, 
  Award, 
  BarChart3, 
  Layers, 
  Zap, 
  ShieldCheck, 
  X, 
  FileJson, 
  Check, 
  Store, 
  RefreshCw,
  Sparkles,
  ArrowUpRight,
  Archive,
  Radio,
  Lock,
  LogOut,
  UserCheck,
  ShieldAlert,
  KeyRound,
  Copy,
  Eye,
  EyeOff,
  Edit3,
  ExternalLink,
  Save,
  Sliders,
  Mail,
  Send,
  Loader2,
  Trash2,
  AlertCircle,
  Receipt,
  ShoppingBag,
  CreditCard,
  ArrowDownRight,
  FileSpreadsheet,
  CheckCheck,
  Landmark,
  Phone,
  ChevronDown,
  ChevronUp,
  ChevronRight
} from "lucide-react";
import type { ManagedEvent, EventStatus, EventAdminPermissions, Vendor, Order } from "../types";
import { useApp } from "../context/AppContext";
import { AUTHORIZED_SUPER_ADMINS } from "../data";
import { AdminStoreDetailModal } from "./AdminStoreDetailModal";

interface SuperAdminConsoleProps {
  managedEvents?: ManagedEvent[];
  events?: ManagedEvent[];
  activeEventId: string;
  onSelectEvent?: (eventId: string) => void;
  onSelectActiveEvent?: (eventId: string) => void;
  onAddNewEvent: (newEvent: ManagedEvent) => void;
  onUpdateEventStatus: (eventId: string, status: EventStatus) => void;
  onUpdateEvent?: (updatedEvent: ManagedEvent) => void;
  onDeleteEvent?: (eventId: string) => void;
  onUpdateEventMap?: () => void;
}

const FALLBACK_SUPERADMIN_ORDERS: Order[] = [
  {
    id: "ord-super-101",
    queueNumber: 101,
    vendorId: "v1",
    vendorName: "Delhi Street Sensation",
    customerName: "Lars Lindqvist",
    customerPhone: "+46 70 123 4567",
    timestamp: "14:45",
    createdAt: Date.now() - 1000 * 60 * 16,
    status: "Completed",
    totalAmount: 269.10,
    vendorSwishShareSEK: 260.00,
    platformFeeSEK: 9.10,
    paymentMethod: "Swish",
    items: [
      {
        menuItem: { id: "m1_1", name: "Butter Chicken Naan Roll", price: 135, description: "", category: "Food", stock: true },
        quantity: 1,
        selectedExtras: [{ id: "e1_1", name: "Extra Garlic Butter Glaze", price: 15 }]
      },
      {
        menuItem: { id: "m1_3", name: "Mango Lassi Frappé", price: 55, description: "", category: "Drink", stock: true },
        quantity: 2
      }
    ]
  },
  {
    id: "ord-super-102",
    queueNumber: 102,
    vendorId: "v1",
    vendorName: "Delhi Street Sensation",
    customerName: "Sofia Bergman",
    customerPhone: "+46 72 987 6543",
    timestamp: "14:48",
    createdAt: Date.now() - 1000 * 60 * 13,
    status: "Ready",
    totalAmount: 175.95,
    vendorSwishShareSEK: 170.00,
    platformFeeSEK: 5.95,
    paymentMethod: "Swish",
    items: [
      {
        menuItem: { id: "m1_2", name: "Crispy Samosa Chaat Bowl", price: 115, description: "", category: "Food", stock: true },
        quantity: 1
      },
      {
        menuItem: { id: "m1_3", name: "Mango Lassi Frappé", price: 55, description: "", category: "Drink", stock: true },
        quantity: 1
      }
    ]
  },
  {
    id: "ord-super-103",
    queueNumber: 103,
    vendorId: "v2",
    vendorName: "Bombay Cutting Chai & Bun Maska",
    customerName: "Mikael Ekström",
    customerPhone: "+46 73 555 1290",
    timestamp: "14:50",
    createdAt: Date.now() - 1000 * 60 * 11,
    status: "Preparing",
    totalAmount: 170.78,
    vendorSwishShareSEK: 165.00,
    platformFeeSEK: 5.78,
    paymentMethod: "Swish",
    items: [
      {
        menuItem: { id: "m2_1", name: "Mumbai Vada Pav Slider (2 pcs)", price: 95, description: "", category: "Food", stock: true },
        quantity: 1
      },
      {
        menuItem: { id: "m2_3", name: "Masala Cutting Chai", price: 35, description: "", category: "Drink", stock: true },
        quantity: 2
      }
    ]
  },
  {
    id: "ord-super-104",
    queueNumber: 104,
    vendorId: "v3",
    vendorName: "Kerala Coastal Spice Shack",
    customerName: "Elin Wallin",
    customerPhone: "+46 76 333 4455",
    timestamp: "14:52",
    createdAt: Date.now() - 1000 * 60 * 9,
    status: "Preparing",
    totalAmount: 217.35,
    vendorSwishShareSEK: 210.00,
    platformFeeSEK: 7.35,
    paymentMethod: "Swish",
    items: [
      {
        menuItem: { id: "m3_1", name: "Malabar Fried Prawn Cone", price: 145, description: "", category: "Food", stock: true },
        quantity: 1
      },
      {
        menuItem: { id: "m3_3", name: "Fresh Tender Coconut Cooler", price: 65, description: "", category: "Drink", stock: true },
        quantity: 1
      }
    ]
  },
  {
    id: "ord-super-105",
    queueNumber: 105,
    vendorId: "v4",
    vendorName: "Jaipur Palace Sweets & Kulfi",
    customerName: "Oscar Nilsson",
    customerPhone: "+46 70 888 9911",
    timestamp: "14:54",
    createdAt: Date.now() - 1000 * 60 * 7,
    status: "Placed",
    totalAmount: 144.90,
    vendorSwishShareSEK: 140.00,
    platformFeeSEK: 4.90,
    paymentMethod: "Swish",
    items: [
      {
        menuItem: { id: "m4_1", name: "Warm Gulab Jamun & Rabdi", price: 75, description: "", category: "Dessert", stock: true },
        quantity: 1
      },
      {
        menuItem: { id: "m4_2", name: "Royal Kesar Pista Kulfi Stick", price: 65, description: "", category: "Dessert", stock: true },
        quantity: 1
      }
    ]
  },
  {
    id: "ord-super-106",
    queueNumber: 106,
    vendorId: "v8",
    vendorName: "Napoli Woodfire Crusts",
    customerName: "Astrid Lindgren",
    customerPhone: "+46 72 111 2233",
    timestamp: "14:55",
    createdAt: Date.now() - 1000 * 60 * 5,
    status: "Preparing",
    totalAmount: 338.45,
    vendorSwishShareSEK: 327.00,
    platformFeeSEK: 11.45,
    paymentMethod: "Swish",
    items: [
      {
        menuItem: { id: "m8_1", name: "Margherita D.O.P Folded Pizza", price: 119, description: "", category: "Food", stock: true },
        quantity: 1,
        selectedExtras: [{ id: "e8_1", name: "Add Creamy Burrata Center", price: 35 }]
      },
      {
        menuItem: { id: "m8_2", name: "Prosciutto & Truffle Panuozzo", price: 135, description: "", category: "Food", stock: true },
        quantity: 1
      },
      {
        menuItem: { id: "m8_3", name: "San Pellegrino Blood Orange", price: 38, description: "", category: "Drink", stock: true },
        quantity: 1
      }
    ]
  },
  {
    id: "ord-super-107",
    queueNumber: 107,
    vendorId: "v9",
    vendorName: "Beirut Mezze & Shawarma",
    customerName: "Johan Frisk",
    customerPhone: "+46 73 999 0011",
    timestamp: "14:57",
    createdAt: Date.now() - 1000 * 60 * 3,
    status: "Placed",
    totalAmount: 186.30,
    vendorSwishShareSEK: 180.00,
    platformFeeSEK: 6.30,
    paymentMethod: "Swish",
    items: [
      {
        menuItem: { id: "m9_1", name: "Spiced Chicken Shawarma Wrap", price: 125, description: "", category: "Food", stock: true },
        quantity: 1,
        selectedExtras: [{ id: "e9_1", name: "Extra Toum Garlic Sauce", price: 15 }, { id: "e9_2", name: "Add Spicy Harissa", price: 10 }]
      },
      {
        menuItem: { id: "m9_3", name: "Ayran Mint Yogurt Cooler", price: 30, description: "", category: "Drink", stock: true },
        quantity: 1
      }
    ]
  },
  {
    id: "ord-super-108",
    queueNumber: 108,
    vendorId: "v15",
    vendorName: "Formosa Bao & Dumpling House",
    customerName: "Karin Sundström",
    customerPhone: "+46 76 222 3344",
    timestamp: "14:59",
    createdAt: Date.now() - 1000 * 60 * 1,
    status: "Placed",
    totalAmount: 269.10,
    vendorSwishShareSEK: 260.00,
    platformFeeSEK: 9.10,
    paymentMethod: "Swish",
    items: [
      {
        menuItem: { id: "m15_1", name: "Classic Braised Pork Belly Gua Bao (2 pcs)", price: 110, description: "", category: "Food", stock: true },
        quantity: 1
      },
      {
        menuItem: { id: "m15_2", name: "Pan-Fried Pork & Chive Dumplings (6 pcs)", price: 95, description: "", category: "Food", stock: true },
        quantity: 1
      },
      {
        menuItem: { id: "m15_3", name: "Taiwanese Brown Sugar Milk", price: 55, description: "", category: "Drink", stock: true },
        quantity: 1
      }
    ]
  }
];

export default function SuperAdminConsole({
  managedEvents,
  events: passedEvents,
  activeEventId,
  onSelectEvent,
  onSelectActiveEvent,
  onAddNewEvent,
  onUpdateEventStatus,
  onUpdateEvent,
  onDeleteEvent,
}: SuperAdminConsoleProps) {
  const events = managedEvents || passedEvents || [];
  const handleSelectEvent = onSelectEvent || onSelectActiveEvent || (() => {});
  // Super Admin Authentication State (default to true for instant demo access, or false if user clicks Logout)
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(true);
  const [loginEmail, setLoginEmail] = useState("admin@creativeventsnordic.com");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginError, setLoginError] = useState<string | null>(null);

  const [activeTab, setActiveTab] = useState<"live" | "settlements" | "orders" | "credentials" | "history" | "create">("live");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"All" | "Live" | "Scheduled" | "Completed">("All");
  const [categoryFilter, setCategoryFilter] = useState<string>("All");
  const [yearFilter, setYearFilter] = useState<string>("All");

  // Selected event for detail inspection modal
  const [inspectEvent, setInspectEvent] = useState<ManagedEvent | null>(null);

  // Selected event for editing details & credentials modal
  const [editEvent, setEditEvent] = useState<ManagedEvent | null>(null);
  const [editTab, setEditTab] = useState<"details" | "credentials">("details");
  const [showPasswordMap, setShowPasswordMap] = useState<{ [id: string]: boolean }>({});
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [sendingEmailId, setSendingEmailId] = useState<string | null>(null);
  const [emailSentMap, setEmailSentMap] = useState<{ [id: string]: boolean }>({});

  const [eventToDelete, setEventToDelete] = useState<ManagedEvent | null>(null);
  const [invitationModalEvent, setInvitationModalEvent] = useState<{ event: ManagedEvent; password?: string } | null>(null);

  // Direct modal Resend API dispatch states
  const [isDispatchingModalEmail, setIsDispatchingModalEmail] = useState(false);
  const [modalDispatchResult, setModalDispatchResult] = useState<{
    success?: boolean;
    message?: string;
    error?: string;
    id?: string;
  } | null>(null);
  const [customResendKeyInput, setCustomResendKeyInput] = useState(() => {
    return typeof window !== "undefined" ? localStorage.getItem("venueeat_resend_api_key") || "" : "";
  });
  const [showKeyConfig, setShowKeyConfig] = useState(false);

  // Settlements & Master Orders states
  const [selectedEventIdFilter, setSelectedEventIdFilter] = useState<string>("All");
  const [selectedVendorFilter, setSelectedVendorFilter] = useState<string>("All");
  const [orderStatusFilter, setOrderStatusFilter] = useState<string>("All");
  const [orderSearchQuery, setOrderSearchQuery] = useState<string>("");
  const [inspectVendor, setInspectVendor] = useState<Vendor | null>(null);
  const [settledVendorsMap, setSettledVendorsMap] = useState<{ [vendorId: string]: { settledAt: string; reference: string } }>(() => {
    try {
      const saved = localStorage.getItem("venueeat_superadmin_settlements_v1");
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const {
    dispatchAdminInvitationEmail,
    orders: liveOrders = [],
    vendors: liveVendors = [],
    handleUpdateVendorProfile,
    handleApproveVendor,
    handleSuspendVendor
  } = useApp();

  const allOrders: Order[] = liveOrders && liveOrders.length > 0 ? liveOrders : FALLBACK_SUPERADMIN_ORDERS;
  const allVendors: Vendor[] = liveVendors && liveVendors.length > 0 ? liveVendors : [];

  // Stall expansion state in settlements view
  const [expandedVendorId, setExpandedVendorId] = useState<string | null>(null);

  // Exact 3.5% calculation on each individual order rounded to 2 decimal places (standard banking/currency)
  // RULE (Additive Fee):
  // 1. Food Cost: The original item price(s) + extras (vendor's revenue).
  // 2. Platform Cut: 3.5% added ON TOP of the food cost (Math.round(foodCost * 0.035 * 100) / 100).
  // 3. Total Bill: Food Cost + 3.5% Platform Cut (gross amount collected via Swish from attendee).
  // 4. Vendor Payout / Net Cut: 100% of Food Cost (Vendor gets full menu price, zero deduction!).
  const getOrderFoodCost = (o: Order): number => {
    if (o.items && o.items.length > 0) {
      const itemsSum = o.items.reduce((sum, it) => {
        const itemPrice = it.menuItem?.price || 0;
        const extrasPrice = it.selectedExtras?.reduce((es, e) => es + (e.price || 0), 0) || 0;
        return sum + (itemPrice + extrasPrice) * (it.quantity || 1);
      }, 0);
      if (itemsSum > 0) return Math.round(itemsSum * 100) / 100;
    }
    if (typeof o.vendorSwishPaid === "number" && o.vendorSwishPaid > 0) {
      return Math.round(o.vendorSwishPaid * 100) / 100;
    }
    if (typeof o.vendorSwishShareSEK === "number" && o.vendorSwishShareSEK > 0) {
      return Math.round(o.vendorSwishShareSEK * 100) / 100;
    }
    return Math.round((o.totalAmount || 0) * 100) / 100;
  };

  const getOrderPlatformFee = (o: Order): number => {
    if (typeof o.platformFeeSEK === "number") {
      return Math.round(o.platformFeeSEK * 100) / 100;
    }
    if (typeof o.platformSwishPaid === "number") {
      return Math.round(o.platformSwishPaid * 100) / 100;
    }
    const food = getOrderFoodCost(o);
    return Math.round(food * 0.035 * 100) / 100;
  };

  const getOrderVendorCut = (o: Order): number => {
    return getOrderFoodCost(o);
  };

  const getOrderTotalBill = (o: Order): number => {
    const food = getOrderFoodCost(o);
    const fee = getOrderPlatformFee(o);
    return Math.round((food + fee) * 100) / 100;
  };

  const formatSEK = (val: number): string => {
    const rounded = Math.round((val || 0) * 100) / 100;
    if (Math.abs(rounded) < 0.001) return "0.00";
    return rounded.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const toggleVendorSettlement = (vendorId: string) => {
    setSettledVendorsMap(prev => {
      const next = { ...prev };
      if (next[vendorId]) {
        delete next[vendorId];
      } else {
        next[vendorId] = {
          settledAt: new Date().toISOString().replace("T", " ").substring(0, 16),
          reference: `PAY-SE-${Math.floor(100000 + Math.random() * 900000)}`
        };
      }
      try {
        localStorage.setItem("venueeat_superadmin_settlements_v1", JSON.stringify(next));
      } catch (err) {
        console.warn("Could not save settlement state", err);
      }
      return next;
    });
  };

  const vendorSettlementSummaries = allVendors
    .filter(v => {
      if (selectedEventIdFilter === "All") return true;
      return (v.eventId || "evt-001") === selectedEventIdFilter;
    })
    .map(vendor => {
      const vendorOrders = allOrders.filter(o => o.vendorId === vendor.id);
      const ordersCount = vendorOrders.length;
      // Calculate food sales (vendor due), 3.5% platform fee added, and total Swish bill collected
      const foodSales = vendorOrders.reduce((sum, o) => sum + getOrderFoodCost(o), 0);
      const platformFee = vendorOrders.reduce((sum, o) => sum + getOrderPlatformFee(o), 0);
      const grossAmount = vendorOrders.reduce((sum, o) => sum + getOrderTotalBill(o), 0);
      const netPayout = foodSales; // Vendor receives 100% of food sales
      const matchedEvent = events.find(e => e.id === (vendor.eventId || "evt-001")) || events[0];
      const isSettled = !!settledVendorsMap[vendor.id];
      const settlementInfo = settledVendorsMap[vendor.id];

      return {
        vendor,
        eventName: matchedEvent?.name || "Stockholm Festival",
        eventCode: matchedEvent?.code || "EVT",
        orders: vendorOrders,
        ordersCount,
        grossAmount: Math.round(grossAmount * 100) / 100, // Total Swish Bill collected
        platformFee: Math.round(platformFee * 100) / 100, // 3.5% added fee
        netPayout: Math.round(netPayout * 100) / 100,     // 100% food price due to vendor
        isSettled,
        settlementInfo,
        hasBankDetails: !!(vendor.bankAccountNumber || vendor.bankGiro || vendor.swishNumber)
      };
    });

  const totalSettlementGross = vendorSettlementSummaries.reduce((sum, s) => sum + s.grossAmount, 0);
  const totalSettlementPlatformFee = vendorSettlementSummaries.reduce((sum, s) => sum + s.platformFee, 0);
  const totalSettlementNetPayout = vendorSettlementSummaries.reduce((sum, s) => sum + s.netPayout, 0);
  const totalSettlementOrders = vendorSettlementSummaries.reduce((sum, s) => sum + s.ordersCount, 0);
  const totalSettledStalls = vendorSettlementSummaries.filter(s => s.isSettled).length;

  const handleExportSettlementCsv = () => {
    const headers = [
      "Vendor ID",
      "Stall Name",
      "Stall Number",
      "Event Name",
      "Bank Name",
      "Clearing Number",
      "Account Number",
      "Bankgiro",
      "Plusgiro",
      "Swish Number",
      "Account Holder",
      "Total Orders",
      "Food Sales (SEK)",
      "Platform Fee 3.5% Added (SEK)",
      "Total Swish Intake (SEK)",
      "Net Vendor Payout (SEK)",
      "Settlement Status",
      "Payout Reference",
      "Settled Timestamp"
    ];

    const rows = vendorSettlementSummaries.map(s => [
      `"${s.vendor.id}"`,
      `"${s.vendor.name}"`,
      `"${s.vendor.stallNumber || ''}"`,
      `"${s.eventName}"`,
      `"${s.vendor.bankName || 'Not Set'}"`,
      `"${s.vendor.bankClearingNumber || ''}"`,
      `"${s.vendor.bankAccountNumber || ''}"`,
      `"${s.vendor.bankGiro || ''}"`,
      `"${s.vendor.plusGiro || ''}"`,
      `"${s.vendor.swishNumber || ''}"`,
      `"${s.vendor.bankAccountHolder || s.vendor.name}"`,
      s.ordersCount,
      s.netPayout.toFixed(2),
      s.platformFee.toFixed(2),
      s.grossAmount.toFixed(2),
      s.netPayout.toFixed(2),
      s.isSettled ? "Settled" : "Pending",
      `"${s.settlementInfo?.reference || ''}"`,
      `"${s.settlementInfo?.settledAt || ''}"`
    ]);

    const csvContent = "\uFEFF" + [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `venueeat-settlements-${selectedEventIdFilter === "All" ? "all-festivals" : selectedEventIdFilter}-${new Date().toISOString().split("T")[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const filteredMasterOrders = allOrders.filter(o => {
    const orderVendor = allVendors.find(v => v.id === o.vendorId);
    const orderEventId = orderVendor?.eventId || "evt-001";
    if (selectedEventIdFilter !== "All" && orderEventId !== selectedEventIdFilter) {
      return false;
    }
    if (selectedVendorFilter !== "All" && o.vendorId !== selectedVendorFilter) {
      return false;
    }
    if (orderStatusFilter !== "All" && o.status !== orderStatusFilter) {
      return false;
    }
    if (orderSearchQuery.trim()) {
      const q = orderSearchQuery.toLowerCase();
      const matchesQueue = o.queueNumber?.toString().includes(q) || `q-${o.queueNumber}`.toLowerCase().includes(q);
      const matchesCustomer = o.customerName?.toLowerCase().includes(q) || o.customerPhone?.toLowerCase().includes(q);
      const matchesVendor = o.vendorName?.toLowerCase().includes(q);
      const matchesItems = o.items?.some(i => i.menuItem?.name?.toLowerCase().includes(q));
      if (!matchesQueue && !matchesCustomer && !matchesVendor && !matchesItems) {
        return false;
      }
    }
    return true;
  });

  const masterOrdersGross = filteredMasterOrders.reduce((sum, o) => sum + getOrderTotalBill(o), 0);
  const masterOrdersVendorCut = filteredMasterOrders.reduce((sum, o) => sum + getOrderVendorCut(o), 0);
  const masterOrdersPlatformCut = filteredMasterOrders.reduce((sum, o) => sum + getOrderPlatformFee(o), 0);

  const handleConfirmDelete = () => {
    if (!eventToDelete) return;
    if (onDeleteEvent) {
      onDeleteEvent(eventToDelete.id);
    }
    if (inspectEvent && inspectEvent.id === eventToDelete.id) {
      setInspectEvent(null);
    }
    if (editEvent && editEvent.id === eventToDelete.id) {
      setEditEvent(null);
    }
    setEventToDelete(null);
  };

  const handleDirectResendFromModal = async () => {
    if (!invitationModalEvent) return;
    setIsDispatchingModalEmail(true);
    setModalDispatchResult(null);

    try {
      if (dispatchAdminInvitationEmail) {
        const res = await dispatchAdminInvitationEmail(
          invitationModalEvent.event,
          invitationModalEvent.password,
          customResendKeyInput.trim() || undefined
        );
        setModalDispatchResult(res);
        if (res.success) {
          setEmailSentMap(prev => ({ ...prev, [invitationModalEvent.event.id]: true }));
        }
      }
    } catch (err: any) {
      setModalDispatchResult({
        success: false,
        error: err?.message || "Unexpected error triggering Resend delivery.",
      });
    } finally {
      setIsDispatchingModalEmail(false);
    }
  };

  const handleSendAdminEmail = async (evt: ManagedEvent) => {
    // Open on-screen modal and trigger direct Resend dispatch
    setInvitationModalEvent({ event: evt, password: evt.adminPassword || "eventadmin2026" });
    setIsDispatchingModalEmail(true);
    setModalDispatchResult(null);
    setSendingEmailId(evt.id);

    try {
      if (dispatchAdminInvitationEmail) {
        const res = await dispatchAdminInvitationEmail(
          evt, 
          evt.adminPassword, 
          customResendKeyInput.trim() || undefined
        );
        setModalDispatchResult(res);
        if (res.success) {
          setEmailSentMap(prev => ({ ...prev, [evt.id]: true }));
        }
      }
    } catch (e: any) {
      setModalDispatchResult({
        success: false,
        error: e?.message || "Could not dispatch email via Resend API",
      });
    } finally {
      setIsDispatchingModalEmail(false);
      setSendingEmailId(null);
    }
  };

  // Edit Event Form state
  const [editName, setEditName] = useState("");
  const [editCode, setEditCode] = useState("");
  const [editStatus, setEditStatus] = useState<EventStatus>("Live");
  const [editLocation, setEditLocation] = useState("");
  const [editAttendees, setEditAttendees] = useState("25000");
  const [editStartDate, setEditStartDate] = useState("2026-05-23");
  const [editEndDate, setEditEndDate] = useState("2026-05-23");
  const [editSwishId, setEditSwishId] = useState("");
  const [editCategory, setEditCategory] = useState<ManagedEvent["category"]>("Cultural & Food");
  const [editDescription, setEditDescription] = useState("");
  const [editMapImageUrl, setEditMapImageUrl] = useState("");
  const [editAdminName, setEditAdminName] = useState("");
  const [editAdminEmail, setEditAdminEmail] = useState("");
  const [editAdminPassword, setEditAdminPassword] = useState("");
  const [editPermDetails, setEditPermDetails] = useState(true);
  const [editPermVendors, setEditPermVendors] = useState(true);
  const [editPermMap, setEditPermMap] = useState(true);
  const [editPermFinancials, setEditPermFinancials] = useState(true);
  const [editSuccessMsg, setEditSuccessMsg] = useState<string | null>(null);

  // Feedback for download
  const [downloaded, setDownloaded] = useState(false);

  // Form state for creating a new event
  const [formName, setFormName] = useState("");
  const [formCode, setFormCode] = useState("");
  const [formLocation, setFormLocation] = useState("Kungsträdgården, Stockholm");
  const [formAttendees, setFormAttendees] = useState("30000");
  const [formStartDate, setFormStartDate] = useState("2026-08-15");
  const [formEndDate, setFormEndDate] = useState("2026-08-17");
  const [formSwishId, setFormSwishId] = useState("123 992 10 44");
  const [formCategory, setFormCategory] = useState<ManagedEvent["category"]>("Cultural & Food");
  const [formEmail, setFormEmail] = useState("organizer@stockholmevents.se");
  const [formAdminName, setFormAdminName] = useState("Festival Operations Director");
  const [formAdminPassword, setFormAdminPassword] = useState("eventadmin2026");
  const [formPermDetails, setFormPermDetails] = useState(true);
  const [formPermVendors, setFormPermVendors] = useState(true);
  const [formPermMap, setFormPermMap] = useState(true);
  const [formPermFinancials, setFormPermFinancials] = useState(true);
  const [formDescription, setFormDescription] = useState("");
  const [formMapImageUrl, setFormMapImageUrl] = useState("");
  const [formSuccess, setFormSuccess] = useState<string | null>(null);

  // Helper to open Edit Event Details & Admin Access modal
  const handleOpenEditModal = (evt: ManagedEvent, initialTab: "details" | "credentials" = "details") => {
    setEditEvent(evt);
    setEditTab(initialTab);
    setEditName(evt.name);
    setEditCode(evt.code);
    setEditStatus(evt.status);
    setEditLocation(evt.location);
    setEditAttendees(evt.attendeesCount.toString());
    setEditStartDate(evt.startDate);
    setEditEndDate(evt.endDate);
    setEditSwishId(evt.swishMerchantId);
    setEditCategory(evt.category);
    setEditDescription(evt.description);
    setEditMapImageUrl(evt.mapImageUrl || "");
    setEditAdminName(evt.adminName || "Event Organizer");
    setEditAdminEmail(evt.organizerEmail);
    setEditAdminPassword(evt.adminPassword || "admin123");
    setEditPermDetails(evt.adminPermissions?.canEditDetails !== false);
    setEditPermVendors(evt.adminPermissions?.canManageVendors !== false);
    setEditPermMap(evt.adminPermissions?.canManageMap !== false);
    setEditPermFinancials(evt.adminPermissions?.canViewFinancials !== false);
    setEditSuccessMsg(null);
  };

  // Helper to generate a fresh password
  const generateNewPassword = () => {
    const words = ["Nordic", "Stockholm", "Venue", "Festival", "Viking", "Gateway"];
    const chosenWord = words[Math.floor(Math.random() * words.length)];
    const num = Math.floor(1000 + Math.random() * 9000);
    return `${chosenWord}-${num}`;
  };

  // Helper to copy handover note
  const handleCopyCredentials = (evt: ManagedEvent) => {
    const portalUrl = `${window.location.origin}/admin`;
    const pwd = evt.adminPassword || "admin123";
    const perms = [
      evt.adminPermissions?.canEditDetails !== false ? "Edit Details" : null,
      evt.adminPermissions?.canManageVendors !== false ? "Vendor Approvals" : null,
      evt.adminPermissions?.canManageMap !== false ? "Venue Map" : null,
      evt.adminPermissions?.canViewFinancials !== false ? "Financial Audits" : null
    ].filter(Boolean).join(", ");

    const text = `VenueEat Event Admin Credentials Handover
--------------------------------------------------
Event: ${evt.name} (${evt.code})
Venue Location: ${evt.location}
Dates: ${evt.startDate} to ${evt.endDate}
Admin Portal URL: ${portalUrl}
Login ID (Email): ${evt.organizerEmail}
Password: ${pwd}
Assigned Lead: ${evt.adminName || "Event Organizer"}
Granted Privileges: ${perms}
--------------------------------------------------
Access instructions: Open the portal link, enter your Login ID & Password to manage vendors, live orders, and festival settings.`;

    navigator.clipboard.writeText(text);
    setCopiedId(evt.id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  // Handle Save Edit Form Submission
  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editEvent) return;

    const updated: ManagedEvent = {
      ...editEvent,
      name: editName.trim() || editEvent.name,
      code: editCode.trim().toUpperCase() || editEvent.code,
      status: editStatus,
      location: editLocation.trim() || editEvent.location,
      attendeesCount: parseInt(editAttendees, 10) || editEvent.attendeesCount,
      startDate: editStartDate,
      endDate: editEndDate,
      swishMerchantId: editSwishId.trim() || editEvent.swishMerchantId,
      category: editCategory,
      description: editDescription.trim() || editEvent.description,
      mapImageUrl: editMapImageUrl.trim() || undefined,
      organizerEmail: editAdminEmail.trim() || editEvent.organizerEmail,
      adminName: editAdminName.trim() || editEvent.adminName || "Event Organizer",
      adminPassword: editAdminPassword.trim() || editEvent.adminPassword || "admin123",
      adminPermissions: {
        canEditDetails: editPermDetails,
        canManageVendors: editPermVendors,
        canManageMap: editPermMap,
        canViewFinancials: editPermFinancials
      }
    };

    if (onUpdateEvent) {
      onUpdateEvent(updated);
    }
    if (inspectEvent && inspectEvent.id === updated.id) {
      setInspectEvent(updated);
    }
    setEditSuccessMsg(`Successfully updated "${updated.name}" details and Event Admin credentials!`);
    setTimeout(() => {
      setEditEvent(null);
      setEditSuccessMsg(null);
    }, 1500);
  };

  // Handle Login submission
  const handleSuperAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginEmail.trim() || !loginPassword.trim()) {
      setLoginError("Please fill in both email and password.");
      return;
    }

    const cleanEmail = loginEmail.trim().toLowerCase();
    const superAdmin = AUTHORIZED_SUPER_ADMINS.find(
      sa => sa.email.toLowerCase() === cleanEmail
    );

    if (superAdmin && loginPassword === superAdmin.password) {
      setIsAuthenticated(true);
      setLoginError(null);
    } else {
      setLoginError("Access Denied: Invalid Super Admin ID or Password. Only authorized platform owners may enter.");
    }
  };

  // Quick Auto-Fill & Login for authorized Super Admin
  const handleQuickDemoLogin = () => {
    setLoginEmail("admin@creativeventsnordic.com");
    setLoginPassword("Venueeat36");
    setIsAuthenticated(true);
    setLoginError(null);
  };

  // Calculations across all events
  const totalMultiEventGmv = events.reduce((sum, e) => sum + e.totalGmvSEK, 0);
  const totalPlatformFees = events.reduce((sum, e) => sum + e.platformFeeRevenueSEK, 0);
  const totalAttendeesServed = events.reduce((sum, e) => sum + e.attendeesCount, 0);
  const liveEventsCount = events.filter(e => e.status === "Live").length;
  const historicalEventsCount = events.filter(e => e.status === "Completed").length;
  const scheduledEventsCount = events.filter(e => e.status === "Scheduled").length;

  // Filter events based on activeTab and controls
  const filteredEvents = events.filter(e => {
    // Tab filter
    if (activeTab === "live" && e.status === "Completed") return false;
    if (activeTab === "history" && e.status !== "Completed") return false;

    // Search filter
    const matchesSearch = 
      e.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.code.toLowerCase().includes(searchTerm.toLowerCase());

    // Status filter
    const matchesStatus = statusFilter === "All" || e.status === statusFilter;

    // Category filter
    const matchesCategory = categoryFilter === "All" || e.category === categoryFilter;

    // Year filter
    const matchesYear = yearFilter === "All" || (e.year && e.year.toString() === yearFilter);

    return matchesSearch && matchesStatus && matchesCategory && matchesYear;
  });

  // Handle Export of Multi-Event Data
  const handleExportJson = () => {
    const reportData = {
      title: "VenueEat Super Admin Multi-Event Master Audit Log",
      exportedAt: new Date().toISOString(),
      summaryStats: {
        totalEventsCount: events.length,
        liveEventsCount,
        historicalEventsCount,
        scheduledEventsCount,
        totalGmvSEK: totalMultiEventGmv,
        totalPlatformFeesSEK: totalPlatformFees,
        totalAttendeesServed,
      },
      eventsList: events,
    };

    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `venueeat-superadmin-multi-event-audit-${new Date().toISOString().split("T")[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setDownloaded(true);
    setTimeout(() => setDownloaded(false), 2500);
  };

  // Handle Create Event Form Submission
  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) return;

    const newEvt: ManagedEvent = {
      id: `evt-${Date.now()}`,
      name: formName.trim(),
      code: formCode.trim().toUpperCase() || `EVT${Math.floor(Math.random() * 900 + 100)}`,
      status: "Scheduled",
      startDate: formStartDate,
      endDate: formEndDate,
      location: formLocation,
      attendeesCount: parseInt(formAttendees) || 10000,
      activeVendorsCount: 0,
      totalGmvSEK: 0,
      totalOrdersCount: 0,
      platformFeeRevenueSEK: 950, // base setup SaaS
      organizerEmail: formEmail.trim() || "organizer@stockholmevents.se",
      adminName: formAdminName.trim() || "Festival Operations Director",
      adminPassword: formAdminPassword.trim() || "eventadmin2026",
      adminPermissions: {
        canEditDetails: formPermDetails,
        canManageVendors: formPermVendors,
        canManageMap: formPermMap,
        canViewFinancials: formPermFinancials
      },
      category: formCategory,
      description: formDescription || "Newly onboarded festival event on VenueEat platform.",
      mapImageUrl: formMapImageUrl || undefined,
      swishMerchantId: formSwishId,
      topVendorName: "Registration Open",
      topDishes: ["Menu Pending Onboarding"],
      averagePrepTimeMin: 5,
      satisfactionRating: 5.0,
      peakHour: "18:00 - 20:00",
      historyNotes: "Event created by Super Admin console. Onboarding link generated.",
      year: new Date(formStartDate).getFullYear() || 2026
    };

    onAddNewEvent(newEvt);

    // Automatically open modal and trigger direct Resend API dispatch
    setInvitationModalEvent({ event: newEvt, password: newEvt.adminPassword });
    setIsDispatchingModalEmail(true);
    setModalDispatchResult(null);

    if (dispatchAdminInvitationEmail) {
      dispatchAdminInvitationEmail(
        newEvt, 
        newEvt.adminPassword, 
        customResendKeyInput.trim() || undefined
      )
        .then((res) => {
          setModalDispatchResult(res);
          if (res.success) {
            setEmailSentMap(prev => ({ ...prev, [newEvt.id]: true }));
          }
        })
        .catch((err) => {
          setModalDispatchResult({
            success: false,
            error: err?.message || "Delivery failed",
          });
        })
        .finally(() => {
          setIsDispatchingModalEmail(false);
        });
    }

    setFormSuccess(`Successfully onboarded "${formName}"! Event Admin access credentials prepared for ${newEvt.organizerEmail}.`);
    
    // Reset form fields
    setFormName("");
    setFormCode("");
    setFormDescription("");

    setTimeout(() => {
      setFormSuccess(null);
      setActiveTab("live");
    }, 2000);
  };

  // IF NOT AUTHENTICATED -> SHOW SUPER ADMIN LOGIN GATE
  if (!isAuthenticated) {
    return (
      <div className="bg-zinc-950 text-white rounded-3xl p-6 md:p-8 border-4 border-purple-900/60 shadow-2xl space-y-6 animate-fadeIn text-left">
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 bg-purple-950/80 border border-purple-500/40 px-3 py-1 rounded-full text-[10px] font-mono font-bold text-purple-300 uppercase tracking-wider">
            <Lock className="w-3.5 h-3.5 text-purple-400" />
            Restricted Master Operator Portal
          </div>

          <h2 className="font-display font-black text-2xl md:text-3xl text-white tracking-tight">
            Super Admin Enterprise Login
          </h2>

          <p className="text-xs text-zinc-400 leading-relaxed max-w-xl">
            Authenticate to access multi-event operations, global financial reports across Stockholm festivals, Swish transaction audit logs, and historical event archives.
          </p>
        </div>

        {/* Official Credentials Alert Banner */}
        <div className="bg-zinc-900 border-2 border-purple-500/30 rounded-2xl p-4 space-y-2 text-xs">
          <div className="flex justify-between items-center text-purple-300 font-bold font-mono">
            <span className="flex items-center gap-1.5 uppercase text-[10px] tracking-wider">
              <KeyRound className="w-4 h-4 text-purple-400" /> Authorized Super Admin Account
            </span>
            <span className="text-[10px] bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded font-mono">
              Role: Master Platform
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-zinc-300 font-mono text-[11px] pt-1 border-t border-zinc-800">
            <div>Email: <strong className="text-white">admin@creativeventsnordic.com</strong></div>
            <div>Password: <strong className="text-white">Venueeat36</strong></div>
          </div>
        </div>

        {loginError && (
          <div className="bg-rose-950/80 border border-rose-500/50 text-rose-200 p-3 rounded-xl text-xs font-bold flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{loginError}</span>
          </div>
        )}

        <form onSubmit={handleSuperAdminLogin} className="space-y-4 max-w-md">
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-zinc-300 block font-mono uppercase tracking-wider">
              Super Admin Email
            </label>
            <input
              type="email"
              required
              value={loginEmail}
              onChange={(e) => setLoginEmail(e.target.value)}
              className="w-full bg-zinc-900 border-2 border-zinc-800 focus:border-purple-500 rounded-xl px-3.5 py-2.5 text-xs text-white font-mono font-medium outline-none transition-all"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-zinc-300 block font-mono uppercase tracking-wider">
              Password or Master PIN
            </label>
            <input
              type="password"
              required
              value={loginPassword}
              onChange={(e) => setLoginPassword(e.target.value)}
              className="w-full bg-zinc-900 border-2 border-zinc-800 focus:border-purple-500 rounded-xl px-3.5 py-2.5 text-xs text-white font-mono font-medium outline-none transition-all"
            />
          </div>

          <div className="pt-2 flex flex-col sm:flex-row gap-3">
            <button
              type="submit"
              className="flex-1 py-3 px-5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-display font-black text-xs uppercase tracking-wider shadow-lg transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <UserCheck className="w-4 h-4" />
              Sign In to Super Admin
            </button>

            <button
              type="button"
              onClick={handleQuickDemoLogin}
              className="py-3 px-5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-purple-300 border border-purple-500/40 text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5"
            >
              <Zap className="w-4 h-4 text-amber-400" />
              Quick Demo Sign In
            </button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="space-y-6 text-left animate-fadeIn">
      {/* SUPER ADMIN CONSOLE BANNER HEADER */}
      <div className="bg-gradient-to-r from-zinc-950 via-zinc-900 to-zinc-950 text-white rounded-3xl p-6 md:p-8 border-4 border-zinc-800 shadow-2xl relative overflow-hidden flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
        <div className="absolute top-0 right-0 p-4 opacity-5 font-display font-black text-8xl select-none italic tracking-tighter">
          SUPERADMIN
        </div>

        <div className="space-y-2 max-w-2xl relative z-10">
          <div className="flex flex-wrap items-center gap-2">
            <span className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-[10px] font-mono font-black px-3 py-1 rounded-full uppercase tracking-wider shadow-sm flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-purple-200" /> Super Admin Control Hub
            </span>
            <span className="text-[10px] font-mono text-emerald-400 font-bold bg-emerald-950/80 border border-emerald-500/30 px-2.5 py-0.5 rounded-full flex items-center gap-1">
              <Radio className="w-3 h-3 text-emerald-400 animate-pulse" /> {liveEventsCount} Live Festivals Active
            </span>
            <span className="text-[10px] font-mono text-purple-300 bg-purple-950/80 border border-purple-500/30 px-2.5 py-0.5 rounded-full flex items-center gap-1">
              <UserCheck className="w-3 h-3 text-purple-400" /> superadmin@venueeat.se
            </span>
          </div>

          <h2 className="font-display font-black text-2xl md:text-3xl text-white tracking-tight">
            Multi-Event Enterprise Operator Portal
          </h2>

          <p className="text-xs md:text-sm text-zinc-300 leading-relaxed font-medium">
            Manage concurrent outdoor festivals, inspect active Swish transaction pipelines, monitor real-time queue density across multi-venue locations, and review detailed historical event analytics.
          </p>
        </div>

        {/* Global Actions Bar */}
        <div className="relative z-10 shrink-0 flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          <button
            onClick={handleExportJson}
            className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-display font-bold text-xs uppercase tracking-wider transition-all duration-200 shadow-lg cursor-pointer border-2 ${
              downloaded
                ? "bg-emerald-500 hover:bg-emerald-600 text-white border-emerald-400 shadow-emerald-500/20"
                : "bg-orange-500 hover:bg-orange-600 text-white border-orange-400/50 shadow-orange-500/20 active:scale-95"
            }`}
            title="Export multi-event performance audit report"
          >
            {downloaded ? (
              <>
                <Check className="w-4 h-4 text-white" />
                <span>Exported</span>
              </>
            ) : (
              <>
                <FileJson className="w-4 h-4 text-white" />
                <span>Export Audit Log</span>
              </>
            )}
          </button>

          <button
            onClick={() => setIsAuthenticated(false)}
            className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border border-zinc-700 text-xs font-bold transition-all cursor-pointer"
            title="Sign out of Super Admin Portal"
          >
            <LogOut className="w-3.5 h-3.5 text-rose-400" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      {/* AGGREGATED METRICS SUMMARY BAR */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Metric 1 */}
        <div className="bg-white rounded-2xl p-4 md:p-5 border-2 border-zinc-200 shadow-xs space-y-1">
          <div className="flex justify-between items-center text-zinc-400 text-[10px] font-mono font-bold uppercase tracking-wider">
            <span>Total Multi-Event GMV</span>
            <TrendingUp className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="font-mono font-black text-xl md:text-2xl text-zinc-900">
            {totalMultiEventGmv.toLocaleString()} <span className="text-xs text-zinc-500">SEK</span>
          </div>
          <p className="text-[10px] text-emerald-600 font-bold">Processed across {events.length} festivals</p>
        </div>

        {/* Metric 2 */}
        <div className="bg-white rounded-2xl p-4 md:p-5 border-2 border-zinc-200 shadow-xs space-y-1">
          <div className="flex justify-between items-center text-zinc-400 text-[10px] font-mono font-bold uppercase tracking-wider">
            <span>Platform Revenue</span>
            <DollarSign className="w-4 h-4 text-orange-500" />
          </div>
          <div className="font-mono font-black text-xl md:text-2xl text-orange-600">
            {totalPlatformFees.toLocaleString()} <span className="text-xs text-zinc-500">SEK</span>
          </div>
          <p className="text-[10px] text-zinc-500 font-bold">3.5% Swish split + SaaS fees</p>
        </div>

        {/* Metric 3 */}
        <div className="bg-white rounded-2xl p-4 md:p-5 border-2 border-zinc-200 shadow-xs space-y-1">
          <div className="flex justify-between items-center text-zinc-400 text-[10px] font-mono font-bold uppercase tracking-wider">
            <span>Total Crowd Served</span>
            <Users className="w-4 h-4 text-blue-500" />
          </div>
          <div className="font-mono font-black text-xl md:text-2xl text-zinc-900">
            {(totalAttendeesServed / 1000).toFixed(0)}k <span className="text-xs text-zinc-500">Attendees</span>
          </div>
          <p className="text-[10px] text-blue-600 font-bold">Across Stockholm venues</p>
        </div>

        {/* Metric 4 */}
        <div className="bg-white rounded-2xl p-4 md:p-5 border-2 border-zinc-200 shadow-xs space-y-1">
          <div className="flex justify-between items-center text-zinc-400 text-[10px] font-mono font-bold uppercase tracking-wider">
            <span>Event Registry</span>
            <Layers className="w-4 h-4 text-purple-500" />
          </div>
          <div className="font-mono font-black text-xl md:text-2xl text-zinc-900 flex items-center gap-2">
            <span>{events.length}</span>
            <span className="text-[10px] font-sans font-bold text-zinc-500">({liveEventsCount} Live, {historicalEventsCount} Past)</span>
          </div>
          <p className="text-[10px] text-purple-600 font-bold">Fully compliant with Skatteverket</p>
        </div>
      </div>

      {/* MAIN NAVIGATION & TAB SYSTEM */}
      <div className="bg-white rounded-3xl border-2 border-zinc-200 shadow-sm overflow-hidden">
        {/* Top Tab Bar */}
        <div className="flex flex-col lg:flex-row justify-between items-stretch lg:items-center border-b-2 border-zinc-100 bg-zinc-50/60 p-2 gap-2">
          <div className="flex gap-1 overflow-x-auto scrollbar-none">
            <button
              onClick={() => setActiveTab("live")}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl font-display text-xs md:text-sm font-bold transition-all cursor-pointer whitespace-nowrap ${
                activeTab === "live"
                  ? "bg-zinc-900 text-white shadow-md font-black"
                  : "text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100"
              }`}
            >
              <Zap className="w-4 h-4 text-orange-400" />
              Active & Upcoming ({events.filter(e => e.status !== "Completed").length})
            </button>

            <button
              onClick={() => setActiveTab("settlements")}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl font-display text-xs md:text-sm font-bold transition-all cursor-pointer whitespace-nowrap ${
                activeTab === "settlements"
                  ? "bg-emerald-600 text-white shadow-md font-black"
                  : "text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100"
              }`}
            >
              <DollarSign className="w-4 h-4 text-emerald-300" />
              Vendor Settlements & Payouts ({allVendors.length})
            </button>

            <button
              onClick={() => setActiveTab("orders")}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl font-display text-xs md:text-sm font-bold transition-all cursor-pointer whitespace-nowrap ${
                activeTab === "orders"
                  ? "bg-zinc-900 text-white shadow-md font-black"
                  : "text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100"
              }`}
            >
              <Receipt className="w-4 h-4 text-blue-400" />
              Master Orders Ledger ({allOrders.length})
            </button>

            <button
              onClick={() => setActiveTab("credentials")}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl font-display text-xs md:text-sm font-bold transition-all cursor-pointer whitespace-nowrap ${
                activeTab === "credentials"
                  ? "bg-zinc-900 text-white shadow-md font-black"
                  : "text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100"
              }`}
            >
              <KeyRound className="w-4 h-4 text-purple-400" />
              Admin Credentials ({events.length})
            </button>

            <button
              onClick={() => setActiveTab("history")}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl font-display text-xs md:text-sm font-bold transition-all cursor-pointer whitespace-nowrap ${
                activeTab === "history"
                  ? "bg-zinc-900 text-white shadow-md font-black"
                  : "text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100"
              }`}
            >
              <Archive className="w-4 h-4 text-amber-400" />
              Past Festivals ({historicalEventsCount})
            </button>

            <button
              onClick={() => setActiveTab("create")}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl font-display text-xs md:text-sm font-bold transition-all cursor-pointer whitespace-nowrap ${
                activeTab === "create"
                  ? "bg-orange-500 text-white shadow-md font-black"
                  : "text-orange-600 hover:bg-orange-50 font-bold"
              }`}
            >
              <Plus className="w-4 h-4" />
              Launch Event
            </button>
          </div>

          {/* Quick Filter Bar */}
          {activeTab !== "create" && (
            <div className="flex flex-wrap items-center gap-2 px-2 pb-1 lg:pb-0">
              {activeTab === "settlements" ? (
                <>
                  <select
                    value={selectedEventIdFilter}
                    onChange={(e) => setSelectedEventIdFilter(e.target.value)}
                    className="bg-white border border-zinc-200 rounded-xl px-2.5 py-1.5 text-xs text-zinc-700 font-bold focus:outline-none focus:border-emerald-500 cursor-pointer"
                  >
                    <option value="All">All Stockholm Festivals</option>
                    {events.map(evt => (
                      <option key={evt.id} value={evt.id}>{evt.name} ({evt.code})</option>
                    ))}
                  </select>

                  <button
                    onClick={handleExportSettlementCsv}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs shadow-xs transition-all cursor-pointer"
                    title="Export Swedish bank transfer batch CSV"
                  >
                    <FileSpreadsheet className="w-3.5 h-3.5" />
                    <span>Export Payouts CSV</span>
                  </button>
                </>
              ) : activeTab === "orders" ? (
                <>
                  <div className="relative flex-1 sm:w-48">
                    <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Queue #, customer, dish..."
                      value={orderSearchQuery}
                      onChange={(e) => setOrderSearchQuery(e.target.value)}
                      className="w-full bg-white border border-zinc-200 rounded-xl pl-8 pr-3 py-1.5 text-xs text-zinc-800 placeholder-zinc-400 focus:outline-none focus:border-blue-500 font-medium"
                    />
                  </div>

                  <select
                    value={selectedEventIdFilter}
                    onChange={(e) => setSelectedEventIdFilter(e.target.value)}
                    className="bg-white border border-zinc-200 rounded-xl px-2.5 py-1.5 text-xs text-zinc-700 font-bold focus:outline-none focus:border-blue-500 cursor-pointer"
                  >
                    <option value="All">All Events</option>
                    {events.map(evt => (
                      <option key={evt.id} value={evt.id}>{evt.code} - {evt.name}</option>
                    ))}
                  </select>

                  <select
                    value={orderStatusFilter}
                    onChange={(e) => setOrderStatusFilter(e.target.value)}
                    className="bg-white border border-zinc-200 rounded-xl px-2.5 py-1.5 text-xs text-zinc-700 font-bold focus:outline-none focus:border-blue-500 cursor-pointer"
                  >
                    <option value="All">All Statuses</option>
                    <option value="Placed">Placed</option>
                    <option value="Preparing">Preparing</option>
                    <option value="Ready">Ready</option>
                    <option value="Completed">Completed</option>
                  </select>
                </>
              ) : (
                <>
                  <div className="relative flex-1 sm:w-48">
                    <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Search events..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full bg-white border border-zinc-200 rounded-xl pl-8 pr-3 py-1.5 text-xs text-zinc-800 placeholder-zinc-400 focus:outline-none focus:border-orange-500 font-medium"
                    />
                  </div>

                  {activeTab === "live" && (
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value as any)}
                      className="bg-white border border-zinc-200 rounded-xl px-2.5 py-1.5 text-xs text-zinc-700 font-bold focus:outline-none focus:border-orange-500 cursor-pointer"
                    >
                      <option value="All">All Statuses</option>
                      <option value="Live">Live Only</option>
                      <option value="Scheduled">Scheduled</option>
                    </select>
                  )}

                  {activeTab === "history" && (
                    <select
                      value={yearFilter}
                      onChange={(e) => setYearFilter(e.target.value)}
                      className="bg-white border border-zinc-200 rounded-xl px-2.5 py-1.5 text-xs text-zinc-700 font-bold focus:outline-none focus:border-orange-500 cursor-pointer"
                    >
                      <option value="All">All Years</option>
                      <option value="2026">2026</option>
                      <option value="2025">2025</option>
                      <option value="2024">2024</option>
                    </select>
                  )}
                </>
              )}
            </div>
          )}
        </div>

        {/* TAB CONTENTS */}
        <div className="p-6">
          {activeTab === "create" ? (
            /* CREATE / ONBOARD NEW EVENT FORM */
            <div className="max-w-3xl mx-auto space-y-6">
              <div className="border-b border-zinc-200 pb-4">
                <h3 className="font-display font-black text-xl text-zinc-950 flex items-center gap-2">
                  <Plus className="w-5 h-5 text-orange-500" />
                  Onboard & Provision New Festival Event
                </h3>
                <p className="text-xs text-zinc-500 mt-1">
                  Create a new event record to generate custom Swish routing, enable vendor stall registration, and provision mobile ordering.
                </p>
              </div>

              {formSuccess && (
                <div className="bg-emerald-50 border-2 border-emerald-300 text-emerald-950 p-4 rounded-2xl text-xs font-bold flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                  <span>{formSuccess}</span>
                </div>
              )}

              <form onSubmit={handleCreateSubmit} className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Event Name */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-zinc-700 block font-mono uppercase tracking-wider">
                      Event Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Stockholm Beer & Street Food Fest 2026"
                      value={formName}
                      onChange={(e) => setFormName(e.target.value)}
                      className="w-full bg-zinc-50 border-2 border-zinc-200 focus:bg-white focus:border-orange-500 rounded-xl px-3.5 py-2.5 text-xs text-zinc-900 font-semibold transition-all"
                    />
                  </div>

                  {/* Event Code */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-zinc-700 block font-mono uppercase tracking-wider">
                      Short Code (e.g. STHLMBEER2026)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. STHLMBEER"
                      value={formCode}
                      onChange={(e) => setFormCode(e.target.value)}
                      className="w-full bg-zinc-50 border-2 border-zinc-200 focus:bg-white focus:border-orange-500 rounded-xl px-3.5 py-2.5 text-xs text-zinc-900 font-semibold font-mono transition-all uppercase"
                    />
                  </div>

                  {/* Location */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-zinc-700 block font-mono uppercase tracking-wider">
                      Venue / Location *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Kungsträdgården, Stockholm"
                      value={formLocation}
                      onChange={(e) => setFormLocation(e.target.value)}
                      className="w-full bg-zinc-50 border-2 border-zinc-200 focus:bg-white focus:border-orange-500 rounded-xl px-3.5 py-2.5 text-xs text-zinc-900 font-semibold transition-all"
                    />
                  </div>

                  {/* Expected Attendees */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-zinc-700 block font-mono uppercase tracking-wider">
                      Expected Attendees
                    </label>
                    <input
                      type="number"
                      placeholder="30000"
                      value={formAttendees}
                      onChange={(e) => setFormAttendees(e.target.value)}
                      className="w-full bg-zinc-50 border-2 border-zinc-200 focus:bg-white focus:border-orange-500 rounded-xl px-3.5 py-2.5 text-xs text-zinc-900 font-mono font-bold transition-all"
                    />
                  </div>

                  {/* Start Date */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-zinc-700 block font-mono uppercase tracking-wider">
                      Start Date
                    </label>
                    <input
                      type="date"
                      value={formStartDate}
                      onChange={(e) => setFormStartDate(e.target.value)}
                      className="w-full bg-zinc-50 border-2 border-zinc-200 focus:bg-white focus:border-orange-500 rounded-xl px-3.5 py-2.5 text-xs text-zinc-900 font-mono font-bold transition-all"
                    />
                  </div>

                  {/* End Date */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-zinc-700 block font-mono uppercase tracking-wider">
                      End Date
                    </label>
                    <input
                      type="date"
                      value={formEndDate}
                      onChange={(e) => setFormEndDate(e.target.value)}
                      className="w-full bg-zinc-50 border-2 border-zinc-200 focus:bg-white focus:border-orange-500 rounded-xl px-3.5 py-2.5 text-xs text-zinc-900 font-mono font-bold transition-all"
                    />
                  </div>

                  {/* Swish Merchant ID */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-zinc-700 block font-mono uppercase tracking-wider">
                      Swish Handel Merchant Number
                    </label>
                    <input
                      type="text"
                      placeholder="123 918 27 36"
                      value={formSwishId}
                      onChange={(e) => setFormSwishId(e.target.value)}
                      className="w-full bg-zinc-50 border-2 border-zinc-200 focus:bg-white focus:border-orange-500 rounded-xl px-3.5 py-2.5 text-xs text-zinc-900 font-mono font-bold transition-all"
                    />
                  </div>

                  {/* Category */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-zinc-700 block font-mono uppercase tracking-wider">
                      Festival Category
                    </label>
                    <select
                      value={formCategory}
                      onChange={(e) => setFormCategory(e.target.value as any)}
                      className="w-full bg-zinc-50 border-2 border-zinc-200 focus:bg-white focus:border-orange-500 rounded-xl px-3.5 py-2.5 text-xs text-zinc-900 font-bold transition-all cursor-pointer"
                    >
                      <option value="Cultural & Food">Cultural & Food</option>
                      <option value="Music Festival">Music Festival</option>
                      <option value="Street Market">Street Market</option>
                      <option value="Exhibition">Exhibition</option>
                      <option value="Sports & Fair">Sports & Fair</option>
                    </select>
                  </div>
                </div>

                {/* Event Admin Account Credentials Provisioning */}
                <div className="bg-purple-50/70 border-2 border-purple-200 rounded-2xl p-4 md:p-5 space-y-4">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-purple-200 pb-3">
                    <div className="flex items-center gap-2">
                      <KeyRound className="w-4 h-4 text-purple-600" />
                      <h4 className="text-xs font-bold text-purple-950 uppercase font-mono tracking-wider">
                        Provision Event Admin Login & Password
                      </h4>
                    </div>
                    <span className="text-[10px] font-mono bg-purple-200/70 text-purple-900 px-2.5 py-0.5 rounded-full font-bold">
                      Organizer Portal Access
                    </span>
                  </div>

                  <p className="text-xs text-purple-900/80 leading-relaxed">
                    Set the login credentials for the on-site festival organizer. The organizer will use this Login ID (email) and Password to sign in at <strong className="text-purple-950">/admin</strong> to manage vendors, live menus, and festival settings.
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-purple-950 block font-mono uppercase">
                        Admin Lead Name
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Sofia Lindqvist"
                        value={formAdminName}
                        onChange={(e) => setFormAdminName(e.target.value)}
                        className="w-full bg-white border border-purple-200 focus:border-purple-600 rounded-xl px-3 py-2 text-xs text-zinc-900 font-semibold outline-none"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-purple-950 block font-mono uppercase">
                        Admin Login ID (Email) *
                      </label>
                      <input
                        type="email"
                        required
                        placeholder="organizer@stockholmevents.se"
                        value={formEmail}
                        onChange={(e) => setFormEmail(e.target.value)}
                        className="w-full bg-white border border-purple-200 focus:border-purple-600 rounded-xl px-3 py-2 text-xs text-zinc-900 font-semibold outline-none"
                      />
                    </div>

                    <div className="space-y-1">
                      <div className="flex justify-between items-center">
                        <label className="text-[11px] font-bold text-purple-950 block font-mono uppercase">
                          Login Password *
                        </label>
                        <button
                          type="button"
                          onClick={() => setFormAdminPassword(generateNewPassword())}
                          className="text-[10px] text-purple-700 hover:text-purple-900 font-bold underline cursor-pointer"
                        >
                          Generate
                        </button>
                      </div>
                      <input
                        type="text"
                        required
                        value={formAdminPassword}
                        onChange={(e) => setFormAdminPassword(e.target.value)}
                        className="w-full bg-white border border-purple-200 focus:border-purple-600 rounded-xl px-3 py-2 text-xs text-zinc-900 font-mono font-bold outline-none"
                      />
                    </div>
                  </div>

                  {/* Delegated Permissions */}
                  <div className="pt-2 border-t border-purple-200/60 space-y-2">
                    <span className="text-[11px] font-bold text-purple-950 block font-mono uppercase">
                      Event Admin Permissions
                    </span>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs text-purple-950">
                      <label className="flex items-center gap-1.5 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formPermDetails}
                          onChange={(e) => setFormPermDetails(e.target.checked)}
                          className="rounded text-purple-600 accent-purple-600"
                        />
                        <span className="text-[11px] font-medium">Edit Details</span>
                      </label>
                      <label className="flex items-center gap-1.5 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formPermVendors}
                          onChange={(e) => setFormPermVendors(e.target.checked)}
                          className="rounded text-purple-600 accent-purple-600"
                        />
                        <span className="text-[11px] font-medium">Manage Vendors</span>
                      </label>
                      <label className="flex items-center gap-1.5 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formPermMap}
                          onChange={(e) => setFormPermMap(e.target.checked)}
                          className="rounded text-purple-600 accent-purple-600"
                        />
                        <span className="text-[11px] font-medium">Manage Map</span>
                      </label>
                      <label className="flex items-center gap-1.5 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formPermFinancials}
                          onChange={(e) => setFormPermFinancials(e.target.checked)}
                          className="rounded text-purple-600 accent-purple-600"
                        />
                        <span className="text-[11px] font-medium">View Financials</span>
                      </label>
                    </div>
                  </div>
                </div>

                {/* Description */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-zinc-700 block font-mono uppercase tracking-wider">
                    Event Overview & Description
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Provide event details, expected crowd peaks, and food stall layout..."
                    value={formDescription}
                    onChange={(e) => setFormDescription(e.target.value)}
                    className="w-full bg-zinc-50 border-2 border-zinc-200 focus:bg-white focus:border-orange-500 rounded-xl px-3.5 py-2.5 text-xs text-zinc-900 font-medium transition-all"
                  />
                </div>

                {/* Event Venue Map Image Upload / URL */}
                <div className="space-y-2 bg-amber-50/60 p-4 rounded-2xl border-2 border-amber-200">
                  <div className="flex justify-between items-center">
                    <label className="text-xs font-bold text-amber-950 flex items-center gap-1.5 font-mono uppercase tracking-wider">
                      <MapPin className="w-4 h-4 text-orange-600" />
                      Upload Event Venue Map
                    </label>
                    <span className="text-[10px] text-amber-800 font-mono font-bold bg-amber-100 px-2 py-0.5 rounded">
                      Optional
                    </span>
                  </div>

                  <div className="space-y-2">
                    <div className="flex gap-2 items-center">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onload = (uploadEvent) => {
                              if (uploadEvent.target?.result) {
                                setFormMapImageUrl(uploadEvent.target.result as string);
                              }
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                        className="text-xs text-zinc-600 file:mr-2 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-[10px] file:font-mono file:font-bold file:bg-orange-500 file:text-white hover:file:bg-orange-600 cursor-pointer"
                      />
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono font-bold text-zinc-400 uppercase">OR Image URL:</span>
                      <input
                        type="url"
                        placeholder="https://images.unsplash.com/photo-..."
                        value={formMapImageUrl}
                        onChange={(e) => setFormMapImageUrl(e.target.value)}
                        className="flex-1 bg-white border border-amber-300 rounded-xl px-3 py-1.5 text-xs text-zinc-900 font-mono font-medium focus:outline-none focus:border-orange-500"
                      />
                    </div>

                    {formMapImageUrl && (
                      <div className="relative rounded-xl overflow-hidden border border-amber-300 h-24 bg-zinc-900 group">
                        <img src={formMapImageUrl} alt="Venue Map Preview" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => setFormMapImageUrl("")}
                          className="absolute top-1 right-1 bg-zinc-900/80 text-white p-1 rounded-lg text-[9px] hover:bg-rose-600 font-mono font-bold"
                        >
                          Remove Map
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                <div className="pt-2 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setActiveTab("live")}
                    className="px-5 py-2.5 rounded-xl border border-zinc-200 text-xs font-bold text-zinc-600 hover:bg-zinc-100 transition-all cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 active:scale-95 text-white text-xs font-display font-black transition-all shadow-md cursor-pointer flex items-center gap-1.5 uppercase tracking-wider"
                  >
                    <Check className="w-4 h-4 stroke-[3px]" />
                    Provision Event
                  </button>
                </div>
              </form>
            </div>
          ) : activeTab === "settlements" ? (
            /* VENDOR SETTLEMENTS & FINANCIAL PAYOUTS CONSOLE */
            <div className="space-y-6 animate-fadeIn">
              {/* Settlements Header Card */}
              <div className="bg-gradient-to-r from-emerald-950 via-zinc-900 to-zinc-950 text-white rounded-3xl p-6 border-2 border-emerald-800/60 shadow-xl flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
                <div className="space-y-2 max-w-2xl">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 font-mono text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider flex items-center gap-1.5">
                      <Landmark className="w-3.5 h-3.5 text-emerald-400" /> End-of-Event Financial Settlement Engine
                    </span>
                    <span className="bg-zinc-800 text-zinc-300 font-mono text-[10px] px-2.5 py-0.5 rounded-full">
                      Swish Central Account: <strong className="text-white">1230197665</strong>
                    </span>
                  </div>

                  <h3 className="font-display font-black text-xl md:text-2xl text-white tracking-tight">
                    Vendor Payouts & Commission Settlement
                  </h3>

                  <p className="text-xs text-zinc-300 leading-relaxed font-medium">
                    100% of attendee mobile payments are deposited directly into the Super Admin's merchant Swish bank account. At festival completion, calculate each food stall's gross intake, automatically deduct VenueEat's 3.5% SaaS commission, inspect Swedish bank details, and mark payouts as settled.
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 shrink-0">
                  <button
                    onClick={handleExportSettlementCsv}
                    className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-display font-bold text-xs uppercase tracking-wider shadow-lg shadow-emerald-500/20 transition-all cursor-pointer active:scale-95"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download Bank Payout Batch (.CSV)</span>
                  </button>
                </div>
              </div>

              {/* Settlement KPI Summary Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Metric 1: Gross Swish Intake */}
                <div className="bg-white rounded-2xl p-5 border-2 border-zinc-200 shadow-xs space-y-1">
                  <div className="flex justify-between items-center text-zinc-400 text-[10px] font-mono font-bold uppercase tracking-wider">
                    <span>Gross Swish Intake</span>
                    <DollarSign className="w-4 h-4 text-emerald-500" />
                  </div>
                  <div className="font-mono font-black text-2xl text-zinc-950">
                    {formatSEK(totalSettlementGross)} <span className="text-xs text-zinc-500">SEK</span>
                  </div>
                  <p className="text-[10px] text-emerald-600 font-bold">100% deposited in SuperAdmin Swish</p>
                </div>

                {/* Metric 2: Net Payouts Due to Vendors */}
                <div className="bg-white rounded-2xl p-5 border-2 border-zinc-200 shadow-xs space-y-1">
                  <div className="flex justify-between items-center text-zinc-400 text-[10px] font-mono font-bold uppercase tracking-wider">
                    <span>Vendor Payouts Due</span>
                    <Store className="w-4 h-4 text-blue-500" />
                  </div>
                  <div className="font-mono font-black text-2xl text-blue-600">
                    {formatSEK(totalSettlementNetPayout)} <span className="text-xs text-zinc-500">SEK</span>
                  </div>
                  <p className="text-[10px] text-zinc-500 font-medium">Payable to {vendorSettlementSummaries.length} festival stalls</p>
                </div>

                {/* Metric 3: Platform Commission Retained */}
                <div className="bg-white rounded-2xl p-5 border-2 border-zinc-200 shadow-xs space-y-1">
                  <div className="flex justify-between items-center text-zinc-400 text-[10px] font-mono font-bold uppercase tracking-wider">
                    <span>VenueEat Cut Retained</span>
                    <TrendingUp className="w-4 h-4 text-purple-500" />
                  </div>
                  <div className="font-mono font-black text-2xl text-purple-600">
                    {formatSEK(totalSettlementPlatformFee)} <span className="text-xs text-zinc-500">SEK</span>
                  </div>
                  <p className="text-[10px] text-purple-600 font-bold">3.5% fee calculated on each order</p>
                </div>

                {/* Metric 4: Payout Progress */}
                <div className="bg-white rounded-2xl p-5 border-2 border-zinc-200 shadow-xs space-y-1">
                  <div className="flex justify-between items-center text-zinc-400 text-[10px] font-mono font-bold uppercase tracking-wider">
                    <span>Settlement Status</span>
                    <CheckCheck className="w-4 h-4 text-amber-500" />
                  </div>
                  <div className="font-mono font-black text-2xl text-zinc-950 flex items-center gap-2">
                    <span>{totalSettledStalls} / {vendorSettlementSummaries.length}</span>
                    <span className="text-xs font-sans font-bold text-zinc-500">Stalls Settled</span>
                  </div>
                  {/* Progress bar */}
                  <div className="w-full bg-zinc-100 rounded-full h-1.5 overflow-hidden">
                    <div 
                      className="bg-emerald-500 h-full rounded-full transition-all duration-300"
                      style={{ width: `${vendorSettlementSummaries.length > 0 ? (totalSettledStalls / vendorSettlementSummaries.length) * 100 : 0}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Vendor Settlement Breakdown Ledger Table */}
              <div className="bg-white rounded-2xl border-2 border-zinc-200 shadow-xs overflow-hidden">
                <div className="p-4 border-b border-zinc-200 bg-zinc-50/50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                  <div>
                    <h4 className="font-display font-black text-sm text-zinc-900">
                      Stall Payout & Bank Verification Ledger
                    </h4>
                    <p className="text-[11px] text-zinc-500 font-medium">
                      Showing {vendorSettlementSummaries.length} food vendors across {selectedEventIdFilter === "All" ? "all festivals" : "selected festival"} • Click any stall row to open all customer orders
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono font-bold text-zinc-400 uppercase">
                      Total Orders: <strong className="text-zinc-800">{totalSettlementOrders}</strong>
                    </span>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="bg-zinc-100/70 border-b border-zinc-200 text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-600">
                        <th className="py-3 px-4">Stall / Food Vendor</th>
                        <th className="py-3 px-3">Festival Event</th>
                        <th className="py-3 px-3 text-center">Orders</th>
                        <th className="py-3 px-3 text-right">Food Sales (Vendor Due)</th>
                        <th className="py-3 px-3 text-right">+3.5% Fee Added</th>
                        <th className="py-3 px-3 text-right">Total Bill (Swish Intake)</th>
                        <th className="py-3 px-4 text-right">Net Payout Due</th>
                        <th className="py-3 px-4">Registered Bank / Swish</th>
                        <th className="py-3 px-3 text-center">Settlement Status</th>
                        <th className="py-3 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-100 font-sans">
                      {vendorSettlementSummaries.length === 0 ? (
                        <tr>
                          <td colSpan={10} className="py-12 text-center text-zinc-400 font-medium">
                            No food stalls found for the selected event filter.
                          </td>
                        </tr>
                      ) : (
                        vendorSettlementSummaries.map((s) => {
                          const isExpanded = expandedVendorId === s.vendor.id;

                          return (
                            <React.Fragment key={s.vendor.id}>
                              {/* Primary Stall Row */}
                              <tr 
                                onClick={() => setExpandedVendorId(isExpanded ? null : s.vendor.id)}
                                className={`transition-all cursor-pointer ${
                                  isExpanded 
                                    ? "bg-emerald-50/80 border-l-4 border-l-emerald-500 shadow-inner" 
                                    : "hover:bg-zinc-50/90"
                                }`}
                              >
                                {/* Stall / Food Vendor */}
                                <td className="py-3.5 px-4">
                                  <div className="flex items-center gap-2.5">
                                    <ChevronDown className={`w-4 h-4 transition-transform duration-200 shrink-0 ${
                                      isExpanded ? "rotate-180 text-emerald-600" : "text-zinc-400"
                                    }`} />
                                    <div className="w-8 h-8 rounded-xl bg-orange-50 border border-orange-200 text-base flex items-center justify-center shrink-0">
                                      {s.vendor.logo || "🍲"}
                                    </div>
                                    <div>
                                      <div className="font-display font-black text-xs text-zinc-950 flex items-center gap-1.5">
                                        <span>{s.vendor.name}</span>
                                        {s.vendor.stallNumber && (
                                          <span className="text-[9px] font-mono font-bold text-zinc-500 bg-zinc-100 px-1.5 py-0.5 rounded">
                                            {s.vendor.stallNumber}
                                          </span>
                                        )}
                                      </div>
                                      <div className="flex items-center gap-2">
                                        <span className="text-[10px] text-zinc-500 font-medium">
                                          {s.vendor.cuisine}
                                        </span>
                                        <span className="text-[10px] font-bold text-emerald-600 hover:underline">
                                          {isExpanded ? "▲ Hide orders" : `▼ View ${s.ordersCount} orders`}
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                </td>

                                {/* Festival Event */}
                                <td className="py-3.5 px-3">
                                  <span className="inline-block bg-purple-50 text-purple-700 border border-purple-200/60 font-mono text-[10px] font-bold px-2 py-0.5 rounded">
                                    {s.eventCode}
                                  </span>
                                </td>

                                {/* Orders */}
                                <td className="py-3.5 px-3 text-center font-mono font-bold text-zinc-700">
                                  <span className="inline-block bg-zinc-100 px-2 py-0.5 rounded text-xs">
                                    {s.ordersCount}
                                  </span>
                                </td>

                                {/* Food Sales (Vendor Due) */}
                                <td className="py-3.5 px-3 text-right font-mono font-bold text-zinc-700">
                                  {formatSEK(s.netPayout)} <span className="text-[10px] text-zinc-400 font-sans font-normal">SEK</span>
                                </td>

                                {/* +3.5% Platform Fee Added */}
                                <td className="py-3.5 px-3 text-right font-mono text-purple-600 font-bold">
                                  +{formatSEK(s.platformFee)} <span className="text-[10px] text-purple-400 font-sans font-normal">SEK</span>
                                </td>

                                {/* Total Bill (Swish Intake) */}
                                <td className="py-3.5 px-3 text-right font-mono font-black text-zinc-950">
                                  {formatSEK(s.grossAmount)} <span className="text-[10px] text-zinc-400 font-sans font-normal">SEK</span>
                                </td>

                                {/* Net Payout Due */}
                                <td className="py-3.5 px-4 text-right font-mono font-black text-emerald-600 text-sm">
                                  {formatSEK(s.netPayout)} <span className="text-[10px] text-emerald-500 font-sans font-normal">SEK</span>
                                </td>

                                {/* Bank / Swish Info */}
                                <td className="py-3.5 px-4">
                                  {s.hasBankDetails ? (
                                    <div className="space-y-0.5 font-mono text-[11px]">
                                      <div className="text-zinc-900 font-bold flex items-center gap-1">
                                        <Landmark className="w-3 h-3 text-zinc-500 shrink-0" />
                                        <span className="truncate max-w-[140px]">{s.vendor.bankName || "Swedish Bank"}</span>
                                      </div>
                                      {s.vendor.bankAccountNumber && (
                                        <div className="text-[10px] text-zinc-500">
                                          Clearing: <strong>{s.vendor.bankClearingNumber || "—"}</strong> / Konto: <strong>{s.vendor.bankAccountNumber}</strong>
                                        </div>
                                      )}
                                      {s.vendor.swishNumber && (
                                        <div className="text-[10px] text-purple-600">
                                          Swish: {s.vendor.swishNumber}
                                        </div>
                                      )}
                                    </div>
                                  ) : (
                                    <span className="inline-flex items-center gap-1 text-[10px] text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded font-mono">
                                      <AlertCircle className="w-3 h-3 text-amber-600" /> Missing Bank Info
                                    </span>
                                  )}
                                </td>

                                {/* Settlement Status */}
                                <td className="py-3.5 px-3 text-center">
                                  {s.isSettled ? (
                                    <div className="space-y-0.5">
                                      <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold text-emerald-800 bg-emerald-100 border border-emerald-300 px-2 py-0.5 rounded-full">
                                        <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Settled
                                      </span>
                                      {s.settlementInfo?.reference && (
                                        <div className="text-[9px] font-mono text-zinc-400">
                                          {s.settlementInfo.reference}
                                        </div>
                                      )}
                                    </div>
                                  ) : (
                                    <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold text-amber-800 bg-amber-100 border border-amber-300 px-2 py-0.5 rounded-full">
                                      <Clock className="w-3 h-3 text-amber-600" /> Pending Payout
                                    </span>
                                  )}
                                </td>

                                {/* Actions */}
                                <td className="py-3.5 px-4 text-right">
                                  <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
                                    {/* Inspect Stall Button */}
                                    <button
                                      onClick={() => setInspectVendor(s.vendor)}
                                      className="p-1.5 text-zinc-600 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-all cursor-pointer"
                                      title="Inspect Stall Details, Menu & Orders"
                                    >
                                      <Eye className="w-4 h-4" />
                                    </button>

                                    {/* Mark Settled Toggle Button */}
                                    <button
                                      onClick={() => toggleVendorSettlement(s.vendor.id)}
                                      className={`px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold transition-all cursor-pointer flex items-center gap-1 ${
                                        s.isSettled
                                          ? "bg-zinc-100 hover:bg-zinc-200 text-zinc-600"
                                          : "bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs"
                                      }`}
                                      title={s.isSettled ? "Mark as Pending again" : "Mark payout transfer completed"}
                                    >
                                      {s.isSettled ? (
                                        <span>Undo</span>
                                      ) : (
                                        <>
                                          <Check className="w-3 h-3" />
                                          <span>Mark Paid</span>
                                        </>
                                      )}
                                    </button>
                                  </div>
                                </td>
                              </tr>

                              {/* Accordion: All Orders for THIS Stall */}
                              {isExpanded && (
                                <tr className="bg-emerald-50/40 border-b-2 border-emerald-300/70 animate-fadeIn">
                                  <td colSpan={10} className="p-4 md:p-6">
                                    <div className="bg-white rounded-2xl border-2 border-emerald-200 shadow-md p-4 md:p-5 space-y-4">
                                      {/* Stall Orders Header */}
                                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-zinc-100 pb-3">
                                        <div className="flex items-center gap-3">
                                          <div className="w-10 h-10 rounded-2xl bg-orange-100 border border-orange-200 text-xl flex items-center justify-center shrink-0">
                                            {s.vendor.logo || "🍲"}
                                          </div>
                                          <div>
                                            <div className="flex items-center gap-2">
                                              <h4 className="font-display font-black text-sm md:text-base text-zinc-950">
                                                {s.vendor.name} — Customer Orders Ledger
                                              </h4>
                                              {s.vendor.stallNumber && (
                                                <span className="text-[10px] font-mono font-bold bg-zinc-100 text-zinc-600 px-2 py-0.5 rounded">
                                                  {s.vendor.stallNumber}
                                                </span>
                                              )}
                                            </div>
                                            <p className="text-[11px] text-zinc-500 font-medium">
                                              {s.eventName} • 3.5% VenueEat fee added per individual order (Vendor receives 100% of food price)
                                            </p>
                                          </div>
                                        </div>

                                        {/* Action Buttons */}
                                        <div className="flex items-center gap-2">
                                          <button
                                            type="button"
                                            onClick={() => setInspectVendor(s.vendor)}
                                            className="px-3 py-1.5 rounded-xl bg-orange-50 hover:bg-orange-100 text-orange-700 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer border border-orange-200"
                                          >
                                            <Eye className="w-3.5 h-3.5 text-orange-600" />
                                            <span>Inspect Stall (Menu & Profile)</span>
                                          </button>

                                          <button
                                            type="button"
                                            onClick={() => setExpandedVendorId(null)}
                                            className="p-1.5 rounded-xl hover:bg-zinc-100 text-zinc-400 hover:text-zinc-600 cursor-pointer"
                                            title="Close stall orders"
                                          >
                                            <X className="w-4 h-4" />
                                          </button>
                                        </div>
                                      </div>

                                      {/* Stall Financial Summary Banner */}
                                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-zinc-50 p-3.5 rounded-xl text-xs font-mono border border-zinc-200">
                                        <div>
                                          <span className="text-[10px] text-zinc-400 font-bold uppercase block">Stall Orders</span>
                                          <strong className="text-zinc-900 text-sm font-black">{s.ordersCount}</strong>
                                        </div>
                                        <div>
                                          <span className="text-[10px] text-zinc-400 font-bold uppercase block">Food Sales (Vendor Cut)</span>
                                          <strong className="text-zinc-900 text-sm font-black">{formatSEK(s.netPayout)} SEK</strong>
                                        </div>
                                        <div>
                                          <span className="text-[10px] text-purple-600 font-bold uppercase block">+3.5% Platform Fee</span>
                                          <strong className="text-purple-600 text-sm font-black">
                                            +{formatSEK(s.platformFee)} SEK
                                          </strong>
                                        </div>
                                        <div>
                                          <span className="text-[10px] text-emerald-600 font-bold uppercase block">Total Swish Intake</span>
                                          <strong className="text-emerald-600 text-sm font-black">{formatSEK(s.grossAmount)} SEK</strong>
                                        </div>
                                      </div>

                                      {/* Orders Table for THIS Stall */}
                                      {s.orders.length === 0 ? (
                                        <div className="py-8 text-center text-zinc-400 text-xs font-medium bg-zinc-50 rounded-xl border border-dashed border-zinc-200">
                                          No orders have been recorded for this stall yet.
                                        </div>
                                      ) : (
                                        <div className="overflow-x-auto rounded-xl border border-zinc-200">
                                          <table className="w-full text-left text-xs">
                                            <thead>
                                              <tr className="bg-zinc-100 text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-600 border-b border-zinc-200">
                                                <th className="py-2.5 px-3">Queue # & Time</th>
                                                <th className="py-2.5 px-3">Customer</th>
                                                <th className="py-2.5 px-3">Items Ordered</th>
                                                <th className="py-2.5 px-3 text-right">Food Cost (SEK)</th>
                                                <th className="py-2.5 px-3 text-right">+3.5% Platform Fee</th>
                                                <th className="py-2.5 px-3 text-right">Total Bill (SEK)</th>
                                                <th className="py-2.5 px-3 text-right">Vendor Payout (SEK)</th>
                                                <th className="py-2.5 px-3 text-center">Status</th>
                                              </tr>
                                            </thead>
                                            <tbody className="divide-y divide-zinc-100">
                                              {s.orders.map((ord) => {
                                                const foodCost = getOrderFoodCost(ord);
                                                const fee = getOrderPlatformFee(ord);
                                                const totalBill = getOrderTotalBill(ord);
                                                const cut = getOrderVendorCut(ord);
                                                return (
                                                  <tr key={ord.id} className="hover:bg-zinc-50/70">
                                                    <td className="py-2.5 px-3 font-mono font-bold text-zinc-900">
                                                      <div className="flex items-center gap-1.5">
                                                        <span>#Q-{ord.queueNumber}</span>
                                                        <span className="text-[9px] font-bold bg-emerald-100 text-emerald-800 px-1 rounded">Swish</span>
                                                      </div>
                                                      <div className="text-[10px] text-zinc-400 font-normal">{ord.timestamp || "Just now"}</div>
                                                    </td>
                                                    <td className="py-2.5 px-3">
                                                      <div className="font-bold text-zinc-900">{ord.customerName || "Festival Guest"}</div>
                                                      {ord.customerPhone && <div className="text-[10px] text-zinc-400 font-mono">{ord.customerPhone}</div>}
                                                    </td>
                                                    <td className="py-2.5 px-3">
                                                      <div className="space-y-0.5 max-w-xs">
                                                        {ord.items && ord.items.length > 0 ? (
                                                          ord.items.map((it, idx) => (
                                                            <div key={idx} className="text-[11px] text-zinc-700 flex items-center gap-1">
                                                              <span className="font-bold font-mono text-zinc-900">{it.quantity}x</span>
                                                              <span>{it.menuItem?.name}</span>
                                                              {it.selectedExtras && it.selectedExtras.length > 0 && (
                                                                <span className="text-[9px] text-zinc-400">
                                                                  (+{it.selectedExtras.map(e => e.name).join(", ")})
                                                                </span>
                                                              )}
                                                            </div>
                                                          ))
                                                        ) : (
                                                          <span className="text-zinc-400 italic">Itemized order saved</span>
                                                        )}
                                                      </div>
                                                    </td>
                                                    <td className="py-2.5 px-3 text-right font-mono font-bold text-zinc-700">
                                                      {formatSEK(foodCost)} SEK
                                                    </td>
                                                    <td className="py-2.5 px-3 text-right font-mono font-bold text-purple-600">
                                                      +{formatSEK(fee)} SEK
                                                    </td>
                                                    <td className="py-2.5 px-3 text-right font-mono font-black text-zinc-900">
                                                      {formatSEK(totalBill)} SEK
                                                    </td>
                                                    <td className="py-2.5 px-3 text-right font-mono font-black text-emerald-600">
                                                      {formatSEK(cut)} SEK
                                                    </td>
                                                    <td className="py-2.5 px-3 text-center">
                                                      <span className={`inline-block font-mono text-[9px] font-black px-2 py-0.5 rounded-full uppercase ${
                                                        ord.status === "Completed"
                                                          ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                                                          : ord.status === "Ready"
                                                          ? "bg-purple-100 text-purple-800 border border-purple-300"
                                                          : ord.status === "Preparing"
                                                          ? "bg-amber-100 text-amber-800 border border-amber-300"
                                                          : "bg-blue-100 text-blue-800 border border-blue-300"
                                                      }`}>
                                                        {ord.status}
                                                      </span>
                                                    </td>
                                                  </tr>
                                                );
                                              })}
                                            </tbody>
                                          </table>
                                        </div>
                                      )}
                                    </div>
                                  </td>
                                </tr>
                              )}
                            </React.Fragment>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          ) : activeTab === "orders" ? (
            /* MASTER ORDERS LEDGER CONSOLE */
            <div className="space-y-6 animate-fadeIn">
              {/* Master Orders Header Card */}
              <div className="bg-gradient-to-r from-zinc-950 via-zinc-900 to-zinc-950 text-white rounded-3xl p-6 border-2 border-zinc-800 shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="space-y-1.5 max-w-2xl">
                  <div className="flex items-center gap-2">
                    <span className="bg-blue-500/20 text-blue-400 border border-blue-500/40 font-mono text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider flex items-center gap-1.5">
                      <Receipt className="w-3.5 h-3.5 text-blue-400" /> Platform-Wide Master Orders Ledger
                    </span>
                    <span className="bg-zinc-800 text-zinc-300 font-mono text-[10px] px-2.5 py-0.5 rounded-full">
                      {filteredMasterOrders.length} Orders Loaded
                    </span>
                  </div>

                  <h3 className="font-display font-black text-xl md:text-2xl text-white tracking-tight">
                    Multi-Stall Order Stream & Revenue Split
                  </h3>

                  <p className="text-xs text-zinc-300 leading-relaxed font-medium">
                    Unified real-time feed of all mobile customer orders across all food stalls and festivals. Review order queue numbers, customer contacts, meal items, and the exact vendor food cut vs. platform commission breakdown.
                  </p>
                </div>
              </div>

              {/* Master Orders Financial Snapshot Bar */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white rounded-2xl p-4 border-2 border-zinc-200 shadow-xs space-y-1">
                  <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-400">Filtered Orders</div>
                  <div className="font-mono font-black text-xl text-zinc-900">{filteredMasterOrders.length}</div>
                  <p className="text-[10px] text-zinc-500 font-medium">Matching current filters</p>
                </div>

                <div className="bg-white rounded-2xl p-4 border-2 border-zinc-200 shadow-xs space-y-1">
                  <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-400">Gross Swish Total</div>
                  <div className="font-mono font-black text-xl text-zinc-900">{formatSEK(masterOrdersGross)} <span className="text-xs text-zinc-500">SEK</span></div>
                  <p className="text-[10px] text-emerald-600 font-bold">Total paid by customers</p>
                </div>

                <div className="bg-white rounded-2xl p-4 border-2 border-zinc-200 shadow-xs space-y-1">
                  <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-400">Total Vendor Cut</div>
                  <div className="font-mono font-black text-xl text-blue-600">{formatSEK(masterOrdersVendorCut)} <span className="text-xs text-zinc-500">SEK</span></div>
                  <p className="text-[10px] text-blue-600 font-bold">Food sales owed to stalls</p>
                </div>

                <div className="bg-white rounded-2xl p-4 border-2 border-zinc-200 shadow-xs space-y-1">
                  <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-400">VenueEat Platform Fee</div>
                  <div className="font-mono font-black text-xl text-orange-600">{formatSEK(masterOrdersPlatformCut)} <span className="text-xs text-zinc-500">SEK</span></div>
                  <p className="text-[10px] text-orange-600 font-bold">3.5% fee calculated on each order</p>
                </div>
              </div>

              {/* Orders Table */}
              <div className="bg-white rounded-2xl border-2 border-zinc-200 shadow-xs overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="bg-zinc-100/70 border-b border-zinc-200 text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-600">
                        <th className="py-3 px-4">Queue # & Time</th>
                        <th className="py-3 px-4">Festival & Stall</th>
                        <th className="py-3 px-4">Customer</th>
                        <th className="py-3 px-4">Items Ordered</th>
                        <th className="py-3 px-3 text-right">Food Cost (SEK)</th>
                        <th className="py-3 px-3 text-right">+3.5% Fee Added</th>
                        <th className="py-3 px-3 text-right">Total Bill (SEK)</th>
                        <th className="py-3 px-3 text-right">Vendor Cut</th>
                        <th className="py-3 px-3 text-center">Status</th>
                        <th className="py-3 px-4 text-right">Inspect</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-100 font-sans">
                      {filteredMasterOrders.length === 0 ? (
                        <tr>
                          <td colSpan={10} className="py-12 text-center text-zinc-400 font-medium">
                            No orders found matching your search or filters.
                          </td>
                        </tr>
                      ) : (
                        filteredMasterOrders.map((ord) => {
                          const orderVendor = allVendors.find(v => v.id === ord.vendorId);
                          const orderEvent = events.find(e => e.id === (orderVendor?.eventId || "evt-001")) || events[0];
                          const foodCost = getOrderFoodCost(ord);
                          const platformCut = getOrderPlatformFee(ord);
                          const totalBill = getOrderTotalBill(ord);
                          const vendorCut = getOrderVendorCut(ord);

                          return (
                            <tr key={ord.id} className="hover:bg-zinc-50/80 transition-colors">
                              {/* Queue # & Time */}
                              <td className="py-3.5 px-4">
                                <div className="space-y-0.5">
                                  <div className="flex items-center gap-1.5">
                                    <span className="font-mono font-black text-sm text-zinc-950">
                                      #Q-{ord.queueNumber}
                                    </span>
                                    <span className="text-[9px] font-mono font-bold bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded">
                                      Swish
                                    </span>
                                  </div>
                                  <div className="text-[10px] text-zinc-500 font-mono">
                                    {ord.timestamp || "Just now"}
                                  </div>
                                </div>
                              </td>

                              {/* Festival & Stall */}
                              <td className="py-3.5 px-4">
                                <div className="space-y-0.5">
                                  <div className="font-bold text-xs text-zinc-900 truncate max-w-[160px]">
                                    {ord.vendorName}
                                  </div>
                                  <span className="inline-block bg-purple-50 text-purple-700 border border-purple-200/60 font-mono text-[9px] font-bold px-1.5 py-0.2 rounded truncate max-w-[160px]">
                                    {orderEvent?.name || "Stockholm Festival"}
                                  </span>
                                </div>
                              </td>

                              {/* Customer */}
                              <td className="py-3.5 px-4">
                                <div className="space-y-0.5">
                                  <div className="font-bold text-xs text-zinc-900">
                                    {ord.customerName || "Festival Guest"}
                                  </div>
                                  {ord.customerPhone && (
                                    <div className="text-[10px] text-zinc-500 font-mono">
                                      {ord.customerPhone}
                                    </div>
                                  )}
                                </div>
                              </td>

                              {/* Items Ordered */}
                              <td className="py-3.5 px-4">
                                <div className="space-y-1 max-w-xs">
                                  {ord.items && ord.items.length > 0 ? (
                                    ord.items.map((it, idx) => (
                                      <div key={idx} className="text-[11px] text-zinc-700 flex items-center gap-1">
                                        <span className="font-bold font-mono text-zinc-900">{it.quantity}x</span>
                                        <span>{it.menuItem?.name}</span>
                                        {it.selectedExtras && it.selectedExtras.length > 0 && (
                                          <span className="text-[9px] text-zinc-400">
                                            (+{it.selectedExtras.map(e => e.name).join(", ")})
                                          </span>
                                        )}
                                      </div>
                                    ))
                                  ) : (
                                    <span className="text-[11px] text-zinc-400 italic">Itemized details saved</span>
                                  )}
                                </div>
                              </td>

                              {/* Food Cost */}
                              <td className="py-3.5 px-3 text-right font-mono font-bold text-zinc-700 text-xs">
                                {formatSEK(foodCost)} <span className="text-[9px] text-zinc-400 font-sans font-normal">SEK</span>
                              </td>

                              {/* +3.5% Platform Fee Added */}
                              <td className="py-3.5 px-3 text-right font-mono font-bold text-purple-600 text-xs">
                                +{formatSEK(platformCut)} <span className="text-[9px] text-purple-400 font-sans font-normal">SEK</span>
                              </td>

                              {/* Total Bill SEK */}
                              <td className="py-3.5 px-3 text-right font-mono font-black text-zinc-950 text-xs">
                                {formatSEK(totalBill)} <span className="text-[9px] text-zinc-400 font-sans font-normal">SEK</span>
                              </td>

                              {/* Vendor Cut */}
                              <td className="py-3.5 px-3 text-right font-mono font-black text-emerald-600 text-xs">
                                {formatSEK(vendorCut)} <span className="text-[9px] text-emerald-400 font-sans font-normal">SEK</span>
                              </td>

                              {/* Status */}
                              <td className="py-3.5 px-3 text-center">
                                <span className={`inline-block font-mono text-[9px] font-black px-2 py-0.5 rounded-full uppercase ${
                                  ord.status === "Completed"
                                    ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                                    : ord.status === "Ready"
                                    ? "bg-purple-100 text-purple-800 border border-purple-300"
                                    : ord.status === "Preparing"
                                    ? "bg-amber-100 text-amber-800 border border-amber-300"
                                    : "bg-blue-100 text-blue-800 border border-blue-300"
                                }`}>
                                  {ord.status}
                                </span>
                              </td>

                              {/* Inspect Stall */}
                              <td className="py-3.5 px-4 text-right">
                                {orderVendor ? (
                                  <button
                                    onClick={() => setInspectVendor(orderVendor)}
                                    className="p-1.5 text-zinc-600 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-all cursor-pointer inline-flex items-center gap-1"
                                    title={`Inspect ${orderVendor.name} details`}
                                  >
                                    <Eye className="w-4 h-4" />
                                    <span className="text-[10px] font-mono font-bold">Stall</span>
                                  </button>
                                ) : (
                                  <span className="text-zinc-400 text-[10px]">—</span>
                                )}
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          ) : activeTab === "credentials" ? (
            /* DEDICATED EVENT ADMIN ACCESS & CREDENTIALS DIRECTORY */
            <div className="space-y-6">
              {/* Directory Banner */}
              <div className="bg-purple-950 text-white rounded-2xl p-5 md:p-6 border-2 border-purple-800 shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="space-y-1 max-w-xl">
                  <div className="flex items-center gap-2">
                    <span className="bg-purple-800/80 text-purple-300 font-mono text-[10px] font-bold px-2 py-0.5 rounded-full uppercase flex items-center gap-1">
                      <KeyRound className="w-3 h-3 text-purple-400" /> Super Admin Access Governance
                    </span>
                    <span className="text-[10px] text-emerald-400 font-mono font-bold bg-emerald-950 px-2 py-0.5 rounded-full">
                      {events.length} Festivals Provisioned
                    </span>
                  </div>
                  <h3 className="font-display font-black text-xl md:text-2xl text-white">
                    Event Admin Access & Credentials Directory
                  </h3>
                  <p className="text-xs text-purple-200/80 leading-relaxed font-medium">
                    Super Admin master directory of assigned Event Admin accounts. Each event organizer logs into <strong className="text-white">/admin</strong> with their assigned Work Email and Password to update their festival specifications and approve vendor stalls.
                  </p>
                </div>

                <button
                  onClick={() => setActiveTab("create")}
                  className="bg-orange-500 hover:bg-orange-600 text-white text-xs font-display font-black px-4 py-2.5 rounded-xl transition-all shadow-md flex items-center gap-1.5 cursor-pointer uppercase tracking-wider shrink-0"
                >
                  <Plus className="w-4 h-4" />
                  <span>Onboard New Event</span>
                </button>
              </div>

              {/* Master Credentials Table / Cards */}
              <div className="space-y-4">
                {events.map((evt) => {
                  const isLive = evt.status === "Live";
                  const isCompleted = evt.status === "Completed";
                  const isPwdVisible = showPasswordMap[evt.id];
                  const pwd = evt.adminPassword || "admin123";
                  const adminName = evt.adminName || "Event Organizer";

                  return (
                    <div
                      key={evt.id}
                      className="bg-white rounded-2xl border-2 border-zinc-200 hover:border-purple-300 p-5 shadow-xs transition-all space-y-4 flex flex-col lg:flex-row justify-between lg:items-center gap-4"
                    >
                      {/* Left: Event Info */}
                      <div className="space-y-1.5 max-w-md">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-[10px] font-bold text-zinc-500 bg-zinc-100 px-2 py-0.5 rounded uppercase">
                            {evt.code}
                          </span>
                          <span className={`text-[10px] font-mono font-black px-2 py-0.5 rounded-full uppercase ${
                            isLive 
                              ? "bg-emerald-100 text-emerald-800" 
                              : isCompleted 
                              ? "bg-zinc-100 text-zinc-600" 
                              : "bg-amber-100 text-amber-800"
                          }`}>
                            {evt.status}
                          </span>
                          <span className="text-[10px] text-zinc-400 font-mono">
                            {evt.startDate}
                          </span>
                        </div>

                        <h4 className="font-display font-black text-base md:text-lg text-zinc-950">
                          {evt.name}
                        </h4>
                        <div className="text-xs text-zinc-500 flex items-center gap-1 font-medium">
                          <MapPin className="w-3.5 h-3.5 text-orange-500 shrink-0" />
                          <span>{evt.location}</span>
                        </div>
                      </div>

                      {/* Middle: Credentials Box */}
                      <div className="bg-purple-50/70 border-2 border-purple-200/80 rounded-2xl p-4 space-y-2 min-w-[280px] lg:max-w-sm">
                        <div className="flex justify-between items-center text-xs">
                          <span className="font-bold text-purple-950 font-mono uppercase text-[10px] flex items-center gap-1">
                            <KeyRound className="w-3.5 h-3.5 text-purple-600" /> Admin Credentials
                          </span>
                          <span className="text-[10px] text-zinc-500 font-mono">
                            Lead: <strong className="text-zinc-900">{adminName}</strong>
                          </span>
                        </div>

                        <div className="space-y-1 font-mono text-xs">
                          <div className="flex justify-between items-center bg-white px-3 py-1.5 rounded-xl border border-purple-100">
                            <span className="text-zinc-500 text-[11px]">Login ID:</span>
                            <span className="font-bold text-purple-950 truncate max-w-[180px]">{evt.organizerEmail}</span>
                          </div>

                          <div className="flex justify-between items-center bg-white px-3 py-1.5 rounded-xl border border-purple-100">
                            <span className="text-zinc-500 text-[11px]">Password:</span>
                            <div className="flex items-center gap-1.5">
                              <span className="font-bold text-zinc-900">
                                {isPwdVisible ? pwd : "••••••••"}
                              </span>
                              <button
                                type="button"
                                onClick={() => setShowPasswordMap(prev => ({ ...prev, [evt.id]: !prev[evt.id] }))}
                                className="text-purple-400 hover:text-purple-700 p-0.5 cursor-pointer"
                                title={isPwdVisible ? "Hide password" : "Show password"}
                              >
                                {isPwdVisible ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* Privileges tags */}
                        <div className="flex flex-wrap gap-1 pt-1">
                          <span className={`text-[9px] font-mono px-2 py-0.5 rounded-md font-bold ${
                            evt.adminPermissions?.canEditDetails !== false 
                              ? "bg-emerald-100 text-emerald-800" 
                              : "bg-zinc-100 text-zinc-400 line-through"
                          }`}>
                            Edit Details
                          </span>
                          <span className={`text-[9px] font-mono px-2 py-0.5 rounded-md font-bold ${
                            evt.adminPermissions?.canManageVendors !== false 
                              ? "bg-emerald-100 text-emerald-800" 
                              : "bg-zinc-100 text-zinc-400 line-through"
                          }`}>
                            Manage Vendors
                          </span>
                          <span className={`text-[9px] font-mono px-2 py-0.5 rounded-md font-bold ${
                            evt.adminPermissions?.canManageMap !== false 
                              ? "bg-emerald-100 text-emerald-800" 
                              : "bg-zinc-100 text-zinc-400 line-through"
                          }`}>
                            Map & QR
                          </span>
                          <span className={`text-[9px] font-mono px-2 py-0.5 rounded-md font-bold ${
                            evt.adminPermissions?.canViewFinancials !== false 
                              ? "bg-emerald-100 text-emerald-800" 
                              : "bg-zinc-100 text-zinc-400 line-through"
                          }`}>
                            Financials
                          </span>
                        </div>
                      </div>

                      {/* Right: Actions */}
                      <div className="flex flex-col sm:flex-row lg:flex-col gap-2 shrink-0">
                        <button
                          onClick={() => handleOpenEditModal(evt, "credentials")}
                          className="bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition-all shadow-xs cursor-pointer flex items-center justify-center gap-1.5"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          <span>Edit & Reassign Credentials</span>
                        </button>

                        <button
                          type="button"
                          disabled={sendingEmailId === evt.id}
                          onClick={() => handleSendAdminEmail(evt)}
                          className="bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition-all shadow-xs cursor-pointer flex items-center justify-center gap-1.5"
                        >
                          {sendingEmailId === evt.id ? (
                            <>
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              <span>Dispatching...</span>
                            </>
                          ) : emailSentMap[evt.id] ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-white stroke-[3px]" />
                              <span>Email Dispatched ✓</span>
                            </>
                          ) : (
                            <>
                              <Mail className="w-3.5 h-3.5" />
                              <span>Send Access Email</span>
                            </>
                          )}
                        </button>

                        <button
                          onClick={() => handleCopyCredentials(evt)}
                          className="bg-zinc-100 hover:bg-zinc-200 text-zinc-700 font-bold text-xs px-4 py-2.5 rounded-xl border border-zinc-200 transition-all cursor-pointer flex items-center justify-center gap-1.5"
                        >
                          {copiedId === evt.id ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                              <span className="text-emerald-700">Copied to Clipboard!</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5 text-zinc-500" />
                              <span>Copy Handover Note</span>
                            </>
                          )}
                        </button>

                        <a
                          href={`mailto:${evt.organizerEmail}?subject=${encodeURIComponent(`VenueEat Access Granted: ${evt.name}`)}&body=${encodeURIComponent(`Hej ${evt.adminName || "Organizer"}!\n\nHere are your access credentials for ${evt.name}:\n\nAdmin Portal: ${window.location.origin}/admin\nLogin ID (Email): ${evt.organizerEmail}\nPassword: ${pwd}\n\nPlease keep these confidential.`)}`}
                          className="text-[10px] text-purple-600 hover:text-purple-800 font-mono font-bold text-center underline pt-0.5"
                          target="_blank"
                          rel="noreferrer"
                        >
                          Open in Email App &rarr;
                        </a>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            /* EVENTS GRID DISPLAY (Live or History) */
            <div className="space-y-6">
              {filteredEvents.length === 0 ? (
                <div className="py-12 text-center space-y-3 bg-zinc-50 rounded-2xl border-2 border-dashed border-zinc-200">
                  <Archive className="w-8 h-8 mx-auto text-zinc-400" />
                  <p className="text-sm font-bold text-zinc-600">No events matched your search or filters.</p>
                  <button
                    onClick={() => {
                      setSearchTerm("");
                      setStatusFilter("All");
                      setCategoryFilter("All");
                      setYearFilter("All");
                    }}
                    className="text-xs text-orange-600 font-bold hover:underline cursor-pointer"
                  >
                    Reset all filters
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredEvents.map((evt) => {
                    const isActive = evt.id === activeEventId;
                    const isLive = evt.status === "Live";
                    const isCompleted = evt.status === "Completed";
                    const pwd = evt.adminPassword || "admin123";
                    const isPwdVisible = showPasswordMap[evt.id];

                    return (
                      <div
                        key={evt.id}
                        className={`group relative rounded-2xl border-2 p-5 bg-white transition-all duration-200 hover:shadow-lg flex flex-col justify-between space-y-4 ${
                          isActive
                            ? "border-orange-500 ring-2 ring-orange-500/20 shadow-md"
                            : "border-zinc-200/90 hover:border-zinc-300"
                        }`}
                      >
                        {/* Event Card Header */}
                        <div className="space-y-2">
                          <div className="flex justify-between items-start gap-2">
                            <span className="font-mono text-[9px] font-bold text-zinc-400 bg-zinc-100 px-2 py-0.5 rounded uppercase">
                              {evt.code}
                            </span>

                            {/* Status Badge */}
                            <span className={`text-[9px] font-mono font-black px-2 py-0.5 rounded-full uppercase flex items-center gap-1 ${
                              isLive 
                                ? "bg-emerald-100 text-emerald-800 border border-emerald-200" 
                                : isCompleted 
                                ? "bg-zinc-100 text-zinc-600 border border-zinc-200" 
                                : "bg-amber-100 text-amber-800 border border-amber-200"
                            }`}>
                              {isLive && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />}
                              {evt.status}
                            </span>
                          </div>

                          <div className="space-y-1">
                            <h3 className="font-display font-black text-base text-zinc-950 leading-snug line-clamp-2">
                              {evt.name}
                            </h3>
                            <div className="flex items-center gap-1.5 text-xs text-zinc-500 font-medium">
                              <MapPin className="w-3.5 h-3.5 text-orange-500 shrink-0" />
                              <span className="truncate">{evt.location}</span>
                            </div>
                          </div>
                        </div>

                        {/* Event Key Metrics */}
                        <div className="bg-zinc-50 rounded-xl p-3 border border-zinc-150 grid grid-cols-2 gap-2 text-xs">
                          <div>
                            <span className="text-[9px] text-zinc-400 font-bold uppercase tracking-wider block font-mono">GMV Volume</span>
                            <span className="font-mono font-black text-zinc-900 text-sm">
                              {evt.totalGmvSEK > 0 ? `${evt.totalGmvSEK.toLocaleString()} kr` : "Upcoming"}
                            </span>
                          </div>
                          <div>
                            <span className="text-[9px] text-zinc-400 font-bold uppercase tracking-wider block font-mono">Platform Fee</span>
                            <span className="font-mono font-black text-orange-600 text-sm">
                              {evt.platformFeeRevenueSEK > 0 ? `${evt.platformFeeRevenueSEK.toLocaleString()} kr` : "SaaS Only"}
                            </span>
                          </div>
                          <div>
                            <span className="text-[9px] text-zinc-400 font-bold uppercase tracking-wider block font-mono">Attendees</span>
                            <span className="font-mono font-bold text-zinc-800">
                              {evt.attendeesCount.toLocaleString()}
                            </span>
                          </div>
                          <div>
                            <span className="text-[9px] text-zinc-400 font-bold uppercase tracking-wider block font-mono">Vendors</span>
                            <span className="font-mono font-bold text-zinc-800">
                              {evt.activeVendorsCount} Stalls
                            </span>
                          </div>
                        </div>

                        {/* Event Admin Credentials Quick Preview Box */}
                        <div className="bg-purple-50/70 border border-purple-200/80 rounded-xl p-2.5 text-xs space-y-1">
                          <div className="flex justify-between items-center text-[10px] font-mono text-purple-900 font-bold">
                            <span className="flex items-center gap-1">
                              <KeyRound className="w-3 h-3 text-purple-600" /> Event Admin Login
                            </span>
                            <button
                              onClick={() => handleCopyCredentials(evt)}
                              className="text-purple-700 hover:text-purple-950 font-bold cursor-pointer"
                              title="Copy Login Handover"
                            >
                              {copiedId === evt.id ? (
                                <span className="text-emerald-700 flex items-center gap-0.5">
                                  <Check className="w-2.5 h-2.5" /> Copied
                                </span>
                              ) : (
                                <span className="flex items-center gap-0.5">
                                  <Copy className="w-2.5 h-2.5" /> Copy
                                </span>
                              )}
                            </button>
                          </div>
                          <div className="font-mono text-[10px] text-zinc-700 truncate">
                            ID: <strong className="text-purple-950">{evt.organizerEmail}</strong>
                          </div>
                          <div className="flex justify-between items-center font-mono text-[10px] text-zinc-500">
                            <span>Pass: <strong className="text-zinc-900">{isPwdVisible ? pwd : "••••••••"}</strong></span>
                            <button
                              type="button"
                              onClick={() => setShowPasswordMap(prev => ({ ...prev, [evt.id]: !prev[evt.id] }))}
                              className="text-purple-500 hover:text-purple-800 cursor-pointer"
                            >
                              {isPwdVisible ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                            </button>
                          </div>
                        </div>

                        {/* Historical / Highlight details */}
                        {isCompleted && evt.topVendorName && (
                          <div className="bg-amber-50/70 rounded-xl p-2.5 border border-amber-200/60 text-[10px] space-y-1">
                            <div className="flex justify-between font-bold text-amber-950">
                              <span className="flex items-center gap-1">
                                <Award className="w-3 h-3 text-amber-600" /> Top Vendor:
                              </span>
                              <span className="font-black">{evt.topVendorName}</span>
                            </div>
                            <div className="text-zinc-500 font-medium truncate">
                              Dishes: {(evt.topDishes || []).join(", ")}
                            </div>
                          </div>
                        )}

                        {/* Event Dates & Year */}
                        <div className="flex justify-between items-center text-[10px] font-mono text-zinc-400 pt-1 border-t border-zinc-100">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" /> {evt.startDate}
                          </span>
                          <span className="font-bold text-zinc-500">{evt.category}</span>
                        </div>

                        {/* Card Action Controls */}
                        <div className="pt-2 space-y-2">
                          <button
                            onClick={() => handleOpenEditModal(evt)}
                            className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-950 border border-purple-200 text-xs font-bold transition-all cursor-pointer"
                          >
                            <Edit3 className="w-3.5 h-3.5 text-purple-600" />
                            <span>Edit Event & Admin Access</span>
                          </button>

                          <div className="flex gap-2">
                            <button
                              onClick={() => handleSelectEvent(evt.id)}
                              className={`flex-1 flex items-center justify-center gap-1 py-2 px-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                                isActive
                                  ? "bg-orange-500 text-white shadow-xs"
                                  : "bg-zinc-100 hover:bg-zinc-200 text-zinc-800"
                              }`}
                            >
                              {isActive ? "Active in Demo" : "Activate"}
                            </button>

                            <button
                              onClick={() => setInspectEvent(evt)}
                              className="flex-1 flex items-center justify-center gap-1 py-2 px-2.5 rounded-xl border border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50 text-zinc-700 text-xs font-bold transition-all cursor-pointer"
                            >
                              Inspect
                            </button>

                            <button
                              type="button"
                              onClick={() => setEventToDelete(evt)}
                              className="p-2 rounded-xl border border-rose-200 hover:bg-rose-50 text-rose-600 transition-all cursor-pointer"
                              title="Delete Festival Event"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* EVENT DETAIL INSPECTION MODAL */}
      {inspectEvent && (
        <div className="fixed inset-0 bg-zinc-950/75 z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white text-zinc-900 rounded-3xl p-6 md:p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border-2 border-zinc-200 space-y-6 text-left animate-slideUp">
            {/* Header */}
            <div className="flex justify-between items-start border-b border-zinc-200 pb-4">
              <div>
                <span className="text-[10px] font-mono font-bold text-orange-600 bg-orange-50 border border-orange-200 px-2 py-0.5 rounded uppercase">
                  {inspectEvent.code}
                </span>
                <h3 className="font-display font-black text-xl md:text-2xl text-zinc-950 mt-1">
                  {inspectEvent.name}
                </h3>
                <p className="text-xs text-zinc-500 font-medium flex items-center gap-1 mt-0.5">
                  <MapPin className="w-3.5 h-3.5 text-orange-500" /> {inspectEvent.location}
                </p>
              </div>

              <button
                onClick={() => setInspectEvent(null)}
                className="p-1.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-500 rounded-full transition-all cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Event Financial & Performance Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="bg-zinc-50 p-3 rounded-xl border border-zinc-200 space-y-0.5">
                <span className="text-[9px] text-zinc-400 font-mono font-bold block uppercase">Total GMV</span>
                <span className="font-mono font-black text-zinc-950 text-sm">
                  {inspectEvent.totalGmvSEK.toLocaleString()} SEK
                </span>
              </div>
              <div className="bg-zinc-50 p-3 rounded-xl border border-zinc-200 space-y-0.5">
                <span className="text-[9px] text-zinc-400 font-mono font-bold block uppercase">Platform Earnings</span>
                <span className="font-mono font-black text-orange-600 text-sm">
                  {inspectEvent.platformFeeRevenueSEK.toLocaleString()} SEK
                </span>
              </div>
              <div className="bg-zinc-50 p-3 rounded-xl border border-zinc-200 space-y-0.5">
                <span className="text-[9px] text-zinc-400 font-mono font-bold block uppercase">Total Orders</span>
                <span className="font-mono font-black text-zinc-950 text-sm">
                  {inspectEvent.totalOrdersCount.toLocaleString()}
                </span>
              </div>
              <div className="bg-zinc-50 p-3 rounded-xl border border-zinc-200 space-y-0.5">
                <span className="text-[9px] text-zinc-400 font-mono font-bold block uppercase">Avg Prep Time</span>
                <span className="font-mono font-black text-zinc-950 text-sm">
                  {inspectEvent.averagePrepTimeMin || 6} mins
                </span>
              </div>
            </div>

            {/* Detailed Description */}
            <div className="space-y-1 bg-zinc-50 p-4 rounded-2xl border border-zinc-200 text-xs">
              <span className="font-bold text-zinc-700 block uppercase font-mono text-[10px]">Overview & Strategic Notes</span>
              <p className="text-zinc-600 leading-relaxed font-medium">{inspectEvent.description}</p>
              {inspectEvent.historyNotes && (
                <p className="text-zinc-500 italic mt-2 border-t border-zinc-200 pt-2 text-[11px]">
                  <strong>Audit Notes:</strong> {inspectEvent.historyNotes}
                </p>
              )}
            </div>

            {/* Technical Swish & Compliance Details */}
            <div className="bg-zinc-900 text-white p-4 rounded-2xl space-y-2 text-xs">
              <span className="text-[10px] text-orange-400 font-mono font-bold block uppercase">Swish Handel Integration</span>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-zinc-300 font-mono text-[11px]">
                <div>Merchant Swish ID: <strong className="text-white">{inspectEvent.swishMerchantId}</strong></div>
                <div>Organizer Contact: <strong className="text-white">{inspectEvent.organizerEmail}</strong></div>
              </div>
            </div>

            {/* Toggle Status Actions */}
            <div className="border-t border-zinc-200 pt-4 flex flex-col sm:flex-row justify-between items-center gap-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-zinc-600">Change Event Status:</span>
                <select
                  value={inspectEvent.status}
                  onChange={(e) => {
                    const newStatus = e.target.value as EventStatus;
                    onUpdateEventStatus(inspectEvent.id, newStatus);
                    setInspectEvent(prev => prev ? { ...prev, status: newStatus } : null);
                  }}
                  className="bg-zinc-100 border border-zinc-300 text-zinc-900 text-xs font-bold px-3 py-1.5 rounded-xl cursor-pointer"
                >
                  <option value="Live">Live Now</option>
                  <option value="Scheduled">Scheduled</option>
                  <option value="Completed">Completed (Archived)</option>
                </select>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => {
                    handleOpenEditModal(inspectEvent);
                    setInspectEvent(null);
                  }}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <KeyRound className="w-3.5 h-3.5" />
                  <span>Edit Event & Admin Access</span>
                </button>

                <button
                  type="button"
                  onClick={() => setEventToDelete(inspectEvent)}
                  className="px-3.5 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 border border-rose-200"
                >
                  <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                  <span>Delete Festival</span>
                </button>

                <button
                  onClick={() => {
                    handleSelectEvent(inspectEvent.id);
                    setInspectEvent(null);
                  }}
                  className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-xs font-bold transition-all cursor-pointer"
                >
                  Set as Active Event Context
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* EDIT EVENT DETAILS & ADMIN ACCESS MODAL */}
      {editEvent && (
        <div className="fixed inset-0 bg-zinc-950/80 z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white text-zinc-900 rounded-3xl p-6 md:p-8 max-w-2xl w-full max-h-[92vh] overflow-y-auto shadow-2xl border-2 border-purple-200 space-y-6 text-left animate-slideUp">
            {/* Modal Header */}
            <div className="flex justify-between items-start border-b border-zinc-200 pb-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono font-bold text-purple-700 bg-purple-50 border border-purple-200 px-2 py-0.5 rounded uppercase">
                    {editEvent.code}
                  </span>
                  <span className="text-[10px] font-mono font-bold text-zinc-500 bg-zinc-100 px-2 py-0.5 rounded">
                    ID: {editEvent.id}
                  </span>
                </div>
                <h3 className="font-display font-black text-xl md:text-2xl text-zinc-950">
                  Edit Event & Admin Access
                </h3>
                <p className="text-xs text-zinc-500 font-medium">
                  Update event specifications and grant or reassign Event Admin login credentials.
                </p>
              </div>

              <button
                onClick={() => setEditEvent(null)}
                className="p-1.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-500 rounded-full transition-all cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Sub-tab selection */}
            <div className="flex gap-2 border-b border-zinc-200 pb-2">
              <button
                type="button"
                onClick={() => setEditTab("details")}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  editTab === "details"
                    ? "bg-zinc-900 text-white shadow-xs"
                    : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
                }`}
              >
                <Sliders className="w-3.5 h-3.5 text-orange-400" />
                <span>1. Event Master Details</span>
              </button>
              <button
                type="button"
                onClick={() => setEditTab("credentials")}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  editTab === "credentials"
                    ? "bg-purple-700 text-white shadow-xs"
                    : "bg-purple-50 text-purple-700 hover:bg-purple-100"
                }`}
              >
                <KeyRound className="w-3.5 h-3.5 text-purple-300" />
                <span>2. Event Admin Credentials & Permissions</span>
              </button>
            </div>

            {editSuccessMsg && (
              <div className="bg-emerald-50 border border-emerald-300 text-emerald-950 p-3 rounded-xl text-xs font-bold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{editSuccessMsg}</span>
              </div>
            )}

            <form onSubmit={handleSaveEdit} className="space-y-5 text-xs">
              {editTab === "details" ? (
                /* Tab 1: Event Master Details */
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="font-bold text-zinc-700 block font-mono uppercase text-[11px]">
                        Event Name
                      </label>
                      <input
                        type="text"
                        required
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="w-full bg-zinc-50 border border-zinc-200 focus:border-orange-500 rounded-xl px-3 py-2.5 text-xs text-zinc-900 font-semibold outline-none"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="font-bold text-zinc-700 block font-mono uppercase text-[11px]">
                        Event Short Code
                      </label>
                      <input
                        type="text"
                        required
                        value={editCode}
                        onChange={(e) => setEditCode(e.target.value)}
                        className="w-full bg-zinc-50 border border-zinc-200 focus:border-orange-500 rounded-xl px-3 py-2.5 text-xs text-zinc-900 font-mono font-bold uppercase outline-none"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="font-bold text-zinc-700 block font-mono uppercase text-[11px]">
                        Status
                      </label>
                      <select
                        value={editStatus}
                        onChange={(e) => setEditStatus(e.target.value as EventStatus)}
                        className="w-full bg-zinc-50 border border-zinc-200 focus:border-orange-500 rounded-xl px-3 py-2.5 text-xs text-zinc-900 font-bold outline-none cursor-pointer"
                      >
                        <option value="Live">Live (Active Now)</option>
                        <option value="Scheduled">Scheduled (Upcoming)</option>
                        <option value="Completed">Completed (Historical)</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="font-bold text-zinc-700 block font-mono uppercase text-[11px]">
                        Festival Category
                      </label>
                      <select
                        value={editCategory}
                        onChange={(e) => setEditCategory(e.target.value as any)}
                        className="w-full bg-zinc-50 border border-zinc-200 focus:border-orange-500 rounded-xl px-3 py-2.5 text-xs text-zinc-900 font-bold outline-none cursor-pointer"
                      >
                        <option value="Cultural & Food">Cultural & Food</option>
                        <option value="Music Festival">Music Festival</option>
                        <option value="Street Market">Street Market</option>
                        <option value="Exhibition">Exhibition</option>
                        <option value="Sports & Fair">Sports & Fair</option>
                      </select>
                    </div>

                    <div className="space-y-1 md:col-span-2">
                      <label className="font-bold text-zinc-700 block font-mono uppercase text-[11px]">
                        Venue Location
                      </label>
                      <input
                        type="text"
                        required
                        value={editLocation}
                        onChange={(e) => setEditLocation(e.target.value)}
                        className="w-full bg-zinc-50 border border-zinc-200 focus:border-orange-500 rounded-xl px-3 py-2.5 text-xs text-zinc-900 font-medium outline-none"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="font-bold text-zinc-700 block font-mono uppercase text-[11px]">
                        Start Date
                      </label>
                      <input
                        type="date"
                        required
                        value={editStartDate}
                        onChange={(e) => setEditStartDate(e.target.value)}
                        className="w-full bg-zinc-50 border border-zinc-200 focus:border-orange-500 rounded-xl px-3 py-2 text-xs text-zinc-900 outline-none"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="font-bold text-zinc-700 block font-mono uppercase text-[11px]">
                        End Date
                      </label>
                      <input
                        type="date"
                        required
                        value={editEndDate}
                        onChange={(e) => setEditEndDate(e.target.value)}
                        className="w-full bg-zinc-50 border border-zinc-200 focus:border-orange-500 rounded-xl px-3 py-2 text-xs text-zinc-900 outline-none"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="font-bold text-zinc-700 block font-mono uppercase text-[11px]">
                        Expected Attendees
                      </label>
                      <input
                        type="number"
                        min="100"
                        required
                        value={editAttendees}
                        onChange={(e) => setEditAttendees(e.target.value)}
                        className="w-full bg-zinc-50 border border-zinc-200 focus:border-orange-500 rounded-xl px-3 py-2.5 text-xs text-zinc-900 outline-none"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="font-bold text-zinc-700 block font-mono uppercase text-[11px]">
                        Swish Handel Merchant Number
                      </label>
                      <input
                        type="text"
                        required
                        value={editSwishId}
                        onChange={(e) => setEditSwishId(e.target.value)}
                        className="w-full bg-zinc-50 border border-zinc-200 focus:border-orange-500 rounded-xl px-3 py-2.5 text-xs text-zinc-900 font-mono outline-none"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-zinc-700 block font-mono uppercase text-[11px]">
                      Event Description
                    </label>
                    <textarea
                      rows={2}
                      value={editDescription}
                      onChange={(e) => setEditDescription(e.target.value)}
                      className="w-full bg-zinc-50 border border-zinc-200 focus:border-orange-500 rounded-xl p-3 text-xs text-zinc-900 outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-zinc-700 block font-mono uppercase text-[11px]">
                      Custom Map Image URL (Optional)
                    </label>
                    <input
                      type="url"
                      placeholder="https://..."
                      value={editMapImageUrl}
                      onChange={(e) => setEditMapImageUrl(e.target.value)}
                      className="w-full bg-zinc-50 border border-zinc-200 focus:border-orange-500 rounded-xl px-3 py-2 text-xs text-zinc-900 font-mono outline-none"
                    />
                  </div>
                </div>
              ) : (
                /* Tab 2: Event Admin Credentials & Permissions */
                <div className="space-y-5">
                  <div className="bg-purple-50/70 border-2 border-purple-200 rounded-2xl p-4 md:p-5 space-y-4">
                    <div className="flex justify-between items-center border-b border-purple-200 pb-2">
                      <div className="flex items-center gap-2">
                        <KeyRound className="w-4 h-4 text-purple-700" />
                        <h4 className="font-bold text-purple-950 font-mono uppercase text-xs">
                          Event Admin Authentication Credentials
                        </h4>
                      </div>
                      <span className="text-[10px] bg-purple-200 text-purple-900 font-mono font-bold px-2 py-0.5 rounded-full">
                        Sign In Portal: /admin
                      </span>
                    </div>

                    <p className="text-xs text-purple-900/80 leading-relaxed">
                      Give or update this Event Admin's login credentials. When the organizer goes to the Event Admin portal (<strong className="text-purple-950">/admin</strong>), they log in using this Work Email (Login ID) and Password.
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="font-bold text-purple-950 block font-mono uppercase text-[11px]">
                          Event Admin Contact Name
                        </label>
                        <input
                          type="text"
                          required
                          value={editAdminName}
                          onChange={(e) => setEditAdminName(e.target.value)}
                          placeholder="e.g. Sandy (Creative Events Nordic)"
                          className="w-full bg-white border border-purple-200 focus:border-purple-600 rounded-xl px-3 py-2.5 text-xs text-zinc-900 font-semibold outline-none"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="font-bold text-purple-950 block font-mono uppercase text-[11px]">
                          Admin Login ID (Work Email) *
                        </label>
                        <input
                          type="email"
                          required
                          value={editAdminEmail}
                          onChange={(e) => setEditAdminEmail(e.target.value)}
                          placeholder="sandy@creativeventsnordic.com"
                          className="w-full bg-white border border-purple-200 focus:border-purple-600 rounded-xl px-3 py-2.5 text-xs text-zinc-900 font-semibold outline-none"
                        />
                      </div>

                      <div className="space-y-1 md:col-span-2">
                        <div className="flex justify-between items-center">
                          <label className="font-bold text-purple-950 block font-mono uppercase text-[11px]">
                            Login Password / Access PIN *
                          </label>
                          <button
                            type="button"
                            onClick={() => setEditAdminPassword(generateNewPassword())}
                            className="text-[10px] text-purple-700 hover:text-purple-900 font-bold underline cursor-pointer"
                          >
                            Generate Strong Password
                          </button>
                        </div>
                        <div className="relative">
                          <input
                            type={showPasswordMap["edit_current"] ? "text" : "password"}
                            required
                            value={editAdminPassword}
                            onChange={(e) => setEditAdminPassword(e.target.value)}
                            className="w-full bg-white border border-purple-200 focus:border-purple-600 rounded-xl pl-3 pr-10 py-2.5 text-xs text-zinc-900 font-mono font-bold outline-none"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPasswordMap(prev => ({ ...prev, edit_current: !prev.edit_current }))}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-purple-400 hover:text-purple-700 cursor-pointer"
                          >
                            {showPasswordMap["edit_current"] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Permissions delegation */}
                    <div className="pt-3 border-t border-purple-200 space-y-2">
                      <span className="text-[11px] font-bold text-purple-950 block font-mono uppercase">
                        Delegated Privileges for this Event Admin
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-purple-950">
                        <label className="flex items-center gap-2 p-2 rounded-xl bg-white border border-purple-200/80 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={editPermDetails}
                            onChange={(e) => setEditPermDetails(e.target.checked)}
                            className="rounded text-purple-600 accent-purple-600"
                          />
                          <div>
                            <div className="font-bold text-zinc-900">Allow Edit Event Details</div>
                            <div className="text-[10px] text-zinc-500">Can change dates, location, attendee capacity & description</div>
                          </div>
                        </label>

                        <label className="flex items-center gap-2 p-2 rounded-xl bg-white border border-purple-200/80 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={editPermVendors}
                            onChange={(e) => setEditPermVendors(e.target.checked)}
                            className="rounded text-purple-600 accent-purple-600"
                          />
                          <div>
                            <div className="font-bold text-zinc-900">Allow Vendor Management</div>
                            <div className="text-[10px] text-zinc-500">Can onboard, approve, and suspend food stalls</div>
                          </div>
                        </label>

                        <label className="flex items-center gap-2 p-2 rounded-xl bg-white border border-purple-200/80 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={editPermMap}
                            onChange={(e) => setEditPermMap(e.target.checked)}
                            className="rounded text-purple-600 accent-purple-600"
                          />
                          <div>
                            <div className="font-bold text-zinc-900">Allow Venue Map & QR</div>
                            <div className="text-[10px] text-zinc-500">Can update festival map and generate table QR codes</div>
                          </div>
                        </label>

                        <label className="flex items-center gap-2 p-2 rounded-xl bg-white border border-purple-200/80 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={editPermFinancials}
                            onChange={(e) => setEditPermFinancials(e.target.checked)}
                            className="rounded text-purple-600 accent-purple-600"
                          />
                          <div>
                            <div className="font-bold text-zinc-900">Allow Financial Audits</div>
                            <div className="text-[10px] text-zinc-500">Can audit live GMV sales and Swish split revenue</div>
                          </div>
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* Ready-to-Send Handover Card */}
                  <div className="bg-zinc-900 text-white rounded-2xl p-4 space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-mono font-bold text-zinc-400 uppercase">
                        Admin Login Handover Preview
                      </span>
                      <button
                        type="button"
                        onClick={() => handleCopyCredentials({
                          ...editEvent,
                          name: editName,
                          code: editCode,
                          location: editLocation,
                          startDate: editStartDate,
                          endDate: editEndDate,
                          organizerEmail: editAdminEmail,
                          adminName: editAdminName,
                          adminPassword: editAdminPassword
                        })}
                        className="text-[10px] text-orange-400 hover:text-orange-300 font-bold flex items-center gap-1 cursor-pointer"
                      >
                        {copiedId === editEvent.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copiedId === editEvent.id ? "Copied!" : "Copy Handover Text"}</span>
                      </button>
                    </div>

                    <div className="font-mono text-[11px] text-zinc-300 space-y-1 bg-zinc-950 p-3 rounded-xl border border-zinc-800">
                      <div>Portal: <strong className="text-white">{window.location.origin}/admin</strong></div>
                      <div>Login ID: <strong className="text-orange-400">{editAdminEmail || editEvent.organizerEmail}</strong></div>
                      <div>Password: <strong className="text-white">{editAdminPassword || "admin123"}</strong></div>
                    </div>
                  </div>
                </div>
              )}

              {/* Bottom Form Actions */}
              <div className="pt-3 border-t border-zinc-200 flex flex-col sm:flex-row justify-between items-center gap-3">
                <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={() => {
                      setEventToDelete(editEvent);
                    }}
                    className="px-3.5 py-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                    <span>Delete Event</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSendAdminEmail({
                      ...editEvent,
                      name: editName,
                      organizerEmail: editAdminEmail,
                      adminName: editAdminName,
                      adminPassword: editAdminPassword
                    })}
                    className="px-3.5 py-2.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <Mail className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Email Credentials</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleCopyCredentials({
                      ...editEvent,
                      name: editName,
                      code: editCode,
                      location: editLocation,
                      startDate: editStartDate,
                      endDate: editEndDate,
                      organizerEmail: editAdminEmail,
                      adminName: editAdminName,
                      adminPassword: editAdminPassword
                    })}
                    className="px-3.5 py-2.5 rounded-xl border border-zinc-200 hover:bg-zinc-100 text-zinc-700 text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <Copy className="w-3.5 h-3.5 text-zinc-500" />
                    <span>{copiedId === editEvent.id ? "Copied!" : "Copy Note"}</span>
                  </button>
                </div>

                <div className="flex gap-2 w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={() => setEditEvent(null)}
                    className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-zinc-700 text-xs font-bold transition-all cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 sm:flex-initial px-6 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-display font-black transition-all shadow-md shadow-orange-500/20 cursor-pointer flex items-center justify-center gap-1.5 uppercase tracking-wider"
                  >
                    <Save className="w-4 h-4" />
                    <span>Save & Deploy Changes</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CONFIRM DELETE EVENT MODAL */}
      {eventToDelete && (
        <div className="fixed inset-0 z-50 bg-zinc-950/80 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-zinc-200 text-left animate-slideUp">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <div className="text-center space-y-1">
              <h3 className="font-display font-black text-lg text-zinc-900">Delete Festival Event?</h3>
              <p className="text-xs text-zinc-600">
                Are you sure you want to permanently delete <strong>"{eventToDelete.name}"</strong>? This will remove the event, its food stalls, and its admin login credentials from Cloud Firestore.
              </p>
            </div>
            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setEventToDelete(null)}
                className="flex-1 py-2.5 rounded-xl border border-zinc-200 text-xs font-bold text-zinc-700 hover:bg-zinc-100 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-black shadow-md cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Trash2 className="w-4 h-4" />
                <span>Delete Event</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* EMAIL HANDOVER & DISPATCH MODAL */}
      {invitationModalEvent && (
        <div className="fixed inset-0 z-50 bg-zinc-950/80 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 md:p-7 space-y-5 shadow-2xl border border-zinc-200 text-left animate-slideUp">
            <div className="flex justify-between items-start border-b border-zinc-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-orange-100 text-orange-600 flex items-center justify-center shrink-0">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-display font-black text-base text-zinc-900">
                    Event Admin Access Credentials
                  </h3>
                  <p className="text-[11px] text-zinc-500 font-medium">
                    {invitationModalEvent.event.name} ({invitationModalEvent.event.code})
                  </p>
                </div>
              </div>
              <button
                onClick={() => setInvitationModalEvent(null)}
                className="text-zinc-400 hover:text-zinc-600 p-1 rounded-xl cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Credential summary */}
            <div className="bg-zinc-950 text-white rounded-2xl p-4 space-y-2.5 font-mono text-xs border border-zinc-800">
              <div className="flex justify-between items-center border-b border-zinc-800/80 pb-2">
                <span className="text-zinc-400 text-[11px]">Recipient Email:</span>
                <strong className="text-orange-400 font-bold">{invitationModalEvent.event.organizerEmail}</strong>
              </div>
              <div className="flex justify-between items-center border-b border-zinc-800/80 pb-2">
                <span className="text-zinc-400 text-[11px]">Assigned Password:</span>
                <strong className="text-sky-400 font-bold text-sm tracking-wide">
                  {invitationModalEvent.password || invitationModalEvent.event.adminPassword || "eventadmin2026"}
                </strong>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-zinc-400 text-[11px]">Portal Link:</span>
                <span className="text-zinc-300 font-bold">{window.location.origin}/admin</span>
              </div>
            </div>

            {/* Real-time Resend API Status Banner */}
            {modalDispatchResult && (
              modalDispatchResult.success ? (
                <div className="bg-emerald-50 border border-emerald-300 rounded-2xl p-3.5 flex items-start gap-3 animate-fadeIn">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  <div className="text-left space-y-0.5">
                    <div className="text-xs font-black text-emerald-900">
                      ✓ Email Successfully Dispatched via Resend API!
                    </div>
                    <p className="text-[11px] text-emerald-800 font-medium">
                      Credentials delivered directly to <strong>{invitationModalEvent.event.organizerEmail}</strong>.
                    </p>
                    {modalDispatchResult.id && (
                      <span className="inline-block text-[10px] font-mono font-bold text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded">
                        Resend ID: {modalDispatchResult.id}
                      </span>
                    )}
                  </div>
                </div>
              ) : (
                <div className="bg-rose-50 border border-rose-300 rounded-2xl p-3.5 space-y-2 text-left animate-fadeIn">
                  <div className="flex items-start gap-2.5">
                    <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                    <div className="space-y-0.5">
                      <div className="text-xs font-black text-rose-900">
                        Resend Delivery Notice
                      </div>
                      <p className="text-[11px] text-rose-800 leading-relaxed font-medium">
                        {modalDispatchResult.error || "Could not dispatch email via Resend."}
                      </p>
                    </div>
                  </div>
                  <div className="pt-1 border-t border-rose-200/80 flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => setShowKeyConfig(!showKeyConfig)}
                      className="text-[10px] text-rose-700 hover:text-rose-900 font-mono font-bold underline cursor-pointer"
                    >
                      {showKeyConfig ? "Close API Key Settings" : "⚙️ Configure / Check Resend API Key"}
                    </button>
                  </div>
                </div>
              )
            )}

            {/* Optional Resend API Key Config box */}
            {showKeyConfig && (
              <div className="bg-zinc-50 border border-zinc-200 rounded-2xl p-3.5 space-y-2 text-left animate-fadeIn">
                <div className="flex justify-between items-center text-[11px] font-mono font-bold text-zinc-700">
                  <span>Resend API Key:</span>
                  <span className="text-[10px] text-zinc-400 font-normal">Stored in browser</span>
                </div>
                <div className="flex gap-2">
                  <input
                    type="password"
                    placeholder="re_xxxxxxxxxxxxxx"
                    value={customResendKeyInput}
                    onChange={(e) => {
                      const v = e.target.value.trim();
                      setCustomResendKeyInput(v);
                      if (v) {
                        localStorage.setItem("venueeat_resend_api_key", v);
                      } else {
                        localStorage.removeItem("venueeat_resend_api_key");
                      }
                    }}
                    className="flex-1 bg-white border border-zinc-300 focus:border-orange-500 rounded-xl px-3 py-1.5 text-xs font-mono outline-none"
                  />
                </div>
                <p className="text-[10px] text-zinc-500 leading-tight">
                  You can set <code>RESEND_API_KEY</code> in Vercel project environment variables for production. If testing locally or overriding, paste it here.
                </p>
              </div>
            )}

            {/* Direct Action Buttons */}
            <div className="space-y-2.5 pt-1">
              <button
                type="button"
                onClick={handleDirectResendFromModal}
                disabled={isDispatchingModalEmail}
                className="w-full bg-orange-500 hover:bg-orange-600 active:scale-98 text-white font-display font-black text-xs py-3.5 rounded-2xl shadow-lg shadow-orange-500/25 transition-all flex items-center justify-center gap-2 uppercase tracking-wider cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed text-center"
              >
                {isDispatchingModalEmail ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                    <span>Sending via Resend API...</span>
                  </>
                ) : modalDispatchResult?.success ? (
                  <>
                    <RefreshCw className="w-4 h-4 text-white" />
                    <span>Re-Send Email via Resend API</span>
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4 text-yellow-300" />
                    <span>⚡ Send Email Directly via Resend API</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => {
                  handleCopyCredentials(invitationModalEvent.event);
                }}
                className="w-full bg-zinc-100 hover:bg-zinc-200 text-zinc-700 font-bold text-xs py-3 rounded-2xl border border-zinc-200 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Copy className="w-4 h-4 text-zinc-500" />
                <span>{copiedId === invitationModalEvent.event.id ? "✓ Copied to Clipboard!" : "Copy Complete Email Message"}</span>
              </button>
            </div>

            <p className="text-[11px] text-zinc-500 text-center leading-relaxed">
              Tapping <strong>"Send Email Directly via Resend API"</strong> triggers an automated dispatch to the Event Manager's inbox using your configured Resend credentials.
            </p>
          </div>
        </div>
      )}

      {/* VENDOR STORE DETAIL MODAL (SUPER ADMIN STALL INSPECTION) */}
      {inspectVendor && (
        <AdminStoreDetailModal
          vendor={inspectVendor}
          orders={allOrders.filter(o => o.vendorId === inspectVendor.id)}
          onClose={() => setInspectVendor(null)}
          onApproveVendor={handleApproveVendor}
          onSuspendVendor={handleSuspendVendor}
          onUpdateVendorProfile={handleUpdateVendorProfile}
          eventName={events.find(e => e.id === inspectVendor.eventId)?.name || "Stockholm Festival"}
          currentEvent={events.find(e => e.id === inspectVendor.eventId)}
        />
      )}
    </div>
  );
}

