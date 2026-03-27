import { API_URL } from "../constants";
import { Employee } from "../types";

const getToken = () => localStorage.getItem("token");

function getAuthHeaders() {
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${getToken()}`,
  };
}

export async function fetchEmployeesApi(): Promise<Employee[]> {
  const res = await fetch(`${API_URL}/employees?all=true`, {
    headers: { Authorization: `Bearer ${getToken()}` },
  });
  if (!res.ok) throw new Error("Error al cargar empleados");
  const data = await res.json();
  return data.map((e: any) => ({
    id:              e.id,
    name:            e.name || `${e.nombre} ${e.apellido}`,
    nombre:          e.nombre        || "",
    apellido:        e.apellido      || "",
    email:           e.email         || e.correo       || "",
    phone:           e.phone         || e.telefono     || "",
    specialty:       e.specialty     || e.especialidad || "",
    tipoDocumento:   e.tipoDocumento  || e.tipo_documento   || "",
    numeroDocumento: e.numeroDocumento || e.numero_documento || "",
    ciudad:          e.ciudad        || "",
    direccion:       e.direccion     || "",
    image:      e.fotoPerfil    || e.foto_perfil  || "",
    isActive: e.isActive !== undefined ? e.isActive : (e.estado ?? e.Estado) === "Activo",
    estado:          e.estado        || e.Estado       || "Activo",
    color:           e.color         || "#78D1BD",
  }));
}

export async function createEmployeeApi(body: any): Promise<void> {
  const res = await fetch(`${API_URL}/employees`, {
    method:  "POST",
    headers: getAuthHeaders(),
    body:    JSON.stringify(body),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || "Error al crear empleado");
  }
}

export async function updateEmployeeApi(id: number, body: any): Promise<void> {
  const res = await fetch(`${API_URL}/employees/${id}`, {
    method:  "PUT",
    headers: getAuthHeaders(),
    body:    JSON.stringify(body),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || "Error al actualizar empleado");
  }
}

export async function deleteEmployeeApi(id: number): Promise<void> {
  const res = await fetch(`${API_URL}/employees/${id}`, {
    method:  "DELETE",
    headers: { Authorization: `Bearer ${getToken()}` },
  });
  if (!res.ok) throw new Error("Error al eliminar empleado");
}