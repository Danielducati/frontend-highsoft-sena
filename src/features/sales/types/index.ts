export interface SaleItem {
  serviceId:   number;
  serviceName: string;
  price:       number;
  quantity:    number;
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

export interface Appointment {
  id:           number;
  clientName:   string;
  service:      string;
  date:         string;
  time:         string;
  status:       string;
  precio?:      number;
  id_servicio?: number;
}

export interface SaleFormData {
  appointmentId:    number | null;
  clienteId:        string;
  clientName:       string;
  apellido_cliente: string;
  telefono_cliente: string;
  selectedServices: SaleItem[];
  discount:         string;
  paymentMethod:    string;
}

export interface SalesModuleProps {
  userRole: "admin" | "employee" | "client";
}