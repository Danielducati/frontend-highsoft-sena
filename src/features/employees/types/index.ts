export interface Employee {
  id: number;
  nombre: string;
  apellido: string;
  tipo_documento?: string;
  numero_documento?: string;
  correo?: string;
  telefono?: string;
  ciudad?: string;
  especialidad?: string;
  direccion?: string;
  foto_perfil?: string;
  Estado: string;
  // campos computados para UI
  name: string;
  email: string;
  phone: string;
  specialty: string;
  image: string;
  isActive: boolean;
}

export interface EmployeeFormData {
  firstName: string;
  lastName: string;
  documentType: string;
  document: string;
  email: string;
  phone: string;
  city: string;
  address: string;
  specialty: string;
  contrasena: string;
  image: string;
}

export interface EmployeesModuleProps {
  userRole: "admin" | "employee" | "client";
}