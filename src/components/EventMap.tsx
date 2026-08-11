import React, { useState } from "react";
import { Vendor } from "../types";
import { MapPin, Clock, Star, Landmark, Navigation, HelpCircle, Eye, Compass } from "lucide-react";

interface EventMapProps {
  vendors: Vendor[];
  activeVendorId: string;
  onSelectVendor: (id: string) => void;
  onBackToMenu?: () => void;
  mapImageUrl?: string;
  estimateWaitTime?: (vendorId: string) => {
    minutes: number;
    activeCount: number;
    congestionLevel: string;
    colorClass: string;
  };
}

export default function EventMap({
  vendors,
  activeVendorId,
  onSelectVendor,
  onBackToMenu,
  mapImageUrl,
  estimateWaitTime = () => ({
    minutes: 5,
    activeCount: 2,
    congestionLevel: "Fast",
    colorClass: "text-emerald-600 bg-emerald-50 border-emerald-200"
  })
}: EventMapProps) {
  const [selectedPinId, setSelectedPinId] = useState<string | null>(activeVendorId || null);

  const getBadgeColor = (congestionLevel: string) => {
    if (congestionLevel === "Fast") return "bg-emerald-50 text-emerald-700 border border-emerald-200";
    if (congestionLevel === "Moderate") return "bg-amber-50 text-amber-700 border border-amber-200";
    return "bg-rose-50 text-rose-700 border border-rose-200";
  };

  const getPinPulseColor = (congestionLevel: string) => {
    if (congestionLevel === "Fast") return "bg-emerald-500 animate-pulse";
    if (congestionLevel === "Moderate") return "bg-amber-500";
    return "bg-rose-500 animate-ping";
  };

  // Filter approved vendors only
  const approvedVendors = vendors.filter(v => v.isApproved === true);

  // Pre-defined coordinate coordinates (percentage of width/height) for default vendors
  // Newly added vendors can be placed dynamically on a neat circular path around the fountain.
  const getVendorCoordinates = (id: string, index: number) => {
    const coords: { [key: string]: { x: number; y: number; zone: string } } = {
      v1: { x: 50, y: 52, zone: "Fountain Square Central" }, // Center
      v2: { x: 28, y: 22, zone: "Main Stage Grass Lawn" }, // Top Left
      v3: { x: 75, y: 72, zone: "Beer Garden & Lounge" }, // Bottom Right
      v4: { x: 70, y: 30, zone: "Palace Walkway East" }  // Top Right
    };

    if (coords[id]) {
      return coords[id];
    }

    // Dynamic placement for registered vendors so they don't overlap
    const angle = (index * 60 * Math.PI) / 180;
    const r = 25; // radius
    const x = 50 + r * Math.cos(angle);
    const y = 52 + r * Math.sin(angle);
    return {
      x: Math.max(15, Math.min(85, x)),
      y: Math.max(15, Math.min(85, y)),
      zone: `Zone ${String.fromCharCode(65 + (index % 4))} Pop-Up Area`
    };
  };

  const selectedVendor = approvedVendors.find(v => v.id === selectedPinId) || approvedVendors[0];
  const waitInfo = selectedVendor ? estimateWaitTime(selectedVendor.id) : null;

  return (
    <div className="flex-1 flex flex-col justify-between px-3 pt-1 overflow-hidden animate-fadeIn h-full">
      {/* Map Header */}
      <div className="flex justify-between items-center border-b border-zinc-200/60 pb-2 shrink-0">
        <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1 font-mono">
          <Compass className="w-3.5 h-3.5 text-orange-500 animate-spin-slow" /> Interactive Event Map
        </span>
        <button
          onClick={onBackToMenu}
          className="text-[10px] text-orange-600 font-black hover:underline uppercase tracking-wider cursor-pointer font-mono"
        >
          Back to Menu
        </button>
      </div>

      {/* Interactive Map Visual */}
      <div className="flex-1 relative bg-emerald-50/50 border-2 border-emerald-150 rounded-2xl overflow-hidden my-2 min-h-[200px] sm:min-h-[260px] shadow-inner select-none touch-manipulation">
        
        {/* Custom Uploaded Map Image OR Default Park SVG Layout */}
        {mapImageUrl ? (
          <div className="absolute inset-0 w-full h-full">
            <img 
              src={mapImageUrl} 
              alt="Uploaded Event Venue Map" 
              className="w-full h-full object-cover" 
            />
            {/* Subtle dark overlay so white pins stand out cleanly */}
            <div className="absolute inset-0 bg-black/10 pointer-events-none" />
          </div>
        ) : (
          <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            {/* Grass / Lawn Area */}
            <rect x="0" y="0" width="100" height="100" fill="#f0fbf4" />
            
            {/* Central Avenue Path */}
            <path d="M 50,0 L 50,100" stroke="#e2e8f0" strokeWidth="12" strokeLinecap="round" opacity="0.8" />
            <path d="M 0,52 L 100,52" stroke="#e2e8f0" strokeWidth="10" strokeLinecap="round" opacity="0.8" />
            
            {/* Central Fountain Circle */}
            <circle cx="50" cy="52" r="14" fill="#e0f2fe" stroke="#bae6fd" strokeWidth="1.5" />
            <circle cx="50" cy="52" r="8" fill="#bae6fd" stroke="#7dd3fc" strokeWidth="1.5" opacity="0.6" />
            <circle cx="50" cy="52" r="3" fill="#38bdf8" />
            
            {/* Main Stage (Top Area) */}
            <rect x="15" y="4" width="22" height="10" rx="2" fill="#1e293b" />
            <path d="M 15,14 L 37,14" stroke="#475569" strokeWidth="1" />
            
            {/* Seating / Beer Garden Area (Bottom Right) */}
            <rect x="68" y="76" width="24" height="18" rx="3" fill="#fef3c7" stroke="#fde68a" strokeWidth="1" />
            
            {/* Entrance Gates */}
            <line x1="0" y1="52" x2="6" y2="52" stroke="#ef4444" strokeWidth="2.5" />

            {/* Interactive SVG Food Booth Grounds & Walkway Outlines */}
            {approvedVendors.map((v, idx) => {
              const { x, y } = getVendorCoordinates(v.id, idx);
              const isActive = selectedPinId === v.id;
              const stallBadge = v.stallNumber || `Stall #${idx + 1}`;

              return (
                <g 
                  key={`booth_${v.id}`}
                  onClick={() => setSelectedPinId(v.id)}
                  className="cursor-pointer group touch-manipulation"
                >
                  {/* Invisible enlarged hit pad for touch */}
                  <rect
                    x={x - 12}
                    y={y - 12}
                    width={24}
                    height={24}
                    fill="transparent"
                  />
                  {/* Booth Pad Outline */}
                  <rect
                    x={x - 8}
                    y={y - 8}
                    width={16}
                    height={16}
                    rx={3}
                    fill={isActive ? "#dcfce7" : "#ffffff"}
                    stroke={isActive ? "#16a34a" : "#cbd5e1"}
                    strokeWidth={isActive ? 1.8 : 1}
                    className="transition-all duration-300"
                  />
                  {/* Roof stripe accent */}
                  <rect
                    x={x - 8}
                    y={y - 8}
                    width={16}
                    height={4}
                    rx={1}
                    fill={isActive ? "#16a34a" : "#0f172a"}
                    opacity={isActive ? 1 : 0.8}
                  />
                  {/* Stall ID Text on SVG Ground */}
                  <text
                    x={x}
                    y={y + 5}
                    textAnchor="middle"
                    fontSize="3"
                    fontWeight="bold"
                    fill={isActive ? "#166534" : "#475569"}
                    fontFamily="monospace"
                  >
                    {stallBadge.replace("Stall ", "")}
                  </text>
                </g>
              );
            })}
          </svg>
        )}

        {/* Dynamic Map Grid Label Accents */}
        {!mapImageUrl && (
          <>
            <div className="absolute top-2 left-2 text-[8px] sm:text-[9px] bg-zinc-900/10 text-zinc-600 font-mono font-bold px-1.5 py-0.5 rounded uppercase pointer-events-none">
              Stage Lawn
            </div>
            <div className="absolute bottom-2 right-2 text-[8px] sm:text-[9px] bg-zinc-900/10 text-zinc-600 font-mono font-bold px-1.5 py-0.5 rounded uppercase pointer-events-none">
              Beer Garden
            </div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-[26px] text-[8px] sm:text-[9px] bg-sky-500/10 text-sky-700 font-mono font-bold px-1.5 py-0.5 rounded-full uppercase pointer-events-none">
              Fountain
            </div>
          </>
        )}

        {/* Dynamic Vendor Pins */}
        {approvedVendors.map((v, idx) => {
          const { x, y } = getVendorCoordinates(v.id, idx);
          const isActive = selectedPinId === v.id;
          const wait = estimateWaitTime(v.id);
          const stallBadge = v.stallNumber || `Stall #${idx + 1}`;

          return (
            <button
              key={v.id}
              onClick={() => setSelectedPinId(v.id)}
              style={{ left: `${x}%`, top: `${y}%` }}
              className="absolute transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center group z-20 cursor-pointer focus:outline-none touch-manipulation p-2 -m-2 active:scale-95"
              aria-label={`Select ${v.name}, ${stallBadge}`}
            >
              {/* Tooltip on hover/active */}
              <div className="absolute bottom-full mb-1.5 hidden group-hover:flex sm:group-hover:flex flex-col items-center pointer-events-none z-30">
                <div className="bg-zinc-950 text-white text-[8px] font-black rounded-lg py-1 px-1.5 shadow-lg whitespace-nowrap flex items-center gap-1">
                  <span>{v.logo}</span>
                  <span className="text-orange-400 font-mono font-black">[{stallBadge}]</span>
                  <span>{v.name.split(" ")[0]}</span>
                  <span className="text-zinc-400 font-mono">({wait.minutes}m)</span>
                </div>
                <div className="w-1.5 h-1.5 bg-zinc-950 rotate-45 -mt-1" />
              </div>

              {/* Pin design */}
              <div 
                className={`relative p-2 sm:p-1.5 rounded-full shadow-md transition-all duration-300 min-w-[36px] min-h-[36px] sm:min-w-[32px] sm:min-h-[32px] flex items-center justify-center ${
                  isActive 
                    ? "bg-orange-500 text-white scale-125 ring-4 ring-orange-500/20 z-30" 
                    : "bg-white text-zinc-800 hover:scale-110 border border-zinc-300/80"
                }`}
              >
                <span className="text-xs sm:text-[11px] leading-none block">{v.logo}</span>
                
                {/* Micro wait-time light */}
                <span 
                  className={`absolute -top-0.5 -right-0.5 w-2.5 h-2.5 sm:w-2 sm:h-2 rounded-full border border-white ${
                    getPinPulseColor(wait.congestionLevel)
                  }`}
                  style={{ animationDuration: "2s" }}
                />
              </div>

              {/* Label below pin with Stall Number */}
              <span className={`text-[8px] sm:text-[7px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-zinc-900/90 text-white mt-1 border border-zinc-800 scale-95 flex items-center gap-0.5 ${
                isActive ? "bg-orange-600 border-orange-500 font-black text-amber-200" : ""
              }`}>
                <span className="text-orange-300 font-mono font-black">{stallBadge}</span>
              </span>
            </button>
          );
        })}
      </div>

      {/* Selected Vendor Info Banner */}
      {selectedVendor ? (
        <div className="bg-white border-2 border-zinc-200 p-2.5 rounded-2xl text-left space-y-2 shrink-0 animate-fadeIn shadow-xs">
          <div className="flex justify-between items-start gap-1">
            <div className="flex gap-2 items-center min-w-0">
              <span className="text-xl shrink-0 p-1 bg-zinc-50 rounded-lg">{selectedVendor.logo}</span>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <h4 className="text-[10.5px] font-black text-zinc-800 uppercase tracking-tight truncate leading-tight">
                    {selectedVendor.name}
                  </h4>
                  {selectedVendor.stallNumber && (
                    <span className="bg-orange-500 text-white text-[8px] font-black px-1.5 py-0.2 rounded font-mono shadow-xs">
                      {selectedVendor.stallNumber}
                    </span>
                  )}
                </div>
                <p className="text-[8.5px] text-zinc-400 font-semibold truncate leading-none mt-0.5">
                  {selectedVendor.cuisine}
                </p>
              </div>
            </div>
            
            {waitInfo && (
              <span className={`text-[8px] font-mono font-black px-1.5 py-0.5 rounded uppercase shrink-0 ${getBadgeColor(waitInfo.congestionLevel)}`}>
                {waitInfo.congestionLevel} Queue
              </span>
            )}
          </div>

          <div className="grid grid-cols-2 gap-1.5 text-[8.5px] text-zinc-500 font-medium bg-zinc-50 p-1.5 rounded-xl border border-zinc-100">
            <div className="flex items-center gap-1 font-semibold truncate">
              <MapPin className="w-3 h-3 text-zinc-400 shrink-0" />
              <span>{selectedVendor.stallNumber ? `${selectedVendor.stallNumber} • ` : ""}{getVendorCoordinates(selectedVendor.id, approvedVendors.indexOf(selectedVendor)).zone}</span>
            </div>
            <div className="flex items-center gap-1 font-semibold font-mono justify-end text-zinc-700">
              <Clock className="w-3 h-3 text-orange-500 shrink-0" />
              <span>~{waitInfo?.minutes}m wait ({waitInfo?.activeCount} in line)</span>
            </div>
          </div>

          {/* Quick Menu Item Preview for Clicked Stall */}
          {selectedVendor.menu && selectedVendor.menu.length > 0 && (
            <div className="space-y-1.5 bg-amber-50/50 p-2.5 rounded-xl border border-amber-200/60">
              <div className="flex justify-between items-center text-[9px] font-mono font-bold text-amber-900 uppercase tracking-wider">
                <span>Stall Menu Preview ({selectedVendor.menu.length} items)</span>
                <span className="text-orange-600 font-bold flex items-center gap-1">
                  Tap to view item ➔
                </span>
              </div>
              <div className="space-y-1.5 max-h-28 overflow-y-auto pr-1 scrollbar-thin">
                {selectedVendor.menu.slice(0, 3).map((item) => (
                  <div 
                    key={item.id}
                    onClick={() => {
                      onSelectVendor(selectedVendor.id);
                      onBackToMenu?.();
                    }}
                    className="flex justify-between items-center bg-white p-2.5 sm:p-2 rounded-xl border border-amber-100/80 hover:border-orange-400 active:bg-orange-50 active:scale-[0.99] cursor-pointer transition-all touch-manipulation min-h-[44px] shadow-2xs"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="font-bold text-zinc-900 text-xs sm:text-[10px] truncate">{item.name}</span>
                      {item.category && (
                        <span className="text-[8px] sm:text-[7px] font-mono font-black bg-orange-100 text-orange-800 px-1.5 py-0.5 rounded uppercase shrink-0">
                          {item.category}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0 ml-2">
                      <span className="font-mono font-black text-zinc-900 text-xs sm:text-[10px]">{item.price} kr</span>
                      <span className="text-orange-500 font-bold text-xs">›</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex gap-1.5 pt-0.5">
            <button
              onClick={() => {
                onSelectVendor(selectedVendor.id);
                onBackToMenu?.();
              }}
              className="flex-1 bg-orange-500 hover:bg-orange-600 active:scale-98 active:bg-orange-600 text-white font-mono font-black text-xs sm:text-[10px] py-3 sm:py-2.5 rounded-xl uppercase tracking-wider text-center transition-all shadow-md cursor-pointer border-b-2 border-orange-600 touch-manipulation min-h-[44px] flex items-center justify-center gap-1.5"
            >
              <span>Open Full Menu & Order</span>
              <span>🍛</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-zinc-100 border border-zinc-200 text-zinc-400 p-3 rounded-2xl text-[9px] font-bold text-center leading-relaxed">
          No live food vendors registered yet.
        </div>
      )}
    </div>
  );
}
