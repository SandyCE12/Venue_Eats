import React, { useState } from "react";
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
  Store
} from "lucide-react";
import { MenuItem, Vendor, ExtraOption } from "../types";
import SwishPaymentGateway from "../components/SwishPaymentGateway";
import OrderStatusTracker from "../components/OrderStatusTracker";
import EventMap from "../components/EventMap";
import SupportChat from "../components/SupportChat";
import VendorJoinModal from "../components/VendorJoinModal";

export interface CartEntry {
  id: string;
  menuItem: MenuItem;
  quantity: number;
  selectedExtras: ExtraOption[];
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
    eventMapUrl
  } = useApp();

  const [activeTab, setActiveTab] = useState<"menu" | "tracker" | "history" | "map" | "support">("menu");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [showCartDrawer, setShowCartDrawer] = useState<boolean>(false);
  const [showSwishFlow, setShowSwishFlow] = useState<boolean>(false);
  const [showVendorJoinModal, setShowVendorJoinModal] = useState<boolean>(false);

  // Customization overlay state
  const [customizingItem, setCustomizingItem] = useState<MenuItem | null>(null);
  const [selectedExtrasForCustomizing, setSelectedExtrasForCustomizing] = useState<string[]>([]);
  const [customizingQty, setCustomizingQty] = useState<number>(1);

  // Cart entries state supporting customized extras
  const [cartEntries, setCartEntries] = useState<CartEntry[]>([]);

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

  return (
    <div className="space-y-6 pb-24 animate-fadeIn">
      
      {/* ATTENDEE TOP NAVIGATION TABS */}
      <div className="flex items-center justify-between gap-2 border-b border-zinc-200 pb-4 overflow-x-auto scrollbar-none">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab("menu")}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl font-display font-black text-xs transition-all cursor-pointer ${
              activeTab === "menu" 
                ? "bg-orange-500 text-white shadow-md shadow-orange-500/20" 
                : "bg-white text-zinc-600 hover:bg-zinc-100 border border-zinc-200"
            }`}
          >
            <Utensils className="w-4 h-4" />
            <span>Food Stalls & Menu</span>
          </button>

          <button
            onClick={() => setActiveTab("tracker")}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl font-display font-black text-xs transition-all cursor-pointer relative ${
              activeTab === "tracker" 
                ? "bg-zinc-900 text-white shadow-md" 
                : "bg-white text-zinc-600 hover:bg-zinc-100 border border-zinc-200"
            }`}
          >
            <Ticket className="w-4 h-4 text-orange-500" />
            <span>Live Order Ticket</span>
            {currentOrder && currentOrder.status !== "Completed" && (
              <span className="h-2 w-2 rounded-full bg-orange-500 animate-ping absolute top-2 right-2" />
            )}
          </button>

          <button
            onClick={() => setActiveTab("history")}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl font-display font-black text-xs transition-all cursor-pointer ${
              activeTab === "history" 
                ? "bg-zinc-900 text-white shadow-md" 
                : "bg-white text-zinc-600 hover:bg-zinc-100 border border-zinc-200"
            }`}
          >
            <History className="w-4 h-4" />
            <span>Order History</span>
          </button>

          <button
            onClick={() => setActiveTab("map")}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl font-display font-black text-xs transition-all cursor-pointer ${
              activeTab === "map" 
                ? "bg-zinc-900 text-white shadow-md" 
                : "bg-white text-zinc-600 hover:bg-zinc-100 border border-zinc-200"
            }`}
          >
            <Map className="w-4 h-4" />
            <span>Festival Map</span>
          </button>

          <button
            onClick={() => setActiveTab("support")}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl font-display font-black text-xs transition-all cursor-pointer ${
              activeTab === "support" 
                ? "bg-zinc-900 text-white shadow-md" 
                : "bg-white text-zinc-600 hover:bg-zinc-100 border border-zinc-200"
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            <span>Support Chat</span>
          </button>

          <button
            onClick={() => setShowVendorJoinModal(true)}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-2xl font-display font-black text-xs bg-orange-50 text-orange-700 hover:bg-orange-100 border border-orange-200 transition-all cursor-pointer shrink-0"
          >
            <Store className="w-4 h-4 text-orange-600" />
            <span>Become a Vendor</span>
          </button>
        </div>

        {/* Floating Cart Button */}
        <button
          onClick={() => setShowCartDrawer(true)}
          className="bg-zinc-950 hover:bg-zinc-800 text-white px-5 py-2.5 rounded-2xl font-display font-black text-xs flex items-center gap-2.5 shadow-lg transition-all cursor-pointer relative shrink-0"
        >
          <ShoppingBag className="w-4 h-4 text-orange-400" />
          <span>Cart</span>
          {getCartItemCount() > 0 && (
            <span className="bg-orange-500 text-white font-mono text-[11px] font-black px-2 py-0.5 rounded-full">
              {getCartItemCount()} • {getCartTotal()} kr
            </span>
          )}
        </button>
      </div>

      {/* RENDER CONTENT BASED ON ACTIVE TAB */}
      {activeTab === "tracker" ? (
        <div className="bg-white rounded-3xl border border-zinc-200 p-6 md:p-8 shadow-xs text-left max-w-2xl mx-auto space-y-6">
          <div className="flex justify-between items-center border-b border-zinc-150 pb-4">
            <h3 className="font-display font-black text-xl text-zinc-900 flex items-center gap-2">
              <Ticket className="w-5 h-5 text-orange-500" />
              Your Live Pickup Ticket
            </h3>
            <button
              onClick={() => setActiveTab("menu")}
              className="text-xs font-bold text-orange-600 hover:underline flex items-center gap-1 cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Food Stalls
            </button>
          </div>

          {currentOrder ? (
            <OrderStatusTracker order={currentOrder} />
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
          )}
        </div>
      ) : activeTab === "history" ? (
        <div className="bg-white rounded-3xl border border-zinc-200 p-6 md:p-8 shadow-xs text-left max-w-3xl mx-auto space-y-6">
          <div className="flex justify-between items-center border-b border-zinc-150 pb-4">
            <h3 className="font-display font-black text-xl text-zinc-900 flex items-center gap-2">
              <History className="w-5 h-5 text-orange-500" />
              Order History & Swish Receipts
            </h3>
          </div>

          {orders.length === 0 ? (
            <p className="text-sm text-zinc-500 italic py-8 text-center">No previous orders found for this session.</p>
          ) : (
            <div className="space-y-3">
              {orders.map(o => (
                <div key={o.id} className="p-4 rounded-2xl border border-zinc-200 bg-zinc-50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-black text-orange-600 text-sm">#{o.queueNumber}</span>
                      <span className="font-black text-zinc-900 text-sm">{o.vendorName}</span>
                      <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">{o.status}</span>
                    </div>
                    <p className="text-xs text-zinc-500 mt-1">{o.timestamp} • {o.items.map(i => `${i.menuItem.name} x${i.quantity}`).join(", ")}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="font-mono font-black text-zinc-900 text-base">{o.totalAmount} SEK</span>
                    <button
                      onClick={() => {
                        setCurrentOrder(o);
                        setActiveTab("tracker");
                      }}
                      className="block text-xs text-orange-600 font-bold hover:underline mt-1 cursor-pointer"
                    >
                      View Live Ticket →
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : activeTab === "map" ? (
        <div className="bg-white rounded-3xl border border-zinc-200 p-6 shadow-xs text-left">
          <EventMap
            vendors={vendors}
            activeVendorId={activeVendorId}
            onSelectVendor={(id) => {
              setActiveVendorId(id);
              setActiveTab("menu");
            }}
            onBackToMenu={() => setActiveTab("menu")}
            mapImageUrl={eventMapUrl}
            estimateWaitTime={estimateVendorWaitTime}
          />
        </div>
      ) : activeTab === "support" ? (
        <div className="bg-white rounded-3xl border border-zinc-200 p-6 shadow-xs text-left max-w-2xl mx-auto">
          <SupportChat type="customer" customerName={customerName} />
        </div>
      ) : (
        /* MAIN FOOD MENU VIEW */
        <div className="space-y-8 text-left">

          {/* VENDOR RECRUITMENT POP-IN BANNER */}
          <div className="bg-gradient-to-r from-zinc-900 via-zinc-900 to-zinc-950 rounded-3xl p-5 sm:p-6 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border border-zinc-800 shadow-xl relative overflow-hidden">
            <div className="absolute right-0 top-0 translate-x-4 -translate-y-4 w-40 h-40 bg-orange-500/10 rounded-full blur-2xl pointer-events-none" />
            
            <div className="flex items-center gap-4 relative z-10">
              <div className="w-12 h-12 rounded-2xl bg-orange-500/20 text-orange-400 border border-orange-500/30 flex items-center justify-center shrink-0 shadow-inner">
                <Store className="w-6 h-6" />
              </div>
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <h4 className="font-display font-black text-base sm:text-lg text-white">
                    Are you a Food Vendor or Restaurant?
                  </h4>
                  <span className="bg-orange-500 text-white text-[9px] font-mono font-black px-2 py-0.5 rounded-full uppercase tracking-wider hidden sm:inline-block">
                    Join Platform
                  </span>
                </div>
                <p className="text-zinc-400 text-xs leading-relaxed max-w-xl">
                  Register your food stall on VenueEat to accept instant Swish mobile orders, automate your kitchen queue, and boost event sales.
                </p>
              </div>
            </div>

            <button
              onClick={() => setShowVendorJoinModal(true)}
              className="w-full sm:w-auto bg-orange-500 hover:bg-orange-600 active:scale-95 text-white font-display font-black text-xs px-5 py-3 rounded-2xl transition-all cursor-pointer flex items-center justify-center gap-2 shadow-md shadow-orange-500/20 shrink-0 border-b-2 border-orange-600 relative z-10"
            >
              <Sparkles className="w-4 h-4" />
              <span>Register Your Stall Now</span>
            </button>
          </div>
          
          {/* VENDOR STALLS SELECTOR CAROUSEL */}
          <div className="space-y-3">
            <h3 className="font-display font-black text-lg text-zinc-900 uppercase tracking-tight font-mono">
              Participating Food Stalls ({vendors.filter(v => v.isApproved === true).length})
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {vendors.filter(v => v.isApproved === true).map(v => {
                const waitInfo = estimateVendorWaitTime(v.id);
                const isSelected = v.id === activeVendorId;
                return (
                  <button
                    key={v.id}
                    onClick={() => setActiveVendorId(v.id)}
                    className={`p-4 rounded-3xl border-2 text-left transition-all cursor-pointer flex flex-col justify-between space-y-3 ${
                      isSelected 
                        ? "bg-zinc-950 border-orange-500 text-white shadow-lg" 
                        : "bg-white border-zinc-200 hover:border-zinc-300 text-zinc-900"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-3xl filter drop-shadow-xs">{v.logo}</span>
                      <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${
                        isSelected ? "bg-orange-500/20 text-orange-400 border border-orange-500/30" : "bg-zinc-100 text-zinc-600"
                      }`}>
                        {v.stallNumber || "Stall"}
                      </span>
                    </div>

                    <div>
                      <h4 className="font-display font-black text-base leading-tight">{v.name}</h4>
                      <p className={`text-xs font-medium mt-0.5 ${isSelected ? "text-zinc-400" : "text-zinc-500"}`}>{v.cuisine}</p>
                    </div>

                    <div className={`pt-2 border-t text-[11px] font-mono flex justify-between items-center ${
                      isSelected ? "border-zinc-800 text-zinc-400" : "border-zinc-150 text-zinc-500"
                    }`}>
                      <span className="flex items-center gap-1 font-bold">
                        <Clock className="w-3.5 h-3.5 text-orange-500" /> {waitInfo.minutes}m wait
                      </span>
                      <span className="font-bold text-emerald-500">
                        {waitInfo.activeCount} orders ahead
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* ACTIVE VENDOR MENU DISPLAY */}
          {activeVendor && (
            <div className="bg-white rounded-3xl border border-zinc-200 p-6 md:p-8 space-y-6 shadow-xs">
              
              {/* Vendor Banner Header */}
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-zinc-150 pb-6">
                <div className="flex items-center gap-4">
                  <div className="text-4xl p-3 bg-orange-50 rounded-2xl border border-orange-200">{activeVendor.logo}</div>
                  <div>
                    <h2 className="font-display font-black text-2xl text-zinc-950">{activeVendor.name}</h2>
                    <p className="text-xs text-zinc-500 font-medium flex items-center gap-2 mt-0.5">
                      <span>{activeVendor.cuisine}</span>
                      <span>•</span>
                      <span className="text-orange-600 font-bold flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5" /> {activeVendor.location}
                      </span>
                    </p>
                  </div>
                </div>

                {/* Search & Category Filter */}
                <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
                  <div className="relative flex-1 md:w-48">
                    <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Search dishes..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full bg-zinc-50 border border-zinc-200 rounded-xl pl-8 pr-3 py-1.5 text-xs text-zinc-900 outline-none focus:border-orange-500"
                    />
                  </div>

                  <div className="flex bg-zinc-100 p-1 rounded-xl text-xs font-bold">
                    {["all", "Food", "Drink", "Snack", "Dessert"].map(cat => (
                      <button
                        key={cat}
                        onClick={() => setSelectedCategory(cat)}
                        className={`px-3 py-1 rounded-lg capitalize transition-all cursor-pointer ${
                          selectedCategory === cat ? "bg-white text-zinc-900 shadow-xs font-black" : "text-zinc-500 hover:text-zinc-900"
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Dish Items Grid */}
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
            </div>
          )}
        </div>
      )}

      {/* CUSTOMIZATION MODAL DIALOG */}
      {customizingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-zinc-200 overflow-hidden flex flex-col max-h-[90vh]">
            
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
        </div>
      )}

      {/* CART DRAWER SLIDE-OVER */}
      {showCartDrawer && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/50 backdrop-blur-xs animate-fadeIn">
          <div className="w-full max-w-md bg-white h-full shadow-2xl p-6 flex flex-col justify-between overflow-y-auto text-left">
            <div className="space-y-6">
              <div className="flex justify-between items-center border-b border-zinc-200 pb-4">
                <div className="flex items-center gap-2">
                  <ShoppingBag className="w-5 h-5 text-orange-500" />
                  <h3 className="font-display font-black text-lg text-zinc-900">Your Cart</h3>
                </div>
                <button onClick={() => setShowCartDrawer(false)} className="text-zinc-400 hover:text-zinc-900 p-1 rounded-lg">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Cart Items List */}
              {cartEntries.length === 0 ? (
                <p className="text-xs text-zinc-500 italic text-center py-12">Your cart is empty. Add delicious street food items above!</p>
              ) : (
                <div className="space-y-3">
                  {cartEntries.map((entry) => {
                    const extrasCost = entry.selectedExtras.reduce((sum, e) => sum + e.price, 0);
                    const unitTotal = entry.menuItem.price + extrasCost;
                    return (
                      <div key={entry.id} className="p-3.5 bg-zinc-50 rounded-2xl border border-zinc-200 flex justify-between items-center gap-3">
                        <div className="space-y-1">
                          <h4 className="font-display font-black text-xs text-zinc-900">{entry.menuItem.name}</h4>
                          {entry.selectedExtras.length > 0 && (
                            <p className="text-[11px] text-orange-700 font-medium">
                              + {entry.selectedExtras.map(e => e.name).join(", ")}
                            </p>
                          )}
                          <span className="font-mono text-xs text-zinc-600 font-bold block">{unitTotal} SEK each</span>
                        </div>
                        <div className="flex items-center gap-2 bg-white border border-zinc-200 rounded-xl p-1 shrink-0">
                          <button onClick={() => handleDecreaseCartEntry(entry.id)} className="p-1 hover:bg-zinc-100 rounded-lg cursor-pointer">
                            <Minus className="w-3 h-3 text-zinc-600" />
                          </button>
                          <span className="font-mono font-black text-xs px-1">{entry.quantity}</span>
                          <button onClick={() => handleIncreaseCartEntry(entry.id)} className="p-1 hover:bg-zinc-100 rounded-lg cursor-pointer">
                            <Plus className="w-3 h-3 text-zinc-600" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Cart Footer */}
            {getCartItemsList().length > 0 && (
              <div className="space-y-4 pt-4 border-t border-zinc-200">
                <div className="space-y-2 font-mono text-xs">
                  <div className="flex justify-between text-zinc-600 font-medium">
                    <span>Subtotal</span>
                    <span>{getCartTotal()} SEK</span>
                  </div>
                  <div className="flex justify-between text-zinc-600 font-medium">
                    <span>Platform Service Fee</span>
                    <span>0 SEK (Free)</span>
                  </div>
                  <div className="flex justify-between text-zinc-950 font-black text-base pt-2 border-t border-zinc-200">
                    <span>Total SEK</span>
                    <span>{getCartTotal()} SEK</span>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setShowCartDrawer(false);
                    setShowSwishFlow(true);
                  }}
                  className="w-full bg-orange-500 hover:bg-orange-600 active:scale-[0.99] text-white font-display font-black text-sm py-3.5 rounded-2xl transition-all shadow-md shadow-orange-500/20 cursor-pointer flex items-center justify-center gap-2"
                >
                  <span>Checkout with Swish</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      )}

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
          setActiveTab("tracker");
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
