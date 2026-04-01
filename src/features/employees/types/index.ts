export interface Employee {
  id: number;

  // Datos reales
  nombre: string;
  apellido: string;
  ciudad?: string;
  direccion?: string;

  // 👇 usa los que realmente devuelve el backend
  tipoDocumento?: string;
  numeroDocumento?: string;

  // 👇 usa los aliases del formatEmployee
  email: string;
  phone: string;
  specialty: string;
  image: string;

  estado: string;
  isActive: boolean;

  // UI
  name: string;
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