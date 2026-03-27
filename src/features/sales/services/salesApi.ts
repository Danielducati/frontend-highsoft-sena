import { API_URL } from "../constants";
import { Appointment, Sale, SaleFormData } from "../types";
import { getToken } from "../utils";

function getAuthHeaders() {
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${getToken()}`,
  };
}

export const salesApi = {
  async getSales(): Promise<Sale[]> {
    const res = await fetch(`${API_URL}/sales`, {
      headers: { Authorization: `Bearer ${getToken()}` },
    });
    if (!res.ok) throw new Error("Error al cargar ventas");
    return res.json();
  },

  async getAppointments(): Promise<Appointment[]> {
    const res = await fetch(`${API_URL}/sales/appointments`, {
      headers: { Authorization: `Bearer ${getToken()}` },
    });
    if (!res.ok) throw new Error("Error al cargar citas");
    return res.json();
  },

  async getServices(): Promise<any[]> {
    const res = await fetch(`${API_URL}/services`, {
      headers: { Authorization: `Bearer ${getToken()}` },
    });
    if (!res.ok) throw new Error("Error al cargar servicios");
    const data = await res.json();
    return data.filter((s: any) => s.isActive || s.estado === "Activo");
  },

  async getClients(): Promise<any[]> {
    const res = await fetch(`${API_URL}/clients`, {
      headers: { Authorization: `Bearer ${getToken()}` },
    });
    if (!res.ok) throw new Error("Error al cargar clientes");
    const data = await res.json();
    return data.map((c: any) => ({
      id:   c.id ?? c.PK_id_cliente,
      name: c.name ?? `${c.nombre ?? ""} ${c.apellido ?? ""}`.trim(),
    }));
  },

  async create(formData: SaleFormData, saleType: "appointment" | "direct"): Promise<void> {
    let body: any;

    if (saleType === "appointment") {
      body = {
        tipo:       "cita",
        citaId:     formData.appointmentId,
        metodoPago: formData.paymentMethod,
        descuento:  parseFloat(formData.discount) || 0,
      };
    } else {
      body = {
        tipo:       "directo",
        clienteId:  formData.clienteId ? Number(formData.clienteId) : null,
        servicios:  formData.selectedServices.map(s => ({
          id:     s.serviceId,
          precio: s.price,
          qty:    s.quantity,
        })),
        metodoPago: formData.paymentMethod,
        descuento:  parseFloat(formData.discount) || 0,
      };
    }

    const res = await fetch(`${API_URL}/sales`, {
      method:  "POST",
      headers: getAuthHeaders(),
      body:    JSON.stringify(body),
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || "Error al registrar venta");
    }
  },
};