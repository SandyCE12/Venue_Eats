import React from "react";
import { useApp } from "../context/AppContext";
import { RealAuthGate } from "../components/RealAuthGate";
import SuperAdminConsole from "../components/SuperAdminConsole";
import { LogOut, ShieldCheck } from "lucide-react";

export const SuperAdminPage: React.FC = () => {
  const {
    managedEvents,
    activeEventId,
    setActiveEventId,
    handleUpdateEventStatus,
    handleAddNewEvent,
    isSuperAdminAuthenticated,
    setIsSuperAdminAuthenticated
  } = useApp();

  if (!isSuperAdminAuthenticated) {
    return (
      <RealAuthGate
        title="VenueEat Super Admin Console"
        description="Sign in with master platform owner credentials to oversee multi-festival platform management, commission fees, and system settings."
        portalRole="superadmin"
        onSuccess={() => setIsSuperAdminAuthenticated(true)}
      />
    );
  }

  return (
    <div className="space-y-6 text-left pb-16 animate-fadeIn">
      
      {/* SUPER ADMIN HEADER */}
      <div className="bg-zinc-950 text-white rounded-3xl p-6 md:p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-xl border border-zinc-800">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="font-display font-black text-2xl tracking-tight">VenueEat Nordic Platform Command Center</h2>
            <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full uppercase flex items-center gap-1">
              <ShieldCheck className="w-3 h-3" /> Master Admin Active
            </span>
          </div>
          <p className="text-xs text-zinc-400 font-medium mt-1">
            Managing multi-event festivals across Stockholm, Gothenburg & Malmö.
          </p>
        </div>

        <button
          onClick={() => setIsSuperAdminAuthenticated(false)}
          className="bg-zinc-900 hover:bg-zinc-800 text-zinc-300 font-bold text-xs px-4 py-2.5 rounded-2xl border border-zinc-800 transition-all cursor-pointer flex items-center gap-1.5"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Exit Super Admin</span>
        </button>
      </div>

      <SuperAdminConsole
        managedEvents={managedEvents}
        activeEventId={activeEventId}
        onSelectEvent={setActiveEventId}
        onUpdateEventStatus={handleUpdateEventStatus}
        onAddNewEvent={handleAddNewEvent}
        onUpdateEventMap={() => {}}
      />
    </div>
  );
};
