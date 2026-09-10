import React, { useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
    Boxes,
    TrendingDown,
    Package,
    Plus,
    AlertCircle,
    EllipsisVertical,
    Pencil,
    Trash2,
} from "lucide-react";
import { useLostStockStore, type LostStock } from "../store/useLostStockStore";
import { useStockStore } from "../store/useStockStore";
import { LostStockModal } from "./LostStockModal";
import { useAuthStore } from "../store/useAuthStore";
import { checkPermission } from "../utils/checkPermission";

export const LostStockList: React.FC = () => {
    const { lostStocks, isLoading, error, fetchLostStocks, deleteLostStock, clearError } =
        useLostStockStore();
    const { fetchStocks } = useStockStore();

    // const [searchTerm, setSearchTerm] = useState("");
    const [openMenu, setOpenMenu] = useState<number | null>(null);
    const [modalOpen, setModalOpen] = useState(false);
    const [editingLostStock, setEditingLostStock] = useState<LostStock | null>(null);
    const { user } = useAuthStore()

    useEffect(() => {
        fetchLostStocks({ page: 1, limit: 50, active_year_id: user?.active_year_id });
        fetchStocks({ page: 1, limit: 100, active_year_id: user?.active_year_id });
    }, []);

    // const handleSearch = () => {
    //     fetchLostStocks({
    //         page: 1,
    //         limit: 10,
    //         search: searchTerm || undefined,
    //         active_year_id: user?.active_year_id,
    //     });
    // };

    const handleDelete = async (r_id: number) => {
         if (!(await checkPermission(user, ["stock handle","all handle"], navigate))) return;
     
            if (window.confirm("Are you sure you want to delete this lost stock entry?")) {

                await deleteLostStock({
                    r_id,
                    active_year_id: user!.active_year_id,
                    action_by: user!.id,
                });
                setOpenMenu(null);
            }
    };
    const navigate = useNavigate()
    useEffect(() => {
           if (!(checkPermission(user, ["stock handle","all handle"], navigate))) return;
    }, [user, navigate]);
    return (
        <div className="min-h-screen bg-slate-50 p-4 transition-colors dark:bg-slate-950 sm:p-8">
            <div className="mx-auto max-w-7xl space-y-6">
                {/* Navigation Tabs Header */}
                <div className="flex flex-col gap-4 border-b border-slate-200 pb-4 dark:border-slate-800 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 sm:text-3xl">
                            Lost & Damaged Inventory
                        </h1>
                        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                            Track damages, shortages, and lost equipment entries.
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
                    <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">Lost Stock Logs</h2>
                    <button
                        onClick={() => {
                            setEditingLostStock(null);
                            setModalOpen(true);
                        }}
                        className="inline-flex items-center gap-2 rounded-xl bg-rose-600 px-4 py-2.5 text-xs font-semibold text-white shadow-md transition hover:bg-rose-700 active:scale-95"
                    >
                        <Plus size={16} />
                        Report Lost Stock
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

                {/* Table View */}
                <div className="overflow-visible rounded-2xl border border-slate-200/80 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
                    <table className="w-full text-left text-sm text-slate-600 dark:text-slate-300">
                        <thead className="border-b border-slate-200 bg-slate-50/80 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:border-slate-800 dark:bg-slate-800/50 dark:text-slate-400">
                            <tr>
                                <th className="px-6 py-4">ID</th>
                                <th className="px-6 py-4">Stock ID</th>
                                <th className="px-6 py-4">Quantity Lost</th>
                                <th className="px-6 py-4">Reason</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                            {isLoading ? (
                                <tr>
                                    <td colSpan={5} className="py-8 text-center text-xs text-slate-400">
                                        Loading records...
                                    </td>
                                </tr>
                            ) : lostStocks.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="py-8 text-center text-xs text-slate-400">
                                        No lost stock reported yet.
                                    </td>
                                </tr>
                            ) : (
                                lostStocks && lostStocks.map((ls) => (
                                    <tr key={ls.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                                        <td className="px-6 py-4 text-xs font-mono text-slate-400">#{ls.id}</td>
                                        <td className="px-6 py-4 font-semibold text-slate-900 dark:text-slate-100">
                                            Stock #{ls.stock_id}
                                        </td>
                                        <td className="px-6 py-4 font-mono font-bold text-rose-600 dark:text-rose-400">
                                            {ls.quantity}
                                        </td>
                                        <td className="px-6 py-4 text-xs text-slate-500 dark:text-slate-400">
                                            {ls.reason || "No reason given"}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="relative inline-block">
                                                <button
                                                    onClick={() => setOpenMenu(openMenu === ls.id ? null : ls.id)}
                                                    className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                                                >
                                                    <EllipsisVertical size={16} />
                                                </button>
                                                {openMenu === ls.id && (
                                                    <div className="absolute right-0 z-20 mt-1 w-32 rounded-xl border border-slate-200 bg-white p-1 shadow-lg dark:border-slate-700 dark:bg-slate-800">
                                                        <button
                                                            onClick={() => {
                                                                setEditingLostStock(ls);
                                                                setModalOpen(true);
                                                                setOpenMenu(null);
                                                            }}
                                                            className="flex w-full items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-700"
                                                        >
                                                            <Pencil size={13} className="text-amber-500" /> Edit
                                                        </button>
                                                        <button
                                                            onClick={() => handleDelete(ls.id)}
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

            {user &&
                <LostStockModal
                    open={modalOpen}
                    editingLostStock={editingLostStock}
                    onClose={() => setModalOpen(false)}
                    activeYearId={user?.active_year_id}
                    actionBy={user?.id}
                />
            }
        </div>
    );
};