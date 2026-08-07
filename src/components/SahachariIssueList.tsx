import React, { useEffect, useState, useMemo } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  Boxes,
  Package,
  Plus,
  Search,
  RotateCcw,
  AlertCircle,
  Users,
  CheckCircle2,
  X,
} from "lucide-react";
import { useSahachariIssues, type SahachariFilter } from "../store/useSahachariIssues";
import { useAuthStore } from "../store/useAuthStore";
import { checkPermission } from "../utils/checkPermission";
import { SahachariIssueModal } from "./SahachariIssueModal";

export const SahachariIssueList: React.FC = () => {
  const {
    issues,
    loading,
    error,
    fetchIssues,
    returnIssue,
    setFilters,
    resetFilters,
  } = useSahachariIssues();

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFilter, setSelectedFilter] = useState<SahachariFilter>("all");
  const [modalOpen, setModalOpen] = useState(false);

  // Return Date Modal State
  const [returnModalIssueId, setReturnModalIssueId] = useState<number | null>(null);
  const [returnDate, setReturnDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  );
  const [isSubmittingReturn, setIsSubmittingReturn] = useState(false);

  const { user } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (!checkPermission(user, ["sahachari handle", "all handle"], navigate)) return;
    fetchIssues();
  }, [user, navigate]);

  // Client-side filtering: Updates instantly as search/filter values change without backend API calls
  const filteredIssues = useMemo(() => {
    return issues.filter((issue) => {
      const query = searchTerm.trim().toLowerCase();
      const matchesSearch =
        !query ||
        issue.user_name?.toLowerCase().includes(query) ||
        issue.item_name?.toLowerCase().includes(query);

      const matchesFilter = (() => {
        if (selectedFilter === "all") return true;
        if (selectedFilter === "issued") return issue.status === "Issued";
        if (selectedFilter === "returned") return issue.status === "Returned";
        if (selectedFilter === "overdue_3_months") {
          if (issue.status !== "Issued") return false;
          const issueDate = new Date(issue.issue_date);
          const threeMonthsAgo = new Date();
          threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
          return issueDate <= threeMonthsAgo;
        }
        return true;
      })();

      return matchesSearch && matchesFilter;
    });
  }, [issues, searchTerm, selectedFilter]);

  // Backend call: Executed ONLY when Search button is clicked or Enter key is pressed
  const handleSearch = () => {
    setFilters({ search: searchTerm || undefined, filter: selectedFilter });
  };

  const handleReset = () => {
    setSearchTerm("");
    setSelectedFilter("all");
    resetFilters();
  };

  const handleOpenReturnModal = async (id: number) => {
    if (!(await checkPermission(user, ["sahachari handle", "all handle"], navigate))) return;
    setReturnDate(new Date().toISOString().split("T")[0]);
    setReturnModalIssueId(id);
  };

  const handleConfirmReturn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!returnModalIssueId || !returnDate) return;

    setIsSubmittingReturn(true);
    await returnIssue({
      id: returnModalIssueId,
      return_date: returnDate,
      action_by: user!.id,
    });
    setIsSubmittingReturn(false);
    setReturnModalIssueId(null);
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 transition-colors dark:bg-slate-950 sm:p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Navigation Tabs Header */}
        <div className="flex flex-col gap-4 border-b border-slate-200 pb-4 dark:border-slate-800 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 sm:text-3xl">
              Sahachari Issue Management
            </h1>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Track issued items, process returns, and maintain activity logs.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-slate-200 bg-white p-1.5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <NavLink
              to="/sahachari"
              end
              className={({ isActive }) =>
                `inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold transition ${
                  isActive
                    ? "bg-indigo-600 text-white shadow-sm"
                    : "text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
                }`
              }
            >
              <Boxes size={16} />
              Issues Log
            </NavLink>

            <NavLink
              to="/sahachari/items"
              className={({ isActive }) =>
                `inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold transition ${
                  isActive
                    ? "bg-indigo-600 text-white shadow-sm"
                    : "text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
                }`
              }
            >
              <Package size={16} />
              Items
            </NavLink>

            <NavLink
              to="/sahachari/users"
              className={({ isActive }) =>
                `inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold transition ${
                  isActive
                    ? "bg-indigo-600 text-white shadow-sm"
                    : "text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
                }`
              }
            >
              <Users size={16} />
              Members / Users
            </NavLink>
          </div>
        </div>

        {/* Action Header */}
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
            Issued Entries
          </h2>
          <button
            onClick={() => setModalOpen(true)}
            className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-semibold text-white shadow-md transition hover:bg-indigo-700 active:scale-95"
          >
            <Plus size={16} />
            Issue Item
          </button>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="flex items-center justify-between rounded-xl border border-rose-200 bg-rose-50/80 p-4 text-sm text-rose-700 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-300">
            <div className="flex items-center gap-2">
              <AlertCircle size={18} />
              <span>{error}</span>
            </div>
          </div>
        )}

        {/* Filter Bar */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative flex-1">
              <Search
                size={16}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500"
              />
              <input
                type="text"
                placeholder="Search user or item name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2 pl-10 pr-4 text-xs text-slate-900 placeholder-slate-400 outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-800 dark:bg-slate-800/50 dark:text-slate-100 dark:placeholder-slate-500 dark:focus:border-indigo-500 dark:focus:bg-slate-900 dark:focus:ring-indigo-500/20"
              />
            </div>

            <select
              value={selectedFilter}
              onChange={(e) => setSelectedFilter(e.target.value as SahachariFilter)}
              className="rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2 text-xs text-slate-700 outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-800 dark:bg-slate-800/50 dark:text-slate-200 dark:focus:border-indigo-500 dark:focus:bg-slate-900 dark:focus:ring-indigo-500/20"
            >
              <option value="all" className="bg-white text-slate-900 dark:bg-slate-900 dark:text-slate-100">
                All Issues
              </option>
              <option value="issued" className="bg-white text-slate-900 dark:bg-slate-900 dark:text-slate-100">
                Currently Issued
              </option>
              <option value="returned" className="bg-white text-slate-900 dark:bg-slate-900 dark:text-slate-100">
                Returned
              </option>
              <option value="overdue_3_months" className="bg-white text-slate-900 dark:bg-slate-900 dark:text-slate-100">
                Overdue (3+ Months)
              </option>
            </select>

            <div className="flex items-center gap-2">
              <button
                onClick={handleReset}
                className="rounded-xl border border-slate-200 p-2 text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
              >
                <RotateCcw size={16} />
              </button>
              <button
                onClick={handleSearch}
                className="rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-700"
              >
                Search
              </button>
            </div>
          </div>
        </div>

        {/* Data Table */}
        <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600 dark:text-slate-300">
              <thead className="border-b border-slate-200 bg-slate-50/80 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:border-slate-800 dark:bg-slate-800/50 dark:text-slate-400">
                <tr>
                  <th className="px-6 py-4">sr.NO</th>
                  <th className="px-6 py-4">User</th>
                  <th className="px-6 py-4">Item</th>
                  <th className="px-6 py-4">Issue Date</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-xs text-slate-400">
                      Loading issues...
                    </td>
                  </tr>
                ) : filteredIssues.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-xs text-slate-400">
                      No issue records found.
                    </td>
                  </tr>
                ) : (
                  filteredIssues.map((issue, i) => (
                    <tr
                      key={issue.id}
                      className="transition hover:bg-slate-50/80 dark:hover:bg-slate-800/40"
                    >
                      <td className="px-6 py-4 text-xs font-mono text-slate-400">{i + 1}</td>
                      <td className="px-6 py-4 font-semibold text-slate-900 dark:text-slate-100">
                        {issue.user_name}
                      </td>
                      <td className="px-6 py-4 font-medium text-indigo-600 dark:text-indigo-400">
                        {issue.item_name}
                      </td>
                      <td className="px-6 py-4 text-xs text-slate-500 dark:text-slate-400">
                        {new Date(issue.issue_date).toLocaleDateString("en-GB", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ${
                            issue.status === "Returned"
                              ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400"
                              : "bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-400"
                          }`}
                        >
                          {issue.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        {issue.status === "Issued" && (
                          <button
                            onClick={() => handleOpenReturnModal(issue.id)}
                            className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700 transition active:scale-95"
                          >
                            <CheckCircle2 size={13} /> Return
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Issue Modal */}
      {user && (
        <SahachariIssueModal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          actionBy={user.id}
        />
      )}

      {/* Return Date Selection Modal */}
      {returnModalIssueId !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-md p-4 transition-all animate-in fade-in duration-200">
          <div className="w-full max-w-md overflow-hidden rounded-3xl border border-slate-200/80 bg-white/95 shadow-2xl backdrop-blur-xl transition-all dark:border-slate-800/80 dark:bg-slate-900/95">
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 dark:border-slate-800/80">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-emerald-100 bg-emerald-50 text-emerald-600 dark:border-emerald-900/50 dark:bg-emerald-950/60 dark:text-emerald-400">
                  <CheckCircle2 size={20} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                    Return Sahachari Item
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Select the return date for this record
                  </p>
                </div>
              </div>
              <button
                onClick={() => setReturnModalIssueId(null)}
                type="button"
                className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-200"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleConfirmReturn} className="p-6 space-y-4">
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Return Date <span className="text-rose-500">*</span>
                </label>
                <input
                  type="date"
                  required
                  value={returnDate}
                  onChange={(e) => setReturnDate(e.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50/60 px-3.5 py-2.5 text-xs text-slate-900 outline-none transition-all focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 dark:border-slate-800 dark:bg-slate-800/40 dark:text-slate-100 dark:focus:border-indigo-500 dark:focus:bg-slate-900 dark:focus:ring-indigo-500/20"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 border-t border-slate-100 pt-3 dark:border-slate-800/80">
                <button
                  type="button"
                  onClick={() => setReturnModalIssueId(null)}
                  className="rounded-xl px-4 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingReturn}
                  className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-xs font-semibold text-white shadow-md shadow-emerald-600/20 hover:bg-emerald-500 active:scale-[0.98] disabled:opacity-50"
                >
                  <CheckCircle2 size={14} />
                  {isSubmittingReturn ? "Processing..." : "Confirm Return"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};