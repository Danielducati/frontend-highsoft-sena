import { API_URL } from "../constants";
import { Category, CategoryFormData } from "../types";

function getAuthHeaders() {
  const token = localStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
}

export async function fetchCategoriesApi(): Promise<Category[]> {
  const res = await fetch(`${API_URL}/categories?all=true`, {
    headers: getAuthHeaders(),
  });
  
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: "Error al cargar categorías" }));
    throw new Error(err.error || "Error al cargar categorías");
  }
  
  const data = await res.json();
  return data.map((cat: any) => ({
    id:            cat.id ?? cat.PK_id_categoria_servicios,
    name:          cat.nombre ?? cat.Nombre,
    description:   cat.descripcion || "",
    color:         cat.color || "#78D1BD",
    isActive:      (cat.estado ?? cat.Estado) === "Activo",
    servicesCount: cat.servicesCount || 0,
  }));
}

export async function createCategoryApi(formData: CategoryFormData): Promise<void> {
  const res = await fetch(`${API_URL}/categories`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify({
      nombre:      formData.name,
      descripcion: formData.description,
      color:       formData.color,
    }),
  });
  
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: "Error al crear categoría" }));
    throw new Error(err.error || "Error al crear categoría");
  }
}

export async function updateCategoryApi(
  id: number, 
  formData: Partial<CategoryFormData> & { estado?: string | boolean }
): Promise<void> {
  // Convertir boolean a string si viene como boolean
  let estadoFinal: string | undefined;
  
  if (formData.estado !== undefined) {
    if (typeof formData.estado === 'boolean') {
      estadoFinal = formData.estado ? "Activo" : "Inactivo";
    } else {
      estadoFinal = formData.estado;
    }
  }

  const body: any = {};
  if (formData.name !== undefined) body.nombre = formData.name;
  if (formData.description !== undefined) body.descripcion = formData.description;
  if (formData.color !== undefined) body.color = formData.color;
  if (estadoFinal !== undefined) body.estado = estadoFinal;

  console.log("Body a enviar:", JSON.stringify(body, null, 2)); // DEBUG

  const res = await fetch(`${API_URL}/categories/${id}`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify(body),
  });
  
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: "Error al actualizar categoría" }));
    throw new Error(err.error || "Error al actualizar categoría");
  }
}

export async function deleteCategoryApi(id: number): Promise<void> {
  const res = await fetch(`${API_URL}/categories/${id}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });
  
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: "Error al eliminar categoría" }));
    throw new Error(err.error || "Error al eliminar categoría");
  }
}