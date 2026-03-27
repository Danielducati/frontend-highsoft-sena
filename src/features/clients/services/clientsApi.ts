import { API_URL } from "../constants";
import { Client, ClientFormData } from "../types";

const getToken = () => localStorage.getItem("token");

function getAuthHeaders() {
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${getToken()}`,
  };
}

function mapClient(c: any): Client {
  return {
    id:               c.id ?? c.PK_id_cliente,
    firstName:        c.firstName ?? c.nombre ?? "",
    lastName:         c.lastName  ?? c.apellido ?? "",
    name:             c.name ?? `${c.nombre ?? ""} ${c.apellido ?? ""}`.trim(),
    email:            c.email   ?? c.correo    ?? "",
    phone:            c.phone   ?? c.telefono  ?? "",
    address:          c.address ?? c.direccion ?? "",
    tipo_documento:   c.tipo_documento   ?? c.tipoDocumento   ?? "",
    numero_documento: c.numero_documento ?? c.numeroDocumento ?? "",
    image:            c.image ?? c.foto_perfil ?? c.fotoPerfil ?? "",
    isActive: c.isActive !== undefined ? c.isActive : (c.Estado ?? c.estado) === "Activo",  
    totalVisits:      c.totalVisits ?? 0,
    totalSpent:       c.totalSpent  ?? 0,
    lastVisit:        c.lastVisit   ?? "-",
  };
}

export const clientsApi = {
  async getAll(): Promise<Client[]> {
    const res = await fetch(`${API_URL}/clients`, {
      headers: { Authorization: `Bearer ${getToken()}` },
    });
    if (!res.ok) throw new Error("Error al cargar clientes");
    const data = await res.json();
    return data.map(mapClient);
  },

  async create(data: ClientFormData): Promise<Client> {
    const res = await fetch(`${API_URL}/clients`, {
      method:  "POST",
      headers: getAuthHeaders(),
      body:    JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error ?? "Error al crear cliente");
    }
    const created = await res.json();
    return mapClient(created);
  },

  async update(id: number, data: Partial<ClientFormData>): Promise<Client> {
    const res = await fetch(`${API_URL}/clients/${id}`, {
      method:  "PUT",
      headers: getAuthHeaders(),
      body:    JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error ?? "Error al actualizar cliente");
    }
    const updated = await res.json();
    return mapClient(updated);
  },

  async toggleStatus(id: number, isActive: boolean): Promise<void> {
    const res = await fetch(`${API_URL}/clients/${id}/status`, {
      method:  "PATCH",
      headers: getAuthHeaders(),
      body:    JSON.stringify({ isActive }),
    });
    if (!res.ok) throw new Error("Error al cambiar estado");
  },

  async remove(id: number): Promise<void> {
    const res = await fetch(`${API_URL}/clients/${id}`, {
      method:  "DELETE",
      headers: { Authorization: `Bearer ${getToken()}` },
    });
    if (!res.ok) throw new Error("Error al eliminar cliente");
  },
};