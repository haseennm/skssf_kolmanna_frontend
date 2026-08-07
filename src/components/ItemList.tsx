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
import { useItemStore, type Item } from "../store/useItemStore";
import { ItemModal } from "./ItemModal";
import { useAuthStore } from "../store/useAuthStore";
import Swal from "sweetalert2";
import { checkPermission } from "../utils/checkPermission";

export const ItemList: React.FC = () => {
  const { items, isLoading, error, fetchItems, deleteItem, clearError } = useItemStore();

  const [openMenu, setOpenMenu] = useState<number | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Item | null>(null);
  const { user } = useAuthStore();


  useEffect(() => {
    fetchItems({ page: 1, limit: 10, active_year_id: user?.active_year_id });
  }, []);

  // const handleSearch = () => {
  //   fetchItems({
  //     page: 1,
  //     limit: 10,
  //     search: searchTerm || undefined,
  //     active_year_id: user?.active_year_id,
  //   });
  // };
  const navigate = useNavigate()
  useEffect(() => {
    if (!(checkPermission(user, ["stock handle", "all handle"], navigate))) return;


  }, [user, navigate]);
  const handleDelete = async (r_id: number) => {
    if (!(await checkPermission(user, ["stock handle", "all handle"], navigate))) return;
    if (window.confirm("Are you sure you want to delete this master item?")) {
      await deleteItem({
        r_id,
        active_year_id: user!.active_year_id,
        action_by: user!.id,
      });
      if (user) {
      }
      setOpenMenu(null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 transition-colors dark:bg-slate-950 sm:p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Navigation Tabs Header */}
        <div className="flex flex-col gap-4 border-b border-slate-200 pb-4 dark:border-slate-800 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 sm:text-3xl">
              Master Item Catalog
            </h1>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Define items, equipment, and reusable assets.
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
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">All Items</h2>
          <button
            onClick={() => {
              setEditingItem(null);
              setModalOpen(true);
            }}
            className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-semibold text-white shadow-md transition hover:bg-indigo-700 active:scale-95"
          >
            <Plus size={16} />
            Create Item
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
                <th className="px-6 py-4">Item Name</th>
                <th className="px-6 py-4">Notes</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {isLoading ? (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-xs text-slate-400">
                    Loading items...
                  </td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-xs text-slate-400">
                    No items found. Create your first item above.
                  </td>
                </tr>
              ) : (
                items.map((item, i) => (
                  <tr key={item.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                    <td className="px-6 py-4 text-xs font-mono text-slate-400">{i + 1}</td>
                    <td className="px-6 py-4 font-bold text-slate-900 dark:text-slate-100">
                      {item.name}
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-500 dark:text-slate-400">
                      {item.note || "—"}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="relative inline-block">
                        <button
                          onClick={() => setOpenMenu(openMenu === item.id ? null : item.id)}
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

      {user &&
        <ItemModal
          open={modalOpen}
          editingItem={editingItem}
          onClose={() => setModalOpen(false)}
          activeYearId={user?.active_year_id}
          actionBy={user?.id}
        />}
    </div>
  );
};