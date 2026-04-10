export interface SaleItem {
  serviceId:   number;
  serviceName: string;
  price:       number;
  quantity:    number;
  employeeId?:   number | null;
  employeeName?: string;
}

export interface Sale {
  id:          number;
  Cliente:     string;
  Servicio:    string;
  Cantidad:    number;
  Precio:      number;
  Subtotal:    number;
  metodo_pago: string;
  descuento:   number;
  Total:       number;
  Iva:         number;
  Fecha:       string;
  Estado:      string;
}

export interface AppointmentService {   // ✅ agrega export
  serviceId: string;
  serviceName: string;
  employeeId: string;
  employeeName: string;
  duration: number;
  startTime: string;
}

export interface AppointmentItem {      // ✅ agrega export
  servicioId: number;
  nombre: string;
  precio: number;
  cantidad: number;
}

export interface Appointment {
  id: number;
  clienteId: number;        // ✅ agrega esto

  clientName: string;
  clientPhone: string;

  date: Date;
  time: string;             // ✅ reemplaza startTime/endTime por time (lo que manda el backend)
  startTime?: string;       // opcional para compatibilidad
  endTime?: string;         // opcional para compatibilidad

  status: "pending" | "cancelled" | "completed";
  notes?: string;

  service?: string;         // ✅ agrega esto (nombre del servicio como string)
  price?: number;           // ✅ agrega esto (precio total)

  services?: AppointmentService[];
  items: AppointmentItem[];  // ✅ agrega esto
}

export interface SaleFormData {
  appointmentId:    number | null;
  clienteId:        string | Number;
  clientName:       string;
  apellido_cliente: string;
  telefono_cliente: string;
  selectedServices: SaleItem[];
  discount:         string;
  paymentMethod:    string;
  // Cliente ocasional (no registrado)
  guestMode?:       boolean;
  guestDocType?:    string;
  guestDoc?:        string;
  guestDV?:         string;
  guestFirstName?:  string;
  guestLastName?:   string;
  guestEmail?:      string;
  guestPhone?:      string;
}

export interface SalesModuleProps {
  userRole: "admin" | "employee" | "client";
}