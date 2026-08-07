import React, { useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
    Boxes,
    Package,
    Plus,
    AlertCircle,
    EllipsisVertical,
    Pencil,
    Trash2,
    Users,
} from "lucide-react";
import { useSahachariItems, type SahachariItem } from "../store/useSahachariItems";
import { useAuthStore } from "../store/useAuthStore";
import { checkPermission } from "../utils/checkPermission";
import { SahachariItemModal } from "./SahachariItemModal";

export const SahachariItemList: React.FC = () => {
    const { items, isLoading, error, fetchItems, deleteItem, clearError } =
        useSahachariItems();

    const [openMenu, setOpenMenu] = useState<number | null>(null);
    const [modalOpen, setModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<SahachariItem | null>(null);
    const { user } = useAuthStore();
    const navigate = useNavigate();

    useEffect(() => {
        if (!checkPermission(user, ["sahachari handle", "all handle"], navigate)) return;
        fetchItems({ page: 1, limit: 10 });
    }, [user, navigate]);

    const handleDelete = async (r_id: number) => {
        if (!(await checkPermission(user, ["sahachari handle", "all handle"], navigate))) return;
        if (window.confirm("Are you sure you want to delete this Sahachari item?")) {
            await deleteItem({
                r_id,
                action_by: user!.id,
            });
            setOpenMenu(null);
        }
    };
    const statusStyles: Record<string, string> = {
        Available: "bg-emerald-50 text-emerald-700 border-emerald-200/80 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-900/50",
        Issued: "bg-amber-50 text-amber-700 border-amber-200/80 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-900/50",
        Returned: "bg-blue-50 text-blue-700 border-blue-200/80 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-900/50",
    };
    return (
        <div className="min-h-screen bg-slate-50 p-4 transition-colors dark:bg-slate-950 sm:p-8">
            <div className="mx-auto max-w-7xl space-y-6">
                {/* Navigation Tabs Header */}
                <div className="flex flex-col gap-4 border-b border-slate-200 pb-4 dark:border-slate-800 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 sm:text-3xl">
                            Sahachari Catalog
                        </h1>
                        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                            Manage Sahachari items, registration codes, and standard assets.
                        </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-slate-200 bg-white p-1.5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                        <NavLink
                            to="/sahachari"
                            end
                            className={({ isActive }) =>
                                `inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold transition ${isActive
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
                                `inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold transition ${isActive
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
                                `inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold transition ${isActive
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
                        Sahachari Item List
                    </h2>
                    <button
                        onClick={() => {
                            setEditingItem(null);
                            setModalOpen(true);
                        }}
                        className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-semibold text-white shadow-md transition hover:bg-indigo-700 active:scale-95"
                    >
                        <Plus size={16} />
                        Add Item
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
                                <th className="px-6 py-4">#</th>
                                <th className="px-6 py-4">Item Code</th>
                                <th className="px-6 py-4">Item Name</th>
                                <th className="px-6 py-4">Amount</th>
                                <th className="px-6 py-4">Description</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                            {isLoading ? (
                                <tr>
                                    <td colSpan={6} className="py-8 text-center text-xs text-slate-400">
                                        Loading items...
                                    </td>
                                </tr>
                            ) : items.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="py-8 text-center text-xs text-slate-400">
                                        No items found. Create your first Sahachari item above.
                                    </td>
                                </tr>
                            ) : (
                                items.map((item, i) => (
                                    <tr
                                        key={item.id}
                                        className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40"
                                    >
                                        <td className="px-6 py-4 text-xs font-mono text-slate-400">{i + 1}</td>
                                        <td className="px-6 py-4 font-mono font-medium text-indigo-600 dark:text-indigo-400">
                                            {item.item_code}
                                        </td>
                                        <td className="px-6 py-4 font-bold text-slate-900 dark:text-slate-100">
                                            {item.name}
                                        </td>
                                        <td className="px-6 py-4 text-xs font-semibold text-slate-700 dark:text-slate-300">
                                            {item.amount !== null ? `₹${item.amount}` : "—"}
                                        </td>
                                        <td className="px-6 py-4 text-xs text-slate-500 dark:text-slate-400">
                                            {item.description || "—"}
                                        </td>
                                        <td className="px-6 py-4 text-xs whitespace-nowrap">
                                            <span
                                                className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-semibold tracking-wide ${statusStyles[item.status] ||
                                                    "bg-slate-50 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700"
                                                    }`}
                                            >
                                                {item.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="relative inline-block">
                                                <button
                                                    onClick={() =>
                                                        setOpenMenu(openMenu === item.id ? null : item.id)
                                                    }
                                                    className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                                                >
                                                    <EllipsisVertical size={16} />
                                                </button>
                                                {openMenu === item.id && (
                                                    <div className="absolute right-0 z-20 mt-1 w-32 rounded-xl border border-slate-200 bg-white p-1 shadow-lg dark:border-slate-700 dark:bg-slate-800">
                                                        <button
                                                            onClick={() => {
                                                                setEditingItem(item);
                                                                setModalOpen(true);
                                                                setOpenMenu(null);
                                                            }}
                                                            className="flex w-full items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-700"
                                                        >
                                                            <Pencil size={13} className="text-amber-500" /> Edit
                                                        </button>
                                                        <button
                                                            onClick={() => handleDelete(item.id)}
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

            {user && (
                <SahachariItemModal
                    open={modalOpen}
                    editingItem={editingItem}
                    onClose={() => setModalOpen(false)}
                    actionBy={user.id}
                />
            )}
        </div>
    );
};