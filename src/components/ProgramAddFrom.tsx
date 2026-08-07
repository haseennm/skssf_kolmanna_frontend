import { useEffect, useState } from "react";
import { useProgramStore, type Program } from "../store/useProgramStore";
import { Calendar, Save, X } from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";
import { useNavigate } from "react-router-dom";
import { checkPermission } from "../utils/checkPermission";

interface FormModalProps {
  open: boolean;
  editingProgram: Program | null;
  onClose: () => void;
}

export const ProgramFormModal: React.FC<FormModalProps> = ({
  open,
  editingProgram,
  onClose
}) => {
  const { createProgram, editProgram, isLoading, error } = useProgramStore();
  const { user } = useAuthStore();

  const [title, setTitle] = useState("");
  const [wing, setWing] = useState("");
  const [date, setDate] = useState("");
  const [formError, setFormError] = useState<string | null>(null);

  const wings = ["General", "Ibad", "Meeting", "Viqaya", "Sahachari", "Trend", "Twalaba", "Sargalaya", "State", "District", "Zone", "Cluster"];

  const navigate = useNavigate()
  useEffect(() => {
    if (!(checkPermission(user, ["program handle", "all handle"], navigate))) return;

  }, [user, navigate]);
  useEffect(() => {
    if (editingProgram) {
      if (!(checkPermission(user, ["program handle", "all handle"], navigate))) return;

      setTitle(editingProgram.title || "");
      setWing(editingProgram.wing || "");
      setDate(
        editingProgram.date
          ? new Date(editingProgram.date).toISOString().split("T")[0]
          : ""
      );
    } else {
      setTitle("");
      setWing("");
      setDate(new Date().toISOString().split("T")[0]);
    }
    setFormError(null);
  }, [editingProgram, open]);

  if (!open) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    if (!(await checkPermission(user, ["program handle", "all handle"], navigate))) return;

    e.preventDefault();
    setFormError(null);

    if (!title.trim()) {
      setFormError("Program title is required.");
      return;
    }
    if (!wing.trim()) {
      setFormError("Wing is required.");
      return;
    }
    if (!date) {
      setFormError("Date is required.");
      return;
    }
    let success = false;

    if (editingProgram) {
      success = await editProgram({
        id: editingProgram.id,
        title: title.trim(),
        wing: wing.trim(),
        date,
        active_year_id: user!.active_year_id,
        action_by: user!.id
      });
    } else {
      success = await createProgram({
        title: title.trim(),
        wing: wing.trim(),
        date,
        active_year_id: user!.active_year_id,
        action_by: user!.id
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
              {editingProgram ? "Edit Program" : "Create New Program"}
            </h2>
            <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
              {editingProgram
                ? "Update details for this existing program."
                : "Add a new program and assign it to a wing."}
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

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex flex-1 flex-col justify-between overflow-y-auto">
          <div className="space-y-5 p-6">
            {formError && (
              <div className="rounded-xl border border-rose-200 bg-rose-50 p-3.5 text-xs text-rose-700 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-300">
                {formError}
              </div>
            )}
            {error && (
              <div className="rounded-xl border border-rose-200 bg-rose-50 p-3.5 text-xs text-rose-700 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-300">
                {error}
              </div>
            )}

            {/* Title Input */}
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-slate-700 dark:text-slate-200">
                Program Title <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g. Annual Youth Leadership Summit"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-2.5 text-sm outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:focus:border-indigo-400 dark:focus:bg-last-900"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold text-slate-700 dark:text-slate-200">
                Wing / Department <span className="text-rose-500">*</span>
              </label>
              <select
                value={wing}
                onChange={(e) => setWing(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-2.5 text-sm outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:focus:border-indigo-400 dark:focus:bg-last-900"
              >
                <option value="">Select Wing</option>
                {wings.map((w) => (
                  <option key={w} value={w} className="bg-last-50 dark:bg-last-800">
                    {w}
                  </option>
                ))}
              </select>
            </div>

            {/* Date Input */}
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-slate-700 dark:text-slate-200">
                Scheduled Date <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Calendar size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:focus:border-indigo-400 dark:focus:bg-last-900"
                />
              </div>
            </div>
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
              {isLoading ? "Saving..." : editingProgram ? "Update Program" : "Save Program"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};