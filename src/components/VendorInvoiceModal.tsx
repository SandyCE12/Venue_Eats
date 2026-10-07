import React from "react";
import { VendorInvoice } from "../types";
import { X, Printer, Download, CheckCircle2, FileText, Landmark, Phone, Mail, Building2, Calendar, ShieldCheck } from "lucide-react";

interface VendorInvoiceModalProps {
  invoice: VendorInvoice;
  onClose: () => void;
}

export const VendorInvoiceModal: React.FC<VendorInvoiceModalProps> = ({ invoice, onClose }) => {
  const isReceipt = invoice.type === "receipt";

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-zinc-950/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white text-zinc-900 rounded-3xl max-w-2xl w-full shadow-2xl overflow-hidden border border-zinc-200 my-auto text-left animate-fadeIn">
        
        {/* Top Control Bar */}
        <div className="bg-zinc-900 text-white px-6 py-4 flex items-center justify-between print:hidden">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-orange-400" />
            <span className="font-display font-black text-xs uppercase tracking-wider">
              {isReceipt ? "Avräkningsnota (Settlement Receipt)" : "Faktura (Invoice)"} #{invoice.invoiceNumber}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="bg-zinc-800 hover:bg-zinc-700 text-white px-3 py-1.5 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / PDF</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Document Body */}
        <div className="p-6 sm:p-8 space-y-6">
          
          {/* Document Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start gap-4 border-b border-zinc-200 pb-6">
            <div>
              <div className="flex items-center gap-2">
                <span className="bg-orange-500 text-white text-xs font-black px-2 py-0.5 rounded-md font-display">
                  VE
                </span>
                <span className="font-display font-black text-lg tracking-tight text-zinc-950">
                  VenueEat Nordic
                </span>
              </div>
              <p className="text-[10px] text-zinc-500 font-medium mt-1">
                Creative Events Nordic AB • Org.nr: 559123-4567<br />
                Kungsträdgården, 111 47 Stockholm<br />
                sandy@creativeventsnordic.com • www.venueeat.se
              </p>
            </div>

            <div className="text-left sm:text-right">
              <span className={`inline-block text-[10px] font-mono font-black uppercase px-2.5 py-1 rounded-full mb-1 ${
                isReceipt 
                  ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                  : "bg-sky-100 text-sky-800 border border-sky-300"
              }`}>
                {isReceipt ? "Avräkning Klar • Settled" : "Faktura • Issued"}
              </span>
              <h2 className="font-display font-black text-xl text-zinc-900 tracking-tight">
                {isReceipt ? "AVRÄKNINGSNOTA" : "FAKTURA"}
              </h2>
              <p className="font-mono text-xs font-bold text-zinc-600">
                Nr: {invoice.invoiceNumber}
              </p>
              <p className="text-[10px] text-zinc-500 font-mono">
                Datum: {invoice.issueDate}
              </p>
              {invoice.dueDate && (
                <p className="text-[10px] text-zinc-500 font-mono">
                  Förfallodatum: {invoice.dueDate}
                </p>
              )}
            </div>
          </div>

          {/* Event & Vendor Info Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-zinc-50 rounded-2xl p-4 border border-zinc-200 text-xs">
            <div>
              <span className="text-[9px] font-mono uppercase text-zinc-400 font-bold block mb-1">
                Mottagare / Vendor Stall
              </span>
              <p className="font-bold text-zinc-900 text-sm">{invoice.vendorName}</p>
              <p className="text-zinc-600 text-[11px] flex items-center gap-1 mt-0.5">
                <Mail className="w-3 h-3 text-zinc-400" /> {invoice.vendorEmail}
              </p>
              <p className="text-zinc-600 text-[11px] flex items-center gap-1 mt-0.5">
                <Calendar className="w-3 h-3 text-zinc-400" /> Event: <strong>{invoice.eventName}</strong>
              </p>
            </div>

            <div className="border-t sm:border-t-0 sm:border-l border-zinc-200 pt-3 sm:pt-0 sm:pl-4">
              {isReceipt ? (
                <>
                  <span className="text-[9px] font-mono uppercase text-zinc-400 font-bold block mb-1">
                    Utbetalningsuppgifter (Vendor Settlement Account)
                  </span>
                  <div className="space-y-1 font-mono text-[11px] text-zinc-700">
                    <p>Bank: <strong className="text-zinc-900">{invoice.bankDetails?.bankName || "SEB"}</strong></p>
                    <p>Clearing &amp; Konto: <strong className="text-zinc-900">{invoice.bankDetails?.clearingNumber ? `${invoice.bankDetails.clearingNumber} - ` : ""}{invoice.bankDetails?.accountNumber || "Direktavräkning"}</strong></p>
                    {invoice.bankDetails?.swishNumber && (
                      <p>Swish Företag: <strong className="text-emerald-700">{invoice.bankDetails.swishNumber}</strong></p>
                    )}
                    {invoice.bankDetails?.bankGiro && (
                      <p>Bankgiro: <strong>{invoice.bankDetails.bankGiro}</strong></p>
                    )}
                  </div>
                </>
              ) : (
                <>
                  <span className="text-[9px] font-mono uppercase text-orange-600 font-bold block mb-1">
                    Inbetalningsuppgifter till Arrangör (Pay to Event Admin)
                  </span>
                  <div className="space-y-1 font-mono text-[11px] text-zinc-700">
                    <p>Bankgiro: <strong className="text-zinc-950 font-bold">{invoice.issuerBankDetails?.bankGiro || "5123-4567"}</strong></p>
                    {invoice.issuerBankDetails?.plusGiro && (
                      <p>Plusgiro: <strong className="text-zinc-900">{invoice.issuerBankDetails.plusGiro}</strong></p>
                    )}
                    <p>Swish Företag: <strong className="text-emerald-700">{invoice.issuerBankDetails?.swishNumber || "123 918 27 36"}</strong></p>
                    <p>Bank: <strong className="text-zinc-900">{invoice.issuerBankDetails?.bankName || "SEB"}</strong></p>
                    {invoice.issuerBankDetails?.accountNumber && (
                      <p>Konto: <strong className="text-zinc-900">{invoice.issuerBankDetails?.clearingNumber ? `${invoice.issuerBankDetails.clearingNumber} - ` : ""}{invoice.issuerBankDetails.accountNumber}</strong></p>
                    )}
                    <p className="text-orange-700 pt-0.5">
                      OCR / Referens: <strong className="bg-orange-100 px-1 py-0.5 rounded font-bold">{invoice.invoiceNumber}</strong>
                    </p>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Line Items Table */}
          <div className="border border-zinc-200 rounded-2xl overflow-hidden">
            <table className="w-full text-xs text-left">
              <thead className="bg-zinc-100 border-b border-zinc-200 text-[10px] font-mono uppercase text-zinc-500">
                <tr>
                  <th className="py-2.5 px-4 font-bold">Beskrivning / Specifikation</th>
                  <th className="py-2.5 px-4 text-center font-bold">Moms</th>
                  <th className="py-2.5 px-4 text-right font-bold">Belopp (SEK)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 font-medium">
                <tr>
                  <td className="py-3 px-4">
                    <p className="font-bold text-zinc-900">
                      {isReceipt 
                        ? `Bruttoförsäljning (${invoice.ordersCount || "Alla"} festivalordrar via VenueEat)` 
                        : "Platsavgift & Festivalbokning"}
                    </p>
                    <p className="text-[10px] text-zinc-500">
                      {invoice.eventName} • Digitala Swish- &amp; Kortköp
                    </p>
                  </td>
                  <td className="py-3 px-4 text-center font-mono text-zinc-600">12%</td>
                  <td className="py-3 px-4 text-right font-mono font-bold text-zinc-900">
                    {invoice.grossAmount.toLocaleString("sv-SE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} kr
                  </td>
                </tr>

                {isReceipt && invoice.commissionAmount > 0 && (
                  <tr className="bg-zinc-50/50">
                    <td className="py-2.5 px-4">
                      <p className="font-bold text-zinc-700">Avgår VenueEat Plattformsprovision (3.5%)</p>
                      <p className="text-[10px] text-zinc-500">
                        Drift av realtidsordersystem, Swish Handel routing &amp; köoptimering
                      </p>
                    </td>
                    <td className="py-2.5 px-4 text-center font-mono text-zinc-600">25%</td>
                    <td className="py-2.5 px-4 text-right font-mono font-bold text-rose-600">
                      - {invoice.commissionAmount.toLocaleString("sv-SE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} kr
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Totals Summary */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-zinc-900 text-white rounded-2xl p-4 sm:p-5">
            <div>
              <span className="text-[10px] font-mono uppercase text-zinc-400 font-bold block">
                {isReceipt ? "Netto att utbetala till kontohavare" : "Totalt att betala"}
              </span>
              <p className="text-[10px] text-emerald-400 flex items-center gap-1 mt-0.5">
                <ShieldCheck className="w-3.5 h-3.5" /> Skatteverket-godkänd avräkningsspecifikation
              </p>
            </div>
            <div className="mt-3 sm:mt-0 text-left sm:text-right">
              <span className="font-display font-black text-2xl text-emerald-400 font-mono">
                {invoice.netPayoutAmount.toLocaleString("sv-SE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} SEK
              </span>
            </div>
          </div>

          {/* Notes & Comments */}
          {invoice.notes && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-900">
              <span className="font-bold block text-[10px] uppercase font-mono text-amber-700">Meddelande från Festivalledningen:</span>
              <p className="mt-0.5 text-[11px] leading-relaxed">{invoice.notes}</p>
            </div>
          )}

          {/* Footer Legal & Verification */}
          <div className="border-t border-zinc-200 pt-4 flex flex-col sm:flex-row justify-between items-center text-[10px] text-zinc-400 font-mono gap-2">
            <span>Genererad automatiskt av VenueEat Nordic Portal</span>
            <span>Ref: {invoice.id} • {new Date(invoice.sentAt).toLocaleString("sv-SE")}</span>
          </div>

        </div>

      </div>
    </div>
  );
};
