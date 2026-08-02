import React, { useState } from "react";
import { 
  Upload, 
  Image as ImageIcon, 
  RotateCcw, 
  Check, 
  MapPin, 
  Sparkles, 
  Layers, 
  ExternalLink, 
  Building, 
  Compass,
  Edit2,
  Save,
  CheckCircle2
} from "lucide-react";
import { Vendor } from "../types";
import { useApp } from "../context/AppContext";
import EventMap from "./EventMap";

export const AdminMapManager: React.FC = () => {
  const { 
    vendors, 
    eventMapUrl, 
    handleUpdateEventMapUrl, 
    estimateVendorWaitTime,
    handleUpdateVendorProfile,
    setNotification
  } = useApp();

  const [inputUrl, setInputUrl] = useState(eventMapUrl || "");
  const [editingVendorId, setEditingVendorId] = useState<string | null>(null);
  const [tempStallNumber, setTempStallNumber] = useState("");
  const [tempLocation, setTempLocation] = useState("");

  // Preset sample map images for festival organizers
  const presets = [
    {
      name: "Kungsträdgården Interactive Grounds",
      url: "",
      desc: "Interactive vector grounds with fountain, stage lawn, and beer garden"
    },
    {
      name: "Outdoor Festival Blueprint Layout",
      url: "https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1200&q=80",
      desc: "Aerial festival site plan with designated vendor stalls"
    },
    {
      name: "Indoor Arena & Expo Hall Map",
      url: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1200&q=80",
      desc: "Covered exhibition hall with booth grid numbers"
    }
  ];

  // File upload handler converting image file to Data URL
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        alert("Please select a valid image file (PNG, JPG, SVG, or WebP).");
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        if (result) {
          handleUpdateEventMapUrl(result);
          setInputUrl(result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUrlSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputUrl.trim()) {
      handleUpdateEventMapUrl(undefined);
    } else {
      handleUpdateEventMapUrl(inputUrl.trim());
    }
  };

  const handleSaveStallConfig = async (vendor: Vendor) => {
    const updated: Vendor = {
      ...vendor,
      stallNumber: tempStallNumber.trim() || vendor.stallNumber,
      location: tempLocation.trim() || vendor.location
    };
    await handleUpdateVendorProfile(updated);
    setEditingVendorId(null);
    setNotification(`Updated location for ${vendor.name}`);
  };

  const approvedVendors = vendors.filter(v => v.isApproved === true);

  return (
    <div className="space-y-6 text-left animate-fadeIn">
      
      {/* MAP MANAGEMENT HEADER & CONTROL BOARD */}
      <div className="bg-white rounded-3xl border border-zinc-200 p-6 md:p-8 space-y-6 shadow-xs">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-zinc-150 pb-5">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-display font-black text-xl text-zinc-900">Event Map & Venue Blueprint</h3>
              <span className={`text-[10px] font-mono font-black px-2.5 py-0.5 rounded-full uppercase ${
                eventMapUrl ? "bg-orange-100 text-orange-800 border border-orange-200" : "bg-emerald-100 text-emerald-800 border border-emerald-200"
              }`}>
                {eventMapUrl ? "Custom Uploaded Map" : "Vector Interactive Map"}
              </span>
            </div>
            <p className="text-xs text-zinc-500 font-medium mt-1">
              Upload a custom venue layout blueprint or choose a preset map to display food stall locations to attendees.
            </p>
          </div>

          {eventMapUrl && (
            <button
              onClick={() => {
                handleUpdateEventMapUrl(undefined);
                setInputUrl("");
              }}
              className="bg-zinc-100 hover:bg-rose-50 hover:text-rose-700 text-zinc-700 font-bold text-xs px-4 py-2.5 rounded-2xl border border-zinc-200 transition-all cursor-pointer flex items-center gap-1.5 shrink-0"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset to Default Vector Map</span>
            </button>
          )}
        </div>

        {/* MAP INPUT & UPLOAD CONTROLS */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* File Upload Box */}
          <div className="border-2 border-dashed border-zinc-300 hover:border-orange-500 bg-zinc-50/80 hover:bg-orange-50/30 rounded-2xl p-5 text-center transition-all flex flex-col items-center justify-center space-y-3 group cursor-pointer relative">
            <input
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              title="Upload Map Image File"
            />
            <div className="w-12 h-12 rounded-2xl bg-white text-orange-500 border border-zinc-200 flex items-center justify-center shadow-xs group-hover:scale-110 transition-transform">
              <Upload className="w-6 h-6" />
            </div>
            <div>
              <span className="font-display font-black text-xs text-zinc-900 block">
                Upload Custom Map Image / Blueprint
              </span>
              <span className="text-[10px] text-zinc-500 font-mono">
                Supports PNG, JPG, SVG or WebP floorplans
              </span>
            </div>
          </div>

          {/* Direct URL Form */}
          <form onSubmit={handleUrlSubmit} className="space-y-3 bg-zinc-50 border border-zinc-200 rounded-2xl p-5 flex flex-col justify-between">
            <div>
              <label className="font-bold text-xs text-zinc-800 block mb-1 flex items-center justify-between">
                <span>Or Enter Image URL</span>
                <ImageIcon className="w-3.5 h-3.5 text-zinc-400" />
              </label>
              <input
                type="url"
                placeholder="https://example.com/venue-map.png"
                value={inputUrl}
                onChange={(e) => setInputUrl(e.target.value)}
                className="w-full bg-white border border-zinc-200 rounded-xl px-3.5 py-2.5 text-xs text-zinc-900 outline-none focus:ring-2 focus:ring-orange-500 font-mono"
              />
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="submit"
                className="w-full bg-zinc-900 hover:bg-zinc-800 text-white font-display font-black text-xs py-2.5 px-4 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-sm"
              >
                <Check className="w-4 h-4" />
                <span>Apply Map URL</span>
              </button>
            </div>
          </form>
        </div>

        {/* PRESET TEMPLATES CAROUSEL */}
        <div className="space-y-3 pt-2">
          <label className="text-xs font-mono font-bold text-zinc-500 uppercase tracking-wider block">
            Preset Map Layouts
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {presets.map((preset, idx) => {
              const isSelected = eventMapUrl === preset.url || (!eventMapUrl && preset.url === "");
              return (
                <button
                  key={idx}
                  onClick={() => {
                    handleUpdateEventMapUrl(preset.url || undefined);
                    setInputUrl(preset.url);
                  }}
                  className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between space-y-2 ${
                    isSelected 
                      ? "bg-orange-50 border-orange-500 text-orange-950 ring-2 ring-orange-500/20" 
                      : "bg-white border-zinc-200 hover:border-zinc-300 text-zinc-800"
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <span className="font-display font-black text-xs">{preset.name}</span>
                    {isSelected && <CheckCircle2 className="w-4 h-4 text-orange-600 shrink-0" />}
                  </div>
                  <p className="text-[10px] text-zinc-500 leading-relaxed">
                    {preset.desc}
                  </p>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* LIVE EVENT MAP PREVIEW FOR ADMIN */}
      <div className="bg-white rounded-3xl border border-zinc-200 p-6 md:p-8 space-y-4 shadow-xs">
        <div className="flex justify-between items-center border-b border-zinc-150 pb-4">
          <div>
            <h3 className="font-display font-black text-lg text-zinc-900">Live Attendees Map Preview</h3>
            <p className="text-xs text-zinc-500 font-medium">This is exactly how festival attendees view stall locations and queue times.</p>
          </div>
        </div>

        <div className="border border-zinc-200 rounded-2xl overflow-hidden bg-zinc-50 p-2">
          <EventMap 
            vendors={vendors} 
            activeVendorId={vendors[0]?.id || "v1"} 
            onSelectVendor={() => {}} 
            mapImageUrl={eventMapUrl} 
            estimateWaitTime={estimateVendorWaitTime} 
          />
        </div>
      </div>

      {/* FOOD STALL BOOTH LOCATIONS MANAGER */}
      <div className="bg-white rounded-3xl border border-zinc-200 p-6 md:p-8 space-y-4 shadow-xs">
        <div className="flex justify-between items-center border-b border-zinc-150 pb-4">
          <div>
            <h3 className="font-display font-black text-lg text-zinc-900">Stall Booth Assignments & Map Zones</h3>
            <p className="text-xs text-zinc-500 font-medium">Assign stall numbers (e.g., Stall #01) and specific venue zones for live mapping.</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-medium">
            <thead>
              <tr className="border-b border-zinc-200 bg-zinc-50 text-zinc-500 font-mono text-[10px] uppercase tracking-wider">
                <th className="p-3.5 rounded-l-xl">Food Stall</th>
                <th className="p-3.5">Stall Badge ID</th>
                <th className="p-3.5">Map Location Zone</th>
                <th className="p-3.5">Live Queue Status</th>
                <th className="p-3.5 rounded-r-xl text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-150">
              {approvedVendors.map(v => {
                const isEditing = editingVendorId === v.id;
                const wait = estimateVendorWaitTime(v.id);

                return (
                  <tr key={v.id} className="hover:bg-zinc-50/80 transition-colors">
                    <td className="p-3.5">
                      <div className="flex items-center gap-2.5">
                        <span className="text-xl p-1 bg-zinc-100 rounded-lg">{v.logo}</span>
                        <div>
                          <span className="font-display font-bold text-zinc-900 block">{v.name}</span>
                          <span className="text-[10px] text-zinc-500">{v.cuisine}</span>
                        </div>
                      </div>
                    </td>

                    <td className="p-3.5">
                      {isEditing ? (
                        <input
                          type="text"
                          value={tempStallNumber}
                          onChange={(e) => setTempStallNumber(e.target.value)}
                          className="bg-white border border-zinc-300 rounded-lg px-2 py-1 text-xs font-mono font-bold w-28"
                        />
                      ) : (
                        <span className="font-mono font-black text-orange-600 bg-orange-50 px-2 py-1 rounded-md border border-orange-200 text-xs">
                          {v.stallNumber || "Unassigned"}
                        </span>
                      )}
                    </td>

                    <td className="p-3.5">
                      {isEditing ? (
                        <input
                          type="text"
                          value={tempLocation}
                          onChange={(e) => setTempLocation(e.target.value)}
                          className="bg-white border border-zinc-300 rounded-lg px-2 py-1 text-xs w-48"
                        />
                      ) : (
                        <span className="text-zinc-700 font-medium flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                          {v.location}
                        </span>
                      )}
                    </td>

                    <td className="p-3.5 font-mono text-[11px]">
                      <span className="text-zinc-800 font-bold">~{wait.minutes}m wait</span>
                    </td>

                    <td className="p-3.5 text-right">
                      {isEditing ? (
                        <button
                          onClick={() => handleSaveStallConfig(v)}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-3 py-1.5 rounded-xl transition-all flex items-center gap-1 ml-auto cursor-pointer"
                        >
                          <Save className="w-3.5 h-3.5" />
                          <span>Save</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => {
                            setEditingVendorId(v.id);
                            setTempStallNumber(v.stallNumber || "Stall #01");
                            setTempLocation(v.location || "Fountain Square");
                          }}
                          className="bg-zinc-100 hover:bg-zinc-200 text-zinc-700 font-bold text-xs px-3 py-1.5 rounded-xl transition-all flex items-center gap-1 ml-auto cursor-pointer"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                          <span>Edit Zone</span>
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};

export default AdminMapManager;
