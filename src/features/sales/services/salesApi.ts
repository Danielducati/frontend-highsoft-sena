import { API_URL } from "../constants";
import { Appointment, Sale, SaleFormData } from "../types";
import { getToken } from "../utils";

function getAuthHeaders() {
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${getToken()}`,
  };
}

function capitalize(str: string): string {
  if (!str) return str;
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

function mapSale(s: any): Sale {
  return {
    id:          s.id          ?? s.PK_id_venta_encabezado,
    Cliente:     s.Cliente     ?? s.cliente     ?? "—",
    Servicio:    s.Servicio    ?? s.servicio     ?? "—",
    Cantidad:    s.Cantidad    ?? s.cantidad     ?? 1,
    Precio:      Number(s.Precio   ?? s.precio   ?? 0),
    Subtotal:    Number(s.Subtotal ?? s.subtotal ?? 0),
    metodo_pago: capitalize(s.metodo_pago ?? s.metodoPago ?? ""),
    descuento:   Number(s.descuento ?? 0),
    Total:       Number(s.Total     ?? s.total   ?? 0),
    Fecha:       s.Fecha       ?? s.fecha        ?? null,
    Estado:      s.Estado      ?? s.estado       ?? "Activo",
  };
}

export const salesApi = {
  async getSales(): Promise<Sale[]> {
    const res = await fetch(`${API_URL}/sales`, {
      headers: { Authorization: `Bearer ${getToken()}` },
    });
    if (!res.ok) throw new Error("Error al cargar ventas");
    const data = await res.json();
    return Array.isArray(data) ? data.map(mapSale) : [];
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

  async getEmployees(): Promise<any[]> {
    const res = await fetch(`${API_URL}/employees`, {
      headers: { Authorization: `Bearer ${getToken()}` },
    });
    if (!res.ok) throw new Error("Error al cargar empleados");
    const data = await res.json();
    return data
      .filter((e: any) => (e.estado ?? e.Estado) === "Activo" || e.isActive)
      .map((e: any) => ({
        id:        e.id,
        name:      e.name ?? `${e.nombre ?? ""} ${e.apellido ?? ""}`.trim(),
        specialty: e.specialty ?? e.especialidad ?? "",
      }));
  },

  async create(formData: SaleFormData, saleType: "appointment" | "direct"): Promise<void> {
    const body: any = {
      tipo: saleType === "appointment" ? "cita" : "directo",
      clienteId: formData.clienteId ? Number(formData.clienteId) : null,
      servicios: formData.selectedServices.map(s => ({
        id:         s.serviceId,
        precio:     s.price,
        qty:        s.quantity,
        empleadoId: s.employeeId ?? null,
      })),
      metodoPago: formData.paymentMethod?.toLowerCase(),
      descuento:  parseFloat(formData.discount) || 0,
      ...(saleType === "appointment" && { citaId: formData.appointmentId }),
    };

    // Cliente ocasional
    if (formData.guestMode && formData.guestFirstName) {
      const docFinal = formData.guestDocType === "NIT" && formData.guestDV?.trim()
        ? `${formData.guestDoc}-${formData.guestDV.trim()}`
        : formData.guestDoc || null;

      body.clienteOcasional = {
        firstName:    formData.guestFirstName.trim(),
        lastName:     formData.guestLastName?.trim()  || "",
        documentType: formData.guestDocType           || null,
        document:     docFinal,
        email:        formData.guestEmail?.trim()     || null,
        phone:        formData.guestPhone?.trim()     || null,
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
  }
}
