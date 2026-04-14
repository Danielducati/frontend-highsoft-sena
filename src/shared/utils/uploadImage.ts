// src/shared/utils/uploadImage.ts
const API = import.meta.env.VITE_API_URL ?? "http://localhost:3001";

const getToken = () => localStorage.getItem("token") ?? "";

/**
 * Sube un archivo a Cloudinary a través del backend.
 * Reintenta hasta 3 veces con timeout de 15s por intento.
 */
export async function uploadImage(file: File): Promise<string> {
  const ALLOWED_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif"];
  if (!ALLOWED_TYPES.includes(file.type)) {
    throw new Error("Solo se permiten imágenes (JPG, PNG, WEBP, GIF)");
  }
  if (file.size > 5_000_000) {
    throw new Error("La imagen no debe superar los 5MB");
  }

  const MAX_RETRIES = 3;
  const TIMEOUT_MS  = 15_000;

  let lastError: Error = new Error("Error desconocido");

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      const formData = new FormData();
      formData.append("image", file);

      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

      const res = await fetch(`${API}/upload/image`, {
        method:  "POST",
        headers: { Authorization: `Bearer ${getToken()}` },
        body:    formData,
        signal:  controller.signal,
      });

      clearTimeout(timer);

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error ?? `Error ${res.status} al subir imagen`);
      }

      const data = await res.json();
      return data.url;

    } catch (err: any) {
      lastError = err.name === "AbortError"
        ? new Error(`Tiempo de espera agotado (intento ${attempt}/${MAX_RETRIES})`)
        : err;

      if (attempt < MAX_RETRIES) {
        // Esperar antes de reintentar (500ms, 1000ms)
        await new Promise(r => setTimeout(r, attempt * 500));
      }
    }
  }

  throw lastError;
}