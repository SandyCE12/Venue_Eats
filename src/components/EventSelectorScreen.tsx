import React, { useState, useEffect } from "react";
import {
  MapPin,
  Calendar,
  Store,
  Users,
  Zap,
  ArrowRight,
  Music,
  UtensilsCrossed,
  ShoppingBag,
  Flame,
  Star,
  Clock,
} from "lucide-react";
import { useApp } from "../context/AppContext";
import { ManagedEvent } from "../types";

/* ─── Category config ─────────────────────────────────── */
const CATEGORY_CONFIG: Record<
  string,
  {
    gradient: string;
    accentColor: string;
    badgeBg: string;
    badgeText: string;
    icon: React.ReactNode;
  }
> = {
  "Cultural & Food": {
    gradient: "from-emerald-500 via-teal-500 to-green-600",
    accentColor: "#16a34a",
    badgeBg: "bg-emerald-50 border-emerald-200",
    badgeText: "text-emerald-800",
    icon: <UtensilsCrossed className="w-3.5 h-3.5" />,
  },
  "Music Festival": {
    gradient: "from-violet-500 via-purple-500 to-fuchsia-600",
    accentColor: "#7c3aed",
    badgeBg: "bg-purple-50 border-purple-200",
    badgeText: "text-purple-800",
    icon: <Music className="w-3.5 h-3.5" />,
  },
  "Street Market": {
    gradient: "from-teal-500 via-emerald-500 to-cyan-600",
    accentColor: "#0d9488",
    badgeBg: "bg-teal-50 border-teal-200",
    badgeText: "text-teal-800",
    icon: <ShoppingBag className="w-3.5 h-3.5" />,
  },
  Exhibition: {
    gradient: "from-sky-500 via-blue-500 to-indigo-600",
    accentColor: "#0284c7",
    badgeBg: "bg-sky-50 border-sky-200",
    badgeText: "text-sky-800",
    icon: <Star className="w-3.5 h-3.5" />,
  },
  "Sports & Fair": {
    gradient: "from-amber-500 via-orange-500 to-rose-600",
    accentColor: "#ea580c",
    badgeBg: "bg-amber-50 border-amber-200",
    badgeText: "text-amber-800",
    icon: <Flame className="w-3.5 h-3.5" />,
  },
};

const DEFAULT_CATEGORY = CATEGORY_CONFIG["Cultural & Food"];

function getCategoryConfig(category: string) {
  return CATEGORY_CONFIG[category] ?? DEFAULT_CATEGORY;
}

/* ─── Single Event Card ────────────────────────────────── */
interface EventCardProps {
  event: ManagedEvent;
  index: number;
  onSelect: (id: string) => void;
}

