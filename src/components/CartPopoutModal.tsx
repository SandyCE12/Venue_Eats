import React, { useState } from "react";
import { createPortal } from "react-dom";
import { 
  ShoppingBag, 
  X, 
  Plus, 
  Minus, 
  Trash2, 
  QrCode, 
  MapPin, 
  ChevronRight, 
  Utensils, 
  Store, 
  CreditCard, 
  Smartphone, 
  Clock, 
  Sparkles,
  ArrowRight,
  ShieldCheck
} from "lucide-react";
import { useApp } from "../context/AppContext";
import { MenuItem, ExtraOption } from "../types";

interface CartPopoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProceedToSwish: () => void;
}

export const CartPopoutModal: React.FC<CartPopoutModalProps> = ({
  isOpen,
  onClose,
  onProceedToSwish,
}) => {
  const {
    cartEntries,
    setCartEntries,
    addToCart,
    removeFromCart,
    clearCart,
    activeTable,
    setActiveTable,
    vendors,
    activeVendorId,
    orders
  } = useApp();

  const [orderNotes, setOrderNotes] = useState<string>("");
  const [diningOption, setDiningOption] = useState<"dine-in" | "takeaway">("dine-in");
  const [tableInput, setTableInput] = useState<string>(activeTable || "");
  const [isEditingTable, setIsEditingTable] = useState<boolean>(false);

  if (!isOpen) return null;

  const totalItemCount = cartEntries.reduce((sum, entry) => sum + Number(entry.quantity), 0);

  const getSubtotal = (): number => {
    return cartEntries.reduce((sum, entry) => {
      const extrasCost = entry.selectedExtras.reduce((eSum, extra) => eSum + Number(extra.price || 0), 0);
      return sum + ((Number(entry.menuItem.price) + extrasCost) * Number(entry.quantity));
    }, 0);
  };

  const handleIncrease = (entryId: string) => {
    setCartEntries(prev =>
      prev.map(entry => {
        if (entry.id === entryId) {
          addToCart(entry.menuItem.id, 1);
          return { ...entry, quantity: entry.quantity + 1 };
        }
        return entry;
      })
    );
  };

  const handleDecrease = (entryId: string) => {
    setCartEntries(prev => {
      const target = prev.find(e => e.id === entryId);
      if (!target) return prev;
      removeFromCart(target.menuItem.id);
      if (target.quantity > 1) {
        return prev.map(e => (e.id === entryId ? { ...e, quantity: e.quantity - 1 } : e));
      } else {
        return prev.filter(e => e.id !== entryId);
      }
    });
  };

  const handleRemoveEntry = (entryId: string) => {
    setCartEntries(prev => {
      const target = prev.find(e => e.id === entryId);
      if (target) {
        for (let i = 0; i < target.quantity; i++) {
          removeFromCart(target.menuItem.id);
        }
      }
      return prev.filter(e => e.id !== entryId);
    });
  };

  const handleSaveTable = () => {
    if (tableInput.trim()) {
      setActiveTable(tableInput.trim());
    } else {
      setActiveTable(null);
    }
    setIsEditingTable(false);
  };

  // Find vendor for each item if from diverse stalls
  const getVendorNameForItem = (menuItem: MenuItem) => {
    const matchedVendor = vendors.find(v => v.menu.some(m => m.id === menuItem.id));
    return matchedVendor?.name || "Festival Food Stall";
  };

  const nextQueueNumber = orders.length > 0 ? Math.max(...orders.map(o => o.queueNumber)) + 1 : 101;

  return createPortal(
    <div
      id="cart-popout-overlay"
      className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-5 bg-zinc-950/75 backdrop-blur-sm animate-fadeIn overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        id="cart-popout-page"
        className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-zinc-200 overflow-hidden flex flex-col max-h-[92vh] text-left transition-all animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* POP-OUT HEADER */}
        <div className="bg-zinc-900 text-white px-5 sm:px-7 py-4.5 flex items-center justify-between border-b border-zinc-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-orange-500 text-white flex items-center justify-center shadow-md shadow-orange-500/20 shrink-0">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-display font-black text-lg sm:text-xl text-white tracking-tight">
                  Your Food Cart
                </h2>
                <span className="bg-zinc-800 text-orange-400 font-mono text-xs font-black px-2 py-0.5 rounded-full border border-zinc-700">
                  {totalItemCount} {totalItemCount === 1 ? "item" : "items"}
                </span>
              </div>
              <p className="text-[11px] text-zinc-400 font-medium flex items-center gap-1.5 mt-0.5">
                <MapPin className="w-3 h-3 text-orange-400" /> Kungsträdgården Festival • Direct Stall Delivery
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {cartEntries.length > 0 && (
              <button
                type="button"
                onClick={() => clearCart()}
                className="hidden sm:inline-flex items-center gap-1 text-[11px] font-bold text-zinc-400 hover:text-red-400 px-2.5 py-1.5 rounded-xl hover:bg-zinc-800 transition-colors cursor-pointer"
                title="Clear all cart items"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear</span>
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="text-zinc-400 hover:text-white p-2 rounded-xl hover:bg-zinc-800 transition-colors cursor-pointer min-h-[40px] min-w-[40px] flex items-center justify-center"
              aria-label="Close cart pop-out"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* POP-OUT BODY CONTENT */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-7 space-y-6">
          {cartEntries.length === 0 ? (
            /* EMPTY STATE */
            <div className="text-center py-12 px-4 space-y-4">
              <div className="w-16 h-16 rounded-3xl bg-orange-50 border border-orange-100 text-orange-500 mx-auto flex items-center justify-center">
                <ShoppingBag className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <h3 className="font-display font-black text-lg text-zinc-900">Your cart is currently empty</h3>
                <p className="text-xs text-zinc-500 max-w-sm mx-auto">
                  Browse over 20 authentic festival food trucks, delicious meals, street snacks, and ice-cold artisan drinks!
                </p>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="inline-flex items-center gap-2 bg-zinc-900 hover:bg-zinc-800 text-white font-display font-black text-xs px-5 py-3 rounded-2xl transition-all cursor-pointer shadow-sm"
              >
                <Utensils className="w-4 h-4 text-orange-400" />
                <span>Explore Stalls & Dishes</span>
              </button>
            </div>
          ) : (
            <>
              {/* TABLE & DINING PREFERENCE BAR */}
              <div className="bg-zinc-50 p-4 rounded-2xl border border-zinc-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center shrink-0">
                    <QrCode className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">
                      Dining Location
                    </span>
                    {isEditingTable ? (
                      <div className="flex items-center gap-1.5 mt-1">
                        <input
                          type="text"
                          placeholder="e.g. Table 12"
                          value={tableInput}
                          onChange={(e) => setTableInput(e.target.value)}
                          className="bg-white border border-zinc-300 rounded-lg px-2 py-1 text-xs font-bold text-zinc-900 w-28 focus:outline-hidden focus:border-orange-500"
                          autoFocus
                        />
                        <button
                          type="button"
                          onClick={handleSaveTable}
                          className="bg-zinc-900 text-white font-bold px-2 py-1 rounded-lg hover:bg-zinc-800 cursor-pointer"
                        >
                          Save
                        </button>
                      </div>
                    ) : (
                      <span className="font-display font-black text-zinc-900 text-xs">
                        {activeTable ? `Table #${activeTable} (Direct Delivery)` : "Takeaway / Stall Pickup"}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center">
                  {!isEditingTable && (
                    <button
                      type="button"
                      onClick={() => {
                        setTableInput(activeTable || "");
                        setIsEditingTable(true);
                      }}
                      className="text-orange-600 font-bold hover:text-orange-700 underline text-xs cursor-pointer"
                    >
                      {activeTable ? "Change Table" : "Add Table #"}
                    </button>
                  )}

                  <div className="flex bg-zinc-200/70 p-0.5 rounded-xl text-[11px] font-bold">
                    <button
                      type="button"
                      onClick={() => setDiningOption("dine-in")}
                      className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                        diningOption === "dine-in" ? "bg-white text-zinc-900 shadow-xs font-black" : "text-zinc-500"
                      }`}
                    >
                      Eat Here
                    </button>
                    <button
                      type="button"
                      onClick={() => setDiningOption("takeaway")}
                      className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                        diningOption === "takeaway" ? "bg-white text-zinc-900 shadow-xs font-black" : "text-zinc-500"
                      }`}
                    >
                      Takeaway
                    </button>
                  </div>
                </div>
              </div>

              {/* LIST OF CART ITEMS */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-display font-black text-xs uppercase tracking-wider text-zinc-500">
                    Selected Items ({cartEntries.length})
                  </h3>
                  <span className="text-[11px] text-zinc-400 font-medium">
                    Queue Est. ~10 mins
                  </span>
                </div>

                <div className="divide-y divide-zinc-100 border border-zinc-200/80 rounded-2xl overflow-hidden bg-white shadow-xs">
                  {cartEntries.map((entry) => {
                    const extrasCost = entry.selectedExtras.reduce((sum, e) => sum + e.price, 0);
                    const unitPrice = Number(entry.menuItem.price) + extrasCost;
                    const itemTotal = unitPrice * Number(entry.quantity);
                    const vendorName = getVendorNameForItem(entry.menuItem);

                    return (
                      <div
                        key={entry.id}
                        className="p-3.5 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-zinc-50/70 transition-colors"
                      >
                        <div className="flex items-start gap-3 flex-1 min-w-0">
                          {entry.menuItem.imageUrl ? (
                            <img
                              src={entry.menuItem.imageUrl}
                              alt={entry.menuItem.name}
                              referrerPolicy="no-referrer"
                              className="w-14 h-14 rounded-xl object-cover border border-zinc-100 shrink-0"
                            />
                          ) : (
                            <div className="w-14 h-14 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center font-bold text-lg shrink-0">
                              🍽️
                            </div>
                          )}

                          <div className="space-y-1 min-w-0 flex-1">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="text-[10px] bg-zinc-100 text-zinc-600 px-1.5 py-0.5 rounded-md font-bold truncate max-w-[140px]">
                                {vendorName}
                              </span>
                              <span className="text-[10px] bg-orange-50 text-orange-700 px-1.5 py-0.5 rounded-md font-semibold">
                                {entry.menuItem.category}
                              </span>
                            </div>

                            <h4 className="font-display font-black text-sm text-zinc-900 tracking-tight leading-snug">
                              {entry.menuItem.name}
                            </h4>

                            {entry.selectedExtras.length > 0 && (
                              <div className="flex flex-wrap gap-1 pt-0.5">
                                {entry.selectedExtras.map((extra) => (
                                  <span
                                    key={extra.id}
                                    className="inline-flex items-center text-[10px] font-mono text-zinc-600 bg-zinc-100 px-1.5 py-0.5 rounded-md"
                                  >
                                    + {extra.name} (+{extra.price} kr)
                                  </span>
                                ))}
                              </div>
                            )}

                            <div className="text-[11px] font-mono text-zinc-500 font-medium">
                              {unitPrice} SEK / portion
                            </div>
                          </div>
                        </div>

                        {/* Quantity & Item Total */}
                        <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-zinc-100">
                          <div className="flex items-center gap-1.5 bg-zinc-100 border border-zinc-200 rounded-xl p-1">
                            <button
                              type="button"
                              onClick={() => handleDecrease(entry.id)}
                              className="p-1 hover:bg-white hover:text-orange-600 rounded-lg text-zinc-600 transition-all cursor-pointer"
                              title="Decrease quantity"
                            >
                              <Minus className="w-3.5 h-3.5" />
                            </button>
                            <span className="font-mono font-black text-xs px-2 min-w-[20px] text-center text-zinc-900">
                              {entry.quantity}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleIncrease(entry.id)}
                              className="p-1 hover:bg-white hover:text-orange-600 rounded-lg text-zinc-600 transition-all cursor-pointer"
                              title="Increase quantity"
                            >
                              <Plus className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          <div className="text-right min-w-[70px]">
                            <span className="font-mono font-black text-sm sm:text-base text-zinc-900 block">
                              {itemTotal} SEK
                            </span>
                          </div>

                          <button
                            type="button"
                            onClick={() => handleRemoveEntry(entry.id)}
                            className="text-zinc-300 hover:text-red-500 p-1.5 rounded-lg transition-colors cursor-pointer"
                            title="Remove item"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* SPECIAL PREPARATION NOTES */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-zinc-700">
                  Kitchen Notes or Allergies (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Mild spice please, cutlery for 2, allergy info..."
                  value={orderNotes}
                  onChange={(e) => setOrderNotes(e.target.value)}
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3.5 py-2.5 text-xs text-zinc-900 focus:bg-white focus:outline-hidden focus:border-orange-500 transition-colors"
                />
              </div>

              {/* PAYMENT BREAKDOWN */}
              <div className="bg-zinc-50 rounded-2xl p-4 border border-zinc-200/80 space-y-2.5 font-mono text-xs">
                <div className="flex justify-between text-zinc-600">
                  <span>Subtotal ({totalItemCount} items)</span>
                  <span className="font-bold text-zinc-800">{getSubtotal()} SEK</span>
                </div>
                <div className="flex justify-between text-zinc-600">
                  <span>Festival Eco & Service Fee</span>
                  <span className="text-emerald-700 font-bold font-sans">0 SEK (Free)</span>
                </div>
                <div className="pt-2.5 border-t border-zinc-200 flex justify-between items-center text-zinc-900">
                  <span className="font-display font-black text-sm uppercase tracking-wide">Total to Pay</span>
                  <span className="font-mono font-black text-lg sm:text-xl text-orange-600">
                    {getSubtotal()} SEK
                  </span>
                </div>
              </div>
            </>
          )}
        </div>

        {/* POP-OUT FOOTER ACTIONS */}
        {cartEntries.length > 0 && (
          <div className="p-4 sm:p-6 bg-zinc-50 border-t border-zinc-200 space-y-3">
            <div className="flex flex-col sm:flex-row items-center gap-3">
              {/* PRIMARY SWISH BUTTON */}
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onProceedToSwish();
                }}
                className="w-full sm:flex-1 bg-orange-500 hover:bg-orange-600 active:scale-[0.99] text-white font-display font-black text-sm py-4 rounded-2xl transition-all shadow-lg shadow-orange-500/25 cursor-pointer flex items-center justify-center gap-2"
              >
                <Smartphone className="w-4 h-4" />
                <span>Pay with Swish • {getSubtotal()} SEK</span>
                <ChevronRight className="w-4 h-4" />
              </button>

              {/* CONTINUE SHOPPING */}
              <button
                type="button"
                onClick={onClose}
                className="w-full sm:w-auto bg-white hover:bg-zinc-100 text-zinc-700 font-display font-bold text-xs px-4 py-4 rounded-2xl border border-zinc-200 transition-colors cursor-pointer text-center"
              >
                + Add More Food
              </button>
            </div>

            <div className="flex items-center justify-center gap-4 text-[10px] font-mono text-zinc-500">
              <span className="flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> Instant Verified Swish
              </span>
              <span>•</span>
              <span>Next Queue Token: #{nextQueueNumber}</span>
              <span>•</span>
              <span>Direct Kitchen Push</span>
            </div>
          </div>
        )}
      </div>
    </div>,
    document.body
  );
};
