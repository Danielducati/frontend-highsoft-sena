import React from "react";
import { Badge } from "../../../shared/ui/badge";
import { Plus, Search, Filter, Users as UsersIcon, Shield, Mail, Eye, Pencil, Trash2 } from "lucide-react";
import { SpaPage } from "../../../shared/components/layout/SpaPage";
import { UsersModuleProps } from "../types";
import { ITEMS_PER_PAGE } from "../constants";
import { getRoleBadgeColor } from "../utils";
import { useUsers } from "../hooks/useUsers";
import { UserFormDialog } from "../components/UserFormDialog";
import { UserViewDialog } from "../components/UserViewDialog";
import { UserDeleteDialog } from "../components/UserDeleteDialog";

export function UsersPage({ userRole }: UsersModuleProps) {
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
        userRole === "admin" ? (
          <button
            onClick={() => { resetForm(); setIsDialogOpen(true); }}
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
            <Plus className="w-4 h-4" /> Nuevo Usuario
          </button>
        ) : null
      }
    >
      <div className="space-y-4">

      {/* Filtros */}
      <div className="flex flex-col sm:flex-row gap-3 mb-2" style={{ fontFamily: "var(--font-body)" }}>
        <div
          className="flex items-center gap-2 px-4 py-2 rounded-full border flex-1"
          style={{ backgroundColor: "#ffffff", borderColor: "#d6cfc4", maxWidth: 380 }}
        >
          <Search className="w-4 h-4 flex-shrink-0" style={{ color: "#6b7c6b" }} />
          <input
            placeholder="Buscar por nombre, correo o teléfono..."
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
            className="bg-transparent outline-none text-sm w-full"
            style={{ color: "#1a3a2a" }}
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap" style={{ fontFamily: "var(--font-body)" }}>
          <Filter className="w-4 h-4" style={{ color: "#6b7c6b" }} />
          <select
            value={filterRole}
            onChange={(e) => { setFilterRole(e.target.value); setCurrentPage(1); }}
            style={{
              padding: "8px 14px",
              borderRadius: 10,
              border: "1px solid #d6cfc4",
              backgroundColor: "#ffffff",
              color: "#1a3a2a",
              fontSize: 13,
              fontFamily: "var(--font-body)",
              outline: "none",
            }}
          >
            <option value="all">Todos los roles</option>
            {roles.map(r => (
              <option key={r.id} value={r.Nombre}>{r.Nombre}</option>
            ))}
          </select>
          <select
            value={filterStatus}
            onChange={(e) => { setFilterStatus(e.target.value); setCurrentPage(1); }}
            style={{
              padding: "8px 14px",
              borderRadius: 10,
              border: "1px solid #d6cfc4",
              backgroundColor: "#ffffff",
              color: "#1a3a2a",
              fontSize: 13,
              fontFamily: "var(--font-body)",
              outline: "none",
            }}
          >
            <option value="all">Todos</option>
            <option value="active">Activos</option>
            <option value="inactive">Inactivos</option>
          </select>
        </div>
      </div>

      {/* Lista */}
      {loading ? (
        <p className="text-center py-12 text-sm" style={{ color: "#6b7c6b", fontFamily: "var(--font-body)" }}>
          Cargando usuarios...
        </p>
      ) : filteredUsers.length === 0 ? (
        <div className="flex flex-col items-center py-16" style={{ fontFamily: "var(--font-body)" }}>
          <UsersIcon className="w-10 h-10 mb-3" style={{ color: "#d6cfc4" }} />
          <p className="font-medium" style={{ color: "#1a3a2a" }}>No se encontraron usuarios</p>
          <p className="text-sm mt-1" style={{ color: "#6b7c6b" }}>
            Intenta ajustar los filtros de búsqueda
          </p>
        </div>
      ) : (
        <div className="rounded-2xl overflow-hidden shadow-sm" style={{ backgroundColor: "#ffffff" }}>
          <table className="w-full" style={{ fontFamily: "var(--font-body)" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid #ede8e0" }}>
                {["NOMBRE", "ROL", "CORREO", "ESTADO", "ACCIONES"].map((col) => (
                  <th key={col} className="px-6 py-4 text-left text-xs font-semibold tracking-widest" style={{ color: "#6b7c6b" }}>
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paginatedUsers.map((user, idx) => (
                <tr
                  key={user.id}
                  style={{ borderBottom: idx < paginatedUsers.length - 1 ? "1px solid #ede8e0" : "none", transition: "background 0.15s" }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#faf7f2")}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm flex-shrink-0" style={{ background: "linear-gradient(135deg, #78D1BD, #5FBFAA)" }}>
                        {user.name.charAt(0)}
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-sm truncate" style={{ color: "#1a3a2a" }}>{user.name}</p>
                        <p className="text-xs truncate" style={{ color: "#6b7c6b" }}>{user.phone || "Sin teléfono"}</p>
                      </div>
                    </div>
                  </td>

                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <Shield className="w-3.5 h-3.5" style={{ color: "#6b7c6b" }} />
                      <Badge className={`${getRoleBadgeColor(user.role)} text-xs px-2 py-0.5`}>
                        {user.role}
                      </Badge>
                    </div>
                  </td>

                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 min-w-0">
                      <Mail className="w-3.5 h-3.5 flex-shrink-0" style={{ color: "#6b7c6b" }} />
                      <span className="text-xs truncate" style={{ color: "#1a3a2a" }}>{user.email}</span>
                    </div>
                  </td>

                  <td className="px-6 py-4">
                    {userRole === "admin" ? (
                      <button
                        onClick={() => handleToggleStatus(user)}
                        style={{
                          display: "inline-flex",
                          padding: "3px 12px",
                          borderRadius: 999,
                          fontSize: 11,
                          fontWeight: 600,
                          letterSpacing: "0.04em",
                          border: "none",
                          cursor: "pointer",
                          backgroundColor: user.isActive ? "#edf7f4" : "#f3f4f6",
                          color: user.isActive ? "#1a5c3a" : "#6b7280",
                        }}
                      >
                        {user.isActive ? "Activo" : "Inactivo"}
                      </button>
                    ) : (
                      <span style={{ display: "inline-flex", padding: "3px 12px", borderRadius: 999, fontSize: 11, fontWeight: 600, letterSpacing: "0.04em", backgroundColor: user.isActive ? "#edf7f4" : "#f3f4f6", color: user.isActive ? "#1a5c3a" : "#6b7280" }}>
                        {user.isActive ? "Activo" : "Inactivo"}
                      </span>
                    )}
                  </td>

                  <td className="px-6 py-4">
                    {userRole === "admin" ? (
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => setViewingUser(user)}
                          title="Ver detalles"
                          className="p-2 rounded-lg transition-colors"
                          style={{ color: "#6b7c6b" }}
                          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#f0ebe3")}
                          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleEdit(user)}
                          title="Editar"
                          className="p-2 rounded-lg transition-colors"
                          style={{ color: "#6b7c6b" }}
                          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#f0ebe3")}
                          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => confirmDelete(user.id)}
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

      {/* Paginación */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-6 px-4" style={{ fontFamily: "var(--font-body)" }}>
          <p className="text-sm" style={{ color: "#6b7c6b" }}>
            Mostrando {startIndex + 1}–{endIndex} de {filteredUsers.length} usuarios
          </p>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="w-8 h-8 flex items-center justify-center rounded-lg text-sm disabled:opacity-30"
              style={{ color: "#1a3a2a" }}
              onMouseEnter={(e) => { if (!e.currentTarget.disabled) e.currentTarget.style.backgroundColor = "#ede8e0"; }}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
            >
              ‹
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className="w-8 h-8 flex items-center justify-center rounded-lg text-sm font-medium"
                style={page === currentPage ? { backgroundColor: "#1a3a2a", color: "#ffffff" } : { color: "#1a3a2a" }}
                onMouseEnter={(e) => { if (page !== currentPage) e.currentTarget.style.backgroundColor = "#ede8e0"; }}
                onMouseLeave={(e) => { if (page !== currentPage) e.currentTarget.style.backgroundColor = "transparent"; }}
              >
                {page}
              </button>
            ))}
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="w-8 h-8 flex items-center justify-center rounded-lg text-sm disabled:opacity-30"
              style={{ color: "#1a3a2a" }}
              onMouseEnter={(e) => { if (!e.currentTarget.disabled) e.currentTarget.style.backgroundColor = "#ede8e0"; }}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
            >
              ›
            </button>
          </div>
        </div>
      )}

      {/* Dialogs */}
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