const EventCard: React.FC<EventCardProps> = ({ event, index, onSelect }) => {
  const [visible, setVisible] = useState(false);
  const cfg = getCategoryConfig(event.category);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 60 + index * 90);
    return () => clearTimeout(t);
  }, [index]);

  const formattedDate = (() => {
    const d = new Date(event.startDate);
    return d.toLocaleDateString("en-SE", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  })();

  return (
    <div
      onClick={() => onSelect(event.id)}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(20px)",
        transition: `opacity 0.4s ease ${index * 0.06}s, transform 0.4s cubic-bezier(0.16,1,0.3,1) ${index * 0.06}s`,
      }}
      className="group relative flex flex-col h-full bg-white rounded-3xl border border-zinc-200/90 shadow-sm hover:shadow-xl hover:shadow-emerald-950/15 hover:border-emerald-500/40 transition-all duration-300 overflow-hidden cursor-pointer text-left"
    >
      {/* Top accent bar */}
      <div className={`h-1.5 w-full bg-gradient-to-r ${cfg.gradient}`} />

      {/* Main card content area */}
      <div className="flex-1 flex flex-col justify-between p-6 pb-4">
        <div>
          {/* Top meta tags: Category badge + Live indicator */}
          <div className="flex items-center justify-between gap-2 mb-3.5">
            <div
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-[11px] font-bold uppercase tracking-wider ${cfg.badgeBg} ${cfg.badgeText}`}
            >
              {cfg.icon}
              <span>{event.category}</span>
            </div>

            <div className="inline-flex items-center gap-1.5 bg-emerald-50 border border-emerald-200 text-emerald-700 px-2.5 py-1 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>LIVE</span>
            </div>
          </div>

          {/* Event Name */}
          <h3 className="font-display font-black text-xl text-zinc-900 leading-snug tracking-tight group-hover:text-emerald-700 transition-colors line-clamp-2 min-h-[3.25rem] flex items-center">
            {event.name}
          </h3>

          {/* Location */}
          <div className="flex items-center gap-1.5 text-zinc-500 text-xs mt-1.5 font-medium">
            <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span className="truncate">{event.location}</span>
          </div>
        </div>

        {/* Stats Grid - 3 equal columns */}
        <div className="mt-5 pt-4 border-t border-zinc-100 grid grid-cols-3 gap-2.5">
          <div className="bg-zinc-50/80 rounded-2xl p-2.5 text-center border border-zinc-100/80 flex flex-col justify-center items-center">
            <div className="flex items-center justify-center text-zinc-400 mb-1">
              <Store className="w-3.5 h-3.5 text-emerald-600" />
            </div>
            <div className="font-mono font-black text-sm text-zinc-900 leading-tight">
              {event.activeVendorsCount}
            </div>
            <div className="text-[9px] font-mono font-bold text-zinc-400 mt-0.5 uppercase tracking-wider">
              Stalls
            </div>
          </div>

          <div className="bg-zinc-50/80 rounded-2xl p-2.5 text-center border border-zinc-100/80 flex flex-col justify-center items-center">
            <div className="flex items-center justify-center text-zinc-400 mb-1">
              <Users className="w-3.5 h-3.5 text-emerald-600" />
            </div>
            <div className="font-mono font-black text-sm text-zinc-900 leading-tight">
              {event.attendeesCount >= 1000
                ? `${(event.attendeesCount / 1000).toFixed(0)}k`
                : event.attendeesCount}
            </div>
            <div className="text-[9px] font-mono font-bold text-zinc-400 mt-0.5 uppercase tracking-wider">
              Attendees
            </div>
          </div>

          <div className="bg-zinc-50/80 rounded-2xl p-2.5 text-center border border-zinc-100/80 flex flex-col justify-center items-center">
            <div className="flex items-center justify-center text-zinc-400 mb-1">
              <Clock className="w-3.5 h-3.5 text-emerald-600" />
            </div>
            <div className="font-mono font-black text-sm text-zinc-900 leading-tight">
              ~{event.averagePrepTimeMin ?? 6}m
            </div>
            <div className="text-[9px] font-mono font-bold text-zinc-400 mt-0.5 uppercase tracking-wider">
              Avg Wait
            </div>
          </div>
        </div>

        {/* Date */}
        <div className="mt-3.5 flex items-center gap-1.5 text-xs text-zinc-400 font-mono">
          <Calendar className="w-3.5 h-3.5 text-zinc-400" />
          <span>{formattedDate}</span>
        </div>
      </div>

      {/* Button section pinned to the bottom of the card */}
      <div className="p-6 pt-0 mt-auto">
        <button
          type="button"
          className="w-full bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] text-white font-display font-black text-sm py-3.5 px-4 rounded-2xl transition-all shadow-md shadow-emerald-600/20 group-hover:shadow-lg group-hover:shadow-emerald-600/30 cursor-pointer flex items-center justify-center gap-2 border-b-2 border-emerald-700"
        >
          <Zap className="w-4 h-4" />
          <span>Enter Event</span>
          <ArrowRight className="w-4 h-4 ml-auto group-hover:translate-x-1 transition-transform" />
        </button>
      </div>
    </div>
  );
};

/* ─── Main Screen ──────────────────────────────────────── */
export const EventSelectorScreen: React.FC = () => {
  const { managedEvents, setSelectedUserEventId } = useApp();
  const [headerVisible, setHeaderVisible] = useState(false);

  const liveEvents = managedEvents.filter((e) => e.status === "Live");

  useEffect(() => {
    const t = setTimeout(() => setHeaderVisible(true), 40);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="min-h-screen bg-zinc-950 relative overflow-hidden flex flex-col justify-between">
      {/* ── Ambient background elements ── */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div
          className="absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full opacity-20"
          style={{
            background:
              "radial-gradient(circle, #16a34a 0%, #059669 40%, transparent 70%)",
            animation: "blobFloat1 9s ease-in-out infinite",
          }}
        />
        <div
          className="absolute -bottom-60 -right-40 w-[550px] h-[550px] rounded-full opacity-15"
          style={{
            background:
              "radial-gradient(circle, #0d9488 0%, #15803d 40%, transparent 70%)",
            animation: "blobFloat2 11s ease-in-out infinite",
          }}
        />
        <div
          className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[800px] h-[400px] opacity-[0.03]"
          style={{
            background: "radial-gradient(ellipse, #ffffff 0%, transparent 65%)",
          }}
        />
        {/* Subtle grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.4) 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />
      </div>

      {/* ── Header ── */}
      <div
        className="relative z-10 text-center pt-12 md:pt-16 pb-8 px-4 sm:px-6"
        style={{
          opacity: headerVisible ? 1 : 0,
          transform: headerVisible ? "translateY(0)" : "translateY(-16px)",
          transition: "opacity 0.5s ease, transform 0.5s cubic-bezier(0.16,1,0.3,1)",
        }}
      >
        {/* Logo mark */}
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-green-600 shadow-2xl shadow-emerald-500/30 mb-4 border border-emerald-400/20">
          <UtensilsCrossed className="w-7 h-7 text-white" />
        </div>

        <div className="flex items-center justify-center mb-3">
          <div className="inline-flex items-center gap-2 bg-emerald-950/60 border border-emerald-500/30 text-emerald-300 text-[11px] font-mono font-bold uppercase tracking-widest px-3.5 py-1 rounded-full backdrop-blur-md">
            <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
            <span>VenueEat · Live Event Portal</span>
          </div>
        </div>

        <h1 className="font-display font-black text-3xl sm:text-4xl md:text-5xl text-white tracking-tight leading-tight mb-2.5">
          Which event are{" "}
          <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-green-300 bg-clip-text text-transparent">
            you attending?
          </span>
        </h1>
        <p className="text-zinc-400 text-sm sm:text-base max-w-md mx-auto leading-relaxed">
          Select your live festival or venue below to browse menu stalls, place quick mobile orders &amp; skip the queue.
        </p>
      </div>

      {/* ── Event cards container ── */}
      <div className="relative z-10 flex-1 px-4 sm:px-6 pb-12 max-w-4xl mx-auto w-full flex flex-col justify-center">
        {liveEvents.length === 0 ? (
          /* Empty state */
          <div
            className="text-center py-16 bg-zinc-900/60 rounded-3xl border border-zinc-800 p-8 max-w-md mx-auto"
            style={{
              opacity: headerVisible ? 1 : 0,
              transition: "opacity 0.5s ease 0.2s",
            }}
          >
            <div className="w-14 h-14 rounded-2xl bg-zinc-800 border border-zinc-700 flex items-center justify-center mx-auto mb-3 text-zinc-400">
              <Calendar className="w-7 h-7" />
            </div>
            <h3 className="text-white font-display font-black text-lg mb-1.5">No Live Events Right Now</h3>
            <p className="text-zinc-400 text-xs leading-relaxed">
              There are no active events at this moment. Scheduled events will automatically appear here once their status becomes live.
            </p>
          </div>
        ) : (
          <div
            className={`grid gap-6 items-stretch ${
              liveEvents.length === 1
                ? "grid-cols-1 max-w-md mx-auto w-full"
                : "grid-cols-1 md:grid-cols-2"
            }`}
          >
            {liveEvents.map((event, i) => (
              <EventCard
                key={event.id}
                event={event}
                index={i}
                onSelect={setSelectedUserEventId}
              />
            ))}
          </div>
        )}

        {/* Bottom footer note */}
        {liveEvents.length > 0 && (
          <p
            className="text-center text-zinc-500 text-xs font-mono mt-8"
            style={{
              opacity: headerVisible ? 1 : 0,
              transition: "opacity 0.5s ease 0.4s",
            }}
          >
            Select a card to enter the event · Powered by VenueEat
          </p>
        )}
      </div>

      {/* Keyframe styles */}
      <style>{`
        @keyframes blobFloat1 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(25px, -15px) scale(1.04); }
          66% { transform: translate(-12px, 12px) scale(0.98); }
        }
        @keyframes blobFloat2 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          40% { transform: translate(-20px, 15px) scale(1.06); }
          70% { transform: translate(15px, -8px) scale(0.96); }
        }
      `}</style>
    </div>
  );
};

export default EventSelectorScreen;

