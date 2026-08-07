import { useEffect, useState } from "react";
import {
    EllipsisVertical,
    Pencil,
    Plus,
    Search,
    Trash2,
} from "lucide-react";

import { useLedgerCategory } from "../store/useLedgerCategory";
import type { LedgerCategory } from "../store/useLedgerCategory";
import { LedgerPaymentCategoryForm } from "./LedgerPaymentCategoryForm";
import { useAuthStore } from "../store/useAuthStore";
import { useNavigate } from "react-router-dom";
import { checkPermission } from "../utils/checkPermission";

export default function PaymentCategoryList() {
    const {
        categories,
        pagination,
        fetchCategories,
        deleteCategory,
        isLoading,
    } = useLedgerCategory();

    const [search, setSearch] = useState("");
    const [selectedCategory, setSelectedCategory] = useState<LedgerCategory | null>(null);
    const [formOpen, setFormOpen] = useState(false);
    const [openMenu, setOpenMenu] = useState<number | string | null>(null);
    const { user } = useAuthStore();

    useEffect(() => {
        fetchCategories({
            page: 1,
            limit: 10,
        });
    }, []);

    const handleSearch = () => {
        fetchCategories({
            page: 1,
            limit: 10,
            search,
        });
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") {
            handleSearch();
        }
    };

    const handleDelete = async (id: number | string) => {
        if (!(await checkPermission(user, ["ledger handle", "all handle"], navigate))) return;

        const ok = window.confirm("Delete this payment category?");
        if (!ok) return;
            await deleteCategory({
                r_id: id,
                action_by: Number(user!.id),
                active_year_id: user!.active_year_id,
            });

            setOpenMenu(null);
        
    }
    const navigate = useNavigate()
    useEffect(() => {
        if (!(checkPermission(user, ["ledger handle", "all handle"], navigate))) return;

    }, [user, navigate]);
    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
                        Payment Categories
                    </h1>
                    <p className="mt-1 text-slate-500 dark:text-slate-400">
                        Manage ledger payment categories.
                    </p>
                </div>

                <button
                    onClick={() => {
                        setSelectedCategory(null);
                        setFormOpen(true);
                    }}
                    className="inline-flex items-center gap-2 rounded-xl bg-primary-600 px-5 py-3 font-semibold text-white shadow-lg transition hover:bg-primary-700"
                >
                    <Plus size={18} />
                    New Category
                </button>
            </div>

            {/* Search Bar */}
            <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900">
                <div className="flex flex-col gap-4 md:flex-row">
                    <div className="relative flex-1">
                        <Search
                            size={18}
                            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                        />
                        <input
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="Search category..."
                            className="w-full rounded-xl border border-slate-300 bg-white py-3 pl-11 pr-4 outline-none transition focus:border-primary-500 focus:ring-4 focus:ring-primary-100 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:placeholder:text-slate-500"
                        />
                    </div>

                    <button
                        onClick={handleSearch}
                        className="rounded-xl bg-primary-600 px-6 py-3 font-semibold text-white transition hover:bg-primary-700"
                    >
                        Search
                    </button>
                </div>
            </div>

            {/* Table Container */}
            <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-lg dark:border-slate-700 dark:bg-slate-900">
                {isLoading ? (
                    <div className="flex h-64 items-center justify-center">
                        <div className="text-slate-500">Loading categories...</div>
                    </div>
                ) : (
                    <>
                        <div className="overflow-x-auto">
                            <table className="min-w-full">
                                <thead className="sticky top-0 border-b border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-800">
                                    <tr className="text-left text-sm font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-200">
                                        <th className="px-6 py-4">Category</th>
                                        <th className="px-6 py-4">Note</th>
                                        <th className="px-6 py-4">Created</th>
                                        <th className="px-6 py-4 text-center">Actions</th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {categories.length === 0 ? (
                                        <tr>
                                            <td colSpan={4} className="py-20 text-center">
                                                <div className="flex flex-col items-center">
                                                    <div className="mb-4 rounded-full bg-slate-100 p-5 dark:bg-slate-800">
                                                        <Search size={32} className="text-slate-400" />
                                                    </div>
                                                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                                                        No Categories Found
                                                    </h3>
                                                    <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                                                        Create a payment category to get started.
                                                    </p>
                                                </div>
                                            </td>
                                        </tr>
                                    ) : (
                                        categories.map((category) => (
                                            <tr
                                                key={category.id}
                                                className="border-b border-slate-100 transition-all odd:bg-white even:bg-slate-50/40 hover:bg-primary-50 dark:border-slate-800 dark:odd:bg-slate-900 dark:even:bg-slate-800/40 dark:hover:bg-slate-800"
                                            >
                                                {/* Category */}
                                                <td className="px-6 py-5">
                                                    <div>
                                                        <h3 className="font-semibold text-primary-600">
                                                            {category.name}
                                                        </h3>
                                                    </div>
                                                </td>

                                                {/* Note */}
                                                <td className="max-w-sm px-6 py-5">
                                                    <p className="truncate text-slate-600 dark:text-slate-300">
                                                        {category.note || "-"}
                                                    </p>
                                                </td>

                                                {/* Created */}
                                                <td className="px-6 py-5">
                                                    {category.created_at ? (
                                                        <div>
                                                            <p className="text-slate-800 dark:text-slate-100">
                                                                {new Date(category.created_at).toLocaleDateString(
                                                                    "en-GB",
                                                                    {
                                                                        day: "2-digit",
                                                                        month: "short",
                                                                        year: "numeric",
                                                                    }
                                                                )}
                                                            </p>
                                                        </div>
                                                    ) : (
                                                        "-"
                                                    )}
                                                </td>

                                                {/* Actions */}
                                                <td className="relative px-6 py-5">
                                                    <div className="flex justify-center">
                                                        <button
                                                            onClick={() =>
                                                                setOpenMenu(
                                                                    openMenu === category.id ? null : category.id
                                                                )
                                                            }
                                                            className="rounded-xl p-2 transition hover:bg-primary-100 dark:hover:bg-slate-700"
                                                        >
                                                            <EllipsisVertical size={18} />
                                                        </button>

                                                        {openMenu === category.id && (
                                                            <div className="absolute right-6 top-12 z-50 w-48 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl dark:border-slate-700 dark:bg-slate-900">
                                                                <button
                                                                    onClick={() => {
                                                                        setSelectedCategory(category);
                                                                        setFormOpen(true);
                                                                        setOpenMenu(null);
                                                                    }}
                                                                    className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm transition hover:bg-slate-50 dark:hover:bg-slate-800"
                                                                >
                                                                    <Pencil size={16} className="text-amber-600" />
                                                                    Edit
                                                                </button>

                                                                <button
                                                                    onClick={() => handleDelete(category.id)}
                                                                    className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm text-red-600 transition hover:bg-red-50 dark:hover:bg-red-900/20"
                                                                >
                                                                    <Trash2 size={16} />
                                                                    Delete
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

                        {/* Pagination Controls */}
                        <div className="flex flex-col items-center justify-between gap-4 border-t border-slate-200 bg-slate-50 px-6 py-4 dark:border-slate-700 dark:bg-slate-800 md:flex-row">
                            <p className="text-sm text-slate-600 dark:text-slate-300">
                                Showing{" "}
                                <span className="font-semibold">{categories.length}</span> of{" "}
                                <span className="font-semibold">
                                    {pagination?.total ?? 0}
                                </span>{" "}
                                categories
                            </p>

                            <div className="flex items-center gap-2">
                                <button
                                    disabled={pagination?.page === 1}
                                    onClick={() =>
                                        fetchCategories({
                                            page: (pagination?.page ?? 1) - 1,
                                            limit: pagination?.limit ?? 10,
                                            search,
                                        })
                                    }
                                    className="rounded-xl border border-slate-300 px-4 py-2 transition hover:bg-white disabled:opacity-40 dark:border-slate-600 dark:hover:bg-slate-700"
                                >
                                    Previous
                                </button>

                                <span className="rounded-xl bg-primary-600 px-4 py-2 text-white">
                                    {pagination?.page ?? 1}
                                </span>

                                <button
                                    disabled={
                                        pagination?.page === pagination?.totalPages
                                    }
                                    onClick={() =>
                                        fetchCategories({
                                            page: (pagination?.page ?? 1) + 1,
                                            limit: pagination?.limit ?? 10,
                                            search,
                                        })
                                    }
                                    className="rounded-xl border border-slate-300 px-4 py-2 transition hover:bg-white disabled:opacity-40 dark:border-slate-600 dark:hover:bg-slate-700"
                                >
                                    Next
                                </button>
                            </div>
                        </div>
                    </>
                )}
            </div>

            {/* Category Modal / Form */}
            <LedgerPaymentCategoryForm
                open={formOpen}
                category={selectedCategory}
                onClose={() => {
                    setFormOpen(false);
                    setSelectedCategory(null);
                    fetchCategories({
                        page: pagination?.page ?? 1,
                        limit: pagination?.limit ?? 10,
                        search,
                    });
                }}
            />
        </div>
    );
}