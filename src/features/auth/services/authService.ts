import { API_URL } from "../constants";

async function parseJsonSafe(res: Response) {
  const raw = await res.text();
  if (!raw) return null;

  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export async function loginRequest(correo: string, contrasena: string) {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ correo, contrasena }),
  });
  const data = await parseJsonSafe(res);

  if (!res.ok) {
    const apiError =
      (data && typeof data === "object" && "error" in data && typeof data.error === "string" && data.error) ||
      `Error HTTP ${res.status} al iniciar sesión`;
    throw new Error(apiError);
  }

  if (!data || typeof data !== "object") {
    throw new Error("El servidor no devolvió un JSON válido en /auth/login");
  }

  return data;
}

// ✅ CORREGIDO: Recibe datos en inglés (del frontend) y mapea a los nombres que espera el backend
export async function registerRequest(payload: {
  email: string;
  password: string;
  fullName: string;
  apellido: string;
  phone?: string;
  tipocedula?: string;
  cedula?: string;
}) {
  // ✅ MAPEO: Convierte los nombres del frontend a los que espera el backend
  const mappedPayload = {
    email: payload.email,              // ← Backend espera "email"
    password: payload.password,        // ← Backend espera "password"
    fullName: payload.fullName,        // ← Backend espera "fullName"
    apellido: payload.apellido,        // ← Backend espera "apellido"
    phone: payload.phone,              // ← Backend espera "phone"
    tipocedula: payload.tipocedula,    // ← Backend espera "tipocedula"
    cedula: payload.cedula,            // ← Backend espera "cedula"
  };

  console.log("📤 Enviando al backend:", mappedPayload);

  const res = await fetch(`${API_URL}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(mappedPayload),
  });
  const data = await parseJsonSafe(res);

  console.log("📥 Respuesta del servidor:", data);

  if (!res.ok) {
    const apiError =
      (data && typeof data === "object" && "error" in data && typeof data.error === "string" && data.error) ||
      `Error HTTP ${res.status} al registrar usuario`;
    throw new Error(apiError);
  }

  if (!data || typeof data !== "object") {
    throw new Error("El servidor no devolvió un JSON válido en /auth/register");
  }

  return data;
}

export type UserRole = "admin" | "employee" | "client";

export interface LoginPageProps {
  onLogin: (role: UserRole) => void;
  onBack: () => void;
}

export interface RegisterPageProps {
  onBack: () => void;
  onRegisterSuccess: () => void;
}

export interface RegisterFormData {
  fullName: string;
  apellido: string;
  email: string;
  phone: string;
  tipocedula: string;
  cedula: string;
  password: string;
  confirmPassword: string;
}