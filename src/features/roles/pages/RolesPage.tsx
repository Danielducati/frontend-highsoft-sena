// src/features/roles/pages/RolesPage.tsx
import { useState } from "react";
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
  const { roles, availablePermissions, loading, createRole, updateRole, deleteRole, toggleRoleStatus } = useRoles();

  const [searchTerm,       setSearchTerm]       = useState("");
  const [filterStatus,     setFilterStatus]     = useState("all");
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

  const filteredRoles = roles.filter(r => {
    const matchesSearch =
      r.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.descripcion?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      filterStatus === "all" ||
      (filterStatus === "active"   &&  r.isActive) ||
      (filterStatus === "inactive" && !r.isActive);
    return matchesSearch && matchesStatus;
  });

  const closeDialog = () => {
    setIsDialogOpen(false);
    setEditingRole(null);
    setFormData({ nombre: "", descripcion: "", permisosIds: [] });
  };

  const handleSubmit = async () => {
    const nombre      = formData.nombre.trim();
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
      toast.error(err.message ?? "Error al guardar el rol");
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

  const handleToggleStatus = async (role: Role) => {
    await toggleRoleStatus(role.id, role.isActive);
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
            style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "10px 20px", borderRadius: 10, backgroundColor: "#1a3a2a", color: "#ffffff", fontSize: 14, fontWeight: 600, fontFamily: "var(--font-body)", border: "none", cursor: "pointer" }}
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
          <select
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value)}
            style={{
              padding: "8px 14px", borderRadius: 10, border: "1px solid #d6cfc4",
              backgroundColor: "#ffffff", color: "#1a3a2a", fontSize: 13,
              fontFamily: "var(--font-body)", outline: "none",
            }}
          >
            <option value="all">Todos los estados</option>
            <option value="active">Activos</option>
            <option value="inactive">Inactivos</option>
          </select>
        </div>

        {loading ? (
          <p className="text-center py-12 text-sm" style={{ color: "#6b7c6b", fontFamily: "var(--font-body)" }}>
            Cargando roles...
          </p>
        ) : filteredRoles.length === 0 ? (
          <div className="flex flex-col items-center py-16" style={{ fontFamily: "var(--font-body)" }}>
            <Shield className="w-10 h-10 mb-3" style={{ color: "#d6cfc4" }} />
            <p className="font-medium" style={{ color: "#1a3a2a" }}>No se encontraron roles</p>
            <p className="text-sm mt-1" style={{ color: "#6b7c6b" }}>Intenta ajustar los filtros de búsqueda</p>
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
                {filteredRoles.map((role, idx) => {
                  const isAdminRole = role.nombre?.toLowerCase() === "admin" || role.nombre?.toLowerCase() === "administrador";
                  return (
                  <tr
                    key={role.id}
                    style={{ borderBottom: idx < filteredRoles.length - 1 ? "1px solid #ede8e0" : "none", transition: "background 0.15s" }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#faf7f2")}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                  >
                    {/* ROL */}
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

                    {/* DESCRIPCIÓN */}
                    <td className="px-6 py-4">
                      <p className="text-xs line-clamp-2" style={{ color: "#6b7c6b" }}>{role.descripcion}</p>
                    </td>

                    {/* PERMISOS */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Lock className="w-3.5 h-3.5" style={{ color: "#6b7c6b" }} />
                        <span style={{ display: "inline-flex", padding: "3px 12px", borderRadius: 999, fontSize: 11, fontWeight: 600, letterSpacing: "0.04em", backgroundColor: "#edf7f4", color: "#1a5c3a" }}>
                          {role.permisos?.length ?? 0} permisos
                        </span>
                      </div>
                    </td>

                    {/* ── SWITCH DE ESTADO ── */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {/* Switch */}
                        <button
                          onClick={() => !isAdminRole && handleToggleStatus(role)}
                          disabled={isAdminRole}
                          title={isAdminRole ? "No se puede desactivar el rol Administrador" : role.isActive ? "Desactivar" : "Activar"}
                          className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors"
                          style={{
                            backgroundColor: role.isActive ? "#10b981" : "#d1d5db",
                            cursor: isAdminRole ? "not-allowed" : "pointer",
                            opacity: isAdminRole ? 0.5 : 1,
                          }}
                        >
                          <span
                            className="inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform"
                            style={{
                              transform: role.isActive ? "translateX(22px)" : "translateX(2px)",
                            }}
                          />
                        </button>

                        {/* Label */}
                        <span
                          style={{
                            display: "inline-flex",
                            padding: "3px 12px",
                            borderRadius: 999,
                            fontSize: 11,
                            fontWeight: 600,
                            letterSpacing: "0.04em",
                            backgroundColor: role.isActive ? "#edf7f4" : "#f3f4f6",
                            color: role.isActive ? "#1a5c3a" : "#6b7280",
                          }}
                        >
                          {role.isActive ? "Activo" : "Inactivo"}
                        </span>
                      </div>
                    </td>

                    {/* ── ACCIONES — deshabilitadas si inactivo ── */}
                    <td className="px-6 py-4">
                      {userRole === "admin" ? (
                        <div className="flex items-center gap-1">
                          {/* Ver detalles - SIEMPRE ACTIVO */}
                          <button
                            onClick={() => { setViewingRole(role); setIsViewDialogOpen(true); }}
                            title="Ver detalles"
                            className="p-2 rounded-lg transition-colors"
                            style={{ color: "#6b7c6b", cursor: "pointer" }}
                            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#f0ebe3")}
                            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          {/* Editar - DESHABILITADO SI INACTIVO */}
                          <button
                            onClick={() => role.isActive && handleEdit(role)}
                            title={role.isActive ? "Editar" : "Activa el rol para editarlo"}
                            disabled={!role.isActive}
                            className="p-2 rounded-lg transition-colors"
                            style={{ 
                              color: role.isActive ? "#6b7c6b" : "#d1d5db", 
                              cursor: role.isActive ? "pointer" : "not-allowed",
                              opacity: role.isActive ? 1 : 0.5,
                            }}
                            onMouseEnter={(e) => { if (role.isActive) e.currentTarget.style.backgroundColor = "#f0ebe3"; }}
                            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                          >
                            <Pencil className="w-4 h-4" />
                          </button>

                          {/* Eliminar - DESHABILITADO SI INACTIVO */}
                          <button
                            onClick={() => { if (role.isActive) { setRoleToDelete(role.id); setDeleteDialogOpen(true); } }}
                            title={role.isActive ? "Eliminar" : "Activa el rol para eliminarlo"}
                            disabled={!role.isActive}
                            className="p-2 rounded-lg transition-colors"
                            style={{ 
                              color: role.isActive ? "#c0392b" : "#d1d5db", 
                              cursor: role.isActive ? "pointer" : "not-allowed",
                              opacity: role.isActive ? 1 : 0.5,
                            }}
                            onMouseEnter={(e) => { if (role.isActive) e.currentTarget.style.backgroundColor = "#fdf2f2"; }}
                            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ) : null}
                    </td>
                  </tr>
                  );
                })}
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
