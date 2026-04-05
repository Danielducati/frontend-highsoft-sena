import { useState } from "react";
import { Badge } from "../../../shared/ui/badge";
import { Plus, Pencil, Trash2, Search, Shield, Eye, Lock } from "lucide-react";
import { toast } from "sonner";
import { Role } from "../types";
import { useRoles } from "../hooks/useRoles";
import { groupPermissionsByCategory } from "../utils";
import { RoleFormDialog }   from "../components/RoleFormDialog";
import { RoleViewDialog }   from "../components/RoleViewDialog";
import { RoleDeleteDialog } from "../components/RoleDeleteDialog";
import { SpaPage } from "../../../shared/components/layout/SpaPage";

interface RolesModuleProps {
  userRole: "admin" | "employee" | "client";
}

export function RolesPage({ userRole }: RolesModuleProps) {
  const { roles, availablePermissions, loading, createRole, updateRole, deleteRole } = useRoles();

  const [searchTerm,       setSearchTerm]       = useState("");
  const [isDialogOpen,     setIsDialogOpen]     = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editingRole,      setEditingRole]      = useState<Role | null>(null);
  const [viewingRole,      setViewingRole]      = useState<Role | null>(null);
  const [roleToDelete,     setRoleToDelete]     = useState<number | null>(null);

  const [formData, setFormData] = useState({
    nombre: "", descripcion: "", permisosIds: [] as number[],
  });

  const groupedPermissions = groupPermissionsByCategory(availablePermissions);

  const filteredRoles = roles.filter(r =>
    r.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.descripcion?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const closeDialog = () => {
    setIsDialogOpen(false);
    setEditingRole(null);
    setFormData({ nombre: "", descripcion: "", permisosIds: [] });
  };

  const handleSubmit = async () => {
  const nombre = formData.nombre.trim();
  const descripcion = formData.descripcion.trim();

  if (!nombre || !descripcion) {
    toast.error("Por favor completa todos los campos requeridos");
    return;
  }
  if (formData.permisosIds.length === 0) {
    toast.error("Debes asignar al menos un permiso al rol");
    return;
  }
  if (nombre.length < 3) {
    toast.error("El nombre del rol es muy corto");
    return;
  }
  const duplicate = roles.find(r =>
    (r.nombre ?? "").trim().toLowerCase() === nombre.toLowerCase() &&
    (!editingRole || r.id !== editingRole.id)
  );
  if (duplicate) {
    toast.error("Ya existe un rol con ese nombre");
    return;
  }
  try {
    if (editingRole) {
      await updateRole(editingRole.id, { ...formData, nombre, descripcion });
    } else {
      await createRole({ ...formData, nombre, descripcion });
    }
    closeDialog();
  } catch (err: any) {
    toast.error(err.message ?? "Error al guardar el rol"); // ← ya muestra el mensaje del backend
  }
};

  const handleEdit = (role: Role) => {
    setEditingRole(role);
    setFormData({
      nombre:      role.nombre,
      descripcion: role.descripcion,
      permisosIds: role.permisos.map(p => Number(p.id)),
    });
    setIsDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!roleToDelete) return;
    try {
      await deleteRole(roleToDelete);
    } catch (err: any) {
      toast.error(err.message ?? "Error al eliminar el rol");
    } finally {
      setDeleteDialogOpen(false);
      setRoleToDelete(null);
    }
  };

  return (
    <SpaPage
      title="Gestión de Roles"
      subtitle={`${roles.length} roles • ${roles.filter(r => r.isActive).length} activos`}
      icon={<Shield className="w-6 h-6" style={{ color: "#1a3a2a" }} />}
      action={
        userRole === "admin" ? (
          <button
            onClick={() => { closeDialog(); setIsDialogOpen(true); }}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              padding: "10px 20px",
              borderRadius: 10,
              backgroundColor: "#1a3a2a",
              color: "#ffffff",
              fontSize: 14,
              fontWeight: 600,
              fontFamily: "var(--font-body)",
              border: "none",
              cursor: "pointer",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#2a5a40")}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#1a3a2a")}
          >
            <Plus className="w-4 h-4" />
            Nuevo Rol
          </button>
        ) : null
      }
    >
      <div className="space-y-4">

      {/* Search */}
      <div className="flex flex-col sm:flex-row gap-3 mb-2" style={{ fontFamily: "var(--font-body)" }}>
        <div
          className="flex items-center gap-2 px-4 py-2 rounded-full border flex-1"
          style={{ backgroundColor: "#ffffff", borderColor: "#d6cfc4", maxWidth: 380 }}
        >
          <Search className="w-4 h-4 flex-shrink-0" style={{ color: "#6b7c6b" }} />
          <input
            placeholder="Buscar roles..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-transparent outline-none text-sm w-full"
            style={{ color: "#1a3a2a" }}
          />
        </div>
      </div>

      {loading ? (
        <p className="text-center py-12 text-sm" style={{ color: "#6b7c6b", fontFamily: "var(--font-body)" }}>
          Cargando roles...
        </p>
      ) : filteredRoles.length === 0 ? (
        <div className="flex flex-col items-center py-16" style={{ fontFamily: "var(--font-body)" }}>
          <Shield className="w-10 h-10 mb-3" style={{ color: "#d6cfc4" }} />
          <p className="font-medium" style={{ color: "#1a3a2a" }}>No se encontraron roles</p>
          <p className="text-sm mt-1" style={{ color: "#6b7c6b" }}>
            Intenta ajustar los filtros de búsqueda
          </p>
        </div>
      ) : (
        <div className="rounded-2xl overflow-hidden shadow-sm" style={{ backgroundColor: "#ffffff" }}>
          <table className="w-full" style={{ fontFamily: "var(--font-body)" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid #ede8e0" }}>
                {["ROL", "DESCRIPCIÓN", "PERMISOS", "ESTADO", "ACCIONES"].map((col) => (
                  <th key={col} className="px-6 py-4 text-left text-xs font-semibold tracking-widest" style={{ color: "#6b7c6b" }}>
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredRoles.map((role, idx) => (
                <tr
                  key={role.id}
                  style={{ borderBottom: idx < filteredRoles.length - 1 ? "1px solid #ede8e0" : "none", transition: "background 0.15s" }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#faf7f2")}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-9 h-9 rounded-lg flex items-center justify-center text-white flex-shrink-0" style={{ background: "linear-gradient(135deg, #78D1BD, #5FBFAA)" }}>
                        <Shield className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-sm truncate" style={{ color: "#1a3a2a" }}>{role.nombre}</p>
                        <p className="text-xs truncate" style={{ color: "#6b7c6b" }}>{role.descripcion}</p>
                      </div>
                    </div>
                  </td>

                  <td className="px-6 py-4">
                    <p className="text-xs line-clamp-2" style={{ color: "#6b7c6b" }}>
                      {role.descripcion}
                    </p>
                  </td>

                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <Lock className="w-3.5 h-3.5" style={{ color: "#6b7c6b" }} />
                      <span style={{ display: "inline-flex", padding: "3px 12px", borderRadius: 999, fontSize: 11, fontWeight: 600, letterSpacing: "0.04em", backgroundColor: "#edf7f4", color: "#1a5c3a" }}>
                        {role.permisos?.length ?? 0} permisos
                      </span>
                    </div>
                  </td>

                  <td className="px-6 py-4">
                    <span style={{ display: "inline-flex", padding: "3px 12px", borderRadius: 999, fontSize: 11, fontWeight: 600, letterSpacing: "0.04em", backgroundColor: role.isActive ? "#edf7f4" : "#f3f4f6", color: role.isActive ? "#1a5c3a" : "#6b7280" }}>
                      {role.isActive ? "Activo" : "Inactivo"}
                    </span>
                  </td>

                  <td className="px-6 py-4">
                    {userRole === "admin" ? (
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => { setViewingRole(role); setIsViewDialogOpen(true); }}
                          title="Ver detalles"
                          className="p-2 rounded-lg transition-colors"
                          style={{ color: "#6b7c6b" }}
                          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#f0ebe3")}
                          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleEdit(role)}
                          title="Editar"
                          className="p-2 rounded-lg transition-colors"
                          style={{ color: "#6b7c6b" }}
                          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#f0ebe3")}
                          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => { setRoleToDelete(role.id); setDeleteDialogOpen(true); }}
                          title="Eliminar"
                          className="p-2 rounded-lg transition-colors"
                          style={{ color: "#c0392b" }}
                          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#fdf2f2")}
                          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ) : null}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <RoleFormDialog
        open={isDialogOpen}
        onClose={closeDialog}
        onSubmit={handleSubmit}
        isEditing={!!editingRole}
        formData={formData}
        setFormData={setFormData}
        groupedPermissions={groupedPermissions}
      />
      <RoleViewDialog
        open={isViewDialogOpen}
        onClose={() => setIsViewDialogOpen(false)}
        role={viewingRole}
      />
      <RoleDeleteDialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={handleConfirmDelete}
      />
      </div>
    </SpaPage>
  );
}
