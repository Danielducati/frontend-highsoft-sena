export interface Client {
  id:               number;
  // Nombre completo (para mostrar en tabla)
  name:             string;
  // Campos separados que devuelve el backend (formatClient)
  firstName?:       string;
  lastName?:        string;
  tipo_documento?:  string;
  numero_documento?: string;
  image?:           string;
  // Contacto
  email:            string;
  phone:            string;
  address:          string;
  // Estado y métricas
  isActive:         boolean;
  registeredDate?:  string;
  totalVisits:      number;
  totalSpent:       number;
  lastVisit:        string;
}

export interface ClientFormData {
  firstName:          string;
  lastName:           string;
  documentType:       string;
  document:           string;
  email:              string;
  phone:              string;
  address:            string;
  image:              string;
  contrasena?:        string;
  // Campos exclusivos NIT
  razonSocial?:       string;
  representanteLegal?: string;
  digitoVerificacion?: string;
}

export interface ClientsModuleProps {
  userRole: "admin" | "employee" | "client";
}