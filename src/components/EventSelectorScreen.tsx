import React, { useState, useEffect, useMemo } from "react";
import {
  MapPin,
  Calendar,
  Store,
  Users,
  ArrowRight,
  Music,
  UtensilsCrossed,
  ShoppingBag,
  Flame,
  Star,
  Clock,
  Sparkles,
  Search,
  CheckCircle2,
  ShieldCheck,
  Zap,
} from "lucide-react";
import { useApp } from "../context/AppContext";
import { ManagedEvent } from "../types";

/* ─── High-res themed imagery per event / category ───────── */
const EVENT_IMAGES: Record<string, string> = {
  NSF2026:
    "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=1000&auto=format&fit=crop&q=80",
  "evt-001":
    "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=1000&auto=format&fit=crop&q=80",
  TASTE2026:
    "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=1000&auto=format&fit=crop&q=80",
  "evt-002":
    "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=1000&auto=format&fit=crop&q=80",
  LOLL2026:
    "https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=1000&auto=format&fit=crop&q=80",
  "evt-003":
    "https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=1000&auto=format&fit=crop&q=80",
};

const CATEGORY_FALLBACK_IMAGES: Record<string, string> = {
  "Cultural & Food":
    "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=1000&auto=format&fit=crop&q=80",
  "Music Festival":
    "https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=1000&auto=format&fit=crop&q=80",
  "Street Market":
    "https://images.unsplash.com/photo-1509722747041-616f39b57569?w=1000&auto=format&fit=crop&q=80",
  Exhibition:
    "https://images.unsplash.com/photo-1511578314322-379afb476865?w=1000&auto=format&fit=crop&q=80",
  "Sports & Fair":
    "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=1000&auto=format&fit=crop&q=80",
};

function getEventImage(event: ManagedEvent): string {
  return (
    EVENT_IMAGES[event.code] ||
    EVENT_IMAGES[event.id] ||
    CATEGORY_FALLBACK_IMAGES[event.category] ||
    "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=1000&auto=format&fit=crop&q=80"
  );
}

function getCategoryIcon(category: string) {
  switch (category) {
    case "Cultural & Food":
      return <UtensilsCrossed className="w-3.5 h-3.5" />;
    case "Music Festival":
      return <Music className="w-3.5 h-3.5" />;
    case "Street Market":
      return <ShoppingBag className="w-3.5 h-3.5" />;
    case "Sports & Fair":
      return <Flame className="w-3.5 h-3.5" />;
    default:
      return <Star className="w-3.5 h-3.5" />;
  }
}

