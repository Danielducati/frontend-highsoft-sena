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

export async function registerRequest(payload: {
  correo: string;
  contrasena: string;
  nombre: string;
  apellido: string;
  telefono: string;
  tipo_documento: string;
  numero_documento: string;
}) {
  const res = await fetch(`${API_URL}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await parseJsonSafe(res);

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