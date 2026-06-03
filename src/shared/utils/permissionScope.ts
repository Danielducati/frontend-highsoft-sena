import { isSystemAdminRole, isSystemClienteRole } from "../../features/auth/constants";

function getPermisos(): string[] {
  try {
    return JSON.parse(localStorage.getItem("permisos") ?? "[]") as string[];
  } catch {
    return [];
  }
}

/** Usuario con alcance de gestión (gerente, admin con permisos, etc.) */
export function canManageScope(): boolean {
  const permisos = getPermisos();
  if (isSystemAdminRole(getStoredRol())) return true;
  return permisos.some(
    (p) =>
      p.startsWith("empleados.") ||
      p.startsWith("clientes.") ||
      p === "empleados" ||
      p === "clientes"
  );
}

/** Empleado operativo (barbero, etc.) — solo su perfil y citas propias */
export function isRestrictedEmployee(): boolean {
  if (isSystemClienteRole(getStoredRol())) return false;
  if (isSystemAdminRole(getStoredRol())) return false;
  const permisos = getPermisos();
  if (permisos.length === 0) return true;
  return !canManageScope();
}

export function getStoredRol(): string {
  try {
    const u = JSON.parse(localStorage.getItem("usuario") ?? "{}");
    return u.rol ?? "";
  } catch {
    return "";
  }
}
