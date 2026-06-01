export interface Category {
  id: number;
  name: string;
  description: string;
  servicesCount: number;
  isActive: boolean;
  color: string;
  rolId?: number | null;
  rolNombre?: string;
}

export interface CategoryFormData {
  name: string;
  description: string;
  color: string;
  rolId?: string;
}

export interface CategoriesModuleProps {
  userRole: "admin" | "employee" | "client";
}