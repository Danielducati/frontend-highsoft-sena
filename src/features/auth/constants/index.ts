import { UserRole } from "../types";

const envApiUrl = import.meta.env.VITE_API_URL?.trim();
export const API_URL = envApiUrl || "http://localhost:3001";

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
  "dashboard":    "dashboard",
  "citas":        "appointments",
  "clientes":     "clients",
  "empleados":    "employees",
  "ventas":       "ventas",
  "servicios":    "services",
  "categorias":   "categories",
  "novedades":    "news",
  "horarios":     "schedules",
  "cotizaciones": "quotations",
  "roles":        "roles",
  "usuarios":     "users",
};

/**
 * Dado el nombre del rol y la lista de permisos, devuelve el UserRole
 * y las páginas que el usuario puede ver.
 */
export function resolveUserRole(rolBackend: string): UserRole {
  if (!rolBackend) return "client";
  const known = ROL_MAP[rolBackend];
  if (known) return known;
  const lower = rolBackend.toLowerCase();
  if (lower.includes("admin")) return "admin";
  if (lower.includes("cliente") || lower.includes("client")) return "client";
  return "employee";
}

export function resolveAllowedPages(permisos: string[]): string[] {
  const pages = new Set<string>();
  // Siempre puede ver su perfil
  pages.add("users");

  for (const p of permisos) {
    const prefix = p.split(".")[0];
    const page   = PERMISO_PAGINA[prefix];
    if (page) pages.add(page);
  }
  return Array.from(pages);
}