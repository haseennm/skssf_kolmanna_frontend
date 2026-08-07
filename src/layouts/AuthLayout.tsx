import { Outlet } from "react-router-dom";

export default function AuthLayout() {
  return (
    <main className="min-h-screen bg-last-50 dark:bg-teritory-900 flex items-center justify-center p-6">
      <Outlet />
    </main>
  );
}