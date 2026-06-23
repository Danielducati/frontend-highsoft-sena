// src/features/users/pages/UsersPage.tsx
import { Card, CardContent } from "../../../shared/ui/card";
import { Input } from "../../../shared/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../shared/ui/select";
import { Badge } from "../../../shared/ui/badge";
import { Plus, Search, Filter, Users as UsersIcon, Shield, Mail, Phone, Eye, Pencil, Trash2 } from "lucide-react";
import { SpaPage } from "../../../shared/components/layout/SpaPage";
import { UsersModuleProps } from "../types";
import { ITEMS_PER_PAGE } from "../constants";
import { getRoleBadgeColor } from "../utils";
import { useUsers } from "../hooks/useUsers";
import { UserFormDialog } from "../components/UserFormDialog";
import { UserViewDialog } from "../components/UserViewDialog";
import { UserDeleteDialog } from "../components/UserDeleteDialog";
import { usePermisos } from "../../../shared/hooks/usePermisos";

export function UsersPage({ userRole }: UsersModuleProps) {
  const { can } = usePermisos();
  const {
    users, roles, loading, activeUsers,
    searchTerm, setSearchTerm,
    filterRole, setFilterRole,
    filterStatus, setFilterStatus,
    isDialogOpen, setIsDialogOpen,
    editingUser, viewingUser, setViewingUser,
    deleteDialogOpen, setDeleteDialogOpen,
    formData, setFormData,
    imagePreview, fileInputRef,
    currentPage, setCurrentPage, totalPages, startIndex,
    filteredUsers, paginatedUsers,
    handleCreateOrUpdate, handleDelete, handleToggleStatus,
    confirmDelete, handleEdit, resetForm,
    handleImageUpload, clearImage,
  } = useUsers();

  const endIndex = Math.min(startIndex + ITEMS_PER_PAGE, filteredUsers.length);

  return (
    <SpaPage
      title="Gestión de Usuarios"
      subtitle={`${users.length} usuarios • ${activeUsers} activos`}
      icon={<UsersIcon className="w-6 h-6" style={{ color: "#1a3a2a" }} />}
      action={
        can("usuarios.crear") ? (
          <button
            onClick={() => { resetForm(); setIsDialogOpen(true); }}
            style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "10px 20px", borderRadius: 10, backgroundColor: "#1a3a2a", color: "#ffffff", fontSize: 14, fontWeight: 600, fontFamily: "var(--font-body)", border: "none", cursor: "pointer" }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#2a5a40")}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#1a3a2a")}
          >
            <Plus className="w-4 h-4" /> Nuevo Usuario
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
                  placeholder="Buscar por nombre, correo o teléfono..."
                  value={searchTerm}
                  onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                  className="pl-9 h-9 rounded-lg border-gray-200 w-full"
                />
              </div>
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-gray-400" />
                <Select value={filterRole} onValueChange={(v) => { setFilterRole(v); setCurrentPage(1); }}>
                  <SelectTrigger className="h-9 rounded-lg border-gray-200 w-48">
                    <SelectValue placeholder="Todos los roles" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos los roles</SelectItem>
                    {roles.map(r => <SelectItem key={r.id} value={r.nombre}>{r.nombre}</SelectItem>)}
                  </SelectContent>
                </Select>

                <Select value={filterStatus} onValueChange={(v) => { setFilterStatus(v); setCurrentPage(1); }}>
                  <SelectTrigger className="h-9 rounded-lg border-gray-200 w-36">
                    <SelectValue placeholder="Todos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
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
                <p className="text-gray-500 text-sm">Cargando usuarios...</p>
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 px-4">
                <UsersIcon className="w-12 h-12 text-gray-300 mb-3" />
                <p className="text-gray-500 text-center">No se encontraron usuarios</p>
                <p className="text-sm text-gray-400 mt-1">Intenta ajustar los filtros de búsqueda</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200 bg-gray-50/50">
                      <th className="text-left px-4 py-3 text-sm text-gray-700 whitespace-nowrap">Usuario</th>
                      <th className="text-left px-4 py-3 text-sm text-gray-700 whitespace-nowrap">Rol</th>
                      <th className="text-left px-4 py-3 text-sm text-gray-700 whitespace-nowrap">Contacto</th>
                      <th className="text-left px-4 py-3 text-sm text-gray-700 whitespace-nowrap">Estado</th>
                      <th className="text-center px-4 py-3 text-sm text-gray-700 w-32 whitespace-nowrap">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {paginatedUsers.map((user) => {
                      const isAdmin = user.role?.toLowerCase() === "admin" || user.role?.toLowerCase() === "administrador";

                      return (
                        <tr key={user.id} className="hover:bg-gray-50/50 transition-colors">
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3 min-w-0">
                              <div className="w-9 h-9 rounded-full overflow-hidden flex-shrink-0" style={{ border: "2px solid #c8ead9" }}>
                                {user.photo ? (
                                  <img src={user.photo} alt={user.name} className="w-full h-full object-cover" />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center text-white text-sm" style={{ background: "linear-gradient(135deg, #78D1BD, #5FBFAA)" }}>
                                    {user.name.charAt(0)}
                                  </div>
                                )}
                              </div>
                              <div className="min-w-0">
                                <p className="text-sm font-medium text-gray-900 truncate">{user.name}</p>
                                <p className="text-xs text-gray-500 truncate">{user.documentType ? `${user.documentType} ${user.document}` : user.document || "Sin documento"}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <Shield className="w-3.5 h-3.5 text-gray-400" />
                              <Badge className={`${getRoleBadgeColor(user.role)} text-xs px-2 py-0.5`}>{user.role}</Badge>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex flex-col gap-0.5 min-w-0">
                              <div className="flex items-center gap-1.5 min-w-0">
                                <Mail className="w-3.5 h-3.5 flex-shrink-0 text-gray-400" />
                                <span className="text-xs text-gray-900 truncate">{user.email}</span>
                              </div>
                              {user.phone && (
                                <div className="flex items-center gap-1.5 min-w-0 mt-1">
                                  <Phone className="w-3.5 h-3.5 flex-shrink-0 text-gray-400" />
                                  <span className="text-xs text-gray-900 truncate">{user.phone}</span>
                                </div>
                              )}
                            </div>
                          </td>

                          {/* SWITCH DE ESTADO */}
                          <td className="px-4 py-3">
                            {can("usuarios.editar") ? (
                              <button
                                onClick={() => !isAdmin && handleToggleStatus(user)}
                                title={isAdmin ? "No se puede desactivar un administrador" : user.isActive ? "Desactivar usuario" : "Activar usuario"}
                                disabled={isAdmin}
                                style={{
                                  position: "relative",
                                  display: "inline-flex",
                                  alignItems: "center",
                                  width: 44,
                                  height: 24,
                                  borderRadius: 999,
                                  border: "none",
                                  cursor: isAdmin ? "not-allowed" : "pointer",
                                  backgroundColor: user.isActive ? "#1a5c3a" : "#d1d5db",
                                  opacity: isAdmin ? 0.5 : 1,
                                  transition: "background 0.2s",
                                  padding: 0,
                                }}
                              >
                                <span
                                  style={{
                                    position: "absolute",
                                    left: user.isActive ? 22 : 2,
                                    width: 20,
                                    height: 20,
                                    borderRadius: "50%",
                                    backgroundColor: "#ffffff",
                                    boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
                                    transition: "left 0.2s",
                                  }}
                                />
                              </button>
                            ) : (
                              <span style={{ display: "inline-flex", padding: "3px 12px", borderRadius: 999, fontSize: 11, fontWeight: 600, backgroundColor: user.isActive ? "#edf7f4" : "#f3f4f6", color: user.isActive ? "#1a5c3a" : "#6b7280" }}>
                                {user.isActive ? "Activo" : "Inactivo"}
                              </span>
                            )}
                          </td>

                          {/* ACCIONES */}
                          <td className="px-4 py-3">
                            {(can("usuarios.editar") || can("usuarios.eliminar")) && (
                              <div className="flex items-center justify-center gap-1">
                                <button
                                  onClick={() => setViewingUser(user)}
                                  title="Ver detalles"
                                  className="p-2 rounded-lg transition-colors"
                                  style={{ color: "#1a3a2a" }}
                                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#edf7f4")}
                                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                                >
                                  <Eye className="w-4 h-4" />
                                </button>
                                {can("usuarios.editar") && (
                                  <button
                                    onClick={() => user.isActive && handleEdit(user)}
                                    title={user.isActive ? "Editar" : "Activa el usuario para editar"}
                                    disabled={!user.isActive}
                                    className="p-2 rounded-lg transition-colors"
                                    style={{ color: user.isActive ? "#1a5c3a" : "#d1d5db", cursor: user.isActive ? "pointer" : "not-allowed" }}
                                    onMouseEnter={(e) => { if (user.isActive) e.currentTarget.style.backgroundColor = "#edf7f4"; }}
                                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                                  >
                                    <Pencil className="w-4 h-4" />
                                  </button>
                                )}
                                {can("usuarios.eliminar") && (
                                  <button
                                    onClick={() => user.isActive && !isAdmin && confirmDelete(user.id)}
                                    title={
                                      !user.isActive ? "Activa el usuario para eliminar"
                                      : isAdmin ? "No se puede eliminar un administrador"
                                      : "Eliminar"
                                    }
                                    disabled={!user.isActive || isAdmin}
                                    className="p-2 rounded-lg transition-colors"
                                    style={{ color: (user.isActive && !isAdmin) ? "#EF4444" : "#d1d5db", cursor: (user.isActive && !isAdmin) ? "pointer" : "not-allowed" }}
                                    onMouseEnter={(e) => { if (user.isActive && !isAdmin) e.currentTarget.style.backgroundColor = "#fef2f2"; }}
                                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                                  >
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
            )}
          </CardContent>
        </Card>

        {/* Paginación */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-2 px-1" style={{ fontFamily: "var(--font-body)" }}>
            <p className="text-sm" style={{ color: "#6b7c6b" }}>Mostrando {startIndex + 1}–{endIndex} de {filteredUsers.length} usuarios</p>
            <div className="flex items-center gap-1">
              <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="w-8 h-8 flex items-center justify-center rounded-lg text-sm disabled:opacity-30" style={{ color: "#1a3a2a" }}>‹</button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <button key={page} onClick={() => setCurrentPage(page)} className="w-8 h-8 flex items-center justify-center rounded-lg text-sm font-medium" style={page === currentPage ? { backgroundColor: "#1a3a2a", color: "#ffffff" } : { color: "#1a3a2a" }}>
                  {page}
                </button>
              ))}
              <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="w-8 h-8 flex items-center justify-center rounded-lg text-sm disabled:opacity-30" style={{ color: "#1a3a2a" }}>›</button>
            </div>
          </div>
        )}

        <UserFormDialog
          isOpen={isDialogOpen}
          onOpenChange={setIsDialogOpen}
          editingUser={editingUser}
          formData={formData}
          setFormData={setFormData}
          imagePreview={imagePreview}
          fileInputRef={fileInputRef as React.RefObject<HTMLInputElement>}
          roles={roles}
          onSubmit={handleCreateOrUpdate}
          onCancel={resetForm}
          onImageUpload={handleImageUpload}
          onClearImage={clearImage}
        />
        <UserViewDialog user={viewingUser} onClose={() => setViewingUser(null)} />
        <UserDeleteDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen} onConfirm={handleDelete} />
      </div>
    </SpaPage>
  );
}
