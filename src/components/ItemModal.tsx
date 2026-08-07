import React, { useEffect, useState } from "react";
import { X, Save, AlertCircle } from "lucide-react";
import { useItemStore, type Item } from "../store/useItemStore";
import { useAuthStore } from "../store/useAuthStore";
import { useNavigate } from "react-router-dom";
import { checkPermission } from "../utils/checkPermission";

interface ItemModalProps {
  open: boolean;
  editingItem: Item | null;
  onClose: () => void;
  activeYearId: number;
  actionBy: string | number;
}

export const ItemModal: React.FC<ItemModalProps> = ({
  open,
  editingItem,
  onClose,
  activeYearId,
  actionBy,
}) => {
  const { createItem, editItem, error, clearError, isLoading } = useItemStore();

  const [name, setName] = useState("");
  const [note, setNote] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { user } = useAuthStore();
  useEffect(() => {
    if (!(checkPermission(user, ["stock handle", "all handle"], navigate))) return;

  }, [user, navigate]);
  useEffect(() => {
    if (editingItem) {
      setName(editingItem.name || "");
      setNote(editingItem.note || "");
    } else {
      setName("");
      setNote("");
    }
    setFormError(null);
  }, [editingItem, open]);

  if (!open) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    if (!(await checkPermission(user, ["stock handle", "all handle"], navigate))) return;
    e.preventDefault();
    if (!name.trim()) {
      setFormError("Item name is required.");
      return;
    }

    let success = false;
    if (editingItem) {
      success = await editItem({
        id: editingItem.id,
        name: name.trim(),
        note: note.trim() || undefined,
        active_year_id: activeYearId,
        action_by: actionBy,
      });
    } else {
      success = await createItem({
        name: name.trim(),
        note: note.trim() || undefined,
        active_year_id: activeYearId,
        action_by: actionBy,
      });
    }

    if (success) onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl dark:bg-slate-900">
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4 dark:border-slate-800">
          <h3 className="font-bold text-slate-900 dark:text-slate-100">
            {editingItem ? "Edit Item Catalog" : "Create Master Item"}
          </h3>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X size={18} />
          </button>
        </div>
        {error && (
          <div className="flex items-center justify-between rounded-xl border border-rose-200 bg-rose-50/80 p-4 text-sm text-rose-700 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-300">
            <div className="flex items-center gap-2">
              <AlertCircle size={18} />
              <span>{error}</span>
            </div>
            <button
              onClick={clearError}
              className="rounded-lg bg-rose-600 px-3 py-1 text-xs font-semibold text-white"
            >
              Clear
            </button>
          </div>
        )}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {formError && (
            <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-300">
              {formError}
            </div>
          )}

          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-700 dark:text-slate-200">
              Item Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              placeholder="e.g. Projector, Plastic Chairs..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2 text-xs outline-none focus:border-indigo-500 focus:bg-white dark:border-slate-700 dark:bg-slate-800 focus:dark:bg-slate-800 dark:text-slate-100"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-700 dark:text-slate-200">
              Note / Specification
            </label>
            <textarea
              rows={3}
              placeholder="Add optional notes or item specs..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2 text-xs outline-none focus:border-indigo-500 focus:bg-white dark:border-slate-700 dark:bg-slate-800 focus:dark:bg-slate-800 dark:text-slate-100"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-700 disabled:opacity-50"
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