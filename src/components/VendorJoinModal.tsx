import React, { useState } from "react";
import { 
  Store, 
  X, 
  CheckCircle2, 
  Sparkles, 
  ArrowRight, 
  ChefHat, 
  UtensilsCrossed, 
  Phone, 
  Mail, 
  Building2,
  ShieldCheck,
  CreditCard,
  Landmark,
  Receipt
} from "lucide-react";
import { Vendor } from "../types";
import { useApp } from "../context/AppContext";

interface VendorJoinModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const VendorJoinModal: React.FC<VendorJoinModalProps> = ({ isOpen, onClose }) => {
  const { handleAddNewVendor, setNotification } = useApp();

  const [stallName, setStallName] = useState("");
  const [cuisine, setCuisine] = useState("");
  const [ownerName, setOwnerName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [swishNumber, setSwishNumber] = useState("123 456 7890");
  const [bankName, setBankName] = useState("SEB (Skandinaviska Enskilda Banken)");
  const [bankAccount, setBankAccount] = useState("1234 56 78901");
  const [clearingNumber, setClearingNumber] = useState("8327");
  const [orgNumber, setOrgNumber] = useState("556987-1234");
  const [payoutMethod, setPayoutMethod] = useState<"Swish" | "Bank" | "Both">("Both");
  const [logoEmoji, setLogoEmoji] = useState("🌮");
  const [location, setLocation] = useState("Kungsträdgården Main Lawn - Zone B");

  const [submittedVendor, setSubmittedVendor] = useState<Vendor | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stallName.trim() || !cuisine.trim() || !ownerName.trim()) {
      alert("Please fill in all required fields (Stall name, cuisine, and contact name).");
      return;
    }

    setIsSubmitting(true);

    const newVendorId = `v_${Date.now()}`;
    const generatedPin = Math.floor(1000 + Math.random() * 9000).toString();

    const newVendor: Vendor = {
      id: newVendorId,
      name: stallName.trim(),
      cuisine: cuisine.trim(),
      logo: logoEmoji || "🍛",
      rating: 5.0,
      location: location,
      pin: generatedPin,
      email: email.trim() || "vendor@venueeat.se",
      phone: phone.trim() || "+46 70 123 4567",
      swishNumber: swishNumber.trim() || "123 456 7890",
      bankName: bankName.trim() || "SEB Bank",
      bankAccount: bankAccount.trim() || "1234 56 78901",
      clearingNumber: clearingNumber.trim() || "8327",
      orgNumber: orgNumber.trim() || "556987-1234",
      payoutMethod: payoutMethod,
      isApproved: true,
      menu: [
        {
          id: `${newVendorId}_m1`,
          name: `Signature ${cuisine.trim()} Special`,
          description: `Freshly prepared chef special dish served hot with signature herbs and spices.`,
          price: 125,
          category: "Food",
          stock: true
        },
        {
          id: `${newVendorId}_m2`,
          name: `Artisanal Side & Dip`,
          description: `Crispy side portion crafted with fresh local ingredients.`,
          price: 55,
          category: "Snack",
          stock: true
        },
        {
          id: `${newVendorId}_m3`,
          name: `Refreshing Event Drink`,
          description: `Cold infused beverage in 500ml eco-cup.`,
          price: 35,
          category: "Drink",
          stock: true
        }
      ]
    };

