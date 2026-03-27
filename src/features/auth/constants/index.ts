import { UserRole } from "../types";

const envApiUrl = import.meta.env.VITE_API_URL?.trim();
export const API_URL = envApiUrl || "http://localhost:3001";

// Las claves deben coincidir EXACTAMENTE con lo que devuelve data.usuario.rol
// El backend devuelve: "Admin", "Empleado", "Cliente" (con mayúscula inicial)
export const ROL_MAP: Record<string, UserRole> = {
  // Valores que devuelve el backend
  "Admin":          "admin",
  "Empleado":       "employee",
  "Cliente":        "client",
  // Por si acaso también vienen así
  "Administrador":  "admin",
  "Barbero":        "employee",
  "Estilista":      "employee",
  "Manicurista":    "employee",
  "Cosmetologa":    "employee",
  "Masajista":      "employee",
};

export const DOCUMENT_TYPES = [
  { value: "CC",  label: "Cédula de Ciudadanía" },
  { value: "TI",  label: "Tarjeta de Identidad" },
  { value: "CE",  label: "Cédula de Extranjería" },
  { value: "PAS", label: "Pasaporte" },
];