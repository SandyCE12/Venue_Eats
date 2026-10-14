import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { 
  Store, 
  X, 
  CheckCircle2, 
  Sparkles, 
  ChefHat, 
  Phone, 
  Mail, 
  ShieldCheck,
  CreditCard,
  Calendar,
  MapPin,
  Clock,
  ArrowRight
} from "lucide-react";
import { VendorApplication } from "../types";
import { useApp } from "../context/AppContext";

interface VendorJoinModalProps {
  isOpen: boolean;
  onClose: () => void;
  eventId?: string;
}

export const VendorJoinModal: React.FC<VendorJoinModalProps> = ({ isOpen, onClose, eventId }) => {
  const { managedEvents, handleSubmitVendorApplication, setNotification } = useApp();

  const [selectedEventId, setSelectedEventId] = useState<string>(eventId || managedEvents[0]?.id || "evt-001");
  const [stallName, setStallName] = useState("");
  const [cuisine, setCuisine] = useState("");
  const [ownerName, setOwnerName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [swishNumber, setSwishNumber] = useState("123 456 7890");
  const [logoEmoji, setLogoEmoji] = useState("🌮");
  const [description, setDescription] = useState("");

  const [submittedApplication, setSubmittedApplication] = useState<VendorApplication | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Sync selectedEventId if eventId prop changes
  useEffect(() => {
    if (eventId) {
      setSelectedEventId(eventId);
    } else if (managedEvents.length > 0 && !selectedEventId) {
      setSelectedEventId(managedEvents[0].id);
    }
  }, [eventId, managedEvents]);

  // Lock body scroll when modal is open and restore on close
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = "unset";
      };
    } else {
      document.body.style.overflow = "unset";
      // Reset submission screen when modal is closed
      setSubmittedApplication(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const currentSelectedEvent = managedEvents.find(e => e.id === selectedEventId) || managedEvents[0];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stallName.trim() || !cuisine.trim() || !email.trim() || !ownerName.trim()) {
      alert("Please fill in all required fields (Stall name, cuisine, email, and contact name).");
      return;
    }

    setIsSubmitting(true);

    const appData = {
      eventId: currentSelectedEvent?.id || "evt-001",
      eventName: currentSelectedEvent?.name || "Festival Event",
      stallName: stallName.trim(),
      cuisine: cuisine.trim(),
      email: email.trim().toLowerCase(),
      swishNumber: swishNumber.trim() || "123 456 7890",
      phone: phone.trim() || undefined,
      contactName: ownerName.trim() || undefined,
      logo: logoEmoji || "🍛",
      description: description.trim() || undefined
    };

    try {
      await handleSubmitVendorApplication(appData);
      setSubmittedApplication({
        ...appData,
        id: `app_${Date.now()}`,
        status: "pending",
        submittedAt: Date.now()
      });
      // Clear form inputs
      setStallName("");
      setCuisine("");
      setOwnerName("");
      setEmail("");
      setPhone("");
      setDescription("");
    } catch (err: any) {
      console.error("Error submitting vendor application:", err);
      setNotification("Failed to submit application. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const emojiOptions = ["🌮", "🍕", "🍔", "🍣", "🍜", "🍦", "🥗", "🥙", "🍩", "🍹", "☕", "🥩", "🍛", "🥨", "🥞", "🥘"];

  return createPortal(
    <div 
      className="fixed inset-0 z-[9999] bg-zinc-950/80 backdrop-blur-md flex flex-col justify-end sm:justify-center items-center p-0 sm:p-4 overflow-hidden"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div 
        className="bg-white rounded-t-3xl sm:rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border-t sm:border border-zinc-200 text-left relative flex flex-col max-h-[90vh] sm:max-h-[85vh] animate-fadeIn"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Header Bar */}
        <div className="shrink-0 bg-zinc-900 text-white p-5 sm:p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-9 h-9 rounded-full bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2.5 text-orange-400 text-xs font-mono font-bold uppercase tracking-wider mb-1">
            <Sparkles className="w-4 h-4 animate-pulse" />
            <span>Festival Vendor Application</span>
          </div>

          <h2 className="text-xl sm:text-2xl font-display font-black text-white tracking-tight flex items-center gap-2">
            Apply to Become a Vendor
          </h2>
          <p className="text-zinc-400 text-xs mt-1 leading-relaxed">
            Select your festival, submit your food stall profile, and the event organizers will review your application to issue your kitchen terminal login credentials.
          </p>
        </div>

        {/* Content Body */}
        {submittedApplication ? (
          /* SUCCESS STATE */
          <div className="p-6 text-center space-y-5 flex-1 overflow-y-auto animate-fadeIn">
            <div className="w-16 h-16 rounded-3xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto text-3xl shadow-sm border border-emerald-200">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div>
              <span className="inline-block px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold font-mono border border-emerald-200 mb-2">
                Application Received!
              </span>
              <h3 className="text-xl font-display font-black text-zinc-900">
                Application Submitted! {submittedApplication.logo}
              </h3>
              <p className="text-zinc-600 text-xs mt-1 max-w-sm mx-auto leading-relaxed">
                Thank you! Your application for <strong>{submittedApplication.stallName}</strong> has been routed directly to the event administration of <strong>{submittedApplication.eventName}</strong>.
              </p>
            </div>

            {/* Application Details Summary */}
            <div className="bg-zinc-50 border border-zinc-200 rounded-2xl p-4 text-left space-y-2.5 text-xs">
              <div className="text-[10px] font-mono font-bold text-zinc-500 uppercase tracking-wider border-b border-zinc-200 pb-1.5 flex items-center justify-between">
                <span>Application Summary</span>
                <span className="text-amber-600 font-bold flex items-center gap-1">
                  <Clock className="w-3 h-3" /> Under Review
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-zinc-600">Festival Event:</span>
                <span className="font-bold text-zinc-900">{submittedApplication.eventName}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-zinc-600">Stall / Cuisine:</span>
                <span className="font-bold text-zinc-900">{submittedApplication.stallName} ({submittedApplication.cuisine})</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-zinc-600">Credentials Target Email:</span>
                <span className="font-mono font-bold text-sky-700 break-all">{submittedApplication.email}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-zinc-600">Swish Payout Number:</span>
                <span className="font-mono font-bold text-zinc-900">{submittedApplication.swishNumber}</span>
              </div>
            </div>

            {/* Next Steps Card */}
            <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-4 text-left space-y-1 text-xs text-amber-900">
              <p className="font-bold flex items-center gap-1.5 text-amber-800">
                <ShieldCheck className="w-4 h-4 text-amber-600" />
                What happens next?
              </p>
              <p className="text-[11px] text-zinc-600 leading-relaxed">
                The event admin will review your food stall details in their administration portal. Once approved, you will receive an invitation email at <strong>{submittedApplication.email}</strong> containing your secure password to log into the <strong>Kitchen Terminal (/vendor)</strong> and configure your dishes and Swedish bank payout details.
              </p>
            </div>

            <div className="pt-2">
              <button
                onClick={onClose}
                className="w-full bg-zinc-900 hover:bg-zinc-800 text-white font-display font-black text-xs py-3.5 px-4 rounded-xl transition-all cursor-pointer shadow-md"
              >
                Done &amp; Return to Festival
              </button>
            </div>
          </div>
        ) : (
          /* FORM STATE */
          <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4 flex-1 overflow-y-auto text-left">
            
            {/* Step 1: Festival Selection */}
            <div className="bg-orange-50/60 border border-orange-200/80 rounded-2xl p-3.5 space-y-2">
              <label className="text-xs font-bold text-orange-950 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-orange-600" />
                  Select Festival Event *
                </span>
                <span className="text-[10px] text-orange-700 font-normal">Choose target venue</span>
              </label>

              <select
                value={selectedEventId}
                onChange={(e) => setSelectedEventId(e.target.value)}
                className="w-full bg-white border border-orange-300 focus:border-orange-500 rounded-xl px-3 py-2.5 text-xs font-bold text-zinc-900 outline-none cursor-pointer"
              >
                {managedEvents.map(evt => (
                  <option key={evt.id} value={evt.id}>
                    {evt.name} ({evt.location})
                  </option>
                ))}
              </select>

              {currentSelectedEvent && (
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] font-mono text-zinc-600 pt-0.5">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-orange-600" />
                    {currentSelectedEvent.location}
                  </span>
                  <span>•</span>
                  <span>Dates: {currentSelectedEvent.startDate} {currentSelectedEvent.endDate ? `to ${currentSelectedEvent.endDate}` : ""}</span>
                </div>
              )}
            </div>

            {/* Step 2: Food Stall Name & Emoji Icon */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-zinc-700 flex items-center justify-between">
                <span>Food Stall Name *</span>
                <span className="text-[10px] text-zinc-400 font-normal">Brand / Booth name</span>
              </label>
              <div className="flex gap-2">
                <div className="relative">
                  <select
                    value={logoEmoji}
                    onChange={(e) => setLogoEmoji(e.target.value)}
                    className="h-11 px-3 bg-zinc-50 border border-zinc-200 rounded-xl text-lg appearance-none cursor-pointer text-center font-emoji focus:ring-2 focus:ring-orange-500 focus:outline-none"
                    title="Select brand icon"
                  >
                    {emojiOptions.map(emoji => (
                      <option key={emoji} value={emoji}>{emoji}</option>
                    ))}
                  </select>
                </div>
                <input
                  type="text"
                  required
                  placeholder="e.g. Stockholm Taco Truck"
                  value={stallName}
                  onChange={(e) => setStallName(e.target.value)}
                  className="flex-1 h-11 px-3.5 bg-zinc-50 border border-zinc-200 rounded-xl text-xs font-bold text-zinc-900 focus:bg-white focus:ring-2 focus:ring-orange-500 focus:outline-none transition-all"
                />
              </div>
            </div>

            {/* Cuisine Specialty */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-zinc-700">
                Cuisine / Specialty *
              </label>
              <div className="relative">
                <ChefHat className="w-4 h-4 text-zinc-400 absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  required
                  placeholder="e.g. Mexican Street Eats, Bao Buns, Artisanal Burgers"
                  value={cuisine}
                  onChange={(e) => setCuisine(e.target.value)}
                  className="w-full h-11 pl-10 pr-3.5 bg-zinc-50 border border-zinc-200 rounded-xl text-xs font-bold text-zinc-900 focus:bg-white focus:ring-2 focus:ring-orange-500 focus:outline-none transition-all"
                />
              </div>
            </div>

            {/* Official Email */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-zinc-700 flex items-center justify-between">
                <span>Official Business Email *</span>
                <span className="text-[10px] text-zinc-400 font-normal">Credentials delivery address</span>
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-zinc-400 absolute left-3.5 top-3.5" />
                <input
                  type="email"
                  required
                  placeholder="e.g. manager@tacotruck.se"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full h-11 pl-10 pr-3.5 bg-zinc-50 border border-zinc-200 rounded-xl text-xs font-bold text-zinc-900 focus:bg-white focus:ring-2 focus:ring-orange-500 focus:outline-none transition-all"
                />
              </div>
              <p className="text-[10px] text-zinc-500">
                Your Kitchen Terminal login credentials will be emailed here once your application is approved.
              </p>
            </div>

            {/* Contact Person & Phone */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-zinc-700">Contact Person *</label>
                <input
                  type="text"
                  required
                  placeholder="Full Name / Head Chef"
                  value={ownerName}
                  onChange={(e) => setOwnerName(e.target.value)}
                  className="w-full h-11 px-3.5 bg-zinc-50 border border-zinc-200 rounded-xl text-xs font-bold text-zinc-900 focus:bg-white focus:ring-2 focus:ring-orange-500 focus:outline-none transition-all"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-zinc-700">Phone Number</label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-zinc-400 absolute left-3.5 top-3.5" />
                  <input
                    type="tel"
                    placeholder="+46 70 000 0000"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full h-11 pl-10 pr-3.5 bg-zinc-50 border border-zinc-200 rounded-xl text-xs font-bold text-zinc-900 focus:bg-white focus:ring-2 focus:ring-orange-500 focus:outline-none transition-all"
                  />
                </div>
              </div>
            </div>

            {/* Swish Merchant Number */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-zinc-700 flex items-center justify-between">
                <span>Swish Merchant Number (Swishnummer)</span>
                <span className="text-[10px] text-zinc-400 font-normal">For attendee payments</span>
              </label>
              <div className="relative">
                <CreditCard className="w-4 h-4 text-zinc-400 absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  placeholder="e.g. 123 456 7890"
                  value={swishNumber}
                  onChange={(e) => setSwishNumber(e.target.value)}
                  className="w-full h-11 pl-10 pr-3.5 bg-zinc-50 border border-zinc-200 rounded-xl text-xs font-bold text-zinc-900 focus:bg-white focus:ring-2 focus:ring-orange-500 focus:outline-none transition-all font-mono"
                />
              </div>
            </div>

            {/* Stall Description / Notes */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-zinc-700 flex items-center justify-between">
                <span>Stall Concept &amp; Special Dishes</span>
                <span className="text-[10px] text-zinc-400 font-normal">Optional</span>
              </label>
              <textarea
                rows={2}
                placeholder="Tell the event organizers about your specialty dishes, booth setup, electrical requirements, etc."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full p-3 bg-zinc-50 border border-zinc-200 rounded-xl text-xs text-zinc-900 focus:bg-white focus:ring-2 focus:ring-orange-500 focus:outline-none transition-all resize-none"
              />
            </div>

            {/* Platform Notice */}
            <div className="bg-orange-50/70 border border-orange-200/80 rounded-2xl p-3 flex items-center gap-3 text-xs text-orange-900">
              <ShieldCheck className="w-5 h-5 text-orange-600 shrink-0" />
              <div className="leading-tight text-[11px]">
                <span className="font-bold block">Organized Review Workflow</span>
                <span>Applications are reviewed by the {currentSelectedEvent?.name || "festival"} administrator. No live stall is published until approved.</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-2 flex items-center gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-3 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 font-bold text-xs rounded-xl transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 bg-orange-500 hover:bg-orange-600 active:scale-98 text-white font-display font-black text-xs py-3 px-4 rounded-xl transition-all cursor-pointer shadow-md shadow-orange-500/20 flex items-center justify-center gap-2 border-b-2 border-orange-600"
              >
                {isSubmitting ? (
                  <span>Submitting Application...</span>
                ) : (
                  <>
                    <Store className="w-4 h-4" />
                    <span>Submit Vendor Application</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}

      </div>
    </div>,
    document.body
  );
};

export default VendorJoinModal;
