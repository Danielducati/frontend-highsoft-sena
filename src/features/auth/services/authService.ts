import { API_URL, resolveUserRole, resolveAllowedPages } from "../constants";
import { UserRole } from "../types";

export type GoogleProfileInput = {
  nombre?: string;
  apellido?: string;
  foto?: string;
  displayName?: string;
};

export type AuthSessionPayload = {
  token: string;
  usuario: {
    id: number;
    correo: string;
    rol: string;
    nombre?: string;
    apellido?: string;
    foto?: string;
    registroViaGoogle?: boolean;
  };
};

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

export async function googleLoginRequest(idToken: string, profile?: GoogleProfileInput) {
  console.log("📤 [Google Login Request] Enviando petición al backend...");
  console.log("📤 [Google Login Request] URL:", `${API_URL}/auth/google`);
  console.log("📤 [Google Login Request] Profile:", profile);
  
  const res = await fetch(`${API_URL}/auth/google`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ idToken, ...profile }),
  });

  console.log("📥 [Google Login Request] Status:", res.status);

  const data = await parseJsonSafe(res);

  if (!res.ok) {
    const apiError =
      (data &&
        typeof data === "object" &&
        "error" in data &&
        typeof data.error === "string" &&
        data.error) ||
      `Error HTTP ${res.status}`;

    console.error("❌ [Google Login Request] Error del servidor:", apiError);
    throw new Error(apiError);
  }

  console.log("✅ [Google Login Request] Respuesta exitosa");
  return data;
}

/** Guarda token, usuario y permisos tras login o registro con Google */
export async function completeAuthSession(data: AuthSessionPayload) {
  const rolBackend = data.usuario?.rol ?? "Cliente";
  const rolFrontend: UserRole = resolveUserRole(rolBackend);

  localStorage.setItem("token", data.token);
  localStorage.setItem("usuario", JSON.stringify(data.usuario));

  let permisos: string[] = [];
  try {
    const meRes = await fetch(`${API_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${data.token}` },
    });
    if (meRes.ok) {
      const meData = await meRes.json();
      permisos = meData.permisos ?? [];
    }
  } catch {
    /* permisos vacíos si falla */
  }

  const allowedPages = resolveAllowedPages(permisos);
  localStorage.setItem("permisos", JSON.stringify(permisos));
  localStorage.setItem("allowedPages", JSON.stringify(allowedPages));

  let firstPage: string | undefined;
  if (rolFrontend !== "admin" && rolFrontend !== "client") {
    firstPage = allowedPages.find((p) => p !== "users") ?? "users";
  }

  return { rolFrontend, rolBackend, firstPage };
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

export async function setPasswordRequest(nuevaPassword: string) {
  const token = localStorage.getItem("token");
  const res = await fetch(`${API_URL}/auth/establecer-contrasena`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ nuevaPassword }),
  });

  const data = await parseJsonSafe(res);

  if (!res.ok) {
    const apiError =
      (data && typeof data === "object" && "error" in data && typeof data.error === "string" && data.error) ||
      `Error HTTP ${res.status}`;
    throw new Error(apiError);
  }

  return data;
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

export interface LoginPageProps {
  onLogin: (role: UserRole, firstPage?: string) => void;
  onBack: () => void;
  onRegister?: () => void;
}

export interface RegisterPageProps {
  onBack: () => void;
  onRegisterSuccess: () => void;
  onLogin: (role: import("../types").UserRole, firstPage?: string) => void;
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