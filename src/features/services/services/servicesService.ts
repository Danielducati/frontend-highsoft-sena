import { API_URL } from "../constants";
import { Service } from "../types";

async function parseJsonSafe(res: Response) {
  const raw = await res.text();
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function getApiErrorMessage(data: any, fallback: string) {
  if (data && typeof data === "object" && "error" in data && typeof data.error === "string") {
    return data.error;
  }
  return fallback;
}

function getAuthHeaders() {
  const token = localStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
}

export async function fetchServicesApi(): Promise<Service[]> {
  const res = await fetch(`${API_URL}/services?all=true`, {  // ← agrega ?all=true aquí
    headers: getAuthHeaders(),
  });
  const data = await parseJsonSafe(res);
  if (!res.ok) throw new Error(getApiErrorMessage(data, `Error HTTP ${res.status} al cargar servicios`));
  if (!Array.isArray(data)) throw new Error("Respuesta inválida al cargar servicios");
  return data.map((s: any) => ({
    id:          s.id,
    name:        s.name,
    description: s.descripcion || "",
    duration:    s.duration,
    price:       s.price,
    category:    s.category || "",
    categoryId:  s.categoryId || 0,
    image:       s.imagen || "",
    isActive:    s.estado === "Activo",
  }));
}

export async function fetchCategoriesApi(): Promise<any[]> {
  const res = await fetch(`${API_URL}/categories?all=true`, {
    headers: getAuthHeaders(),
  });
  const data = await parseJsonSafe(res);
  if (!res.ok) throw new Error(getApiErrorMessage(data, `Error HTTP ${res.status} al cargar categorías`));
  if (!Array.isArray(data)) throw new Error("Respuesta inválida al cargar categorías");
  return data.map((cat: any) => ({
    ...cat,
    id:   cat.id ?? cat.PK_id_categoria_servicios,
    name: cat.nombre ?? cat.Nombre,
  }));
}

export async function createServiceApi(body: any): Promise<void> {
  const res = await fetch(`${API_URL}/services`, {
    method:  "POST",
    headers: getAuthHeaders(),
    body:    JSON.stringify(body),
  });
  const data = await parseJsonSafe(res);
  if (!res.ok) {
    throw new Error(getApiErrorMessage(data, `Error HTTP ${res.status} al crear servicio`));
  }
}   

export async function updateServiceApi(id: number, body: any): Promise<void> {
  const res = await fetch(`${API_URL}/services/${Number(id)}`, {
    method:  "PUT",
    headers: getAuthHeaders(),
    body:    JSON.stringify(body),
  });
  const data = await parseJsonSafe(res);
  if (!res.ok) throw new Error(getApiErrorMessage(data, `Error HTTP ${res.status} al actualizar servicio`));
}

export async function deleteServiceApi(id: number): Promise<void> {
  const res = await fetch(`${API_URL}/services/${id}`, {
    method:  "DELETE",
    headers: getAuthHeaders(),
  });
  const data = await parseJsonSafe(res);
  if (!res.ok) throw new Error(getApiErrorMessage(data, `Error HTTP ${res.status} al eliminar servicio`));
}