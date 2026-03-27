// src/features/roles/hooks/useRoles.ts
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Role, Permission } from "../types";
import { rolesService } from "../services";
import { parseCategory } from "../constants";

export function useRoles() {
  const [roles, setRoles]                               = useState<Role[]>([]);
  const [availablePermissions, setAvailablePermissions] = useState<Permission[]>([]);
  const [loading, setLoading]                           = useState(true);

  useEffect(() => {
    fetchRoles();
    fetchPermissions();
  }, []);

  const fetchRoles = async () => {
    try {
      const data = await rolesService.getRoles();
      setRoles(data);
    } catch {
      toast.error("Error al cargar roles");
    } finally {
      setLoading(false);
    }
  };

  const fetchPermissions = async () => {
    try {
      const data = await rolesService.getPermissions();
      const mapped: Permission[] = data.map((p) => ({
        id:       String(p.id),
        nombre:   p.nombre,
        category: parseCategory(p.nombre),
      }));
      setAvailablePermissions(mapped);
    } catch {
      toast.error("Error al cargar permisos");
    }
  };

  const createRole = async (formData: { nombre: string; descripcion: string; permisosIds: number[] }) => {
    await rolesService.createRole(formData);
    toast.success("Rol creado exitosamente");
    await fetchRoles();
  };

  const updateRole = async (id: number, formData: { nombre: string; descripcion: string; permisosIds: number[] }) => {
    await rolesService.updateRole(id, formData);
    toast.success("Rol actualizado exitosamente");
    await fetchRoles();
  };

  const deleteRole = async (id: number) => {
    await rolesService.deleteRole(id);
    toast.success("Rol eliminado exitosamente");
    await fetchRoles();
  };

  return {
    roles, availablePermissions, loading,
    createRole, updateRole, deleteRole,
  };
}