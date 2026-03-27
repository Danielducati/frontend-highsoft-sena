import { Key } from "react";

export interface User {
  photo: string;
  document: string;
  documentType: string;
  id: number;
  name: string;
  email: string;
  phone: string;
  role: string;
  roleId: number;
  isActive: boolean;
  tipo_documento: string;
  numero_documento: string;
  foto_perfil: string;
  assignedServices: string[];
  createdAt: string;
  lastLogin: string;
}

export interface Role {
  id: Key | null | undefined;
  PK_id_rol: number;
  Nombre: string;
  Estado: string;
}

export interface UserFormData {
  firstName: string;
  lastName: string;
  documentType: string;
  document: string;
  email: string;
  phone: string;
  roleId: string;
  image: string;
}

export interface UsersModuleProps {
  userRole: "admin" | "employee" | "client";
}