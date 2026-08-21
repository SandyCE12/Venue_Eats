import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { 
  Store, 
  Utensils, 
  Building2, 
  ShieldCheck, 
  MapPin, 
  LogIn, 
  LogOut, 
  QrCode, 
  X, 
  AlertCircle,
  Ticket,
  Map,
  ShoppingBag,
  MessageSquare
} from "lucide-react";
import { useApp } from "../context/AppContext";

export const Navbar: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { 
    user, 
    handleSignIn, 
    handleSignOut, 
    activeTable, 
    setActiveTable, 
    notification, 
    setNotification,
    eventMapUrl,
    attendeeTab,
    setAttendeeTab,
    setSelectedVendorStallId,
    setOrdersSubTab,
    showCartDrawer,
    setShowCartDrawer,
    cartEntries,
    orders,
    currentOrder,
    managedEvents,
    selectedUserEventId,
    setSelectedUserEventId,
  } = useApp();

  const currentSelectedEvent = managedEvents.find(e => e.id === selectedUserEventId) || managedEvents[0];

  const isActive = (path: string) => {
    if (path === "/" && location.pathname === "/") return true;
    if (path !== "/" && location.pathname.startsWith(path)) return true;
    return false;
  };

  const totalCartQty = cartEntries.reduce((sum, entry) => sum + entry.quantity, 0);
  const isMapUploaded = Boolean(eventMapUrl && eventMapUrl.trim().length > 0);

  return (
    <>
      <header className="bg-white border-b border-zinc-200 sticky top-0 z-40 shadow-xs">
        
        {/* Toast Notification */}
        {notification && (
          <div className="fixed top-20 right-4 md:right-8 z-50 animate-fadeIn max-w-sm w-full px-2 sm:px-0">
            <div className="p-4 rounded-2xl shadow-xl border border-zinc-200 bg-zinc-900 text-white flex items-center justify-between gap-3 text-xs font-medium">
              <div className="flex items-center gap-2">
                <span className="inline-flex h-2 w-2 rounded-full bg-orange-500 animate-ping shrink-0" />
                <span className="line-clamp-2">{notification}</span>
              </div>
              <button 
                onClick={() => setNotification(null)}
                className="text-zinc-400 hover:text-white p-2 rounded-lg transition-colors cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        <div className="max-w-7xl mx-auto px-4 md:px-8 h-16 flex items-center justify-between gap-2 sm:gap-4">
          
          {/* Brand logo & Venue location */}
          <div className="flex items-center gap-2 sm:gap-4">
            <Link to="/" className="flex items-center gap-2 group">
              <div className="bg-orange-500 text-white w-9 h-9 rounded-xl flex items-center justify-center font-display font-black text-sm shadow-sm group-hover:scale-105 transition-transform shrink-0">
                VE
              </div>
              <div className="leading-tight">
                <span className="font-display font-black text-sm sm:text-base text-zinc-900 tracking-tight block">
                  VenueEat
                </span>
                <span className="text-[9px] sm:text-[10px] text-zinc-500 font-bold tracking-wide uppercase flex items-center gap-0.5 font-mono">
                  <MapPin className="w-3 h-3 text-orange-500 shrink-0" /> {currentSelectedEvent ? currentSelectedEvent.location.split(",")[0] : "Kungsträdgården"}
                </span>
              </div>
            </Link>

            {/* Active event badge if selected */}
            {selectedUserEventId && currentSelectedEvent && (
              <button
                onClick={() => {
                  setSelectedUserEventId(null);
                  setSelectedVendorStallId(null);
                  navigate("/");
                }}
                className="hidden lg:flex items-center gap-1.5 bg-zinc-100 hover:bg-zinc-200 border border-zinc-200 text-zinc-800 px-2.5 py-1 rounded-xl text-[11px] font-bold transition-all cursor-pointer"
                title="Click to switch festival or event"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="max-w-[140px] truncate">{currentSelectedEvent.name}</span>
                <span className="text-[9px] text-zinc-400 font-mono underline ml-1">Switch</span>
              </button>
            )}

            {/* Active scanned table badge */}
            {activeTable && (
              <div className="flex items-center gap-1.5 bg-orange-50 border border-orange-200 text-orange-800 px-2.5 py-1 rounded-xl text-[11px] font-mono font-bold">
                <QrCode className="w-3.5 h-3.5 text-orange-600 shrink-0" />
                <span>#{activeTable}</span>
                <button 
                  onClick={() => setActiveTable(null)}
                  className="text-orange-400 hover:text-orange-900 ml-0.5 cursor-pointer p-1"
                  title="Clear scanned table"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            )}
          </div>

          {/* Desktop App Routes Navigation */}
          <nav className="hidden md:flex items-center gap-1 bg-zinc-100 p-1 rounded-2xl border border-zinc-200/80 text-xs font-bold">
            <Link
              to="/"
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl transition-all cursor-pointer min-h-[38px] ${
                isActive("/") 
                  ? "bg-zinc-900 text-white shadow-xs font-black" 
                  : "text-zinc-600 hover:text-zinc-900"
              }`}
            >
              <Utensils className="w-3.5 h-3.5" />
              <span>Attendee App</span>
            </Link>

            <Link
              to="/vendor"
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl transition-all cursor-pointer min-h-[38px] ${
                isActive("/vendor") 
                  ? "bg-zinc-900 text-white shadow-xs font-black" 
                  : "text-zinc-600 hover:text-zinc-900"
              }`}
            >
              <Store className="w-3.5 h-3.5" />
              <span>Vendor Kitchen</span>
            </Link>

            <Link
              to="/admin"
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl transition-all cursor-pointer min-h-[38px] ${
                isActive("/admin") 
                  ? "bg-zinc-900 text-white shadow-xs font-black" 
                  : "text-zinc-600 hover:text-zinc-900"
              }`}
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>Event Admin</span>
            </Link>

            <Link
              to="/super-admin"
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl transition-all cursor-pointer min-h-[38px] ${
                isActive("/super-admin") 
                  ? "bg-zinc-900 text-white shadow-xs font-black" 
                  : "text-zinc-600 hover:text-zinc-900"
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Super Admin</span>
            </Link>
          </nav>

          {/* User Auth Control & Desktop Quick Cart */}
          <div className="flex items-center gap-2">
            {location.pathname === "/" && (
              <button
                onClick={() => setShowCartDrawer(true)}
                className="hidden sm:inline-flex items-center gap-2 bg-zinc-900 hover:bg-zinc-800 text-white px-3.5 py-2 rounded-xl text-xs font-display font-black transition-all cursor-pointer shadow-xs border border-zinc-800"
                title="Open Shopping Cart"
              >
                <ShoppingBag className="w-4 h-4 text-orange-400" />
                <span>Cart</span>
                <span className="bg-orange-500 text-white font-mono text-[10px] font-black px-1.5 py-0.5 rounded-full">
                  {totalCartQty}
                </span>
              </button>
            )}

            {user ? (
              <div className="flex items-center gap-2">
                <img 
                  src={user.photoURL || undefined} 
                  alt={user.displayName || "User"} 
                  referrerPolicy="no-referrer"
                  className="w-8 h-8 rounded-full border border-orange-500 object-cover shrink-0"
                />
                <button
                  onClick={handleSignOut}
                  className="bg-zinc-100 hover:bg-zinc-200 text-zinc-700 font-bold text-xs p-2 rounded-xl transition-all cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center"
                  title="Sign Out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={handleSignIn}
                className="bg-orange-500 hover:bg-orange-600 active:scale-95 text-white font-display font-black text-xs px-3.5 py-2.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 shadow-xs min-h-[44px]"
              >
                <LogIn className="w-4 h-4" /> 
                <span>Sign In</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Modern Bottom Navigation Bar: Menu, Orders, Map (conditional upon uploaded map), Support, and Cart */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-zinc-200 px-2 py-1.5 flex justify-around items-center shadow-lg">
        {/* 1. Menu Button */}
        <button
          onClick={() => {
            if (location.pathname === "/" && attendeeTab === "menu") {
              setSelectedVendorStallId(null);
            } else {
              setAttendeeTab("menu");
              if (location.pathname !== "/") navigate("/");
            }
            setShowCartDrawer(false);
          }}
          className={`flex flex-col items-center justify-center gap-1 px-2.5 py-1.5 rounded-xl transition-all cursor-pointer min-h-[48px] min-w-[56px] ${
            location.pathname === "/" && attendeeTab === "menu" && !showCartDrawer
              ? "text-orange-600 font-black"
              : "text-zinc-500 hover:text-zinc-900 font-medium"
          }`}
        >
          <Utensils className="w-5 h-5" />
          <span className="text-[10px]">Menu</span>
        </button>

        {/* 2. Orders Button */}
        <button
          onClick={() => {
            setAttendeeTab("orders");
            setOrdersSubTab("live");
            setShowCartDrawer(false);
            if (location.pathname !== "/") navigate("/");
          }}
          className={`flex flex-col items-center justify-center gap-1 px-2.5 py-1.5 rounded-xl transition-all cursor-pointer min-h-[48px] min-w-[56px] relative ${
            location.pathname === "/" && attendeeTab === "orders" && !showCartDrawer
              ? "text-orange-600 font-black"
              : "text-zinc-500 hover:text-zinc-900 font-medium"
          }`}
        >
          <div className="relative">
            <Ticket className="w-5 h-5" />
            {currentOrder && currentOrder.status !== "Completed" ? (
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-orange-500 rounded-full animate-ping" />
            ) : orders.length > 0 ? (
              <span className="absolute -top-1 -right-2 text-[9px] font-mono font-bold bg-zinc-900 text-white rounded-full px-1 min-w-[14px] text-center">
                {orders.length}
              </span>
            ) : null}
          </div>
          <span className="text-[10px]">Orders</span>
        </button>

        {/* 3. Map Button - ONLY rendered when event organizer uploads the map */}
        {isMapUploaded && (
          <button
            onClick={() => {
              setAttendeeTab("map");
              setShowCartDrawer(false);
              if (location.pathname !== "/") navigate("/");
            }}
            className={`flex flex-col items-center justify-center gap-1 px-2.5 py-1.5 rounded-xl transition-all cursor-pointer min-h-[48px] min-w-[56px] ${
              location.pathname === "/" && attendeeTab === "map" && !showCartDrawer
                ? "text-orange-600 font-black"
                : "text-zinc-500 hover:text-zinc-900 font-medium"
            }`}
          >
            <Map className="w-5 h-5" />
            <span className="text-[10px]">Map</span>
          </button>
        )}

        {/* 4. Support Button */}
        <button
          onClick={() => {
            setAttendeeTab("support");
            setShowCartDrawer(false);
            if (location.pathname !== "/") navigate("/");
          }}
          className={`flex flex-col items-center justify-center gap-1 px-2.5 py-1.5 rounded-xl transition-all cursor-pointer min-h-[48px] min-w-[56px] ${
            location.pathname === "/" && attendeeTab === "support" && !showCartDrawer
              ? "text-orange-600 font-black"
              : "text-zinc-500 hover:text-zinc-900 font-medium"
          }`}
        >
          <MessageSquare className="w-5 h-5" />
          <span className="text-[10px]">Support</span>
        </button>

        {/* 5. Cart Button */}
        <button
          onClick={() => {
            if (location.pathname !== "/") navigate("/");
            setShowCartDrawer(true);
          }}
          className={`flex flex-col items-center justify-center gap-1 px-2.5 py-1.5 rounded-xl transition-all cursor-pointer min-h-[48px] min-w-[56px] relative ${
            showCartDrawer
              ? "text-orange-600 font-black"
              : "text-zinc-500 hover:text-zinc-900 font-medium"
          }`}
        >
          <div className="relative">
            <ShoppingBag className="w-5 h-5" />
            {totalCartQty > 0 && (
              <span className="absolute -top-1 -right-2 bg-orange-500 text-white text-[9px] font-mono font-black rounded-full px-1.5 py-0.2 min-w-[16px] text-center shadow-xs">
                {totalCartQty}
              </span>
            )}
          </div>
          <span className="text-[10px]">Cart</span>
        </button>
      </nav>
    </>
  );
};

export const Footer: React.FC = () => {
  return (
    <footer className="bg-zinc-950 text-zinc-400 border-t border-zinc-800 py-8 text-xs font-mono text-center mt-auto">
      <div className="max-w-7xl mx-auto px-4 space-y-3">
        <div className="flex flex-wrap items-center justify-center gap-6 text-zinc-300 font-bold">
          <Link to="/" className="hover:text-orange-400 transition-colors">Attendee Menu</Link>
          <span>•</span>
          <Link to="/vendor" className="hover:text-orange-400 transition-colors">Vendor Terminal</Link>
          <span>•</span>
          <Link to="/admin" className="hover:text-orange-400 transition-colors">Event Organizer Admin</Link>
          <span>•</span>
          <Link to="/super-admin" className="hover:text-orange-400 transition-colors">Super Admin Console</Link>
        </div>
        <p className="text-zinc-500 font-semibold uppercase tracking-wider text-[11px]">
          VenueEat Stockholm • Real-time Swish & Stripe Merchant Checkout
        </p>
      </div>
    </footer>
  );
};
