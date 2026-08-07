import { useState, useEffect } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { HeartHandshake, Menu, Moon, Sun, User, X } from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";
import { useThemeStore } from "../store/themeStore";
import {
  Boxes,
  BookOpenText,
  CalendarDays,
  FolderKanban,
} from "lucide-react";

const navItems = [
  {
    name: "Sahachari",
    path: "/sahachari",
    icon: HeartHandshake,
  },
  {
    name: "User",
    path: "/user",
    icon: User,
  },
  {
    name: "Stock",
    path: "/stock",
    icon: Boxes,
  },
  {
    name: "Ledger",
    path: "/ledger",
    icon: BookOpenText,
  },
  {
    name: "Program",
    path: "/program",
    icon: FolderKanban,
  },
  {
    name: "Active Year",
    path: "/active/year",
    icon: CalendarDays,
  },
];

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const { isAuthenticated, logoutUser } = useAuthStore();
  const navigate = useNavigate()
  const location = useLocation();
  const { isDark, toggleTheme } = useThemeStore();
  // Close mobile menu on route change
  useEffect(() => {
    setIsOpen(false);
  }, [location]);

  // Close mobile menu on Escape key press (typed e as KeyboardEvent)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsOpen(false);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <header className="sticky top-0 z-50 border-b border-neutral-800 bg-neutral-950/95 backdrop-blur">
      <div className="mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">

        {/* Logo */}
        <NavLink
          to="/"
          className="text-xl font-bold tracking-wide text-primary-600 no-underline"
        >
          SKSSF <span className="text-secondary-500">Kolmanna</span>
        </NavLink>
        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6">
          <button onClick={toggleTheme} className="text-sm font-medium transition-colors no-underline text-neutral-300 hover:text-secondary-300">
            {!isDark ? <Moon /> : <Sun />}
          </button>
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `text-sm font-medium transition-colors no-underline ${isActive
                  ? "text-secondary-500 font-semibold"
                  : "text-neutral-300 hover:text-secondary-300"
                }`
              }
            >
              {item.name}
            </NavLink>
          ))}
          {isAuthenticated ? (
            <button onClick={logoutUser} className="text-sm font-medium transition-colors no-underline bg-red-500 p-1 rounded-sm text-neutral-300 hover:text-secondary-900"
            >
              Logout
            </button>
          ) : (
            <button onClick={() => navigate("/login")} className="text-sm font-medium transition-colors no-underline bg-primary-600 p-1 rounded-sm text-last-50 hover:text-secondary-900">
              Login
            </button>
          )}
        </nav>

        {/* Mobile Menu Button */}
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          aria-expanded={isOpen}
          aria-label={isOpen ? "Close menu" : "Open menu"}
          className="rounded-lg p-2 text-white transition hover:bg-neutral-800 md:hidden"
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Navigation Dropdown */}
      {isOpen && (
  <nav className="md:hidden border-t border-neutral-800 bg-neutral-900 shadow-xl">
    <div className="px-4 py-4 space-y-2">

      {/* Navigation Links */}
      <div className="space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            onClick={() => setIsOpen(false)}
            className={({ isActive }) =>
              `flex items-center rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200 ${
                isActive
                  ? "bg-emerald-500 text-white shadow-md"
                  : "text-neutral-300 hover:bg-neutral-800 hover:text-emerald-400"
              }`
            }
          >
            {item.icon && <item.icon className="mr-3 h-5 w-5" />}
            <span>{item.name}</span>
          </NavLink>
        ))}
      </div>

      {/* Divider */}
      <div className="border-t border-neutral-800 my-3" />

      {/* Theme Button */}
      <button
      type="button"
      role="switch"
      aria-checked={isDark}
      aria-label="Toggle theme"
      onClick={toggleTheme}
      className="group flex w-full items-center justify-between rounded-xl px-4 py-3 transition-colors duration-200 hover:bg-neutral-800/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
    >
      {/* Icon & Label */}
      <div className="flex items-center gap-3">
        <div className="relative flex h-5 w-5 items-center justify-center text-neutral-400 transition-colors group-hover:text-neutral-200">
          <Sun
            className={`absolute h-5 w-5 transition-all duration-300 ${
              isDark
                ? "rotate-90 scale-0 opacity-0"
                : "rotate-0 scale-100 opacity-100"
            }`}
          />
          <Moon
            className={`absolute h-5 w-5 transition-all duration-300 ${
              isDark
                ? "rotate-0 scale-100 opacity-100"
                : "-rotate-90 scale-0 opacity-0"
            }`}
          />
        </div>

        <span className="text-sm font-medium text-neutral-300 transition-colors group-hover:text-white">
          {isDark ? "Dark Mode" : "Light Mode"}
        </span>
      </div>

      {/* Switch Track */}
      <div
        className={`relative h-6 w-11 rounded-full transition-colors duration-300 ease-in-out ${
          isDark ? "bg-emerald-500" : "bg-neutral-700"
        }`}
      >
        {/* Switch Thumb */}
        <span
          className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow-md transition-transform duration-300 ease-in-out ${
            isDark ? "translate-x-5" : "translate-x-0"
          }`}
        />
      </div>
    </button>

      {/* Auth Button */}
      {isAuthenticated ? (
        <button
          onClick={logoutUser}
          className="w-full rounded-xl bg-red-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-red-600 active:scale-[0.98]"
        >
          Logout
        </button>
      ) : (
        <button
          onClick={() => {
            navigate("/login");
            setIsOpen(false);
          }}
          className="w-full rounded-xl bg-emerald-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-600 active:scale-[0.98]"
        >
          Login
        </button>
      )}
    </div>
  </nav>
)}
    </header>
  );
}