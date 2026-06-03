import { API_URL } from "../constants";
import { Category, CategoryFormData } from "../types";

function getAuthHeaders() {
  const token = localStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
}

// 🔥 Helper para manejar errores correctamente
async function handleError(res: Response, defaultMsg: string) {
  if (!res.ok) {
    const text = await res.text();

    try {
      const err = JSON.parse(text);
      // Priorizar error sobre message para ser consistente con el backend
      const errorMessage = err.error || err.message || defaultMsg;
      throw new Error(errorMessage);
    } catch (e) {
      // Si falla el parse de JSON
      if (e instanceof Error && e.message !== defaultMsg) {
        // Si ya es un Error que lanzamos arriba, relanzarlo
        throw e;
      }
      // 🔥 Si NO es JSON (html, texto, etc)
      // Intentar extraer solo el mensaje sin HTML
      if (text.includes('<')) {
        // Es HTML, solo mostrar el mensaje por defecto
        throw new Error(defaultMsg);
      }
      // Si es texto plano, mostrarlo
      throw new Error(text || defaultMsg);
    }
  }
} 

export async function fetchCategoriesApi(): Promise<Category[]> {
  const res = await fetch(`${API_URL}/categories?all=true`, {
    headers: getAuthHeaders(),
  });

  await handleError(res, "Error al cargar categorías");

  const data = await res.json();

  return data.map((cat: any) => ({
    id:            cat.id ?? cat.PK_id_categoria_servicios,
    name:          cat.nombre ?? cat.Nombre,
    description:   cat.descripcion || "",
    color:         cat.color || "#78D1BD",
    isActive:      (cat.estado ?? cat.Estado) === "Activo",
    servicesCount: cat.servicesCount || 0,
    rolId:         cat.rolId,
    rolNombre:     cat.rolNombre,
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
      rolId:       formData.rolId && formData.rolId !== "" ? Number(formData.rolId) : null,
    }),
  });

  await handleError(res, "Error al crear categoría");
}

export async function updateCategoryApi(
  id: number,
  formData: Partial<CategoryFormData> & { estado?: string | boolean }
): Promise<void> {

  let estadoFinal: string | undefined;

  if (formData.estado !== undefined) {
    if (typeof formData.estado === "boolean") {
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
  if (formData.rolId !== undefined) {
    body.rolId = formData.rolId && formData.rolId !== "" ? Number(formData.rolId) : null;
  }

  console.log("Body a enviar:", JSON.stringify(body, null, 2)); // DEBUG

  const res = await fetch(`${API_URL}/categories/${id}`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify(body),
  });

  await handleError(res, "Error al actualizar categoría");
}

export async function deleteCategoryApi(id: number): Promise<void> {
  const res = await fetch(`${API_URL}/categories/${id}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });

  await handleError(res, "Error al eliminar categoría");
}