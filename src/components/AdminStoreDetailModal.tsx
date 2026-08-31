import React, { useState } from "react";
import { Vendor, Order, MenuItem } from "../types";
import {
  X,
  Store,
  DollarSign,
  TrendingUp,
  ShoppingBag,
  Clock,
  Utensils,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Search,
  Check,
  Star,
  Receipt,
  Layers,
  ArrowRight,
  ShieldCheck,
  ShieldAlert,
  MapPin,
  Mail,
  Phone,
  CreditCard
} from "lucide-react";

interface AdminStoreDetailModalProps {
  vendor: Vendor;
  orders: Order[];
  onClose: () => void;
  onApproveVendor: (vendorId: string) => Promise<void>;
  onSuspendVendor: (vendorId: string) => Promise<void>;
}

export const AdminStoreDetailModal: React.FC<AdminStoreDetailModalProps> = ({
  vendor,
  orders,
  onClose,
  onApproveVendor,
  onSuspendVendor
}) => {
  const [activeTab, setActiveTab] = useState<"earnings" | "menu" | "orders">("earnings");
  const [menuSearch, setMenuSearch] = useState("");
  const [menuFilterCat, setMenuFilterCat] = useState<string>("All");

  // Orders for this specific vendor
  const vendorOrders = orders.filter(
    (o) => o.vendorId === vendor.id || o.vendorName === vendor.name
  );

  const completedOrders = vendorOrders.filter((o) => o.status === "Completed");
  const activeOrders = vendorOrders.filter((o) =>
    ["Placed", "Preparing", "Ready"].includes(o.status)
  );

  const totalGrossRevenue = completedOrders.reduce((acc, o) => acc + (o.totalAmount || 0), 0);
  const pendingRevenue = activeOrders.reduce((acc, o) => acc + (o.totalAmount || 0), 0);
  const totalVolume = vendorOrders.length;
  const averageOrderValue = completedOrders.length > 0
    ? Math.round(totalGrossRevenue / completedOrders.length)
    : 0;

  // Calculate items sold by this vendor
  const itemStats: { [id: string]: { name: string; qty: number; revenue: number; price: number; category: string } } = {};
  vendorOrders.forEach((o) => {
    o.items?.forEach((item) => {
      const id = item.menuItem.id;
      if (!itemStats[id]) {
        itemStats[id] = {
          name: item.menuItem.name,
          qty: 0,
          revenue: 0,
          price: item.menuItem.price,
          category: item.menuItem.category || "Food"
        };
      }
      itemStats[id].qty += item.quantity;
      itemStats[id].revenue += item.quantity * item.menuItem.price;
    });
  });

  const topItems = Object.values(itemStats)
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 6);

  const maxItemRev = topItems.length > 0 ? Math.max(...topItems.map((i) => i.revenue), 1) : 1;

  // Filtered menu
  const filteredMenu = (vendor.menu || []).filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(menuSearch.toLowerCase()) ||
      (item.description && item.description.toLowerCase().includes(menuSearch.toLowerCase()));
    const matchesCat = menuFilterCat === "All" || item.category === menuFilterCat;
    return matchesSearch && matchesCat;
  });

  const isApproved = vendor.isApproved === true;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/75 backdrop-blur-md overflow-y-auto animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden text-left my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* MODAL HEADER */}
        <div className="bg-zinc-950 text-white p-5 sm:p-7 border-b border-zinc-800 shrink-0">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center gap-3.5">
              <span className="text-4xl p-2.5 bg-zinc-900 rounded-2xl border border-zinc-800 shadow-inner shrink-0">
                {vendor.logo || "🍛"}
              </span>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-display font-black text-xl sm:text-2xl tracking-tight text-white">
                    {vendor.name}
                  </h3>
                  <span
                    className={`text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                      isApproved
                        ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                        : "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                    }`}
                  >
                    {isApproved ? "Approved Stall" : "Suspended"}
                  </span>
                </div>

                <p className="text-xs text-zinc-400 font-medium mt-1 flex items-center gap-2 flex-wrap">
                  <span>{vendor.cuisine}</span>
                  <span>•</span>
                  <span>{vendor.stallNumber || "Stall #01"}</span>
                  {vendor.location && (
                    <>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-orange-400" />
                        {vendor.location}
                      </span>
                    </>
                  )}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 self-end sm:self-auto">
              {isApproved ? (
                <button
                  type="button"
                  onClick={() => onSuspendVendor(vendor.id)}
                  className="bg-zinc-900 hover:bg-rose-950/70 hover:text-rose-300 hover:border-rose-800/80 text-zinc-300 border border-zinc-800 text-xs font-bold px-3.5 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
                  <span>Suspend Stall</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => onApproveVendor(vendor.id)}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-3.5 py-2 rounded-xl shadow-md transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Approve Stall</span>
                </button>
              )}

              <button
                type="button"
                onClick={onClose}
                className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer"
                title="Close Store View"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Quick Info Ticker Bar */}
          <div className="mt-4 pt-3 border-t border-zinc-800/80 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono text-zinc-400">
            <div>
              <span className="text-[10px] text-zinc-500 block uppercase">Swish Merchant</span>
              <span className="text-zinc-200 font-bold">{vendor.swishNumber || "123 918 27 36"}</span>
            </div>
            <div>
              <span className="text-[10px] text-zinc-500 block uppercase">Contact Email</span>
              <span className="text-zinc-200 font-bold truncate block">{vendor.email || "vendor@venueeat.se"}</span>
            </div>
            <div>
              <span className="text-[10px] text-zinc-500 block uppercase">Menu Catalog</span>
              <span className="text-zinc-200 font-bold">{vendor.menu?.length || 0} Dishes</span>
            </div>
            <div>
              <span className="text-[10px] text-zinc-500 block uppercase">Satisfaction</span>
              <span className="text-amber-400 font-bold flex items-center gap-1">
                <Star className="w-3 h-3 fill-amber-400 stroke-amber-400" />
                {vendor.rating || 5.0} / 5.0
              </span>
            </div>
          </div>
        </div>

        {/* MODAL TABS NAVIGATION */}
        <div className="flex items-center gap-2 px-6 pt-4 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-950/40 shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab("earnings")}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-t-2xl font-display font-black text-xs transition-all cursor-pointer border-b-2 ${
              activeTab === "earnings"
                ? "border-orange-500 text-orange-600 dark:text-orange-400 bg-white dark:bg-zinc-900 shadow-xs"
                : "border-transparent text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            <span>Store Earnings &amp; Sales</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("menu")}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-t-2xl font-display font-black text-xs transition-all cursor-pointer border-b-2 ${
              activeTab === "menu"
                ? "border-orange-500 text-orange-600 dark:text-orange-400 bg-white dark:bg-zinc-900 shadow-xs"
                : "border-transparent text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
            }`}
          >
            <Utensils className="w-4 h-4" />
            <span>Store Menu ({vendor.menu?.length || 0})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("orders")}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-t-2xl font-display font-black text-xs transition-all cursor-pointer border-b-2 ${
              activeTab === "orders"
                ? "border-orange-500 text-orange-600 dark:text-orange-400 bg-white dark:bg-zinc-900 shadow-xs"
                : "border-transparent text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
            }`}
          >
            <Receipt className="w-4 h-4" />
            <span>Order History ({vendorOrders.length})</span>
          </button>
        </div>

        {/* MODAL BODY CONTENT */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {activeTab === "earnings" ? (
            <div className="space-y-6">
              {/* Top Metrics Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
                <div className="bg-orange-500/10 border border-orange-500/20 rounded-2xl p-4 space-y-1">
                  <div className="flex items-center justify-between text-orange-600 dark:text-orange-400">
                    <span className="text-[10px] font-mono font-bold uppercase">Total Revenue</span>
                    <DollarSign className="w-4 h-4" />
                  </div>
                  <div className="font-mono font-black text-xl sm:text-2xl text-zinc-900 dark:text-white">
                    {totalGrossRevenue.toLocaleString()} <span className="text-xs font-normal">SEK</span>
                  </div>
                  <p className="text-[10px] text-zinc-500 font-medium">Completed Swish/Card sales</p>
                </div>

                <div className="bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 space-y-1">
                  <div className="flex items-center justify-between text-zinc-500">
                    <span className="text-[10px] font-mono font-bold uppercase">Orders Volume</span>
                    <ShoppingBag className="w-4 h-4 text-zinc-400" />
                  </div>
                  <div className="font-mono font-black text-xl sm:text-2xl text-zinc-900 dark:text-white">
                    {totalVolume}
                  </div>
                  <p className="text-[10px] text-zinc-500 font-medium">
                    {completedOrders.length} completed • {activeOrders.length} in queue
                  </p>
                </div>

                <div className="bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 space-y-1">
                  <div className="flex items-center justify-between text-zinc-500">
                    <span className="text-[10px] font-mono font-bold uppercase">Avg Order Value</span>
                    <Receipt className="w-4 h-4 text-zinc-400" />
                  </div>
                  <div className="font-mono font-black text-xl sm:text-2xl text-zinc-900 dark:text-white">
                    {averageOrderValue} <span className="text-xs font-normal">SEK</span>
                  </div>
                  <p className="text-[10px] text-zinc-500 font-medium">Per completed order</p>
                </div>

                <div className="bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 space-y-1">
                  <div className="flex items-center justify-between text-zinc-500">
                    <span className="text-[10px] font-mono font-bold uppercase">Active Queue Value</span>
                    <Clock className="w-4 h-4 text-amber-500" />
                  </div>
                  <div className="font-mono font-black text-xl sm:text-2xl text-zinc-900 dark:text-white">
                    {pendingRevenue.toLocaleString()} <span className="text-xs font-normal">SEK</span>
                  </div>
                  <p className="text-[10px] text-zinc-500 font-medium">{activeOrders.length} pending orders</p>
                </div>
              </div>

              {/* Best Selling Menu Items for this store */}
              <div className="bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-5 md:p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-orange-500" />
                    <h4 className="font-display font-black text-base text-zinc-900 dark:text-white">
                      Top Performing Menu Items (By Revenue)
                    </h4>
                  </div>
                  <span className="text-[10px] font-mono text-zinc-400">
                    {topItems.length} bestsellers
                  </span>
                </div>

                {topItems.length === 0 ? (
                  <p className="text-xs text-zinc-400 italic py-4 text-center">
                    No orders recorded for this stall yet. Once orders are placed, sales distribution will populate here.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {topItems.map((item, idx) => (
                      <div key={idx} className="space-y-1">
                        <div className="flex justify-between items-center text-xs">
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-zinc-400 text-[11px]">#{idx + 1}</span>
                            <span className="font-bold text-zinc-900 dark:text-white">{item.name}</span>
                            <span className="text-[10px] font-mono text-zinc-400 bg-zinc-200/80 dark:bg-zinc-800 px-1.5 py-0.5 rounded">
                              {item.category}
                            </span>
                          </div>
                          <div className="flex items-center gap-3 font-mono">
                            <span className="text-zinc-500 text-[11px]">{item.qty} sold</span>
                            <span className="font-black text-orange-600 dark:text-orange-400">
                              {item.revenue.toLocaleString()} SEK
                            </span>
                          </div>
                        </div>
                        {/* Progress Bar */}
                        <div className="w-full bg-zinc-200 dark:bg-zinc-800 h-2 rounded-full overflow-hidden">
                          <div
                            className="bg-orange-500 h-full rounded-full transition-all duration-500"
                            style={{ width: `${Math.max(8, (item.revenue / maxItemRev) * 100)}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : activeTab === "menu" ? (
            <div className="space-y-5">
              {/* Menu Filter Controls */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
                  {["All", "Food", "Drink", "Snack", "Dessert"].map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setMenuFilterCat(cat)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                        menuFilterCat === cat
                          ? "bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 shadow-xs"
                          : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>

                <div className="relative w-full sm:w-64">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                  <input
                    type="text"
                    placeholder="Search stall dishes..."
                    value={menuSearch}
                    onChange={(e) => setMenuSearch(e.target.value)}
                    className="w-full pl-9 pr-3 py-1.5 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:border-orange-500"
                  />
                </div>
              </div>

              {/* Menu Grid */}
              {filteredMenu.length === 0 ? (
                <div className="bg-zinc-50 dark:bg-zinc-950/60 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-3xl p-8 text-center space-y-2">
                  <Utensils className="w-6 h-6 text-zinc-400 mx-auto" />
                  <h4 className="font-bold text-xs text-zinc-700 dark:text-zinc-300">No menu items found</h4>
                  <p className="text-[11px] text-zinc-400">Try changing the category or search keywords.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                  {filteredMenu.map((item) => (
                    <div
                      key={item.id}
                      className="p-3.5 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 flex gap-3 items-start justify-between"
                    >
                      {item.imageUrl ? (
                        <img
                          src={item.imageUrl}
                          alt={item.name}
                          className="w-16 h-16 rounded-xl object-cover border border-zinc-200 dark:border-zinc-800 shrink-0"
                          referrerPolicy="no-referrer"
                          loading="lazy"
                        />
                      ) : (
                        <div className="w-16 h-16 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-500 shrink-0">
                          <Utensils className="w-6 h-6" />
                        </div>
                      )}

                      <div className="flex-1 min-w-0 space-y-1">
                        <div className="flex items-center justify-between gap-1">
                          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-400 bg-zinc-200/70 dark:bg-zinc-800 px-2 py-0.5 rounded-md">
                            {item.category}
                          </span>

                          <span
                            className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${
                              item.stock
                                ? "bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800"
                                : "bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300 border border-rose-200 dark:border-rose-800"
                            }`}
                          >
                            {item.stock ? "In Stock" : "Sold Out"}
                          </span>
                        </div>

                        <h5 className="font-display font-black text-sm text-zinc-900 dark:text-white truncate">
                          {item.name}
                        </h5>

                        <div className="font-mono text-xs font-black text-orange-600 dark:text-orange-400">
                          {item.price} SEK
                        </div>

                        {item.description && (
                          <p className="text-[11px] text-zinc-500 dark:text-zinc-400 line-clamp-2 leading-relaxed">
                            {item.description}
                          </p>
                        )}

                        {item.extras && item.extras.length > 0 && (
                          <div className="pt-1 flex flex-wrap gap-1">
                            {item.extras.map((extra) => (
                              <span
                                key={extra.id}
                                className="text-[9px] bg-zinc-200/70 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 px-1.5 py-0.5 rounded font-mono"
                              >
                                +{extra.name} ({extra.price} kr)
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            /* ORDER HISTORY TAB */
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-display font-black text-base text-zinc-900 dark:text-white">
                  Recent Orders for {vendor.name}
                </h4>
                <span className="text-xs font-mono text-zinc-400">
                  {vendorOrders.length} total orders
                </span>
              </div>

              {vendorOrders.length === 0 ? (
                <div className="bg-zinc-50 dark:bg-zinc-950/60 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-3xl p-8 text-center space-y-2">
                  <Receipt className="w-6 h-6 text-zinc-400 mx-auto" />
                  <h4 className="font-bold text-xs text-zinc-700 dark:text-zinc-300">No orders recorded</h4>
                  <p className="text-[11px] text-zinc-400">Orders placed by festival attendees will show up here.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {vendorOrders.map((o) => (
                    <div
                      key={o.id}
                      className="p-3.5 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-orange-500/10 text-orange-600 dark:text-orange-400 font-mono font-black text-sm flex items-center justify-center border border-orange-500/20 shrink-0">
                          #{o.queueNumber || 1}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-zinc-900 dark:text-white">
                              {o.customerName || "Festival Guest"}
                            </span>
                            <span className="font-mono text-[10px] text-zinc-400">
                              {o.timestamp || "Just now"}
                            </span>
                          </div>
                          <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                            {o.items?.map((it) => `${it.quantity}x ${it.menuItem.name}`).join(", ")}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 self-end sm:self-auto font-mono">
                        <span
                          className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                            o.status === "Completed"
                              ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                              : o.status === "Ready"
                              ? "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300"
                              : "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300"
                          }`}
                        >
                          {o.status}
                        </span>
                        <span className="font-black text-sm text-zinc-900 dark:text-white">
                          {o.totalAmount} SEK
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* MODAL FOOTER */}
        <div className="p-4 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 flex justify-between items-center text-xs font-mono text-zinc-500 shrink-0">
          <span>Stall ID: {vendor.id}</span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-zinc-900 hover:bg-zinc-800 dark:bg-white dark:hover:bg-zinc-200 text-white dark:text-zinc-900 font-display font-black text-xs rounded-xl transition-all cursor-pointer"
          >
            Close Details
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminStoreDetailModal;
