import { API_URL } from "../constants";
import { Quotation, QuotationStatus } from "../types";

const getToken = () => localStorage.getItem("token");

export async function fetchMyProfileApi(): Promise<{ id: number; nombre: string; apellido: string }> {
  const res = await fetch(`${API_URL}/clients/mi-perfil`, {
    headers: { Authorization: `Bearer ${getToken()}` },
  });
  if (!res.ok) throw new Error("Error al cargar perfil");
  const data = await res.json();
  return {
    id:       data.PK_id_cliente ?? data.id,
    nombre:   data.nombre,
    apellido: data.apellido,
  };
}

export async function fetchQuotationsApi(): Promise<Quotation[]> {
  const res = await fetch(`${API_URL}/quotations`, {
    headers: { Authorization: `Bearer ${getToken()}` },
  });
  if (!res.ok) throw new Error("Error al cargar cotizaciones");
  return res.json();
}

export async function fetchClientsApi(): Promise<any[]> {
  const token = getToken();
  const res = await fetch(`${API_URL}/clients`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("Error al cargar clientes");
  const data = await res.json();
  return data.map((c: any) => ({
    ...c,
    id: c.id ?? c.PK_id_cliente,
  }));
}

export async function fetchServicesApi(): Promise<any[]> {
  const res = await fetch(`${API_URL}/services`, {
    headers: { Authorization: `Bearer ${getToken()}` },
  });
  if (!res.ok) throw new Error("Error al cargar servicios");
  return res.json();
}

export async function createQuotationApi(body: any): Promise<void> {
  const res = await fetch(`${API_URL}/quotations`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${getToken()}` },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error("Error al crear cotización");
}

export async function updateQuotationApi(id: number, body: any): Promise<void> {
  const res = await fetch(`${API_URL}/quotations/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${getToken()}` },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error("Error al actualizar cotización");
}

export async function updateQuotationStatusApi(id: number, status: QuotationStatus): Promise<void> {
  const res = await fetch(`${API_URL}/quotations/${id}/estado`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${getToken()}` },
    body: JSON.stringify({ estado: status }),
  });
  if (!res.ok) throw new Error("Error al actualizar estado");
}