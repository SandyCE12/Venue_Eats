import React, { useState } from "react";
import { useApp } from "../context/AppContext";
import { RealAuthGate } from "../components/RealAuthGate";
import { 
  Building2, 
  Store, 
  TrendingUp, 
  Map, 
  Activity, 
  QrCode, 
  CheckCircle, 
  XCircle, 
  Plus, 
  LogOut,
  Users
} from "lucide-react";
import { AdminSalesCharts } from "../components/AdminSalesCharts";
import EventMap from "../components/EventMap";
import TableQrGenerator from "../components/TableQrGenerator";
import AdminMapManager from "../components/AdminMapManager";
import { Vendor } from "../types";

export const AdminPage: React.FC = () => {
  const {
    vendors,
    orders,
    activityLogs,
    loggedInAdminId,
    setLoggedInAdminId,
    handleApproveVendor,
    handleSuspendVendor,
    handleAddNewVendor,
    estimateVendorWaitTime
  } = useApp();

  const [activeTab, setActiveTab] = useState<"vendors" | "analytics" | "map" | "activity" | "tables">("vendors");
  const [showAddVendorModal, setShowAddVendorModal] = useState(false);

  // New vendor form fields
  const [newVendorName, setNewVendorName] = useState("");
  const [newVendorCuisine, setNewVendorCuisine] = useState("");
  const [newVendorLogo, setNewVendorLogo] = useState("🍛");
  const [newVendorStall, setNewVendorStall] = useState("Stall #05");
  const [newVendorSwish, setNewVendorSwish] = useState("123 999 88 77");

  if (!loggedInAdminId) {
    return (
      <RealAuthGate
        title="Event Organizer Admin Portal"
        description="Sign in with your administrative account to manage festival vendors, view sales analytics, and audit real-time Swish transactions."
        portalRole="admin"
        onSuccess={(id) => setLoggedInAdminId(id)}
      />
    );
  }

  const handleCreateVendor = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newVendorName || !newVendorCuisine) return;

    const newV: Vendor = {
      id: `v_${Date.now()}`,
      isApproved: true,
      name: newVendorName,
      cuisine: newVendorCuisine,
      logo: newVendorLogo || "🍛",
      rating: 5.0,
      location: "Kungsträdgården Square",
      stallNumber: newVendorStall || "Stall #05",
      pin: "9999",
      email: `${newVendorName.toLowerCase().replace(/\s+/g, '')}@venueeat.se`,
      swishNumber: newVendorSwish || "123 999 88 77",
      menu: [
        {
          id: `m_${Date.now()}_1`,
          name: "Signature Street Dish",
          description: "Freshly cooked festival street food classic.",
          price: 120,
          category: "Food",
          stock: true
        }
      ]
    };

    handleAddNewVendor(newV);
    setShowAddVendorModal(false);
    setNewVendorName("");
    setNewVendorCuisine("");
  };

  return (
    <div className="space-y-6 text-left pb-16 animate-fadeIn">
      
      {/* ADMIN HEADER */}
      <div className="bg-zinc-950 text-white rounded-3xl p-6 md:p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-xl border border-zinc-800">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="font-display font-black text-2xl tracking-tight">Namaste Stockholm Festival 2026</h2>
            <span className="bg-orange-500 text-white text-[10px] font-mono font-black px-2.5 py-0.5 rounded-full uppercase">
              Live Event Admin
            </span>
          </div>
          <p className="text-xs text-zinc-400 font-medium mt-1">
            Kungsträdgården, Stockholm • Organizer Account: <span className="text-white font-bold">sandy@creativeventsnordic.com</span>
          </p>
        </div>

        <button
          onClick={() => setLoggedInAdminId(null)}
          className="bg-zinc-900 hover:bg-zinc-800 text-zinc-300 font-bold text-xs px-4 py-2.5 rounded-2xl border border-zinc-800 transition-all cursor-pointer flex items-center gap-1.5"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Sign Out Admin</span>
        </button>
      </div>

      {/* ADMIN TABS NAVIGATION */}
      <div className="flex items-center gap-2 border-b border-zinc-200 pb-4 overflow-x-auto scrollbar-none">
        <button
          onClick={() => setActiveTab("vendors")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl font-display font-black text-xs transition-all cursor-pointer ${
            activeTab === "vendors" ? "bg-orange-500 text-white shadow-md shadow-orange-500/20" : "bg-white text-zinc-600 border border-zinc-200"
          }`}
        >
          <Store className="w-4 h-4" />
          <span>Food Stalls ({vendors.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("analytics")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl font-display font-black text-xs transition-all cursor-pointer ${
            activeTab === "analytics" ? "bg-zinc-900 text-white shadow-md" : "bg-white text-zinc-600 border border-zinc-200"
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          <span>Festival Sales & Charts</span>
        </button>

        <button
          onClick={() => setActiveTab("map")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl font-display font-black text-xs transition-all cursor-pointer ${
            activeTab === "map" ? "bg-zinc-900 text-white shadow-md" : "bg-white text-zinc-600 border border-zinc-200"
          }`}
        >
          <Map className="w-4 h-4" />
          <span>Venue Map</span>
        </button>

        <button
          onClick={() => setActiveTab("activity")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl font-display font-black text-xs transition-all cursor-pointer ${
            activeTab === "activity" ? "bg-zinc-900 text-white shadow-md" : "bg-white text-zinc-600 border border-zinc-200"
          }`}
        >
          <Activity className="w-4 h-4" />
          <span>Audit Stream</span>
        </button>

        <button
          onClick={() => setActiveTab("tables")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl font-display font-black text-xs transition-all cursor-pointer ${
            activeTab === "tables" ? "bg-zinc-900 text-white shadow-md" : "bg-white text-zinc-600 border border-zinc-200"
          }`}
        >
          <QrCode className="w-4 h-4" />
          <span>Table QR Codes</span>
        </button>
      </div>

      {/* RENDER TAB CONTENT */}
      {activeTab === "analytics" ? (
        <AdminSalesCharts orders={orders} vendors={vendors} />
      ) : activeTab === "map" ? (
        <AdminMapManager />
      ) : activeTab === "activity" ? (
        <div className="bg-white rounded-3xl border border-zinc-200 p-6 md:p-8 space-y-4 shadow-xs">
          <h3 className="font-display font-black text-xl text-zinc-900">Real-time Audit & Swish Transaction Log</h3>
          <div className="space-y-2 font-mono text-xs">
            {activityLogs.map(log => (
              <div key={log.id} className="p-3 bg-zinc-50 rounded-2xl border border-zinc-200 flex justify-between items-center gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-zinc-400 font-bold">{log.timestamp}</span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                    log.type === "success" ? "bg-emerald-100 text-emerald-800" :
                    log.type === "warning" ? "bg-amber-100 text-amber-800" : "bg-blue-100 text-blue-800"
                  }`}>{log.category}</span>
                  <span className="text-zinc-800 font-medium">{log.message}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : activeTab === "tables" ? (
        <TableQrGenerator />
      ) : (
        /* VENDORS MANAGEMENT TAB */
        <div className="bg-white rounded-3xl border border-zinc-200 p-6 md:p-8 space-y-6 shadow-xs">
          <div className="flex justify-between items-center border-b border-zinc-150 pb-4">
            <div>
              <h3 className="font-display font-black text-xl text-zinc-900">Participating Vendor Stalls</h3>
              <p className="text-xs text-zinc-500 font-medium">Approve, manage, or onboard new food stalls for the festival.</p>
            </div>
            <button
              onClick={() => setShowAddVendorModal(true)}
              className="bg-orange-500 hover:bg-orange-600 text-white font-display font-black text-xs px-4 py-2.5 rounded-2xl transition-all cursor-pointer flex items-center gap-1.5 shadow-md shadow-orange-500/20"
            >
              <Plus className="w-4 h-4" />
              <span>Onboard New Vendor</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {vendors.map(v => {
              const isApproved = v.isApproved === true;
              return (
                <div key={v.id} className="p-5 rounded-3xl border border-zinc-200 bg-zinc-50 space-y-4 text-left">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3">
                      <span className="text-3xl p-2 bg-white rounded-2xl border border-zinc-200">{v.logo}</span>
                      <div>
                        <h4 className="font-display font-black text-base text-zinc-900 leading-tight">{v.name}</h4>
                        <p className="text-xs text-zinc-500 font-medium">{v.cuisine} • {v.stallNumber}</p>
                      </div>
                    </div>
                    <span className={`text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full ${
                      isApproved ? "bg-emerald-100 text-emerald-800" : "bg-rose-100 text-rose-800"
                    }`}>
                      {isApproved ? "Approved" : "Suspended"}
                    </span>
                  </div>

                  <div className="text-xs font-mono space-y-1 text-zinc-600 border-t border-zinc-200 pt-3">
                    <p>Swish Merchant: <span className="text-zinc-900 font-bold">{v.swishNumber || "123 456 7890"}</span></p>
                    <p>Bank Payout: <span className="text-zinc-900 font-bold">{v.bankName || "SEB Bank"} ({v.clearingNumber ? `${v.clearingNumber}-` : ''}{v.bankAccount || "1234 56 78901"})</span></p>
                    <p>Org.nr / Tax ID: <span className="text-zinc-900 font-bold">{v.orgNumber || "556987-1234"}</span></p>
                    <p>Contact Email: <span className="text-zinc-900 font-bold">{v.email}</span></p>
                  </div>

                  <div className="pt-2 flex gap-2">
                    {isApproved ? (
                      <button
                        onClick={() => handleSuspendVendor(v.id)}
                        className="w-full bg-zinc-200 hover:bg-rose-100 hover:text-rose-800 text-zinc-700 font-bold text-xs py-2 rounded-xl transition-all cursor-pointer"
                      >
                        Suspend Stall
                      </button>
                    ) : (
                      <button
                        onClick={() => handleApproveVendor(v.id)}
                        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-2 rounded-xl transition-all cursor-pointer"
                      >
                        Approve Stall
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ADD VENDOR MODAL */}
      {showAddVendorModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl p-6 md:p-8 max-w-md w-full shadow-2xl space-y-4">
            <h3 className="font-display font-black text-xl text-zinc-900">Onboard New Food Stall</h3>
            <form onSubmit={handleCreateVendor} className="space-y-3 text-xs font-medium">
              <div>
                <label className="font-bold text-zinc-700 block mb-1">Vendor Stall Name</label>
                <input
                  type="text"
                  value={newVendorName}
                  onChange={(e) => setNewVendorName(e.target.value)}
                  placeholder="e.g. Malmö Falafel Supreme"
                  required
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-xl p-2.5 text-xs text-zinc-900 outline-none"
                />
              </div>

              <div>
                <label className="font-bold text-zinc-700 block mb-1">Cuisine / Food Style</label>
                <input
                  type="text"
                  value={newVendorCuisine}
                  onChange={(e) => setNewVendorCuisine(e.target.value)}
                  placeholder="e.g. Middle Eastern Street Eats"
                  required
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-xl p-2.5 text-xs text-zinc-900 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-zinc-700 block mb-1">Logo Emoji</label>
                  <input
                    type="text"
                    value={newVendorLogo}
                    onChange={(e) => setNewVendorLogo(e.target.value)}
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-xl p-2.5 text-xs text-zinc-900 outline-none"
                  />
                </div>
                <div>
                  <label className="font-bold text-zinc-700 block mb-1">Stall Number</label>
                  <input
                    type="text"
                    value={newVendorStall}
                    onChange={(e) => setNewVendorStall(e.target.value)}
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-xl p-2.5 text-xs text-zinc-900 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-zinc-700 block mb-1">Swish Merchant Number</label>
                <input
                  type="text"
                  value={newVendorSwish}
                  onChange={(e) => setNewVendorSwish(e.target.value)}
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-xl p-2.5 text-xs text-zinc-900 outline-none"
                />
              </div>

              <div className="pt-3 flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddVendorModal(false)}
                  className="flex-1 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 font-bold py-2.5 rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-orange-500 hover:bg-orange-600 text-white font-bold py-2.5 rounded-xl cursor-pointer"
                >
                  Confirm & Approve
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
