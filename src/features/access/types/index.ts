export interface AccessPermission {
  id: number;
  name: string;
  description: string;
  module: string;
  action: string;
  isActive: boolean;
  createdAt: string;
  rolesCount: number;
}

export interface AccessModuleProps {
  userRole: 'admin' | 'employee' | 'client';
}

export interface PermissionFormData {
  name: string;
  description: string;
  module: string;
  action: string;
}