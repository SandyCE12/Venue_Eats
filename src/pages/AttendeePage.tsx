import React, { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { useApp } from "../context/AppContext";
import { 
  ShoppingBag, 
  Utensils, 
  Clock, 
  MapPin, 
  Search, 
  Plus, 
  Minus, 
  Trash2, 
  Check, 
  History, 
  Ticket, 
  Map, 
  MessageSquare, 
  Sparkles, 
  Zap, 
  X,
  ChevronRight,
  ArrowLeft,
  ArrowRight,
  Store,
  Bell,
  BellRing,
  BellOff,
  Volume2,
  VolumeX,
  CheckCircle2
} from "lucide-react";
import { MenuItem, Vendor, ExtraOption } from "../types";
import SwishPaymentGateway from "../components/SwishPaymentGateway";
import OrderStatusTracker from "../components/OrderStatusTracker";
import EventMap from "../components/EventMap";
import SupportChat from "../components/SupportChat";
import VendorJoinModal from "../components/VendorJoinModal";
import { CartPopoutModal } from "../components/CartPopoutModal";
import { EventSelectorScreen } from "../components/EventSelectorScreen";

export interface CartEntry {
  id: string;
  menuItem: MenuItem;
  quantity: number;
  selectedExtras: ExtraOption[];
}

export interface ReadyAlertInfo {
  id: string;
  orderId?: string;
  queueNumber: number;
  vendorName: string;
  stallNumber?: string;
  location?: string;
  itemsSummary: string;
  timestamp: string;
}

export const AttendeePage: React.FC = () => {
  const {
    vendors,
    orders,
    activeVendorId,
    setActiveVendorId,
    customerCart,
    addToCart,
    removeFromCart,
    clearCart,
    customerName,
    setCustomerName,
    currentOrder,
    setCurrentOrder,
    confirmSwishPayment,
    estimateVendorWaitTime,
    user,
    handleSignIn,
    eventMapUrl,
    attendeeTab: activeTab,
    setAttendeeTab: setActiveTab,
    ordersSubTab,
    setOrdersSubTab,
    selectedVendorStallId,
    setSelectedVendorStallId,
    showCartDrawer,
    setShowCartDrawer,
    cartEntries,
    setCartEntries,
    updateOrderStatus,
    setNotification,
    logActivity,
    selectedUserEventId,
    setSelectedUserEventId,
    managedEvents,
  } = useApp();

  const currentEvent = managedEvents.find(e => e.id === selectedUserEventId) || managedEvents[0];

  const [stallSearchQuery, setStallSearchQuery] = useState<string>(" ");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [showSwishFlow, setShowSwishFlow] = useState<boolean>(false);
  const [showVendorJoinModal, setShowVendorJoinModal] = useState<boolean>(false);

  // Mock Notification Toggle & Simulation States
  const [mockNotificationsEnabled, setMockNotificationsEnabled] = useState<boolean>(() => {
    const saved = localStorage.getItem("venueeat_mock_notifications_enabled");
    return saved !== null ? saved === "true" : true;
  });
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [activeReadyAlert, setActiveReadyAlert] = useState<ReadyAlertInfo | null>(null);
  const [isSimulatingReady, setIsSimulatingReady] = useState<boolean>(false);
  const previousOrderStatusRef = useRef<string | null>(null);

  // Customization overlay state
  const [customizingItem, setCustomizingItem] = useState<MenuItem | null>(null);
  const [selectedExtrasForCustomizing, setSelectedExtrasForCustomizing] = useState<string[]>([]);
  const [customizingQty, setCustomizingQty] = useState<number>(1);

  // Persist mock notification toggle in localStorage
  const handleToggleMockNotifications = (enabled: boolean) => {
    setMockNotificationsEnabled(enabled);
    localStorage.setItem("venueeat_mock_notifications_enabled", String(enabled));
    if (enabled) {
      setNotification("🔔 Mock Food Ready Notifications enabled! Alerts will trigger when orders are ready.");
    } else {
      setNotification("🔕 Mock Food Ready Notifications disabled.");
    }
  };

  // Web Audio synthesizer chime for food ready alert
  const playReadyChime = () => {
    if (!soundEnabled) return;
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return;
      const ctx = new AudioContextClass();
      
      const tones = [
        { freq: 523.25, time: 0 },       // C5
        { freq: 659.25, time: 0.12 },    // E5
        { freq: 783.99, time: 0.24 },    // G5
        { freq: 1046.50, time: 0.38 }    // C6
      ];

      tones.forEach(({ freq, time }) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, ctx.currentTime + time);
        gain.gain.setValueAtTime(0.12, ctx.currentTime + time);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + time + 0.35);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + time);
        osc.stop(ctx.currentTime + time + 0.35);
      });
    } catch (e) {
      console.warn("Audio Context playback note:", e);
    }
  };

  // Trigger ready alert banner and sound
  const triggerReadyAlert = (alertData: ReadyAlertInfo) => {
    if (!mockNotificationsEnabled) return;
    playReadyChime();
    setActiveReadyAlert(alertData);
    if (logActivity) {
      logActivity(
        `Mock Ready Notification Alert: Order #${alertData.queueNumber} at ${alertData.vendorName} is READY for pickup!`,
        "order",
        "success"
      );
    }
  };

  // Simulate instant food ready alert
  const handleSimulateReadyAlert = async () => {
    setIsSimulatingReady(true);

    if (currentOrder && (currentOrder.status === "Placed" || currentOrder.status === "Preparing")) {
      // Advance real tracked order to Ready
      await updateOrderStatus(currentOrder.id, "Ready");
      const matchedVendor = vendors.find(v => v.id === currentOrder.vendorId);
      triggerReadyAlert({
        id: `alert_${Date.now()}`,
        orderId: currentOrder.id,
        queueNumber: currentOrder.queueNumber,
        vendorName: currentOrder.vendorName,
        stallNumber: matchedVendor?.stallNumber || "Express Counter",
        location: matchedVendor?.location || "Festival Grounds",
        itemsSummary: currentOrder.items.map(i => `${i.menuItem.name} x${i.quantity}`).join(", "),
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      });
    } else {
      // Generate realistic mock ready alert
      const targetVendor = activeVendor || vendors[0];
      const mockQueue = orders.length > 0 ? Math.max(...orders.map(o => o.queueNumber)) : 104;
      triggerReadyAlert({
        id: `alert_${Date.now()}`,
        queueNumber: mockQueue,
        vendorName: targetVendor.name,
        stallNumber: targetVendor.stallNumber || "Stall #1",
        location: targetVendor.location || "Kungsträdgården Central Lawn",
        itemsSummary: targetVendor.menu.slice(0, 2).map(m => `${m.name} x1`).join(", ") || "Signature Festival Dish x1",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      });
    }

    setTimeout(() => {
      setIsSimulatingReady(false);
    }, 600);
  };

  // Auto-monitor current order status transitions to trigger ready alert when status becomes "Ready"
  useEffect(() => {
    if (currentOrder) {
      if (
        previousOrderStatusRef.current && 
        previousOrderStatusRef.current !== "Ready" && 
        currentOrder.status === "Ready"
      ) {
        if (mockNotificationsEnabled) {
          const matchedVendor = vendors.find(v => v.id === currentOrder.vendorId);
          triggerReadyAlert({
            id: `alert_${Date.now()}`,
            orderId: currentOrder.id,
            queueNumber: currentOrder.queueNumber,
            vendorName: currentOrder.vendorName,
            stallNumber: matchedVendor?.stallNumber || "Express Counter",
            location: matchedVendor?.location || "Festival Grounds",
            itemsSummary: currentOrder.items.map(i => `${i.menuItem.name} x${i.quantity}`).join(", "),
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          });
        }
      }
      previousOrderStatusRef.current = currentOrder.status;
    } else {
      previousOrderStatusRef.current = null;
    }
  }, [currentOrder?.status, mockNotificationsEnabled]);

  // Lock body scroll when modals / drawers are open
  useEffect(() => {
    if (customizingItem || showCartDrawer || showVendorJoinModal) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [customizingItem, showCartDrawer, showVendorJoinModal]);

  const activeVendor = vendors.find(v => v.id === activeVendorId) || vendors[0];

  // Helper to add item directly without customization
  const handleAddItemDirect = (item: MenuItem) => {
    setCartEntries(prev => {
      const existingIdx = prev.findIndex(
        entry => entry.menuItem.id === item.id && entry.selectedExtras.length === 0
      );
      if (existingIdx >= 0) {
        const updated = [...prev];
        updated[existingIdx] = {
          ...updated[existingIdx],
          quantity: updated[existingIdx].quantity + 1
        };
        return updated;
      } else {
        return [
          ...prev,
          {
            id: `${item.id}_plain_${Date.now()}`,
            menuItem: item,
            quantity: 1,
            selectedExtras: []
          }
        ];
      }
    });
    addToCart(item.id, 1);
  };

  const handleIncreaseCartEntry = (entryId: string) => {
    setCartEntries(prev =>
      prev.map(entry => {
        if (entry.id === entryId) {
          addToCart(entry.menuItem.id, 1);
          return { ...entry, quantity: entry.quantity + 1 };
        }
        return entry;
      })
    );
  };

  const handleDecreaseCartEntry = (entryId: string) => {
    setCartEntries(prev => {
      const target = prev.find(e => e.id === entryId);
      if (!target) return prev;
      removeFromCart(target.menuItem.id);
      if (target.quantity > 1) {
        return prev.map(e => e.id === entryId ? { ...e, quantity: e.quantity - 1 } : e);
      } else {
        return prev.filter(e => e.id !== entryId);
      }
    });
  };

  const handleDecreaseItemByMenuItemId = (menuItemId: string) => {
    setCartEntries(prev => {
      const indexToRemove = prev.findLastIndex(e => e.menuItem.id === menuItemId);
      if (indexToRemove < 0) return prev;
      const target = prev[indexToRemove];
      removeFromCart(target.menuItem.id);
      if (target.quantity > 1) {
        const updated = [...prev];
        updated[indexToRemove] = { ...target, quantity: target.quantity - 1 };
        return updated;
      } else {
        return prev.filter((_, idx) => idx !== indexToRemove);
      }
    });
  };

  const getItemTotalQtyInCart = (menuItemId: string): number => {
    return cartEntries
      .filter(entry => entry.menuItem.id === menuItemId)
      .reduce((sum, entry) => sum + entry.quantity, 0);
  };

  const getCartItemsList = () => {
    return cartEntries.map(entry => ({
      menuItem: entry.menuItem,
      quantity: entry.quantity,
      selectedExtras: entry.selectedExtras
    }));
  };

  const getCartTotal = (): number => {
    return cartEntries.reduce((sum, entry) => {
      const extrasCost = entry.selectedExtras.reduce((eSum, extra) => eSum + Number(extra.price || 0), 0);
      return sum + ((Number(entry.menuItem.price) + extrasCost) * Number(entry.quantity));
    }, 0);
  };

  const getCartItemCount = (): number => {
    return cartEntries.reduce((sum, entry) => sum + Number(entry.quantity), 0);
  };

  const openCustomizer = (item: MenuItem) => {
    setCustomizingItem(item);
    setSelectedExtrasForCustomizing([]);
    setCustomizingQty(1);
  };

  const handleToggleExtra = (extraId: string) => {
    setSelectedExtrasForCustomizing(prev => 
      prev.includes(extraId) ? prev.filter(id => id !== extraId) : [...prev, extraId]
    );
  };

  const calculateCustomizingTotal = (): number => {
    if (!customizingItem) return 0;
    const extrasCost = (customizingItem.extras || [])
      .filter(e => selectedExtrasForCustomizing.includes(e.id))
      .reduce((sum, e) => sum + e.price, 0);
    return (customizingItem.price + extrasCost) * customizingQty;
  };

  const handleConfirmCustomization = () => {
    if (!customizingItem) return;

    const chosenExtras = (customizingItem.extras || []).filter(e =>
      selectedExtrasForCustomizing.includes(e.id)
    );

    const extrasKey = chosenExtras.map(e => e.id).sort().join("_");
    const entryId = extrasKey ? `${customizingItem.id}_ext_${extrasKey}` : `${customizingItem.id}_plain_${Date.now()}`;

    setCartEntries(prev => {
      const existingIdx = prev.findIndex(e => e.id === entryId);
      if (existingIdx >= 0) {
        const updated = [...prev];
        updated[existingIdx] = {
          ...updated[existingIdx],
          quantity: updated[existingIdx].quantity + customizingQty
        };
        return updated;
      } else {
        return [
          ...prev,
          {
            id: entryId,
            menuItem: customizingItem,
            quantity: customizingQty,
            selectedExtras: chosenExtras
          }
        ];
      }
    });

    addToCart(customizingItem.id, customizingQty);
    setCustomizingItem(null);
  };

  // Filter menu items for current vendor
  const filteredMenuItems = activeVendor ? activeVendor.menu.filter(item => {
    const matchesCat = selectedCategory === "all" || item.category === selectedCategory;
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          item.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  }) : [];

  if (!selectedUserEventId) {
    return <EventSelectorScreen />;
  }

  return (
    <div className="space-y-6 pb-24 animate-fadeIn">
      {/* FLOATING MOCK READY PUSH NOTIFICATION ALERT TOAST */}
      {activeReadyAlert && (
        <div className="fixed top-20 right-4 sm:right-8 z-50 max-w-md w-[calc(100%-2rem)] sm:w-full animate-fadeIn shadow-2xl">
          <div className="bg-zinc-950 text-white rounded-3xl border-2 border-emerald-500/80 p-5 shadow-2xl backdrop-blur-md relative overflow-hidden text-left">
            {/* Ambient background glow */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-orange-500/10 rounded-full blur-2xl pointer-events-none" />

            <div className="relative z-10 space-y-3.5">
              {/* Header row */}
              <div className="flex items-start justify-between gap-3 border-b border-zinc-800 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center shrink-0">
                    <BellRing className="w-5 h-5 animate-bounce" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono font-black px-2 py-0.5 rounded-full bg-emerald-500 text-zinc-950 uppercase tracking-wide">
                        Food Ready
                      </span>
                      <span className="text-[11px] font-mono text-zinc-400">
                        {activeReadyAlert.timestamp}
                      </span>
                    </div>
                    <h4 className="font-display font-black text-sm text-white mt-0.5">
                      Order Ready for Pickup!
                    </h4>
                  </div>
                </div>

                <button
                  onClick={() => setActiveReadyAlert(null)}
                  className="text-zinc-400 hover:text-white p-1 rounded-lg hover:bg-zinc-800 transition-colors cursor-pointer"
                  title="Dismiss notification"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Order and Vendor metadata */}
              <div className="bg-zinc-900/90 rounded-2xl p-3.5 border border-zinc-800 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-zinc-400 font-medium">Queue No:</span>
                    <span className="font-mono font-black text-emerald-400 text-base">
                      #{activeReadyAlert.queueNumber}
                    </span>
                  </div>
                  <span className="text-xs font-mono font-bold text-zinc-300 bg-zinc-800 px-2.5 py-0.5 rounded-lg border border-zinc-700">
                    {activeReadyAlert.stallNumber || "Express Counter"}
                  </span>
                </div>

                <div className="space-y-0.5">
                  <p className="text-xs font-black text-zinc-100">{activeReadyAlert.vendorName}</p>
                  <p className="text-[11px] text-zinc-400 flex items-center gap-1 font-medium">
                    <MapPin className="w-3 h-3 text-orange-400 shrink-0" />
                    <span>{activeReadyAlert.location || "Festival Grounds"}</span>
                  </p>
                </div>

                {activeReadyAlert.itemsSummary && (
                  <p className="text-[11px] text-zinc-400 border-t border-zinc-800/80 pt-2 font-mono">
                    <span className="text-zinc-500">Items: </span>
                    <span className="text-zinc-300">{activeReadyAlert.itemsSummary}</span>
                  </p>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 pt-1">
                <button
                  onClick={() => {
                    setActiveTab("orders");
                    setOrdersSubTab("live");
                    setActiveReadyAlert(null);
                  }}
                  className="flex-1 bg-emerald-500 hover:bg-emerald-400 active:scale-95 text-zinc-950 font-display font-black text-xs py-2.5 rounded-xl transition-all flex items-center justify-center gap-1.5 shadow-md cursor-pointer"
                >
                  <Ticket className="w-3.5 h-3.5" />
                  <span>View Live Ticket</span>
                </button>

                {activeReadyAlert.orderId && (
                  <button
                    onClick={async () => {
                      if (activeReadyAlert.orderId) {
                        await updateOrderStatus(activeReadyAlert.orderId, "Completed");
                      }
                      setActiveReadyAlert(null);
                    }}
                    className="bg-zinc-800 hover:bg-zinc-700 active:scale-95 text-zinc-200 text-xs font-bold px-3 py-2.5 rounded-xl transition-all flex items-center gap-1 cursor-pointer border border-zinc-700 shrink-0"
                    title="Mark order as picked up"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Collected</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ACTIVE EVENT PORTAL BANNER */}
      {currentEvent && (
        <div className="bg-zinc-950 text-white rounded-3xl p-5 md:p-6 shadow-xl border border-zinc-800 text-left relative overflow-hidden flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="space-y-1.5 z-10">
            <div className="flex flex-wrap items-center gap-2">
              <span className="bg-orange-500/20 border border-orange-500/40 text-orange-400 text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                {currentEvent.category}
              </span>
              <span className="bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Live Event
              </span>
            </div>
            <h2 className="font-display font-black text-xl md:text-2xl text-white tracking-tight leading-tight">
              {currentEvent.name}
            </h2>
            <div className="flex flex-wrap items-center gap-3 text-xs text-zinc-400 font-medium">
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-orange-400 shrink-0" />
                {currentEvent.location}
              </span>
              <span>•</span>
              <span className="font-mono">
                {currentEvent.activeVendorsCount} Open Food Stalls
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 z-10 w-full md:w-auto justify-end border-t md:border-t-0 border-zinc-800 pt-3 md:pt-0">
            <button
              onClick={() => {
                setSelectedUserEventId(null);
                setSelectedVendorStallId(null);
              }}
              className="px-3.5 py-2 bg-zinc-900 hover:bg-zinc-800 active:scale-95 text-zinc-300 hover:text-white border border-zinc-700 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-sm"
              title="Switch to another live festival or event"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Change Event</span>
            </button>
          </div>
        </div>
      )}

      {/* TOP MOCK NOTIFICATION & PICKUP SIMULATION CONTROL BAR */}
      <div className="bg-white rounded-3xl border border-zinc-200 p-4 sm:p-5 shadow-xs text-left">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          
          {/* Info & Status Indicator */}
          <div className="flex items-center gap-3.5">
            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 border transition-all ${
              mockNotificationsEnabled 
                ? "bg-emerald-50 text-emerald-600 border-emerald-200" 
                : "bg-zinc-100 text-zinc-400 border-zinc-200"
            }`}>
              {mockNotificationsEnabled ? (
                <BellRing className="w-5 h-5 animate-pulse" />
              ) : (
                <BellOff className="w-5 h-5" />
              )}
            </div>

            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <h4 className="font-display font-black text-sm text-zinc-900">
                  Mock Food Ready Notifications
                </h4>
                <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full flex items-center gap-1 border ${
                  mockNotificationsEnabled
                    ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                    : "bg-zinc-100 text-zinc-500 border-zinc-200"
                }`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${
                    mockNotificationsEnabled ? "bg-emerald-500 animate-ping" : "bg-zinc-400"
                  }`} />
                  <span>{mockNotificationsEnabled ? "Active Simulator" : "Disabled"}</span>
                </span>
              </div>
              <p className="text-xs text-zinc-500 font-medium">
                Simulates real-time push alert & audio chime when a food stall marks your order ready for pickup.
              </p>
            </div>
          </div>

          {/* Controls & Quick Simulate Trigger */}
          <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto justify-start md:justify-end border-t md:border-t-0 border-zinc-100 pt-3 md:pt-0">
            
            {/* Sound chime toggle */}
            <button
              onClick={() => setSoundEnabled(s => !s)}
              className={`p-2 rounded-xl border text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                soundEnabled 
                  ? "bg-zinc-100 text-zinc-800 border-zinc-200 hover:bg-zinc-200" 
                  : "bg-zinc-50 text-zinc-400 border-zinc-200 hover:bg-zinc-100"
              }`}
              title={soundEnabled ? "Chime sound enabled" : "Chime sound muted"}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4 text-orange-600" /> : <VolumeX className="w-4 h-4" />}
              <span className="text-[11px] font-medium hidden sm:inline">{soundEnabled ? "Audio On" : "Muted"}</span>
            </button>

            {/* Toggle Switch */}
            <div className="flex items-center gap-2 bg-zinc-100 p-1 rounded-2xl border border-zinc-200">
              <button
                onClick={() => handleToggleMockNotifications(false)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  !mockNotificationsEnabled
                    ? "bg-white text-zinc-900 shadow-xs font-black"
                    : "text-zinc-500 hover:text-zinc-900"
                }`}
              >
                Off
              </button>
              <button
                onClick={() => handleToggleMockNotifications(true)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                  mockNotificationsEnabled
                    ? "bg-emerald-600 text-white shadow-xs font-black"
                    : "text-zinc-500 hover:text-zinc-900"
                }`}
              >
                <span>On</span>
                {mockNotificationsEnabled && <Check className="w-3 h-3 stroke-[3]" />}
              </button>
            </div>

            {/* Quick Simulate Trigger Button */}
            <button
              onClick={handleSimulateReadyAlert}
              disabled={isSimulatingReady}
              className="bg-orange-500 hover:bg-orange-600 active:scale-95 disabled:opacity-50 text-white text-xs font-display font-black px-3.5 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 shadow-xs shrink-0"
              title="Trigger mock food ready alert immediately"
            >
              <Zap className={`w-3.5 h-3.5 ${isSimulatingReady ? "animate-spin" : ""}`} />
              <span>{isSimulatingReady ? "Triggering..." : "Simulate Ready Alert 🔔"}</span>
            </button>

          </div>
        </div>
      </div>

      {/* RENDER CONTENT BASED ON ACTIVE TAB */}
      {activeTab === "orders" ? (
        <div className="bg-white rounded-3xl border border-zinc-200 p-6 md:p-8 shadow-xs text-left max-w-3xl mx-auto space-y-6">
          {/* Sub-header with toggle between Live Ticket and Order History */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-zinc-150 pb-4">
            <div className="flex items-center gap-2">
              <Ticket className="w-5 h-5 text-orange-500" />
              <h3 className="font-display font-black text-xl text-zinc-900">
                {ordersSubTab === "live" ? "Live Pickup Ticket" : "Order History & Receipts"}
              </h3>
            </div>

            <div className="flex items-center gap-1.5 p-1 bg-zinc-100 rounded-xl border border-zinc-200 text-xs font-bold">
              <button
                onClick={() => setOrdersSubTab("live")}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  ordersSubTab === "live"
                    ? "bg-zinc-900 text-white shadow-xs font-black"
                    : "text-zinc-600 hover:text-zinc-900"
                }`}
              >
                Live Ticket {currentOrder && currentOrder.status !== "Completed" && "●"}
              </button>
              <button
                onClick={() => setOrdersSubTab("history")}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  ordersSubTab === "history"
                    ? "bg-zinc-900 text-white shadow-xs font-black"
                    : "text-zinc-600 hover:text-zinc-900"
                }`}
              >
                Past Orders ({orders.length})
              </button>
            </div>
          </div>

          {ordersSubTab === "live" ? (
            currentOrder ? (
              <div className="space-y-4">
                <OrderStatusTracker order={currentOrder} />
                
                {/* Fast-forward simulator shortcut button if order is Placed or Preparing */}
                {(currentOrder.status === "Placed" || currentOrder.status === "Preparing") && (
                  <div className="bg-orange-50 border border-orange-200/80 rounded-2xl p-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-2 text-xs font-medium text-orange-950">
                      <Sparkles className="w-4 h-4 text-orange-600 shrink-0" />
                      <span>Want to test the pickup notification immediately?</span>
                    </div>
                    <button
                      onClick={handleSimulateReadyAlert}
                      disabled={isSimulatingReady}
                      className="bg-orange-500 hover:bg-orange-600 active:scale-95 text-white font-display font-black text-xs px-3.5 py-1.5 rounded-xl transition-all cursor-pointer shadow-xs shrink-0 flex items-center gap-1.5"
                    >
                      <Zap className="w-3.5 h-3.5" />
                      <span>Simulate Order Ready 🔔</span>
                    </button>
                  </div>
                )}

                {orders.length > 1 && (
                  <div className="text-center pt-2">
                    <button
                      onClick={() => setOrdersSubTab("history")}
                      className="text-xs font-bold text-zinc-500 hover:text-zinc-900 underline cursor-pointer"
                    >
                      View all {orders.length} orders in history →
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="py-12 text-center space-y-4">
                <Ticket className="w-12 h-12 text-zinc-300 mx-auto" />
                <div className="space-y-1">
                  <h4 className="font-display font-black text-base text-zinc-800">No Active Order Tracked</h4>
                  <p className="text-xs text-zinc-500 max-w-sm mx-auto font-medium">
                    Select a food stall from the menu and checkout with Swish to generate your live digital pickup ticket!
                  </p>
                </div>
                <button
                  onClick={() => setActiveTab("menu")}
                  className="bg-orange-500 text-white text-xs font-bold px-5 py-2.5 rounded-2xl shadow-md cursor-pointer hover:bg-orange-600 transition-all"
                >
                  Browse Festival Food
                </button>
              </div>
            )
          ) : (
            /* HISTORY VIEW */
            orders.length === 0 ? (
              <p className="text-sm text-zinc-500 italic py-8 text-center">No previous orders found for this session.</p>
            ) : (
              <div className="space-y-3">
                {orders.map(o => (
                  <div key={o.id} className="p-4 rounded-2xl border border-zinc-200 bg-zinc-50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-black text-orange-600 text-sm">#{o.queueNumber}</span>
                        <span className="font-black text-zinc-900 text-sm">{o.vendorName}</span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          o.status === "Ready" ? "bg-orange-100 text-orange-800 animate-pulse" :
                          o.status === "Completed" ? "bg-emerald-100 text-emerald-800" :
                          "bg-blue-100 text-blue-800"
                        }`}>{o.status}</span>
                      </div>
                      <p className="text-xs text-zinc-500 mt-1">{o.timestamp} • {o.items.map(i => `${i.menuItem.name} x${i.quantity}`).join(", ")}</p>
                    </div>
                    <div className="text-right shrink-0 flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto gap-2">
                      <span className="font-mono font-black text-zinc-900 text-base">{o.totalAmount} SEK</span>
                      <button
                        onClick={() => {
                          setCurrentOrder(o);
                          setOrdersSubTab("live");
                        }}
                        className="text-xs text-orange-600 font-bold hover:underline cursor-pointer"
                      >
                        View Live Ticket →
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )
          )}
        </div>
      ) : activeTab === "map" ? (
        <div className="bg-white rounded-3xl border border-zinc-200 p-6 shadow-xs text-left">
          <EventMap
            vendors={vendors}
            activeVendorId={activeVendorId}
            onSelectVendor={(id) => {
              setActiveVendorId(id);
              setSelectedVendorStallId(id);
              setSelectedCategory("all");
              setSearchQuery("");
              setActiveTab("menu");
            }}
            onBackToMenu={() => {
              setSelectedVendorStallId(null);
              setActiveTab("menu");
            }}
            mapImageUrl={eventMapUrl}
            estimateWaitTime={estimateVendorWaitTime}
          />
        </div>
      ) : activeTab === "support" ? (
        <div className="bg-white rounded-3xl border border-zinc-200 p-6 shadow-xs text-left max-w-2xl mx-auto">
          <SupportChat type="customer" customerName={customerName} />
        </div>
      ) : selectedVendorStallId === null ? (
        /* 1. ALL FOOD VENDORS DIRECTORY VIEW */
        <div className="space-y-6 text-left animate-fadeIn">
          
          {/* Header with Search & Vendor Join */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-3xl border border-zinc-200 shadow-xs">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h3 className="font-display font-black text-xl text-zinc-950">
                  {currentEvent ? `${currentEvent.name} · Food Stalls & Menus` : "Festival Food Stalls & Menus"}
                </h3>
                <span className="bg-orange-100 text-orange-800 text-[10px] font-mono font-bold px-2 py-0.5 rounded-full">
                  {vendors.filter(v => v.isApproved === true).length} Stalls Open
                </span>
              </div>
              <p className="text-xs text-zinc-500 font-medium">
                Tap any stall below to open their exclusive festival menu, customize dishes, and order via Swish.
              </p>
            </div>

            <div className="flex items-center gap-3 w-full md:w-auto">
              <div className="relative flex-1 md:w-60">
                <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search stalls, cuisines, dishes..."
                  value={stallSearchQuery}
                  onChange={(e) => setStallSearchQuery(e.target.value)}
                  className="w-full bg-zinc-50 border border-zinc-200 focus:border-orange-500 rounded-xl pl-8 pr-3 py-2 text-xs text-zinc-900 outline-none transition-all font-medium"
                />
              </div>

              {/* Compact vendor join icon button */}
              <button
                onClick={() => setShowVendorJoinModal(true)}
                className="inline-flex items-center gap-1.5 px-3 py-2 bg-orange-50 hover:bg-orange-100 active:scale-95 border border-orange-200/90 text-orange-800 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-2xs shrink-0"
                title="Are you a food vendor? Register your stall on VenueEat"
              >
                <Store className="w-3.5 h-3.5 text-orange-600 shrink-0" />
                <span className="text-xs hidden sm:inline">Are you a vendor?</span>
              </button>
            </div>
          </div>

          {/* FOOD STALLS GRID */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {vendors
              .filter(v => v.isApproved === true)
              .filter(v => {
                if (!stallSearchQuery.trim()) return true;
                const q = stallSearchQuery.toLowerCase();
                const matchName = v.name.toLowerCase().includes(q);
                const matchCuisine = v.cuisine.toLowerCase().includes(q);
                const matchMenu = v.menu.some(m => m.name.toLowerCase().includes(q) || m.description.toLowerCase().includes(q));
                return matchName || matchCuisine || matchMenu;
              })
              .map(v => {
                const waitInfo = estimateVendorWaitTime(v.id);
                const isSelected = v.id === activeVendorId;
                const sampleItems = v.menu.slice(0, 3);
                const lowestPrice = Math.min(...v.menu.map(m => m.price));

                return (
                  <div
                    key={v.id}
                    onClick={() => {
                      setActiveVendorId(v.id);
                      setSelectedVendorStallId(v.id);
                      setSelectedCategory("all");
                      setSearchQuery("");
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }}
                    className="bg-white rounded-3xl border-2 border-zinc-200 hover:border-orange-400 hover:shadow-lg transition-all cursor-pointer p-6 flex flex-col justify-between space-y-5 text-left group"
                  >
                    {/* Top Row: Logo, Stall Info & Stall # */}
                    <div className="space-y-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3.5">
                          <div className="text-4xl p-3 bg-zinc-50 group-hover:bg-orange-50 rounded-2xl border border-zinc-200 group-hover:border-orange-200 transition-all">
                            {v.logo}
                          </div>
                          <div>
                            <h4 className="font-display font-black text-lg text-zinc-950 group-hover:text-orange-600 transition-colors leading-tight">
                              {v.name}
                            </h4>
                            <p className="text-xs font-semibold text-zinc-500 mt-0.5">{v.cuisine}</p>
                          </div>
                        </div>

                        <span className="text-[11px] font-mono font-bold px-2.5 py-1 rounded-xl bg-zinc-100 text-zinc-700 border border-zinc-200 shrink-0">
                          {v.stallNumber || "Stall"}
                        </span>
                      </div>

                      {/* Location & Live Wait Time Badges */}
                      <div className="flex flex-wrap items-center gap-2 pt-1">
                        <span className="inline-flex items-center gap-1 text-[11px] font-mono font-bold text-zinc-600 bg-zinc-50 px-2.5 py-1 rounded-lg border border-zinc-150">
                          <MapPin className="w-3 h-3 text-orange-500" />
                          <span>{v.location || "Festival Grounds"}</span>
                        </span>

                        <span className={`inline-flex items-center gap-1 text-[11px] font-mono font-bold px-2.5 py-1 rounded-lg border ${
                          waitInfo.congestionLevel === "Low" 
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200" 
                            : waitInfo.congestionLevel === "Medium"
                            ? "bg-amber-50 text-amber-700 border-amber-200"
                            : "bg-rose-50 text-rose-700 border-rose-200"
                        }`}>
                          <Clock className="w-3 h-3 text-orange-500" />
                          <span>{waitInfo.minutes}m wait</span>
                          <span className="text-zinc-400">•</span>
                          <span>{waitInfo.activeCount} in queue</span>
                        </span>
                      </div>

                      {/* Sample Menu Highlights */}
                      <div className="bg-zinc-50 rounded-2xl p-3 border border-zinc-150 space-y-1.5">
                        <div className="flex justify-between text-[11px] font-mono text-zinc-500 font-bold">
                          <span>POPULAR DISHES</span>
                          <span className="text-orange-600">From {lowestPrice} SEK</span>
                        </div>
                        <p className="text-xs text-zinc-700 line-clamp-2 leading-relaxed">
                          {sampleItems.map(m => m.name).join(" • ")}
                        </p>
                      </div>
                    </div>

                    {/* Action Button */}
                    <button
                      type="button"
                      className="w-full bg-zinc-950 group-hover:bg-orange-500 active:scale-[0.98] text-white font-display font-black text-xs py-3 rounded-2xl transition-all flex items-center justify-center gap-2 shadow-xs cursor-pointer"
                    >
                      <Utensils className="w-3.5 h-3.5" />
                      <span>View Menu & Order ({v.menu.length} items)</span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                    </button>
                  </div>
                );
              })}
          </div>
        </div>
      ) : (
        /* 2. DEDICATED VENDOR STALL MENU PAGE */
        <div className="space-y-6 text-left animate-fadeIn">
          
          {/* Back Navigation Bar & Breadcrumbs */}
          <div className="flex items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-zinc-200 shadow-xs">
            <button
              onClick={() => {
                setSelectedVendorStallId(null);
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              className="inline-flex items-center gap-2 px-3.5 py-2 bg-zinc-100 hover:bg-zinc-200 active:scale-95 text-zinc-800 text-xs font-display font-black rounded-xl transition-all cursor-pointer shadow-2xs"
            >
              <ArrowLeft className="w-4 h-4 text-orange-600" />
              <span>← Back to All Food Stalls</span>
            </button>

            <div className="text-xs font-mono text-zinc-500 hidden sm:flex items-center gap-1.5 font-semibold">
              <span className="text-zinc-400">Festival Food Stalls</span>
              <span>/</span>
              <span className="text-zinc-900 font-bold">{activeVendor.name}</span>
            </div>
          </div>

          {/* VENDOR STALL COVER HEADER */}
          <div className="bg-white rounded-3xl border border-zinc-200 p-6 md:p-8 space-y-6 shadow-xs">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b border-zinc-150 pb-6">
              <div className="flex items-center gap-4 sm:gap-5">
                <div className="text-5xl p-4 bg-orange-50 rounded-3xl border border-orange-200/80 shadow-xs shrink-0">
                  {activeVendor.logo}
                </div>
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="font-display font-black text-2xl sm:text-3xl text-zinc-950 tracking-tight">
                      {activeVendor.name}
                    </h2>
                    <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-full bg-zinc-100 text-zinc-700 border border-zinc-200">
                      {activeVendor.stallNumber || "Stall"}
                    </span>
                  </div>
                  
                  <p className="text-xs text-zinc-500 font-medium flex flex-wrap items-center gap-2">
                    <span className="font-bold text-zinc-800">{activeVendor.cuisine}</span>
                    <span>•</span>
                    <span className="text-orange-600 font-bold flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5" /> {activeVendor.location}
                    </span>
                    <span>•</span>
                    <span className="font-mono text-zinc-500">Swish #{activeVendor.swishNumber}</span>
                  </p>

                  {/* Wait Time Indicator */}
                  {(() => {
                    const waitInfo = estimateVendorWaitTime(activeVendor.id);
                    return (
                      <div className="pt-1.5 flex items-center gap-2">
                        <span className={`inline-flex items-center gap-1.5 text-xs font-mono font-bold px-3 py-1 rounded-xl border ${
                          waitInfo.congestionLevel === "Low" 
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200" 
                            : waitInfo.congestionLevel === "Medium"
                            ? "bg-amber-50 text-amber-700 border-amber-200"
                            : "bg-rose-50 text-rose-700 border-rose-200"
                        }`}>
                          <Clock className="w-3.5 h-3.5 text-orange-500" />
                          <span>Estimated wait: {waitInfo.minutes} mins</span>
                          <span>•</span>
                          <span>{waitInfo.activeCount} orders ahead in queue</span>
                        </span>
                      </div>
                    );
                  })()}
                </div>
              </div>

              {/* Dish Search & Category Filters */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 w-full md:w-auto">
                <div className="relative flex-1 md:w-52">
                  <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search stall menu..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-zinc-50 border border-zinc-200 focus:border-orange-500 rounded-xl pl-8 pr-3 py-2 text-xs text-zinc-900 outline-none font-medium transition-all"
                  />
                </div>

                <div className="flex bg-zinc-100 p-1 rounded-xl text-xs font-bold overflow-x-auto scrollbar-none">
                  {["all", "Food", "Drink", "Snack", "Dessert"].map(cat => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`px-3 py-1.5 rounded-lg capitalize transition-all cursor-pointer whitespace-nowrap ${
                        selectedCategory === cat ? "bg-white text-zinc-900 shadow-xs font-black" : "text-zinc-500 hover:text-zinc-900"
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Dish Items Grid for this stall */}
            {filteredMenuItems.length === 0 ? (
              <div className="py-12 text-center space-y-2">
                <Utensils className="w-8 h-8 text-zinc-300 mx-auto" />
                <p className="text-xs text-zinc-500 font-medium">No dishes match your filter query. Try selecting 'all' categories.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredMenuItems.map(item => {
                  const itemQtyInCart = getItemTotalQtyInCart(item.id);
                  return (
                    <div key={item.id} className="bg-zinc-50 rounded-2xl border border-zinc-200 p-4 flex flex-col justify-between space-y-4 hover:border-zinc-300 transition-all">
                      <div className="space-y-2">
                        {item.imageUrl && (
                          <img src={item.imageUrl} alt={item.name} className="w-full h-36 object-cover rounded-xl border border-zinc-200" />
                        )}
                        <div className="flex justify-between items-start">
                          <h4 className="font-display font-black text-base text-zinc-900 leading-tight">{item.name}</h4>
                          <span className="font-mono font-black text-zinc-900 text-sm bg-white px-2 py-0.5 rounded-lg border border-zinc-200 shrink-0">
                            {item.price} SEK
                          </span>
                        </div>
                        <p className="text-xs text-zinc-500 line-clamp-2 leading-relaxed">{item.description}</p>
                      </div>

                      {/* Add to Cart Controls */}
                      <div className="flex items-center justify-between pt-2 border-t border-zinc-200/60 gap-2">
                        <div className="flex items-center gap-2">
                          {itemQtyInCart > 0 ? (
                            <div className="flex items-center gap-2 bg-white border border-zinc-300 rounded-xl p-1">
                              <button
                                onClick={() => handleDecreaseItemByMenuItemId(item.id)}
                                className="p-1 hover:bg-zinc-100 rounded-lg text-zinc-700 cursor-pointer"
                              >
                                <Minus className="w-3.5 h-3.5" />
                              </button>
                              <span className="font-mono font-black text-xs px-2">{itemQtyInCart}</span>
                              <button
                                onClick={() => handleAddItemDirect(item)}
                                className="p-1 hover:bg-zinc-100 rounded-lg text-zinc-700 cursor-pointer"
                              >
                                <Plus className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => handleAddItemDirect(item)}
                              className="bg-zinc-900 hover:bg-zinc-800 active:scale-95 text-white text-xs font-bold px-3.5 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 shadow-xs"
                            >
                              <Plus className="w-3.5 h-3.5" /> Add to Order
                            </button>
                          )}
                        </div>

                        {item.extras && item.extras.length > 0 && (
                          <button
                            onClick={() => openCustomizer(item)}
                            className="bg-orange-50 hover:bg-orange-100 text-orange-700 border border-orange-200 active:scale-95 text-xs font-bold px-3 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-1 shadow-xs shrink-0"
                          >
                            <Sparkles className="w-3.5 h-3.5 text-orange-500" /> Customize
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* CUSTOMIZATION MODAL DIALOG */}
      {customizingItem && createPortal(
        <div 
          className="fixed inset-0 z-[9999] flex flex-col justify-end sm:justify-center items-center p-0 sm:p-4 bg-zinc-950/80 backdrop-blur-md overflow-hidden animate-fadeIn"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setCustomizingItem(null);
            }
          }}
        >
          <div 
            className="bg-white w-full max-w-lg rounded-t-3xl sm:rounded-3xl shadow-2xl border-t sm:border border-zinc-200 overflow-hidden flex flex-col max-h-[90vh] sm:max-h-[85vh]"
            onClick={(e) => e.stopPropagation()}
          >
            
            {/* Header */}
            <div className="p-5 border-b border-zinc-150 flex justify-between items-start bg-zinc-50">
              <div className="flex items-center gap-3">
                {customizingItem.imageUrl && (
                  <img src={customizingItem.imageUrl} alt={customizingItem.name} className="w-14 h-14 object-cover rounded-xl border border-zinc-200 shrink-0" />
                )}
                <div>
                  <span className="text-[10px] font-mono font-bold bg-orange-100 text-orange-800 px-2 py-0.5 rounded-md uppercase">
                    {customizingItem.category}
                  </span>
                  <h3 className="font-display font-black text-lg text-zinc-900 leading-tight mt-0.5">
                    {customizingItem.name}
                  </h3>
                  <p className="text-xs font-mono font-bold text-zinc-600 mt-0.5">
                    Base Price: {customizingItem.price} SEK
                  </p>
                </div>
              </div>
              <button
                onClick={() => setCustomizingItem(null)}
                className="text-zinc-400 hover:text-zinc-900 p-1.5 rounded-xl hover:bg-zinc-200/60 transition-all cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body */}
            <div className="p-5 space-y-5 overflow-y-auto flex-1 text-left">
              <p className="text-xs text-zinc-600 leading-relaxed bg-zinc-50 p-3 rounded-xl border border-zinc-150">
                {customizingItem.description}
              </p>

              {customizingItem.extras && customizingItem.extras.length > 0 ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-display font-black text-sm text-zinc-900 flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-orange-500" />
                      Select Extras & Add-ons
                    </h4>
                    <span className="text-[11px] text-zinc-400 font-medium">Optional</span>
                  </div>

                  <div className="space-y-2">
                    {customizingItem.extras.map((extra) => {
                      const isSelected = selectedExtrasForCustomizing.includes(extra.id);
                      return (
                        <button
                          key={extra.id}
                          type="button"
                          onClick={() => handleToggleExtra(extra.id)}
                          className={`w-full p-3.5 rounded-2xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                            isSelected
                              ? "bg-orange-50/80 border-orange-500 text-orange-950 font-medium shadow-xs"
                              : "bg-white border-zinc-200 text-zinc-800 hover:border-zinc-300"
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className={`w-5 h-5 rounded-lg border flex items-center justify-center transition-all ${
                              isSelected ? "bg-orange-500 border-orange-500 text-white" : "border-zinc-300 bg-white"
                            }`}>
                              {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                            </div>
                            <span className="text-xs font-bold">{extra.name}</span>
                          </div>
                          <span className="font-mono text-xs font-bold text-orange-600">
                            +{extra.price} SEK
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <p className="text-xs text-zinc-500 italic">No additional extras available for this item.</p>
              )}
            </div>

            {/* Footer */}
            <div className="p-5 border-t border-zinc-150 bg-zinc-50 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-zinc-700">Quantity</span>
                <div className="flex items-center gap-3 bg-white border border-zinc-200 rounded-2xl p-1.5 shadow-2xs">
                  <button
                    type="button"
                    onClick={() => setCustomizingQty(q => Math.max(1, q - 1))}
                    className="p-1.5 hover:bg-zinc-100 rounded-xl text-zinc-700 cursor-pointer transition-all disabled:opacity-40"
                    disabled={customizingQty <= 1}
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="font-mono font-black text-sm px-2 min-w-[20px] text-center">{customizingQty}</span>
                  <button
                    type="button"
                    onClick={() => setCustomizingQty(q => q + 1)}
                    className="p-1.5 hover:bg-zinc-100 rounded-xl text-zinc-700 cursor-pointer transition-all"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <button
                type="button"
                onClick={handleConfirmCustomization}
                className="w-full bg-orange-500 hover:bg-orange-600 active:scale-[0.99] text-white font-display font-black text-sm py-3.5 rounded-2xl transition-all shadow-md shadow-orange-500/20 cursor-pointer flex items-center justify-between px-5"
              >
                <span>Add to Order</span>
                <span className="font-mono font-black bg-white/20 px-2.5 py-1 rounded-xl text-xs">
                  {calculateCustomizingTotal()} SEK
                </span>
              </button>
            </div>

          </div>
        </div>,
        document.body
      )}

      {/* CART POPOUT PAGE MODAL */}
      <CartPopoutModal
        isOpen={showCartDrawer}
        onClose={() => setShowCartDrawer(false)}
        onProceedToSwish={() => setShowSwishFlow(true)}
      />

      {/* SWISH PAYMENT POPUP GATEWAY */}
      <SwishPaymentGateway
        isOpen={showSwishFlow}
        onClose={() => setShowSwishFlow(false)}
        amount={getCartTotal()}
        vendorName={activeVendor?.name || "Vendor"}
        vendorSwishNumber={activeVendor?.swishNumber || "123 918 27 36"}
        customerName={customerName}
        onCustomerNameChange={setCustomerName}
        onPaymentSuccess={async (custName, vendorName, total, method) => {
          await confirmSwishPayment(custName, activeVendor, total, getCartItemsList(), method);
          setCartEntries([]);
          setShowSwishFlow(false);
          setActiveTab("orders");
          setOrdersSubTab("live");
        }}
        nextQueueNumber={orders.length > 0 ? Math.max(...orders.map(o => o.queueNumber)) + 1 : 101}
      />

      {/* VENDOR JOIN PLATFORM POPUP */}
      <VendorJoinModal 
        isOpen={showVendorJoinModal} 
        onClose={() => setShowVendorJoinModal(false)} 
      />

      {/* Floating Sticky Mobile Cart Bar */}
      {getCartItemCount() > 0 && !showCartDrawer && !showSwishFlow && (
        <div className="md:hidden fixed bottom-16 left-4 right-4 z-30">
          <button
            onClick={() => setShowCartDrawer(true)}
            className="w-full bg-zinc-950 text-white p-3.5 rounded-2xl shadow-2xl flex items-center justify-between border border-zinc-800 active:scale-98 transition-all cursor-pointer"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-orange-500 text-white flex items-center justify-center font-bold shrink-0">
                <ShoppingBag className="w-4 h-4" />
              </div>
              <div className="text-left leading-tight">
                <span className="font-display font-black text-xs block text-white">View Cart</span>
                <span className="text-[10px] text-zinc-400 font-mono">{getCartItemCount()} item{getCartItemCount() > 1 ? 's' : ''} added</span>
              </div>
            </div>
            <div className="flex items-center gap-2 bg-orange-500 text-white px-3 py-1.5 rounded-xl font-mono text-xs font-black">
              <span>{getCartTotal()} kr</span>
              <ChevronRight className="w-4 h-4" />
            </div>
          </button>
        </div>
      )}
    </div>
  );
};
