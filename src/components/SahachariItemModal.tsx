import React, { useEffect, useState } from "react";
import { X, Save, AlertCircle, RotateCcw, Box } from "lucide-react";
import { useSahachariItems, type SahachariItem } from "../store/useSahachariItems";
import { useAuthStore } from "../store/useAuthStore";
import { useNavigate } from "react-router-dom";
import { checkPermission } from "../utils/checkPermission";

interface SahachariItemModalProps {
    open: boolean;
    editingItem: SahachariItem | null;
    onClose: () => void;
    actionBy: string | number;
}

export const SahachariItemModal: React.FC<SahachariItemModalProps> = ({
    open,
    editingItem,
    onClose,
    actionBy,
}) => {
    const { createItem, editItem, error, clearError, isLoading } = useSahachariItems();

    const [name, setName] = useState("");
    const [itemCode, setItemCode] = useState("");
    const [quantity, setQuantity] = useState(1);
    const [generatedCodes, setGeneratedCodes] = useState("");
    const [manualEdit, setManualEdit] = useState(false);
    const [amount, setAmount] = useState<number | "">("");
    const [description, setDescription] = useState("");
    const [formError, setFormError] = useState<string | null>(null);

    const navigate = useNavigate();
    const { user } = useAuthStore();

    useEffect(() => {
        if (editingItem) {
            setName(editingItem.name || "");
            setItemCode(editingItem.item_code || "");
            setAmount(editingItem.amount ?? "");
            setDescription(editingItem.description || "");
        } else {
            setName("");
            setItemCode("");
            setQuantity(1);
            setGeneratedCodes("");
            setManualEdit(false);
            setAmount("");
            setDescription("");
        }
        setFormError(null);
    }, [editingItem, open]);
    useEffect(() => {
        if (editingItem) return;

        if (manualEdit) return;

        const prefix = itemCode.trim().toUpperCase();

        if (!prefix || quantity <= 0) {
            setGeneratedCodes("");
            return;
        }

        const digits = Math.max(2, String(quantity).length);

        const codes = Array.from({ length: quantity }, (_, i) => {
            return `${prefix}${String(i + 1).padStart(digits, "0")}`;
        });

        setGeneratedCodes(codes.join(", "));
    }, [itemCode, quantity, editingItem, manualEdit]);
    if (!open) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!(await checkPermission(user, ["sahachari handle", "all handle"], navigate))) return;

        if (
            !name.trim() ||
            (!editingItem &&
                (!itemCode.trim() || quantity < 1 || generatedCodes.trim() === ""))
        ) {
            setFormError("Please fill all required fields.");
            return;
        } 

        let success = false;
        if (editingItem) {
            success = await editItem({
                id: editingItem.id,
                name: name.trim(),
                item_code: itemCode.trim() || undefined,
                amount: amount !== "" ? Number(amount) : undefined,
                description: description.trim() || undefined,
                action_by: actionBy,
            });
        } else {
            // Split comma-separated codes if creating multiple
            const itemCodesArr = generatedCodes
                .split(",")
                .map((c) => c.trim().toUpperCase())
                .filter(Boolean);

            success = await createItem({
                name: name.trim(),
                item_code: itemCodesArr.length > 0 ? itemCodesArr : [itemCode.trim()],
                amount: amount !== "" ? Number(amount) : undefined,
                description: description.trim() || undefined,
                action_by: actionBy,
            });
        }

        if (success) onClose();
    };

   return (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-md p-4 transition-all animate-in fade-in duration-200">
    <div className="w-full max-w-lg overflow-hidden rounded-3xl border border-slate-200/80 bg-white/95 shadow-2xl backdrop-blur-xl transition-all dark:border-slate-800/80 dark:bg-slate-900/95 dark:shadow-slate-950/80">
      
      {/* Modal Header */}
      <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 dark:border-slate-800/80">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-indigo-100 bg-indigo-50 text-indigo-600 dark:border-indigo-900/50 dark:bg-indigo-950/60 dark:text-indigo-400">
            <Box size={20} />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
              {editingItem ? "Edit Sahachari Item" : "Create Sahachari Item"}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {editingItem ? "Update item attributes and metadata" : "Add new inventory or equipment entries"}
            </p>
          </div>
        </div>
        <button
          onClick={onClose}
          type="button"
          className="rounded-xl p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-200"
        >
          <X size={18} />
        </button>
      </div>

      {/* Global Error Banner */}
      {error && (
        <div className="mx-6 mt-4 flex items-center justify-between rounded-2xl border border-rose-200 bg-rose-50/90 p-3.5 text-xs text-rose-700 dark:border-rose-900/40 dark:bg-rose-950/30 dark:text-rose-300">
          <div className="flex items-center gap-2.5">
            <AlertCircle size={16} className="shrink-0 text-rose-500" />
            <span>{error}</span>
          </div>
          <button
            onClick={clearError}
            type="button"
            className="rounded-lg bg-rose-600/10 px-2.5 py-1 text-xs font-semibold text-rose-600 hover:bg-rose-600 hover:text-white dark:bg-rose-500/20 dark:text-rose-300 dark:hover:bg-rose-600 dark:hover:text-white"
          >
            Clear
          </button>
        </div>
      )}

      {/* Form Content */}
      <form onSubmit={handleSubmit} className="p-6 space-y-4">
        {formError && (
          <div className="flex items-center gap-2 rounded-2xl border border-rose-200 bg-rose-50/80 p-3 text-xs text-rose-700 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-300">
            <AlertCircle size={15} className="shrink-0 text-rose-500" />
            <span>{formError}</span>
          </div>
        )}

        {/* Item Name */}
        <div>
          <label className="mb-1.5 block text-xs font-semibold text-slate-700 dark:text-slate-300">
            Item Name <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            placeholder="e.g. Wheelchair, Crutches..."
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-2xl border border-slate-200 bg-slate-50/60 px-3.5 py-2.5 text-xs text-slate-900 outline-none transition-all focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 dark:border-slate-800 dark:bg-slate-800/40 dark:text-slate-100 dark:placeholder-slate-500 dark:focus:border-indigo-500 dark:focus:bg-slate-900 dark:focus:ring-indigo-500/20"
          />
        </div>

        {/* Prefix & Quantity Grid */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {/* Item Code Prefix */}
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-slate-700 dark:text-slate-300">
              Code Prefix <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              placeholder="e.g. WC"
              value={itemCode}
              onChange={(e) => {
                setItemCode(e.target.value.toUpperCase());
                setManualEdit(false);
              }}
              className="w-full rounded-2xl border border-slate-200 bg-slate-50/60 px-3.5 py-2.5 font-mono text-xs uppercase text-slate-900 outline-none transition-all focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 dark:border-slate-800 dark:bg-slate-800/40 dark:text-slate-100 dark:placeholder-slate-500 dark:focus:border-indigo-500 dark:focus:bg-slate-900 dark:focus:ring-indigo-500/20"
            />
          </div>

          {/* Quantity (Create mode) */}
          {!editingItem && (
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Quantity
              </label>
              <input
                type="number"
                min={1}
                value={quantity}
                onChange={(e) => {
                  setQuantity(Number(e.target.value));
                  setManualEdit(false);
                }}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50/60 px-3.5 py-2.5 text-xs text-slate-900 outline-none transition-all focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 dark:border-slate-800 dark:bg-slate-800/40 dark:text-slate-100 dark:placeholder-slate-500 dark:focus:border-indigo-500 dark:focus:bg-slate-900 dark:focus:ring-indigo-500/20"
              />
            </div>
          )}
        </div>

        {/* Generated Codes (Create Mode) */}
        {!editingItem && (
          <div>
            <div className="mb-1.5 flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Generated Item Codes
              </label>
              <button
                type="button"
                onClick={() => setManualEdit(false)}
                className="inline-flex items-center gap-1 rounded-lg px-2 py-0.5 text-[11px] font-semibold text-indigo-600 hover:bg-indigo-50 dark:text-indigo-400 dark:hover:bg-indigo-950/50"
              >
                <RotateCcw size={11} />
                Regenerate
              </button>
            </div>
            <textarea
              rows={3}
              value={generatedCodes}
              onChange={(e) => {
                setGeneratedCodes(e.target.value.toUpperCase());
                setManualEdit(true);
              }}
              placeholder="Generated item codes..."
              className="w-full rounded-2xl border border-slate-200 bg-slate-50/60 px-3.5 py-2.5 font-mono text-xs tracking-wide text-indigo-600 outline-none transition-all focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 dark:border-slate-800 dark:bg-slate-800/40 dark:text-indigo-400 dark:focus:border-indigo-500 dark:focus:bg-slate-900 dark:focus:ring-indigo-500/20"
            />
          </div>
        )}

        {/* Item Code (Edit Mode) */}
        {editingItem && (
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-slate-700 dark:text-slate-300">
              Item Code
            </label>
            <input
              type="text"
              value={itemCode}
              onChange={(e) => setItemCode(e.target.value.toUpperCase())}
              className="w-full rounded-2xl border border-slate-200 bg-slate-50/60 px-3.5 py-2.5 font-mono text-xs font-semibold text-indigo-600 outline-none transition-all focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 dark:border-slate-800 dark:bg-slate-800/40 dark:text-indigo-400 dark:focus:border-indigo-500 dark:focus:bg-slate-900 dark:focus:ring-indigo-500/20"
            />
          </div>
        )}

        {/* Amount / Security Fee */}
        <div>
          <label className="mb-1.5 block text-xs font-semibold text-slate-700 dark:text-slate-300">
            Amount / Security Fee <span className="font-normal text-slate-400">(Optional)</span>
          </label>
          <input
            type="number"
            placeholder="e.g. 500"
            value={amount}
            onChange={(e) =>
              setAmount(e.target.value === "" ? "" : Number(e.target.value))
            }
            className="w-full rounded-2xl border border-slate-200 bg-slate-50/60 px-3.5 py-2.5 text-xs text-slate-900 outline-none transition-all focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 dark:border-slate-800 dark:bg-slate-800/40 dark:text-slate-100 dark:placeholder-slate-500 dark:focus:border-indigo-500 dark:focus:bg-slate-900 dark:focus:ring-indigo-500/20"
          />
        </div>

        {/* Description / Remarks */}
        <div>
          <label className="mb-1.5 block text-xs font-semibold text-slate-700 dark:text-slate-300">
            Description / Remarks
          </label>
          <textarea
            rows={3}
            placeholder="Add optional specifications..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full rounded-2xl border border-slate-200 bg-slate-50/60 px-3.5 py-2.5 text-xs text-slate-900 outline-none transition-all focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 dark:border-slate-800 dark:bg-slate-800/40 dark:text-slate-100 dark:placeholder-slate-500 dark:focus:border-indigo-500 dark:focus:bg-slate-900 dark:focus:ring-indigo-500/20"
          />
        </div>

        {/* Action Footer */}
        <div className="flex items-center justify-end gap-2.5 border-t border-slate-100 pt-3 dark:border-slate-800/80">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl px-4 py-2.5 text-xs font-semibold text-slate-600 transition-colors hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-xs font-semibold text-white shadow-md shadow-indigo-600/20 transition-all hover:bg-indigo-500 active:scale-[0.98] disabled:opacity-50 dark:bg-indigo-600 dark:hover:bg-indigo-500"
          >
            <Save size={14} />
            {isLoading ? "Saving..." : "Save Item"}
          </button>
        </div>
      </form>
    </div>
  </div>
);
};