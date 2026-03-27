export type UserRole = "admin" | "employee" | "client";

export interface LoginPageProps {
  onLogin: (role: UserRole) => void;
  onBack: () => void;
}

export interface RegisterPageProps {
  onBack: () => void;
  onRegisterSuccess: () => void;
}

export interface RegisterFormData {
  fullName: string;
  apellido: string;
  email: string;
  phone: string;
  tipocedula: string;
  cedula: string;
  password: string;
  confirmPassword: string;
}