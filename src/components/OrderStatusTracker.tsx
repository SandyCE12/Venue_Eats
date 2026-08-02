import React from "react";
import { Order, OrderStatus } from "../types";
import { 
  Receipt, 
  Flame, 
  ShoppingBag, 
  CheckCircle2, 
  Clock, 
  AlertCircle
} from "lucide-react";

interface OrderStatusTrackerProps {
  order: Order;
  getAcceleratedCountdown?: () => string;
}

export default function OrderStatusTracker({ order, getAcceleratedCountdown }: OrderStatusTrackerProps) {
  const defaultCountdown = () => "4m 30s";
  const countdownFn = getAcceleratedCountdown || defaultCountdown;
  // Map the internal OrderStatus to steps
  const steps = [
    {
      id: "processing",
      label: "Processing",
      description: "Order received. Waiting for vendor confirmation...",
      icon: Receipt,
      color: "amber",
      isActive: (status: OrderStatus) => true, // Always active as it's the starting point
      isCompleted: (status: OrderStatus) => ["Preparing", "Ready", "Completed"].includes(status),
    },
    {
      id: "preparing",
      label: "Preparing",
      description: "Chef is cooking your order in real time!",
      icon: Flame,
      color: "orange",
      isActive: (status: OrderStatus) => ["Preparing", "Ready", "Completed"].includes(status),
      isCompleted: (status: OrderStatus) => ["Ready", "Completed"].includes(status),
    },
    {
      id: "ready",
      label: "Ready for Pickup",
      description: "Order is hot and fresh! Head to the Express Pickup lane.",
      icon: ShoppingBag,
      color: "emerald",
      isActive: (status: OrderStatus) => ["Ready", "Completed"].includes(status),
      isCompleted: (status: OrderStatus) => status === "Completed",
    },
    {
      id: "completed",
      label: "Collected",
      description: "Successfully picked up. Hope you enjoy!",
      icon: CheckCircle2,
      color: "zinc",
      isActive: (status: OrderStatus) => status === "Completed",
      isCompleted: (status: OrderStatus) => status === "Completed",
    },
  ];

  const currentStatusIndex = steps.findIndex(step => {
    if (order.status === "Placed") return step.id === "processing";
    if (order.status === "Preparing") return step.id === "preparing";
    if (order.status === "Ready") return step.id === "ready";
    if (order.status === "Completed") return step.id === "completed";
    return false;
  });

  return (
    <div className="space-y-6" id="order-status-tracker">
      {/* Mini status header */}
      <div className="flex justify-between items-center bg-zinc-50 border border-zinc-200/60 rounded-2xl p-3.5 shadow-sm">
        <div className="text-left">
          <span className="text-[9px] text-zinc-400 font-bold block uppercase tracking-wider">QUEUE NUMBER</span>
          <span className="text-xl font-display font-black text-zinc-900 font-mono">#{order.queueNumber}</span>
        </div>
        <div className="text-right">
          <span className="text-[9px] text-zinc-400 font-bold block uppercase tracking-wider">ESTIMATED WAIT</span>
          <span className="text-xs font-mono font-black text-orange-600 bg-orange-50 px-2 py-0.5 rounded-lg border border-orange-100">
            {order.status === "Preparing" ? countdownFn() : order.status === "Placed" ? `${order.estimatedPrepTime || 8}m` : "Ready"}
          </span>
        </div>
      </div>

      {/* Stepper Timeline */}
      <div className="relative pl-1 pr-1">
        {/* Progress bar background line */}
        <div className="absolute left-[21px] top-4 bottom-4 w-[3px] bg-zinc-200 rounded-full" />
        
        {/* Active colored progress bar line */}
        <div 
          className="absolute left-[21px] top-4 w-[3px] bg-gradient-to-b from-amber-500 via-orange-500 to-emerald-500 rounded-full transition-all duration-1000 ease-in-out"
          style={{
            height: `${Math.max(0, Math.min(100, (currentStatusIndex / (steps.length - 1)) * 100))}%`,
            maxHeight: "calc(100% - 32px)"
          }}
        />

        {/* Steps */}
        <div className="space-y-6">
          {steps.map((step, index) => {
            const isCompleted = step.isCompleted(order.status);
            const isCurrent = currentStatusIndex === index;
            const StepIcon = step.icon;

            // Compute dynamic theme classes
            let badgeBg = "bg-zinc-100 border-zinc-200 text-zinc-400";
            let textColor = "text-zinc-400";
            let ringColor = "";

            if (isCompleted) {
              if (step.color === "amber") {
                badgeBg = "bg-amber-500 border-amber-400 text-white";
              } else if (step.color === "orange") {
                badgeBg = "bg-orange-500 border-orange-400 text-white";
              } else if (step.color === "emerald") {
                badgeBg = "bg-emerald-500 border-emerald-400 text-white";
              } else {
                badgeBg = "bg-zinc-600 border-zinc-500 text-white";
              }
              textColor = "text-zinc-800 font-bold";
            } else if (isCurrent) {
              textColor = "text-zinc-900 font-black";
              if (step.color === "amber") {
                badgeBg = "bg-amber-50 border-amber-500 text-amber-600";
                ringColor = "ring-4 ring-amber-100 animate-pulse";
              } else if (step.color === "orange") {
                badgeBg = "bg-orange-50 border-orange-500 text-orange-600";
                ringColor = "ring-4 ring-orange-100 animate-pulse";
              } else if (step.color === "emerald") {
                badgeBg = "bg-emerald-50 border-emerald-500 text-emerald-600";
                ringColor = "ring-4 ring-emerald-100 animate-pulse";
              } else {
                badgeBg = "bg-zinc-50 border-zinc-500 text-zinc-600";
                ringColor = "ring-4 ring-zinc-100 animate-pulse";
              }
            }

            return (
              <div 
                key={step.id} 
                className={`flex gap-4 items-start relative transition-all duration-300 ${
                  isCurrent ? "scale-[1.01]" : isCompleted ? "opacity-95" : "opacity-60"
                }`}
              >
                {/* Step Circle Pin */}
                <div className="relative z-10">
                  <div className={`w-11 h-11 rounded-full flex items-center justify-center border-2 shadow-xs transition-all duration-500 ${badgeBg} ${ringColor}`}>
                    {isCompleted && index !== 3 ? (
                      <CheckCircle2 className="w-5.5 h-5.5 animate-scaleIn" />
                    ) : (
                      <StepIcon className={`w-5 h-5 ${isCurrent ? "animate-bounce" : ""}`} />
                    )}
                  </div>
                </div>

                {/* Step Metadata Card */}
                <div className={`flex-1 rounded-2xl p-3 border text-left transition-all duration-300 ${
                  isCurrent 
                    ? "bg-white border-zinc-300 shadow-md translate-x-0.5" 
                    : "bg-zinc-50/50 border-zinc-200/60 shadow-xs"
                }`}>
                  <div className="flex justify-between items-start gap-1">
                    <h5 className={`text-xs ${textColor} uppercase tracking-tight`}>
                      {step.label}
                    </h5>
                    {isCurrent && (
                      <span className={`text-[8px] font-black px-1.5 py-0.5 rounded-full uppercase tracking-wider animate-pulse ${
                        step.color === "amber" ? "bg-amber-100 text-amber-800" :
                        step.color === "orange" ? "bg-orange-100 text-orange-800" :
                        step.color === "emerald" ? "bg-emerald-100 text-emerald-800" :
                        "bg-zinc-100 text-zinc-800"
                      }`}>
                        LIVE
                      </span>
                    )}
                  </div>
                  
                  <p className="text-[10px] text-zinc-500 mt-1 leading-relaxed font-medium">
                    {isCurrent && step.id === "preparing" ? (
                      <>
                        <span>{step.description}</span>
                        <span className="block mt-1.5 text-[10px] font-mono text-orange-600 font-bold bg-orange-50 border border-orange-100/50 rounded-lg py-1 px-2.5 w-max flex items-center gap-1.5 shadow-xs">
                          <Clock className="w-3.5 h-3.5 animate-spin-slow shrink-0" />
                          <span>Preparing: {countdownFn()} remaining</span>
                        </span>
                      </>
                    ) : (
                      step.description
                    )}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
