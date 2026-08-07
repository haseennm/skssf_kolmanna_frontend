import React, { useEffect, useState, useRef } from "react";
import {
  Play,
  Square,
  Plus,
  Search,
  RotateCcw,
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  EllipsisVertical,
  Pencil,
  Trash2,
  Sparkles,
} from "lucide-react";
import {
  useActiveYearStore,
  type ActiveYear,
} from "../store/useActiveYearStore";
import { useAuthStore } from "../store/useAuthStore";
import { ActiveYearFormModal } from "./ActiveYearModel";
import { useNavigate } from "react-router-dom";
import { checkPermission } from "../utils/checkPermission";

export const ActiveYearList: React.FC = () => {
  // Store Hooks
  const {
    activeYears,
    pagination,
    isLoading,
    error,
    fetchActiveYears,
    deleteActiveYear,
    startActiveYear,
    endActiveYear,
    clearError,
  } = useActiveYearStore();
  const navigate = useNavigate()
  const { user } = useAuthStore();

  // Local Component States
  const [openMenu, setOpenMenu] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [formOpen, setFormOpen] = useState(false);
  const [editingYear, setEditingYear] = useState<ActiveYear | null>(null);

  const menuRef = useRef<HTMLDivElement | null>(null);


  // Initial Fetch
  useEffect(() => {
    fetchActiveYears({ page: 1, limit: 10 });
  }, []);

  // Close Action Dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpenMenu(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Handlers
  const handleSearch = () => {
    fetchActiveYears({
      page: 1,
      limit: 10,
      search: searchTerm || undefined,
      status: statusFilter || undefined,
    });
  };

  const handleReset = () => {
    setSearchTerm("");
    setStatusFilter("");
    fetchActiveYears({
      page: 1,
      limit: 10,
    });
  };

  const handlePageChange = (newPage: number) => {
    fetchActiveYears({
      page: newPage,
      limit: pagination?.limit || 10,
      search: searchTerm || undefined,
      status: statusFilter || undefined,
    });
  };

  // Direct One-Press Status Action Handlers
  const handleStartYear = async (id: number, title: string) => {
  if (!(await checkPermission(user, "all handle", navigate))) return;

    if (
      window.confirm(
        `Are you sure you want to START active year "${title}"? This will set its status to Open.`
      )
    ) {
      await startActiveYear({ id });
    }
  };

  const handleEndYear = async (id: number, title: string) => {
  if (!(await checkPermission(user, "all handle", navigate))) return;

    if (
      window.confirm(
        `Are you sure you want to END active year "${title}"? This will set its status to End.`
      )
    ) {
      await endActiveYear({ id });
    }
  };

  const handleDelete = async (r_id: number) => {
  if (!(await checkPermission(user, "all handle", navigate))) return;

  if (window.confirm("Are you sure you want to delete this active year session?")) {
    await deleteActiveYear({
      r_id,
      action_by: user!.id,
    });

    setOpenMenu(null);
  }
};

  const handleOpenCreate = () => {
    setEditingYear(null);
    setFormOpen(true);
  };

  const handleOpenEdit = (year: ActiveYear) => {
    setEditingYear(year);
    setFormOpen(true);
    setOpenMenu(null);
  };

  // Quick metrics calculations
  const totalYears = pagination?.total || activeYears.length;
  const activeOpenYear = activeYears.find((y) => y.status === "Open");
  const upcomingCount = activeYears.filter((y) => y.status === "Soon").length;

  return (
    <div className="min-h-screen bg-slate-50 p-4 transition-colors dark:bg-slate-950 sm:p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Top Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 sm:text-3xl">
              Academic & Working Years
            </h1>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Manage organizational sessions, toggle active status, and track start/end dates.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={handleOpenCreate}
              className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md transition hover:bg-indigo-700 hover:shadow-indigo-500/20 active:scale-95"
            >
              <Plus size={18} />
              Add Working Year
            </button>
          </div>
        </div>

        {/* Quick Summary Cards */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="flex items-center justify-between rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Current Active Year
              </p>
              <p className="mt-1 text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                {activeOpenYear ? activeOpenYear.year_title : "None Active"}
              </p>
            </div>
            <div className="rounded-xl bg-emerald-50 p-3 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400">
              <CheckCircle2 size={22} />
            </div>
          </div>

          <div className="flex items-center justify-between rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Upcoming Sessions
              </p>
              <p className="mt-1 text-2xl font-bold text-amber-600 dark:text-amber-400">
                {upcomingCount}
              </p>
            </div>
            <div className="rounded-xl bg-amber-50 p-3 text-amber-600 dark:bg-amber-950/50 dark:text-amber-400">
              <Clock size={22} />
            </div>
          </div>

          <div className="flex items-center justify-between rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Total Records
              </p>
              <p className="mt-1 text-2xl font-bold text-slate-900 dark:text-slate-100">
                {totalYears}
              </p>
            </div>
            <div className="rounded-xl bg-indigo-50 p-3 text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-400">
              <Sparkles size={22} />
            </div>
          </div>
        </div>

        {/* Error Alert */}
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

        {/* Search & Filter Bar */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-12">
            {/* Search Input */}
            <div className="xl:col-span-7">
              <label className="mb-1.5 block text-xs font-medium text-slate-600 dark:text-slate-300">
                Search Year
              </label>
              <div className="relative">
                <Search
                  size={16}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  type="text"
                  placeholder="Search title (e.g. 2026-2028)..."
                  value={searchTerm}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:focus:border-indigo-400"
                />
              </div>
            </div>

            {/* Status Dropdown */}
            <div className="xl:col-span-3">
              <label className="mb-1.5 block text-xs font-medium text-slate-600 dark:text-slate-300">
                Status
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2.5 text-sm outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:focus:border-indigo-400"
              >
                <option value="">All Statuses</option>
                <option value="Soon">Soon (Upcoming)</option>
                <option value="Open">Open (Active)</option>
                <option value="End">End (Closed)</option>
              </select>
            </div>

            {/* Action Buttons */}
            <div className="flex items-end gap-2 xl:col-span-2">
              <button
                onClick={handleReset}
                title="Reset Filters"
                className="inline-flex flex-1 items-center justify-center rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
              >
                <RotateCcw size={16} />
              </button>

              <button
                onClick={handleSearch}
                className="inline-flex flex-2 items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 active:scale-95"
              >
                <Search size={16} />
                Filter
              </button>
            </div>
          </div>
        </div>

        {/* Main Data Table */}
        <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
          {isLoading ? (
            /* Loading Skeleton Rows */
            <div className="divide-y divide-slate-100 p-6 dark:divide-slate-800">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex animate-pulse items-center justify-between py-4">
                  <div className="h-4 w-12 rounded bg-slate-200 dark:bg-slate-800"></div>
                  <div className="h-4 w-32 rounded bg-slate-200 dark:bg-slate-800"></div>
                  <div className="h-4 w-20 rounded bg-slate-200 dark:bg-slate-800"></div>
                  <div className="h-4 w-28 rounded bg-slate-200 dark:bg-slate-800"></div>
                  <div className="h-4 w-28 rounded bg-slate-200 dark:bg-slate-800"></div>
                  <div className="h-4 w-24 rounded bg-slate-200 dark:bg-slate-800"></div>
                </div>
              ))}
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-slate-600 dark:text-slate-300">
                  <thead className="border-b border-slate-200/80 bg-slate-50/80 text-xs uppercase tracking-wider font-semibold text-slate-500 dark:border-slate-800 dark:bg-slate-800/50 dark:text-slate-400">
                    <tr>
                      <th className="px-6 py-4">ID</th>
                      <th className="px-6 py-4">Year Title</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4">Start Date</th>
                      <th className="px-6 py-4">End Date</th>
                      <th className="px-6 py-4 text-center">Quick Action</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {activeYears.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="py-12 text-center text-slate-400 dark:text-slate-500">
                          <div className="flex flex-col items-center justify-center gap-2">
                            <Calendar size={32} className="stroke-1 text-slate-300 dark:text-slate-600" />
                            <p className="font-medium">No active working years found.</p>
                            <p className="text-xs text-slate-400">
                              Try creating a new session or adjusting your filters.
                            </p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      activeYears.map((item, i) => {
                        const isSoon = item.status === "Soon";
                        const isOpen = item.status === "Open";
                        const isEnd = item.status === "Close";

                        return (
                          <tr
                            key={item.id}
                            className="transition hover:bg-slate-50/80 dark:hover:bg-slate-800/40"
                          >
                            {/* ID */}
                            <td className="px-6 py-4 text-xs font-mono font-medium text-slate-400">
                              {i + 1}
                            </td>

                            {/* Year Title */}
                            <td className="px-6 py-4 font-bold text-slate-900 dark:text-slate-100">
                              {item.year_title}
                            </td>

                            {/* Status Badge */}
                            <td className="px-6 py-4 whitespace-nowrap">
                              {isOpen && (
                                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400">
                                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                  Open (Active)
                                </span>
                              )}
                              {isSoon && (
                                <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700 dark:bg-amber-950/60 dark:text-amber-400">
                                  <Clock size={12} />
                                  Soon (Upcoming)
                                </span>
                              )}
                              {isEnd && (
                                <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                                  Closed (Ended)
                                </span>
                              )}
                            </td>

                            {/* Start Date */}
                            <td className="px-6 py-4 whitespace-nowrap text-xs text-slate-500 dark:text-slate-400">
                              {item.start_date
                                ? new Date(item.start_date).toLocaleDateString("en-GB", {
                                  day: "2-digit",
                                  month: "short",
                                  year: "numeric",
                                })
                                : "—"}
                            </td>

                            {/* End Date */}
                            <td className="px-6 py-4 whitespace-nowrap text-xs text-slate-500 dark:text-slate-400">
                              {item.end_date
                                ? new Date(item.end_date).toLocaleDateString("en-GB", {
                                  day: "2-digit",
                                  month: "short",
                                  year: "numeric",
                                })
                                : "—"}
                            </td>

                            {/* DIRECT ONE-PRESS BUTTON ACTION */}
                            <td className="px-6 py-4 text-center whitespace-nowrap">
                              {isSoon && (
                                <button
                                  onClick={() => handleStartYear(item.id, item.year_title)}
                                  className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow-sm transition hover:bg-emerald-700 active:scale-95"
                                >
                                  <Play size={13} className="fill-white" />
                                  Start Year
                                </button>
                              )}

                              {isOpen && (
                                <button
                                  onClick={() => handleEndYear(item.id, item.year_title)}
                                  className="inline-flex items-center gap-1.5 rounded-xl bg-rose-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow-sm transition hover:bg-rose-700 active:scale-95"
                                >
                                  <Square size={13} className="fill-white" />
                                  End Year
                                </button>
                              )}

                              {isEnd && (
                                <span className="text-xs text-slate-400 italic">
                                  Session Completed
                                </span>
                              )}
                            </td>

                            {/* Row Action Menu */}
                            <td className="px-6 py-4 text-right whitespace-nowrap">
                              <div
                                className="relative inline-block text-left"
                                ref={openMenu === item.id ? menuRef : null}
                              >
                                <button
                                  onClick={() =>
                                    setOpenMenu(openMenu === item.id ? null : item.id)
                                  }
                                  className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-200"
                                >
                                  <EllipsisVertical size={18} />
                                </button>

                                {openMenu === item.id && (
                                  <div className="absolute right-0 top-full z-20 mt-1 w-40 rounded-xl border border-slate-200 bg-white p-1 shadow-lg dark:border-slate-700 dark:bg-slate-800">
                                    <button
                                      onClick={() => handleOpenEdit(item)}
                                      className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-700"
                                    >
                                      <Pencil size={14} className="text-amber-500" />
                                      Edit Details
                                    </button>

                                    {isSoon && (
                                      <button
                                        onClick={() => {
                                          setOpenMenu(null);
                                          handleStartYear(item.id, item.year_title);
                                        }}
                                        className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-medium text-emerald-600 hover:bg-emerald-50 dark:text-emerald-400 dark:hover:bg-emerald-950/50"
                                      >
                                        <Play size={14} />
                                        Start Session
                                      </button>
                                    )}

                                    {isOpen && (
                                      <button
                                        onClick={() => {
                                          setOpenMenu(null);
                                          handleEndYear(item.id, item.year_title);
                                        }}
                                        className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-950/50"
                                      >
                                        <Square size={14} />
                                        End Session
                                      </button>
                                    )}

                                    <button
                                      onClick={() => handleDelete(item.id)}
                                      className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-950/50"
                                    >
                                      <Trash2 size={14} />
                                      Delete
                                    </button>
                                  </div>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination Footer */}
              {pagination && (
                <div className="flex flex-col items-center justify-between gap-4 border-t border-slate-200/80 px-6 py-4 text-xs text-slate-500 dark:border-slate-800 dark:text-slate-400 sm:flex-row">
                  <p>
                    Showing{" "}
                    <span className="font-semibold text-slate-700 dark:text-slate-200">
                      {activeYears.length}
                    </span>{" "}
                    of{" "}
                    <span className="font-semibold text-slate-700 dark:text-slate-200">
                      {pagination.total}
                    </span>{" "}
                    entries
                  </p>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handlePageChange(pagination.page - 1)}
                      disabled={pagination.page <= 1}
                      className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 font-medium text-slate-600 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                    >
                      Previous
                    </button>

                    <span className="rounded-lg bg-indigo-600 px-3 py-1.5 font-semibold text-white">
                      {pagination.page}
                    </span>

                    <button
                      onClick={() => handlePageChange(pagination.page + 1)}
                      disabled={pagination.page >= pagination.totalPages}
                      className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 font-medium text-slate-600 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {user &&
        <ActiveYearFormModal
          open={formOpen}
          editingYear={editingYear}
          onClose={() => setFormOpen(false)}
          action_by={user.id}
        />
      }
    </div>
  );
};