    try {
      await handleAddNewVendor(newVendor);
      setSubmittedVendor(newVendor);
    } catch (err) {
      console.error("Error creating vendor:", err);
      setNotification("Created stall in local session.");
      setSubmittedVendor(newVendor);
    } finally {
      setIsSubmitting(false);
    }
  };

  const emojiOptions = ["🌮", "🍕", "🍔", "🍣", "🍜", "🍦", "🥗", "🥙", "🍩", "🍹", "☕", "🥩"];

  return (
    <div className="fixed inset-0 z-50 bg-zinc-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-zinc-200 my-auto text-left relative animate-fadeIn">
        
        {/* Header Bar */}
        <div className="bg-zinc-900 text-white p-5 sm:p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-9 h-9 rounded-full bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2.5 text-orange-400 text-xs font-mono font-bold uppercase tracking-wider mb-1">
            <Sparkles className="w-4 h-4 animate-pulse" />
            <span>Partner Platform</span>
          </div>

          <h2 className="text-xl sm:text-2xl font-display font-black text-white tracking-tight flex items-center gap-2">
            Join VenueEat
          </h2>
          <p className="text-zinc-400 text-xs mt-1 leading-relaxed">
            Register your food stall or pop-up kitchen in under 2 minutes. Accept instant Swish payments with automated queue management.
          </p>
        </div>

        {/* Content Body */}
        {submittedVendor ? (
          /* SUCCESS STATE */
          <div className="p-6 text-center space-y-5">
            <div className="w-16 h-16 rounded-3xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto text-3xl shadow-sm border border-emerald-200">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div>
              <span className="inline-block px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold font-mono border border-emerald-200 mb-2">
                Stall Registered & Active!
              </span>
              <h3 className="text-xl font-display font-black text-zinc-900">
                Welcome, {submittedVendor.name}! {submittedVendor.logo}
              </h3>
              <p className="text-zinc-600 text-xs mt-1 max-w-sm mx-auto">
                Your vendor kitchen is live on the VenueEat festival network. You can access your Kitchen Live Dashboard now.
              </p>
            </div>

            {/* Vendor Credentials Card */}
            <div className="bg-zinc-50 border border-zinc-200 rounded-2xl p-4 text-left space-y-2.5">
              <div className="text-xs font-mono font-bold text-zinc-500 uppercase tracking-wider">
                Kitchen Login & Payout Summary
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-zinc-600">Vendor ID:</span>
                <span className="font-mono font-bold text-zinc-900 bg-white px-2 py-1 rounded-lg border border-zinc-200">
                  {submittedVendor.id}
                </span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-zinc-600">Access PIN Code:</span>
                <span className="font-mono font-black text-orange-600 bg-orange-50 px-2 py-1 rounded-lg border border-orange-200">
                  {submittedVendor.pin}
                </span>
              </div>
              <div className="flex justify-between items-center text-xs border-t border-zinc-200/60 pt-2">
                <span className="text-zinc-600">Swish Merchant Payout:</span>
                <span className="font-mono font-bold text-zinc-900">
                  {submittedVendor.swishNumber || "Configured"}
                </span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-zinc-600">Card Payout Bank:</span>
                <span className="font-mono font-bold text-zinc-900">
                  {submittedVendor.bankName || "SEB Bank"}
                </span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-zinc-600">Bank Account / Clearing:</span>
                <span className="font-mono font-bold text-zinc-900">
                  {submittedVendor.clearingNumber ? `${submittedVendor.clearingNumber} - ` : ''}{submittedVendor.bankAccount}
                </span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-zinc-600">Org / Tax ID:</span>
                <span className="font-mono font-bold text-zinc-900">
                  {submittedVendor.orgNumber}
                </span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-2 pt-2">
              <a
                href="/vendor"
                className="flex-1 bg-zinc-900 hover:bg-zinc-800 text-white font-black text-xs py-3 px-4 rounded-xl transition-all text-center flex items-center justify-center gap-2 shadow-sm"
              >
                <span>Go to Vendor Kitchen</span>
                <ArrowRight className="w-4 h-4" />
              </a>
              <button
                onClick={onClose}
                className="bg-zinc-100 hover:bg-zinc-200 text-zinc-700 font-bold text-xs py-3 px-4 rounded-xl transition-all cursor-pointer"
              >
                Close & Browse Menu
              </button>
            </div>
          </div>
        ) : (
          /* FORM STATE */
          <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4 max-h-[70vh] overflow-y-auto">
            
            {/* Stall Name & Icon */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-zinc-700 flex items-center justify-between">
                <span>Food Stall Name *</span>
                <span className="text-[10px] text-zinc-400 font-normal">Displayed on event menu</span>
              </label>
              <div className="flex gap-2">
                {/* Emoji Selector */}
                <div className="relative">
                  <select
                    value={logoEmoji}
                    onChange={(e) => setLogoEmoji(e.target.value)}
                    className="h-11 px-3 bg-zinc-50 border border-zinc-200 rounded-xl text-lg appearance-none cursor-pointer text-center font-emoji focus:ring-2 focus:ring-orange-500 focus:outline-none"
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

            {/* Cuisine Type */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-zinc-700">
                Cuisine / Specialty *
              </label>
              <div className="relative">
                <ChefHat className="w-4 h-4 text-zinc-400 absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  required
                  placeholder="e.g. Authentic Mexican Street Food, Bao Buns, Gelato"
                  value={cuisine}
                  onChange={(e) => setCuisine(e.target.value)}
                  className="w-full h-11 pl-10 pr-3.5 bg-zinc-50 border border-zinc-200 rounded-xl text-xs font-bold text-zinc-900 focus:bg-white focus:ring-2 focus:ring-orange-500 focus:outline-none transition-all"
                />
              </div>
            </div>

            {/* Owner / Contact Name & Email */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-zinc-700">Contact Person *</label>
                <input
                  type="text"
                  required
                  placeholder="Full Name"
                  value={ownerName}
                  onChange={(e) => setOwnerName(e.target.value)}
                  className="w-full h-11 px-3.5 bg-zinc-50 border border-zinc-200 rounded-xl text-xs font-bold text-zinc-900 focus:bg-white focus:ring-2 focus:ring-orange-500 focus:outline-none transition-all"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-zinc-700">Work Email</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-zinc-400 absolute left-3.5 top-3.5" />
                  <input
                    type="email"
                    placeholder="vendor@stall.se"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full h-11 pl-10 pr-3.5 bg-zinc-50 border border-zinc-200 rounded-xl text-xs font-bold text-zinc-900 focus:bg-white focus:ring-2 focus:ring-orange-500 focus:outline-none transition-all"
                  />
                </div>
              </div>
            </div>

            {/* Contact Phone & Location Zone */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-zinc-700">Phone Number *</label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-zinc-400 absolute left-3.5 top-3.5" />
                  <input
                    type="tel"
                    required
                    placeholder="+46 70 000 0000"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full h-11 pl-10 pr-3.5 bg-zinc-50 border border-zinc-200 rounded-xl text-xs font-bold text-zinc-900 focus:bg-white focus:ring-2 focus:ring-orange-500 focus:outline-none transition-all"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-zinc-700">Assigned Venue Zone</label>
                <div className="relative">
                  <Building2 className="w-4 h-4 text-zinc-400 absolute left-3.5 top-3.5" />
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full h-11 pl-10 pr-3.5 bg-zinc-50 border border-zinc-200 rounded-xl text-xs font-medium text-zinc-800 focus:bg-white focus:ring-2 focus:ring-orange-500 focus:outline-none transition-all"
                  />
                </div>
              </div>
            </div>

            {/* FINANCIAL PAYOUT & BANK ACCOUNT DETAILS (FOR CARD & SWISH PAYMENTS) */}
            <div className="bg-gradient-to-br from-zinc-900 to-zinc-950 text-white rounded-2xl p-4.5 space-y-4 border border-zinc-800 shadow-md">
              <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-orange-500/20 text-orange-400 flex items-center justify-center border border-orange-500/30">
                    <Landmark className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-display font-black text-xs text-white uppercase tracking-wide">
                      Revenue Payout & Bank Account
                    </h4>
                    <p className="text-[10px] text-zinc-400">
                      Required for payouts when customers pay by Card, Apple Pay, or Swish.
                    </p>
                  </div>
                </div>
                <span className="text-[9px] font-mono font-bold bg-orange-500/20 text-orange-300 border border-orange-500/30 px-2 py-0.5 rounded-full uppercase">
                  Payout Setup
                </span>
              </div>

              {/* Org Number & Swish Number */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-mono font-bold text-zinc-300 uppercase flex items-center gap-1">
                    <Receipt className="w-3 h-3 text-orange-400" />
                    Org. Number (Org.nr / Tax ID) *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 556987-1234"
                    value={orgNumber}
                    onChange={(e) => setOrgNumber(e.target.value)}
                    className="w-full h-10 px-3 bg-zinc-800/80 border border-zinc-700 rounded-xl text-xs font-mono font-bold text-amber-200 focus:bg-zinc-900 focus:ring-2 focus:ring-orange-500 focus:outline-none transition-all"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-mono font-bold text-zinc-300 uppercase flex items-center gap-1">
                    <CreditCard className="w-3 h-3 text-sky-400" />
                    Swish Handel Number
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 123 456 7890"
                    value={swishNumber}
                    onChange={(e) => setSwishNumber(e.target.value)}
                    className="w-full h-10 px-3 bg-zinc-800/80 border border-zinc-700 rounded-xl text-xs font-mono font-bold text-sky-300 focus:bg-zinc-900 focus:ring-2 focus:ring-orange-500 focus:outline-none transition-all"
                  />
                </div>
              </div>

              {/* Bank Name */}
              <div className="space-y-1">
                <label className="text-[10px] font-mono font-bold text-zinc-300 uppercase flex items-center gap-1">
                  <Landmark className="w-3 h-3 text-emerald-400" />
                  Bank Name (for Card Payment Payouts) *
                </label>
                <select
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                  className="w-full h-10 px-3 bg-zinc-800/80 border border-zinc-700 rounded-xl text-xs font-bold text-white focus:bg-zinc-900 focus:ring-2 focus:ring-orange-500 focus:outline-none transition-all cursor-pointer"
                >
                  <option value="SEB (Skandinaviska Enskilda Banken)">SEB (Skandinaviska Enskilda Banken)</option>
                  <option value="Swedbank">Swedbank</option>
                  <option value="Handelsbanken">Handelsbanken</option>
                  <option value="Nordea">Nordea</option>
                  <option value="Danske Bank">Danske Bank</option>
                  <option value="Länsförsäkringar Bank">Länsförsäkringar Bank</option>
                  <option value="SBAB / Other Swedish Bank">Other Swedish / International Bank</option>
                </select>
              </div>

              {/* Clearing & Account Number / IBAN */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1 sm:col-span-1">
                  <label className="text-[10px] font-mono font-bold text-zinc-300 uppercase">Clearing No.</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 8327"
                    value={clearingNumber}
                    onChange={(e) => setClearingNumber(e.target.value)}
                    className="w-full h-10 px-3 bg-zinc-800/80 border border-zinc-700 rounded-xl text-xs font-mono font-bold text-emerald-300 focus:bg-zinc-900 focus:ring-2 focus:ring-orange-500 focus:outline-none transition-all"
                  />
                </div>

                <div className="space-y-1 sm:col-span-2">
                  <label className="text-[10px] font-mono font-bold text-zinc-300 uppercase">Account Number / IBAN *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 123 456 78901 or SE89 5000 0000 0580"
                    value={bankAccount}
                    onChange={(e) => setBankAccount(e.target.value)}
                    className="w-full h-10 px-3 bg-zinc-800/80 border border-zinc-700 rounded-xl text-xs font-mono font-bold text-emerald-300 focus:bg-zinc-900 focus:ring-2 focus:ring-orange-500 focus:outline-none transition-all"
                  />
                </div>
              </div>

              {/* Info Note on Card Settlement */}
              <div className="bg-zinc-800/90 border border-zinc-700/80 rounded-xl p-2.5 flex items-start gap-2 text-[10.5px] text-zinc-300">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <p className="leading-snug">
                  <strong className="text-white block font-display">Card & Mobile Payout Guarantee:</strong>
                  Revenue from customers paying with Visa, Mastercard, or Apple Pay is pooled and paid out directly to this bank account with automated daily/end-of-event settlement statements.
                </p>
              </div>
            </div>

            {/* Platform Features Pill */}
            <div className="bg-orange-50/70 border border-orange-200/80 rounded-2xl p-3 flex items-center gap-3 text-xs text-orange-900">
              <ShieldCheck className="w-5 h-5 text-orange-600 shrink-0" />
              <div className="leading-tight text-[11px]">
                <span className="font-bold block">Instant Onboarding Benefits</span>
                <span>Direct Swish Handel payouts, kitchen order display, and table QR code generation.</span>
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
                  <span>Registering Stall...</span>
                ) : (
                  <>
                    <Store className="w-4 h-4" />
                    <span>Register My Food Stall</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}

      </div>
    </div>
  );
};

export default VendorJoinModal;
