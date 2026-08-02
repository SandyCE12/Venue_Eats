import React, { useState } from "react";
import { Vendor } from "../types";
import { 
  X, 
  Printer, 
  Download, 
  Smartphone, 
  Check, 
  Sparkles,
  QrCode,
  Info
} from "lucide-react";

interface TableQrGeneratorProps {
  vendor?: Vendor;
  isOpen?: boolean;
  onClose?: () => void;
  onSimulateScan?: (tableNumber: string) => void;
}

export default function TableQrGenerator({ 
  vendor: passedVendor, 
  isOpen = true, 
  onClose, 
  onSimulateScan 
}: TableQrGeneratorProps) {
  const [tableNum, setTableNum] = useState<string>("5");
  const [downloading, setDownloading] = useState(false);
  const [printing, setPrinting] = useState(false);

  const vendor = passedVendor || {
    id: "v1",
    name: "Delhi Street Sensation",
    logo: "🍛"
  } as Vendor;

  if (!isOpen) return null;

  const simulatedUrl = `https://venueeat.se/scan?v=${vendor.id}&table=${tableNum}`;

  const handleDownload = () => {
    setDownloading(true);
    setTimeout(() => {
      setDownloading(false);
      // Create a dummy download link to trigger an actual simulated file download
      const element = document.createElement("a");
      const file = new Blob([`Table QR Code for ${vendor.name} - Table ${tableNum}`], {type: 'text/plain'});
      element.href = URL.createObjectURL(file);
      element.download = `table_${tableNum}_qr_${vendor.id}.txt`;
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
    }, 1200);
  };

  const handlePrint = () => {
    setPrinting(true);
    setTimeout(() => {
      setPrinting(false);
      window.print();
    }, 1500);
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto animate-fadeIn" id="table-qr-generator-modal">
      <div className="bg-zinc-900 border-2 border-zinc-800 rounded-[32px] w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col md:flex-row relative">
        
        {/* Close Button */}
        {onClose && (
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full bg-zinc-950/60 border border-zinc-800 hover:border-zinc-700 text-zinc-400 hover:text-white flex items-center justify-center transition-all cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        )}

        {/* Left Side: Configuration Controls (Admin Dashboard look) */}
        <div className="p-6 md:p-8 flex-1 flex flex-col justify-between border-b md:border-b-0 md:border-r border-zinc-800/80 text-left">
          <div className="space-y-5">
            <div className="space-y-1">
              <span className="text-[9px] font-mono font-black text-orange-400 uppercase tracking-widest flex items-center gap-1.5">
                <QrCode className="w-3.5 h-3.5" /> Table Signage Studio
              </span>
              <h3 className="text-xl font-display font-black text-white leading-tight">
                Generate Table QR
              </h3>
              <p className="text-xs text-zinc-400 leading-relaxed font-medium">
                Create a high-contrast physical stand for festival tables. Attendees scan to instantly order from <span className="text-white font-bold">{vendor.name}</span> without standing in queue.
              </p>
            </div>

            {/* Table Selector */}
            <div className="space-y-2 bg-zinc-950 p-4 rounded-2xl border border-zinc-800/80">
              <label className="text-[10px] text-zinc-400 font-black uppercase tracking-wider block">
                Assign Table Number
              </label>
              <div className="flex gap-2">
                {["3", "5", "12", "18"].map((num) => (
                  <button
                    key={num}
                    onClick={() => setTableNum(num)}
                    className={`flex-1 py-1.5 px-2.5 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                      tableNum === num 
                        ? "bg-orange-500 text-white border border-orange-400" 
                        : "bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-850"
                    }`}
                  >
                    T-{num}
                  </button>
                ))}
                <input
                  type="text"
                  value={tableNum}
                  onChange={(e) => setTableNum(e.target.value.slice(0, 4))}
                  placeholder="Custom"
                  className="w-16 bg-zinc-900 border border-zinc-800 hover:border-zinc-700 focus:border-orange-500 focus:outline-none rounded-lg text-center text-xs font-mono font-bold text-white px-1"
                />
              </div>
              <p className="text-[9px] text-zinc-500 leading-snug mt-1">
                Assigning a table allows the kitchen to know exactly where to deliver or direct orders.
              </p>
            </div>

            {/* Simulated Live Scan CTA - The magic bridge! */}
            <div className="bg-orange-500/10 border border-orange-500/20 p-4 rounded-2xl space-y-3">
              <div className="flex gap-2 items-start text-orange-400">
                <Smartphone className="w-4 h-4 shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <h5 className="text-xs font-black uppercase tracking-tight">Interactive Simulation</h5>
                  <p className="text-[10px] text-zinc-400 leading-relaxed font-medium">
                    Test the attendee's fast-track experience. This action simulates scanning this exact table sign on the mobile device.
                  </p>
                </div>
              </div>
              <button
                onClick={() => onSimulateScan && onSimulateScan(tableNum)}
                className="w-full bg-orange-500 hover:bg-orange-600 text-white text-xs font-black py-2.5 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-md shadow-orange-500/10 active:scale-95 border-b-2 border-orange-600"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Scan QR on Mobile Simulator</span>
              </button>
            </div>
          </div>

          {/* Quick Print & Download buttons */}
          <div className="grid grid-cols-2 gap-2 mt-6">
            <button
              onClick={handlePrint}
              disabled={printing}
              className="bg-zinc-800 hover:bg-zinc-750 text-white border border-zinc-700/60 rounded-xl py-2 px-3 text-[11px] font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
            >
              <Printer className="w-3.5 h-3.5 text-zinc-400" />
              <span>{printing ? "Printing..." : "Print Signage"}</span>
            </button>
            <button
              onClick={handleDownload}
              disabled={downloading}
              className="bg-zinc-800 hover:bg-zinc-750 text-white border border-zinc-700/60 rounded-xl py-2 px-3 text-[11px] font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
            >
              <Download className="w-3.5 h-3.5 text-zinc-400" />
              <span>{downloading ? "Downloading..." : "Download PNG"}</span>
            </button>
          </div>
        </div>

        {/* Right Side: High-fidelity realistic Printable Table Tent Sign Preview */}
        <div className="p-6 md:p-8 bg-zinc-100 flex flex-col items-center justify-center relative min-h-[360px] md:w-[280px]">
          {/* Subtle wooden/acrylic table stand visual representation */}
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-4/5 h-2.5 bg-zinc-400/30 rounded-full blur-xs pointer-events-none" />
          
          <div className="bg-white text-zinc-900 border-[3px] border-zinc-900 shadow-xl rounded-2xl p-5 w-full max-w-[220px] text-center space-y-4 relative flex flex-col justify-between aspect-[1/1.5] transition-transform duration-300 hover:scale-[1.02]">
            
            {/* Crown / Swedish design motif */}
            <div className="flex flex-col items-center gap-0.5">
              <span className="text-xs text-zinc-400 font-bold tracking-widest uppercase block">★ VENUEEAT ★</span>
              <div className="h-0.5 w-16 bg-zinc-900 rounded-full" />
            </div>

            {/* Title */}
            <div className="space-y-1">
              <h4 className="font-display font-black text-sm uppercase tracking-tight leading-none text-zinc-900">
                SCAN TO ORDER
              </h4>
              <p className="text-[8px] text-zinc-500 font-bold leading-tight uppercase tracking-wider">
                Avoid queues at {vendor.logo} {vendor.name}
              </p>
            </div>

            {/* Crisp vector QR code layout with logo in center */}
            <div className="relative w-28 h-28 mx-auto border-2 border-zinc-900 p-1 bg-white rounded-xl shadow-xs flex items-center justify-center">
              <svg viewBox="0 0 100 100" className="w-full h-full text-zinc-900" fill="currentColor">
                {/* 3 Main Corner Tracking Markers */}
                {/* Top-Left */}
                <rect x="0" y="0" width="28" height="28" rx="2" />
                <rect x="4" y="4" width="20" height="20" rx="1" fill="white" />
                <rect x="8" y="8" width="12" height="12" rx="0.5" />
                
                {/* Top-Right */}
                <rect x="72" y="0" width="28" height="28" rx="2" />
                <rect x="76" y="4" width="20" height="20" rx="1" fill="white" />
                <rect x="80" y="8" width="12" height="12" rx="0.5" />
                
                {/* Bottom-Left */}
                <rect x="0" y="72" width="28" height="28" rx="2" />
                <rect x="4" y="76" width="20" height="20" rx="1" fill="white" />
                <rect x="8" y="80" width="12" height="12" rx="0.5" />

                {/* Simulated QR block details (Pixel columns) */}
                {/* Top Center details */}
                <rect x="36" y="4" width="8" height="8" />
                <rect x="52" y="0" width="12" height="4" />
                <rect x="48" y="12" width="16" height="4" />
                <rect x="36" y="20" width="4" height="8" />
                <rect x="56" y="20" width="8" height="8" />

                {/* Right side details */}
                <rect x="80" y="36" width="12" height="8" />
                <rect x="72" y="48" width="8" height="12" />
                <rect x="88" y="52" width="8" height="4" />
                <rect x="80" y="60" width="16" height="8" />

                {/* Bottom Center & Right details */}
                <rect x="36" y="76" width="12" height="4" />
                <rect x="52" y="72" width="8" height="12" />
                <rect x="40" y="88" width="16" height="8" />
                <rect x="76" y="76" width="12" height="12" />
                <rect x="92" y="80" width="8" height="16" />

                {/* Center cutout area for Vendor Logo */}
                <rect x="34" y="34" width="32" height="32" rx="6" fill="white" stroke="currentColor" strokeWidth="1" />
              </svg>
              
              {/* Vendor's Logo in the exact center of the QR code! */}
              <div className="absolute inset-0 m-auto w-8 h-8 rounded-full bg-white shadow-md border border-zinc-200 flex items-center justify-center text-sm font-bold z-10">
                {vendor.logo}
              </div>
            </div>

            {/* Step guidance */}
            <div className="space-y-0.5 text-center">
              <p className="text-[7px] text-zinc-400 font-bold uppercase tracking-wider">Instructions</p>
              <p className="text-[7px] text-zinc-800 font-semibold leading-tight">
                Open camera • Scan QR • Pay via Swish • Pickup at food truck
              </p>
            </div>

            {/* Table Badge */}
            <div className="bg-zinc-950 text-white py-1 rounded-lg border border-zinc-800 font-mono text-[10px] font-black uppercase tracking-widest">
              TABLE {tableNum}
            </div>

          </div>
          
          <div className="mt-3 text-zinc-500 text-[9px] font-bold uppercase tracking-widest text-center">
            PROTOTYPE PREVIEW
          </div>
        </div>

      </div>
    </div>
  );
}
