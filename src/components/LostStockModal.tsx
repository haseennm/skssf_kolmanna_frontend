import { X, Save } from "lucide-react";
import { useLostStockStore, type LostStock } from "../store/useLostStockStore";
import { useStockStore } from "../store/useStockStore";
import { useAuthStore } from "../store/useAuthStore";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { checkPermission } from "../utils/checkPermission";

interface LostStockModalProps {
  open: boolean;
  editingLostStock: LostStock | null;
  onClose: () => void;
  activeYearId: number;
  actionBy: string | number;
}

export const LostStockModal: React.FC<LostStockModalProps> = ({
  open,
  editingLostStock,
  onClose,
}) => {
  const { createLostStock, editLostStock, isLoading, error } = useLostStockStore();
  const { stocks } = useStockStore();
  const { user } = useAuthStore()
  const navigate = useNavigate()

  const {
    register,
    watch,
    reset,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      stockId: "",
      quantity: "",
      reason: "",
    },
  });
  if (!open) return null;

  const selectedStockId = watch("stockId");
  const selectedStock = stocks.find(
    (s) => s.id === Number(selectedStockId)
  );
  const onSubmit = async (data: any) => {
       if (!(await checkPermission(user, ["stock handle","all handle"], navigate))) return;
   

    let success = false;

    const payload = {
      stock_id: Number(data.stockId),
      quantity: Number(data.quantity),
      reason: data.reason.trim(),
      active_year_id: user!.active_year_id,
      action_by: user!.id,
    };

    if (editingLostStock) {
      success = await editLostStock({
        id: editingLostStock.id,
        ...payload,
      });
    } else {
      success = await createLostStock(payload);
    }

    if (success) {
      reset();
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl dark:bg-slate-900">
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4 dark:border-slate-800">
          <h3 className="font-bold text-slate-900 dark:text-slate-100">
            {editingLostStock ? "Edit Lost Stock Entry" : "Report Lost Stock"}
          </h3>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 p-6">
          {error && (
            <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-300">
              {error}
            </div>
          )}

          {/* Stock */}
          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-700 dark:text-slate-200">
              Select Stock Entry <span className="text-rose-500">*</span>
            </label>

            <select
              {...register("stockId", {
                required: "Please select a stock entry",
                valueAsNumber: true,
              })}
              className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2 text-xs outline-none focus:border-indigo-500 focus:bg-white dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 focus:dark:bg-last-800"
            >
              <option value="">-- Choose Stock Entry --</option>

              {stocks.map((stock) => (
                <option key={stock.id} value={stock.id}>
                  {stock.item_name} (Available: {stock.quantity})
                </option>
              ))}
            </select>

            {errors.stockId && (
              <p className="mt-1 text-xs text-red-500">
                {errors.stockId.message}
              </p>
            )}
          </div>

          {/* Quantity */}
          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-700 dark:text-slate-200">
              Quantity Lost / Damaged <span className="text-rose-500">*</span>
            </label>

            <input
              type="number"
              min={1}
              placeholder="Enter quantity"
              {...register("quantity", {
                required: "Quantity is required",
                valueAsNumber: true,
                min: {
                  value: 1,
                  message: "Quantity must be at least 1",
                },
                validate: (value) => {
                  if (!selectedStock) return "Select a stock first";

                  return (
                    Number(value) <= selectedStock.quantity ||
                    `Only ${selectedStock.quantity} available`
                  );
                },
              })}
              className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2 text-xs outline-none focus:border-indigo-500 focus:bg-white dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 focus:dark:bg-last-800"
            />

            {errors.quantity && (
              <p className="mt-1 text-xs text-red-500">
                {errors.quantity.message}
              </p>
            )}
          </div>

          {/* Reason */}
          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-700 dark:text-slate-200">
              Reason / Cause <span className="text-rose-500">*</span>
            </label>

            <textarea
              rows={3}
              placeholder="e.g. Broken during transit, lost in event..."
              {...register("reason", {
                required: "Please enter reason",
              })}
              className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2 text-xs outline-none focus:border-indigo-500 focus:bg-white dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 focus:dark:bg-last-800"
            />
            {errors.reason && (
              <p className="mt-1 text-xs text-red-500">
                {errors.reason.message}
              </p>
            )}
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
              className="inline-flex items-center gap-1.5 rounded-xl bg-rose-600 px-4 py-2 text-xs font-semibold text-white hover:bg-rose-700 disabled:opacity-50"
            >
              <Save size={14} />
              {isLoading ? "Saving..." : "Save Lost Stock"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};