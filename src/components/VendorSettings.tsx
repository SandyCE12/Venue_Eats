import React, { useState, useEffect } from "react";
import { Vendor } from "../types";
import { Settings, Save, AlertCircle, Phone, Info, MapPin, Key, Mail, Sparkles } from "lucide-react";

interface VendorSettingsProps {
  vendor: Vendor;
  onUpdateVendorProfile: (vendorId: string, updatedFields: Partial<Vendor>) => Promise<void>;
}

export default function VendorSettings({ vendor, onUpdateVendorProfile }: VendorSettingsProps) {
  const [name, setName] = useState(vendor.name || "");
  const [cuisine, setCuisine] = useState(vendor.cuisine || "");
  const [location, setLocation] = useState(vendor.location || "");
  const [stallNumber, setStallNumber] = useState(vendor.stallNumber || "");
  const [swishNumber, setSwishNumber] = useState(vendor.swishNumber || "");
  const [pin, setPin] = useState(vendor.pin || "");
  const [email, setEmail] = useState(vendor.email || "");
  const [logo, setLogo] = useState(vendor.logo || "🍛");
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Sync state if active vendor changes in parent
  useEffect(() => {
    setName(vendor.name || "");
    setCuisine(vendor.cuisine || "");
    setLocation(vendor.location || "");
    setStallNumber(vendor.stallNumber || "");
    setSwishNumber(vendor.swishNumber || "");
    setPin(vendor.pin || "");
    setEmail(vendor.email || "");
    setLogo(vendor.logo || "🍛");
    setError(null);
    setSuccess(false);
  }, [vendor]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (!name.trim()) {
      setError("Stall/Vendor Name is required.");
      return;
    }
    if (!swishNumber.trim()) {
      setError("Swish Payout Number is required so payments can route to your account.");
      return;
    }
    if (!pin.trim() || pin.length < 4) {
      setError("A 4-digit security PIN is required.");
      return;
    }

    setIsSaving(true);
    try {
      await onUpdateVendorProfile(vendor.id, {
        name: name.trim(),
        cuisine: cuisine.trim(),
        location: location.trim(),
        stallNumber: stallNumber.trim(),
        swishNumber: swishNumber.trim(),
        pin: pin.trim(),
        email: email.trim().toLowerCase(),
        logo
      });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 4000);
    } catch (err: any) {
      setError(err.message || "Failed to update profile settings.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="bg-zinc-900 border-2 border-zinc-800 rounded-3xl p-6 shadow-xl animate-fadeIn text-left max-w-3xl mx-auto">
      <div className="flex items-center justify-between border-b border-zinc-800 pb-4 mb-5">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-orange-500/10 text-orange-400 rounded-2xl border border-orange-500/20">
            <Settings className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-black uppercase tracking-wider text-white">Stall Profile Settings</h2>
            <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider font-mono">
              Configure payments, location, and authentication credentials
            </p>
          </div>
        </div>
        <div className="text-2xl">{logo}</div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Swish Payout Section - Highlighted & Crucial */}
        <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-2xl p-4 space-y-3">
          <div className="flex items-center gap-2 text-emerald-400">
            <Phone className="w-4 h-4" />
            <h3 className="text-xs font-black uppercase tracking-wider">Swish Handel Integration</h3>
          </div>
          <p className="text-[10.5px] text-zinc-300 leading-relaxed font-medium">
            This Swish phone number is used for <strong>real-time, split payouts</strong>. When customers pay via Swish, Stockholm organizers route funds directly to the account tied to this Swish number, minus the commission fee.
          </p>
          
          <div className="space-y-1.5 pt-1">
            <label className="text-[10px] text-emerald-300 font-bold uppercase tracking-wider font-mono block">
              Active Swish Payout Number
            </label>
            <input
              type="text"
              placeholder="e.g., 123 456 78 90"
              value={swishNumber}
              onChange={(e) => setSwishNumber(e.target.value)}
              className="w-full bg-zinc-950 border-2 border-zinc-800 focus:border-emerald-500 rounded-xl px-4 py-3 text-sm font-mono text-emerald-300 font-black tracking-widest focus:outline-none transition-all"
              required
            />
          </div>
        </div>

        {/* General Details Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider font-mono">Stall / Food Truck Name</label>
            <input
              type="text"
              placeholder="Delhi Street Sensation"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 focus:border-orange-500 rounded-xl px-3.5 py-2.5 text-xs text-zinc-100 font-bold focus:outline-none"
              required
            />
          </div>
          
          <div className="space-y-1.5">
            <label className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider font-mono">Cuisine Specialty</label>
            <input
              type="text"
              placeholder="e.g., South Indian Fast Food"
              value={cuisine}
              onChange={(e) => setCuisine(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 focus:border-orange-500 rounded-xl px-3.5 py-2.5 text-xs text-zinc-100 font-bold focus:outline-none"
              required
            />
          </div>
        </div>

        {/* Location & Contact Info */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <label className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider font-mono">Festival Location</label>
            <div className="relative">
              <span className="absolute left-3 top-3 text-zinc-500">
                <MapPin className="w-3.5 h-3.5" />
              </span>
              <input
                type="text"
                placeholder="e.g., Kungsträdgården Fountain Square"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 focus:border-orange-500 rounded-xl pl-9 pr-3.5 py-2.5 text-xs text-zinc-100 font-bold focus:outline-none"
                required
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] text-orange-400 font-bold uppercase tracking-wider font-mono flex items-center gap-1">
              <span>Stall Number / Booth ID</span>
              <span className="text-[9px] bg-orange-500/20 text-orange-300 px-1 rounded">Required</span>
            </label>
            <div className="relative">
              <span className="absolute left-3 top-3 text-orange-500/70 font-mono text-xs font-bold">#</span>
              <input
                type="text"
                placeholder="e.g., Stall #12 or Booth A4"
                value={stallNumber}
                onChange={(e) => setStallNumber(e.target.value)}
                className="w-full bg-zinc-950 border-2 border-orange-500/40 focus:border-orange-500 rounded-xl pl-8 pr-3.5 py-2.5 text-xs text-white font-mono font-bold focus:outline-none shadow-sm"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider font-mono">Email Address</label>
            <div className="relative">
              <span className="absolute left-3 top-3 text-zinc-500">
                <Mail className="w-3.5 h-3.5" />
              </span>
              <input
                type="email"
                placeholder="e.g., info@dosahub.se"
                value={email}
                disabled // Keep locked for authentication security
                className="w-full bg-zinc-950/60 border border-zinc-850 rounded-xl pl-9 pr-3.5 py-2.5 text-xs text-zinc-400 font-bold cursor-not-allowed focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Security and Logo options */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider font-mono">Security Login PIN (4 Digits)</label>
            <div className="relative">
              <span className="absolute left-3 top-3 text-zinc-500">
                <Key className="w-3.5 h-3.5" />
              </span>
              <input
                type="password"
                maxLength={4}
                placeholder="e.g., 1111"
                value={pin}
                onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
                className="w-full bg-zinc-950 border border-zinc-800 focus:border-orange-500 rounded-xl pl-9 pr-3.5 py-2.5 text-xs font-mono tracking-widest text-orange-400 font-black focus:outline-none"
                required
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider font-mono">Stall Icon Emoji</label>
            <select
              value={logo}
              onChange={(e) => setLogo(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 focus:border-orange-500 rounded-xl px-3.5 py-2.5 text-xs text-zinc-200 font-bold focus:outline-none cursor-pointer"
            >
              <option value="🍛">🍛 Curry / Thali</option>
              <option value="🦁">🦁 Samosa / Lion</option>
              <option value="🥥">🥥 South Indian Coconut</option>
              <option value="🧁">🧁 Sweets / Dessert</option>
              <option value="🫓">🫓 Naan / Roti</option>
              <option value="☕">☕ Masala Chai</option>
              <option value="🥗">🥗 Salad / Chaat</option>
              <option value="🍗">🍗 Tandoori Chicken</option>
            </select>
          </div>
        </div>

        {/* Alerts */}
        {error && (
          <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-2xl text-xs font-bold leading-relaxed flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-2xl text-xs font-bold leading-relaxed flex items-start gap-2 animate-fadeIn">
            <Sparkles className="w-4 h-4 shrink-0 mt-0.5 text-emerald-400 animate-pulse" />
            <span>✓ Stall Profile updated! Changes synced instantly.</span>
          </div>
        )}

        {/* Submit */}
        <div className="pt-2 flex justify-end">
          <button
            type="submit"
            disabled={isSaving}
            className="bg-emerald-600 hover:bg-emerald-700 disabled:bg-zinc-800 active:scale-95 text-white font-black py-3 px-6 rounded-2xl text-xs transition-all shadow-lg flex items-center gap-1.5 cursor-pointer uppercase tracking-wider border-b-2 border-emerald-500"
          >
            <Save className="w-4 h-4" />
            {isSaving ? "Saving Settings..." : "Save Changes"}
          </button>
        </div>
      </form>
    </div>
  );
}
