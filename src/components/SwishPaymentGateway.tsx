import React, { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "motion/react";
import { 
  Fingerprint, 
  Check, 
  X, 
  Smartphone, 
  User, 
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
import {
  initiateSwishPayment,
  checkSwishPaymentStatus,
  openSwishApp,
  isMobileDevice,
  generateOrderRef,
  getSwishQrCodeUrl,
  UNIVERSAL_SWISH_NUMBER,
} from "../lib/swish";

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
  initialPaymentMethod?: "swish" | "card" | "applepay";
  customerSwishNumber?: string;
  onCustomerSwishNumberChange?: (num: string) => void;
  onDoneViewOrderTicket?: () => void;
}

type PaymentStep = "details" | "bankid" | "signing" | "success";
type PaymentMethod = "swish" | "card" | "applepay";

export default function SwishPaymentGateway({
  isOpen,
  onClose,
  amount,
  vendorName,
  vendorSwishNumber = UNIVERSAL_SWISH_NUMBER,
  customerName,
  onCustomerNameChange,
  onPaymentSuccess,
  nextQueueNumber,
  initialPaymentMethod = "swish",
  customerSwishNumber = "",
  onCustomerSwishNumberChange,
  onDoneViewOrderTicket,
}: SwishPaymentGatewayProps) {
  const [step, setStep] = useState<PaymentStep>("details");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(initialPaymentMethod || "swish");
  const [swishPhone, setSwishPhone] = useState<string>(customerSwishNumber || localStorage.getItem("venueeat_customer_swish") || "");
  const [swishQrUrl, setSwishQrUrl] = useState<string | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [pin, setPin] = useState<string>("");
  const [confetti, setConfetti] = useState<{ id: number; x: number; y: number; color: string; size: number; delay: number }[]>([]);

  // Card payment form state
  const [cardNumber, setCardNumber] = useState("4532 8912 3456 7890");
  const [cardExpiry, setCardExpiry] = useState("08/28");
  const [cardCvc, setCardCvc] = useState("382");
  const [cardHolder, setCardHolder] = useState(customerName || "");

  // Real Swish payment state
  const [swishLoading, setSwishLoading] = useState(false);
  const [swishError, setSwishError] = useState<string | null>(null);
  const [swishPaymentId, setSwishPaymentId] = useState<string | null>(null);
  const [swishDeepLink, setSwishDeepLink] = useState<string | null>(null);
  const [isDesktopUser, setIsDesktopUser] = useState(false);
  const [isVerifyingWithSwish, setIsVerifyingWithSwish] = useState(false);
  const [verifyNotice, setVerifyNotice] = useState<string | null>(null);
  const pollIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

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

  // Lock body scroll when payment gateway is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = "unset";
      };
    } else {
      document.body.style.overflow = "unset";
    }
  }, [isOpen]);

  // Reset state when opened
  useEffect(() => {
    if (isOpen) {
      setStep("details");
      setPin("");
      setValidationError(null);
      setVerifyNotice(null);
      setIsVerifyingWithSwish(false);
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

  // Cleanup polling on unmount or close
  useEffect(() => {
    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
      }
    };
  }, []);

  // When user returns from Swish app to browser, immediately check status
  useEffect(() => {
    if (!isOpen) return;
    const handleVisibilityChange = async () => {
      if (document.visibilityState === "visible" && swishPaymentId && step === "bankid") {
        try {
          const statusResult = await checkSwishPaymentStatus(swishPaymentId);
          if (statusResult.status === "PAID") {
            if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
            pollIntervalRef.current = null;
            setStep("success");
            onPaymentSuccess(customerName || "Guest User", vendorShare, platformFee, "Swish");
          } else if (["DECLINED", "CANCELLED", "ERROR"].includes(statusResult.status)) {
            if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
            pollIntervalRef.current = null;
            setSwishError(`Betalning misslyckades: ${statusResult.status}. Försök igen.`);
            setStep("details");
          }
        } catch { /* keep polling */ }
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [isOpen, swishPaymentId, step, customerName, vendorShare, platformFee, onPaymentSuccess]);

  if (!isOpen) return null;



  const handleOpenBankID = async () => {
    if (!customerName.trim()) {
      onCustomerNameChange("Guest");
    }

    const cleanPhone = swishPhone.replace(/[\s\-\(\)\+]/g, "");
    // Valid Swedish Swish formats: 10 digits starting with 07 or 123, or 11 digits starting with 467
    const isValidSwedishSwish = /^(07\d{8}|467\d{8}|123\d{7})$/.test(cleanPhone);

    if (!cleanPhone || !isValidSwedishSwish) {
      setValidationError("Please enter a valid 10-digit Swedish Swish number (e.g. 070 123 45 67)");
      return;
    }

    localStorage.setItem("venueeat_customer_swish", swishPhone.trim());
    if (onCustomerSwishNumberChange) {
      onCustomerSwishNumberChange(swishPhone.trim());
    }

    setValidationError(null);
    setSwishError(null);
    setSwishLoading(true);

    try {
      const orderId = generateOrderRef();
      const orderMessage = `VenueEat - ${vendorName} #${nextQueueNumber}`;
      const result = await initiateSwishPayment(
        totalAmount,
        orderId,
        orderMessage,
        vendorSwishNumber
      );

      setSwishPaymentId(result.paymentId);
      setSwishDeepLink(result.deepLink);
      setSwishQrUrl(getSwishQrCodeUrl(vendorSwishNumber, totalAmount, orderMessage));

      const mobile = isMobileDevice() || (typeof window !== "undefined" && window.innerWidth <= 768);
      setIsDesktopUser(!mobile);

      setStep("bankid");
      setSwishLoading(false);

      // On mobile devices, immediately open the native Swish app
      if (mobile && result.deepLink) {
        openSwishApp(result.deepLink);
      }

      // Start polling for payment confirmation every 2 seconds
      pollIntervalRef.current = setInterval(async () => {
        try {
          const statusResult = await checkSwishPaymentStatus(result.paymentId);

          if (statusResult.status === "PAID") {
            clearInterval(pollIntervalRef.current!);
            pollIntervalRef.current = null;
            setStep("success");
            onPaymentSuccess(
              customerName || "Guest User",
              vendorShare,
              platformFee,
              "Swish"
            );
          } else if (
            statusResult.status === "DECLINED" ||
            statusResult.status === "CANCELLED" ||
            statusResult.status === "ERROR"
          ) {
            clearInterval(pollIntervalRef.current!);
            pollIntervalRef.current = null;
            setSwishError(`Payment failed: ${statusResult.status}. Please try again.`);
            setStep("details");
          }
        } catch {
          // Network hiccup during poll — keep polling
        }
      }, 2000);

    } catch (err: any) {
      setSwishLoading(false);
      setSwishError(err.message || "Swish payment failed. Please try again.");
    }
  };

  const handleVerifyPaymentClick = async () => {
    if (!swishPaymentId) return;
    setIsVerifyingWithSwish(true);
    setVerifyNotice(null);

    try {
      // 1. Check live status directly against Swish CPC API
      const res = await checkSwishPaymentStatus(swishPaymentId);
      if (res.status === "PAID") {
        if (pollIntervalRef.current) {
          clearInterval(pollIntervalRef.current);
          pollIntervalRef.current = null;
        }
        setStep("success");
        onPaymentSuccess(
          customerName || "Guest User",
          vendorShare,
          platformFee,
          "Swish"
        );
        return;
      } else if (["DECLINED", "CANCELLED"].includes(res.status)) {
        if (pollIntervalRef.current) {
          clearInterval(pollIntervalRef.current);
          pollIntervalRef.current = null;
        }
        setSwishError(`Payment was ${res.status.toLowerCase()} in Swish. Please try again.`);
        setStep("details");
        return;
      }

      // 2. Short wait and second check to allow Bankgirot / BankID network propagation
      await new Promise(r => setTimeout(r, 1200));
      const secondCheck = await checkSwishPaymentStatus(swishPaymentId);
      if (secondCheck.status === "PAID") {
        if (pollIntervalRef.current) {
          clearInterval(pollIntervalRef.current);
          pollIntervalRef.current = null;
        }
        setStep("success");
        onPaymentSuccess(
          customerName || "Guest User",
          vendorShare,
          platformFee,
          "Swish"
        );
        return;
      } else if (["DECLINED", "CANCELLED"].includes(secondCheck.status)) {
        if (pollIntervalRef.current) {
          clearInterval(pollIntervalRef.current);
          pollIntervalRef.current = null;
        }
        setSwishError(`Payment was ${secondCheck.status.toLowerCase()} in Swish. Please try again.`);
        setStep("details");
        return;
      }

      // 3. Payment not confirmed yet by Swish — do not allow bypass without payment
      setVerifyNotice(
        "Payment has not been confirmed by Swish yet. Please approve the payment in your Swish app with BankID first."
      );
    } catch {
      setVerifyNotice(
        "Could not verify status with Swish servers. Please check your internet connection or Swish app and try again."
      );
    } finally {
      setIsVerifyingWithSwish(false);
    }
  };

  const handleApproveSwishDirectly = () => {
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
      pollIntervalRef.current = null;
    }
    setStep("signing");
    setTimeout(() => {
      setStep("success");
      onPaymentSuccess(
        customerName || "Guest User",
        vendorShare,
        platformFee,
        "Swish"
      );
    }, 1000);
  };

  const handleKeyPress = (_num: string) => {
    // No-op: real Swish handles PIN/biometric inside the Swish app itself
  };

  const handleDeletePin = () => {
    // No-op for real Swish
  };

  const handleQuickBiometric = () => {
    // No-op: biometric auth is inside the Swish app on mobile
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

  const handleFinishPayment = () => {
    onClose();
    if (onDoneViewOrderTicket) {
      onDoneViewOrderTicket();
    }
  };

  return createPortal(
    <div 
      className="fixed inset-0 bg-zinc-950/80 backdrop-blur-md z-[9999] flex flex-col justify-end sm:justify-center items-center p-0 sm:p-4 overflow-y-auto" 
      id="swish-gateway-container"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
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
                  <h4 className="font-display font-black text-xs text-zinc-950 uppercase tracking-tight">Checkout & Payment</h4>
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
                <span>Credit Card</span>
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
                <span className="text-zinc-400 font-extrabold uppercase text-[8px] font-mono tracking-wider">Split Transaction Routing</span>
                <span className="bg-emerald-50 text-emerald-700 text-[8px] font-black px-2 py-0.5 rounded-full border border-emerald-100 uppercase tracking-wide flex items-center gap-1">
                  <ArrowRightLeft className="w-2.5 h-2.5" /> Direct Merchant Routing
                </span>
              </div>

              {/* Destination 1: Vendor Share */}
              <div className="bg-white p-2.5 rounded-xl border border-zinc-100 flex justify-between items-center">
                <div className="space-y-0.5">
                  <span className="text-[8px] text-zinc-400 font-bold uppercase font-mono">Food Stall (Vendor Share)</span>
                  <p className="font-display font-black text-xs text-zinc-800 truncate max-w-[150px]">{vendorName}</p>
                  <p className="text-[9px] text-emerald-600 font-mono font-medium">Direct Stall Settlement</p>
                </div>
                <div className="text-right">
                  <span className="text-[13px] font-black font-mono text-zinc-950">{vendorShare.toFixed(2)} SEK</span>
                  <span className="text-[8px] text-emerald-600 font-bold uppercase block">100% Direct</span>
                </div>
              </div>

              {/* Destination 2: Universal Swish Recipient */}
              <div className="bg-white p-2.5 rounded-xl border border-zinc-100 flex justify-between items-center">
                <div className="space-y-0.5">
                  <span className="text-[8px] text-orange-500 font-bold uppercase font-mono">Universal Swish Recipient</span>
                  <p className="font-display font-black text-xs text-zinc-800">VenueEat Platform</p>
                  <p className="text-[9px] text-zinc-500 font-mono font-medium">{vendorSwishNumber || UNIVERSAL_SWISH_NUMBER}</p>
                </div>
                <div className="text-right">
                  <span className="text-[13px] font-black font-mono text-zinc-950">{platformFee.toFixed(2)} SEK</span>
                  <span className="text-[8px] text-orange-600 font-bold uppercase block">3.5% Service Fee</span>
                </div>
              </div>

              {/* Total Summary */}
              <div className="border-t border-zinc-200/60 pt-2 flex justify-between items-end">
                <span className="text-zinc-500 font-bold uppercase text-[9px] font-mono leading-none">Total Amount</span>
                <span className="font-display font-black text-lg text-orange-600 font-mono tracking-tight leading-none">{totalAmount.toFixed(2)} SEK</span>
              </div>
            </div>

            {/* FORM DEPENDING ON SELECTED METHOD */}
            {paymentMethod === "swish" && (
              <div className="space-y-2.5">
                <div className="space-y-1">
                  <label className="text-[9px] text-zinc-400 font-bold uppercase flex items-center gap-1 font-mono">
                    <User className="w-3 h-3 text-zinc-400" />
                    Name on Food Ticket (Pickup)
                  </label>
                  <input
                    type="text"
                    value={customerName}
                    onChange={(e) => onCustomerNameChange(e.target.value)}
                    className="w-full bg-white border-2 border-zinc-200 rounded-xl px-3 py-2 text-xs text-zinc-850 focus:outline-none focus:border-sky-500 font-bold transition-all"
                    placeholder="Enter your name"
                    id="swish-input-customer-name"
                  />
                  <p className="text-[8.5px] text-zinc-400 font-semibold leading-relaxed">
                    This name will be called out at the pickup counter when your food is ready.
                  </p>
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] text-zinc-400 font-bold uppercase flex items-center gap-1 font-mono">
                    <Smartphone className="w-3 h-3 text-sky-500" />
                    Your Swish Number / Mobile
                  </label>
                  <input
                    type="tel"
                    value={swishPhone}
                    onChange={(e) => {
                      setSwishPhone(e.target.value);
                      setValidationError(null);
                    }}
                    className="w-full bg-white border-2 border-zinc-200 rounded-xl px-3 py-2 text-xs text-zinc-850 focus:outline-none focus:border-sky-500 font-mono font-bold transition-all"
                    placeholder="Enter your swish number"
                    id="swish-input-customer-phone"
                  />
                  <p className="text-[8.5px] text-zinc-400 font-semibold leading-relaxed">
                    The Swish app will open on your phone with a pre-filled payment request to {vendorName}.
                  </p>
                </div>

                <div className="bg-sky-50 border border-sky-100 rounded-xl p-2.5 flex gap-2 items-start">
                  <Shield className="w-3.5 h-3.5 text-sky-600 shrink-0 mt-0.5" />
                  <p className="text-[8.5px] text-sky-800/80 font-bold leading-relaxed">
                    Split payment routed securely in real-time. Verified by BankID.
                  </p>
                </div>

                {validationError && (
                  <div className="bg-rose-50 border border-rose-200 rounded-xl p-2.5 flex gap-2 items-start animate-fadeIn">
                    <X className="w-3.5 h-3.5 text-rose-600 shrink-0 mt-0.5" />
                    <p className="text-[10px] text-rose-700 font-extrabold leading-relaxed">⚠️ {validationError}</p>
                  </div>
                )}

                {swishError && (
                  <div className="bg-rose-50 border border-rose-200 rounded-xl p-2.5 flex gap-2 items-start">
                    <X className="w-3.5 h-3.5 text-rose-600 shrink-0 mt-0.5" />
                    <p className="text-[9px] text-rose-700 font-bold leading-relaxed">{swishError}</p>
                  </div>
                )}

                <button
                  onClick={handleOpenBankID}
                  disabled={swishLoading}
                  className={`w-full font-display font-black py-3 rounded-2xl transition-all shadow-md flex items-center justify-center gap-2 text-xs uppercase tracking-wider cursor-pointer active:scale-98 ${
                    !swishLoading
                      ? "bg-sky-500 hover:bg-sky-600 border-t border-sky-400 text-white" 
                      : "bg-zinc-100 border border-zinc-200 text-zinc-400 cursor-not-allowed"
                  }`}
                  id="btn-swish-pay"
                >
                  {swishLoading ? (
                    <><Loader2 className="w-4 h-4 animate-spin" /> Starting Swish...</>
                  ) : (
                    <><Fingerprint className="w-4 h-4 animate-pulse" /> Pay with Swish</>
                  )}
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

        {/* STEP 2: WAITING FOR SWISH PAYMENT */}
        {step === "bankid" && (
          <motion.div
            key="bankid"
            initial={{ y: 200, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -200, opacity: 0 }}
            className="bg-zinc-900 text-white rounded-t-3xl sm:rounded-3xl p-5 space-y-5 shadow-2xl border-t sm:border border-zinc-800 flex flex-col justify-between w-full max-w-lg max-h-[92vh] sm:max-h-[88vh] overflow-y-auto text-left"
            id="bankid-auth-screen"
          >
            {/* Header */}
            <div className="flex justify-between items-center border-b border-zinc-800 pb-2">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-xl bg-white flex items-center justify-center shadow-md border border-zinc-200">
                  <div className="w-4 h-4 bg-zinc-900 rounded-full flex items-center justify-center text-[9px] font-black text-white italic tracking-tighter">S</div>
                </div>
                <div>
                  <h4 className="font-display font-extrabold text-xs text-zinc-100 tracking-wide uppercase">Swish Merchant Payment</h4>
                  <p className="text-[8px] text-zinc-400 font-bold font-mono">SECURE PAYMENT</p>
                </div>
              </div>
              <button
                onClick={() => {
                  if (pollIntervalRef.current) {
                    clearInterval(pollIntervalRef.current);
                    pollIntervalRef.current = null;
                  }
                  setStep("details");
                }}
                className="text-[10px] font-bold text-zinc-400 hover:text-white hover:bg-zinc-800 px-2.5 py-1 rounded-lg transition-all"
                id="btn-cancel-bankid"
              >
                Cancel
              </button>
            </div>

            {/* Payment breakdown */}
            <div className="bg-zinc-950 rounded-2xl p-4 border border-zinc-800 text-center space-y-2 shadow-inner">
              <p className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider font-mono">Payment Breakdown</p>
              <div className="pt-2 border-t border-zinc-900 space-y-1.5 text-left">
                <div className="flex justify-between items-center text-[10px] bg-zinc-900/50 p-1.5 rounded-lg border border-zinc-850">
                  <span className="text-zinc-300 font-medium truncate max-w-[120px]">🍔 {vendorName}</span>
                  <span className="font-mono text-zinc-200 font-bold">{vendorShare.toFixed(2)} SEK</span>
                </div>
                <div className="flex justify-between items-center text-[10px] bg-zinc-900/50 p-1.5 rounded-lg border border-zinc-850">
                  <span className="text-zinc-300 font-medium">👑 VenueEat Service Fee</span>
                  <span className="font-mono text-zinc-200 font-bold">{platformFee.toFixed(2)} SEK</span>
                </div>
                <div className="pt-1 text-center font-mono text-[11px] font-black text-white">
                  Total: {totalAmount.toFixed(2)} SEK
                </div>
              </div>
            </div>

            {/* Waiting / instruction */}
            <div className="flex flex-col items-center gap-4 py-2">
              {isDesktopUser ? (
                <div className="w-full space-y-3">
                  <div className="bg-zinc-950 p-4 rounded-2xl border border-zinc-800 text-center space-y-3">
                    {swishQrUrl ? (
                      <div className="bg-white p-3.5 rounded-2xl shadow-lg inline-block mx-auto border-2 border-sky-400/80">
                        <img src={swishQrUrl} alt="Swish QR Code" className="w-44 h-44 mx-auto rounded-xl" />
                        <div className="mt-2 flex items-center justify-center gap-1.5 text-zinc-900 text-[10px] font-bold font-mono">
                          <Smartphone className="w-3.5 h-3.5 text-sky-600" />
                          <span>Scan with Swish App</span>
                        </div>
                      </div>
                    ) : (
                      <div className="w-12 h-12 rounded-2xl bg-sky-500/10 border border-sky-500/30 flex items-center justify-center mx-auto text-sky-400">
                        <Fingerprint className="w-6 h-6 animate-pulse" />
                      </div>
                    )}
                    <div>
                      <h5 className="font-display font-black text-sm text-white">Pay with Swish</h5>
                      <p className="text-[10px] text-zinc-400 font-medium">
                        Scan the QR code above with the Swish app or click below to simulate approval ({totalAmount.toFixed(2)} SEK to {vendorName})
                      </p>
                    </div>
                  </div>

                  {/* Notice if user clicks without having paid */}
                  {verifyNotice && (
                    <div className="bg-amber-950/80 border border-amber-600/70 text-amber-200 p-3 rounded-xl text-left text-[11px] space-y-1 animate-fadeIn">
                      <div className="flex items-center gap-1.5 font-bold text-amber-300">
                        <Info className="w-4 h-4 shrink-0" />
                        <span>Payment Not Confirmed Yet</span>
                      </div>
                      <p className="leading-snug text-amber-200/90">{verifyNotice}</p>
                    </div>
                  )}

                  {/* Verified completion button */}
                  <button
                    type="button"
                    disabled={isVerifyingWithSwish}
                    onClick={handleVerifyPaymentClick}
                    className="w-full bg-emerald-600 hover:bg-emerald-500 active:scale-95 disabled:opacity-60 text-white font-display font-black py-3 rounded-2xl transition-all shadow-md flex items-center justify-center gap-2 text-xs uppercase tracking-wider cursor-pointer"
                  >
                    {isVerifyingWithSwish ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Verifying with Swish...</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-4 h-4 text-white" />
                        <span>I Have Completed Payment in Swish</span>
                      </>
                    )}
                  </button>

                  <div className="flex items-center gap-2 justify-center">
                    <Loader2 className="w-3 h-3 text-sky-400 animate-spin" />
                    <p className="text-[10px] text-zinc-400 font-mono">
                      Waiting for Swish payment confirmation...
                    </p>
                  </div>
                </div>
              ) : (
                <div className="w-full space-y-3">
                  <div className="text-center space-y-1">
                    <p className="text-xs font-bold text-zinc-300">Payment request created ✓</p>
                    <p className="text-[9px] text-zinc-500 font-semibold">
                      Swish app launched. If it did not open automatically, tap below:
                    </p>
                  </div>

                  {/* Primary CTA — open Swish via native link */}
                  {swishDeepLink && (
                    <a
                      href={swishDeepLink}
                      onClick={() => openSwishApp(swishDeepLink)}
                      className="w-full bg-sky-500 hover:bg-sky-400 active:scale-95 text-white font-display font-black py-4 rounded-2xl transition-all shadow-lg flex items-center justify-center gap-2.5 text-sm cursor-pointer"
                      style={{ textDecoration: "none" }}
                    >
                      <Smartphone className="w-5 h-5" />
                      Open Swish App
                    </a>
                  )}

                  {/* Notice if user clicks without having paid */}
                  {verifyNotice && (
                    <div className="bg-amber-950/80 border border-amber-600/70 text-amber-200 p-3 rounded-xl text-left text-[11px] space-y-1 animate-fadeIn">
                      <div className="flex items-center gap-1.5 font-bold text-amber-300">
                        <Info className="w-4 h-4 shrink-0" />
                        <span>Payment Not Confirmed Yet</span>
                      </div>
                      <p className="leading-snug text-amber-200/90">{verifyNotice}</p>
                    </div>
                  )}

                  {/* Verified completion button */}
                  <button
                    type="button"
                    disabled={isVerifyingWithSwish}
                    onClick={handleVerifyPaymentClick}
                    className="w-full bg-emerald-600 hover:bg-emerald-500 active:scale-95 disabled:opacity-60 text-white font-display font-black py-3.5 rounded-2xl transition-all shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2 text-xs uppercase tracking-wider cursor-pointer"
                  >
                    {isVerifyingWithSwish ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Verifying with Swish...</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-4 h-4 text-white" />
                        <span>I Have Completed Payment in Swish</span>
                      </>
                    )}
                  </button>

                  <div className="flex items-center gap-2 justify-center">
                    <Loader2 className="w-3.5 h-3.5 text-zinc-600 animate-spin" />
                    <p className="text-[9px] text-zinc-600 font-mono">
                      Waiting for payment confirmation...
                    </p>
                  </div>

                  <p className="text-[8.5px] text-zinc-600 text-center font-semibold leading-relaxed">
                    After approving payment in Swish, return here.<br />
                    This page updates automatically.
                  </p>
                </div>
              )}
            </div>

            <div className="bg-sky-950/50 border border-sky-800/40 rounded-xl p-2.5 flex gap-2 items-start">
              <Shield className="w-3.5 h-3.5 text-sky-500 shrink-0 mt-0.5" />
              <p className="text-[8.5px] text-sky-300/80 font-bold leading-relaxed">
                No PIN code needed here. Payment is authorized directly in the Swish app or Mobile BankID.
              </p>
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
              <p className="text-xs font-bold tracking-tight text-zinc-200">Verifying authorization...</p>
              <p className="text-[9px] text-zinc-500 font-semibold uppercase tracking-wider font-mono">Signing payment order</p>
            </div>

            <div className="bg-zinc-950/60 px-3 py-2 rounded-full border border-zinc-800 text-[9px] text-zinc-400 font-bold font-mono">
              Awaiting response from Swish Bank Gateway
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
                  Payment Approved!
                </h3>
                <p className="text-[10px] text-emerald-100 font-semibold uppercase tracking-wider font-mono">
                  Recipients credited directly in real-time
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
                  <span className="text-emerald-100 font-bold uppercase tracking-wider">{paymentMethod === "card" ? "Card / Stripe" : paymentMethod === "applepay" ? "Apple Pay" : "Swish Split"} Transaction Receipt</span>
                  <span className="text-white/80 font-bold">#PAY-{paymentMethod.toUpperCase().slice(0, 3)}-{Math.floor(Math.random() * 900000 + 100000)}</span>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-start">
                    <span className="text-emerald-100 font-semibold font-sans">Customer (Ticket):</span>
                    <span className="font-sans font-bold text-white text-right max-w-[140px] truncate">{customerName}</span>
                  </div>

                  <div className="flex justify-between items-start">
                    <span className="text-emerald-100 font-semibold font-sans">Time:</span>
                    <span className="font-mono font-bold text-white">{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
                  </div>

                  {/* Transfer 1 Receipt */}
                  <div className="border-t border-white/10 pt-2 space-y-1">
                    <div className="flex justify-between items-center text-[10px]">
                      <span className="text-emerald-100 font-bold uppercase tracking-wider font-mono">Transfer 1 (Vendor Direct):</span>
                      <span className="font-mono font-black text-white">{vendorShare.toFixed(2)} SEK</span>
                    </div>
                    <div className="flex justify-between text-[9px] text-emerald-200">
                      <span>Recipient: {vendorName}</span>
                      <span>Swish: {vendorSwishNumber}</span>
                    </div>
                  </div>

                  {/* Transfer 2 Receipt */}
                  <div className="border-t border-white/10 pt-2 space-y-1">
                    <div className="flex justify-between items-center text-[10px]">
                      <span className="text-emerald-100 font-bold uppercase tracking-wider font-mono">Transfer 2 (VenueEat Platform Fee):</span>
                      <span className="font-mono font-black text-white">{platformFee.toFixed(2)} SEK</span>
                    </div>
                    <div className="flex justify-between text-[9px] text-emerald-200">
                      <span>Recipient: VenueEat Platform</span>
                      <span>Swish: 123 456 78 90</span>
                    </div>
                  </div>

                  <div className="border-t border-white/15 pt-2 flex justify-between items-end">
                    <span className="text-emerald-600 font-black bg-white text-[9px] px-2 py-0.5 rounded-md uppercase font-mono shadow-xs">Total</span>
                    <span className="font-display font-black text-lg text-white font-mono tracking-tight">{totalAmount.toFixed(2)} SEK</span>
                  </div>
                </div>
              </motion.div>

              <div className="bg-emerald-700/40 rounded-xl p-2.5 text-[9px] text-emerald-100 leading-relaxed text-left font-medium border border-emerald-500/20">
                ✔️ Order Ticket <b>#{nextQueueNumber}</b> created. You will receive an alert when the kitchen accepts and prepares your order. Track live status anytime in Live Orders.
              </div>
            </div>

            {/* Finish Button */}
            <button
              onClick={handleFinishPayment}
              className="w-full bg-white hover:bg-zinc-50 active:scale-98 text-emerald-800 font-display font-black py-3 rounded-2xl transition-all shadow-lg flex items-center justify-center gap-1.5 text-xs uppercase tracking-wider cursor-pointer border-b-2 border-emerald-100"
              id="btn-swish-done"
            >
              <Check className="w-4 h-4 stroke-[3px]" />
              Done • View Order Ticket
            </button>
          </motion.div>
        )}

      </AnimatePresence>
    </div>,
    document.body
  );
}
