import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Fingerprint, 
  Check, 
  X, 
  Smartphone, 
  User, 
  Phone, 
  Shield, 
  Lock, 
  CheckCircle2, 
  Loader2,
  Info,
  ArrowRightLeft,
  CreditCard,
  Wallet,
  ShieldCheck
} from "lucide-react";

interface SwishPaymentGatewayProps {
  isOpen: boolean;
  onClose: () => void;
  amount: number;
  vendorName: string;
  vendorSwishNumber?: string;
  customerName: string;
  onCustomerNameChange: (name: string) => void;
  onPaymentSuccess: (finalCustomerName: string, vendorSwishPaid: number, platformSwishPaid: number, paymentMethod?: string) => void;
  nextQueueNumber: number;
}

type PaymentStep = "details" | "bankid" | "signing" | "success";
type PaymentMethod = "swish" | "card" | "applepay";

export default function SwishPaymentGateway({
  isOpen,
  onClose,
  amount,
  vendorName,
  vendorSwishNumber = "123 918 27 36",
  customerName,
  onCustomerNameChange,
  onPaymentSuccess,
  nextQueueNumber
}: SwishPaymentGatewayProps) {
  const [step, setStep] = useState<PaymentStep>("details");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("swish");
  const [phoneNumber, setPhoneNumber] = useState("070-123 45 67");
  const [validationError, setValidationError] = useState<string | null>(null);
  const [pin, setPin] = useState<string>("");
  const [confetti, setConfetti] = useState<{ id: number; x: number; y: number; color: string; size: number; delay: number }[]>([]);

  // Card payment form state
  const [cardNumber, setCardNumber] = useState("4532 8912 3456 7890");
  const [cardExpiry, setCardExpiry] = useState("08/28");
  const [cardCvc, setCardCvc] = useState("382");
  const [cardHolder, setCardHolder] = useState(customerName || "");

  // Sync cardholder name when customerName changes
  useEffect(() => {
    if (customerName && !cardHolder) {
      setCardHolder(customerName);
    }
  }, [customerName, cardHolder]);

  // Split Commission Calculation
  // Service fee of VenueEat (3.5% fee) is added on top of the menu price.
  const platformFee = Math.round(amount * 0.035 * 100) / 100;
  const vendorShare = Math.round(amount * 100) / 100;
  const totalAmount = Math.round((amount + platformFee) * 100) / 100;

  // Reset state when opened
  useEffect(() => {
    if (isOpen) {
      setStep("details");
      setPin("");
      setValidationError(null);
    }
  }, [isOpen]);

  // Generate confetti items for success screen
  useEffect(() => {
    if (step === "success") {
      const colors = ["#4ade80", "#60a5fa", "#f472b6", "#fbbf24", "#a78bfa", "#f87171"];
      const items = Array.from({ length: 35 }).map((_, i) => ({
        id: i,
        x: Math.random() * 100 - 50, // deviation from center
        y: Math.random() * -120 - 30, // shoot upwards
        color: colors[Math.floor(Math.random() * colors.length)],
        size: Math.random() * 8 + 6,
        delay: Math.random() * 0.4
      }));
      setConfetti(items);
    }
  }, [step]);

  if (!isOpen) return null;

  const validateSwedishSwish = (numberStr: string) => {
    // Strip all non-digit characters
    let digits = numberStr.replace(/\D/g, "");
    
    // Normalize Swedish country code e.g. 46701234567 -> 0701234567
    if (digits.startsWith("467") && digits.length === 11) {
      digits = "0" + digits.substring(2);
    }
    
    // Swedish Swish numbers are exactly 10 digits and must start with either '07' or '123'
    return digits.length === 10 && (digits.startsWith("07") || digits.startsWith("123"));
  };

  const handleOpenBankID = () => {
    if (!customerName.trim()) {
      onCustomerNameChange("Guest Guestson");
    }
    
    if (!validateSwedishSwish(phoneNumber)) {
      setValidationError("Vänligen ange ett giltigt 10-siffrigt svenskt Swish-nummer (t.ex. 07X-XXX XX XX eller 123 XXX XX XX).");
      return;
    }

    setValidationError(null);
    setStep("bankid");
  };

  const handleCardPay = () => {
    if (!customerName.trim() && cardHolder) {
      onCustomerNameChange(cardHolder);
    } else if (!customerName.trim()) {
      onCustomerNameChange("Card Customer");
    }

    if (cardNumber.replace(/\s/g, "").length < 12) {
      setValidationError("Vänligen ange ett giltigt kortnummer (16 siffror).");
      return;
    }

    setValidationError(null);
    setStep("signing");
    setTimeout(() => {
      setStep("success");
      onPaymentSuccess(customerName || cardHolder || "Card Customer", vendorShare, platformFee, "Card");
    }, 2200);
  };

  const handleApplePay = () => {
    if (!customerName.trim()) {
      onCustomerNameChange("Apple Pay User");
    }
    setStep("signing");
    setTimeout(() => {
      setStep("success");
      onPaymentSuccess(customerName || "Apple Pay User", vendorShare, platformFee, "Apple Pay");
    }, 1800);
  };

  const handleKeyPress = (num: string) => {
    if (pin.length < 6) {
      const newPin = pin + num;
      setPin(newPin);
      
      // Auto-submit once 6 digits are entered
      if (newPin.length === 6) {
        setStep("signing");
        setTimeout(() => {
          setStep("success");
          onPaymentSuccess(customerName || "Guest User", vendorShare, platformFee, "Swish");
        }, 2200);
      }
    }
  };

  const handleDeletePin = () => {
    setPin(prev => prev.slice(0, -1));
  };

  const handleQuickBiometric = () => {
    setPin("******");
    setStep("signing");
    setTimeout(() => {
      setStep("success");
      onPaymentSuccess(customerName || "Guest User", vendorShare, platformFee, "Swish");
    }, 2200);
  };

  const handleFinishPayment = () => {
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-zinc-950/80 backdrop-blur-md z-50 flex flex-col justify-end sm:justify-center items-center p-0 sm:p-4 overflow-y-auto" id="swish-gateway-container">
      <AnimatePresence mode="wait">
        
        {/* STEP 1: SELECT PAYMENT METHOD & ENTER DETAILS */}
        {step === "details" && (
          <motion.div 
            key="details"
            initial={{ y: 200, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -200, opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 220 }}
            className="bg-white text-zinc-900 rounded-t-3xl sm:rounded-3xl p-5 space-y-4 shadow-2xl border-t sm:border border-zinc-200/50 flex flex-col justify-between w-full max-w-lg max-h-[92vh] sm:max-h-[88vh] overflow-y-auto text-left"
            id="swish-details-screen"
          >
            {/* Payment Header Banner */}
            <div className="flex justify-between items-center border-b border-zinc-100 pb-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-orange-500 text-white flex items-center justify-center font-black shadow-sm shrink-0">
                  💳
                </div>
                <div>
                  <h4 className="font-display font-black text-xs text-zinc-950 uppercase tracking-tight">Kassa & Betalning</h4>
                  <p className="text-[8px] text-zinc-400 font-bold uppercase font-mono">Real-time Split Routing</p>
                </div>
              </div>
              <button 
                onClick={onClose}
                className="p-1.5 bg-zinc-100 text-zinc-500 hover:text-zinc-900 rounded-full transition-all cursor-pointer active:scale-90"
                id="btn-close-swish"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* PAYMENT METHOD SELECTOR TABS */}
            <div className="bg-zinc-100 p-1 rounded-2xl flex gap-1 border border-zinc-200 text-xs font-bold">
              <button
                onClick={() => { setPaymentMethod("swish"); setValidationError(null); }}
                className={`flex-1 py-2 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 text-[11px] ${
                  paymentMethod === "swish"
                    ? "bg-white text-zinc-950 shadow-sm font-black border border-zinc-200"
                    : "text-zinc-500 hover:text-zinc-900"
                }`}
              >
                <span className="font-display font-black text-[10px] text-sky-600">swish</span>
                <span>Swish</span>
              </button>

              <button
                onClick={() => { setPaymentMethod("card"); setValidationError(null); }}
                className={`flex-1 py-2 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 text-[11px] ${
                  paymentMethod === "card"
                    ? "bg-white text-zinc-950 shadow-sm font-black border border-zinc-200"
                    : "text-zinc-500 hover:text-zinc-900"
                }`}
              >
                <CreditCard className="w-3.5 h-3.5 text-orange-500" />
                <span>Kort (Card)</span>
              </button>

              <button
                onClick={() => { setPaymentMethod("applepay"); setValidationError(null); }}
                className={`flex-1 py-2 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 text-[11px] ${
                  paymentMethod === "applepay"
                    ? "bg-white text-zinc-950 shadow-sm font-black border border-zinc-200"
                    : "text-zinc-500 hover:text-zinc-900"
                }`}
              >
                <Wallet className="w-3.5 h-3.5 text-zinc-800" />
                <span>Apple Pay</span>
              </button>
            </div>

            {/* Split Payout Breakdown Panel */}
            <div className="bg-zinc-50 rounded-2xl p-3.5 border border-zinc-150/80 space-y-2.5 shadow-xs">
              <div className="flex justify-between items-center text-xs">
                <span className="text-zinc-400 font-extrabold uppercase text-[8px] font-mono tracking-wider">Fördelad Transaktion</span>
                <span className="bg-emerald-50 text-emerald-700 text-[8px] font-black px-2 py-0.5 rounded-full border border-emerald-100 uppercase tracking-wide flex items-center gap-1">
                  <ArrowRightLeft className="w-2.5 h-2.5" /> Direct Merchant Routing
                </span>
              </div>

              {/* Destination 1: Vendor */}
              <div className="bg-white p-2.5 rounded-xl border border-zinc-100 flex justify-between items-center">
                <div className="space-y-0.5">
                  <span className="text-[8px] text-zinc-400 font-bold uppercase font-mono">Matstånd (Vendor account)</span>
                  <p className="font-display font-black text-xs text-zinc-800 truncate max-w-[150px]">{vendorName}</p>
                  <p className="text-[9px] text-zinc-500 font-mono font-medium">{vendorSwishNumber}</p>
                </div>
                <div className="text-right">
                  <span className="text-[13px] font-black font-mono text-zinc-950">{vendorShare.toFixed(2)} kr</span>
                  <span className="text-[8px] text-emerald-600 font-bold uppercase block">100% Direct</span>
                </div>
              </div>

              {/* Destination 2: VenueEat Platform Fee */}
              <div className="bg-white p-2.5 rounded-xl border border-zinc-100 flex justify-between items-center">
                <div className="space-y-0.5">
                  <span className="text-[8px] text-orange-500 font-bold uppercase font-mono">Serviceavgift (VenueEat Split)</span>
                  <p className="font-display font-black text-xs text-zinc-800">VenueEat Platform</p>
                  <p className="text-[9px] text-zinc-500 font-mono font-medium">123 456 78 90</p>
                </div>
                <div className="text-right">
                  <span className="text-[13px] font-black font-mono text-zinc-950">{platformFee.toFixed(2)} kr</span>
                  <span className="text-[8px] text-orange-600 font-bold uppercase block">3.5% Service Fee</span>
                </div>
              </div>

              {/* Total Summary */}
              <div className="border-t border-zinc-200/60 pt-2 flex justify-between items-end">
                <span className="text-zinc-500 font-bold uppercase text-[9px] font-mono leading-none">Total Belopp</span>
                <span className="font-display font-black text-lg text-orange-600 font-mono tracking-tight leading-none">{totalAmount.toFixed(2)} kr</span>
              </div>
            </div>

            {/* FORM DEPENDING ON SELECTED METHOD */}
            {paymentMethod === "swish" && (
              <div className="space-y-2.5">
                <div className="space-y-1">
                  <label className="text-[9px] text-zinc-400 font-bold uppercase flex items-center gap-1 font-mono">
                    <User className="w-3 h-3 text-zinc-400" />
                    Namn på Biljettsedel (Ticket Name)
                  </label>
                  <input
                    type="text"
                    value={customerName}
                    onChange={(e) => onCustomerNameChange(e.target.value)}
                    className="w-full bg-white border-2 border-zinc-200 rounded-xl px-3 py-2 text-xs text-zinc-850 focus:outline-none focus:border-sky-500 font-bold transition-all"
                    placeholder="Skriv ditt förnamn..."
                    id="swish-input-customer-name"
                  />
                  <p className="text-[8.5px] text-zinc-400 font-semibold leading-relaxed">
                    Detta namn ropas ut vid pickup-luckan när din mat är redo.
                  </p>
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] text-zinc-400 font-bold uppercase flex items-center gap-1 font-mono">
                    <Phone className="w-3 h-3 text-zinc-400" />
                    Swish-nummer (Mobile)
                  </label>
                  <input
                    type="text"
                    value={phoneNumber}
                    onChange={(e) => {
                      setPhoneNumber(e.target.value);
                      if (validationError) setValidationError(null);
                    }}
                    className={`w-full bg-white border-2 rounded-xl px-3 py-2 text-xs text-zinc-850 focus:outline-none font-bold font-mono transition-all ${
                      validationError 
                        ? "border-rose-500 focus:border-rose-600 bg-rose-50/10" 
                        : "border-zinc-200 focus:border-sky-500"
                    }`}
                    placeholder="070-000 00 00"
                    id="swish-input-phone"
                  />
                  {validationError && (
                    <p className="text-[10px] text-rose-600 font-extrabold mt-1 leading-snug animate-fadeIn">
                      ⚠️ {validationError}
                    </p>
                  )}
                </div>

                <div className="bg-sky-50 border border-sky-100 rounded-xl p-2.5 flex gap-2 items-start">
                  <Shield className="w-3.5 h-3.5 text-sky-600 shrink-0 mt-0.5" />
                  <p className="text-[8.5px] text-sky-800/80 font-bold leading-relaxed">
                    Betalningen delas i realtid i Swish-nätverket. Säkert via Mobilt BankID.
                  </p>
                </div>

                <button
                  onClick={handleOpenBankID}
                  disabled={!customerName.trim()}
                  className={`w-full font-display font-black py-3 rounded-2xl transition-all shadow-md flex items-center justify-center gap-2 text-xs uppercase tracking-wider cursor-pointer active:scale-98 ${
                    customerName.trim() 
                      ? "bg-sky-500 hover:bg-sky-600 border-t border-sky-400 text-white" 
                      : "bg-zinc-100 border border-zinc-200 text-zinc-400 cursor-not-allowed"
                  }`}
                  id="btn-swish-pay"
                >
                  <Fingerprint className="w-4 h-4 animate-pulse" />
                  Signera Split-Swish
                </button>
              </div>
            )}

            {/* CARD PAYMENT FORM */}
            {paymentMethod === "card" && (
              <div className="space-y-3">
                {/* Visual Card Graphic */}
                <div className="bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-950 text-white p-4 rounded-2xl border border-zinc-700 shadow-lg space-y-3 relative overflow-hidden">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-zinc-400">Debit / Credit Card</span>
                    <div className="flex items-center gap-1">
                      <span className="w-3 h-3 rounded-full bg-red-500/90 inline-block -mr-1.5" />
                      <span className="w-3 h-3 rounded-full bg-amber-400/90 inline-block" />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[9px] font-mono text-zinc-400 block uppercase">Card Number</span>
                    <span className="font-mono font-black text-sm tracking-wider block text-amber-200">
                      {cardNumber || "•••• •••• •••• ••••"}
                    </span>
                  </div>

                  <div className="flex justify-between items-end pt-1">
                    <div>
                      <span className="text-[8px] font-mono text-zinc-400 block uppercase">Card Holder</span>
                      <span className="font-bold text-xs truncate max-w-[150px] block">{cardHolder || "Guest Customer"}</span>
                    </div>
                    <div>
                      <span className="text-[8px] font-mono text-zinc-400 block uppercase">Expires</span>
                      <span className="font-mono font-bold text-xs block">{cardExpiry || "08/28"}</span>
                    </div>
                  </div>
                </div>

                {/* Card Inputs */}
                <div className="space-y-2">
                  <div className="space-y-1">
                    <label className="text-[9px] text-zinc-500 font-bold uppercase font-mono">Cardholder Name</label>
                    <input
                      type="text"
                      value={cardHolder}
                      onChange={(e) => {
                        setCardHolder(e.target.value);
                        onCustomerNameChange(e.target.value);
                      }}
                      className="w-full bg-white border-2 border-zinc-200 rounded-xl px-3 py-2 text-xs font-bold text-zinc-900 focus:outline-none focus:border-orange-500"
                      placeholder="Name on card"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[9px] text-zinc-500 font-bold uppercase font-mono">Card Number</label>
                    <input
                      type="text"
                      maxLength={19}
                      value={cardNumber}
                      onChange={(e) => {
                        const raw = e.target.value.replace(/\D/g, "");
                        const formatted = raw.match(/.{1,4}/g)?.join(" ") || "";
                        setCardNumber(formatted);
                      }}
                      className="w-full bg-white border-2 border-zinc-200 rounded-xl px-3 py-2 text-xs font-mono font-bold text-zinc-900 focus:outline-none focus:border-orange-500"
                      placeholder="4000 0000 0000 0000"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <label className="text-[9px] text-zinc-500 font-bold uppercase font-mono">Expiry (MM/YY)</label>
                      <input
                        type="text"
                        maxLength={5}
                        value={cardExpiry}
                        onChange={(e) => setCardExpiry(e.target.value)}
                        className="w-full bg-white border-2 border-zinc-200 rounded-xl px-3 py-2 text-xs font-mono font-bold text-zinc-900 focus:outline-none focus:border-orange-500"
                        placeholder="MM/YY"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] text-zinc-500 font-bold uppercase font-mono">CVC / CVV</label>
                      <input
                        type="text"
                        maxLength={4}
                        value={cardCvc}
                        onChange={(e) => setCardCvc(e.target.value)}
                        className="w-full bg-white border-2 border-zinc-200 rounded-xl px-3 py-2 text-xs font-mono font-bold text-zinc-900 focus:outline-none focus:border-orange-500"
                        placeholder="123"
                      />
                    </div>
                  </div>
                </div>

                {validationError && (
                  <p className="text-[10px] text-rose-600 font-extrabold animate-fadeIn">
                    ⚠️ {validationError}
                  </p>
                )}

                <div className="bg-orange-50 border border-orange-100 rounded-xl p-2.5 flex gap-2 items-center text-[9px] text-orange-950 font-bold">
                  <ShieldCheck className="w-4 h-4 text-orange-600 shrink-0" />
                  <span>Encrypted Stripe & Adyen Card Gateway • 256-bit SSL</span>
                </div>

                <button
                  onClick={handleCardPay}
                  className="w-full bg-orange-500 hover:bg-orange-600 border-t border-orange-400 text-white font-display font-black py-3 rounded-2xl transition-all shadow-md flex items-center justify-center gap-2 text-xs uppercase tracking-wider cursor-pointer active:scale-98"
                >
                  <CreditCard className="w-4 h-4" />
                  Pay {totalAmount.toFixed(2)} SEK by Card
                </button>
              </div>
            )}

            {/* APPLE PAY / GOOGLE PAY FORM */}
            {paymentMethod === "applepay" && (
              <div className="space-y-4 py-2">
                <div className="text-center space-y-1 bg-zinc-900 text-white p-4 rounded-2xl border border-zinc-800">
                  <Wallet className="w-8 h-8 text-white mx-auto" />
                  <h5 className="font-display font-black text-sm text-white">Apple Pay & Google Wallet</h5>
                  <p className="text-[10px] text-zinc-400">1-Tap biometric payment with stored cards.</p>
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] text-zinc-500 font-bold uppercase font-mono">Attendee Name</label>
                  <input
                    type="text"
                    value={customerName}
                    onChange={(e) => onCustomerNameChange(e.target.value)}
                    className="w-full bg-white border-2 border-zinc-200 rounded-xl px-3 py-2 text-xs font-bold text-zinc-900 focus:outline-none focus:border-zinc-900"
                    placeholder="Skriv ditt förnamn..."
                  />
                </div>

                <button
                  onClick={handleApplePay}
                  className="w-full bg-zinc-950 hover:bg-zinc-900 text-white font-display font-black py-3.5 rounded-2xl transition-all shadow-xl flex items-center justify-center gap-2 text-xs uppercase tracking-wider cursor-pointer active:scale-98 border border-zinc-800"
                >
                  <span>Pay with</span>
                  <span className="font-bold text-sm tracking-tight font-sans"> Pay</span>
                  <span className="font-mono text-zinc-400 text-[10px]">({totalAmount.toFixed(2)} SEK)</span>
                </button>
              </div>
            )}
          </motion.div>
        )}

        {/* STEP 2: BANKID ENTER SECURITY CODE WITH BOTH RECIPIENTS SHOWN */}
        {step === "bankid" && (
          <motion.div 
            key="bankid"
            initial={{ y: 200, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -200, opacity: 0 }}
            className="bg-zinc-900 text-white rounded-t-3xl sm:rounded-3xl p-5 space-y-5 shadow-2xl border-t sm:border border-zinc-800 flex flex-col justify-between w-full max-w-lg max-h-[92vh] sm:max-h-[88vh] overflow-y-auto text-left"
            id="bankid-auth-screen"
          >
            {/* BankID Header */}
            <div className="flex justify-between items-center border-b border-zinc-800 pb-2">
              <div className="flex items-center gap-2">
                {/* Simplified Mock BankID Logo Emblem */}
                <div className="w-7 h-7 rounded-xl bg-white flex items-center justify-center shadow-md border border-zinc-200">
                  <div className="w-4 h-4 bg-zinc-900 rounded-full flex items-center justify-center text-[9px] font-black text-white italic tracking-tighter">ID</div>
                </div>
                <div>
                  <h4 className="font-display font-extrabold text-xs text-zinc-100 tracking-wide uppercase">Mobilt BankID</h4>
                  <p className="text-[8px] text-zinc-400 font-bold font-mono">SÄKER SIGNERING</p>
                </div>
              </div>
              <button 
                onClick={() => setStep("details")}
                className="text-[10px] font-bold text-zinc-400 hover:text-white hover:bg-zinc-800 px-2.5 py-1 rounded-lg transition-all"
                id="btn-cancel-bankid"
              >
                Avbryt
              </button>
            </div>

            {/* Signature Request Box detailing split recipients */}
            <div className="bg-zinc-950 rounded-2xl p-4 border border-zinc-800 text-center space-y-2 shadow-inner">
              <p className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider font-mono">Signering begärd av</p>
              <h5 className="font-display font-black text-sky-400 text-xs">VenueEat Stockholm</h5>
              
              <div className="pt-2 border-t border-zinc-900 space-y-1.5 text-left">
                <p className="text-[9px] text-zinc-400 font-bold font-mono uppercase text-center">FÖRDELADE MOTTAGARE (SPLIT):</p>
                <div className="flex justify-between items-center text-[10px] bg-zinc-900/50 p-1.5 rounded-lg border border-zinc-850">
                  <span className="text-zinc-300 font-medium truncate max-w-[120px]">🍔 {vendorName}</span>
                  <span className="font-mono text-zinc-200 font-bold">{vendorShare.toFixed(2)} SEK</span>
                </div>
                <div className="flex justify-between items-center text-[10px] bg-zinc-900/50 p-1.5 rounded-lg border border-zinc-850">
                  <span className="text-zinc-300 font-medium">👑 VenueEat Serviceavgift</span>
                  <span className="font-mono text-zinc-200 font-bold">{platformFee.toFixed(2)} SEK</span>
                </div>
                
                <div className="pt-1 text-center font-mono text-[11px] font-black text-white">
                  Totalt Belopp: {totalAmount.toFixed(2)} SEK
                </div>
              </div>
            </div>

            {/* Security PIN Display Circles */}
            <div className="space-y-1.5 text-center">
              <p className="text-[9px] text-zinc-400 font-bold uppercase tracking-wide">Ange säkerhetskod (6 siffror)</p>
              <div className="flex justify-center gap-2.5 py-1">
                {Array.from({ length: 6 }).map((_, i) => {
                  const isActive = i < pin.length;
                  return (
                    <motion.div
                      key={i}
                      animate={isActive ? { scale: [1, 1.2, 1] } : { scale: 1 }}
                      transition={{ duration: 0.15 }}
                      className={`w-3.5 h-3.5 rounded-full border-2 transition-all ${
                        isActive 
                          ? "bg-sky-400 border-sky-400 shadow-md shadow-sky-400/30" 
                          : "border-zinc-700 bg-transparent"
                      }`}
                    />
                  );
                })}
              </div>
            </div>

            {/* Keypad Layout */}
            <div className="grid grid-cols-3 gap-2.5 max-w-xs mx-auto pt-1" id="bankid-keypad">
              {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map((num) => (
                <button
                  key={num}
                  onClick={() => handleKeyPress(num)}
                  className="h-10 rounded-xl bg-zinc-800/60 hover:bg-zinc-800 active:scale-95 text-base font-bold font-mono transition-all text-white cursor-pointer border border-zinc-700/30 flex items-center justify-center shadow-xs"
                >
                  {num}
                </button>
              ))}
              
              {/* Backspace Button */}
              <button
                onClick={handleDeletePin}
                className="h-10 rounded-xl bg-zinc-900 hover:bg-zinc-850 active:scale-95 text-[10px] font-bold uppercase tracking-wider font-mono transition-all text-zinc-400 cursor-pointer flex items-center justify-center"
              >
                Radera
              </button>

              {/* 0 Button */}
              <button
                onClick={() => handleKeyPress("0")}
                className="h-10 rounded-xl bg-zinc-800/60 hover:bg-zinc-800 active:scale-95 text-base font-bold font-mono transition-all text-white cursor-pointer border border-zinc-700/30 flex items-center justify-center"
              >
                0
              </button>

              {/* Fast Biometric Bi-pass Button */}
              <button
                onClick={handleQuickBiometric}
                className="h-10 rounded-xl bg-sky-950/40 hover:bg-sky-900/60 border border-sky-800/40 active:scale-95 text-[8.5px] font-black transition-all text-sky-400 cursor-pointer flex flex-col items-center justify-center leading-none"
              >
                <Fingerprint className="w-3.5 h-3.5 text-sky-400 mb-0.5" />
                Bypass
              </button>
            </div>

            <div className="text-center">
              <span className="text-[8px] text-zinc-500 font-bold uppercase tracking-wider flex items-center justify-center gap-1 font-mono">
                <Lock className="w-2.5 h-2.5 text-zinc-500" /> Krypterad SSL anslutning
              </span>
            </div>
          </motion.div>
        )}

        {/* STEP 3: LOADING SPINNER SIGNING */}
        {step === "signing" && (
          <motion.div 
            key="signing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="bg-zinc-900 text-white rounded-t-3xl sm:rounded-3xl p-6 space-y-5 shadow-2xl border-t sm:border border-zinc-800 flex flex-col items-center justify-center min-h-[340px] w-full max-w-lg"
            id="bankid-signing-screen"
          >
            <div className="relative w-14 h-14 flex items-center justify-center">
              {/* Spinning outer loading indicator */}
              <div className="absolute inset-0 border-4 border-sky-500/20 border-t-sky-400 rounded-full animate-spin"></div>
              <Fingerprint className="w-7 h-7 text-sky-400 animate-pulse" />
            </div>

            <div className="text-center space-y-1">
              <p className="text-xs font-bold tracking-tight text-zinc-200">Verifierar säkerhetskod...</p>
              <p className="text-[9px] text-zinc-500 font-semibold uppercase tracking-wider font-mono">Signerar betalningsuppdraget</p>
            </div>

            <div className="bg-zinc-950/60 px-3 py-2 rounded-full border border-zinc-800 text-[9px] text-zinc-400 font-bold font-mono">
              Avvakta svar från Swish Bank Gateway
            </div>
          </motion.div>
        )}

        {/* STEP 4: GORGEOUS SUCCESS RECEIPT WITH DETAILED SPLIT BREAKDOWNS */}
        {step === "success" && (
          <motion.div 
            key="success"
            initial={{ y: 200, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="bg-emerald-600 text-white rounded-t-3xl sm:rounded-3xl p-5 space-y-5 shadow-2xl border-t sm:border border-emerald-500 flex flex-col justify-between w-full max-w-lg max-h-[92vh] sm:max-h-[88vh] overflow-y-auto relative text-left"
            id="swish-success-screen"
          >
            {/* Confetti Explosion Burst */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
              {confetti.map((c) => (
                <motion.div
                  key={c.id}
                  initial={{ x: 0, y: 150, scale: 0, rotate: 0 }}
                  animate={{ 
                    x: c.x * 2.5, 
                    y: c.y * 2.5, 
                    scale: [0, 1, 0.8, 0], 
                    rotate: 360 
                  }}
                  transition={{ 
                    duration: 1.8, 
                    delay: c.delay, 
                    ease: "easeOut" 
                  }}
                  style={{
                    backgroundColor: c.color,
                    width: c.size,
                    height: c.size,
                    borderRadius: c.id % 3 === 0 ? "50%" : c.id % 3 === 1 ? "0%" : "30%",
                    position: "absolute",
                    left: "50%",
                    top: "35%"
                  }}
                />
              ))}
            </div>

            <div className="space-y-4 text-center pt-2 relative z-10">
              
              {/* Dynamic SVG Checkmark Animation */}
              <div className="relative w-14 h-14 mx-auto">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", damping: 10, stiffness: 100, delay: 0.1 }}
                  className="w-14 h-14 rounded-full bg-white flex items-center justify-center shadow-lg shadow-emerald-700/50"
                >
                  <motion.div
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 0.5, delay: 0.3, ease: "easeInOut" }}
                  >
                    <CheckCircle2 className="w-8 h-8 text-emerald-600 fill-emerald-50" />
                  </motion.div>
                </motion.div>
              </div>

              <div className="space-y-0.5">
                <h3 className="font-display font-black text-lg tracking-tight italic text-white">
                  Betalning godkänd!
                </h3>
                <p className="text-[10px] text-emerald-100 font-semibold uppercase tracking-wider font-mono">
                  Mottagarna har krediterats direkt i realtid
                </p>
              </div>

              {/* Swish Style Receipt Card */}
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10 space-y-3 text-left shadow-inner text-xs"
              >
                <div className="flex justify-between items-center text-[9px] border-b border-white/10 pb-1.5 font-mono">
                  <span className="text-emerald-100 font-bold uppercase tracking-wider">{paymentMethod === "card" ? "Card / Stripe" : paymentMethod === "applepay" ? "Apple Pay" : "Swish Split"} Transaktionskvitto</span>
                  <span className="text-white/80 font-bold">#PAY-{paymentMethod.toUpperCase().slice(0, 3)}-{Math.floor(Math.random() * 900000 + 100000)}</span>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-start">
                    <span className="text-emerald-100 font-semibold font-sans">Kund (Ticket):</span>
                    <span className="font-sans font-bold text-white text-right max-w-[140px] truncate">{customerName}</span>
                  </div>

                  <div className="flex justify-between items-start">
                    <span className="text-emerald-100 font-semibold font-sans">Tidpunkt:</span>
                    <span className="font-mono font-bold text-white">{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
                  </div>

                  {/* Transfer 1 Receipt */}
                  <div className="border-t border-white/10 pt-2 space-y-1">
                    <div className="flex justify-between items-center text-[10px]">
                      <span className="text-emerald-100 font-bold uppercase tracking-wider font-mono">Överföring 1 (Vendor Direct):</span>
                      <span className="font-mono font-black text-white">{vendorShare.toFixed(2)} kr</span>
                    </div>
                    <div className="flex justify-between text-[9px] text-emerald-200">
                      <span>Mottagare: {vendorName}</span>
                      <span>Swish: {vendorSwishNumber}</span>
                    </div>
                  </div>

                  {/* Transfer 2 Receipt */}
                  <div className="border-t border-white/10 pt-2 space-y-1">
                    <div className="flex justify-between items-center text-[10px]">
                      <span className="text-emerald-100 font-bold uppercase tracking-wider font-mono">Överföring 2 (VenueEat Fee):</span>
                      <span className="font-mono font-black text-white">{platformFee.toFixed(2)} kr</span>
                    </div>
                    <div className="flex justify-between text-[9px] text-emerald-200">
                      <span>Mottagare: VenueEat Platform</span>
                      <span>Swish: 123 456 78 90</span>
                    </div>
                  </div>

                  <div className="border-t border-white/15 pt-2 flex justify-between items-end">
                    <span className="text-emerald-600 font-black bg-white text-[9px] px-2 py-0.5 rounded-md uppercase font-mono shadow-xs">Total</span>
                    <span className="font-display font-black text-lg text-white font-mono tracking-tight">{totalAmount.toFixed(2)} kr</span>
                  </div>
                </div>
              </motion.div>

              <div className="bg-emerald-700/40 rounded-xl p-2.5 text-[9px] text-emerald-100 leading-relaxed text-left font-medium border border-emerald-500/20">
                ✔️ Köbiljett <b>#{nextQueueNumber}</b> har skapats. En push-notis skickas när köket godkänt ordern. Du kan nu spåra din order i realtid i Live Ticket vyn.
              </div>
            </div>

            {/* Finish Button */}
            <button
              onClick={handleFinishPayment}
              className="w-full bg-white hover:bg-zinc-50 active:scale-98 text-emerald-800 font-display font-black py-3 rounded-2xl transition-all shadow-lg flex items-center justify-center gap-1.5 text-xs uppercase tracking-wider cursor-pointer border-b-2 border-emerald-100"
              id="btn-swish-done"
            >
              <Check className="w-4 h-4 stroke-[3px]" />
              Klart (Done)
            </button>
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  );
}
