export type QuotationStatus = "pending" | "approved" | "rejected" | "cancelled" | "expired";

export interface QuotationItem {
  serviceId: number;
  serviceName: string;
  price: number;
  quantity: number;
  empleadoId?: number;
  empleadoName?: string;
}

export interface Quotation {
  FK_id_cliente: any;
  id: number;
  clientName: string;
  clientEmail: string;
  date: string;
  items: QuotationItem[];
  subtotal: number;
  discount: number;
  total: number;
  status: QuotationStatus;
  notes: string;
  startTime?: string;
}

export interface QuotationFormData {
  clientId: string;
  date: string;
  startTime: string;
  notes: string;
  selectedServices: QuotationItem[];
  discount: string;
  // Cliente ocasional
  guestMode?:      boolean;
  guestFirstName?: string;
  guestLastName?:  string;
  guestPhone?:     string;
  guestEmail?:     string;
}

export interface QuotationsModuleProps {
  userRole: "admin" | "employee" | "client";
}