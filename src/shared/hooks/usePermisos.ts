/**
 * Hook que expone los permisos del usuario logueado.
 * Lee del localStorage los permisos guardados al hacer login.
 *
 * Uso:
 *   const { can } = usePermisos();
 *   can("citas.crear")   → true/false
 *   can("clientes.ver")  → true/false
 *
 * Para admins siempre retorna true (tienen acceso total).
 */
export function usePermisos() {
  const stored = localStorage.getItem("permisos");
  const usuario = (() => {
    try { return JSON.parse(localStorage.getItem("usuario") ?? "{}"); } catch { return {}; }
  })();

  const rol: string = usuario?.rol ?? "";
  const isAdmin = rol === "Admin" || rol === "Administrador";

  let permisos: string[] = [];
  try {
    permisos = stored ? JSON.parse(stored) : [];
  } catch {
    permisos = [];
  }

  /**
   * Verifica si el usuario tiene un permiso específico.
   * Los admins siempre tienen todos los permisos.
   */
  const can = (permiso: string): boolean => {
    if (isAdmin) return true;
    return permisos.includes(permiso);
  };

  /**
   * Verifica si el usuario tiene AL MENOS UNO de los permisos dados.
   */
  const canAny = (...permisosList: string[]): boolean => {
    if (isAdmin) return true;
    return permisosList.some(p => permisos.includes(p));
  };

  /**
   * Verifica si el usuario tiene TODOS los permisos dados.
   */
  const canAll = (...permisosList: string[]): boolean => {
    if (isAdmin) return true;
    return permisosList.every(p => permisos.includes(p));
  };

  return { can, canAny, canAll, permisos, isAdmin, rol };
}
