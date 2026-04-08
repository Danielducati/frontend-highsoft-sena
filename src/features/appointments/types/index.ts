//frontend-highsoft-sena\src\features\appointments\types\index.ts
export interface Service {
  id: string;
  name: string;
  category: string;
  duration: number;
  price: number;
}

export interface Employee {
  id: string;
  name: string;
  specialty: string;
  color: string;
}

export interface Client {
  id: number;
  name: string;
  phone: string;
}

export interface AppointmentService {
  serviceId: string;
  serviceName: string;
  employeeId: string;
  employeeName: string;
  duration: number;
  startTime: string;
}

export interface Appointment {
  id: number;
  clientName: string;
  clientPhone: string;
  date: Date;
  services: AppointmentService[];
  totalDuration: number;
  startTime: string;
  endTime: string;
  status: "pending" | "cancelled" | "completed";
  notes?: string;
}

export interface AppointmentsModuleProps {
  userRole: "admin" | "employee" | "client";
}

export interface FormData {
  clientId: string;
  clientName: string;
  clientPhone: string;
  date: Date;
  startTime: string;
  notes: string;
}

export interface CurrentService {
  serviceId: string;
  employeeId: string;
}