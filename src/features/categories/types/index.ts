export interface Category {
  id: number;
  name: string;
  description: string;
  servicesCount: number;
  isActive: boolean;
  color: string;
}

export interface CategoryFormData {
  name: string;
  description: string;
  color: string;
}

export interface CategoriesModuleProps {
  userRole: "admin" | "employee" | "client";
}