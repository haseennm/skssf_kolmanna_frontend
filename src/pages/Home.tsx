import { Link } from "react-router-dom";
import {
  Boxes,
  BookOpen,
  Calendar,
  Package,
  Users,
  ArrowUpRight,
  Clock,
  LogIn,
  ShieldAlert,
} from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";

export default function Home() {
  const { user } = useAuthStore();

  const renderRoleBadge = (role: string) => {
    switch (role) {
      case "all handle":
        return (
          <span
            key={role}
            className="inline-flex items-center rounded-md border border-purple-200/60 bg-purple-50 px-2 py-0.5 text-xs font-semibold text-purple-700 dark:border-purple-900/50 dark:bg-purple-950/60 dark:text-purple-300"
          >
            all handle
          </span>
        );
      case "ledger handle":
        return (
          <span
            key={role}
            className="inline-flex items-center rounded-md border border-emerald-200/60 bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-700 dark:border-emerald-900/50 dark:bg-emerald-950/60 dark:text-emerald-300"
          >
            ledger
          </span>
        );
      case "program handle":
        return (
          <span
            key={role}
            className="inline-flex items-center rounded-md border border-blue-200/60 bg-blue-50 px-2 py-0.5 text-xs font-semibold text-blue-700 dark:border-blue-900/50 dark:bg-blue-950/60 dark:text-blue-300"
          >
            program
          </span>
        );
      case "sahachari handle":
        return (
          <span
            key={role}
            className="inline-flex items-center rounded-md border border-teal-200/60 bg-teal-50 px-2 py-0.5 text-xs font-semibold text-teal-700 dark:border-teal-900/50 dark:bg-teal-950/60 dark:text-teal-300"
          >
            sahachari
          </span>
        );
      case "stock handle":
        return (
          <span
            key={role}
            className="inline-flex items-center rounded-md border border-amber-200/60 bg-amber-50 px-2 py-0.5 text-xs font-semibold text-amber-700 dark:border-amber-900/50 dark:bg-amber-950/60 dark:text-amber-300"
          >
            stock
          </span>
        );
      default:
        return (
          <span
            key={role}
            className="inline-flex items-center rounded-md border border-slate-200/60 bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-300"
          >
            {role}
          </span>
        );
    }
  };

  const currentDate = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  // Modules definition for quick navigation
  const modules = [
    {
      title: "Sahachari Welfare",
      description: "Manage issued items, equipment logs, and beneficiary records.",
      icon: Boxes,
      path: "/sahachari",
      color: "from-teal-500 to-emerald-600",
      badgeColor: "bg-teal-500/10 text-teal-600 dark:text-teal-400",
      requiredRoles: ["sahachari handle", "all handle"],
    },
    {
      title: "Ledgers & Finance",
      description: "Track capital accounts, unit income, expenses, and transaction history.",
      icon: BookOpen,
      path: "/ledger",
      color: "from-emerald-500 to-green-600",
      badgeColor: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
      requiredRoles: ["ledger handle", "all handle"],
    },
    {
      title: "Programs & Events",
      description: "Schedule unit meetings, organize events, and log delegate activity.",
      icon: Calendar,
      path: "/programs",
      color: "from-blue-500 to-indigo-600",
      badgeColor: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
      requiredRoles: ["program handle", "all handle"],
    },
    {
      title: "Stock & Inventory",
      description: "Monitor unit assets, supplies, and item availability in real-time.",
      icon: Package,
      path: "/stock",
      color: "from-amber-500 to-orange-600",
      badgeColor: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
      requiredRoles: ["stock handle", "all handle"],
    },
    {
      title: "User Directory",
      description: "Manage registered members, committee access, and system roles.",
      icon: Users,
      path: "/sahachari/users",
      color: "from-purple-500 to-violet-600",
      badgeColor: "bg-purple-500/10 text-purple-600 dark:text-purple-400",
      requiredRoles: ["sahachari handle", "all handle"],
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 p-4 transition-colors dark:bg-slate-950 sm:p-8">
      <div className="mx-auto max-w-7xl space-y-8">
        {/* Welcome Header */}
        <div className="relative overflow-hidden rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-8">
          <div className="absolute -right-12 -top-12 h-40 w-40 rounded-full bg-indigo-500/10 blur-3xl dark:bg-indigo-500/20" />
          <div className="relative z-10 flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs font-semibold tracking-wide text-indigo-600 dark:text-indigo-400 uppercase">
                <Clock size={14} />
                {currentDate}
              </div>
              {user ?
                <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100 sm:text-3xl">
                  Welcome back, {user?.name} 👋
                </h1>
                : <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100 sm:text-3xl">
                  Welcome! Sign in to get started 👋
                </h1>}
              <p className="text-sm text-slate-500 dark:text-slate-400">
                SKSSF Kolmanna Unit Management Dashboard
              </p>
            </div>

            <div className="flex flex-col gap-2 rounded-2xl border border-slate-100 bg-slate-50/80 p-4 dark:border-slate-800 dark:bg-slate-800/50 sm:items-end">
              <span className="text-xs font-medium text-slate-400">Assigned Handles</span>
              <div className="flex flex-wrap gap-1.5">
                {user ? (
                  <>
                    {/* <span className="text-xs font-medium text-slate-400 dark:text-slate-500">
        Assigned Handles
      </span> */}
                    <div className="flex flex-wrap gap-1.5 sm:justify-end">
                      {user.role && user.role.length > 0 ? (
                        user.role.map((role) => renderRoleBadge(role))
                      ) : (
                        <span className="text-xs font-medium text-slate-400">No active handle</span>
                      )}
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col items-start gap-2.5 sm:items-end">
                    {/* Session Status Tag */}
                    <div className="inline-flex items-center gap-1.5 rounded-md bg-amber-500/10 px-2 py-0.5 text-xs font-semibold text-amber-600 dark:text-amber-400">
                      <ShieldAlert size={13} />
                      <span>Guest Visitor</span>
                    </div>

                    {/* Explanatory Text */}
                    <p className="text-xs text-slate-500 dark:text-slate-400 sm:text-right">
                      Sign in to unlock unit handles & manage records.
                    </p>

                    {/* Redirect Button */}
                    <Link
                      to="/login"
                      className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-3.5 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-indigo-500 active:scale-95"
                    >
                      <LogIn size={14} />
                      <span>Login to Account</span>
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Quick Stats Grid */}
        {/* <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                Active Sahachari Items
              </span>
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-teal-50 text-teal-600 dark:bg-teal-950/60 dark:text-teal-400">
                <Boxes size={18} />
              </div>
            </div>
            <div className="mt-4 flex items-baseline gap-2">
              <span className="text-2xl font-bold text-slate-900 dark:text-slate-100">18</span>
              <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">
                Currently Issued
              </span>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                Ledger Status
              </span>
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400">
                <TrendingUp size={18} />
              </div>
            </div>
            <div className="mt-4 flex items-baseline gap-2">
              <span className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                ₹ 42,500
              </span>
              <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">
                Balanced
              </span>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                Upcoming Programs
              </span>
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400">
                <Calendar size={18} />
              </div>
            </div>
            <div className="mt-4 flex items-baseline gap-2">
              <span className="text-2xl font-bold text-slate-900 dark:text-slate-100">3</span>
              <span className="text-xs font-medium text-blue-600 dark:text-blue-400">
                This Month
              </span>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                Registered Beneficiaries
              </span>
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-50 text-purple-600 dark:bg-purple-950/60 dark:text-purple-400">
                <Users size={18} />
              </div>
            </div>
            <div className="mt-4 flex items-baseline gap-2">
              <span className="text-2xl font-bold text-slate-900 dark:text-slate-100">124</span>
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                Active Users
              </span>
            </div>
          </div>
        </div> */}

        {/* Module Navigation Grid */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
              Unit Management Modules
            </h2>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              Select a module to manage records
            </span>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {modules.map((mod) => {
              const Icon = mod.icon;
              return (
                <Link
                  key={mod.title}
                  to={mod.path}
                  className="group relative flex flex-col justify-between overflow-hidden rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md dark:border-slate-800 dark:bg-slate-900"
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div
                        className={`flex h-12 w-12 items-center justify-center rounded-2xl ${mod.badgeColor}`}
                      >
                        <Icon size={24} />
                      </div>
                      <ArrowUpRight
                        size={20}
                        className="text-slate-400 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-indigo-600 dark:group-hover:text-indigo-400"
                      />
                    </div>

                    <div>
                      <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                        {mod.title}
                      </h3>
                      <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                        {mod.description}
                      </p>
                    </div>
                  </div>

                  <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-4 dark:border-slate-800/80">
                    <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400">
                      Open Module &rarr;
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};