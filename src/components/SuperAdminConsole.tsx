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
  KeyRound
} from "lucide-react";
import type { ManagedEvent, EventStatus } from "../types";

interface SuperAdminConsoleProps {
  managedEvents?: ManagedEvent[];
  events?: ManagedEvent[];
  activeEventId: string;
  onSelectEvent?: (eventId: string) => void;
  onSelectActiveEvent?: (eventId: string) => void;
  onAddNewEvent: (newEvent: ManagedEvent) => void;
  onUpdateEventStatus: (eventId: string, status: EventStatus) => void;
  onUpdateEventMap?: () => void;
}

export default function SuperAdminConsole({
  managedEvents,
  events: passedEvents,
  activeEventId,
  onSelectEvent,
  onSelectActiveEvent,
  onAddNewEvent,
  onUpdateEventStatus,
}: SuperAdminConsoleProps) {
  const events = managedEvents || passedEvents || [];
  const handleSelectEvent = onSelectEvent || onSelectActiveEvent || (() => {});
  // Super Admin Authentication State (default to true for instant demo access, or false if user clicks Logout)
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(true);
  const [loginEmail, setLoginEmail] = useState("superadmin@venueeat.se");
  const [loginPassword, setLoginPassword] = useState("superadmin123");
  const [loginError, setLoginError] = useState<string | null>(null);

  const [activeTab, setActiveTab] = useState<"live" | "history" | "create">("live");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"All" | "Live" | "Scheduled" | "Completed">("All");
  const [categoryFilter, setCategoryFilter] = useState<string>("All");
  const [yearFilter, setYearFilter] = useState<string>("All");

  // Selected event for detail inspection modal
  const [inspectEvent, setInspectEvent] = useState<ManagedEvent | null>(null);

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
  const [formDescription, setFormDescription] = useState("");
  const [formMapImageUrl, setFormMapImageUrl] = useState("");
  const [formSuccess, setFormSuccess] = useState<string | null>(null);

  // Handle Login submission
  const handleSuperAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginEmail.trim() || !loginPassword.trim()) {
      setLoginError("Please fill in both email and password.");
      return;
    }

    if (
      (loginEmail.toLowerCase() === "superadmin@venueeat.se" || loginEmail.toLowerCase() === "admin@creativeventsnordic.com") &&
      (loginPassword === "superadmin123" || loginPassword === "admin123" || loginPassword === "9988")
    ) {
      setIsAuthenticated(true);
      setLoginError(null);
    } else {
      setLoginError("Invalid credentials. Use demo email: superadmin@venueeat.se & password: superadmin123");
    }
  };

  // Quick Demo Auto-Fill & Login
  const handleQuickDemoLogin = () => {
    setLoginEmail("superadmin@venueeat.se");
    setLoginPassword("superadmin123");
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
      organizerEmail: formEmail,
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
    setFormSuccess(`Successfully onboarded "${formName}"! You can now activate it or onboard vendor stalls.`);
    
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

        {/* Demo Credentials Alert Banner */}
        <div className="bg-zinc-900 border-2 border-purple-500/30 rounded-2xl p-4 space-y-2 text-xs">
          <div className="flex justify-between items-center text-purple-300 font-bold font-mono">
            <span className="flex items-center gap-1.5 uppercase text-[10px] tracking-wider">
              <KeyRound className="w-4 h-4 text-purple-400" /> Demo Super Admin Credentials
            </span>
            <span className="text-[10px] bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded font-mono">
              Role: Master Platform
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-zinc-300 font-mono text-[11px] pt-1 border-t border-zinc-800">
            <div>Email: <strong className="text-white">superadmin@venueeat.se</strong></div>
            <div>Password: <strong className="text-white">superadmin123</strong> (or PIN <strong className="text-white">9988</strong>)</div>
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
        <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center border-b-2 border-zinc-100 bg-zinc-50/60 p-2 gap-2">
          <div className="flex gap-1 overflow-x-auto scrollbar-none">
            <button
              onClick={() => setActiveTab("live")}
              className={`flex items-center gap-2 px-5 py-3 rounded-2xl font-display text-xs md:text-sm font-bold transition-all cursor-pointer whitespace-nowrap ${
                activeTab === "live"
                  ? "bg-zinc-900 text-white shadow-md font-black"
                  : "text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100"
              }`}
            >
              <Zap className="w-4 h-4 text-orange-400" />
              Active & Upcoming ({events.filter(e => e.status !== "Completed").length})
            </button>

            <button
              onClick={() => setActiveTab("history")}
              className={`flex items-center gap-2 px-5 py-3 rounded-2xl font-display text-xs md:text-sm font-bold transition-all cursor-pointer whitespace-nowrap ${
                activeTab === "history"
                  ? "bg-zinc-900 text-white shadow-md font-black"
                  : "text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100"
              }`}
            >
              <Archive className="w-4 h-4 text-amber-400" />
              Previous Event History ({historicalEventsCount})
            </button>

            <button
              onClick={() => setActiveTab("create")}
              className={`flex items-center gap-2 px-5 py-3 rounded-2xl font-display text-xs md:text-sm font-bold transition-all cursor-pointer whitespace-nowrap ${
                activeTab === "create"
                  ? "bg-orange-500 text-white shadow-md font-black"
                  : "text-orange-600 hover:bg-orange-50 font-bold"
              }`}
            >
              <Plus className="w-4 h-4" />
              Launch New Event
            </button>
          </div>

          {/* Quick Filter Bar */}
          {activeTab !== "create" && (
            <div className="flex items-center gap-2 px-2 pb-1 sm:pb-0">
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

                {/* Organizer Email */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-zinc-700 block font-mono uppercase tracking-wider">
                    Organizer Contact Email
                  </label>
                  <input
                    type="email"
                    value={formEmail}
                    onChange={(e) => setFormEmail(e.target.value)}
                    className="w-full bg-zinc-50 border-2 border-zinc-200 focus:bg-white focus:border-orange-500 rounded-xl px-3.5 py-2.5 text-xs text-zinc-900 font-semibold transition-all"
                  />
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
                        <div className="pt-2 grid grid-cols-2 gap-2">
                          <button
                            onClick={() => handleSelectEvent(evt.id)}
                            className={`flex items-center justify-center gap-1 py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                              isActive
                                ? "bg-orange-500 text-white shadow-xs"
                                : "bg-zinc-100 hover:bg-zinc-200 text-zinc-800"
                            }`}
                          >
                            {isActive ? "Active in Demo" : "Activate Context"}
                          </button>

                          <button
                            onClick={() => setInspectEvent(evt)}
                            className="flex items-center justify-center gap-1 py-2 px-3 rounded-xl border border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50 text-zinc-700 text-xs font-bold transition-all cursor-pointer"
                          >
                            Inspect Details
                          </button>
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

              <div className="flex items-center gap-2">
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
    </div>
  );
}
