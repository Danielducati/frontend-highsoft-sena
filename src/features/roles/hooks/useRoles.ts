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
      // Cargar TODOS los roles (activos e inactivos)
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
      if (!Array.isArray(data) || data.length === 0) {
        toast.error("No se encontraron permisos. Verifica la base de datos.");
        return;
      }
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

  const toggleRoleStatus = async (id: number, currentStatus: boolean) => {
    try {
      console.log(`📌 Cambiando estado del rol ${id} de ${currentStatus} a ${!currentStatus}`);
      await rolesService.toggleRoleStatus(id, !currentStatus);
      toast.success(`Rol ${!currentStatus ? "activado" : "desactivado"} exitosamente`);
      await fetchRoles();
    } catch (err: any) {
      console.error("❌ Error al cambiar estado:", err);
      toast.error(err.message ?? "Error al cambiar el estado del rol");
    }
  };

  return {
    roles, availablePermissions, loading,
    createRole, updateRole, deleteRole, toggleRoleStatus,
  };
}