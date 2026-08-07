import React, { useEffect, useState } from "react";
import { X, Save, PackageCheck, AlertCircle } from "lucide-react";
import { useSahachariIssues } from "../store/useSahachariIssues";
import { useSahachariItems } from "../store/useSahachariItems";
import { useSahachariUsers } from "../store/useSahachariUsers";
import { useAuthStore } from "../store/useAuthStore";
import { useNavigate } from "react-router-dom";
import { checkPermission } from "../utils/checkPermission";

interface SahachariIssueModalProps {
    open: boolean;
    onClose: () => void;
    actionBy: string | number;
}

export const SahachariIssueModal: React.FC<SahachariIssueModalProps> = ({
    open,
    onClose,
    actionBy,
}) => {
    const { createIssue, loading, error } = useSahachariIssues();
    const { items, fetchItems } = useSahachariItems();
    const { users, fetchUsers } = useSahachariUsers();

    const [userId, setUserId] = useState<number | "">("");
    const [itemId, setItemId] = useState<number | "">("");
    const [issueDate, setIssueDate] = useState(
        new Date().toISOString().split("T")[0]
    );
    const [formError, setFormError] = useState<string | null>(null);

    const navigate = useNavigate();
    const { user } = useAuthStore();

    useEffect(() => {
        if (!checkPermission(user, ["sahachari handle", "all handle"], navigate)) return;
        if (open) {
            fetchItems({ page: 1, limit: 100 });
            fetchUsers({ page: 1, limit: 100 });
        }
    }, [open, user, navigate]);

    if (!open) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!(await checkPermission(user, ["sahachari handle", "all handle"], navigate))) return;

        if (!userId || !itemId || !issueDate) {
            setFormError("Please select a user, an item, and an issue date.");
            return;
        }

        const success = await createIssue({
            user_id: Number(userId),
            item_id: Number(itemId),
            issue_date: issueDate,
            action_by: actionBy,
        });

        if (success) {
            setUserId("");
            setItemId("");
            onClose();
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-md p-4 transition-all animate-in fade-in duration-200">
            <div className="w-full max-w-lg overflow-hidden rounded-3xl border border-slate-200/80 bg-white/95 shadow-2xl backdrop-blur-xl transition-all dark:border-slate-800/80 dark:bg-slate-900/95 dark:shadow-slate-950/80">

                {/* Modal Header */}
                <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 dark:border-slate-800/80">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-indigo-100 bg-indigo-50 text-indigo-600 dark:border-indigo-900/50 dark:bg-indigo-950/60 dark:text-indigo-400">
                            <PackageCheck size={20} />
                        </div>
                        <div>
                            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                                Issue Sahachari Item
                            </h3>
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                                Assign equipment or inventory items to a registered beneficiary
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
                {error && (
                    <div className="flex items-center justify-between rounded-xl border border-rose-200 bg-rose-50/80 p-4 text-sm text-rose-700 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-300">
                        <div className="flex items-center gap-2">
                            <AlertCircle size={18} />
                            <span>{error}</span>
                        </div>
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

                    {/* Select User / Beneficiary */}
                    <div>
                        <label className="mb-1.5 block text-xs font-semibold text-slate-700 dark:text-slate-300">
                            Select User / Beneficiary <span className="text-rose-500">*</span>
                        </label>
                        <select
                            value={userId}
                            onChange={(e) => setUserId(Number(e.target.value))}
                            className="w-full rounded-2xl border border-slate-200 bg-slate-50/60 px-3.5 py-2.5 text-xs text-slate-900 outline-none transition-all focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 dark:border-slate-800 dark:bg-slate-800/40 dark:text-slate-100 dark:focus:border-indigo-500 dark:focus:bg-slate-900 dark:focus:ring-indigo-500/20"
                        >
                            <option value="" className="dark:bg-slate-900">-- Choose User --</option>
                            {users.map((u) => (
                                <option key={u.id} value={u.id} className="dark:bg-slate-900">
                                    {u.name} ({u.identification_name})
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Select Item */}
                    <div>
                        <label className="mb-1.5 block text-xs font-semibold text-slate-700 dark:text-slate-300">
                            Select Item <span className="text-rose-500">*</span>
                        </label>
                        <select
                            value={itemId}
                            onChange={(e) => setItemId(Number(e.target.value))}
                            className="w-full rounded-2xl border border-slate-200 bg-slate-50/60 px-3.5 py-2.5 text-xs text-slate-900 outline-none transition-all focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 dark:border-slate-800 dark:bg-slate-800/40 dark:text-slate-100 dark:focus:border-indigo-500 dark:focus:bg-slate-900 dark:focus:ring-indigo-500/20"
                        >
                            <option value="" className="dark:bg-slate-900">-- Choose Item --</option>
                            {items.map((item) => (
                                <option key={item.id} value={item.id} className="dark:bg-slate-900">
                                    {item.name} ({item.item_code})
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Issue Date */}
                    <div>
                        <label className="mb-1.5 block text-xs font-semibold text-slate-700 dark:text-slate-300">
                            Issue Date <span className="text-rose-500">*</span>
                        </label>
                        <input
                            type="date"
                            value={issueDate}
                            onChange={(e) => setIssueDate(e.target.value)}
                            className="w-full rounded-2xl border border-slate-200 bg-slate-50/60 px-3.5 py-2.5 text-xs text-slate-900 outline-none transition-all focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 dark:border-slate-800 dark:bg-slate-800/40 dark:text-slate-100 dark:focus:border-indigo-500 dark:focus:bg-slate-900 dark:focus:ring-indigo-500/20"
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
                            disabled={loading}
                            className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-xs font-semibold text-white shadow-md shadow-indigo-600/20 transition-all hover:bg-indigo-500 active:scale-[0.98] disabled:opacity-50 dark:bg-indigo-600 dark:hover:bg-indigo-500"
                        >
                            <Save size={14} />
                            {loading ? "Issuing..." : "Confirm Issue"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};