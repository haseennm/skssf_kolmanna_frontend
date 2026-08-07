import React, { useEffect, useState } from "react";
import { X, Save, AlertCircle, User } from "lucide-react";
import { useSahachariUsers, type SahachariUser } from "../store/useSahachariUsers";
import { useAuthStore } from "../store/useAuthStore";
import { useNavigate } from "react-router-dom";
import { checkPermission } from "../utils/checkPermission";

interface SahachariUserModalProps {
  open: boolean;
  editingUser: SahachariUser | null;
  onClose: () => void;
  actionBy: string | number;
}

export const SahachariUserModal: React.FC<SahachariUserModalProps> = ({
  open,
  editingUser,
  onClose,
  actionBy,
}) => {
  const { createUser, editUser, error, clearError, isLoading } = useSahachariUsers();

  const [name, setName] = useState("");
  const [identificationName, setIdentificationName] = useState("");
  const [address, setAddress] = useState("");
  const [formError, setFormError] = useState<string | null>(null);

  const navigate = useNavigate();
  const { user } = useAuthStore();

  useEffect(() => {
    if (!checkPermission(user, ["sahachari handle", "all handle"], navigate)) return;
  }, [user, navigate]);

  useEffect(() => {
    if (editingUser) {
      setName(editingUser.name || "");
      setIdentificationName(editingUser.identification_name || "");
      setAddress(editingUser.address || "");
    } else {
      setName("");
      setIdentificationName("");
      setAddress("");
    }
    setFormError(null);
  }, [editingUser, open]);

  if (!open) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!(await checkPermission(user, ["sahachari handle", "all handle"], navigate))) return;

    if (!name.trim()) {
      setFormError("User name is required.");
      return;
    }

    let success = false;
    if (editingUser) {
      success = await editUser({
        id: editingUser.id,
        name: name.trim(),
        identification_name: identificationName.trim() || undefined,
        address: address.trim() || undefined,
        action_by: actionBy,
      });
    } else {
      success = await createUser({
        name: name.trim(),
        identification_name: identificationName.trim() || undefined,
        address: address.trim() || undefined,
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
            <User size={20} />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
              {editingUser ? "Edit Sahachari User" : "Register New User"}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {editingUser ? "Update member details and identification" : "Add a new beneficiary or member profile"}
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

        {/* Full Name */}
        <div>
          <label className="mb-1.5 block text-xs font-semibold text-slate-700 dark:text-slate-300">
            Full Name <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            placeholder="e.g. Rahul Sharma"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-2xl border border-slate-200 bg-slate-50/60 px-3.5 py-2.5 text-xs text-slate-900 outline-none transition-all focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 dark:border-slate-800 dark:bg-slate-800/40 dark:text-slate-100 dark:placeholder-slate-500 dark:focus:border-indigo-500 dark:focus:bg-slate-900 dark:focus:ring-indigo-500/20"
          />
        </div>

        {/* Identification Code / Aadhar / Member ID */}
        <div>
          <label className="mb-1.5 block text-xs font-semibold text-slate-700 dark:text-slate-300">
            Identification Code / Aadhar / Member ID
          </label>
          <input
            type="text"
            placeholder="e.g. ID-8849 / Aadhar No."
            value={identificationName}
            onChange={(e) => setIdentificationName(e.target.value)}
            className="w-full rounded-2xl border border-slate-200 bg-slate-50/60 px-3.5 py-2.5 text-xs text-slate-900 outline-none transition-all focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 dark:border-slate-800 dark:bg-slate-800/40 dark:text-slate-100 dark:placeholder-slate-500 dark:focus:border-indigo-500 dark:focus:bg-slate-900 dark:focus:ring-indigo-500/20"
          />
        </div>

        {/* Address */}
        <div>
          <label className="mb-1.5 block text-xs font-semibold text-slate-700 dark:text-slate-300">
            Address
          </label>
          <textarea
            rows={3}
            placeholder="e.g. House No, Street name..."
            value={address}
            onChange={(e) => setAddress(e.target.value)}
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
            {isLoading ? "Saving..." : "Save Member"}
          </button>
        </div>
      </form>
    </div>
  </div>
);
};