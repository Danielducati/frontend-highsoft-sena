// src/features/roles/types/index.ts
export interface Permission {
  id: string;
  nombre: string;
  category?: string; 
}

export interface Role {
  id: number;
  nombre: string;
  descripcion: string;
  permisos: Permission[];
  isActive: boolean;
  estado: string;
}