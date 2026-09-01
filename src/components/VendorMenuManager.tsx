import React, { useState, useRef } from "react";
import { MenuItem, ExtraOption, Vendor } from "../types";
import {
  Plus,
  Pencil,
  Trash2,
  Utensils,
  Check,
  X,
  AlertCircle,
  Sparkles,
  Search,
  Tag,
  Eye,
  Coffee,
  Flame,
  CheckCircle2,
  DollarSign,
  FileUp,
  Loader2
} from "lucide-react";

interface VendorMenuManagerProps {
  vendor: Vendor;
  onUpdateVendor: (updatedVendor: Vendor) => Promise<void>;
}

const PRESET_IMAGES: { label: string; url: string }[] = [
  { label: "Samosa / Chaat", url: "https://images.unsplash.com/photo-1601050690597-df056fb4ce78?w=600&auto=format&fit=crop&q=80" },
  { label: "Roll / Wrap", url: "https://images.unsplash.com/photo-1624462966581-bc6d768cbce5?w=600&auto=format&fit=crop&q=80" },
  { label: "Curry / Bowl", url: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=600&auto=format&fit=crop&q=80" },
  { label: "Mango Lassi", url: "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=600&auto=format&fit=crop&q=80" },
  { label: "Biryani Rice", url: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=600&auto=format&fit=crop&q=80" },
  { label: "Chai / Tea", url: "https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=600&auto=format&fit=crop&q=80" },
  { label: "Dessert / Sweet", url: "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=600&auto=format&fit=crop&q=80" },
  { label: "Grilled / Kebab", url: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=600&auto=format&fit=crop&q=80" }
];

export const VendorMenuManager: React.FC<VendorMenuManagerProps> = ({
  vendor,
  onUpdateVendor
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>("All");
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  
  // Form fields
  const [name, setName] = useState("");
  const [price, setPrice] = useState<string>("");
  const [category, setCategory] = useState<"Food" | "Drink" | "Snack" | "Dessert">("Food");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [stock, setStock] = useState(true);
  const [extras, setExtras] = useState<ExtraOption[]>([]);
  
  // Extra option input states
  const [newExtraName, setNewExtraName] = useState("");
  const [newExtraPrice, setNewExtraPrice] = useState("");
  
  const [formError, setFormError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // PDF Upload states — all on-demand only, zero background overhead
  const pdfInputRef = useRef<HTMLInputElement>(null);
  const [isPdfUploading, setIsPdfUploading] = useState(false);
  const [pdfError, setPdfError] = useState<string | null>(null);
  const [parsedPdfItems, setParsedPdfItems] = useState<{ name: string; price: number; category: string; description: string }[]>([]);
  const [selectedPdfIndices, setSelectedPdfIndices] = useState<Set<number>>(new Set());
  const [showPdfPreview, setShowPdfPreview] = useState(false);
  const [isImportingSaving, setIsImportingSaving] = useState(false);

  // Open modal for Adding New Item
  const handleOpenAddModal = () => {
    setEditingItem(null);
    setName("");
    setPrice("");
    setCategory("Food");
    setDescription("");
    setImageUrl("");
    setStock(true);
    setExtras([]);
    setNewExtraName("");
    setNewExtraPrice("");
    setFormError(null);
    setIsModalOpen(true);
  };

  // Open modal for Editing Existing Item
  const handleOpenEditModal = (item: MenuItem) => {
    setEditingItem(item);
    setName(item.name || "");
    setPrice(item.price ? item.price.toString() : "");
    setCategory(item.category || "Food");
    setDescription(item.description || "");
    setImageUrl(item.imageUrl || "");
    setStock(item.stock ?? true);
    setExtras(item.extras ? [...item.extras] : []);
    setNewExtraName("");
    setNewExtraPrice("");
    setFormError(null);
    setIsModalOpen(true);
  };

  // Quick toggle stock on card
  const handleQuickToggleStock = async (item: MenuItem) => {
    const updatedMenu = vendor.menu.map((m) =>
      m.id === item.id ? { ...m, stock: !m.stock } : m
    );
    await onUpdateVendor({ ...vendor, menu: updatedMenu });
  };

  // Add extra option to item in form
  const handleAddExtraOption = () => {
    if (!newExtraName.trim()) return;
    const extraPriceNum = parseFloat(newExtraPrice) || 0;
    const newExtra: ExtraOption = {
      id: `ext_${Date.now()}_${Math.random().toString(36).substring(2, 5)}`,
      name: newExtraName.trim(),
      price: Math.max(0, extraPriceNum)
    };
    setExtras([...extras, newExtra]);
    setNewExtraName("");
    setNewExtraPrice("");
  };

  // Remove extra option from form
  const handleRemoveExtraOption = (extraId: string) => {
    setExtras(extras.filter((e) => e.id !== extraId));
  };

  // Save Item (Add or Edit)
  const handleSaveItem = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!name.trim()) {
      setFormError("Item name is required.");
      return;
    }

    const parsedPrice = parseFloat(price);
    if (isNaN(parsedPrice) || parsedPrice < 0) {
      setFormError("Please provide a valid price in SEK.");
      return;
    }

    setIsSaving(true);

    try {
      let updatedMenu: MenuItem[];

      if (editingItem) {
        // Update existing item
        updatedMenu = vendor.menu.map((m) =>
          m.id === editingItem.id
            ? {
                ...m,
                name: name.trim(),
                price: Math.round(parsedPrice),
                category,
                description: description.trim(),
                imageUrl: imageUrl.trim() || undefined,
                stock,
                extras: extras.length > 0 ? extras : undefined
              }
            : m
        );
      } else {
        // Add new item
        const newItem: MenuItem = {
          id: `item_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
          name: name.trim(),
          price: Math.round(parsedPrice),
          category,
          description: description.trim(),
          imageUrl: imageUrl.trim() || undefined,
          stock,
          extras: extras.length > 0 ? extras : undefined
        };
        updatedMenu = [...(vendor.menu || []), newItem];
      }

      await onUpdateVendor({ ...vendor, menu: updatedMenu });
      setIsModalOpen(false);
    } catch (err: any) {
      setFormError(err.message || "Failed to save menu item. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  // Delete Item
  const handleDeleteItem = async (itemId: string) => {
    const updatedMenu = vendor.menu.filter((m) => m.id !== itemId);
    await onUpdateVendor({ ...vendor, menu: updatedMenu });
    setDeleteConfirmId(null);
  };

  // PDF upload handler — reads file as base64, sends to API, shows preview
  const handlePdfFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (e.target) e.target.value = ""; // reset so same file can be re-selected
    if (!file) return;

    if (file.type !== "application/pdf") {
      setPdfError("Please select a valid PDF file (.pdf).");
      return;
    }
    if (file.size > 4 * 1024 * 1024) {
      setPdfError("PDF is too large. Please use a file under 4 MB.");
      return;
    }

    setIsPdfUploading(true);
    setPdfError(null);

    try {
      // Read PDF as base64 in the browser (no upload to storage, no cost)
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve((reader.result as string).split(",")[1]);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      const response = await fetch("/api/parse-menu-pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pdfBase64: base64 }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(typeof data.error === 'string' ? data.error : "Failed to parse PDF.");
      if (data.error && (!data.items || data.items.length === 0)) {
        throw new Error(typeof data.error === 'string' ? data.error : "Failed to extract items from PDF.");
      }
      if (!data.items || data.items.length === 0) {
        throw new Error("No menu items found in this PDF. Please check it contains a readable text-based menu.");
      }

      setParsedPdfItems(data.items);
      setSelectedPdfIndices(new Set(data.items.map((_: any, i: number) => i)));
      setShowPdfPreview(true);
    } catch (err: any) {
      setPdfError(err.message || "Failed to parse the PDF. Please try again.");
    } finally {
      setIsPdfUploading(false);
    }
  };

  // Confirm import — bulk-adds selected parsed items to the vendor menu
  const handleConfirmPdfImport = async () => {
    const toAdd = parsedPdfItems.filter((_, i) => selectedPdfIndices.has(i));
    if (toAdd.length === 0) return;

    setIsImportingSaving(true);
    try {
      const newItems = toAdd.map((item, i) => ({
        id: `item_pdf_${Date.now()}_${i}_${Math.random().toString(36).substring(2, 5)}`,
        name: item.name,
        price: item.price,
        category: item.category as "Food" | "Drink" | "Snack" | "Dessert",
        description: item.description,
        stock: true,
      }));
      await onUpdateVendor({ ...vendor, menu: [...(vendor.menu || []), ...newItems] });
      setShowPdfPreview(false);
      setParsedPdfItems([]);
      setSelectedPdfIndices(new Set());
    } catch (err: any) {
      setPdfError(err.message || "Failed to import items.");
    } finally {
      setIsImportingSaving(false);
    }
  };

  // Filtered menu items
  const filteredMenu = (vendor.menu || []).filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat =
      selectedCategoryFilter === "All" || item.category === selectedCategoryFilter;
    return matchesSearch && matchesCat;
  });

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 p-6 md:p-8 space-y-6 shadow-xs text-left">
      {/* Header & Primary Add Item Button */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-zinc-150 dark:border-zinc-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-display font-black text-xl text-zinc-900 dark:text-white">
              Manage Menu Items &amp; Prices
            </h3>
            <span className="bg-orange-100 dark:bg-orange-950/60 text-orange-700 dark:text-orange-300 border border-orange-200 dark:border-orange-800/60 text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full">
              {vendor.menu?.length || 0} Items
            </span>
          </div>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium mt-1">
            Add new dishes, update live prices, customize add-ons, or toggle in-stock availability instantly.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Hidden PDF file input */}
          <input
            ref={pdfInputRef}
            type="file"
            accept="application/pdf"
            className="hidden"
            onChange={handlePdfFileSelect}
          />
          {/* Upload PDF Button */}
          <button
            type="button"
            onClick={() => { setPdfError(null); pdfInputRef.current?.click(); }}
            disabled={isPdfUploading}
            title="Upload a PDF menu to auto-import all items via AI"
            className="bg-zinc-800 hover:bg-zinc-700 active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed text-white font-display font-black text-xs px-4 py-2.5 rounded-2xl transition-all flex items-center gap-2 cursor-pointer shrink-0 border border-zinc-700"
          >
            {isPdfUploading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <FileUp className="w-4 h-4" />
            )}
            <span>{isPdfUploading ? "Parsing PDF..." : "Upload Menu PDF"}</span>
          </button>
          {/* Add Single Item Button */}
          <button
            type="button"
            onClick={handleOpenAddModal}
            className="bg-orange-500 hover:bg-orange-600 active:scale-95 text-white font-display font-black text-xs px-4 py-2.5 rounded-2xl shadow-md shadow-orange-500/20 transition-all flex items-center gap-2 cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Add Menu Item</span>
          </button>
        </div>
      </div>

      {/* PDF parse error banner */}
      {pdfError && (
        <div className="flex items-start gap-2 p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60 rounded-2xl text-xs text-rose-700 dark:text-rose-400 font-bold">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{pdfError}</span>
          <button type="button" onClick={() => setPdfError(null)} className="ml-auto text-rose-400 hover:text-rose-600 cursor-pointer"><X className="w-3.5 h-3.5" /></button>
        </div>
      )}

      {/* Search & Category Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Category Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto scrollbar-none pb-1 sm:pb-0">
          {["All", "Food", "Drink", "Snack", "Dessert"].map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategoryFilter(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                selectedCategoryFilter === cat
                  ? "bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 shadow-xs"
                  : "bg-zinc-100 dark:bg-zinc-800/70 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Search input */}
        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input
            type="text"
            placeholder="Search items or keywords..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:border-orange-500"
          />
        </div>
      </div>

      {/* Menu Cards Grid */}
      {filteredMenu.length === 0 ? (
        <div className="bg-zinc-50 dark:bg-zinc-950/60 border border-dashed border-zinc-300 dark:border-zinc-800 rounded-3xl p-10 text-center space-y-3 my-4">
          <div className="w-12 h-12 rounded-2xl bg-zinc-200 dark:bg-zinc-900 text-zinc-400 flex items-center justify-center mx-auto">
            <Utensils className="w-6 h-6" />
          </div>
          <h4 className="font-display font-bold text-zinc-800 dark:text-zinc-200 text-sm">
            {searchQuery || selectedCategoryFilter !== "All"
              ? "No items match your filter"
              : "No menu items added yet"}
          </h4>
          <p className="text-xs text-zinc-500 max-w-sm mx-auto">
            {searchQuery || selectedCategoryFilter !== "All"
              ? "Try clearing the search or category filter to view all your dishes."
              : "Click the button below to add your first dish, drink, or snack to the stall menu."}
          </p>
          <button
            type="button"
            onClick={handleOpenAddModal}
            className="mt-2 inline-flex items-center gap-1.5 text-xs font-bold text-orange-600 dark:text-orange-400 hover:underline cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Create New Menu Item</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredMenu.map((item) => (
            <div
              key={item.id}
              className={`p-4 rounded-2xl border transition-all duration-200 flex flex-col justify-between gap-3 bg-zinc-50 dark:bg-zinc-950/80 ${
                item.stock
                  ? "border-zinc-200 dark:border-zinc-800 hover:border-orange-500/40 shadow-xs"
                  : "border-zinc-200 dark:border-zinc-800/80 opacity-75"
              }`}
            >
              {/* Item Card Top */}
              <div className="flex items-start gap-3">
                {item.imageUrl ? (
                  <img
                    src={item.imageUrl}
                    alt={item.name}
                    className="w-16 h-16 rounded-xl object-cover border border-zinc-200 dark:border-zinc-800 shrink-0"
                    referrerPolicy="no-referrer"
                    loading="lazy"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-xl bg-orange-50 dark:bg-zinc-900 border border-orange-200/60 dark:border-zinc-800 flex items-center justify-center text-orange-500 shrink-0">
                    <Utensils className="w-6 h-6 opacity-80" />
                  </div>
                )}

                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex items-center justify-between gap-1">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-400 bg-zinc-200/70 dark:bg-zinc-800 px-2 py-0.5 rounded-md">
                      {item.category}
                    </span>
                    
                    {/* Quick Stock Status Pill & Button */}
                    <button
                      type="button"
                      onClick={() => handleQuickToggleStock(item)}
                      title="Click to toggle Stock availability"
                      className={`text-[10px] font-bold font-mono px-2 py-0.5 rounded-full transition-all cursor-pointer flex items-center gap-1 ${
                        item.stock
                          ? "bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-200"
                          : "bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300 border border-rose-200 dark:border-rose-800 hover:bg-rose-200"
                      }`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${item.stock ? "bg-emerald-500" : "bg-rose-500"}`} />
                      {item.stock ? "In Stock" : "Sold Out"}
                    </button>
                  </div>

                  <h4 className="font-display font-black text-sm text-zinc-900 dark:text-white truncate" title={item.name}>
                    {item.name}
                  </h4>

                  <div className="flex items-baseline gap-1">
                    <span className="font-mono text-sm font-black text-orange-600 dark:text-orange-400">
                      {item.price} SEK
                    </span>
                  </div>
                </div>
              </div>

              {/* Description */}
              {item.description && (
                <p className="text-xs text-zinc-600 dark:text-zinc-400 line-clamp-2 leading-relaxed">
                  {item.description}
                </p>
              )}

              {/* Extras list if available */}
              {item.extras && item.extras.length > 0 && (
                <div className="bg-white dark:bg-zinc-900 p-2 rounded-xl border border-zinc-200/80 dark:border-zinc-800/80 space-y-1">
                  <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-orange-500" />
                    <span>{item.extras.length} Add-on Option{item.extras.length > 1 ? "s" : ""}</span>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {item.extras.map((extra) => (
                      <span
                        key={extra.id}
                        className="text-[10px] bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 px-1.5 py-0.5 rounded font-mono"
                      >
                        {extra.name} (+{extra.price} kr)
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Buttons Row */}
              <div className="pt-2 border-t border-zinc-200/70 dark:border-zinc-800/70 flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => handleQuickToggleStock(item)}
                  className="text-xs text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 font-bold transition-colors cursor-pointer flex items-center gap-1"
                >
                  <span>Toggle Stock</span>
                </button>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleOpenEditModal(item)}
                    className="p-1.5 rounded-lg bg-zinc-200 dark:bg-zinc-800 hover:bg-orange-500 hover:text-white text-zinc-700 dark:text-zinc-300 transition-all cursor-pointer flex items-center gap-1 text-xs font-bold px-2.5"
                    title="Edit item details"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                    <span>Edit</span>
                  </button>

                  {deleteConfirmId === item.id ? (
                    <div className="flex items-center gap-1 bg-rose-50 dark:bg-rose-950/80 p-1 rounded-lg border border-rose-200 dark:border-rose-800">
                      <button
                        type="button"
                        onClick={() => handleDeleteItem(item.id)}
                        className="text-[10px] font-bold bg-rose-600 text-white px-2 py-0.5 rounded cursor-pointer hover:bg-rose-700"
                      >
                        Confirm Delete
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeleteConfirmId(null)}
                        className="text-zinc-500 hover:text-zinc-700 p-0.5 cursor-pointer"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setDeleteConfirmId(item.id)}
                      className="p-1.5 rounded-lg hover:bg-rose-100 dark:hover:bg-rose-950/60 text-zinc-400 hover:text-rose-600 transition-all cursor-pointer"
                      title="Delete menu item"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* PDF PREVIEW & IMPORT MODAL */}
      {showPdfPreview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm overflow-y-auto animate-fadeIn">
          <div
            className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl max-w-xl w-full p-6 shadow-2xl space-y-4 text-left my-8"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-zinc-150 dark:border-zinc-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-2xl border border-emerald-500/20">
                  <FileUp className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-display font-black text-base text-zinc-900 dark:text-white">PDF Menu Parsed ✓</h3>
                  <p className="text-[11px] text-zinc-500 dark:text-zinc-400 font-medium">
                    {parsedPdfItems.length} items found — select which ones to import
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowPdfPreview(false)}
                className="p-2 rounded-xl text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Select all / none */}
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-zinc-500 dark:text-zinc-400">
                {selectedPdfIndices.size} of {parsedPdfItems.length} selected
              </span>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedPdfIndices(new Set(parsedPdfItems.map((_, i) => i)))}
                  className="text-[11px] font-bold text-orange-600 dark:text-orange-400 hover:underline cursor-pointer"
                >
                  Select all
                </button>
                <span className="text-zinc-300 dark:text-zinc-700">|</span>
                <button
                  type="button"
                  onClick={() => setSelectedPdfIndices(new Set())}
                  className="text-[11px] font-bold text-zinc-500 hover:underline cursor-pointer"
                >
                  Deselect all
                </button>
              </div>
            </div>

            {/* Items list */}
            <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
              {parsedPdfItems.map((item, idx) => {
                const isSelected = selectedPdfIndices.has(idx);
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      const next = new Set(selectedPdfIndices);
                      if (isSelected) next.delete(idx); else next.add(idx);
                      setSelectedPdfIndices(next);
                    }}
                    className={`w-full text-left flex items-center gap-3 p-3 rounded-2xl border transition-all cursor-pointer ${
                      isSelected
                        ? "bg-orange-50 dark:bg-orange-950/30 border-orange-300 dark:border-orange-700/60"
                        : "bg-zinc-50 dark:bg-zinc-950/60 border-zinc-200 dark:border-zinc-800 opacity-60"
                    }`}
                  >
                    <div className={`w-4 h-4 rounded border-2 shrink-0 flex items-center justify-center transition-all ${
                      isSelected ? "bg-orange-500 border-orange-500" : "border-zinc-300 dark:border-zinc-600"
                    }`}>
                      {isSelected && <Check className="w-2.5 h-2.5 text-white stroke-[3]" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-display font-black text-xs text-zinc-900 dark:text-white truncate">{item.name}</span>
                        <span className="font-mono font-black text-xs text-orange-600 dark:text-orange-400 shrink-0">{item.price} SEK</span>
                      </div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[9px] font-mono font-bold uppercase bg-zinc-200 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 px-1.5 py-0.5 rounded">{item.category}</span>
                        {item.description && (
                          <span className="text-[10px] text-zinc-500 dark:text-zinc-400 truncate">{item.description}</span>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Import error */}
            {pdfError && (
              <div className="p-2.5 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60 rounded-xl text-xs text-rose-700 dark:text-rose-400 font-bold flex items-center gap-2">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />{pdfError}
              </div>
            )}

            {/* Action buttons */}
            <div className="flex items-center justify-end gap-3 pt-2 border-t border-zinc-150 dark:border-zinc-800">
              <button
                type="button"
                onClick={() => setShowPdfPreview(false)}
                className="px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 text-xs font-bold text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmPdfImport}
                disabled={selectedPdfIndices.size === 0 || isImportingSaving}
                className="bg-orange-500 hover:bg-orange-600 disabled:bg-zinc-700 active:scale-95 text-white font-black text-xs px-5 py-2.5 rounded-xl shadow-md shadow-orange-500/20 transition-all flex items-center gap-1.5 cursor-pointer disabled:cursor-not-allowed"
              >
                {isImportingSaving ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Check className="w-4 h-4 stroke-[3]" />
                )}
                <span>{isImportingSaving ? "Importing..." : `Import ${selectedPdfIndices.size} Item${selectedPdfIndices.size !== 1 ? "s" : ""}`}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ADD / EDIT MENU ITEM MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm overflow-y-auto animate-fadeIn">
          <div
            className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl max-w-xl w-full p-6 md:p-7 shadow-2xl space-y-5 text-left my-8"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-zinc-150 dark:border-zinc-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-orange-500/10 text-orange-500 rounded-2xl border border-orange-500/20">
                  <Utensils className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-display font-black text-lg text-zinc-900 dark:text-white">
                    {editingItem ? "Edit Menu Item" : "Add New Menu Item"}
                  </h3>
                  <p className="text-[11px] text-zinc-500 dark:text-zinc-400 font-medium">
                    {editingItem
                      ? `Updating details for "${editingItem.name}"`
                      : "Configure dish name, pricing, category, and options."}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-2 rounded-xl text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSaveItem} className="space-y-4">
              {/* Row 1: Item Name & Category */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2 space-y-1.5">
                  <label className="text-[11px] font-mono font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
                    Item Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., Tandoori Chicken Tikka Roll"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 focus:border-orange-500 rounded-xl px-3.5 py-2.5 text-xs font-bold text-zinc-900 dark:text-white focus:outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-mono font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
                    Category *
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 focus:border-orange-500 rounded-xl px-3 py-2.5 text-xs font-bold text-zinc-900 dark:text-white focus:outline-none cursor-pointer"
                  >
                    <option value="Food">🍛 Food</option>
                    <option value="Drink">🥤 Drink</option>
                    <option value="Snack">🥟 Snack</option>
                    <option value="Dessert">🧁 Dessert</option>
                  </select>
                </div>
              </div>

              {/* Row 2: Price & Stock Status */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-mono font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 flex items-center justify-between">
                    <span>Price (SEK) *</span>
                    <span className="text-[10px] text-zinc-400 lowercase font-normal font-sans">Swish &amp; Card currency</span>
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      min={0}
                      step={1}
                      required
                      placeholder="e.g. 115"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 focus:border-orange-500 rounded-xl pl-3.5 pr-14 py-2.5 text-xs font-mono font-black text-zinc-900 dark:text-white focus:outline-none"
                    />
                    <span className="absolute right-3.5 top-1/2 -translate-y-1/2 font-mono font-bold text-xs text-zinc-400">
                      SEK
                    </span>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-mono font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
                    Live Stock Availability
                  </label>
                  <button
                    type="button"
                    onClick={() => setStock(!stock)}
                    className={`w-full py-2.5 px-3.5 rounded-xl border text-xs font-bold flex items-center justify-between transition-all cursor-pointer ${
                      stock
                        ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400"
                        : "bg-rose-500/10 border-rose-500/30 text-rose-600 dark:text-rose-400"
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${stock ? "bg-emerald-500" : "bg-rose-500"}`} />
                      {stock ? "In Stock (Available to Order)" : "Sold Out (Hidden/Disabled)"}
                    </span>
                    <span className="text-[10px] uppercase font-mono tracking-wider font-bold">
                      {stock ? "Active" : "Paused"}
                    </span>
                  </button>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-mono font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
                  Item Description
                </label>
                <textarea
                  rows={2}
                  placeholder="Appetizing description of ingredients, spices, marinade, or preparation..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 focus:border-orange-500 rounded-xl px-3.5 py-2 text-xs text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none resize-none"
                />
              </div>

              {/* Image URL with Presets */}
              <div className="space-y-2">
                <label className="text-[11px] font-mono font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 flex items-center justify-between">
                  <span>Photo / Image URL</span>
                  <span className="text-[10px] text-zinc-400 lowercase font-normal font-sans">Preset or custom Unsplash URL</span>
                </label>

                <input
                  type="url"
                  placeholder="https://images.unsplash.com/..."
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 focus:border-orange-500 rounded-xl px-3.5 py-2 text-xs text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none"
                />

                {/* Quick Presets */}
                <div className="space-y-1">
                  <span className="text-[10px] font-mono text-zinc-400 font-bold uppercase tracking-wider">
                    Quick Pick Image:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {PRESET_IMAGES.map((preset) => (
                      <button
                        key={preset.label}
                        type="button"
                        onClick={() => setImageUrl(preset.url)}
                        className={`text-[10px] px-2 py-1 rounded-lg border font-medium transition-all cursor-pointer ${
                          imageUrl === preset.url
                            ? "bg-orange-500 text-white border-orange-500"
                            : "bg-zinc-100 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-300 hover:border-orange-400"
                        }`}
                      >
                        {preset.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Extras / Add-on Options Manager */}
              <div className="bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-3.5 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-zinc-800 dark:text-zinc-200 text-xs font-black">
                    <Sparkles className="w-3.5 h-3.5 text-orange-500" />
                    <span>Extra Customizations &amp; Add-ons (Optional)</span>
                  </div>
                  <span className="text-[10px] font-mono text-zinc-400">
                    {extras.length} configured
                  </span>
                </div>

                {/* Existing extras list */}
                {extras.length > 0 && (
                  <div className="space-y-1.5 max-h-32 overflow-y-auto">
                    {extras.map((extra) => (
                      <div
                        key={extra.id}
                        className="flex items-center justify-between bg-white dark:bg-zinc-900 px-3 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-800 text-xs"
                      >
                        <span className="font-medium text-zinc-800 dark:text-zinc-200">
                          {extra.name}
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-orange-600 dark:text-orange-400">
                            +{extra.price} SEK
                          </span>
                          <button
                            type="button"
                            onClick={() => handleRemoveExtraOption(extra.id)}
                            className="text-zinc-400 hover:text-rose-500 cursor-pointer p-0.5"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Add new extra input row */}
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="e.g. Extra Butter Naan, Cheese, Spices"
                    value={newExtraName}
                    onChange={(e) => setNewExtraName(e.target.value)}
                    className="flex-1 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 py-1.5 text-xs text-zinc-900 dark:text-white placeholder:text-zinc-400 focus:outline-none focus:border-orange-500"
                  />
                  <div className="relative w-24">
                    <input
                      type="number"
                      min={0}
                      placeholder="+ kr"
                      value={newExtraPrice}
                      onChange={(e) => setNewExtraPrice(e.target.value)}
                      className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl pl-3 pr-7 py-1.5 text-xs font-mono font-bold text-zinc-900 dark:text-white placeholder:text-zinc-400 focus:outline-none focus:border-orange-500"
                    />
                    <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-zinc-400 font-mono">
                      kr
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={handleAddExtraOption}
                    disabled={!newExtraName.trim()}
                    className="bg-zinc-800 hover:bg-zinc-700 disabled:opacity-40 text-white font-bold text-xs px-3 py-1.5 rounded-xl transition-all cursor-pointer shrink-0 flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add</span>
                  </button>
                </div>
              </div>

              {/* Error Message */}
              {formError && (
                <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-500 rounded-xl text-xs font-bold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              {/* Form Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-2 border-t border-zinc-150 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 text-xs font-bold text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={isSaving}
                  className="bg-orange-500 hover:bg-orange-600 disabled:bg-zinc-700 active:scale-95 text-white font-black text-xs px-5 py-2.5 rounded-xl shadow-md shadow-orange-500/20 transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Check className="w-4 h-4 stroke-[3]" />
                  <span>{isSaving ? "Saving Item..." : editingItem ? "Save Changes" : "Add to Menu"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