/* ─── Compact Premium Event Card ───────────────────────── */
const EventCard: React.FC<{
  event: ManagedEvent;
  index: number;
  onSelect: (id: string) => void;
}> = ({ event, index, onSelect }) => {
  const imageUrl = getEventImage(event);

  const formattedDate = new Date(event.startDate).toLocaleDateString("en-SE", {
    month: "short",
    day: "numeric",
  });

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onSelect(event.id)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onSelect(event.id);
        }
      }}
      className="group relative bg-zinc-900 rounded-2xl border border-zinc-800 hover:border-orange-500/60 shadow-md hover:shadow-2xl hover:shadow-orange-950/20 transition-all duration-200 flex flex-col overflow-hidden cursor-pointer text-left select-none transform hover:-translate-y-0.5"
    >
      {/* Compact Header Image Banner */}
      <div className="relative h-28 sm:h-32 w-full overflow-hidden bg-zinc-950 shrink-0">
        <img
          src={imageUrl}
          alt={event.name}
          className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
          referrerPolicy="no-referrer"
          loading="lazy"
        />

        {/* Subtle Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/90 via-zinc-950/30 to-transparent" />

        {/* Top Badges */}
        <div className="absolute top-2 inset-x-2.5 flex items-center justify-between gap-1.5 pointer-events-none">
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wide uppercase bg-black/70 backdrop-blur-md text-white border border-white/20">
            {getCategoryIcon(event.category)}
            <span>{event.category}</span>
          </span>

          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-500 text-white shadow-xs">
            <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
            Live
          </span>
        </div>

        {/* Location & Date bottom tag over image */}
        <div className="absolute bottom-2 inset-x-2.5 flex items-center justify-between text-white text-[11px] font-medium pointer-events-none">
          <div className="flex items-center gap-1 bg-black/70 backdrop-blur-md px-2 py-0.5 rounded-md border border-white/15 max-w-[65%] truncate">
            <MapPin className="w-3 h-3 text-orange-400 shrink-0" />
            <span className="truncate">{event.location.split(",")[0]}</span>
          </div>

          <div className="flex items-center gap-1 bg-black/70 backdrop-blur-md px-2 py-0.5 rounded-md border border-white/15 font-mono text-[10px]">
            <Calendar className="w-2.5 h-2.5 text-zinc-300" />
            <span>{formattedDate}</span>
          </div>
        </div>
      </div>

      {/* Card Content */}
      <div className="p-3.5 sm:p-4 flex-1 flex flex-col justify-between space-y-3">
        <div className="space-y-1">
          {/* Title - clearly visible in bold high-contrast white text */}
          <h3 className="font-display font-black text-base sm:text-lg text-white group-hover:text-orange-400 transition-colors leading-snug line-clamp-2">
            {event.name}
          </h3>

          {/* Description */}
          <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed">
            {event.description}
          </p>
        </div>

        {/* Compact Stats Row */}
        <div className="grid grid-cols-3 gap-1.5 py-1.5 px-2 bg-zinc-950/80 rounded-xl border border-zinc-800 text-center">
          <div>
            <div className="font-black text-xs sm:text-sm text-white leading-none">
              {event.activeVendorsCount}
            </div>
            <div className="text-[9px] font-mono text-zinc-400 mt-1 uppercase tracking-wider">
              Stalls
            </div>
          </div>

          <div className="border-x border-zinc-800">
            <div className="font-black text-xs sm:text-sm text-zinc-200 leading-none">
              ~{event.averagePrepTimeMin || 6}m
            </div>
            <div className="text-[9px] font-mono text-zinc-400 mt-1 uppercase tracking-wider">
              Wait
            </div>
          </div>

          <div className="flex flex-col items-center justify-center">
            <div className="font-black text-xs sm:text-sm text-amber-400 leading-none flex items-center justify-center gap-0.5">
              <Star className="w-3 h-3 fill-amber-400 stroke-amber-500" />
              <span>{event.satisfactionRating?.toFixed(1) || "4.9"}</span>
            </div>
            <div className="text-[9px] font-mono text-zinc-400 mt-1 uppercase tracking-wider">
              Rating
            </div>
          </div>
        </div>

        {/* Primary Enter Action Button */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onSelect(event.id);
          }}
          className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl font-bold text-xs text-white bg-zinc-800 border border-zinc-700/80 group-hover:bg-orange-600 group-hover:border-transparent active:scale-[0.98] transition-all duration-150 cursor-pointer shadow-xs group-hover:shadow-orange-500/20"
        >
          <Zap className="w-3.5 h-3.5 text-orange-400 group-hover:text-white transition-colors" />
          <span>Enter Festival</span>
          <ArrowRight className="w-3.5 h-3.5 ml-auto transform group-hover:translate-x-0.5 transition-transform" />
        </button>
      </div>
    </div>
  );
};

