import React, { useState, useEffect } from "react";
import { useApp } from "../context/AppContext";
import { RealAuthGate } from "../components/RealAuthGate";
import { 
  Building2, 
  Store, 
  TrendingUp, 
  Map, 
  Activity, 
  CheckCircle, 
  XCircle, 
  Plus, 
  LogOut,
  Users,
  Eye,
  Utensils,
  ChevronRight,
  DollarSign,
  Edit3,
  Calendar,
  MapPin,
  ShieldCheck,
  Save,
  X,
  CreditCard,
  Landmark,
  FileText,
  Send,
  Printer,
  Receipt,
  Download,
  CheckCircle2,
  Phone,
  Info,
  Filter,
  Search,
  Sparkles,
  ArrowUpRight,
  Clock,
  HelpCircle
} from "lucide-react";
import { AdminSalesCharts } from "../components/AdminSalesCharts";
import EventMap from "../components/EventMap";
import AdminMapManager from "../components/AdminMapManager";
import { AdminStoreDetailModal } from "../components/AdminStoreDetailModal";
import { VendorInvoiceModal } from "../components/VendorInvoiceModal";
import { Vendor, ManagedEvent, VendorInvoice } from "../types";

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
    estimateVendorWaitTime,
    managedEvents,
    activeEventId,
    setActiveEventId,
    handleUpdateEvent,
    setNotification,
    handleUpdateVendorProfile,
    logActivity
  } = useApp();

  const [activeTab, setActiveTab] = useState<"vendors" | "analytics" | "map" | "invoices" | "activity">("vendors");
  const [showAddVendorModal, setShowAddVendorModal] = useState(false);
  const [showEditEventModal, setShowEditEventModal] = useState(false);
  const [selectedVendorForDetail, setSelectedVendorForDetail] = useState<Vendor | null>(null);

  // Dynamic Current Event based on loggedInAdminId or activeEventId
  const currentEvent = managedEvents.find(
    e => e.id === activeEventId || e.organizerEmail.toLowerCase() === loggedInAdminId?.toLowerCase()
  ) || managedEvents[0];

  // Bank & Swish Details State for Event Admin
  const [showBankDetailsModal, setShowBankDetailsModal] = useState(false);
  const isPredefinedEventBank = SWEDISH_BANKS.some(b => b === currentEvent.bankName);
  const [eventBankName, setEventBankName] = useState(
    currentEvent.bankName ? (isPredefinedEventBank ? currentEvent.bankName : "Other / Annan bank") : "SEB (Skandinaviska Enskilda Banken)"
  );
  const [customBankName, setCustomBankName] = useState(
    currentEvent.bankName && !isPredefinedEventBank ? currentEvent.bankName : ""
  );
  const [eventClearingNumber, setEventClearingNumber] = useState(currentEvent.bankClearingNumber || "5201");
  const [eventAccountNumber, setEventAccountNumber] = useState(currentEvent.bankAccountNumber || "12 345 678");
  const [eventAccountHolder, setEventAccountHolder] = useState(currentEvent.bankAccountHolder || currentEvent.adminName || "Creative Events Nordic AB");
  const [eventBankGiro, setEventBankGiro] = useState(currentEvent.bankGiro || "5123-4567");
  const [eventPlusGiro, setEventPlusGiro] = useState(currentEvent.plusGiro || "61 23 45-8");
  const [eventSwishNumber, setEventSwishNumber] = useState(currentEvent.swishNumber || currentEvent.swishMerchantId || "123 918 27 36");
  const [eventOrgNumber, setEventOrgNumber] = useState(currentEvent.orgNumber || "559123-4567");
  const [eventVatNumber, setEventVatNumber] = useState(currentEvent.vatNumber || "SE559123456701");
  const [eventIban, setEventIban] = useState(currentEvent.bankIban || "");
  const [eventBicSwift, setEventBicSwift] = useState(currentEvent.bankBicSwift || "");
  const [showSepaFields, setShowSepaFields] = useState(Boolean(currentEvent.bankIban || currentEvent.bankBicSwift));

  // Sync state if currentEvent changes
  useEffect(() => {
    const isPredefined = SWEDISH_BANKS.some(b => b === currentEvent.bankName);
    setEventBankName(currentEvent.bankName ? (isPredefined ? currentEvent.bankName : "Other / Annan bank") : "SEB (Skandinaviska Enskilda Banken)");
    setCustomBankName(currentEvent.bankName && !isPredefined ? currentEvent.bankName : "");
    setEventClearingNumber(currentEvent.bankClearingNumber || "5201");
    setEventAccountNumber(currentEvent.bankAccountNumber || "12 345 678");
    setEventAccountHolder(currentEvent.bankAccountHolder || currentEvent.adminName || "Creative Events Nordic AB");
    setEventBankGiro(currentEvent.bankGiro || "5123-4567");
    setEventPlusGiro(currentEvent.plusGiro || "61 23 45-8");
    setEventSwishNumber(currentEvent.swishNumber || currentEvent.swishMerchantId || "123 918 27 36");
    setEventOrgNumber(currentEvent.orgNumber || "559123-4567");
    setEventVatNumber(currentEvent.vatNumber || "SE559123456701");
    setEventIban(currentEvent.bankIban || "");
    setEventBicSwift(currentEvent.bankBicSwift || "");
    setShowSepaFields(Boolean(currentEvent.bankIban || currentEvent.bankBicSwift));
  }, [currentEvent]);

  // Form fields for editing current event details
  const [editName, setEditName] = useState(currentEvent.name);
  const [editLocation, setEditLocation] = useState(currentEvent.location);
  const [editStartDate, setEditStartDate] = useState(currentEvent.startDate);
  const [editEndDate, setEditEndDate] = useState(currentEvent.endDate);
  const [editAttendees, setEditAttendees] = useState(currentEvent.attendeesCount.toString());
  const [editSwish, setEditSwish] = useState(currentEvent.swishMerchantId);
  const [editDescription, setEditDescription] = useState(currentEvent.description);

  const openEditModal = () => {
    setEditName(currentEvent.name);
    setEditLocation(currentEvent.location);
    setEditStartDate(currentEvent.startDate);
    setEditEndDate(currentEvent.endDate);
    setEditAttendees(currentEvent.attendeesCount.toString());
    setEditSwish(currentEvent.swishMerchantId);
    setEditDescription(currentEvent.description);
    setShowEditEventModal(true);
  };

  const handleSaveEventDetails = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: ManagedEvent = {
      ...currentEvent,
      name: editName.trim() || currentEvent.name,
      location: editLocation.trim() || currentEvent.location,
      startDate: editStartDate,
      endDate: editEndDate,
      attendeesCount: parseInt(editAttendees, 10) || currentEvent.attendeesCount,
      swishMerchantId: editSwish.trim() || currentEvent.swishMerchantId,
      swishNumber: editSwish.trim() || currentEvent.swishNumber,
      description: editDescription.trim() || currentEvent.description
    };
    handleUpdateEvent(updated);
    setShowEditEventModal(false);
    setNotification(`Successfully updated event details for "${updated.name}"!`);
  };

  const handleSaveBankDetails = (e: React.FormEvent) => {
    e.preventDefault();
    const resolvedBank = eventBankName === "Other / Annan bank" ? (customBankName.trim() || "Other Bank") : eventBankName;
    const updated: ManagedEvent = {
      ...currentEvent,
      bankName: resolvedBank,
      bankClearingNumber: eventClearingNumber.trim(),
      bankAccountNumber: eventAccountNumber.trim(),
      bankAccountHolder: eventAccountHolder.trim(),
      bankGiro: eventBankGiro.trim(),
      plusGiro: eventPlusGiro.trim(),
      swishNumber: eventSwishNumber.trim(),
      swishMerchantId: eventSwishNumber.trim() || currentEvent.swishMerchantId,
      orgNumber: eventOrgNumber.trim(),
      vatNumber: eventVatNumber.trim(),
      bankIban: eventIban.trim(),
      bankBicSwift: eventBicSwift.trim()
    };
    handleUpdateEvent(updated);
    setShowBankDetailsModal(false);
    setNotification(`Successfully updated banking and Swish payout details for "${updated.name}"!`);
    logActivity(`Admin updated organizer bank details (${resolvedBank}, BG: ${eventBankGiro}) and Swish #${eventSwishNumber}.`, "admin", "success");
  };

  // Invoices & Receipts Management State
  const [selectedInvoiceToPreview, setSelectedInvoiceToPreview] = useState<VendorInvoice | null>(null);
  const [showSendInvoiceModal, setShowSendInvoiceModal] = useState(false);
  const [invoiceType, setInvoiceType] = useState<"receipt" | "invoice">("receipt");
  const [invoiceVendorId, setInvoiceVendorId] = useState<string>(vendors[0]?.id || "");
  const [invoiceTitle, setInvoiceTitle] = useState("");
  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [invoiceGross, setInvoiceGross] = useState<number>(0);
  const [invoiceCommission, setInvoiceCommission] = useState<number>(0);
  const [invoiceNet, setInvoiceNet] = useState<number>(0);
  const [invoiceDueDate, setInvoiceDueDate] = useState<string>("");
  const [invoiceNotes, setInvoiceNotes] = useState<string>("");
  const [invoiceFilterType, setInvoiceFilterType] = useState<"all" | "invoice" | "receipt">("all");
  const [invoiceFilterVendor, setInvoiceFilterVendor] = useState<string>("all");
  const [invoiceSearchQuery, setInvoiceSearchQuery] = useState<string>("");

  // Aggregate all invoices across all vendors for this event
  const allEventInvoices = vendors.flatMap(v => (v.invoices || []).map(inv => ({ ...inv, vendor: v })));

  const openSendInvoiceModal = (presetVendorId?: string, presetType?: "receipt" | "invoice") => {
    const targetVendor = vendors.find(v => v.id === (presetVendorId || invoiceVendorId)) || vendors[0];
    const targetType = presetType || "receipt";
    setInvoiceVendorId(targetVendor.id);
    setInvoiceType(targetType);

    const vendorOrders = orders.filter(o => o.vendorId === targetVendor.id && o.status === "Completed");
    const vendorGross = vendorOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0) || 14850;

    if (targetType === "receipt") {
      const comm = Math.round(vendorGross * 0.035 * 100) / 100;
      const net = Math.round((vendorGross - comm) * 100) / 100;
      setInvoiceTitle(`Slutavräkning - ${targetVendor.name} (${currentEvent.name})`);
      setInvoiceNumber(`AVR-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`);
      setInvoiceGross(vendorGross);
      setInvoiceCommission(comm);
      setInvoiceNet(net);
      setInvoiceDueDate("");
      setInvoiceNotes(`Slutavräkning för digital festivalförsäljning via VenueEat. Utbetalning dirigerad till ${targetVendor.bankName || "SEB Bank"} konto ${targetVendor.bankAccountNumber || "registrerat konto"}.`);
    } else {
      const fee = 3500;
      setInvoiceTitle(`Platsavgift & Festivalel - ${targetVendor.name}`);
      setInvoiceNumber(`FAK-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`);
      setInvoiceGross(fee);
      setInvoiceCommission(0);
      setInvoiceNet(fee);
      const due = new Date();
      due.setDate(due.getDate() + 14);
      setInvoiceDueDate(due.toISOString().split("T")[0]);
      setInvoiceNotes(`Platsavgift och festivalhyra för matstånd vid ${currentEvent.name}. Betalas inom 14 dagar till festivalens bankgiro ${currentEvent.bankGiro || "5123-4567"} eller Swish ${currentEvent.swishMerchantId || "123 918 27 36"}.`);
    }

    setShowSendInvoiceModal(true);
  };

  const handleVendorOrTypeChange = (newVendorId: string, newType: "receipt" | "invoice") => {
    setInvoiceVendorId(newVendorId);
    setInvoiceType(newType);
    const targetVendor = vendors.find(v => v.id === newVendorId) || vendors[0];
    const vendorOrders = orders.filter(o => o.vendorId === targetVendor.id && o.status === "Completed");
    const vendorGross = vendorOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0) || 14850;

    if (newType === "receipt") {
      const comm = Math.round(vendorGross * 0.035 * 100) / 100;
      const net = Math.round((vendorGross - comm) * 100) / 100;
      setInvoiceTitle(`Slutavräkning - ${targetVendor.name} (${currentEvent.name})`);
      setInvoiceNumber(`AVR-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`);
      setInvoiceGross(vendorGross);
      setInvoiceCommission(comm);
      setInvoiceNet(net);
      setInvoiceDueDate("");
      setInvoiceNotes(`Slutavräkning för digital festivalförsäljning via VenueEat. Utbetalning dirigerad till ${targetVendor.bankName || "SEB Bank"} konto ${targetVendor.bankAccountNumber || "registrerat konto"}.`);
    } else {
      const fee = 3500;
      setInvoiceTitle(`Platsavgift & Festivalel - ${targetVendor.name}`);
      setInvoiceNumber(`FAK-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`);
      setInvoiceGross(fee);
      setInvoiceCommission(0);
      setInvoiceNet(fee);
      const due = new Date();
      due.setDate(due.getDate() + 14);
      setInvoiceDueDate(due.toISOString().split("T")[0]);
      setInvoiceNotes(`Platsavgift och festivalhyra för matstånd vid ${currentEvent.name}. Betalas inom 14 dagar till festivalens bankgiro ${currentEvent.bankGiro || "5123-4567"} eller Swish ${currentEvent.swishMerchantId || "123 918 27 36"}.`);
    }
  };

  const handleSendInvoiceToVendor = async (e: React.FormEvent) => {
    e.preventDefault();
    const targetVendor = vendors.find(v => v.id === invoiceVendorId);
    if (!targetVendor) return;

    const vendorOrders = orders.filter(o => o.vendorId === targetVendor.id && o.status === "Completed");

    const newInvoice: VendorInvoice = {
      id: `inv_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      type: invoiceType,
      title: invoiceTitle.trim(),
      invoiceNumber: invoiceNumber.trim(),
      issueDate: new Date().toLocaleDateString("sv-SE"),
      dueDate: invoiceType === "invoice" ? (invoiceDueDate || new Date(Date.now() + 14 * 86400000).toLocaleDateString("sv-SE")) : undefined,
      vendorId: targetVendor.id,
      vendorName: targetVendor.name,
      vendorEmail: targetVendor.email || `${targetVendor.id}@venueeat.se`,
      eventName: currentEvent.name,
      grossAmount: Number(invoiceGross),
      commissionAmount: Number(invoiceCommission),
      netPayoutAmount: Number(invoiceNet),
      ordersCount: vendorOrders.length,
      status: invoiceType === "receipt" ? "Settled" : "Sent",
      bankDetails: {
        bankName: targetVendor.bankName,
        accountNumber: targetVendor.bankAccountNumber,
        clearingNumber: targetVendor.bankClearingNumber,
        swishNumber: targetVendor.swishNumber,
        bankGiro: targetVendor.bankGiro,
        accountHolder: targetVendor.bankAccountHolder
      },
      issuerBankDetails: {
        bankName: currentEvent.bankName || "SEB (Skandinaviska Enskilda Banken)",
        accountNumber: currentEvent.bankAccountNumber || "12 345 678",
        clearingNumber: currentEvent.bankClearingNumber || "5201",
        swishNumber: currentEvent.swishMerchantId || currentEvent.swishNumber || "123 918 27 36",
        bankGiro: currentEvent.bankGiro || "5123-4567",
        plusGiro: currentEvent.plusGiro || "61 23 45-8",
        accountHolder: currentEvent.bankAccountHolder || currentEvent.adminName || "Creative Events Nordic AB",
        orgNumber: currentEvent.orgNumber || "559123-4567",
        iban: currentEvent.bankIban,
        bicSwift: currentEvent.bankBicSwift
      },
      notes: invoiceNotes.trim(),
      sentAt: Date.now()
    };

    const existingInvoices = targetVendor.invoices || [];
    const updatedInvoices = [newInvoice, ...existingInvoices];

    await handleUpdateVendorProfile(targetVendor.id, {
      invoices: updatedInvoices
    });

    setShowSendInvoiceModal(false);
    setNotification(`Successfully issued and sent ${invoiceType === "receipt" ? "Settlement Receipt" : "Invoice"} #${newInvoice.invoiceNumber} to ${targetVendor.name}!`);
    logActivity(`Admin issued ${invoiceType === "receipt" ? "Settlement Receipt" : "Invoice"} #${newInvoice.invoiceNumber} to ${targetVendor.name} (${newInvoice.netPayoutAmount} SEK).`, "admin", "success");
  };

  const handleUpdateInvoiceStatus = async (vendorId: string, invoiceId: string, newStatus: "Sent" | "Paid" | "Settled") => {
    const targetVendor = vendors.find(v => v.id === vendorId);
    if (!targetVendor || !targetVendor.invoices) return;
    const updatedInvoices = targetVendor.invoices.map(inv => inv.id === invoiceId ? { ...inv, status: newStatus } : inv);
    await handleUpdateVendorProfile(vendorId, { invoices: updatedInvoices });
    setNotification(`Updated invoice status to "${newStatus}"!`);
  };

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
        <div className="space-y-1.5 max-w-2xl">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="font-display font-black text-2xl tracking-tight text-white">{currentEvent.name}</h2>
            <span className={`text-[10px] font-mono font-black px-2.5 py-0.5 rounded-full uppercase ${
              currentEvent.status === "Live" 
                ? "bg-orange-500 text-white animate-pulse" 
                : currentEvent.status === "Scheduled" 
                ? "bg-blue-500/20 text-blue-400 border border-blue-500/30" 
                : "bg-zinc-800 text-zinc-400"
            }`}>
              {currentEvent.status} Event
            </span>
            <span className="text-[10px] font-mono bg-zinc-800 text-zinc-300 px-2 py-0.5 rounded-md">
              Code: {currentEvent.code}
            </span>
          </div>

          <p className="text-xs text-zinc-400 font-medium">
            {currentEvent.location} • Dates: <span className="text-zinc-200">{currentEvent.startDate} to {currentEvent.endDate}</span> • Expected: <span className="text-zinc-200">{currentEvent.attendeesCount.toLocaleString()} attendees</span>
          </p>

          <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px] text-zinc-400 font-mono">
            <span className="bg-zinc-900 border border-zinc-800 px-2.5 py-1 rounded-lg">
              Admin Login: <strong className="text-orange-400">{currentEvent.organizerEmail}</strong>
            </span>
            {currentEvent.adminName && (
              <span className="bg-zinc-900 border border-zinc-800 px-2.5 py-1 rounded-lg text-zinc-300">
                Lead: <strong>{currentEvent.adminName}</strong>
              </span>
            )}
            <span className="bg-zinc-900 border border-zinc-800 px-2.5 py-1 rounded-lg text-emerald-400">
              Swish: <strong>{currentEvent.swishMerchantId || currentEvent.swishNumber || "123 918 27 36"}</strong>
            </span>
            <span className="bg-zinc-900 border border-zinc-800 px-2.5 py-1 rounded-lg text-zinc-300">
              Bank: <strong>{currentEvent.bankName ? currentEvent.bankName.split(" ")[0] : "SEB"} (BG: {currentEvent.bankGiro || "5123-4567"})</strong>
            </span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {/* Edit Event Banking & Swish Details Button */}
          <button
            onClick={() => setShowBankDetailsModal(true)}
            className="flex-1 md:flex-initial bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-4 py-2.5 rounded-2xl transition-all shadow-md shadow-emerald-600/20 cursor-pointer flex items-center justify-center gap-1.5"
            title="Configure Event Organizer Bank Account & Swish Settlement routing"
          >
            <Landmark className="w-3.5 h-3.5" />
            <span>Bank &amp; Swish Details</span>
          </button>

          {/* Edit Event Details Button for Event Admin */}
          <button
            onClick={openEditModal}
            className="flex-1 md:flex-initial bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs px-4 py-2.5 rounded-2xl transition-all shadow-md shadow-orange-500/20 cursor-pointer flex items-center justify-center gap-1.5"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>Edit Event</span>
          </button>

          {/* Event Switcher Dropdown if multiple events exist */}
          {managedEvents.length > 1 && (
            <select
              value={currentEvent.id}
              onChange={(e) => setActiveEventId(e.target.value)}
              className="bg-zinc-900 border border-zinc-800 text-zinc-300 text-xs rounded-2xl px-3 py-2.5 outline-none font-medium cursor-pointer"
            >
              {managedEvents.map(evt => (
                <option key={evt.id} value={evt.id}>
                  Switch: {evt.name}
                </option>
              ))}
            </select>
          )}

          <button
            onClick={() => setLoggedInAdminId(null)}
            className="bg-zinc-900 hover:bg-zinc-800 text-zinc-300 font-bold text-xs px-4 py-2.5 rounded-2xl border border-zinc-800 transition-all cursor-pointer flex items-center gap-1.5 shrink-0"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
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
          onClick={() => setActiveTab("invoices")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl font-display font-black text-xs transition-all cursor-pointer ${
            activeTab === "invoices" ? "bg-orange-500 text-white shadow-md shadow-orange-500/20" : "bg-white text-zinc-600 border border-zinc-200"
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Invoices &amp; Receipts ({allEventInvoices.length})</span>
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
      </div>

      {/* RENDER TAB CONTENT */}
      {activeTab === "invoices" ? (
        <div className="bg-white rounded-3xl border border-zinc-200 p-6 md:p-8 space-y-6 shadow-xs animate-fadeIn">
          {/* Top Bar with Title and Actions */}
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 border-b border-zinc-150 pb-5">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-display font-black text-xl text-zinc-900">Vendor Invoices &amp; Settlement Receipts</h3>
                <span className="bg-orange-500/10 text-orange-600 border border-orange-500/20 text-[10px] font-mono font-bold px-2 py-0.5 rounded-full uppercase">
                  Skatteverket Compliant
                </span>
              </div>
              <p className="text-xs text-zinc-500 font-medium mt-0.5">
                Issue official avräkningsnotor (revenue settlements) and festival stall fee invoices directly to vendor food stalls.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
              <button
                type="button"
                onClick={() => openSendInvoiceModal(undefined, "receipt")}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-display font-black text-xs px-4 py-2.5 rounded-2xl transition-all shadow-md shadow-emerald-600/20 cursor-pointer flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>Issue Settlement (Avräkning)</span>
              </button>

              <button
                type="button"
                onClick={() => openSendInvoiceModal(undefined, "invoice")}
                className="bg-sky-600 hover:bg-sky-700 text-white font-display font-black text-xs px-4 py-2.5 rounded-2xl transition-all shadow-md shadow-sky-600/20 cursor-pointer flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>Send Invoice (Faktura)</span>
              </button>

              <button
                type="button"
                onClick={() => setShowBankDetailsModal(true)}
                className="bg-zinc-100 hover:bg-zinc-200 text-zinc-800 font-bold text-xs px-3.5 py-2.5 rounded-2xl transition-all border border-zinc-200 cursor-pointer flex items-center gap-1.5"
                title="Configure Bankgiro, Swish, and Bank account details"
              >
                <Landmark className="w-3.5 h-3.5 text-zinc-600" />
                <span>Payout &amp; Bank Settings</span>
              </button>
            </div>
          </div>

          {/* KPI Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-zinc-50 border border-zinc-200/80 rounded-2xl p-4 space-y-1">
              <span className="text-[10px] font-mono uppercase text-zinc-400 font-bold block">
                Total Avräkningar (Settled)
              </span>
              <p className="text-xl font-display font-black text-emerald-600 font-mono">
                {allEventInvoices.filter(i => i.type === "receipt").reduce((sum, i) => sum + (i.netPayoutAmount || 0), 0).toLocaleString()} SEK
              </p>
              <p className="text-[10px] text-zinc-500 font-mono">
                {allEventInvoices.filter(i => i.type === "receipt").length} settlements issued to vendors
              </p>
            </div>

            <div className="bg-zinc-50 border border-zinc-200/80 rounded-2xl p-4 space-y-1">
              <span className="text-[10px] font-mono uppercase text-zinc-400 font-bold block">
                Platsavgifter (Invoiced Fees)
              </span>
              <p className="text-xl font-display font-black text-sky-600 font-mono">
                {allEventInvoices.filter(i => i.type === "invoice").reduce((sum, i) => sum + (i.grossAmount || 0), 0).toLocaleString()} SEK
              </p>
              <p className="text-[10px] text-zinc-500 font-mono">
                {allEventInvoices.filter(i => i.type === "invoice").length} stall fee invoices issued
              </p>
            </div>

            <div className="bg-zinc-50 border border-zinc-200/80 rounded-2xl p-4 space-y-1">
              <span className="text-[10px] font-mono uppercase text-zinc-400 font-bold block">
                Plattformsprovision (3.5%)
              </span>
              <p className="text-xl font-display font-black text-orange-600 font-mono">
                {allEventInvoices.filter(i => i.type === "receipt").reduce((sum, i) => sum + (i.commissionAmount || 0), 0).toLocaleString()} SEK
              </p>
              <p className="text-[10px] text-zinc-500 font-mono">
                VenueEat automated revenue share
              </p>
            </div>

            <div className="bg-emerald-50/60 border border-emerald-200/80 rounded-2xl p-4 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono uppercase text-emerald-800 font-bold block">
                  Active Organizer Account
                </span>
                <button
                  type="button"
                  onClick={() => setShowBankDetailsModal(true)}
                  className="text-[10px] text-emerald-700 underline font-bold cursor-pointer"
                >
                  Edit
                </button>
              </div>
              <p className="text-xs font-bold text-zinc-900 truncate">
                {currentEvent.bankName?.split(" ")[0] || "SEB"} • BG: {currentEvent.bankGiro || "5123-4567"}
              </p>
              <p className="text-[10px] text-emerald-700 font-mono truncate">
                Swish: {currentEvent.swishMerchantId || currentEvent.swishNumber || "123 918 27 36"}
              </p>
            </div>
          </div>

          {/* Filter Bar */}
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-zinc-50 p-3 rounded-2xl border border-zinc-200 text-xs">
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center bg-white border border-zinc-200 rounded-xl px-2.5 py-1.5 gap-2">
                <Search className="w-3.5 h-3.5 text-zinc-400" />
                <input
                  type="text"
                  placeholder="Search invoice # or vendor..."
                  value={invoiceSearchQuery}
                  onChange={(e) => setInvoiceSearchQuery(e.target.value)}
                  className="bg-transparent text-xs outline-none w-40 sm:w-52 text-zinc-800"
                />
              </div>

              {/* Document Type Filter */}
              <div className="flex items-center bg-white border border-zinc-200 rounded-xl p-1 gap-1">
                <button
                  type="button"
                  onClick={() => setInvoiceFilterType("all")}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-colors cursor-pointer ${
                    invoiceFilterType === "all" ? "bg-zinc-900 text-white" : "text-zinc-600 hover:text-zinc-900"
                  }`}
                >
                  All ({allEventInvoices.length})
                </button>
                <button
                  type="button"
                  onClick={() => setInvoiceFilterType("receipt")}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-colors cursor-pointer ${
                    invoiceFilterType === "receipt" ? "bg-emerald-600 text-white" : "text-zinc-600 hover:text-zinc-900"
                  }`}
                >
                  Avräkningar ({allEventInvoices.filter(i => i.type === "receipt").length})
                </button>
                <button
                  type="button"
                  onClick={() => setInvoiceFilterType("invoice")}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-colors cursor-pointer ${
                    invoiceFilterType === "invoice" ? "bg-sky-600 text-white" : "text-zinc-600 hover:text-zinc-900"
                  }`}
                >
                  Fakturor ({allEventInvoices.filter(i => i.type === "invoice").length})
                </button>
              </div>

              {/* Vendor Filter */}
              <select
                value={invoiceFilterVendor}
                onChange={(e) => setInvoiceFilterVendor(e.target.value)}
                className="bg-white border border-zinc-200 rounded-xl px-3 py-1.5 text-xs text-zinc-700 outline-none cursor-pointer"
              >
                <option value="all">All Vendors ({vendors.length})</option>
                {vendors.map(v => (
                  <option key={v.id} value={v.id}>
                    {v.name} ({v.stallNumber || "Stall"})
                  </option>
                ))}
              </select>
            </div>

            <span className="text-[11px] text-zinc-500 font-mono self-end md:self-center">
              Showing {
                allEventInvoices.filter(inv => {
                  if (invoiceFilterType !== "all" && inv.type !== invoiceFilterType) return false;
                  if (invoiceFilterVendor !== "all" && inv.vendorId !== invoiceFilterVendor) return false;
                  if (invoiceSearchQuery.trim()) {
                    const q = invoiceSearchQuery.toLowerCase();
                    return inv.invoiceNumber.toLowerCase().includes(q) ||
                           inv.title.toLowerCase().includes(q) ||
                           inv.vendorName.toLowerCase().includes(q);
                  }
                  return true;
                }).length
              } documents
            </span>
          </div>

          {/* Invoices List / Table */}
          {(() => {
            const filteredInvoices = allEventInvoices.filter(inv => {
              if (invoiceFilterType !== "all" && inv.type !== invoiceFilterType) return false;
              if (invoiceFilterVendor !== "all" && inv.vendorId !== invoiceFilterVendor) return false;
              if (invoiceSearchQuery.trim()) {
                const q = invoiceSearchQuery.toLowerCase();
                return inv.invoiceNumber.toLowerCase().includes(q) ||
                       inv.title.toLowerCase().includes(q) ||
                       inv.vendorName.toLowerCase().includes(q);
              }
              return true;
            });

            if (filteredInvoices.length === 0) {
              return (
                <div className="bg-zinc-50 border border-dashed border-zinc-200 rounded-3xl p-10 text-center space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-orange-100 text-orange-600 flex items-center justify-center mx-auto">
                    <FileText className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-zinc-800">No invoices or receipts found</h4>
                    <p className="text-xs text-zinc-500 max-w-sm mx-auto mt-1">
                      {allEventInvoices.length === 0
                        ? "Issue your first revenue settlement receipt (Avräkningsnota) or booth fee invoice to a participating vendor."
                        : "No documents match the active filter or search query."}
                    </p>
                  </div>
                  <div className="flex justify-center gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => openSendInvoiceModal(undefined, "receipt")}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-4 py-2 rounded-xl transition-colors cursor-pointer flex items-center gap-1.5"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Issue Settlement Receipt</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => openSendInvoiceModal(undefined, "invoice")}
                      className="bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs px-4 py-2 rounded-xl transition-colors cursor-pointer flex items-center gap-1.5"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Send Stall Invoice</span>
                    </button>
                  </div>
                </div>
              );
            }

            return (
              <div className="border border-zinc-200 rounded-2xl overflow-hidden shadow-xs">
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-zinc-100 border-b border-zinc-200 text-[10px] font-mono uppercase text-zinc-500">
                      <tr>
                        <th className="py-3 px-4 font-bold">Document</th>
                        <th className="py-3 px-4 font-bold">Recipient Stall</th>
                        <th className="py-3 px-4 font-bold">Dates</th>
                        <th className="py-3 px-4 font-bold text-right">Gross / Net (SEK)</th>
                        <th className="py-3 px-4 font-bold text-center">Status</th>
                        <th className="py-3 px-4 font-bold">Payout / Bank Account</th>
                        <th className="py-3 px-4 font-bold text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-100 font-medium">
                      {filteredInvoices.map((inv) => {
                        const isReceipt = inv.type === "receipt";
                        return (
                          <tr key={inv.id} className="hover:bg-zinc-50/80 transition-colors">
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-2">
                                <span className={`inline-block px-2 py-0.5 rounded-md text-[9px] font-mono font-bold uppercase shrink-0 ${
                                  isReceipt 
                                    ? "bg-emerald-100 text-emerald-800 border border-emerald-200" 
                                    : "bg-sky-100 text-sky-800 border border-sky-200"
                                }`}>
                                  {isReceipt ? "Avräkning" : "Faktura"}
                                </span>
                                <div>
                                  <p className="font-bold text-zinc-900 leading-tight">{inv.title}</p>
                                  <p className="text-[10px] text-zinc-500 font-mono">#{inv.invoiceNumber}</p>
                                </div>
                              </div>
                            </td>

                            <td className="py-3 px-4">
                              <div className="flex items-center gap-2">
                                <span className="text-xl p-1 bg-white rounded-lg border border-zinc-200 shrink-0">
                                  {inv.vendor.logo || "🍛"}
                                </span>
                                <div>
                                  <p className="font-bold text-zinc-900 leading-tight">{inv.vendorName}</p>
                                  <p className="text-[10px] text-zinc-500">{inv.vendor.stallNumber || "Stall"} • {inv.vendorEmail}</p>
                                </div>
                              </div>
                            </td>

                            <td className="py-3 px-4 font-mono text-[11px] text-zinc-600">
                              <p>Issued: <span className="text-zinc-900 font-bold">{inv.issueDate}</span></p>
                              {inv.dueDate && (
                                <p className="text-orange-700">Due: <span className="font-bold">{inv.dueDate}</span></p>
                              )}
                            </td>

                            <td className="py-3 px-4 text-right font-mono">
                              <p className="font-black text-sm text-zinc-900">
                                {(inv.netPayoutAmount || inv.grossAmount).toLocaleString("sv-SE")} kr
                              </p>
                              {isReceipt && inv.commissionAmount > 0 && (
                                <p className="text-[10px] text-zinc-500">
                                  Gross: {inv.grossAmount.toLocaleString("sv-SE")} (Fee -{inv.commissionAmount})
                                </p>
                              )}
                            </td>

                            <td className="py-3 px-4 text-center">
                              <select
                                value={inv.status}
                                onChange={(e) => handleUpdateInvoiceStatus(inv.vendorId, inv.id, e.target.value as any)}
                                className={`text-[10px] font-mono font-bold px-2 py-1 rounded-full outline-none cursor-pointer border ${
                                  inv.status === "Settled" ? "bg-emerald-100 text-emerald-800 border-emerald-300" :
                                  inv.status === "Paid" ? "bg-teal-100 text-teal-800 border-teal-300" :
                                  "bg-sky-100 text-sky-800 border-sky-300"
                                }`}
                              >
                                <option value="Sent">Sent (Skickad)</option>
                                <option value="Paid">Paid (Betald)</option>
                                <option value="Settled">Settled (Avräknad)</option>
                              </select>
                            </td>

                            <td className="py-3 px-4 font-mono text-[11px] text-zinc-600">
                              {isReceipt ? (
                                <div>
                                  <p className="font-bold text-zinc-900 truncate">
                                    {inv.bankDetails?.bankName || "SEB"} ({inv.bankDetails?.accountNumber || "Konto"})
                                  </p>
                                  {inv.bankDetails?.swishNumber && (
                                    <p className="text-[10px] text-emerald-700">Swish: {inv.bankDetails.swishNumber}</p>
                                  )}
                                </div>
                              ) : (
                                <div>
                                  <p className="font-bold text-zinc-900 truncate">
                                    Pay to: BG {inv.issuerBankDetails?.bankGiro || currentEvent.bankGiro || "5123-4567"}
                                  </p>
                                  <p className="text-[10px] text-emerald-700">
                                    Swish: {inv.issuerBankDetails?.swishNumber || currentEvent.swishMerchantId || "123 918 27 36"}
                                  </p>
                                </div>
                              )}
                            </td>

                            <td className="py-3 px-4 text-right">
                              <button
                                type="button"
                                onClick={() => setSelectedInvoiceToPreview(inv)}
                                className="bg-zinc-900 hover:bg-orange-500 text-white font-bold text-[11px] px-3 py-1.5 rounded-xl transition-colors cursor-pointer inline-flex items-center gap-1 shadow-xs"
                              >
                                <Printer className="w-3 h-3" />
                                <span>View / Print</span>
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            );
          })()}
        </div>
      ) : activeTab === "analytics" ? (
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
              const storeOrders = orders.filter(
                (o) => o.vendorId === v.id || o.vendorName === v.name
              );
              const storeCompleted = storeOrders.filter(o => o.status === "Completed");
              const storeRevenue = storeCompleted.reduce((acc, o) => acc + (o.totalAmount || 0), 0);

              return (
                <div
                  key={v.id}
                  onClick={() => setSelectedVendorForDetail(v)}
                  className="group relative p-5 rounded-3xl border border-zinc-200 hover:border-orange-500/50 bg-zinc-50 hover:bg-white space-y-4 text-left shadow-xs hover:shadow-xl transition-all duration-200 cursor-pointer flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex justify-between items-start gap-2">
                      <div className="flex items-center gap-3">
                        <span className="text-3xl p-2 bg-white rounded-2xl border border-zinc-200 group-hover:scale-105 transition-transform shrink-0">
                          {v.logo || "🍛"}
                        </span>
                        <div>
                          <h4 className="font-display font-black text-base text-zinc-900 group-hover:text-orange-600 transition-colors leading-tight">
                            {v.name}
                          </h4>
                          <p className="text-xs text-zinc-500 font-medium">
                            {v.cuisine} • {v.stallNumber || "Stall #01"}
                          </p>
                        </div>
                      </div>
                      <span
                        className={`text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full shrink-0 ${
                          isApproved
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-rose-100 text-rose-800"
                        }`}
                      >
                        {isApproved ? "Approved" : "Suspended"}
                      </span>
                    </div>

                    {/* Quick Earnings & Menu Pills */}
                    <div className="grid grid-cols-2 gap-2 pt-1 font-mono text-xs">
                      <div className="bg-white group-hover:bg-zinc-50 p-2 rounded-xl border border-zinc-200/80">
                        <span className="text-[10px] text-zinc-400 block uppercase">Gross Sales</span>
                        <span className="font-black text-orange-600">
                          {storeRevenue.toLocaleString()} SEK
                        </span>
                      </div>
                      <div className="bg-white group-hover:bg-zinc-50 p-2 rounded-xl border border-zinc-200/80">
                        <span className="text-[10px] text-zinc-400 block uppercase">Menu Items</span>
                        <span className="font-bold text-zinc-800">
                          {v.menu?.length || 0} Dishes
                        </span>
                      </div>
                    </div>

                    <div className="text-xs font-mono space-y-1 text-zinc-600 border-t border-zinc-200/80 pt-3">
                      <p className="truncate">Swish: <span className="text-zinc-900 font-bold">{v.swishNumber || "123 918 27 36"}</span></p>
                      <p className="truncate">Email: <span className="text-zinc-900 font-bold">{v.email}</span></p>
                    </div>
                  </div>

                  <div className="pt-2 space-y-2 border-t border-zinc-200/80">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedVendorForDetail(v);
                      }}
                      className="w-full bg-zinc-900 hover:bg-orange-500 text-white font-bold text-xs py-2 px-3 rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-1.5 shadow-xs"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>View Store Details (Earnings &amp; Menu)</span>
                      <ChevronRight className="w-3.5 h-3.5 ml-auto" />
                    </button>

                    <div className="flex gap-2">
                      {isApproved ? (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSuspendVendor(v.id);
                          }}
                          className="w-full bg-zinc-200 hover:bg-rose-100 hover:text-rose-800 text-zinc-700 font-bold text-xs py-1.5 rounded-xl transition-all cursor-pointer"
                        >
                          Suspend Stall
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleApproveVendor(v.id);
                          }}
                          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-1.5 rounded-xl transition-all cursor-pointer"
                        >
                          Approve Stall
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* PREVIEW VENDOR INVOICE / RECEIPT MODAL */}
      {selectedInvoiceToPreview && (
        <VendorInvoiceModal
          invoice={selectedInvoiceToPreview}
          onClose={() => setSelectedInvoiceToPreview(null)}
        />
      )}

      {/* EVENT ORGANIZER BANK & SWISH DETAILS MODAL */}
      {showBankDetailsModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 md:p-8 space-y-5 shadow-2xl border border-zinc-200 max-h-[90vh] overflow-y-auto animate-fadeIn text-left">
            <div className="flex justify-between items-start border-b border-zinc-150 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-emerald-500/10 text-emerald-600 rounded-xl">
                    <Landmark className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-display font-black text-xl text-zinc-900">Event Bank &amp; Swish Payouts</h3>
                    <span className="text-[10px] bg-emerald-100 text-emerald-800 font-mono font-bold px-2 py-0.5 rounded-full">
                      Organizer Settlement Account
                    </span>
                  </div>
                </div>
                <p className="text-xs text-zinc-500 mt-1.5 leading-relaxed">
                  Configure your bankgiro, clearing, account number, and Swish merchant ID. These appear as the issuer details on all invoices and settlement receipts sent to vendors.
                </p>
              </div>
              <button 
                type="button"
                onClick={() => setShowBankDetailsModal(false)}
                className="text-zinc-400 hover:text-zinc-600 p-1.5 rounded-xl hover:bg-zinc-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveBankDetails} className="space-y-4 text-xs">
              {/* Swish Handel Section */}
              <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-2xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-emerald-800 font-bold">
                    <Phone className="w-4 h-4 text-emerald-600" />
                    <span>Swish Handel / Företag</span>
                  </div>
                  <span className="text-[9px] bg-emerald-100 text-emerald-800 font-mono font-bold px-2 py-0.5 rounded-full">
                    Instant Payout &amp; Split
                  </span>
                </div>
                <div>
                  <label className="font-bold text-zinc-700 block mb-1">
                    Event Swish Merchant Number (Swishnummer)
                  </label>
                  <input
                    type="text"
                    required
                    value={eventSwishNumber}
                    onChange={(e) => setEventSwishNumber(e.target.value)}
                    placeholder="e.g. 123 918 27 36"
                    className="w-full bg-white border border-emerald-300 focus:border-emerald-500 rounded-xl p-2.5 text-xs text-zinc-900 font-mono font-bold outline-none"
                  />
                  <p className="text-[10px] text-zinc-500 mt-1">
                    Used for attendee Swish split payments (platform commission) and attendee payments.
                  </p>
                </div>
              </div>

              {/* Swedish Bank Selection */}
              <div className="space-y-1">
                <label className="font-bold text-zinc-700 block">Bank / Kreditinstitut</label>
                <select
                  value={eventBankName}
                  onChange={(e) => setEventBankName(e.target.value)}
                  className="w-full bg-zinc-50 border border-zinc-200 focus:border-orange-500 rounded-xl p-2.5 text-xs text-zinc-900 font-medium outline-none cursor-pointer"
                >
                  {SWEDISH_BANKS.map((b) => (
                    <option key={b} value={b}>
                      {b}
                    </option>
                  ))}
                </select>
              </div>

              {eventBankName === "Other / Annan bank" && (
                <div className="space-y-1 animate-fadeIn">
                  <label className="font-bold text-zinc-700 block">Ange Bankens Namn</label>
                  <input
                    type="text"
                    required
                    value={customBankName}
                    onChange={(e) => setCustomBankName(e.target.value)}
                    placeholder="e.g. Avanza, Forex, etc."
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-xl p-2.5 text-xs text-zinc-900 outline-none"
                  />
                </div>
              )}

              {/* Clearing & Account Number */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-zinc-700 block">Clearingnummer (4-5 siffror)</label>
                  <input
                    type="text"
                    value={eventClearingNumber}
                    onChange={(e) => setEventClearingNumber(e.target.value)}
                    placeholder="e.g. 5201 eller 8327-9"
                    className="w-full bg-zinc-50 border border-zinc-200 focus:border-orange-500 rounded-xl p-2.5 text-xs text-zinc-900 font-mono outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-zinc-700 block">Kontonummer</label>
                  <input
                    type="text"
                    value={eventAccountNumber}
                    onChange={(e) => setEventAccountNumber(e.target.value)}
                    placeholder="e.g. 12 345 678"
                    className="w-full bg-zinc-50 border border-zinc-200 focus:border-orange-500 rounded-xl p-2.5 text-xs text-zinc-900 font-mono outline-none"
                  />
                </div>
              </div>

              {/* Account Holder */}
              <div className="space-y-1">
                <label className="font-bold text-zinc-700 block">Kontohavare / Företagsnamn</label>
                <input
                  type="text"
                  required
                  value={eventAccountHolder}
                  onChange={(e) => setEventAccountHolder(e.target.value)}
                  placeholder="e.g. Creative Events Nordic AB"
                  className="w-full bg-zinc-50 border border-zinc-200 focus:border-orange-500 rounded-xl p-2.5 text-xs text-zinc-900 outline-none font-medium"
                />
              </div>

              {/* Bankgiro & Plusgiro */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-zinc-700 block">Bankgiro (BG)</label>
                  <input
                    type="text"
                    value={eventBankGiro}
                    onChange={(e) => setEventBankGiro(e.target.value)}
                    placeholder="e.g. 5123-4567"
                    className="w-full bg-zinc-50 border border-zinc-200 focus:border-orange-500 rounded-xl p-2.5 text-xs text-zinc-900 font-mono outline-none font-bold"
                  />
                  <p className="text-[10px] text-zinc-400">För leverantörsfakturor</p>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-zinc-700 block">PlusGiro (PG)</label>
                  <input
                    type="text"
                    value={eventPlusGiro}
                    onChange={(e) => setEventPlusGiro(e.target.value)}
                    placeholder="e.g. 61 23 45-8"
                    className="w-full bg-zinc-50 border border-zinc-200 focus:border-orange-500 rounded-xl p-2.5 text-xs text-zinc-900 font-mono outline-none"
                  />
                  <p className="text-[10px] text-zinc-400">Valfritt</p>
                </div>
              </div>

              {/* Organization Number & VAT */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-zinc-700 block">Organisationsnummer (Org.nr)</label>
                  <input
                    type="text"
                    value={eventOrgNumber}
                    onChange={(e) => setEventOrgNumber(e.target.value)}
                    placeholder="e.g. 559123-4567"
                    className="w-full bg-zinc-50 border border-zinc-200 focus:border-orange-500 rounded-xl p-2.5 text-xs text-zinc-900 font-mono outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-zinc-700 block">Momsregistreringsnummer (VAT)</label>
                  <input
                    type="text"
                    value={eventVatNumber}
                    onChange={(e) => setEventVatNumber(e.target.value)}
                    placeholder="e.g. SE559123456701"
                    className="w-full bg-zinc-50 border border-zinc-200 focus:border-orange-500 rounded-xl p-2.5 text-xs text-zinc-900 font-mono outline-none"
                  />
                </div>
              </div>

              {/* International / SEPA Toggle */}
              <div className="pt-1">
                <button
                  type="button"
                  onClick={() => setShowSepaFields(!showSepaFields)}
                  className="text-[11px] text-orange-600 hover:text-orange-700 font-bold flex items-center gap-1 cursor-pointer"
                >
                  <span>{showSepaFields ? "− Dölj IBAN & SWIFT/BIC (SEPA)" : "+ Lägg till IBAN & SWIFT/BIC för internationell betalning"}</span>
                </button>

                {showSepaFields && (
                  <div className="grid grid-cols-2 gap-3 mt-2 bg-zinc-50 p-3 rounded-xl border border-zinc-200 animate-fadeIn">
                    <div className="space-y-1">
                      <label className="font-bold text-zinc-700 block">IBAN</label>
                      <input
                        type="text"
                        value={eventIban}
                        onChange={(e) => setEventIban(e.target.value)}
                        placeholder="e.g. SE455000..."
                        className="w-full bg-white border border-zinc-200 rounded-lg p-2 text-xs font-mono outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="font-bold text-zinc-700 block">BIC / SWIFT</label>
                      <input
                        type="text"
                        value={eventBicSwift}
                        onChange={(e) => setEventBicSwift(e.target.value)}
                        placeholder="e.g. ESSEESSX"
                        className="w-full bg-white border border-zinc-200 rounded-lg p-2 text-xs font-mono outline-none"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Informational Box */}
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-[11px] text-amber-900 leading-relaxed flex items-start gap-2">
                <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <span>
                  Dessa bank- och Swish-uppgifter är direkt kopplade till festivalen. När du skickar en faktura till ett matstånd visas ditt Bankgiro och Swish som betalningsmottagare. När du skickar en avräkningsnota redovisas din organisation som utbetalare enligt Skatteverkets krav.
                </span>
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowBankDetailsModal(false)}
                  className="flex-1 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 font-bold py-3 rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-xl transition-all shadow-md shadow-emerald-600/20 cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Save className="w-4 h-4" />
                  <span>Save Bank &amp; Swish Details</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* SEND INVOICE OR SETTLEMENT RECEIPT TO VENDOR MODAL */}
      {showSendInvoiceModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 md:p-8 space-y-5 shadow-2xl border border-zinc-200 max-h-[90vh] overflow-y-auto animate-fadeIn text-left">
            <div className="flex justify-between items-start border-b border-zinc-150 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <div className={`p-2 rounded-xl ${invoiceType === "receipt" ? "bg-emerald-100 text-emerald-700" : "bg-sky-100 text-sky-700"}`}>
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-display font-black text-xl text-zinc-900">
                      {invoiceType === "receipt" ? "Issue Settlement Receipt (Avräkning)" : "Send Invoice to Vendor (Faktura)"}
                    </h3>
                    <span className="text-[10px] bg-orange-100 text-orange-700 font-mono font-bold px-2 py-0.5 rounded-full">
                      Official Vendor Dispatch
                    </span>
                  </div>
                </div>
                <p className="text-xs text-zinc-500 mt-1.5 leading-relaxed">
                  {invoiceType === "receipt"
                    ? "Generate an official sales settlement showing festival orders, gross GMV, VenueEat fee, and net payout directly to the stall's bank account."
                    : "Issue a formal festival invoice for stall rent, tent fee, electricity, or deposits payable to the festival organizer."}
                </p>
              </div>
              <button 
                type="button"
                onClick={() => setShowSendInvoiceModal(false)}
                className="text-zinc-400 hover:text-zinc-600 p-1.5 rounded-xl hover:bg-zinc-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSendInvoiceToVendor} className="space-y-4 text-xs">
              {/* Document Type Selector */}
              <div>
                <label className="font-bold text-zinc-700 block mb-1.5">Document Type</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => handleVendorOrTypeChange(invoiceVendorId, "receipt")}
                    className={`py-2.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 border transition-all cursor-pointer ${
                      invoiceType === "receipt"
                        ? "bg-emerald-600 text-white border-emerald-600 shadow-md shadow-emerald-600/20"
                        : "bg-zinc-50 hover:bg-zinc-100 text-zinc-700 border-zinc-200"
                    }`}
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Avräkningsnota (Payout Receipt)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleVendorOrTypeChange(invoiceVendorId, "invoice")}
                    className={`py-2.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 border transition-all cursor-pointer ${
                      invoiceType === "invoice"
                        ? "bg-sky-600 text-white border-sky-600 shadow-md shadow-sky-600/20"
                        : "bg-zinc-50 hover:bg-zinc-100 text-zinc-700 border-zinc-200"
                    }`}
                  >
                    <Receipt className="w-4 h-4" />
                    <span>Faktura (Stall Fee Invoice)</span>
                  </button>
                </div>
              </div>

              {/* Vendor Selector */}
              <div className="space-y-1">
                <label className="font-bold text-zinc-700 block">Select Recipient Food Stall</label>
                <select
                  value={invoiceVendorId}
                  onChange={(e) => handleVendorOrTypeChange(e.target.value, invoiceType)}
                  className="w-full bg-zinc-50 border border-zinc-200 focus:border-orange-500 rounded-xl p-2.5 text-xs text-zinc-900 font-medium outline-none cursor-pointer"
                >
                  {vendors.map(v => (
                    <option key={v.id} value={v.id}>
                      {v.name} ({v.stallNumber || "Stall"}) • Swish #{v.swishNumber || "N/A"}
                    </option>
                  ))}
                </select>
              </div>

              {/* Target Vendor Bank Details Preview */}
              {(() => {
                const targetV = vendors.find(v => v.id === invoiceVendorId);
                const hasBank = Boolean(targetV?.bankAccountNumber || targetV?.bankGiro);

                if (invoiceType === "receipt") {
                  return (
                    <div className={`p-3 rounded-xl border text-[11px] ${
                      hasBank ? "bg-emerald-50/60 border-emerald-200 text-emerald-900" : "bg-amber-50 border-amber-200 text-amber-900"
                    }`}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-mono font-bold uppercase text-[9px]">
                          Mottagande Utbetalningskonto (Vendor Bank Account)
                        </span>
                        <span className="font-bold">
                          {hasBank ? "✓ Verified" : "⚠️ Ej angivet"}
                        </span>
                      </div>
                      <p>
                        Bank: <strong>{targetV?.bankName || "SEB"}</strong> • Clearing: <strong>{targetV?.bankClearingNumber || "Standard"}</strong> • Konto: <strong>{targetV?.bankAccountNumber || "Direktavräkning"}</strong>
                      </p>
                      {targetV?.swishNumber && (
                        <p className="mt-0.5">Swish Payout: <strong>{targetV.swishNumber}</strong></p>
                      )}
                      {!hasBank && (
                        <p className="text-[10px] text-amber-700 mt-1 italic">
                          Tips: Matståndet kan också ange sitt bankkonto i kökets inställningar under Stall Settings.
                        </p>
                      )}
                    </div>
                  );
                } else {
                  return (
                    <div className="p-3 rounded-xl border bg-sky-50 border-sky-200 text-sky-950 text-[11px]">
                      <span className="font-mono font-bold uppercase text-[9px] block mb-1 text-sky-800">
                        Inbetalningsuppgifter till Festivalarrangör (Attached on Invoice)
                      </span>
                      <p>
                        Bankgiro: <strong>{currentEvent.bankGiro || "5123-4567"}</strong> • Swish Företag: <strong>{currentEvent.swishMerchantId || currentEvent.swishNumber || "123 918 27 36"}</strong>
                      </p>
                      <p className="text-[10px] text-sky-700 mt-0.5">
                        Bank: {currentEvent.bankName || "SEB"} • Konto: {currentEvent.bankAccountNumber || "12 345 678"}
                      </p>
                    </div>
                  );
                }
              })()}

              {/* Document Number and Title */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-zinc-700 block">Document Title</label>
                  <input
                    type="text"
                    required
                    value={invoiceTitle}
                    onChange={(e) => setInvoiceTitle(e.target.value)}
                    className="w-full bg-zinc-50 border border-zinc-200 focus:border-orange-500 rounded-xl p-2.5 text-xs text-zinc-900 font-medium outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-zinc-700 block">Document Number (Ref / OCR)</label>
                  <input
                    type="text"
                    required
                    value={invoiceNumber}
                    onChange={(e) => setInvoiceNumber(e.target.value)}
                    className="w-full bg-zinc-50 border border-zinc-200 focus:border-orange-500 rounded-xl p-2.5 text-xs text-zinc-900 font-mono outline-none"
                  />
                </div>
              </div>

              {/* Amounts Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-zinc-50 p-3.5 rounded-2xl border border-zinc-200">
                <div className="space-y-1">
                  <label className="font-bold text-zinc-700 block text-[11px]">
                    {invoiceType === "receipt" ? "Gross Sales (Brutto)" : "Fakturabelopp (Total)"}
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      step="any"
                      required
                      value={invoiceGross}
                      onChange={(e) => {
                        const val = parseFloat(e.target.value) || 0;
                        setInvoiceGross(val);
                        if (invoiceType === "receipt") {
                          const comm = Math.round(val * 0.035 * 100) / 100;
                          setInvoiceCommission(comm);
                          setInvoiceNet(Math.round((val - comm) * 100) / 100);
                        } else {
                          setInvoiceNet(val);
                        }
                      }}
                      className="w-full bg-white border border-zinc-200 rounded-xl p-2 text-xs font-mono font-bold outline-none pr-8"
                    />
                    <span className="absolute right-2.5 top-2 text-[10px] text-zinc-400 font-mono font-bold">kr</span>
                  </div>
                </div>

                {invoiceType === "receipt" ? (
                  <>
                    <div className="space-y-1">
                      <label className="font-bold text-zinc-700 block text-[11px]">VenueEat Fee (3.5%)</label>
                      <div className="relative">
                        <input
                          type="number"
                          step="any"
                          value={invoiceCommission}
                          onChange={(e) => {
                            const comm = parseFloat(e.target.value) || 0;
                            setInvoiceCommission(comm);
                            setInvoiceNet(Math.round((invoiceGross - comm) * 100) / 100);
                          }}
                          className="w-full bg-white border border-zinc-200 rounded-xl p-2 text-xs font-mono text-rose-600 font-bold outline-none pr-8"
                        />
                        <span className="absolute right-2.5 top-2 text-[10px] text-zinc-400 font-mono font-bold">kr</span>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="font-bold text-emerald-800 block text-[11px]">Net Payout (Att utbetala)</label>
                      <div className="relative">
                        <input
                          type="number"
                          step="any"
                          value={invoiceNet}
                          onChange={(e) => setInvoiceNet(parseFloat(e.target.value) || 0)}
                          className="w-full bg-emerald-50 border border-emerald-300 rounded-xl p-2 text-xs font-mono text-emerald-800 font-black outline-none pr-8"
                        />
                        <span className="absolute right-2.5 top-2 text-[10px] text-emerald-600 font-mono font-bold">kr</span>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="space-y-1 sm:col-span-2">
                    <label className="font-bold text-zinc-700 block text-[11px]">Förfallodatum (Due Date)</label>
                    <input
                      type="date"
                      required
                      value={invoiceDueDate}
                      onChange={(e) => setInvoiceDueDate(e.target.value)}
                      className="w-full bg-white border border-zinc-200 rounded-xl p-2 text-xs font-medium outline-none"
                    />
                  </div>
                )}
              </div>

              {/* Notes */}
              <div className="space-y-1">
                <label className="font-bold text-zinc-700 block">Meddelande / Anteckningar till Matståndet</label>
                <textarea
                  rows={3}
                  value={invoiceNotes}
                  onChange={(e) => setInvoiceNotes(e.target.value)}
                  className="w-full bg-zinc-50 border border-zinc-200 focus:border-orange-500 rounded-xl p-2.5 text-xs text-zinc-900 outline-none leading-relaxed"
                />
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowSendInvoiceModal(false)}
                  className="flex-1 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 font-bold py-3 rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={`flex-1 text-white font-bold py-3 rounded-xl transition-all shadow-md cursor-pointer flex items-center justify-center gap-1.5 ${
                    invoiceType === "receipt"
                      ? "bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/20"
                      : "bg-sky-600 hover:bg-sky-700 shadow-sky-600/20"
                  }`}
                >
                  <Send className="w-4 h-4" />
                  <span>Send Official Document to Vendor</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {selectedVendorForDetail && (
        <AdminStoreDetailModal
          vendor={selectedVendorForDetail}
          orders={orders}
          onClose={() => setSelectedVendorForDetail(null)}
          onApproveVendor={async (id) => {
            await handleApproveVendor(id);
            setSelectedVendorForDetail(prev => prev && prev.id === id ? { ...prev, isApproved: true } : prev);
          }}
          onSuspendVendor={async (id) => {
            await handleSuspendVendor(id);
            setSelectedVendorForDetail(prev => prev && prev.id === id ? { ...prev, isApproved: false } : prev);
          }}
          onUpdateVendorProfile={async (id, fields) => {
            await handleUpdateVendorProfile(id, fields);
            setSelectedVendorForDetail(prev => prev && prev.id === id ? { ...prev, ...fields } : prev);
          }}
          eventName={currentEvent.name}
          currentEvent={currentEvent}
        />
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

      {/* EDIT EVENT DETAILS MODAL (ACCESSIBLE TO EVENT ADMIN) */}
      {showEditEventModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 md:p-8 space-y-5 shadow-2xl border border-zinc-200 max-h-[90vh] overflow-y-auto animate-fadeIn">
            <div className="flex justify-between items-start border-b border-zinc-100 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-display font-black text-xl text-zinc-900">Edit Event Settings</h3>
                  <span className="text-[10px] bg-orange-100 text-orange-700 font-mono font-bold px-2 py-0.5 rounded-full">
                    Event Admin Portal
                  </span>
                </div>
                <p className="text-xs text-zinc-500 mt-1">
                  Update venue details, festival dates, expected crowd, and Swish merchant ID.
                </p>
              </div>
              <button 
                onClick={() => setShowEditEventModal(false)}
                className="text-zinc-400 hover:text-zinc-600 p-1.5 rounded-xl hover:bg-zinc-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEventDetails} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-zinc-700 block">Festival / Event Name</label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full bg-zinc-50 border border-zinc-200 focus:border-orange-500 rounded-xl p-3 text-xs text-zinc-900 font-medium outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-zinc-700 block">Venue / Location</label>
                <input
                  type="text"
                  required
                  value={editLocation}
                  onChange={(e) => setEditLocation(e.target.value)}
                  placeholder="e.g. Kungsträdgården, Stockholm"
                  className="w-full bg-zinc-50 border border-zinc-200 focus:border-orange-500 rounded-xl p-3 text-xs text-zinc-900 font-medium outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-zinc-700 block">Start Date</label>
                  <input
                    type="date"
                    required
                    value={editStartDate}
                    onChange={(e) => setEditStartDate(e.target.value)}
                    className="w-full bg-zinc-50 border border-zinc-200 focus:border-orange-500 rounded-xl p-2.5 text-xs text-zinc-900 outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-zinc-700 block">End Date</label>
                  <input
                    type="date"
                    required
                    value={editEndDate}
                    onChange={(e) => setEditEndDate(e.target.value)}
                    className="w-full bg-zinc-50 border border-zinc-200 focus:border-orange-500 rounded-xl p-2.5 text-xs text-zinc-900 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-zinc-700 block">Expected Attendees</label>
                  <input
                    type="number"
                    min="100"
                    required
                    value={editAttendees}
                    onChange={(e) => setEditAttendees(e.target.value)}
                    className="w-full bg-zinc-50 border border-zinc-200 focus:border-orange-500 rounded-xl p-2.5 text-xs text-zinc-900 outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-zinc-700 block">Swish Merchant Number</label>
                  <input
                    type="text"
                    required
                    value={editSwish}
                    onChange={(e) => setEditSwish(e.target.value)}
                    className="w-full bg-zinc-50 border border-zinc-200 focus:border-orange-500 rounded-xl p-2.5 text-xs text-zinc-900 font-mono outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-zinc-700 block">Public Event Description</label>
                <textarea
                  rows={3}
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  className="w-full bg-zinc-50 border border-zinc-200 focus:border-orange-500 rounded-xl p-3 text-xs text-zinc-900 outline-none"
                />
              </div>

              <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-2xl flex items-center justify-between text-xs">
                <div>
                  <span className="font-bold text-emerald-950 block">Event Bank &amp; Swish Settlement Account</span>
                  <span className="text-[11px] text-emerald-700 font-mono">
                    {currentEvent.bankName?.split(" ")[0] || "SEB"} (BG: {currentEvent.bankGiro || "5123-4567"}) • Swish #{currentEvent.swishMerchantId || "123 918 27 36"}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setShowEditEventModal(false);
                    setShowBankDetailsModal(true);
                  }}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-3 py-1.5 rounded-xl transition-colors cursor-pointer shrink-0"
                >
                  Edit Bank &amp; Swish
                </button>
              </div>

              <div className="bg-zinc-50 border border-zinc-200 p-3 rounded-2xl flex items-center justify-between text-[11px] text-zinc-500 font-mono">
                <div>
                  <span>Authorized Login ID: </span>
                  <strong className="text-zinc-900">{currentEvent.organizerEmail}</strong>
                </div>
                <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                  Admin Verified
                </span>
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowEditEventModal(false)}
                  className="flex-1 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 font-bold py-3 rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 rounded-xl transition-all shadow-md shadow-orange-500/20 cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Save className="w-4 h-4" />
                  <span>Save Changes</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
