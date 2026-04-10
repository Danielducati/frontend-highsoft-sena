// src/features/appointments/services/appointmentsService.ts
import { API_BASE } from "../constants";
import { Appointment } from "../types";
import { mapApiToAppointment } from "../utils";

// Helper — siempre lee el token fresco del localStorage
const authHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${localStorage.getItem("token") ?? ""}`,
});

async function parseJsonOrThrow(res: Response): Promise<unknown> {
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg = typeof (data as { error?: string }).error === "string"
      ? (data as { error: string }).error
      : `Error ${res.status}`;
    throw new Error(msg);
  }
  return data;
}

export async function fetchMyClientProfile(): Promise<{ id: string; name: string; phone: string }> {
  const res = await fetch(`${API_BASE}/clients/mi-perfil`, { headers: authHeaders() });
  const data = await parseJsonOrThrow(res) as any;
  const id = data.PK_id_cliente ? String(data.PK_id_cliente) : "me";
  return {
    id,
    name:  `${data.nombre ?? ""} ${data.apellido ?? ""}`.trim() || data.correo || "Mi perfil",
    phone: data.telefono ?? "",
  };
}

export async function fetchMyEmployeeProfile(): Promise<{ id: string; name: string; phone: string }> {
  const res = await fetch(`${API_BASE}/employees/mi-perfil`, { headers: authHeaders() });
  const data = await parseJsonOrThrow(res) as any;
  return {
    id:    data.id ? String(data.id) : "",
    name:  data.name ?? `${data.nombre ?? ""} ${data.apellido ?? ""}`.trim(),
    phone: data.phone ?? data.telefono ?? "",
  };
}

export async function fetchMyEmployeeAppointments(): Promise<Appointment[]> {
  const res = await fetch(`${API_BASE}/appointments/mis-citas-empleado`, { headers: authHeaders() });
  const data = await parseJsonOrThrow(res);
  if (!Array.isArray(data)) throw new Error("Respuesta inválida del servidor");
  return data.map(mapApiToAppointment);
}

export async function fetchMyAppointments(): Promise<Appointment[]> {
  const res = await fetch(`${API_BASE}/appointments/mis-citas`, { headers: authHeaders() });
  const data = await parseJsonOrThrow(res);
  if (!Array.isArray(data)) throw new Error("Respuesta inválida del servidor");
  return data.map(mapApiToAppointment);
}

export async function fetchAppointments(): Promise<Appointment[]> {
  const res = await fetch(`${API_BASE}/appointments`, { headers: authHeaders() });
  const data = await parseJsonOrThrow(res);
  if (!Array.isArray(data)) throw new Error("Respuesta inválida del servidor");
  return data.map(mapApiToAppointment);
}

export async function fetchServices() {
  const res = await fetch(`${API_BASE}/services`, { headers: authHeaders() });
  return parseJsonOrThrow(res);
}

export async function fetchEmployees() {
  const res = await fetch(`${API_BASE}/employees`, { headers: authHeaders() });
  return parseJsonOrThrow(res);
}

export async function fetchClients() {
  const res = await fetch(`${API_BASE}/clients`, { headers: authHeaders() });
  return parseJsonOrThrow(res);
}

export async function createAppointment(payload: any, isClient = false, isEmployee = false) {
  const endpoint = isClient   ? `${API_BASE}/appointments/mis-citas`         :
                   isEmployee ? `${API_BASE}/appointments/mis-citas-empleado` :
                                `${API_BASE}/appointments`;
  const res = await fetch(endpoint, {
    method:  "POST",
    headers: authHeaders(),
    body:    JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || "Error al crear cita");
  }
  return res.json();
}

export async function updateAppointment(id: number, payload: any) {
  const res = await fetch(`${API_BASE}/appointments/${id}`, {
    method:  "PUT",
    headers: authHeaders(),
    body:    JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || "Error al actualizar cita");
  }
  return res.json();
}

export async function deleteAppointment(id: number) {
  const res = await fetch(`${API_BASE}/appointments/${id}`, {
    method:  "DELETE",
    headers: authHeaders(),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || "Error al eliminar cita");
  }
  return res.json();
}

export async function cancelAppointment(id: number) {
  const res = await fetch(`${API_BASE}/appointments/${id}/cancel`, {
    method:  "PATCH",
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error("Error al cancelar cita");
  return res.json();
}

export async function updateAppointmentStatus(id: number, status: Appointment["status"]) {
  const res = await fetch(`${API_BASE}/appointments/${id}/status`, {
    method:  "PATCH",
    headers: authHeaders(),
    body:    JSON.stringify({ status }),
  });
  if (!res.ok) throw new Error("Error al actualizar estado");
  return res.json();
}