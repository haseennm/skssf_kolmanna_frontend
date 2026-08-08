import { useState, useEffect } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import {
  HeartHandshake,
  LogOut,
  Menu,
  Moon,
  Sun,
  User,
  X,
  Boxes,
  BookOpenText,
  CalendarDays,
  FolderKanban,
  LogIn,
} from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";
import { useThemeStore } from "../store/themeStore";

const publicNavItems = [
  {
    name: "Sahachari",
    path: "/sahachari/items",
    icon: HeartHandshake,
  },
];

const protectedNavItems = [
  { name: "User", path: "/user", icon: User },
  { name: "Stock", path: "/stock", icon: Boxes },
  { name: "Ledger", path: "/ledger", icon: BookOpenText },
  { name: "Program", path: "/program", icon: FolderKanban },
  { name: "Active Year", path: "/active/year", icon: CalendarDays },
  { name: "Profile", path: "/profile", icon: User },
];

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const { isAuthenticated, logoutUser } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const { isDark, toggleTheme } = useThemeStore();

  const navItems = isAuthenticated
    ? [...publicNavItems, ...protectedNavItems]
    : publicNavItems;

  useEffect(() => {
    setIsOpen(false);
  }, [location]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsOpen(false);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/90 backdrop-blur transition-colors dark:border-slate-800 dark:bg-slate-950/90">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <NavLink to="/" className="flex items-center gap-2 text-xl font-bold tracking-wide no-underline">
          <img src="/logo.webp" alt="SKSSF Kolmanna" className="h-10 w-10 object-contain" />
          <span className="text-indigo-600 dark:text-indigo-400">SKSSF</span>
          <span className="text-slate-700 dark:text-slate-300">Kolmanna</span>
        </NavLink>

        {/* Desktop Navigation */}
        <nav className="hidden items-center gap-6 md:flex">
          <button
            onClick={toggleTheme}
            className="text-slate-600 transition hover:text-indigo-600 dark:text-slate-300 dark:hover:text-indigo-400"
          >
            {isDark ? <Sun size={20} /> : <Moon size={20} />}
          </button>

          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `text-sm font-medium transition-colors ${
                  isActive
                    ? "font-semibold text-indigo-600 dark:text-indigo-400"
                    : "text-slate-600 hover:text-indigo-600 dark:text-slate-300 dark:hover:text-indigo-400"
                }`
              }
            >
              {item.name}
            </NavLink>
          ))}

          {isAuthenticated ? (
            <button
              onClick={logoutUser}
              className="inline-flex items-center gap-1.5 rounded-xl bg-rose-600 px-3.5 py-1.5 text-xs font-semibold text-white transition hover:bg-rose-500"
            >
              <LogOut size={14} />
              Logout
            </button>
          ) : (
            <button
              onClick={() => navigate("/login")}
              className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-3.5 py-1.5 text-xs font-semibold text-white transition hover:bg-indigo-500"
            >
              <LogIn size={14} />
              Login
            </button>
          )}
        </nav>

        {/* Mobile Toggle */}
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="rounded-lg p-2 text-slate-700 transition hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800 md:hidden"
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <nav className="border-t border-slate-200 bg-white shadow-xl dark:border-slate-800 dark:bg-slate-900 md:hidden">
          <div className="space-y-2 px-4 py-4">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => setIsOpen(false)}
                className={({ isActive }) =>
                  `flex items-center rounded-xl px-4 py-3 text-sm font-medium transition-all ${
                    isActive
                      ? "bg-indigo-600 text-white"
                      : "text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                  }`
                }
              >
                {item.icon && <item.icon className="mr-3 h-5 w-5" />}
                <span>{item.name}</span>
              </NavLink>
            ))}

            <div className="my-3 border-t border-slate-200 dark:border-slate-800" />

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="flex w-full items-center justify-between rounded-xl px-4 py-3 text-sm font-medium text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              <span>{isDark ? "Dark Mode" : "Light Mode"}</span>
              {isDark ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            {/* Auth Action */}
            {isAuthenticated ? (
              <button
                onClick={logoutUser}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-rose-600 py-3 text-sm font-semibold text-white"
              >
                <LogOut size={18} />
                <span>Logout</span>
              </button>
            ) : (
              <button
                onClick={() => {
                  navigate("/login");
                  setIsOpen(false);
                }}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 py-3 text-sm font-semibold text-white"
              >
                <LogIn size={18} />
                <span>Login</span>
              </button>
            )}
          </div>
        </nav>
      )}
    </header>
  );
}