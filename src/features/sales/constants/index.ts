import { SaleFormData } from "../types";

export const API_URL = "http://localhost:3001";

export const PAYMENT_METHODS = [
  "Efectivo",
  "Tarjeta",
  "Transferencia",
  "Nequi",
  "Daviplata",
] as const;

export const EMPTY_FORM: SaleFormData = {
  appointmentId:    null,
  clienteId:        "",
  clientName:       "",
  apellido_cliente: "",
  telefono_cliente: "",
  selectedServices: [],
  discount:         "0",
  paymentMethod:    "Efectivo",
  guestMode:        false,
  guestDocType:     "",
  guestDoc:         "",
  guestDV:          "",
  guestFirstName:   "",
  guestLastName:    "",
  guestEmail:       "",
  guestPhone:       "",
};