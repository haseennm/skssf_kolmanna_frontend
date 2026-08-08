import { Navigate, Outlet } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";

export default function AuthLayout() {
  const { user } = useAuthStore();

  // Already logged in
  if (user) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}