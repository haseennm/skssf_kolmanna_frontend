import { useEffect, useState } from "react";
import { useActiveYearStore, type ActiveYear, type ActiveYearStatus } from "../store/useActiveYearStore";
import { AlertCircle, Save, X } from "lucide-react";
import { checkPermission } from "../utils/checkPermission";
import { useAuthStore } from "../store/useAuthStore";
import { useNavigate } from "react-router-dom";

interface FormModalProps {
    open: boolean;
    editingYear: ActiveYear | null;
    onClose: () => void;
    action_by: string | number;
}

export const ActiveYearFormModal: React.FC<FormModalProps> = ({
    open,
    editingYear,
    onClose,
    action_by,
}) => {
    const { createActiveYear, editActiveYear, isLoading, error, clearError } = useActiveYearStore();

    const [yearTitle, setYearTitle] = useState("");
    const [status, setStatus] = useState<ActiveYearStatus>("Soon");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [formError, setFormError] = useState<string | null>(null);
    const [startYear, setStartYear] = useState("");
    const [endYear, setEndYear] = useState("");
    const navigate = useNavigate()
    const { user } = useAuthStore();

    const handleStartYearChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!(checkPermission(user, ["all handle"], navigate))) return;
        const value = e.target.value.replace(/\D/g, "").slice(0, 4);
        setStartYear(value);
    };

    const handleEndYearChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!(checkPermission(user, ["all handle"], navigate))) return;
        const value = e.target.value.replace(/\D/g, "").slice(0, 4);
        setEndYear(value);
    };
    useEffect(() => {
        if (startYear && endYear) {
            setYearTitle(`${startYear}-${endYear}`);
        } else {
            setYearTitle("");
        }
    }, [startYear, endYear]);
    useEffect(() => {
        if (editingYear) {
            setYearTitle(editingYear.year_title || "");
            setStatus((editingYear.status as ActiveYearStatus) || "Soon");
            setStartDate(
                editingYear.start_date
                    ? new Date(editingYear.start_date).toISOString().split("T")[0]
                    : ""
            );
            setEndDate(
                editingYear.end_date
                    ? new Date(editingYear.end_date).toISOString().split("T")[0]
                    : ""
            );
        } else {
            setYearTitle("");
            setStatus("Soon");
            setStartDate("");
            setEndDate("");
        }
        setFormError(null);
    }, [editingYear, open]);

    if (!open) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        if (!(checkPermission(user, ["all handle"], navigate))) return;

        e.preventDefault();
        setFormError(null);

        if (!yearTitle.trim()) {
            setFormError("Year title is required (e.g., 2026-2028).");
            return;
        }

        let success = false;

        if (editingYear) {
            success = await editActiveYear({
                id: editingYear.id,
                year_title: yearTitle.trim(),
                status: status === "Open" || status === "End" ? status : undefined,
                start_date: startDate || undefined,
                end_date: endDate || undefined,
                updated_by: action_by,
            });
        } else {
            success = await createActiveYear({
                year_title: yearTitle.trim(),
                status,
                created_by: action_by,
            });
        }

        if (success) {
            onClose();
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-sm">
            <div className="flex h-full w-full max-w-lg flex-col overflow-hidden bg-white shadow-2xl dark:bg-slate-900">
                {/* Header */}
                <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5 dark:border-slate-800">
                    <div>
                        <h2 className="text-xl font-bold dark:text-white">
                            {editingYear ? "Edit Working Year" : "Create Working Year"}
                        </h2>
                        <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                            {editingYear
                                ? "Modify year title and session timeframe."
                                : "Add a new session/academic active year period."}
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-200"
                    >
                        <X size={20} />
                    </button>
                </div>
                {error && (
                    <div className="flex items-center justify-between rounded-xl border border-rose-200 bg-rose-50/80 p-4 text-sm text-rose-700 backdrop-blur dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-300">
                        <div className="flex items-center gap-2">
                            <AlertCircle size={18} />
                            <span>{error}</span>
                        </div>
                        <button
                            onClick={clearError}
                            className="rounded-lg bg-rose-600 px-3 py-1 text-xs font-semibold text-white transition hover:bg-rose-700"
                        >
                            Clear
                        </button>
                    </div>
                )}
                {/* Form Body */}
                <form onSubmit={handleSubmit} className="flex flex-1 flex-col justify-between overflow-y-auto">
                    <div className="space-y-5 p-6">
                        {formError && (
                            <div className="rounded-xl border border-rose-200 bg-rose-50 p-3.5 text-xs text-rose-700 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-300">
                                {formError}
                            </div>
                        )}

                        {/* Year Title */}
                        {!editingYear ? <div className="flex items-center gap-2">
                            <input
                                type="text"
                                inputMode="numeric"
                                pattern="[0-9]*"
                                placeholder="2002"
                                value={startYear}
                                onChange={handleStartYearChange}
                                maxLength={4}
                                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-2.5 text-sm outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:focus:border-indigo-400 focus:dark:bg-last-800"
                            />

                            <span className="text-lg font-semibold text-slate-500">-</span>

                            <input
                                type="text"
                                inputMode="numeric"
                                pattern="[0-9]*"
                                placeholder="2004"
                                value={endYear}
                                onChange={handleEndYearChange}
                                maxLength={4}
                                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-2.5 text-sm outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:focus:border-indigo-400 focus:dark:bg-last-800"
                            />
                        </div> :
                            <div>
                                <label className="mb-1.5 block text-xs font-semibold text-slate-700 dark:text-slate-200">
                                    Year Title (YYYY-YYYY) <span className="text-rose-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    placeholder="e.g. 2026-2028"
                                    value={yearTitle}
                                    onChange={(e) => setYearTitle(e.target.value)}
                                    className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-2.5 text-sm outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:focus:border-indigo-400"
                                />
                            </div>}

                        {/* Initial Status (Only for Create or Edit) */}
                        {!editingYear && (
                            <div>
                                <label className="mb-1.5 block text-xs font-semibold text-slate-700 dark:text-slate-200">
                                    Initial Status
                                </label>
                                <select
                                    value={status}
                                    onChange={(e) => setStatus(e.target.value as ActiveYearStatus)}
                                    className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-2.5 text-sm outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:focus:border-indigo-400 focus:dark:bg-last-800"
                                >
                                    <option value="Soon">Soon (Upcoming)</option>
                                    <option value="Open">Open (Active)</option>
                                    <option value="Close">Close (Over)</option>
                                </select>
                            </div>
                        )}

                        {/* Start & End Date (For Edit Mode) */}
                        {editingYear && (
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="mb-1.5 block text-xs font-semibold text-slate-700 dark:text-slate-200">
                                        Start Date
                                    </label>
                                    <input
                                        type="date"
                                        value={startDate}
                                        onChange={(e) => setStartDate(e.target.value)}
                                        className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2.5 text-xs outline-none transition focus:border-indigo-500 focus:bg-white dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                                    />
                                </div>

                                <div>
                                    <label className="mb-1.5 block text-xs font-semibold text-slate-700 dark:text-slate-200">
                                        End Date
                                    </label>
                                    <input
                                        type="date"
                                        value={endDate}
                                        onChange={(e) => setEndDate(e.target.value)}
                                        className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2.5 text-xs outline-none transition focus:border-indigo-500 focus:bg-white dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                                    />
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-end gap-3 border-t border-slate-200 px-6 py-4 dark:border-slate-800">
                        <button
                            type="button"
                            onClick={onClose}
                            className="rounded-xl px-4 py-2.5 text-xs font-semibold text-slate-600 transition hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-xs font-semibold text-white shadow-md transition hover:bg-indigo-700 disabled:opacity-50"
                        >
                            <Save size={16} />
                            {isLoading ? "Saving..." : editingYear ? "Update Year" : "Save Working Year"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};