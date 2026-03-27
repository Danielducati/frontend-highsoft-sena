import { useState } from "react";
import { toast } from "sonner";
import { AccessPermission, PermissionFormData } from "../types";
import { INITIAL_PERMISSIONS } from "../constants/index";

const normalize = (v: string) => v.trim().replace(/\s+/g, " ");

export function usePermissions() {
  const [permissions, setPermissions] = useState<AccessPermission[]>(INITIAL_PERMISSIONS);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterModule, setFilterModule] = useState("all");
  const [filterAction, setFilterAction] = useState("all");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [editingPermission, setEditingPermission] = useState<AccessPermission | null>(null);
  const [viewingPermission, setViewingPermission] = useState<AccessPermission | null>(null);
  const [formData, setFormData] = useState<PermissionFormData>({
    name: "",
    description: "",
    module: "",
    action: "",
  });

  const filteredPermissions = permissions.filter((permission) => {
    const matchesSearch =
      permission.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      permission.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesModule = filterModule === "all" || permission.module === filterModule;
    const matchesAction = filterAction === "all" || permission.action === filterAction;
    return matchesSearch && matchesModule && matchesAction;
  });

  const handleCreateOrUpdate = () => {
    const name = normalize(formData.name);
    const description = normalize(formData.description);
    const module = formData.module.trim();
    const action = formData.action.trim();

    if (!name || !description || !module || !action) {
      toast.error("Por favor completa todos los campos requeridos");
      return;
    }

    if (name.length < 3) {
      toast.error("El nombre del permiso es muy corto");
      return;
    }

    const duplicate = permissions.find(p =>
      p.module === module &&
      p.action === action &&
      p.name.toLowerCase() === name.toLowerCase() &&
      (!editingPermission || p.id !== editingPermission.id)
    );
    if (duplicate) {
      toast.error("Ya existe un permiso con el mismo nombre, módulo y acción");
      return;
    }

    if (editingPermission) {
      setPermissions(
        permissions.map((p) =>
          p.id === editingPermission.id ? { ...p, name, description, module, action } : p
        )
      );
      toast.success("Permiso actualizado exitosamente");
    } else {
      const newPermission: AccessPermission = {
        id: Math.max(...permissions.map((p) => p.id), 0) + 1,
        name,
        description,
        module,
        action,
        isActive: true,
        createdAt: new Date().toISOString().split("T")[0],
        rolesCount: 0,
      };
      setPermissions([...permissions, newPermission]);
      toast.success("Permiso creado exitosamente");
    }

    resetForm();
  };

  const resetForm = () => {
    setIsDialogOpen(false);
    setEditingPermission(null);
    setFormData({ name: "", description: "", module: "", action: "" });
  };

  const handleDelete = (id: number) => {
    const permission = permissions.find((p) => p.id === id);
    if (permission && permission.rolesCount > 0) {
      toast.error(
        `No se puede eliminar "${permission.name}" porque está asignado a ${permission.rolesCount} rol(es)`
      );
      return;
    }
    setPermissions(permissions.filter((p) => p.id !== id));
    toast.success("Permiso eliminado exitosamente");
  };

  const handleEdit = (permission: AccessPermission) => {
    setEditingPermission(permission);
    setFormData({
      name: permission.name,
      description: permission.description,
      module: permission.module,
      action: permission.action,
    });
    setIsDialogOpen(true);
  };

  const handleToggleStatus = (id: number) => {
    setPermissions(
      permissions.map((p) => (p.id === id ? { ...p, isActive: !p.isActive } : p))
    );
    toast.success("Estado actualizado");
  };

  const handleViewPermission = (permission: AccessPermission) => {
    setViewingPermission(permission);
    setIsViewDialogOpen(true);
  };

  const handleNewPermission = () => {
    setEditingPermission(null);
    setFormData({ name: "", description: "", module: "", action: "" });
    setIsDialogOpen(true);
  };

  return {
    permissions,
    filteredPermissions,
    searchTerm,
    setSearchTerm,
    filterModule,
    setFilterModule,
    filterAction,
    setFilterAction,
    isDialogOpen,
    setIsDialogOpen,
    isViewDialogOpen,
    setIsViewDialogOpen,
    editingPermission,
    viewingPermission,
    formData,
    setFormData,
    handleCreateOrUpdate,
    handleDelete,
    handleEdit,
    handleToggleStatus,
    handleViewPermission,
    handleNewPermission,
    resetForm,
  };
}