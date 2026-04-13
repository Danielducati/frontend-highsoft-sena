// src/shared/utils/uploadImage.ts
const API = "http://localhost:3001";

const getToken = () => localStorage.getItem("token") ?? "";

/**
 * Sube un archivo a Cloudinary a través del backend.
 * Devuelve la URL pública de la imagen.
 */
export async function uploadImage(file: File): Promise<string> {
  const ALLOWED_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif"];
  if (!ALLOWED_TYPES.includes(file.type)) {
    throw new Error("Solo se permiten imágenes (JPG, PNG, WEBP, GIF)");
  }

  if (file.size > 5_000_000) {
    throw new Error("La imagen no debe superar los 5MB");
  }

const formData = new FormData();
formData.append("image", file);

const res = await fetch(`${API}/upload/image`, {
    method:  "POST",
    headers: { Authorization: `Bearer ${getToken()}` },
    body:    formData,
    // NO incluir Content-Type — el browser lo pone automáticamente con el boundary
});

if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error ?? "Error al subir imagen");
}

const data = await res.json();
return data.url;
}