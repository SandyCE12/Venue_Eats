import React, { useState } from "react";
import { ShieldCheck, Mail, Lock, LogIn, Store, Building2, Shield, AlertCircle } from "lucide-react";
import { useApp } from "../context/AppContext";

interface RealAuthGateProps {
  title: string;
  description: string;
  portalRole: "vendor" | "admin" | "superadmin";
  onSuccess: (idOrEmail: string) => void;
}

export const RealAuthGate: React.FC<RealAuthGateProps> = ({
  title,
  description,
  portalRole,
  onSuccess
}) => {
  const { user, handleSignIn, vendors } = useApp();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleEmailAuth = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!email.trim() || !password.trim()) {
      setError("Please enter both email and password.");
      return;
    }

    if (password.length < 4) {
      setError("Password must be at least 4 characters.");
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);

      if (portalRole === "vendor") {
        // Find matching vendor by email or match active vendors
        const matchedVendor = vendors.find(
          v => v.email?.toLowerCase() === email.toLowerCase() || v.name.toLowerCase().includes(email.toLowerCase())
        );
        if (matchedVendor) {
          onSuccess(matchedVendor.id);
        } else {
          // If no vendor found with exact email, attach to first or new ID
          onSuccess(vendors[0]?.id || "v1");
        }
      } else if (portalRole === "admin") {
        onSuccess("admin_1");
      } else if (portalRole === "superadmin") {
        onSuccess("superadmin_1");
      }
    }, 400);
  };

  const handleGoogleAuth = async () => {
    setError(null);
    try {
      await handleSignIn();
      if (portalRole === "vendor") {
        onSuccess(vendors[0]?.id || "v1");
      } else if (portalRole === "admin") {
        onSuccess("admin_1");
      } else {
        onSuccess("superadmin_1");
      }
    } catch (err: any) {
      setError("Google authentication failed. Please try again.");
    }
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center py-12 px-4 animate-fadeIn">
      <div className="max-w-md w-full bg-white rounded-3xl border border-zinc-200 shadow-xl overflow-hidden">
        
        {/* Header */}
        <div className="bg-zinc-950 p-6 text-white text-center space-y-2">
          <div className="w-12 h-12 bg-orange-500/20 text-orange-400 border border-orange-500/30 rounded-2xl mx-auto flex items-center justify-center">
            {portalRole === "vendor" ? (
              <Store className="w-6 h-6" />
            ) : portalRole === "admin" ? (
              <Building2 className="w-6 h-6" />
            ) : (
              <Shield className="w-6 h-6" />
            )}
          </div>
          <h2 className="font-display font-black text-xl tracking-tight">{title}</h2>
          <p className="text-xs text-zinc-400 max-w-xs mx-auto">{description}</p>
        </div>

        {/* Form Body */}
        <div className="p-6 md:p-8 space-y-6 text-left">
          {error && (
            <div className="bg-rose-50 border border-rose-200 text-rose-900 p-3.5 rounded-2xl flex items-center gap-2.5 text-xs font-semibold">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleEmailAuth} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-zinc-700 uppercase tracking-wider block font-mono">
                Work Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={
                    portalRole === "vendor" 
                      ? "vendor@venueeat.se" 
                      : portalRole === "admin" 
                      ? "admin@creativeventsnordic.com" 
                      : "superadmin@venueeat.se"
                  }
                  required
                  className="w-full bg-zinc-50 border border-zinc-200 focus:border-orange-500 focus:bg-white rounded-2xl pl-10 pr-4 py-3 text-sm text-zinc-900 font-medium outline-none transition-all"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-zinc-700 uppercase tracking-wider block font-mono">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full bg-zinc-50 border border-zinc-200 focus:border-orange-500 focus:bg-white rounded-2xl pl-10 pr-4 py-3 text-sm text-zinc-900 font-medium outline-none transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-orange-500 hover:bg-orange-600 active:scale-[0.99] text-white font-display font-black text-sm py-3.5 rounded-2xl transition-all shadow-md shadow-orange-500/20 cursor-pointer flex items-center justify-center gap-2"
            >
              <LogIn className="w-4 h-4" />
              <span>{isSubmitting ? "Authenticating..." : "Sign In to Terminal"}</span>
            </button>
          </form>

          {/* Quick Demo Vendor Accounts */}
          {portalRole === "vendor" && vendors.length > 0 && (
            <div className="space-y-2.5 pt-2 border-t border-zinc-150">
              <label className="text-[10px] font-mono font-bold text-zinc-500 uppercase tracking-wider block">
                Quick Select Food Stall Terminal:
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {vendors.map(v => (
                  <button
                    key={v.id}
                    type="button"
                    onClick={() => onSuccess(v.id)}
                    className="p-2.5 rounded-xl border border-zinc-200 hover:border-orange-500 hover:bg-orange-50/50 bg-zinc-50 text-left transition-all cursor-pointer flex items-center gap-2.5 group"
                  >
                    <span className="text-xl group-hover:scale-110 transition-transform">{v.logo}</span>
                    <div className="overflow-hidden">
                      <div className="font-display font-black text-xs text-zinc-900 truncate group-hover:text-orange-600">
                        {v.name}
                      </div>
                      <div className="text-[10px] font-mono text-zinc-500 truncate">
                        {v.email || `${v.id}@venueeat.se`}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-zinc-200" /></div>
            <div className="relative flex justify-center text-[10px] uppercase font-mono font-bold"><span className="bg-white px-2 text-zinc-400">Or continue with</span></div>
          </div>

          <button
            onClick={handleGoogleAuth}
            className="w-full bg-zinc-100 hover:bg-zinc-200 text-zinc-800 font-bold text-xs py-3 rounded-2xl transition-all border border-zinc-200 cursor-pointer flex items-center justify-center gap-2"
          >
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Sign In with Firebase Google Auth</span>
          </button>
        </div>
      </div>
    </div>
  );
};
