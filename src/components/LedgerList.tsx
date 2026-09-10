import React, { useEffect, useState, useRef, useMemo } from 'react';
import { useLedgerStore, type Ledger } from '../store/useLedgerStore';
import LedgerDetails from './LedgerDetails';
import {
  EllipsisVertical,
  Eye,
  Pencil,
  Search,
  Trash2,
  TrendingUp,
  TrendingDown,
  Plus,
  Folder,
  RotateCcw,
  Wallet,
  Coins
} from "lucide-react";
import { NavLink, useNavigate } from 'react-router-dom';
import LedgerPaymentForm from './LedgerPaymentForm';
import { useAuthStore } from '../store/useAuthStore';
import Swal from 'sweetalert2';

interface MonthlySummary {
  monthKey: string;
  monthLabel: string;
  income: number;
  expense: number;
  difference: number;
  items: Ledger[];
}

export const LedgerList: React.FC = () => {
  const [openMenu, setOpenMenu] = useState<number | null>(null);
  const [selectedLedger, setSelectedLedger] = useState<Ledger | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [paymentFlow, setPaymentFlow] = useState<"" | "In" | "Out">("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const { user } = useAuthStore();
  const menuRef = useRef<HTMLDivElement | null>(null);
  // State for controlling sort direction
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');

  // Group transactions by month and perform separate calculations per group

  const {
    ledgers,
    pagination,
    isLoading,
    error,
    fetchLedgers,
    deleteLedger,
    clearError,
    active_year_total,
    page_summary
  } = useLedgerStore();
  const navigate = useNavigate();

  const formatDate = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const today = new Date();
  const start = formatDate(new Date(today.getFullYear(), today.getMonth(), 1));
  const end = formatDate(new Date(today.getFullYear(), today.getMonth() + 1, 0));
  useEffect(() => {

    // Set the state for UI display
    setStartDate(start);
    setEndDate(end);

    // Use local variables directly for the API call
    fetchLedgers({
      page: 1,
      limit: 50,
      active_year_id: user?.active_year_id,
      start_date: start,
      end_date: end,
    });
  }, [user?.active_year_id]);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpenMenu(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);





  const handleDelete = async (r_id: number) => {
    if (user) {
      if (window.confirm('Are you sure you want to delete this ledger transaction?')) {
        await deleteLedger({
          r_id,
          active_year_id: user.active_year_id,
          action_by: user.id,
        });
      }
    } else {
      Swal.fire({
        title: "Login Required",
        text: "You need to log in to access this page.",
        icon: "warning",
        confirmButtonText: "Go to Login",
        confirmButtonColor: "#2563eb",
        showCancelButton: false,
        cancelButtonText: "Cancel",
      }).then((result) => {
        if (result.isConfirmed) {
          navigate("/login");
        }
      });
    }
  };

  const handleSearch = () => {
    fetchLedgers({
      page: 1,
      limit: 50,
      active_year_id: user?.active_year_id,
      search: searchTerm || undefined,
      payment_flow: paymentFlow || undefined,
      start_date: startDate || undefined,
      end_date: endDate || undefined,
    });
  };

  const handleReset = () => {
    setSearchTerm("");
    setPaymentFlow("");

    fetchLedgers({
      page: 1,
      limit: 50,
      active_year_id: user?.active_year_id,
      start_date: start,
      end_date: end,
    });
  };

  const handlePageChange = (newPage: number) => {
    fetchLedgers({
      page: newPage,
      limit: pagination?.limit || 50,
      active_year_id: user?.active_year_id,
      search: searchTerm || undefined,
      payment_flow: paymentFlow || undefined,
      start_date: startDate || undefined,
      end_date: endDate || undefined,
    });
  };


  // Group transactions by month when multiple months are detected
  // const monthlyGroups = useMemo(() => {
  //   const groups: { [key: string]: MonthlySummary } = {};

  //   ledgers.forEach((item) => {
  //     const date = new Date(item.date);
  //     const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
  //     const monthLabel = date.toLocaleDateString("en-US", { month: "long", year: "numeric" });

  //     if (!groups[monthKey]) {
  //       groups[monthKey] = {
  //         monthKey,
  //         monthLabel,
  //         income: 0,
  //         expense: 0,
  //         difference: 0,
  //         items: [],
  //       };
  //     }

  //     const amt = Number(item.total_amount) || 0;
  //     if (item.payment_flow === "In") {
  //       groups[monthKey].income += amt;
  //     } else {
  //       groups[monthKey].expense += amt;
  //     }

  //     groups[monthKey].difference = groups[monthKey].income - groups[monthKey].expense;
  //     groups[monthKey].items.push(item);
  //   });

  //   return Object.values(groups);
  // }, [ledgers]);

  // // Flag to check if date range covers more than 1 month
  // const isMultiMonth = useMemo(() => {
  //   if (!startDate || !endDate) return false;
  //   const start = new Date(startDate);
  //   const end = new Date(endDate);
  //   return (
  //     start.getFullYear() !== end.getFullYear() ||
  //     start.getMonth() !== end.getMonth()
  //   );
  // }, [startDate, endDate]);

  const sortedMonthlyGroups = useMemo(() => {
    // 1. Sort base items by date first
    const sortedLedgers = [...ledgers].sort((a, b) => {
      const timeA = new Date(a.date).getTime();
      const timeB = new Date(b.date).getTime();
      return sortOrder === 'desc' ? timeB - timeA : timeA - timeB;
    });

    const groups: { [key: string]: MonthlySummary } = {};

    sortedLedgers.forEach((item) => {
      const date = new Date(item.date);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const monthLabel = date.toLocaleDateString("en-US", { month: "long", year: "numeric" });

      if (!groups[monthKey]) {
        groups[monthKey] = {
          monthKey,
          monthLabel,
          income: 0,
          expense: 0,
          difference: 0,
          items: [],
        };
      }

      const amt = Number(item.total_amount) || 0;
      if (item.payment_flow === "In") {
        groups[monthKey].income += amt;
      } else {
        groups[monthKey].expense += amt;
      }

      groups[monthKey].difference = groups[monthKey].income - groups[monthKey].expense;
      groups[monthKey].items.push(item);
    });

    return Object.values(groups);
  }, [ledgers, sortOrder]);
  return (
    <div className="min-h-screen bg-slate-50 p-4 transition-colors dark:bg-slate-950 sm:p-8">
      <div className="mx-auto max-w-7xl space-y-6">

        {/* Top Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 sm:text-3xl">
              Ledger Transactions
            </h1>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Track, filter, and manage your incoming and outgoing payments.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <NavLink to="/ledger/category">
              <button className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700">
                <Folder size={16} />
                Categories
              </button>
            </NavLink>

            <button
              onClick={() => setFormOpen(true)}
              className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md transition hover:bg-indigo-700 hover:shadow-indigo-500/20 active:scale-95"
            >
              <Plus size={18} />
              Add Transaction
            </button>
          </div>
        </div>

        {/* Quick Summary Cards */}
        <div className="space-y-8">
          {/* Financial Year Summary */}
          <div>
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                  Financial Year Summary
                </h2>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Income, expenses and current balance
                </p>
              </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
              {/* Income */}
              <div className="group overflow-hidden rounded-3xl border border-emerald-200 bg-linear-to-br from-emerald-500/40 via-emerald-600/40 to-green-700/40 p-6 text-emerald-900 dark:text-white shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm uppercase tracking-widest text-emerald-500">
                      Total Income
                    </p>
                    <h2 className="mt-3 text-4xl font-bold">
                      ₹{Number(active_year_total?.income || 0).toLocaleString()}
                    </h2>
                  </div>
                  <div className="rounded-2xl bg-white/20 p-4 backdrop-blur">
                    <TrendingUp size={32} />
                  </div>
                </div>
              </div>

              {/* Expense */}
              <div className="group overflow-hidden rounded-3xl border border-rose-200 bg-linear-to-br from-rose-500/40 via-red-500/40 to-red-700/40 p-6 text-rose-900 dark:text-white shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm uppercase tracking-widest text-rose-500">
                      Total Expenses
                    </p>
                    <h2 className="mt-3 text-4xl font-bold">
                      ₹{Number(active_year_total?.expense || 0).toLocaleString()}
                    </h2>
                  </div>
                  <div className="rounded-2xl bg-white/20 p-4 backdrop-blur">
                    <TrendingDown size={32} />
                  </div>
                </div>
              </div>

              {/* Balance */}
              <div className="group overflow-hidden rounded-3xl border border-indigo-200 bg-linear-to-br from-indigo-600/40 via-violet-600/40 to-purple-700/40 p-6 text-indigo-900 dark:text-white shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm uppercase tracking-widest text-indigo-500">
                      Net Balance
                    </p>
                    <h2 className="mt-3 text-4xl font-bold">
                      ₹{(
                        Number(active_year_total?.income || 0) -
                        Number(active_year_total?.expense || 0)
                      ).toLocaleString()}
                    </h2>
                  </div>
                  <div className="rounded-2xl bg-white/20 p-4 backdrop-blur">
                    <Wallet size={32} />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Page Summary */}
          <div>
            <h2 className="mb-4 text-lg font-semibold text-slate-900 dark:text-white">
              Current Page Summary
            </h2>

            <div className="grid gap-5 md:grid-cols-3">
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md dark:border-slate-700 dark:bg-slate-900">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-500">Page Income</p>
                    <h3 className="mt-2 text-3xl font-bold text-emerald-600">
                      ₹{page_summary?.income}
                    </h3>
                  </div>
                  <div className="rounded-full bg-emerald-100 p-4 text-emerald-600 dark:bg-emerald-900">
                    <TrendingUp />
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md dark:border-slate-700 dark:bg-slate-900">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-500">Page Expenses</p>
                    <h3 className="mt-2 text-3xl font-bold text-rose-600">
                      ₹{page_summary?.expense}
                    </h3>
                  </div>
                  <div className="rounded-full bg-rose-100 p-4 text-rose-600 dark:bg-rose-900">
                    <TrendingDown />
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md dark:border-slate-700 dark:bg-slate-900">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-500">Net Amount</p>
                    <h3 className="mt-2 text-3xl font-bold text-slate-800 dark:text-white">
                      ₹{(
                        Number(page_summary?.income || 0) -
                        Number(page_summary?.expense || 0)
                      ).toLocaleString()}
                    </h3>
                  </div>
                  <div className="rounded-full bg-indigo-100 p-4 text-indigo-600 dark:bg-indigo-900">
                    <Coins />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="flex items-center justify-between rounded-xl border border-rose-200 bg-rose-50/80 p-4 text-sm text-rose-700 backdrop-blur dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-300">
            <span>{error}</span>
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
            <div className="xl:col-span-4">
              <label className="mb-1.5 block text-xs font-medium text-slate-600 dark:text-slate-300">
                Search
              </label>
              <div className="relative">
                <Search
                  size={16}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500"
                />
                <input
                  type="text"
                  placeholder="Reference, note..."
                  value={searchTerm}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700/80 dark:bg-slate-800 dark:text-slate-100 dark:placeholder-slate-500 dark:focus:border-indigo-500 dark:focus:bg-slate-800 dark:focus:ring-indigo-500/30"
                />
              </div>
            </div>

            {/* Payment Flow Dropdown */}
            <div className="xl:col-span-2">
              <label className="mb-1.5 block text-xs font-medium text-slate-600 dark:text-slate-300">
                Flow
              </label>
              <select
                value={paymentFlow}
                onChange={(e) => setPaymentFlow(e.target.value as "" | "In" | "Out")}
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2.5 text-sm outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700/80 dark:bg-slate-800 dark:text-slate-100 dark:focus:border-indigo-500 dark:focus:bg-slate-800 dark:focus:ring-indigo-500/30"
              >
                <option value="" className="dark:bg-slate-800">All Flows</option>
                <option value="In" className="dark:bg-slate-800">Income</option>
                <option value="Out" className="dark:bg-slate-800">Expense</option>
              </select>
            </div>

            {/* Start Date */}
            <div className="xl:col-span-2">
              <label className="mb-1.5 block text-xs font-medium text-slate-600 dark:text-slate-300">
                From Date
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2.5 text-sm outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700/80 dark:bg-slate-800 dark:text-slate-100 dark:scheme-dark dark:focus:border-indigo-500 dark:focus:bg-slate-800 dark:focus:ring-indigo-500/30"
              />
            </div>

            {/* End Date */}
            <div className="xl:col-span-2">
              <label className="mb-1.5 block text-xs font-medium text-slate-600 dark:text-slate-300">
                To Date
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2.5 text-sm outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700/80 dark:bg-slate-800 dark:text-slate-100 dark:scheme-dark dark:focus:border-indigo-500 dark:focus:bg-slate-800 dark:focus:ring-indigo-500/30"
              />
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
            <div className="divide-y divide-slate-100 p-6 dark:divide-slate-800">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex animate-pulse items-center justify-between py-4">
                  <div className="h-4 w-28 rounded bg-slate-200 dark:bg-slate-800"></div>
                  <div className="h-4 w-20 rounded bg-slate-200 dark:bg-slate-800"></div>
                  <div className="h-4 w-16 rounded bg-slate-200 dark:bg-slate-800"></div>
                  <div className="h-4 w-24 rounded bg-slate-200 dark:bg-slate-800"></div>
                  <div className="h-4 w-8 rounded bg-slate-200 dark:bg-slate-800"></div>
                </div>
              ))}
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-slate-600 dark:text-slate-300">
                  <thead className="border-b border-slate-200/80 bg-slate-50/80 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:border-slate-800 dark:bg-slate-800/50 dark:text-slate-400">
                    <tr>
                      <th className="px-6 py-4">Reference</th>
                      <th
                        className="cursor-pointer px-6 py-4 transition hover:text-indigo-600"
                        onClick={() => setSortOrder(prev => prev === 'desc' ? 'asc' : 'desc')}
                      >
                        <div className="flex items-center gap-1">
                          Date
                          <span>{sortOrder === 'desc' ? '↓' : '↑'}</span>
                        </div>
                      </th>
                      <th className="px-6 py-4">Flow</th>
                      <th className="px-6 py-4">Amount</th>
                      <th className="px-6 py-4">Categories</th>
                      <th className="px-6 py-4">Note</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {sortedMonthlyGroups.map((group) => {
                      const isNetPositive = group.difference >= 0;

                      return (
                        <React.Fragment key={group.monthKey}>
                          {/* Monthly Breakdown Banner */}
                          <tr className="bg-slate-100/90 font-medium dark:bg-slate-800/80">
                            <td colSpan={7} className="px-6 py-3">
                              <div className="flex flex-wrap items-center justify-between gap-4 text-xs sm:text-sm">
                                <span className="text-base font-bold text-slate-900 dark:text-slate-100">
                                  {group.monthLabel}
                                </span>

                                <div className="flex items-center gap-4">
                                  {/* Monthly Income */}
                                  <span className="text-emerald-600 dark:text-emerald-400">
                                    Income: <strong className="font-semibold">₹{group.income.toLocaleString()}</strong>
                                  </span>

                                  {/* Monthly Expense */}
                                  <span className="text-rose-600 dark:text-rose-400">
                                    Expense: <strong className="font-semibold">₹{group.expense.toLocaleString()}</strong>
                                  </span>

                                  {/* Net Amount */}
                                  <span
                                    className={`inline-flex items-center rounded-md px-2.5 py-1 text-xs font-bold ${isNetPositive
                                      ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                                      : "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300"
                                      }`}
                                  >
                                    Net Amount: {isNetPositive ? "+" : "-"}₹{Math.abs(group.difference).toLocaleString()}
                                  </span>
                                </div>
                              </div>
                            </td>
                          </tr>

                          {/* Group Items */}
                          {group.items.map((item) => (
                            <tr key={item.id} className="transition hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                              <td className="px-6 py-4 font-semibold text-slate-900 dark:text-slate-100">
                                {item.reference_number}
                              </td>
                              <td className="whitespace-nowrap px-6 py-4 text-slate-500 dark:text-slate-400">
                                {new Date(item.date).toLocaleDateString("en-GB", {
                                  day: "2-digit",
                                  month: "short",
                                  year: "numeric",
                                })}
                              </td>
                              <td className="whitespace-nowrap px-6 py-4">
                                <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${item.payment_flow === "In"
                                  ? "bg-emerald-50 text-emerald-700"
                                  : "bg-rose-50 text-rose-700"
                                  }`}>
                                  {item.payment_flow === "In" ? "Income" : "Expense"}
                                </span>
                              </td>
                              <td className="whitespace-nowrap px-6 py-4 font-bold">
                                ₹{Number(item.total_amount).toLocaleString()}
                              </td>
                              <td className="px-6 py-4">
                                {item.payment_overview.map(p => p.payment_category_name).join(', ')}
                              </td>
                              <td className="px-6 py-4 text-xs">{item.note || "—"}</td>
                              <td className="px-6 py-4 text-right whitespace-nowrap">
                                <div className="relative inline-block text-left" ref={openMenu === item.id ? menuRef : null}>
                                  <button
                                    onClick={() => setOpenMenu(openMenu === item.id ? null : item.id)}
                                    className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-200"
                                  >
                                    <EllipsisVertical size={18} />
                                  </button>

                                  {openMenu === item.id && (
                                    <div className="absolute right-0 top-full z-20 mt-1 w-40 rounded-xl border border-slate-200 bg-white p-1 shadow-lg dark:border-slate-700 dark:bg-slate-800">
                                      <button
                                        onClick={() => {
                                          setSelectedLedger(item);
                                          setOpenMenu(null);
                                        }}
                                        className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-700"
                                      >
                                        <Eye size={14} className="text-indigo-500" />
                                        View Details
                                      </button>

                                      <button
                                        onClick={() => setOpenMenu(null)}
                                        className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-700"
                                      >
                                        <Pencil size={14} className="text-amber-500" />
                                        Edit
                                      </button>

                                      <button
                                        onClick={() => {
                                          handleDelete(item.id);
                                          setOpenMenu(null);
                                        }}
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
                          ))}
                        </React.Fragment>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Pagination Footer */}
              {pagination && (
                <div className="flex flex-col items-center justify-between gap-4 border-t border-slate-200/80 px-6 py-4 text-xs text-slate-500 dark:border-slate-800 dark:text-slate-400 sm:flex-row">
                  <p>
                    Showing <span className="font-semibold text-slate-700 dark:text-slate-200">{ledgers.length}</span> of{" "}
                    <span className="font-semibold text-slate-700 dark:text-slate-200">{pagination.total}</span> entries
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

              {/* Detail Modal */}
              <LedgerDetails
                ledger={selectedLedger}
                open={!!selectedLedger}
                onClose={() => setSelectedLedger(null)}
              />
            </>
          )}
        </div>

      </div>

      <LedgerPaymentForm
        open={formOpen}
        onClose={() => setFormOpen(false)}
      />
    </div>
  );
};