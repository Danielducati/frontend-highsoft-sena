import { UsersPage } from "./pages/UsersPage";
import { EmployeeProfilePage } from "./pages/EmployeeProfilePage";
import { ClientProfilePage } from "./pages/ClientProfilePage";
import { isSystemClienteRole } from "../auth/constants";
import { usePermisos } from "../../shared/hooks/usePermisos";

interface UsersModuleProps {
  userRole: "admin" | "employee" | "client";
}

export function UsersModule({ userRole }: UsersModuleProps) {
  const { can } = usePermisos();

  let storedRol = "";
  try {
    const u = JSON.parse(localStorage.getItem("usuario") ?? "{}");
    storedRol = u.rol ?? "";
  } catch {}

  if (can("usuarios.ver") || userRole === "admin") {
    return <UsersPage userRole={userRole} />;
  }
  if (isSystemClienteRole(storedRol) || userRole === "client") {
    return <ClientProfilePage />;
  }
  return <EmployeeProfilePage />;
}
