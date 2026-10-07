import React, { useState } from "react";
import { useApp } from "../context/AppContext";
import { RealAuthGate } from "../components/RealAuthGate";
import { 
  Utensils, 
  TrendingUp, 
  Settings, 
  MessageSquare, 
  LogOut, 
  Bell,
  FileText,
  Eye,
  CheckCircle2,
  Calendar,
  Landmark
} from "lucide-react";
import VendorAnalytics from "../components/VendorAnalytics";
import VendorSettings from "../components/VendorSettings";
import SupportChat from "../components/SupportChat";
import { VendorMenuManager } from "../components/VendorMenuManager";
import { VendorInvoiceModal } from "../components/VendorInvoiceModal";
import { VendorInvoice } from "../types";

export const VendorPage: React.FC = () => {
  const {
    vendors,
    orders,
    loggedInVendorId,
    setLoggedInVendorId,
    updateOrderStatus,
    handleUpdateVendorProfile
  } = useApp();

  const [activeTab, setActiveTab] = useState<"orders" | "menu" | "analytics" | "invoices" | "settings" | "support">("orders");
  const [selectedInvoiceForVendor, setSelectedInvoiceForVendor] = useState<VendorInvoice | null>(null);

  if (!loggedInVendorId) {
    return (
      <RealAuthGate
        title="Vendor Kitchen Terminal"
        description="Sign in with your registered vendor credentials to access your live order queue and menu controls."
        portalRole="vendor"
        onSuccess={(id) => setLoggedInVendorId(id)}
      />
    );
  }

  const selectedVendor = vendors.find(v => v.id === loggedInVendorId) || vendors[0];
  const vendorOrders = orders.filter(o => o.vendorId === selectedVendor?.id);

  return (
    <div className="space-y-6 text-left pb-16 animate-fadeIn">
      
      {/* VENDOR TERMINAL HEADER */}
      <div className="bg-zinc-950 text-white rounded-3xl p-6 md:p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-xl border border-zinc-800">
        <div className="flex items-center gap-4">
          <div className="text-4xl p-3 bg-zinc-900 rounded-2xl border border-zinc-800">{selectedVendor?.logo}</div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-display font-black text-2xl tracking-tight">{selectedVendor?.name}</h2>
              <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-mono font-bold px-2 py-0.5 rounded-full uppercase">
                Active Kitchen Terminal
              </span>
            </div>
            <p className="text-xs text-zinc-400 font-medium mt-1">
              {selectedVendor?.cuisine} • {selectedVendor?.stallNumber} • Swish Merchant #{selectedVendor?.swishNumber}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setLoggedInVendorId(null)}
            className="bg-zinc-900 hover:bg-zinc-800 text-zinc-300 font-bold text-xs px-4 py-2.5 rounded-2xl border border-zinc-800 transition-all cursor-pointer flex items-center gap-1.5"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out Kitchen</span>
          </button>
        </div>
      </div>

      {/* VENDOR TABS NAVIGATION */}
      <div className="flex items-center gap-2 border-b border-zinc-200 pb-4 overflow-x-auto scrollbar-none">
        <button
          onClick={() => setActiveTab("orders")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl font-display font-black text-xs transition-all cursor-pointer ${
            activeTab === "orders" ? "bg-orange-500 text-white shadow-md shadow-orange-500/20" : "bg-white text-zinc-600 border border-zinc-200"
          }`}
        >
          <Bell className="w-4 h-4" />
          <span>Active Orders ({vendorOrders.filter(o => o.status !== "Completed").length})</span>
        </button>

        <button
          onClick={() => setActiveTab("menu")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl font-display font-black text-xs transition-all cursor-pointer ${
            activeTab === "menu" ? "bg-zinc-900 text-white shadow-md" : "bg-white text-zinc-600 border border-zinc-200"
          }`}
        >
          <Utensils className="w-4 h-4" />
          <span>Menu & Pricing</span>
        </button>

        <button
          onClick={() => setActiveTab("analytics")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl font-display font-black text-xs transition-all cursor-pointer ${
            activeTab === "analytics" ? "bg-zinc-900 text-white shadow-md" : "bg-white text-zinc-600 border border-zinc-200"
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          <span>Sales & Payouts</span>
        </button>

        <button
          onClick={() => setActiveTab("invoices")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl font-display font-black text-xs transition-all cursor-pointer ${
            activeTab === "invoices" ? "bg-zinc-900 text-white shadow-md" : "bg-white text-zinc-600 border border-zinc-200"
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Invoices &amp; Receipts ({selectedVendor.invoices?.length || 0})</span>
        </button>

        <button
          onClick={() => setActiveTab("settings")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl font-display font-black text-xs transition-all cursor-pointer ${
            activeTab === "settings" ? "bg-zinc-900 text-white shadow-md" : "bg-white text-zinc-600 border border-zinc-200"
          }`}
        >
          <Settings className="w-4 h-4" />
          <span>Stall Settings</span>
        </button>

        <button
          onClick={() => setActiveTab("support")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl font-display font-black text-xs transition-all cursor-pointer ${
            activeTab === "support" ? "bg-zinc-900 text-white shadow-md" : "bg-white text-zinc-600 border border-zinc-200"
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          <span>Support</span>
        </button>
      </div>

      {/* RENDER TAB CONTENT */}
      {activeTab === "analytics" ? (
        <VendorAnalytics vendor={selectedVendor} orders={vendorOrders} />
      ) : activeTab === "invoices" ? (
        <div className="bg-white rounded-3xl border border-zinc-200 p-6 md:p-8 space-y-6 shadow-xs animate-fadeIn">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-zinc-100 pb-4">
            <div>
              <h3 className="font-display font-black text-xl text-zinc-900 flex items-center gap-2">
                <FileText className="w-5 h-5 text-orange-500" />
                <span>Settlement Receipts &amp; Invoices</span>
              </h3>
              <p className="text-xs text-zinc-500 mt-0.5">
                Official revenue settlements, payout specifications, and event invoices issued by the festival organizer.
              </p>
            </div>
          </div>

          {(!selectedVendor.invoices || selectedVendor.invoices.length === 0) ? (
            <div className="bg-zinc-50 border border-dashed border-zinc-200 rounded-3xl p-10 text-center space-y-2">
              <FileText className="w-8 h-8 text-zinc-400 mx-auto" />
              <h4 className="font-bold text-sm text-zinc-800">No invoices or receipts yet</h4>
              <p className="text-xs text-zinc-500 max-w-sm mx-auto">
                Once the festival organizer runs daily settlement or issues booth invoices, your official documents will be available here.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {selectedVendor.invoices.map((inv) => (
                <div
                  key={inv.id}
                  className="bg-zinc-50 border border-zinc-200 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                >
                  <div className="flex items-start gap-3">
                    <div className={`p-2.5 rounded-xl border shrink-0 ${
                      inv.type === "receipt"
                        ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                        : "bg-sky-500/10 text-sky-600 border-sky-500/20"
                    }`}>
                      <FileText className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-display font-black text-sm text-zinc-900">
                          {inv.title}
                        </span>
                        <span className="font-mono text-[10px] text-zinc-400">
                          #{inv.invoiceNumber}
                        </span>
                      </div>
                      <p className="text-[11px] text-zinc-500 mt-0.5">
                        Issued: {inv.issueDate} • Event: {inv.eventName}
                      </p>
                      {inv.notes && (
                        <p className="text-[10px] text-zinc-500 italic mt-0.5 line-clamp-1">
                          "{inv.notes}"
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3 self-end sm:self-auto">
                    <div className="text-right font-mono">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full inline-block ${
                        inv.status === "Settled"
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-sky-100 text-sky-800"
                      }`}>
                        {inv.status}
                      </span>
                      <span className="block font-black text-sm text-zinc-900 mt-0.5">
                        {inv.netPayoutAmount.toLocaleString()} SEK
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => setSelectedInvoiceForVendor(inv)}
                      className="bg-zinc-900 hover:bg-zinc-800 text-white px-3.5 py-2 rounded-xl font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-xs"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>View &amp; Print</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : activeTab === "settings" ? (
        <VendorSettings vendor={selectedVendor} onUpdateVendorProfile={handleUpdateVendorProfile} />
      ) : activeTab === "support" ? (
        <div className="bg-white rounded-3xl border border-zinc-200 p-6 max-w-2xl mx-auto shadow-xs">
          <SupportChat type="vendor" vendorName={selectedVendor.name} />
        </div>
      ) : activeTab === "menu" ? (
        <VendorMenuManager vendor={selectedVendor} onUpdateVendor={handleUpdateVendorProfile} />
      ) : (
        /* ORDERS QUEUE TAB */
        <div className="bg-white rounded-3xl border border-zinc-200 p-6 md:p-8 space-y-6 shadow-xs">
          <h3 className="font-display font-black text-xl text-zinc-900">Live Kitchen Order Queue</h3>

          {vendorOrders.length === 0 ? (
            <p className="text-sm text-zinc-500 italic py-12 text-center">No active kitchen orders right now. New customer orders will appear automatically!</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {vendorOrders.map(o => (
                <div key={o.id} className="bg-zinc-950 text-white p-5 rounded-3xl border border-zinc-800 space-y-4 shadow-lg">
                  <div className="flex justify-between items-center border-b border-zinc-800 pb-3">
                    <span className="font-mono font-black text-orange-400 text-lg">#AQ-{o.queueNumber}</span>
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-full uppercase ${
                      o.status === "Placed" ? "bg-amber-500/20 text-amber-300 border border-amber-500/30" :
                      o.status === "Preparing" ? "bg-blue-500/20 text-blue-300 border border-blue-500/30" :
                      o.status === "Ready" ? "bg-orange-500/20 text-orange-300 border border-orange-500/30 animate-pulse" :
                      "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                    }`}>
                      {o.status}
                    </span>
                  </div>

                  <div className="space-y-2 text-xs font-mono">
                    <p className="text-zinc-400 font-sans font-bold">Customer: <span className="text-white">{o.customerName}</span></p>
                    <div className="space-y-1 border-t border-zinc-800 pt-2">
                      {o.items.map((it, idx) => (
                        <div key={idx} className="flex justify-between text-zinc-300">
                          <span>{it.menuItem.name} x{it.quantity}</span>
                          <span className="text-white font-black">{it.menuItem.price * it.quantity} kr</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="border-t border-zinc-800 pt-3 flex justify-between items-center text-xs">
                    <span className="font-mono text-zinc-400 font-bold">Total SEK</span>
                    <span className="font-mono font-black text-emerald-400 text-base">{o.totalAmount} SEK</span>
                  </div>

                  {/* Status Progression Action Buttons */}
                  <div className="pt-2 flex gap-2">
                    {o.status === "Placed" && (
                      <button
                        onClick={() => updateOrderStatus(o.id, "Preparing")}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-mono font-black text-xs py-2.5 rounded-xl transition-all cursor-pointer"
                      >
                        Accept & Start Preparing
                      </button>
                    )}
                    {o.status === "Preparing" && (
                      <button
                        onClick={() => updateOrderStatus(o.id, "Ready")}
                        className="w-full bg-orange-500 hover:bg-orange-600 text-white font-mono font-black text-xs py-2.5 rounded-xl transition-all cursor-pointer"
                      >
                        Mark Ready for Pickup
                      </button>
                    )}
                    {o.status === "Ready" && (
                      <button
                        onClick={() => updateOrderStatus(o.id, "Completed")}
                        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-mono font-black text-xs py-2.5 rounded-xl transition-all cursor-pointer"
                      >
                        Mark Order Completed
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* VENDOR INVOICE & RECEIPT MODAL */}
      {selectedInvoiceForVendor && (
        <VendorInvoiceModal
          invoice={selectedInvoiceForVendor}
          onClose={() => setSelectedInvoiceForVendor(null)}
        />
      )}
    </div>
  );
};
