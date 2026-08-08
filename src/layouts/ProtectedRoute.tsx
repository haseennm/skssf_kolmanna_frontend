import  { useEffect, useState } from "react";
import { Navigate, Outlet, useLocation, useNavigate } from "react-router-dom";
import { ShieldAlert, ArrowLeft, Key, Lock, Clock } from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";

interface ProtectedRouteProps {
  roles?: string[];
}

export default function ProtectedRoute({ roles }: ProtectedRouteProps) {
  const { user } = useAuthStore();
  const location = useLocation();
  const navigate = useNavigate();

  // 1. Authentication Status
  const isLoggedIn = !!user;

  // 2. Permission Evaluation
  const userRoles = user?.role || [];
  const isAllHandle = userRoles.includes("all handle" as any);

  const hasPermission =
    !roles ||
    roles.length === 0 ||
    isAllHandle ||
    roles.some((role) => userRoles.includes(role as any));

  const isUnauthorized = isLoggedIn && !hasPermission;

  // 3. Auto-Redirect Countdown State (5 seconds)
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    if (!isUnauthorized) return;

    // Reset countdown timer when route changes or access becomes unauthorized
    setCountdown(5);

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          navigate("/", { replace: true });
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isUnauthorized, location.pathname, navigate]);

  // Handle Unauthenticated Access
  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  // Handle Unauthorized Access (Access Denied View with 5-Second Countdown)
  if (isUnauthorized) {
    return (
      <div className="flex min-h-[80vh] w-full items-center justify-center p-4">
        <div className="w-full max-w-md rounded-3xl border border-slate-200/80 bg-white p-6 shadow-xl transition-all dark:border-slate-800 dark:bg-slate-900 sm:p-8">
          
          {/* Alert Icon */}
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-rose-50 text-rose-600 dark:bg-rose-950/50 dark:text-rose-400">
            <ShieldAlert size={32} />
          </div>

          {/* Title */}
          <div className="text-center">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
              Access Denied
            </h1>
            <p className="mt-1 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
              You don't have permission to access this page.
            </p>
          </div>

          {/* Reason Breakdown */}
          <div className="my-6 space-y-3 rounded-2xl border border-slate-100 bg-slate-50/70 p-4 text-xs dark:border-slate-800 dark:bg-slate-900/60">
            
            {/* Required Roles */}
            <div>
              <div className="mb-1.5 flex items-center gap-1.5 font-semibold text-slate-700 dark:text-slate-200">
                <Lock size={14} className="text-rose-500" />
                <span>Required Role:</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {roles?.map((r) => (
                  <span
                    key={r}
                    className="rounded-lg bg-rose-100/80 px-2.5 py-1 font-mono text-[11px] font-semibold text-rose-700 dark:bg-rose-950/60 dark:text-rose-300"
                  >
                    {r}
                  </span>
                ))}
              </div>
            </div>

            <hr className="border-slate-200/60 dark:border-slate-800" />

            {/* Assigned Roles */}
            <div>
              <div className="mb-1.5 flex items-center gap-1.5 font-semibold text-slate-700 dark:text-slate-200">
                <Key size={14} className="text-indigo-500" />
                <span>Your Assigned Role(s):</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {userRoles.length > 0 ? (
                  userRoles.map((r) => (
                    <span
                      key={r}
                      className="rounded-lg bg-slate-200/70 px-2.5 py-1 font-mono text-[11px] font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-300"
                    >
                      {r}
                    </span>
                  ))
                ) : (
                  <span className="italic text-slate-400">No assigned roles</span>
                )}
              </div>
            </div>
          </div>

          {/* Countdown Indicator & Action */}
          <div className="space-y-3 text-center">
            <div className="inline-flex items-center gap-2 rounded-full bg-indigo-50 px-3.5 py-1.5 text-xs font-medium text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300">
              <Clock size={14} className="animate-spin text-indigo-600 dark:text-indigo-400" />
              <span>
                Redirecting home in <strong className="font-bold">{countdown}s</strong>
              </span>
            </div>

            <button
              type="button"
              onClick={() => navigate("/", { replace: true })}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 py-2.5 text-xs font-semibold text-white shadow-md shadow-indigo-600/20 transition hover:bg-indigo-500 active:scale-95"
            >
              <ArrowLeft size={16} />
              Go Home Now
            </button>
          </div>

        </div>
      </div>
    );
  }

  // Render Protected Child Routes
  return <Outlet />;
}