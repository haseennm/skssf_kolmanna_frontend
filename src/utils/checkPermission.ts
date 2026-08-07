import Swal from "sweetalert2";
import type { NavigateFunction } from "react-router-dom";
import type { User } from "../store/useAuthStore";



export const checkPermission = async (
  user: User | null,
  requiredRoles: string | string[],
  navigate: NavigateFunction
): Promise<boolean> => {
  if (!user) {
    const result = await Swal.fire({
      title: "Login Required",
      text: "Please log in to continue.",
      icon: "warning",
      confirmButtonText: "Go to Login",
      confirmButtonColor: "#2563eb",
    });

    if (result.isConfirmed) {
      navigate("/login");
    }

    return false;
  }

  const roles = Array.isArray(requiredRoles)
    ? requiredRoles
    : [requiredRoles];

  const hasPermission = roles.some((role) => user.role.includes(role));

  if (!hasPermission) {
    await Swal.fire({
      title: "Access Denied",
      html: `
        <p>You don't have permission to perform this action.</p>
        <small>Please contact your administrator if you need access.</small>
      `,
      icon: "error",
      confirmButtonColor: "#ef4444",
      confirmButtonText: "OK",
    });

    return false;
  }

  return true;
};