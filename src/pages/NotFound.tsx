import { NavLink } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-last-50 dark:bg-last-800 gap-3 flex-col">
      <h1 className="text-4xl font-bold text-last-800 dark:text-last-50">404 | Page Not Found</h1>
      <NavLink to={"/"} className="text-4xl font-bold text-last-800 dark:text-last-50 hover:text-primary-700 duration-200">Got to home</NavLink >
    </div>
  );
}