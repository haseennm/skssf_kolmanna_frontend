import React, { useEffect, useState, useRef } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  Boxes,
  TrendingDown,
  Package,
  Plus,
  Search,
  RotateCcw,
  AlertCircle,
  EllipsisVertical,
  Pencil,
  Trash2,
} from "lucide-react";
import { useStockStore, type Stock } from "../store/useStockStore";
import { useItemStore } from "../store/useItemStore";
import { StockModal } from "./StockModal";
import { useAuthStore } from "../store/useAuthStore";
import { checkPermission } from "../utils/checkPermission";

export const StockList: React.FC = () => {
  const { stocks, isLoading, error, fetchStocks, deleteStock, clearError } =
    useStockStore();
  const { items, fetchItems } = useItemStore();

  const [searchTerm, setSearchTerm] = useState("");
  const [openMenu, setOpenMenu] = useState<number | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingStock, setEditingStock] = useState<Stock | null>(null);
  const { user } = useAuthStore();
  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    fetchStocks({ page: 1, limit: 10, active_year_id: user?.active_year_id });
    fetchItems({ page: 1, limit: 100, active_year_id: user?.active_year_id });
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpenMenu(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const getItemName = (itemId: number) => {
    const item = items.find((i) => i.id === itemId);
    return item ? item.name : `Item #${itemId}`;
  };

  const handleSearch = () => {
    if (user) {
      fetchStocks({
        page: 1,
        limit: 10,
        search: searchTerm || undefined,
        active_year_id: user.active_year_id,
      });
    }
  };

  const handleReset = () => {
    setSearchTerm("");
    if (user) {
      fetchStocks({ page: 1, limit: 100, active_year_id: user.active_year_id });
    }
  };

  const handleDelete = async (r_id: number) => {
    if (!(await checkPermission(user, ["stock handle", "all handle"], navigate))) return;

    if (window.confirm("Are you sure you want to delete this stock entry?")) {
      await deleteStock({
        r_id,
        active_year_id: user!.active_year_id,
        action_by: user!.id,
      });
      setOpenMenu(null);
    }

  };
  const navigate = useNavigate()
  useEffect(() => {
    if (!(checkPermission(user, ["stock handle", "all handle"], navigate))) return;

  }, [user, navigate]);

  return (
    <div className="min-h-screen bg-slate-50 p-4 transition-colors dark:bg-slate-950 sm:p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Navigation Tabs Header */}
        <div className="flex flex-col gap-4 border-b border-slate-200 pb-4 dark:border-slate-800 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 sm:text-3xl">
              Inventory Management
            </h1>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Manage physical stocks, track damages/losses, and maintain item catalog.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-slate-200 bg-white p-1.5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <NavLink
              to="/stock"
              end
              className={({ isActive }) =>
                `inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold transition ${isActive
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
                }`
              }
            >
              <Boxes size={16} />
              Stocks
            </NavLink>

            <NavLink
              to="/stock/lost"
              className={({ isActive }) =>
                `inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold transition ${isActive
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
                }`
              }
            >
              <TrendingDown size={16} />
              Lost Stock
            </NavLink>

            <NavLink
              to="/stock/items"
              className={({ isActive }) =>
                `inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold transition ${isActive
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
                }`
              }
            >
              <Package size={16} />
              Items
            </NavLink>
          </div>
        </div>

        {/* Action Header */}
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">Stock Entries</h2>
          <button
            onClick={() => {
              setEditingStock(null);
              setModalOpen(true);
            }}
            className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-semibold text-white shadow-md transition hover:bg-indigo-700 active:scale-95"
          >
            <Plus size={16} />
            Add Stock Entry
          </button>
        </div>

        {/* Error Alert */}
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

        {/* Filter Bar */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative flex-1">
              <Search
                size={16}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                type="text"
                placeholder="Search stock notes or item..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2 pl-10 pr-4 text-xs outline-none transition focus:border-indigo-500 focus:bg-white dark:border-slate-700 dark:bg-slate-800 focus:dark:bg-slate-800  dark:text-slate-100"
              />
            </div>
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
                  <th className="px-6 py-4">ID</th>
                  <th className="px-6 py-4">Item Name</th>
                  <th className="px-6 py-4">Quantity</th>
                  <th className="px-6 py-4">Note</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {isLoading ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-xs text-slate-400">
                      Loading stock entries...
                    </td>
                  </tr>
                ) : stocks.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-xs text-slate-400">
                      No stock entries available.
                    </td>
                  </tr>
                ) : (
                  stocks.map((s, i) => (
                    <tr
                      key={s.id}
                      className="transition hover:bg-slate-50/80 dark:hover:bg-slate-800/40"
                    >
                      <td className="px-6 py-4 text-xs font-mono text-slate-400">{i + 1}</td>
                      <td className="px-6 py-4 font-semibold text-slate-900 dark:text-slate-100">
                        {getItemName(s.item_id)}
                      </td>
                      <td className="px-6 py-4 font-mono font-bold text-indigo-600 dark:text-indigo-400">
                        {s.quantity}
                      </td>
                      <td className="px-6 py-4 text-xs text-slate-500 dark:text-slate-400">
                        {s.note || "—"}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div
                          className="relative inline-block"
                          ref={openMenu === s.id ? menuRef : null}
                        >
                          <button
                            onClick={() => setOpenMenu(openMenu === s.id ? null : s.id)}
                            className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                          >
                            <EllipsisVertical size={16} />
                          </button>
                          {openMenu === s.id && (
                            <div className="absolute right-0 z-20 mt-1 w-32 rounded-xl border border-slate-200 bg-white p-1 shadow-lg dark:border-slate-700 dark:bg-slate-800">
                              <button
                                onClick={() => {
                                  setEditingStock(s);
                                  setModalOpen(true);
                                  setOpenMenu(null);
                                }}
                                className="flex w-full items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-700"
                              >
                                <Pencil size={13} className="text-amber-500" /> Edit
                              </button>
                              <button
                                onClick={() => handleDelete(s.id)}
                                className="flex w-full items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-medium text-rose-600 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-950/50"
                              >
                                <Trash2 size={13} /> Delete
                              </button>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {user &&
        <StockModal
          open={modalOpen}
          editingStock={editingStock}
          onClose={() => setModalOpen(false)}
          activeYearId={user.active_year_id}
          actionBy={user.id}
        />
      }
    </div>
  );
};