import { API_URL } from "../constants";
import { handleFetchError } from "../../../shared/utils/errorHandler";

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
  try {
    const res = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ correo, contrasena }),
    });

    const data = await parseJsonSafe(res);

    if (!res.ok) {
      const apiError =
        (data &&
          typeof data === "object" &&
          "error" in data &&
          typeof data.error === "string" &&
          data.error) ||
        `Error al iniciar sesión. Código: ${res.status}`;

      throw new Error(apiError);
    }

    return data;
  } catch (error: any) {
    throw new Error(handleFetchError(error));
  }
}

export async function googleLoginRequest(idToken: string) {
  try {
    const res = await fetch(`${API_URL}/auth/google`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ idToken }),
    });

    const data = await parseJsonSafe(res);

    if (!res.ok) {
      const apiError =
        (data &&
          typeof data === "object" &&
          "error" in data &&
          typeof data.error === "string" &&
          data.error) ||
        `Error al iniciar sesión con Google. Código: ${res.status}`;

      throw new Error(apiError);
    }

    return data;
  } catch (error: any) {
    throw new Error(handleFetchError(error));
  }
}

export async function forgotPasswordRequest(correo: string) {
  try {
    const res = await fetch(`${API_URL}/auth/forgot-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ correo }),
    });

    const data = await parseJsonSafe(res);

    if (!res.ok) {
      const apiError =
        (data &&
          typeof data === "object" &&
          "error" in data &&
          typeof data.error === "string" &&
          data.error) ||
        `Error al enviar correo de recuperación. Código: ${res.status}`;

      throw new Error(apiError);
    }

    return data;
  } catch (error: any) {
    throw new Error(handleFetchError(error));
  }
}

export async function resetPasswordRequest(
  token: string,
  nuevaPassword: string
) {
  try {
    const res = await fetch(`${API_URL}/auth/reset-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, nuevaPassword }),
    });

    const data = await parseJsonSafe(res);

    if (!res.ok) {
      const apiError =
        (data && typeof data === "object" && "error" in data && typeof data.error === "string" && data.error) ||
        `Error al restablecer contraseña. Código: ${res.status}`;
      throw new Error(apiError);
    }

    return data;
  } catch (error: any) {
    throw new Error(handleFetchError(error));
  }
}

export async function validateResetTokenRequest(token: string) {
  try {
    const res = await fetch(`${API_URL}/auth/validate-reset-token`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
    });

    const data = await parseJsonSafe(res);

    if (!res.ok) {
      const apiError =
        (data && typeof data === "object" && "error" in data && typeof data.error === "string" && data.error) ||
        `El enlace de recuperación no es válido o ha expirado`;
      throw new Error(apiError);
    }

    return data;
  } catch (error: any) {
    throw new Error(handleFetchError(error));
  }
}

export async function changePasswordRequest(contrasenaActual: string, nuevaPassword: string) {
  try {
    const token = localStorage.getItem("token");
    const res = await fetch(`${API_URL}/auth/change-password`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ contrasenaActual, nuevaPassword }),
    });

    const data = await parseJsonSafe(res);

    if (!res.ok) {
      const apiError =
        (data && typeof data === "object" && "error" in data && typeof data.error === "string" && data.error) ||
        `Error al cambiar contraseña. Código: ${res.status}`;
      throw new Error(apiError);
    }

    return data;
  } catch (error: any) {
    throw new Error(handleFetchError(error));
  }
}

export async function registerRequest(payload: {
  email: string;
  password: string;
  fullName: string;
  apellido: string;
  phone?: string;
  tipocedula?: string;
  cedula?: string;
}) {
  try {
    // Mapear los nombres del frontend a los que espera el backend
    const body = {
      correo:           payload.email,
      contrasena:       payload.password,
      nombre:           payload.fullName,
      apellido:         payload.apellido,
      telefono:         payload.phone,
      tipo_documento:   payload.tipocedula,
      numero_documento: payload.cedula,
    };

    const res  = await fetch(`${API_URL}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const data = await parseJsonSafe(res);

    if (!res.ok) {
      const apiError =
        (data &&
          typeof data === "object" &&
          "error" in data &&
          typeof data.error === "string" &&
          data.error) ||
        `Error al registrar usuario. Código: ${res.status}`;

      throw new Error(apiError);
    }

    return data;
  } catch (error: any) {
    throw new Error(handleFetchError(error));
  }
}

export type UserRole = "admin" | "employee" | "client";

export interface LoginPageProps {
  onLogin: (role: UserRole, firstPage?: string) => void;
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