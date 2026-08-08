import React, { useEffect, useState } from "react";
import { useuserStore } from "../store/useUserStore";
import { useAuthStore } from "../store/useAuthStore";
import {
  User as UserIcon,
  Mail,
  Lock,
  Save,
  AtSign,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  ShieldAlert,
  LogIn,
} from "lucide-react";
import Swal from "sweetalert2";

export const EditUserProfile: React.FC = () => {
  const { user } = useAuthStore();
  const { editUser, isLoading, error } = useuserStore();

  // Form States
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Synchronize initial data from current logged-in user
  useEffect(() => {
    if (user) {
      setName(user.name || "");
      setUsername(user.username || "");
      setEmail(user.email || "");
      setPassword("");
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setSuccessMsg(null);

    // Guard check to ensure user context is loaded
    if (!user) {
      setFormError("User session not found.");
      return;
    }

    // Client-side validations
    if (!name.trim()) return setFormError("Full Name is required.");
    if (!username.trim()) return setFormError("Username is required.");
    if (!email.trim()) return setFormError("Email address is required.");

    if (password.trim() && password.trim().length < 6) {
      return setFormError("Password must be at least 6 characters long.");
    }

    // Confirmation
    const result = await Swal.fire({
      title: "Update account details?",
      text: "Are you sure you want to save these changes?",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Yes, update",
      cancelButtonText: "Cancel",
      reverseButtons: true,
      focusCancel: true,
    });

    if (!result.isConfirmed) {
      return;
    }

    const success = await editUser({
      id: user.id,
      name: name.trim(),
      username: username.trim(),
      email: email.trim(),
      active_year_id: user.active_year_id,
      action_by: user.id,
      self_edit: true,
      ...(password.trim() ? { password: password.trim() } : {}),
    });

    if (success) {
      setSuccessMsg("Account details updated successfully.");
      setPassword("");

      await Swal.fire({
        title: "Updated!",
        text: "Your account details have been updated successfully.",
        icon: "success",
        confirmButtonText: "OK",
      });
    }
  };

return (
  <div className="min-h-screen w-full bg-slate-50/60 p-4 transition-colors dark:bg-slate-950 sm:p-6 lg:p-10">
    {user ? (
      <div className="mx-auto max-w-3xl space-y-6">
        
        {/* Profile Header Card */}
        <div className="relative overflow-hidden rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-8">
          {/* Subtle Ambient Background Accent */}
          <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-indigo-500/10 blur-3xl dark:bg-indigo-500/20" />

          <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              {/* Avatar with Status Indicator */}
              <div className="relative shrink-0">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-linear-to-tr from-indigo-600 to-indigo-500 text-xl font-bold text-white shadow-lg shadow-indigo-500/25 ring-4 ring-white dark:ring-slate-900">
                  {name ? name.charAt(0).toUpperCase() : "U"}
                </div>
                <span className="absolute -bottom-1 -right-1 h-4 w-4 rounded-full border-2 border-white bg-emerald-500 dark:border-slate-900" />
              </div>

              <div>
                <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100 sm:text-2xl">
                  {name || "Account Settings"}
                </h1>
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                  {user?.email || "Manage your profile details and security"}
                </p>
              </div>
            </div>

            {/* Read-Only Roles Badges */}
            {user?.role && user.role.length > 0 && (
              <div className="flex flex-wrap items-center gap-1.5 sm:justify-end">
                {user.role.map((r) => (
                  <span
                    key={r}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-indigo-100 bg-indigo-50/60 px-3 py-1.5 text-xs font-semibold capitalize text-indigo-700 dark:border-indigo-900/40 dark:bg-indigo-950/40 dark:text-indigo-300"
                  >
                    <ShieldCheck size={14} className="text-indigo-600 dark:text-indigo-400" />
                    {r}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Main Settings Form */}
        <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-8">
          <form onSubmit={handleSubmit} className="space-y-6">

            {/* Notifications */}
            {formError && (
              <div className="flex items-center gap-3 rounded-2xl border border-rose-200 bg-rose-50/80 p-4 text-xs font-medium text-rose-700 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-300">
                <AlertCircle size={18} className="shrink-0 text-rose-500" />
                <span className="leading-relaxed">{formError}</span>
              </div>
            )}

            {error && (
              <div className="flex items-center gap-3 rounded-2xl border border-rose-200 bg-rose-50/80 p-4 text-xs font-medium text-rose-700 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-300">
                <AlertCircle size={18} className="shrink-0 text-rose-500" />
                <span className="leading-relaxed">{error}</span>
              </div>
            )}

            {successMsg && (
              <div className="flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50/80 p-4 text-xs font-medium text-emerald-700 dark:border-emerald-900/50 dark:bg-emerald-950/40 dark:text-emerald-300">
                <CheckCircle2 size={18} className="shrink-0 text-emerald-500" />
                <span className="leading-relaxed">{successMsg}</span>
              </div>
            )}

            {/* SECTION: Personal Info */}
            <div className="space-y-4">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                Personal Details
              </h2>

              {/* Full Name */}
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-slate-700 dark:text-slate-200">
                  Full Name <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <UserIcon size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 transition-colors group-focus-within:text-indigo-500" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. John Doe"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 pl-10 pr-4 text-sm text-slate-900 outline-none transition duration-200 focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 dark:border-slate-800 dark:bg-slate-900/50 dark:text-slate-100 dark:focus:border-indigo-500 dark:focus:bg-slate-900"
                  />
                </div>
              </div>

              {/* Username & Email Grid */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-slate-700 dark:text-slate-200">
                    Username <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <AtSign size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      required
                      placeholder="johndoe"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 pl-10 pr-4 text-sm text-slate-900 outline-none transition duration-200 focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 dark:border-slate-800 dark:bg-slate-900/50 dark:text-slate-100 dark:focus:border-indigo-500 dark:focus:bg-slate-900"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-slate-700 dark:text-slate-200">
                    Email Address <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="email"
                      required
                      placeholder="john@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 pl-10 pr-4 text-sm text-slate-900 outline-none transition duration-200 focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 dark:border-slate-800 dark:bg-slate-900/50 dark:text-slate-100 dark:focus:border-indigo-500 dark:focus:bg-slate-900"
                    />
                  </div>
                </div>
              </div>
            </div>

            <hr className="border-slate-100 dark:border-slate-800" />

            {/* SECTION: Security */}
            <div className="space-y-4">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                Security
              </h2>

              <div>
                <div className="mb-1.5 flex items-center justify-between">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-200">
                    New Password
                  </label>
                  <span className="text-[11px] text-slate-400">
                    Leave blank to keep current
                  </span>
                </div>
                <div className="relative">
                  <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 pl-10 pr-4 text-sm text-slate-900 outline-none transition duration-200 focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 dark:border-slate-800 dark:bg-slate-900/50 dark:text-slate-100 dark:focus:border-indigo-500 dark:focus:bg-slate-900"
                  />
                </div>
              </div>
            </div>

            {/* Actions Bar */}
            <div className="flex items-center justify-end gap-3 pt-4">
              <button
                type="submit"
                disabled={isLoading}
                className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-2.5 text-xs font-semibold text-white shadow-lg shadow-indigo-600/20 transition hover:bg-indigo-500 hover:shadow-indigo-600/30 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Save size={16} />
                {isLoading ? "Saving changes..." : "Save Changes"}
              </button>
            </div>
          </form>
        </div>
      </div>
    ) : (
      /* Unauthenticated Empty State */
      <div className="flex min-h-[70vh] items-center justify-center">
        <div className="w-full max-w-sm rounded-3xl border border-slate-200/80 bg-white p-8 text-center shadow-lg dark:border-slate-800 dark:bg-slate-900">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-400">
            <ShieldAlert size={28} />
          </div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
            Authentication Required
          </h2>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            You must be logged in to access and edit your account settings.
          </p>
          <a
            href="/login"
            className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 py-2.5 text-xs font-semibold text-white shadow-md shadow-indigo-600/20 transition hover:bg-indigo-500 active:scale-95"
          >
            <LogIn size={16} />
            Go to Login
          </a>
        </div>
      </div>
    )}
  </div>
);
};