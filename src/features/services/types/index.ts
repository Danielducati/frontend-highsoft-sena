export interface Service {
  id: number;
  name: string;
  description: string;
  duration: number;
  price: number;
  category: string;
  categoryId: number;
  image: string;
  isActive: boolean;
}

export interface ServiceFormData {
  name: string;
  description: string;
  duration: number;
  price: number;
  category: string;
  image: string;
  FK_categoria_servicios: string;
}

export interface ServicesModuleProps {
  userRole: "admin" | "employee" | "client";
}