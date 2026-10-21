import React, { useState } from "react";
import { ShieldCheck, Mail, Lock, LogIn, Store, Building2, Shield, AlertCircle } from "lucide-react";
import { useApp } from "../context/AppContext";
import { AUTHORIZED_SUPER_ADMINS } from "../data";

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
  const { user, handleSignIn, vendors, managedEvents, activeEventId, setActiveEventId } = useApp();
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
        const cleanEmail = email.trim().toLowerCase();
        const matchedVendor = vendors.find(
          v => v.email?.trim().toLowerCase() === cleanEmail || v.name.toLowerCase() === cleanEmail
        );
        if (matchedVendor) {
          const expectedPassword = matchedVendor.password || matchedVendor.pin || "vendor123";
          if (password.trim() === expectedPassword) {
            onSuccess(matchedVendor.id);
          } else {
            setError(`Incorrect password for ${matchedVendor.name}. Please enter the password provided during onboarding.`);
          }
        } else {
          setError(`No vendor stall registered with email "${email}".`);
        }
      } else if (portalRole === "admin") {
        const cleanEmail = email.trim().toLowerCase();
        const matchedEvt = managedEvents.find(
          e => e.organizerEmail.trim().toLowerCase() === cleanEmail
        );

        if (matchedEvt) {
          const expectedPassword = matchedEvt.adminPassword || "eventadmin2026";
          if (password.trim() === expectedPassword) {
            setActiveEventId(matchedEvt.id);
            onSuccess(matchedEvt.organizerEmail);
          } else {
            setError(`Incorrect password for ${matchedEvt.name}. Please enter the password configured by Super Admin.`);
          }
        } else {
          setError(`No Event Admin account found for "${email}". Check Super Admin console for the email assigned to your event.`);
        }
      } else if (portalRole === "superadmin") {
        const cleanEmail = email.trim().toLowerCase();
        const superAdmin = AUTHORIZED_SUPER_ADMINS.find(
          sa => sa.email.toLowerCase() === cleanEmail
        );

        if (superAdmin && password === superAdmin.password) {
          onSuccess(superAdmin.email);
        } else {
          setError("Access Denied: Invalid Super Admin ID or Password. Only authorized platform owners can enter.");
        }
      }
    }, 300);
  };

  const handleGoogleAuth = async () => {
    setError(null);
    setIsSubmitting(true);
    try {
      const signedInUser = await handleSignIn();
      const currentGoogleEmail = signedInUser?.email?.trim().toLowerCase();

      if (!currentGoogleEmail) {
        setError("Could not retrieve email from Google Sign-In. Please try again.");
        setIsSubmitting(false);
        return;
      }

      if (portalRole === "vendor") {
        const matchedVendor = vendors.find(
          v => v.email?.trim().toLowerCase() === currentGoogleEmail || v.name.toLowerCase().includes(currentGoogleEmail)
        );
        if (matchedVendor) {
          onSuccess(matchedVendor.id);
        } else {
          setError(`Access Denied: Google account "${currentGoogleEmail}" is not associated with any registered food stall.`);
        }
      } else if (portalRole === "admin") {
        // Find matching festival event provisioned for this exact Google email
        const matchedEvt = managedEvents.find(
          e => e.organizerEmail.trim().toLowerCase() === currentGoogleEmail
        );

        if (matchedEvt) {
          setActiveEventId(matchedEvt.id);
          onSuccess(matchedEvt.organizerEmail);
        } else if (
          // Super Admins can also inspect event admin console
          AUTHORIZED_SUPER_ADMINS.some(sa => sa.email.toLowerCase() === currentGoogleEmail)
        ) {
          const defaultEvt = managedEvents.find(e => e.id === activeEventId) || managedEvents[0];
          if (defaultEvt) {
            setActiveEventId(defaultEvt.id);
            onSuccess(currentGoogleEmail);
          } else {
            setError("No active events found.");
          }
        } else {
          setError(
            `Access Denied: Google account "${currentGoogleEmail}" is not registered as an Event Admin for any event. Please ask Super Admin to assign this email address to your event.`
          );
        }
      } else {
        // portalRole === "superadmin"
        const isAuthorizedSuperAdmin = AUTHORIZED_SUPER_ADMINS.some(
          sa => sa.email.toLowerCase() === currentGoogleEmail
        );

        if (isAuthorizedSuperAdmin) {
          onSuccess(currentGoogleEmail);
        } else {
          setError(`Access Denied: Google account "${currentGoogleEmail}" is not an authorized Super Admin.`);
        }
      }
    } catch (err: any) {
      if (err?.code !== "auth/popup-closed-by-user") {
        setError(err?.message || "Google authentication failed. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
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

          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-zinc-200" /></div>
            <div className="relative flex justify-center text-[10px] uppercase font-mono font-bold"><span className="bg-white px-2 text-zinc-400">Or continue with</span></div>
          </div>

          <button
            type="button"
            disabled={isSubmitting}
            onClick={handleGoogleAuth}
            className="w-full bg-zinc-100 hover:bg-zinc-200 text-zinc-800 font-bold text-xs py-3.5 rounded-2xl transition-all border border-zinc-200 cursor-pointer flex items-center justify-center gap-2 disabled:opacity-60"
          >
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Sign In with Firebase Google Auth</span>
          </button>
        </div>
      </div>
    </div>
  );
};
