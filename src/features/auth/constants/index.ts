import { UserRole } from "../types";

const envApiUrl = import.meta.env.VITE_API_URL?.trim();
export const API_URL = envApiUrl || "https://backend-highsoft-sena-production.up.railway.app";

export const DOCUMENT_TYPES = [
  { value: "CC",  label: "Cédula de Ciudadanía" },
  { value: "TI",  label: "Tarjeta de Identidad" },
  { value: "CE",  label: "Cédula de Extranjería" },
  { value: "PAS", label: "Pasaporte" },
];

// Roles base del sistema → UserRole del frontend
export const ROL_MAP: Record<string, UserRole> = {
  "Admin":         "admin",
  "Administrador": "admin",
  "Empleado":      "employee",
  "Cliente":       "client",
  "Barbero":       "employee",
  "Estilista":     "employee",
  "Manicurista":   "employee",
  "Cosmetologa":   "employee",
  "Masajista":     "employee",
};

// Qué páginas habilita cada prefijo de permiso
export const PERMISO_PAGINA: Record<string, string> = {
  "dashboard":      "dashboard",
  "citas":          "appointments",
  "clientes":       "clients",
  "empleados":      "employees",
  "ventas":         "sales",
  "ventas_detalle": "sales",
  "servicios":      "services",
  "categorias":     "categories",
  "novedades":      "news",
  "horarios":       "schedules",
  "cotizaciones":   "quotations",
  "roles":          "roles",
  "usuarios":       "users",
  "reportes":       "dashboard",
  "configuracion":  "settings",
};

/** Rol base "Cliente" del sistema (no roles personalizados con "cliente" en el nombre). */
export function isSystemClienteRole(rolBackend: string): boolean {
  if (!rolBackend) return false;
  const trimmed = rolBackend.trim();
  if (ROL_MAP[trimmed] === "client") return true;
  const lower = trimmed.toLowerCase();
  return lower === "cliente" || lower === "client";
}

/** Rol base de administrador del sistema. */
export function isSystemAdminRole(rolBackend: string): boolean {
  if (!rolBackend) return false;
  const trimmed = rolBackend.trim();
  if (ROL_MAP[trimmed] === "admin") return true;
  const lower = trimmed.toLowerCase();
  return lower === "admin" || lower === "administrador";
}

/**
 * Mapea el nombre del rol del backend al UserRole del frontend.
 * Roles personalizados → "employee" (la UI se arma solo con permisos).
 */
export function resolveUserRole(rolBackend: string): UserRole {
  if (!rolBackend) return "employee";
  const known = ROL_MAP[rolBackend.trim()];
  if (known) return known;
  return "employee";
}

export function resolveAllowedPages(permisos: string[]): string[] {
  const pages = new Set<string>();

  const LEGACY_MAP: Record<string, string> = {
    dashboard:  "dashboard",
    usuarios:   "users",
    empleados:  "employees",
    servicios:  "services",
    clientes:   "clients",
    citas:      "appointments",
    ventas:     "sales",
    reportes:   "dashboard",
    novedades:  "news",
    horarios:   "schedules",
    cotizaciones: "quotations",
    categorias: "categories",
    roles:      "roles",
  };

  for (const p of permisos) {
    if (!p.includes(".")) {
      const page = LEGACY_MAP[p.toLowerCase()];
      if (page) pages.add(page);
      continue;
    }
    const prefix = p.split(".")[0].toLowerCase();
    const page   = PERMISO_PAGINA[prefix];
    if (page) pages.add(page);
    if (prefix === "perfil") pages.add("users");
  }

  return Array.from(pages);
}

/** Primera pantalla tras login según permisos (no vistas fijas por rol). */
const PAGE_PRIORITY = [
  "dashboard",
  "appointments",
  "sales",
  "clients",
  "employees",
  "services",
  "categories",
  "news",
  "schedules",
  "quotations",
  "roles",
  "users",
  "settings",
] as const;

export function resolveFirstPage(
  allowedPages: string[],
  rolBackend?: string
): string {
  if (allowedPages.length === 0) {
    return isSystemClienteRole(rolBackend ?? "") ? "appointments" : "users";
  }
  for (const page of PAGE_PRIORITY) {
    if (allowedPages.includes(page)) return page;
  }
  return allowedPages[0];
}