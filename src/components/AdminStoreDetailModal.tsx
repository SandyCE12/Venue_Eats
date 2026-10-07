import React, { useState, useEffect } from "react";
import { Vendor, Order, MenuItem, VendorInvoice, ManagedEvent } from "../types";
import { VendorInvoiceModal } from "./VendorInvoiceModal";
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
  CreditCard,
  Landmark,
  Edit3,
  Save,
  Send,
  FileText,
  PlusCircle,
  Eye,
  Printer
} from "lucide-react";

interface AdminStoreDetailModalProps {
  vendor: Vendor;
  orders: Order[];
  onClose: () => void;
  onApproveVendor: (vendorId: string) => Promise<void>;
  onSuspendVendor: (vendorId: string) => Promise<void>;
  onUpdateVendorProfile?: (vendorId: string, updatedFields: Partial<Vendor>) => Promise<void>;
  eventName?: string;
  currentEvent?: ManagedEvent;
}

const SWEDISH_BANKS = [
  "SEB (Skandinaviska Enskilda Banken)",
  "Swedbank",
  "Handelsbanken",
  "Nordea",
  "Länsförsäkringar Bank",
  "Danske Bank",
  "ICA Banken",
  "SBAB",
  "Other / Annan bank"
];

export const AdminStoreDetailModal: React.FC<AdminStoreDetailModalProps> = ({
  vendor,
  orders,
  onClose,
  onApproveVendor,
  onSuspendVendor,
  onUpdateVendorProfile,
  eventName = "Stockholm Festival",
  currentEvent
}) => {
  const [activeTab, setActiveTab] = useState<"earnings" | "menu" | "orders" | "invoices">("earnings");
  const [menuSearch, setMenuSearch] = useState("");
  const [menuFilterCat, setMenuFilterCat] = useState<string>("All");

  // Admin Bank & Swish editing state
  const [isEditingBank, setIsEditingBank] = useState(false);
  const [editSwishNumber, setEditSwishNumber] = useState(vendor.swishNumber || "123 918 27 36");
  const [editBankName, setEditBankName] = useState(vendor.bankName || "SEB (Skandinaviska Enskilda Banken)");
  const [editClearing, setEditClearing] = useState(vendor.bankClearingNumber || "");
  const [editAccount, setEditAccount] = useState(vendor.bankAccountNumber || "");
  const [editHolder, setEditHolder] = useState(vendor.bankAccountHolder || vendor.name);
  const [editBankGiro, setEditBankGiro] = useState(vendor.bankGiro || "");
  const [editPlusGiro, setEditPlusGiro] = useState(vendor.plusGiro || "");
  const [editIban, setEditIban] = useState(vendor.bankIban || "");
  const [editBic, setEditBic] = useState(vendor.bankBicSwift || "");
  const [isSavingBank, setIsSavingBank] = useState(false);
  const [bankSaveSuccess, setBankSaveSuccess] = useState(false);

  // Invoice / Receipt state
  const [showInvoiceGenerator, setShowInvoiceGenerator] = useState(false);
  const [generatorType, setGeneratorType] = useState<"receipt" | "invoice">("receipt");
  const [selectedInvoiceToView, setSelectedInvoiceToView] = useState<VendorInvoice | null>(null);

  const [invTitle, setInvTitle] = useState("");
  const [invNumber, setInvNumber] = useState("");
  const [invGross, setInvGross] = useState<number>(0);
  const [invCommission, setInvCommission] = useState<number>(0);
  const [invNet, setInvNet] = useState<number>(0);
  const [invEmail, setInvEmail] = useState("");
  const [invNotes, setInvNotes] = useState("");
  const [isSendingInvoice, setIsSendingInvoice] = useState(false);
  const [invoiceSentSuccess, setInvoiceSentSuccess] = useState(false);

  // Sync state if vendor changes
  useEffect(() => {
    setEditSwishNumber(vendor.swishNumber || "123 918 27 36");
    setEditBankName(vendor.bankName || "SEB (Skandinaviska Enskilda Banken)");
    setEditClearing(vendor.bankClearingNumber || "");
    setEditAccount(vendor.bankAccountNumber || "");
    setEditHolder(vendor.bankAccountHolder || vendor.name);
    setEditBankGiro(vendor.bankGiro || "");
    setEditPlusGiro(vendor.plusGiro || "");
    setEditIban(vendor.bankIban || "");
    setEditBic(vendor.bankBicSwift || "");
  }, [vendor]);

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

  const handleSaveBankDetails = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!onUpdateVendorProfile) return;
    setIsSavingBank(true);
    try {
      await onUpdateVendorProfile(vendor.id, {
        swishNumber: editSwishNumber.trim(),
        bankName: editBankName.trim(),
        bankClearingNumber: editClearing.trim(),
        bankAccountNumber: editAccount.trim(),
        bankAccountHolder: editHolder.trim(),
        bankGiro: editBankGiro.trim(),
        plusGiro: editPlusGiro.trim(),
        bankIban: editIban.trim(),
        bankBicSwift: editBic.trim(),
      });
      setIsEditingBank(false);
      setBankSaveSuccess(true);
      setTimeout(() => setBankSaveSuccess(false), 3500);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSavingBank(false);
    }
  };

  const handleOpenGenerator = (type: "receipt" | "invoice") => {
    setGeneratorType(type);
    const yr = new Date().getFullYear();
    const prefix = type === "receipt" ? "REC" : "INV";
    const ref = `${prefix}-${yr}-${vendor.id.slice(-4).toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`;
    setInvNumber(ref);
    setInvEmail(vendor.email || "vendor@venueeat.se");
    if (type === "receipt") {
      setInvTitle(`Avräkningsnota - ${eventName}`);
      const gross = totalGrossRevenue || 14850;
      const comm = Math.round(gross * 0.035 * 100) / 100;
      const net = Math.round((gross - comm) * 100) / 100;
      setInvGross(gross);
      setInvCommission(comm);
      setInvNet(net);
      setInvNotes(`Slutavräkning för digital matförsäljning via VenueEat under ${eventName}. Utbetalning dirigerad till ${vendor.bankName || "SEB Bank"} (Konto: ${vendor.bankAccountNumber || "Direktavräkning"}).`);
    } else {
      setInvTitle(`Platsavgift & Faktura - ${eventName}`);
      const fee = 2500;
      setInvGross(fee);
      setInvCommission(0);
      setInvNet(fee);
      setInvNotes(`Platsavgift för matstånd/truck vid ${eventName}. Betalningsvillkor 14 dagar till festivalens bankgiro.`);
    }
    setShowInvoiceGenerator(true);
  };

  const handleSendInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!onUpdateVendorProfile) return;
    setIsSendingInvoice(true);
    try {
      const newInvoice: VendorInvoice = {
        id: `inv_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        type: generatorType,
        title: invTitle.trim(),
        invoiceNumber: invNumber.trim(),
        issueDate: new Date().toLocaleDateString("sv-SE"),
        dueDate: generatorType === "invoice" ? new Date(Date.now() + 14 * 86400000).toLocaleDateString("sv-SE") : undefined,
        vendorId: vendor.id,
        vendorName: vendor.name,
        vendorEmail: invEmail.trim(),
        eventName: eventName,
        grossAmount: invGross,
        commissionAmount: invCommission,
        netPayoutAmount: invNet,
        ordersCount: completedOrders.length,
        status: generatorType === "receipt" ? "Settled" : "Sent",
        bankDetails: {
          bankName: vendor.bankName,
          accountNumber: vendor.bankAccountNumber,
          clearingNumber: vendor.bankClearingNumber,
          swishNumber: vendor.swishNumber,
          bankGiro: vendor.bankGiro,
          accountHolder: vendor.bankAccountHolder
        },
        issuerBankDetails: {
          bankName: currentEvent?.bankName || "SEB (Skandinaviska Enskilda Banken)",
          accountNumber: currentEvent?.bankAccountNumber || "12 345 678",
          clearingNumber: currentEvent?.bankClearingNumber || "5201",
          swishNumber: currentEvent?.swishMerchantId || currentEvent?.swishNumber || "123 918 27 36",
          bankGiro: currentEvent?.bankGiro || "5123-4567",
          plusGiro: currentEvent?.plusGiro || "61 23 45-8",
          accountHolder: currentEvent?.bankAccountHolder || currentEvent?.adminName || "Creative Events Nordic AB",
          orgNumber: currentEvent?.orgNumber || "559123-4567",
          iban: currentEvent?.bankIban,
          bicSwift: currentEvent?.bankBicSwift
        },
        notes: invNotes.trim(),
        sentAt: Date.now()
      };

      const existingInvoices = vendor.invoices || [];
      const updatedInvoices = [newInvoice, ...existingInvoices];
      await onUpdateVendorProfile(vendor.id, {
        invoices: updatedInvoices
      });

      setShowInvoiceGenerator(false);
      setInvoiceSentSuccess(true);
      setTimeout(() => setInvoiceSentSuccess(false), 4000);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSendingInvoice(false);
    }
  };

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

          <button
            type="button"
            onClick={() => setActiveTab("invoices")}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-t-2xl font-display font-black text-xs transition-all cursor-pointer border-b-2 ${
              activeTab === "invoices"
                ? "border-orange-500 text-orange-600 dark:text-orange-400 bg-white dark:bg-zinc-900 shadow-xs"
                : "border-transparent text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Invoices &amp; Receipts ({vendor.invoices?.length || 0})</span>
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

              {/* Vendor Bank Settlement & Payout Details */}
              <div className="bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-5 md:p-6 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <Landmark className="w-4 h-4 text-sky-500" />
                    <div>
                      <h4 className="font-display font-black text-base text-zinc-900 dark:text-white">
                        Payout &amp; Bank Settlement Account
                      </h4>
                      <p className="text-[10px] text-zinc-500 font-medium">
                        Configured for daily festival wire settlements, Swish routing &amp; receipts
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {bankSaveSuccess && (
                      <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1 animate-fadeIn">
                        <Check className="w-3.5 h-3.5" /> Saved to Firestore!
                      </span>
                    )}

                    {!isEditingBank ? (
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleOpenGenerator("receipt")}
                          className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
                        >
                          <Send className="w-3 h-3" />
                          <span>Send Settlement</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setIsEditingBank(true)}
                          className="bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 text-xs font-bold px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
                        >
                          <Edit3 className="w-3 h-3 text-sky-500" />
                          <span>Edit Payout Details</span>
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setIsEditingBank(false)}
                        className="text-xs text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 font-bold px-2 py-1"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </div>

                {!isEditingBank ? (
                  <div className="space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs pt-1">
                      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-3 space-y-0.5">
                        <span className="text-[9px] font-mono text-zinc-400 uppercase block">Bank Name</span>
                        <span className="font-bold text-zinc-900 dark:text-white block truncate">
                          {vendor.bankName || "SEB (Skandinaviska Enskilda Banken)"}
                        </span>
                      </div>

                      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-3 space-y-0.5">
                        <span className="text-[9px] font-mono text-zinc-400 uppercase block">Clearing / Account #</span>
                        <span className="font-mono font-bold text-zinc-900 dark:text-white block">
                          {vendor.bankClearingNumber ? `${vendor.bankClearingNumber} - ` : ""}{vendor.bankAccountNumber || "Pending entry"}
                        </span>
                      </div>

                      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-3 space-y-0.5">
                        <span className="text-[9px] font-mono text-zinc-400 uppercase block">Account Holder</span>
                        <span className="font-bold text-zinc-900 dark:text-white block truncate">
                          {vendor.bankAccountHolder || vendor.name}
                        </span>
                      </div>

                      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-3 space-y-0.5">
                        <span className="text-[9px] font-mono text-zinc-400 uppercase block">Swish / Bankgiro</span>
                        <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400 block truncate">
                          {vendor.swishNumber || vendor.bankGiro || "123 918 27 36"}
                        </span>
                      </div>
                    </div>

                    {(vendor.bankIban || vendor.bankBicSwift || vendor.bankGiro || vendor.plusGiro) && (
                      <div className="flex flex-wrap items-center gap-4 text-[10px] font-mono text-zinc-500 pt-1 border-t border-zinc-200 dark:border-zinc-800">
                        {vendor.bankGiro && <span>Bankgiro: <strong className="text-zinc-700 dark:text-zinc-300">{vendor.bankGiro}</strong></span>}
                        {vendor.plusGiro && <span>Plusgiro: <strong className="text-zinc-700 dark:text-zinc-300">{vendor.plusGiro}</strong></span>}
                        {vendor.bankIban && <span>IBAN: <strong className="text-zinc-700 dark:text-zinc-300">{vendor.bankIban}</strong></span>}
                        {vendor.bankBicSwift && <span>BIC/SWIFT: <strong className="text-zinc-700 dark:text-zinc-300">{vendor.bankBicSwift}</strong></span>}
                      </div>
                    )}
                  </div>
                ) : (
                  /* Admin Bank & Swish Editing Form */
                  <form onSubmit={handleSaveBankDetails} className="space-y-4 pt-1 animate-fadeIn">
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs">
                      <div className="space-y-1">
                        <label className="text-[10px] font-mono font-bold uppercase text-zinc-500">
                          Swish Merchant #
                        </label>
                        <input
                          type="text"
                          value={editSwishNumber}
                          onChange={(e) => setEditSwishNumber(e.target.value)}
                          placeholder="e.g. 123 918 27 36"
                          className="w-full px-3 py-2 bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-xl font-mono text-xs font-bold text-zinc-900 dark:text-white focus:outline-none focus:border-sky-500"
                          required
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-mono font-bold uppercase text-zinc-500">
                          Bank Name
                        </label>
                        <select
                          value={editBankName}
                          onChange={(e) => setEditBankName(e.target.value)}
                          className="w-full px-3 py-2 bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-xl text-xs font-bold text-zinc-900 dark:text-white focus:outline-none focus:border-sky-500 cursor-pointer"
                        >
                          {SWEDISH_BANKS.map((b) => (
                            <option key={b} value={b}>{b}</option>
                          ))}
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-mono font-bold uppercase text-zinc-500">
                          Account Holder Name
                        </label>
                        <input
                          type="text"
                          value={editHolder}
                          onChange={(e) => setEditHolder(e.target.value)}
                          placeholder="e.g. Delhi Street Sensation AB"
                          className="w-full px-3 py-2 bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-xl text-xs font-bold text-zinc-900 dark:text-white focus:outline-none focus:border-sky-500"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-mono font-bold uppercase text-zinc-500">
                          Clearing # (4-5 digits)
                        </label>
                        <input
                          type="text"
                          value={editClearing}
                          onChange={(e) => setEditClearing(e.target.value)}
                          placeholder="e.g. 5051"
                          className="w-full px-3 py-2 bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-xl font-mono text-xs font-bold text-zinc-900 dark:text-white focus:outline-none focus:border-sky-500"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-mono font-bold uppercase text-zinc-500">
                          Account Number
                        </label>
                        <input
                          type="text"
                          value={editAccount}
                          onChange={(e) => setEditAccount(e.target.value)}
                          placeholder="e.g. 123 456 789-0"
                          className="w-full px-3 py-2 bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-xl font-mono text-xs font-bold text-zinc-900 dark:text-white focus:outline-none focus:border-sky-500"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-mono font-bold uppercase text-zinc-500">
                          Bankgiro / Plusgiro
                        </label>
                        <input
                          type="text"
                          value={editBankGiro}
                          onChange={(e) => setEditBankGiro(e.target.value)}
                          placeholder="e.g. 5051-6999"
                          className="w-full px-3 py-2 bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-xl font-mono text-xs font-bold text-zinc-900 dark:text-white focus:outline-none focus:border-sky-500"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-mono font-bold uppercase text-zinc-500">
                          IBAN (International)
                        </label>
                        <input
                          type="text"
                          value={editIban}
                          onChange={(e) => setEditIban(e.target.value)}
                          placeholder="SE45 5000 0000 0505 1699 9000"
                          className="w-full px-3 py-2 bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-xl font-mono text-xs text-zinc-900 dark:text-white focus:outline-none focus:border-sky-500"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-mono font-bold uppercase text-zinc-500">
                          BIC / SWIFT
                        </label>
                        <input
                          type="text"
                          value={editBic}
                          onChange={(e) => setEditBic(e.target.value.toUpperCase())}
                          placeholder="ESSEESSX"
                          className="w-full px-3 py-2 bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-xl font-mono text-xs text-zinc-900 dark:text-white focus:outline-none focus:border-sky-500"
                        />
                      </div>
                    </div>

                    <div className="flex justify-end gap-2 pt-2 border-t border-zinc-200 dark:border-zinc-800">
                      <button
                        type="button"
                        onClick={() => setIsEditingBank(false)}
                        className="px-4 py-2 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 rounded-xl font-bold text-xs cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={isSavingBank}
                        className="px-5 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-xl font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-md disabled:opacity-50"
                      >
                        <Save className="w-3.5 h-3.5" />
                        <span>{isSavingBank ? "Saving..." : "Save Bank & Swish Details"}</span>
                      </button>
                    </div>
                  </form>
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
          ) : activeTab === "orders" ? (
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
          ) : (
            /* INVOICES & SETTLEMENT RECEIPTS TAB */
            <div className="space-y-6 animate-fadeIn">
              {/* Header Actions */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-zinc-50 dark:bg-zinc-950 p-5 rounded-3xl border border-zinc-200 dark:border-zinc-800">
                <div>
                  <h4 className="font-display font-black text-base text-zinc-900 dark:text-white flex items-center gap-2">
                    <FileText className="w-5 h-5 text-orange-500" />
                    <span>Vendor Invoices &amp; Settlement Receipts</span>
                  </h4>
                  <p className="text-xs text-zinc-500 mt-1">
                    Send official Skatteverket-compliant revenue settlements and booth rental invoices directly to {vendor.name}.
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => handleOpenGenerator("receipt")}
                    className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-3.5 py-2.5 rounded-2xl transition-all shadow-md flex items-center gap-1.5 cursor-pointer"
                  >
                    <Send className="w-4 h-4" />
                    <span>Send Settlement Receipt</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleOpenGenerator("invoice")}
                    className="bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:hover:bg-white text-white dark:text-zinc-900 font-bold text-xs px-3.5 py-2.5 rounded-2xl transition-all shadow-md flex items-center gap-1.5 cursor-pointer"
                  >
                    <PlusCircle className="w-4 h-4" />
                    <span>Send Stall Fee Invoice</span>
                  </button>
                </div>
              </div>

              {invoiceSentSuccess && (
                <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-2xl text-xs font-bold flex items-center gap-2 animate-fadeIn">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Document successfully issued, sent to {vendor.email}, and synced to vendor portal!</span>
                </div>
              )}

              {/* Invoices List */}
              {(!vendor.invoices || vendor.invoices.length === 0) ? (
                <div className="bg-zinc-50 dark:bg-zinc-950/60 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-3xl p-10 text-center space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-orange-500/10 text-orange-500 flex items-center justify-center mx-auto">
                    <FileText className="w-6 h-6" />
                  </div>
                  <div>
                    <h5 className="font-bold text-sm text-zinc-800 dark:text-zinc-200">No invoices or receipts issued yet</h5>
                    <p className="text-xs text-zinc-500 max-w-md mx-auto mt-1">
                      Click "Send Settlement Receipt" above to calculate total food sales ({totalGrossRevenue.toLocaleString()} SEK) and issue an official payout slip with bank routing details.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  {vendor.invoices.map((inv) => (
                    <div
                      key={inv.id}
                      className="bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                    >
                      <div className="flex items-start gap-3.5">
                        <div className={`p-2.5 rounded-xl border shrink-0 ${
                          inv.type === "receipt"
                            ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                            : "bg-sky-500/10 text-sky-500 border-sky-500/20"
                        }`}>
                          <FileText className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-display font-black text-sm text-zinc-900 dark:text-white">
                              {inv.title}
                            </span>
                            <span className="font-mono text-[10px] text-zinc-400">
                              #{inv.invoiceNumber}
                            </span>
                          </div>
                          <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5">
                            Issued: {inv.issueDate} • Sent to: {inv.vendorEmail}
                          </p>
                          {inv.notes && (
                            <p className="text-[10px] text-zinc-400 italic mt-0.5 line-clamp-1">
                              "{inv.notes}"
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-3 self-end sm:self-auto">
                        <div className="text-right font-mono">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full inline-block ${
                            inv.status === "Settled"
                              ? "bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300"
                              : "bg-sky-100 dark:bg-sky-950 text-sky-800 dark:text-sky-300"
                          }`}>
                            {inv.status}
                          </span>
                          <span className="block font-black text-sm text-zinc-900 dark:text-white mt-0.5">
                            {inv.netPayoutAmount.toLocaleString()} SEK
                          </span>
                        </div>

                        <button
                          type="button"
                          onClick={() => setSelectedInvoiceToView(inv)}
                          className="bg-white dark:bg-zinc-900 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-900 dark:text-zinc-100 border border-zinc-200 dark:border-zinc-800 px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-2xs"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>View / Print</span>
                        </button>
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

        {/* Invoice / Settlement Generator Modal */}
        {showInvoiceGenerator && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
            <div className="bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white rounded-3xl max-w-xl w-full border border-zinc-200 dark:border-zinc-800 shadow-2xl overflow-hidden my-auto p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-3">
                <div className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-orange-500" />
                  <h4 className="font-display font-black text-base">
                    {generatorType === "receipt" ? "Issue Revenue Settlement Receipt" : "Issue Stall Fee Invoice"}
                  </h4>
                </div>
                <button
                  type="button"
                  onClick={() => setShowInvoiceGenerator(false)}
                  className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSendInvoice} className="space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-mono font-bold uppercase text-zinc-500">Document Number</label>
                    <input
                      type="text"
                      value={invNumber}
                      onChange={(e) => setInvNumber(e.target.value)}
                      className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl font-mono font-bold"
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-mono font-bold uppercase text-zinc-500">Recipient Email</label>
                    <input
                      type="email"
                      value={invEmail}
                      onChange={(e) => setInvEmail(e.target.value)}
                      className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl font-bold"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-mono font-bold uppercase text-zinc-500">Document Title</label>
                  <input
                    type="text"
                    value={invTitle}
                    onChange={(e) => setInvTitle(e.target.value)}
                    className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl font-bold"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase text-zinc-500">Gross Sales (SEK)</label>
                    <input
                      type="number"
                      value={invGross}
                      onChange={(e) => {
                        const g = parseFloat(e.target.value) || 0;
                        const c = generatorType === "receipt" ? Math.round(g * 0.035 * 100) / 100 : 0;
                        setInvGross(g);
                        setInvCommission(c);
                        setInvNet(g - c);
                      }}
                      className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl font-bold"
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase text-zinc-500">Commission (SEK)</label>
                    <input
                      type="number"
                      value={invCommission}
                      onChange={(e) => {
                        const c = parseFloat(e.target.value) || 0;
                        setInvCommission(c);
                        setInvNet(invGross - c);
                      }}
                      className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl font-bold text-rose-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase text-zinc-500">Net Payout (SEK)</label>
                    <input
                      type="number"
                      value={invNet}
                      readOnly
                      className="w-full px-3 py-2 bg-zinc-100 dark:bg-zinc-850 border border-zinc-200 dark:border-zinc-700 rounded-xl font-black text-emerald-500"
                    />
                  </div>
                </div>

                <div className="p-3 bg-sky-50 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-800 rounded-xl font-mono text-[11px] space-y-1 text-sky-800 dark:text-sky-300">
                  <p>Settlement Bank: <strong>{vendor.bankName || "SEB"}</strong></p>
                  <p>Clearing &amp; Account: <strong>{vendor.bankClearingNumber ? `${vendor.bankClearingNumber} - ` : ""}{vendor.bankAccountNumber || "Direktavräkning"}</strong></p>
                  <p>Swish Företag: <strong>{vendor.swishNumber || "123 918 27 36"}</strong></p>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-mono font-bold uppercase text-zinc-500">Notes / Message to Vendor</label>
                  <textarea
                    rows={2}
                    value={invNotes}
                    onChange={(e) => setInvNotes(e.target.value)}
                    className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl font-medium resize-none"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-zinc-200 dark:border-zinc-800">
                  <button
                    type="button"
                    onClick={() => setShowInvoiceGenerator(false)}
                    className="px-4 py-2 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 rounded-xl font-bold cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSendingInvoice}
                    className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold flex items-center gap-1.5 shadow-md cursor-pointer disabled:opacity-50"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{isSendingInvoice ? "Sending..." : "Send to Vendor & Portal"}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Full Document Viewer Modal */}
        {selectedInvoiceToView && (
          <VendorInvoiceModal
            invoice={selectedInvoiceToView}
            onClose={() => setSelectedInvoiceToView(null)}
          />
        )}
      </div>
    </div>
  );
};

export default AdminStoreDetailModal;
