import { X } from "lucide-react";
import type { Ledger } from "../store/useLedgerStore";

interface Props {
  ledger: Ledger | null;
  open: boolean;
  onClose: () => void;
}

export default function LedgerDetails({
  ledger,
  open,
  onClose,
}: Props) {
  if (!open || !ledger) return null;

  return (
  <div className="fixed inset-0 z-50 flex justify-end bg-black/50 backdrop-blur-sm">
    <div className="h-full w-full max-w-2xl overflow-y-auto border-l border-slate-200 bg-white shadow-2xl dark:border-slate-700 dark:bg-slate-900">
      {/* Header */}
      <div className="sticky top-0 flex items-center justify-between border-b border-slate-200 bg-white px-6 py-5 dark:border-slate-700 dark:bg-slate-900">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
            Transaction Details
          </h2>

          <p className="text-sm text-slate-500 dark:text-last-100">
            {ledger.reference_number}
          </p>
        </div>

        <button
          onClick={onClose}
          className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-700 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white"
        >
          <X size={20} />
        </button>
      </div>

      <div className="space-y-8 p-6">
        {/* Basic Information */}
        <section>
          <h3 className="mb-4 text-lg font-semibold text-slate-900 dark:text-white">
            Basic Information
          </h3>

          <div className="grid grid-cols-2 gap-4  ">
            <Info
              title="Reference"
              value={ledger.reference_number}
            />

            <Info
              title="Date"
              value={new Date(ledger.date).toLocaleDateString()}
            />

            <Info
              title="Flow"
              value={
                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${
                    ledger.payment_flow === "In"
                      ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                      : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                  }`}
                >
                  {ledger.payment_flow}
                </span>
              }
            />

            <Info
              title="Status"
              value={
                <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700 dark:bg-green-900/30 dark:text-green-400">
                  Completed
                </span>
              }
            />

            <Info
              title="Total Amount"
              value={`₹${Number(ledger.total_amount).toLocaleString()}`}
            />

            <Info
              title="Paid Amount"
              value={`₹${Number(ledger.paid_amount).toLocaleString()}`}
            />
          </div>
        </section>

        {/* Program */}
        {(ledger.program_name || ledger.program_wing) && (
          <section>
            <h3 className="mb-4 text-lg font-semibold text-slate-900 dark:text-white">
              Program Information
            </h3>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-5 dark:border-slate-700 dark:bg-slate-800">
              <div className="grid grid-cols-2 gap-4">
                <Info
                  title="Program"
                  value={ledger.program_name || "-"}
                />

                <Info
                  title="Wing"
                  value={ledger.program_wing || "-"}
                />
              </div>
            </div>
          </section>
        )}

        {/* Note */}
        <section>
          <h3 className="mb-3 text-lg font-semibold text-slate-900 dark:text-white">
            Note
          </h3>

          <div className="rounded-xl border border-slate-200 bg-slate-50 p-5 text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
            {ledger.note || "No note available"}
          </div>
        </section>

        {/* Payment Breakdown */}
        <section>
          <h3 className="mb-4 text-lg font-semibold text-slate-900 dark:text-white">
            Payment Breakdown
          </h3>

          <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-700">
            <table className="w-full">
              <thead className="bg-slate-100 dark:bg-slate-800">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700 dark:text-slate-300">
                    Category
                  </th>

                  <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700 dark:text-slate-300">
                    Note
                  </th>

                  <th className="px-4 py-3 text-right text-sm font-semibold text-slate-700 dark:text-slate-300">
                    Amount
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                {ledger.payment_overview.map((payment) => (
                  <tr
                    key={payment.payment_category_id}
                    className="bg-white hover:bg-slate-50 dark:bg-slate-900 dark:hover:bg-slate-800"
                  >
                    <td className="px-4 py-4">
                      <span className="rounded-full bg-indigo-100 px-3 py-1 text-sm font-medium text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400">
                        {payment.payment_category_name}
                      </span>
                    </td>

                    <td className="px-4 py-4 text-slate-700 dark:text-slate-300">
                      {payment.note}
                    </td>

                    <td className="px-4 py-4 text-right font-semibold text-slate-900 dark:text-white">
                      ₹{payment.amount.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>

              <tfoot>
                <tr className="border-t border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-800">
                  <td
                    colSpan={2}
                    className="px-4 py-4 text-right font-bold text-slate-700 dark:text-slate-300"
                  >
                    Total
                  </td>

                  <td className="px-4 py-4 text-right font-bold text-indigo-600 dark:text-indigo-400">
                    ₹{Number(ledger.total_amount).toLocaleString()}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </section>
      </div>
    </div>
  </div>
);
}

function Info({
  title,
  value,
}: {
  title: string;
  value: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800">
    <p className="mb-1 text-sm text-slate-500 dark:text-slate-400">
      {title}
    </p>

    <div className="font-medium text-slate-900 dark:text-slate-100">
      {value}
    </div>
  </div>
  );
}