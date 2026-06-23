// src/features/roles/pages/RolesPage.tsx
import { useState } from "react";
import { Card, CardContent } from "../../../shared/ui/card";
import { Input } from "../../../shared/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../shared/ui/select";
import { Plus, Pencil, Trash2, Search, Shield, Eye, Lock, Filter, ChevronLeft, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import { Role } from "../types";
import { useRoles } from "../hooks/useRoles";
import { groupPermissionsByCategory } from "../utils";
import { RoleFormDialog }   from "../components/RoleFormDialog";
import { RoleViewDialog }   from "../components/RoleViewDialog";
import { RoleDeleteDialog } from "../components/RoleDeleteDialog";
import { SpaPage } from "../../../shared/components/layout/SpaPage";
import { usePermisos } from "../../../shared/hooks/usePermisos";

const ITEMS_PER_PAGE = 5;

interface RolesModuleProps {
  userRole: "admin" | "employee" | "client";
}

export function RolesPage({ userRole }: RolesModuleProps) {
  const { can } = usePermisos();
  const canCreateRoles = can("roles.crear");
  const canEditRoles   = can("roles.editar");
  const canDeleteRoles = can("roles.eliminar");
  const canViewRoles   = can("roles.ver");
  const { roles, availablePermissions, loading, createRole, updateRole, deleteRole, toggleRoleStatus } = useRoles();

  const [searchTerm,       setSearchTerm]       = useState("");
  const [filterStatus,     setFilterStatus]     = useState("all");
  const [isDialogOpen,     setIsDialogOpen]     = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editingRole,      setEditingRole]      = useState<Role | null>(null);
  const [viewingRole,      setViewingRole]      = useState<Role | null>(null);
  const [roleToDelete,     setRoleToDelete]     = useState<number | null>(null);
  const [currentPage,      setCurrentPage]      = useState(1);

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

  const totalPages     = Math.max(1, Math.ceil(filteredRoles.length / ITEMS_PER_PAGE));
  const safePage       = Math.min(currentPage, totalPages);
  const paginatedRoles = filteredRoles.slice(
    (safePage - 1) * ITEMS_PER_PAGE,
    safePage * ITEMS_PER_PAGE,
  );

  const handleSearch = (v: string) => { setSearchTerm(v); setCurrentPage(1); };
  const handleFilter = (v: string) => { setFilterStatus(v); setCurrentPage(1); };

  const closeDialog = () => {
    setIsDialogOpen(false);
    setEditingRole(null);
    setFormData({ nombre: "", descripcion: "", permisosIds: [] });
  };

  const handleSubmit = async () => {
    const nombre      = formData.nombre.trim();
    const descripcion = formData.descripcion.trim();
    if (!nombre || !descripcion) { toast.error("Por favor completa todos los campos requeridos"); return; }
    if (formData.permisosIds.length === 0) { toast.error("Debes asignar al menos un permiso al rol"); return; }
    if (nombre.length < 3) { toast.error("El nombre del rol es muy corto"); return; }
    const duplicate = roles.find(r =>
      (r.nombre ?? "").trim().toLowerCase() === nombre.toLowerCase() &&
      (!editingRole || r.id !== editingRole.id)
    );
    if (duplicate) { toast.error("Ya existe un rol con ese nombre"); return; }
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
      if (paginatedRoles.length === 1 && safePage > 1) setCurrentPage(safePage - 1);
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
        canCreateRoles ? (
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

        {/* Filtros */}
        <Card className="border-gray-200 shadow-sm rounded-2xl">
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Buscar roles..."
                  value={searchTerm}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pl-9 h-9 rounded-lg border-gray-200 w-full"
                />
              </div>
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-gray-400" />
                <Select value={filterStatus} onValueChange={handleFilter}>
                  <SelectTrigger className="h-9 rounded-lg border-gray-200 w-44">
                    <SelectValue placeholder="Todos los estados" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos los estados</SelectItem>
                    <SelectItem value="active">Activos</SelectItem>
                    <SelectItem value="inactive">Inactivos</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabla */}
        <Card className="border-gray-200 shadow-sm">
          <CardContent className="p-0">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-12 px-4">
                <p className="text-gray-500 text-sm">Cargando roles...</p>
              </div>
            ) : filteredRoles.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 px-4">
                <Shield className="w-12 h-12 text-gray-300 mb-3" />
                <p className="text-gray-500 text-center">No se encontraron roles</p>
                <p className="text-sm text-gray-400 mt-1">Intenta ajustar los filtros de búsqueda</p>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200 bg-gray-50/50">
                        <th className="text-left px-4 py-3 text-sm text-gray-700 whitespace-nowrap">Rol</th>
                        <th className="text-left px-4 py-3 text-sm text-gray-700 whitespace-nowrap">Descripción</th>
                        <th className="text-left px-4 py-3 text-sm text-gray-700 whitespace-nowrap">Permisos</th>
                        <th className="text-left px-4 py-3 text-sm text-gray-700 whitespace-nowrap">Estado</th>
                        <th className="text-center px-4 py-3 text-sm text-gray-700 w-32 whitespace-nowrap">Acciones</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {paginatedRoles.map((role) => {
                        const isBaseRole = ["administrador", "admin", "barbero", "babero", "cliente"].includes(role.nombre?.toLowerCase() ?? "");
                        return (
                          <tr key={role.id} className="hover:bg-gray-50/50 transition-colors">

                            {/* ROL */}
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-3 min-w-0">
                                <div className="w-9 h-9 rounded-lg flex items-center justify-center text-white flex-shrink-0" style={{ background: "linear-gradient(135deg, #78D1BD, #5FBFAA)" }}>
                                  <Shield className="w-4 h-4" />
                                </div>
                                <p className="text-sm font-medium text-gray-900 truncate">{role.nombre}</p>
                              </div>
                            </td>

                            {/* DESCRIPCIÓN */}
                            <td className="px-4 py-3">
                              <p className="text-xs text-gray-500 line-clamp-2">{role.descripcion}</p>
                            </td>

                            {/* PERMISOS */}
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-2">
                                <Lock className="w-3.5 h-3.5 text-gray-400" />
                                <span style={{ display: "inline-flex", padding: "3px 12px", borderRadius: 999, fontSize: 11, fontWeight: 600, backgroundColor: "#edf7f4", color: "#1a5c3a" }}>
                                  {role.permisos?.length ?? 0} permisos
                                </span>
                              </div>
                            </td>

                            {/* ESTADO */}
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-3">
                                <button
                                  onClick={() => canEditRoles && !isBaseRole && handleToggleStatus(role)}
                                  disabled={isBaseRole || !canEditRoles}
                                  title={isBaseRole ? `No se puede desactivar el rol "${role.nombre}"` : role.isActive ? "Desactivar" : "Activar"}
                                  className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors"
                                  style={{ backgroundColor: role.isActive ? "#10b981" : "#d1d5db", cursor: isBaseRole ? "not-allowed" : "pointer", opacity: isBaseRole ? 0.5 : 1 }}
                                >
                                  <span className="inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform"
                                    style={{ transform: role.isActive ? "translateX(22px)" : "translateX(2px)" }} />
                                </button>
                                <span style={{ display: "inline-flex", padding: "3px 12px", borderRadius: 999, fontSize: 11, fontWeight: 600, backgroundColor: role.isActive ? "#edf7f4" : "#f3f4f6", color: role.isActive ? "#1a5c3a" : "#6b7280" }}>
                                  {role.isActive ? "Activo" : "Inactivo"}
                                </span>
                              </div>
                            </td>

                            {/* ACCIONES */}
                            <td className="px-4 py-3">
                              {(canViewRoles || canEditRoles || canDeleteRoles) && (
                                <div className="flex items-center justify-center gap-1">
                                  <button onClick={() => { setViewingRole(role); setIsViewDialogOpen(true); }} title="Ver detalles"
                                    className="p-2 rounded-lg transition-colors" style={{ color: "#1a3a2a", cursor: "pointer" }}
                                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#edf7f4")}
                                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}>
                                    <Eye className="w-4 h-4" />
                                  </button>
                                  {canEditRoles && (
                                    <button onClick={() => role.isActive && handleEdit(role)}
                                      title={role.isActive ? "Editar" : "Activa el rol para editarlo"} disabled={!role.isActive}
                                      className="p-2 rounded-lg transition-colors"
                                      style={{ color: role.isActive ? "#1a5c3a" : "#d1d5db", cursor: role.isActive ? "pointer" : "not-allowed", opacity: role.isActive ? 1 : 0.5 }}
                                      onMouseEnter={(e) => { if (role.isActive) e.currentTarget.style.backgroundColor = "#edf7f4"; }}
                                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}>
                                      <Pencil className="w-4 h-4" />
                                    </button>
                                  )}
                                  {canDeleteRoles && (
                                    <button onClick={() => { if (role.isActive && !isBaseRole) { setRoleToDelete(role.id); setDeleteDialogOpen(true); } }}
                                      title={isBaseRole ? "No se puede eliminar un rol base" : role.isActive ? "Eliminar" : "Activa el rol para eliminarlo"}
                                      disabled={!role.isActive || isBaseRole}
                                      className="p-2 rounded-lg transition-colors"
                                      style={{ color: (role.isActive && !isBaseRole) ? "#EF4444" : "#d1d5db", cursor: (role.isActive && !isBaseRole) ? "pointer" : "not-allowed", opacity: (role.isActive && !isBaseRole) ? 1 : 0.5 }}
                                      onMouseEnter={(e) => { if (role.isActive && !isBaseRole) e.currentTarget.style.backgroundColor = "#fef2f2"; }}
                                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}>
                                      <Trash2 className="w-4 h-4" />
                                    </button>
                                  )}
                                </div>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Paginación — solo si hay más de 5 roles */}
                {filteredRoles.length > ITEMS_PER_PAGE && (
                  <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200" style={{ fontFamily: "var(--font-body)" }}>
                    <p className="text-xs text-gray-500">
                      Mostrando {(safePage - 1) * ITEMS_PER_PAGE + 1}–{Math.min(safePage * ITEMS_PER_PAGE, filteredRoles.length)} de {filteredRoles.length} roles
                    </p>
                    <div className="flex items-center gap-1">
                      <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={safePage === 1}
                        className="p-1.5 rounded-lg transition-colors"
                        style={{ color: safePage === 1 ? "#d1d5db" : "#1a3a2a", cursor: safePage === 1 ? "not-allowed" : "pointer" }}
                        onMouseEnter={(e) => { if (safePage > 1) e.currentTarget.style.backgroundColor = "#edf7f4"; }}
                        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}>
                        <ChevronLeft className="w-4 h-4" />
                      </button>

                      {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                        <button key={page} onClick={() => setCurrentPage(page)}
                          style={{ minWidth: 28, height: 28, borderRadius: 6, fontSize: 12, fontWeight: page === safePage ? 700 : 400, border: "none", cursor: "pointer", backgroundColor: page === safePage ? "#1a3a2a" : "transparent", color: page === safePage ? "#fff" : "#6b7280" }}
                          onMouseEnter={(e) => { if (page !== safePage) e.currentTarget.style.backgroundColor = "#edf7f4"; }}
                          onMouseLeave={(e) => { if (page !== safePage) e.currentTarget.style.backgroundColor = "transparent"; }}>
                          {page}
                        </button>
                      ))}

                      <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={safePage === totalPages}
                        className="p-1.5 rounded-lg transition-colors"
                        style={{ color: safePage === totalPages ? "#d1d5db" : "#1a3a2a", cursor: safePage === totalPages ? "not-allowed" : "pointer" }}
                        onMouseEnter={(e) => { if (safePage < totalPages) e.currentTarget.style.backgroundColor = "#edf7f4"; }}
                        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}>
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>

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
