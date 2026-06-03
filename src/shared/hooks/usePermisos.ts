import { isSystemAdminRole } from "../../features/auth/constants";

/**
 * Hook que expone los permisos del usuario logueado.
 * Los permisos se leen del localStorage (guardados al hacer login).
 */
export function usePermisos() {
  const getPermisos = (): string[] => {
    try {
      const stored = localStorage.getItem("permisos");
      if (stored) return JSON.parse(stored) as string[];
    } catch {}
    return [];
  };

  const permisos = getPermisos();

  const can = (permiso: string): boolean => {
    const stored = localStorage.getItem("usuario");
    if (stored) {
      try {
        const u = JSON.parse(stored);
        if (isSystemAdminRole(u.rol ?? "")) return true;
      } catch {}
    }

    if (!permiso.includes(".")) {
      return permisos.some(p => p.startsWith(permiso + ".") || p === permiso);
    }
    return permisos.includes(permiso);
  };

  return { permisos, can };
}
