import React, { useEffect, useState, useRef } from "react";
import {
  EllipsisVertical,
  Pencil,
  Search,
  Trash2,
  Plus,
  RotateCcw,
  Users,
  ShieldCheck,
  Folder,
  UserCheck,
  ArrowRightLeft,
  Mail,
  Phone,
} from "lucide-react";
import { useuserStore, type User, type UserRole } from "../store/useUserStore";
import { useAuthStore } from "../store/useAuthStore";
import { UserFormModal } from "./UserFormModal";
import { useNavigate } from "react-router-dom";
import { checkPermission } from "../utils/checkPermission";

export const UserList: React.FC = () => {
  // Store Hooks
  const {
    users,
    pagination,
    isLoading,
    error,
    fetchUsers,
    deleteUser,
    moveToCurrentCommittee,
    clearError,
  } = useuserStore();

  const { user } = useAuthStore();
  const navigate = useNavigate();

  // Local State
  const [openMenu, setOpenMenu] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);

  // Initial Data Fetch
  useEffect(() => {
    fetchUsers({ page: 1, limit: 1000, active_year_id: user?.active_year_id, action_by: user?.id || 0 });
  }, []);

  // Close Dropdown Menu on Outside Click
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
    fetchUsers({
      page: 1,
      limit: 100,
      active_year_id: user?.active_year_id,
      search: searchTerm || undefined,
      action_by: user!.id || 0
    });
  };

  const handleReset = () => {
    setSearchTerm("");
    fetchUsers({
      page: 1,
      limit: 100,
      active_year_id: user?.active_year_id,
      action_by: user!.id || 0
    });
  };

  const handlePageChange = (newPage: number) => {
    fetchUsers({
      page: newPage,
      limit: pagination?.limit || 100,
      active_year_id: user?.active_year_id,
      search: searchTerm || undefined,
      action_by: user!.id || 0
    });
  };

  const handleDelete = async (r_id: number) => {
    if (!(await checkPermission(user, ["user handle", "all handle"], navigate))) return;

    if (window.confirm("Are you sure you want to delete this user?")) {
      await deleteUser({
        r_id,
        active_year_id: user!.active_year_id,
        action_by: user!.id,
      });
      setOpenMenu(null);
    }

  };

  const handleMoveToCurrentCommittee = async (targetUserId: number) => {
    if (!(await checkPermission(user, ["user handle", "all handle"], navigate))) return;
    if (window.confirm("Move this user to the current active committee?")) {
      await moveToCurrentCommittee({
        user_id: targetUserId,
        action_by: Number(user!.id),
      });
      setOpenMenu(null);
    }
  };

  const handleOpenCreate = () => {
    setEditingUser(null);
    setFormOpen(true);
  };

  const handleOpenEdit = (targetUser: User) => {
    setEditingUser(targetUser);
    setFormOpen(true);
    setOpenMenu(null);
  };

  // Badge Color Mapper for User Roles
  const renderRoleBadge = (role: UserRole) => {
 switch (role) {
  case "all handle":
    return (
      <span key={role} className="inline-flex items-center rounded-md border border-purple-200/60 bg-purple-50 px-2 py-0.5 text-xs font-semibold text-purple-700 dark:border-purple-900/50 dark:bg-purple-950/60 dark:text-purple-300">
        all handle
      </span>
    );
  case "ledger handle":
    return (
      <span key={role} className="inline-flex items-center rounded-md border border-emerald-200/60 bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-700 dark:border-emerald-900/50 dark:bg-emerald-950/60 dark:text-emerald-300">
        ledger
      </span>
    );
  case "program handle":
    return (
      <span key={role} className="inline-flex items-center rounded-md border border-blue-200/60 bg-blue-50 px-2 py-0.5 text-xs font-semibold text-blue-700 dark:border-blue-900/50 dark:bg-blue-950/60 dark:text-blue-300">
        program
      </span>
    );
  case "sahachari handle":
    return (
      <span key={role} className="inline-flex items-center rounded-md border border-teal-200/60 bg-teal-50 px-2 py-0.5 text-xs font-semibold text-teal-700 dark:border-teal-900/50 dark:bg-teal-950/60 dark:text-teal-300">
        sahachari
      </span>
    );
  case "stock handle":
    return (
      <span key={role} className="inline-flex items-center rounded-md border border-amber-200/60 bg-amber-50 px-2 py-0.5 text-xs font-semibold text-amber-700 dark:border-amber-900/50 dark:bg-amber-950/60 dark:text-amber-300">
        stock
      </span>
    );
  default:
    return (
      <span key={role} className="inline-flex items-center rounded-md border border-slate-200/60 bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-300">
        {role}
      </span>
    );
}
  };

  // Calculations
  const totalUsers = pagination?.total || users.length;
  const adminUsersCount = users.filter((u) => u.role?.includes("all handle")).length;

  return (
    <div className="min-h-screen bg-slate-50 p-4 transition-colors dark:bg-slate-950 sm:p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 sm:text-3xl">
              User Management
            </h1>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Manage system access, active committee members, and role assignments.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={handleOpenCreate}
              className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md transition hover:bg-indigo-700 hover:shadow-indigo-500/20 active:scale-95"
            >
              <Plus size={18} />
              Add User
            </button>
          </div>
        </div>

        {/* Quick Summary Cards */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="flex items-center justify-between rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Total Users
              </p>
              <p className="mt-1 text-2xl font-bold text-slate-900 dark:text-slate-100">
                {totalUsers}
              </p>
            </div>
            <div className="rounded-xl bg-indigo-50 p-3 text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-400">
              <Users size={22} />
            </div>
          </div>

          <div className="flex items-center justify-between rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Full Admins
              </p>
              <p className="mt-1 text-2xl font-bold text-purple-600 dark:text-purple-400">
                {adminUsersCount}
              </p>
            </div>
            <div className="rounded-xl bg-purple-50 p-3 text-purple-600 dark:bg-purple-950/50 dark:text-purple-400">
              <ShieldCheck size={22} />
            </div>
          </div>

          <div className="flex items-center justify-between rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Committee Year
              </p>
              <p className="mt-1 text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                ID #{user?.active_year_id || 1}
              </p>
            </div>
            <div className="rounded-xl bg-emerald-50 p-3 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400">
              <Folder size={22} />
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
            <div className="xl:col-span-10">
              <label className="mb-1.5 block text-xs font-medium text-slate-600 dark:text-slate-300">
                Search User
              </label>
              <div className="relative">
                <Search
                  size={16}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  type="text"
                  placeholder="Search by name, username, email..."
                  value={searchTerm}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:focus:border-indigo-400 dark:focus:bg-last-800"
                />
              </div>
            </div>

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
        <div className="overflow-visible rounded-2xl border border-slate-200/80 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
          {isLoading ? (
            <div className="divide-y divide-slate-100 p-6 dark:divide-slate-800">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex animate-pulse items-center justify-between py-4">
                  <div className="h-4 w-12 rounded bg-slate-200 dark:bg-slate-800"></div>
                  <div className="h-4 w-40 rounded bg-slate-200 dark:bg-slate-800"></div>
                  <div className="h-4 w-32 rounded bg-slate-200 dark:bg-slate-800"></div>
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
                      <th className="px-6 py-4">ID</th>
                      <th className="px-6 py-4">User Details</th>
                      <th className="px-6 py-4">Contact Info</th>
                      <th className="px-6 py-4">Roles</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {users.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-12 text-center text-slate-400 dark:text-slate-500">
                          <div className="flex flex-col items-center justify-center gap-2">
                            <UserCheck size={32} className="stroke-1 text-slate-300 dark:text-slate-600" />
                            <p className="font-medium">No users found.</p>
                            <p className="text-xs text-slate-400">
                              Try creating a new user account or modifying your search parameters.
                            </p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      users.map((members, i) => (
                        <tr
                          key={members.id}
                          className="transition hover:bg-slate-50/80 dark:hover:bg-slate-800/40"
                        >
                          {/* ID */}
                          <td className="px-6 py-4 text-xs font-mono font-medium text-slate-400">
                            {i + 1}
                          </td>

                          {/* User Details */}
                          <td className="px-6 py-4">
                            <div>
                              <p className="font-semibold text-slate-900 dark:text-slate-100">
                                {members.name}
                              </p>
                            </div>
                          </td>

                          {/* Contact Info */}
                          <td className="px-6 py-4 whitespace-nowrap text-xs text-slate-500 dark:text-slate-400">
                            <div className="space-y-1">
                              <div className="flex items-center gap-1.5">
                                <Mail size={13} className="text-slate-400" />
                                {members.email}
                              </div>
                              {members.phone_number && (
                                <div className="flex items-center gap-1.5 text-slate-400">
                                  <Phone size={13} />
                                  {members.phone_number}
                                </div>
                              )}
                            </div>
                          </td>

                          {/* Roles */}
                          <td className="px-6 py-4">
                            <div className="flex flex-wrap gap-1">
                              {Array.isArray(members.role)
                                ? members.role.map((r) => renderRoleBadge(r))
                                : renderRoleBadge(members.role)}
                            </div>
                          </td>

                          {/* Actions */}
                          <td className="px-6 py-4 text-right whitespace-nowrap">
                            <div
                              className="relative inline-block text-left"
                              ref={openMenu === members.id ? menuRef : null}
                            >
                              <button
                                onClick={() => setOpenMenu(openMenu === members.id ? null : members.id)}
                                className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-200"
                              >
                                <EllipsisVertical size={18} />
                              </button>

                              {openMenu === members.id && (
                                <div className="absolute right-0 top-full z-20 mt-1 w-48 rounded-xl border border-slate-200 bg-white p-1 shadow-lg dark:border-slate-700 dark:bg-slate-800">
                                  <button
                                    onClick={() => handleOpenEdit(members)}
                                    className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-700"
                                  >
                                    <Pencil size={14} className="text-amber-500" />
                                    Edit Account
                                  </button>

                                  <button
                                    onClick={() => handleMoveToCurrentCommittee(members.id)}
                                    className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-medium text-indigo-600 hover:bg-indigo-50 dark:text-indigo-400 dark:hover:bg-indigo-950/50"
                                  >
                                    <ArrowRightLeft size={14} />
                                    Move to Current
                                  </button>

                                  <button
                                    onClick={() => handleDelete(members.id)}
                                    className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-950/50"
                                  >
                                    <Trash2 size={14} />
                                    Delete User
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

              {/* Pagination Footer */}
              {pagination && (
                <div className="flex flex-col items-center justify-between gap-4 border-t border-slate-200/80 px-6 py-4 text-xs text-slate-500 dark:border-slate-800 dark:text-slate-400 sm:flex-row">
                  <p>
                    Showing{" "}
                    <span className="font-semibold text-slate-700 dark:text-slate-200">
                      {users.length}
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

      {/* Slide-over Create / Edit Modal Form */}
      <UserFormModal
        open={formOpen}
        editingUser={editingUser}
        onClose={() => setFormOpen(false)}
      />
    </div>
  );
};