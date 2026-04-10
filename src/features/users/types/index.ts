// src/features/users/types/index.ts
export interface User {
  id:               number;
  name:             string;
  email:            string;
  phone:            string;
  role:             string;
  roleId:           number;
  rolId:            number;
  isActive:         boolean;
  firstName:        string;
  lastName:         string;
  documentType:     string;
  document:         string;
  specialty:        string;
  photo:            string;
  assignedServices: string[];
  createdAt:        string;
  lastLogin:        string;
}

export interface Role {
  id:     number;
  nombre: string;
  estado: string;
}

export interface UserFormData {
  firstName:    string;
  lastName:     string;
  documentType: string;
  document:     string;
  email:        string;
  phone:        string;
  roleId:       string;
  image:        string;
  contrasena?:  string;
}

export interface UsersModuleProps {
  userRole: "admin" | "employee" | "client";
}