/* ─── Main Event Selector Portal ──────────────────────── */
export const EventSelectorScreen: React.FC = () => {
  const { managedEvents, setSelectedUserEventId } = useApp();
  const [searchFilter, setSearchFilter] = useState("");

  // Only show Live events to attendees
  const liveEvents = useMemo(() => {
    return managedEvents.filter((e) => e.status === "Live");
  }, [managedEvents]);

  const filteredEvents = useMemo(() => {
    if (!searchFilter.trim()) return liveEvents;
    const q = searchFilter.toLowerCase();
    return liveEvents.filter(
      (e) =>
        e.name.toLowerCase().includes(q) ||
        e.location.toLowerCase().includes(q) ||
        e.category.toLowerCase().includes(q)
    );
  }, [liveEvents, searchFilter]);

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 relative overflow-hidden flex flex-col justify-between selection:bg-orange-500 selection:text-white">
      {/* Subtle Ambient Backing Glow */}
      <div className="absolute top-0 inset-x-0 h-96 bg-gradient-to-b from-orange-600/15 via-orange-950/5 to-transparent pointer-events-none" />
      <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[650px] h-[350px] bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Header Hero */}
      <div className="relative z-10 max-w-5xl mx-auto w-full px-4 pt-8 sm:pt-10 pb-6 text-center space-y-3">
        {/* Brand Tag */}
        <div className="inline-flex items-center gap-2 bg-zinc-900/90 border border-zinc-800 text-zinc-300 text-[10px] sm:text-[11px] font-mono font-bold uppercase tracking-widest px-3.5 py-1 rounded-full shadow-inner">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>Stockholm Event Food Portal</span>
        </div>

        {/* Hero Title */}
        <div className="space-y-1.5">
          <h1 className="font-display font-black text-2xl sm:text-3xl md:text-4xl text-white tracking-tight leading-tight">
            Which festival are you{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-amber-300 to-orange-200">
              attending today?
            </span>
          </h1>
          <p className="text-zinc-400 text-xs sm:text-sm max-w-lg mx-auto leading-relaxed">
            Select your event below to browse on-site food stalls, customize orders, and pick up your meals without standing in long queues.
          </p>
        </div>

        {/* Quick Search & Summary Row */}
        {liveEvents.length > 1 && (
          <div className="max-w-md mx-auto pt-1">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
              <input
                type="text"
                placeholder="Search event by name, cuisine, or venue..."
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-zinc-900/80 border border-zinc-800 rounded-xl text-xs sm:text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:border-orange-500/60 transition-colors shadow-inner"
              />
            </div>
          </div>
        )}
      </div>

      {/* Event Cards Section */}
      <div className="relative z-10 flex-1 max-w-6xl mx-auto w-full px-4 pb-10">
        {filteredEvents.length === 0 ? (
          <div className="bg-zinc-900/70 border border-zinc-800 rounded-2xl p-8 text-center max-w-md mx-auto my-6">
            <div className="w-10 h-10 rounded-xl bg-zinc-800 text-zinc-400 flex items-center justify-center mx-auto mb-2.5">
              <Calendar className="w-5 h-5" />
            </div>
            <h3 className="font-display font-bold text-white text-base mb-1">
              No matching live events
            </h3>
            <p className="text-zinc-400 text-xs">
              {searchFilter
                ? `No active events match "${searchFilter}". Try clearing your search.`
                : "There are currently no active live events open for mobile ordering."}
            </p>
            {searchFilter && (
              <button
                onClick={() => setSearchFilter("")}
                className="mt-3 text-xs font-bold text-orange-400 hover:text-orange-300 underline cursor-pointer"
              >
                Clear Search Filter
              </button>
            )}
          </div>
        ) : (
          <div
            className={`grid gap-4 ${
              filteredEvents.length === 1
                ? "grid-cols-1 max-w-sm mx-auto"
                : filteredEvents.length === 2
                ? "grid-cols-1 sm:grid-cols-2 max-w-2xl mx-auto"
                : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
            }`}
          >
            {filteredEvents.map((event, index) => (
              <EventCard
                key={event.id}
                event={event}
                index={index}
                onSelect={setSelectedUserEventId}
              />
            ))}
          </div>
        )}

        {/* Feature Trust Badges Footer */}
        <div className="mt-10 pt-6 border-t border-zinc-800/80 max-w-2xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-3 text-center text-zinc-400 text-[11px]">
          <div className="flex items-center justify-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Instant Swish &amp; Card Pay</span>
          </div>
          <div className="flex items-center justify-center gap-2">
            <Zap className="w-4 h-4 text-orange-400 shrink-0" />
            <span>Live SMS / App Pick-up Alerts</span>
          </div>
          <div className="flex items-center justify-center gap-2">
            <ShieldCheck className="w-4 h-4 text-sky-400 shrink-0" />
            <span>Skatteverket Tax Compliant</span>
          </div>
        </div>
      </div>

      {/* Bottom Subtext */}
      <footer className="relative z-10 py-4 text-center text-zinc-600 text-[11px] font-mono">
        VenueEat Stockholm · Outdoor Queue Automation &amp; Mobile Pre-Ordering
      </footer>
    </div>
  );
};

export default EventSelectorScreen;

