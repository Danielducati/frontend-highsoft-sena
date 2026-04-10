import React from "react";
import { Plus, Search, Filter, Key } from "lucide-react";
import { SpaPage } from "../../../shared/components/layout/SpaPage";
import { AccessModuleProps } from "../types";
import { MODULES, ACTIONS } from "../constants";
import { usePermissions } from "../hooks/usePermissions";
import { PermissionRow } from "../components/PermissionRow";
import { PermissionFormDialog } from "../components/PermissionFormDialog";
import { PermissionViewDialog } from "../components/PermissionViewDialog";

export function AccessPage({ userRole }: AccessModuleProps) {
  const {
    filteredPermissions,
    permissions,
    searchTerm,
    setSearchTerm,
    filterModule,
    setFilterModule,
    filterAction,
    setFilterAction,
    filterStatus,
    setFilterStatus,
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
  } = usePermissions();

  const activePermissions = permissions.filter((p) => p.isActive).length;

  return (
    <SpaPage
      title="Gestión de Permisos"
      subtitle={`${permissions.length} permisos • ${activePermissions} activos`}
      icon={<Key className="w-6 h-6" style={{ color: "#1a3a2a" }} />}
      action={
        userRole === "admin" ? (
          <button
            onClick={handleNewPermission}
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
            Nuevo Permiso
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
            placeholder="Buscar permisos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-transparent outline-none text-sm w-full"
            style={{ color: "#1a3a2a" }}
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap" style={{ fontFamily: "var(--font-body)" }}>
          <Filter className="w-4 h-4" style={{ color: "#6b7c6b" }} />
          <select
            value={filterModule}
            onChange={(e) => setFilterModule(e.target.value)}
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
            <option value="all">Todos los módulos</option>
            {MODULES.map((m) => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>

          <select
            value={filterAction}
            onChange={(e) => setFilterAction(e.target.value)}
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
            <option value="all">Todas las acciones</option>
            {ACTIONS.map((a) => (
              <option key={a} value={a}>{a}</option>
            ))}
          </select>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
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
            <option value="all">Todos los estados</option>
            <option value="active">Activos</option>
            <option value="inactive">Inactivos</option>
          </select>
        </div>
      </div>

      {/* Lista */}
      {filteredPermissions.length === 0 ? (
        <div className="flex flex-col items-center py-16" style={{ fontFamily: "var(--font-body)" }}>
          <Key className="w-10 h-10 mb-3" style={{ color: "#d6cfc4" }} />
          <p className="font-medium" style={{ color: "#1a3a2a" }}>No se encontraron permisos</p>
          <p className="text-sm mt-1" style={{ color: "#6b7c6b" }}>
            Intenta ajustar los filtros de búsqueda
          </p>
        </div>
      ) : (
        <div className="rounded-2xl overflow-hidden shadow-sm" style={{ backgroundColor: "#ffffff" }}>
          <div style={{ borderBottom: "1px solid #ede8e0" }}>
            <div className="hidden lg:grid lg:grid-cols-12 gap-3 px-6 py-4 text-xs font-semibold tracking-widest" style={{ color: "#6b7c6b", fontFamily: "var(--font-body)" }}>
              <div className="col-span-3">PERMISO</div>
              <div className="col-span-4">DESCRIPCIÓN</div>
              <div className="col-span-2">MÓDULO</div>
              <div className="col-span-1">ESTADO</div>
              <div className="col-span-2 text-right">ACCIONES</div>
            </div>
          </div>
          <div className="divide-y" style={{ borderColor: "#ede8e0" }}>
            {filteredPermissions.map((permission) => (
              <PermissionRow
                key={permission.id}
                permission={permission}
                userRole={userRole}
                onView={handleViewPermission}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onToggleStatus={handleToggleStatus}
              />
            ))}
          </div>
        </div>
      )}

      {/* Dialogs */}
      <PermissionFormDialog
        isOpen={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        editingPermission={editingPermission}
        formData={formData}
        setFormData={setFormData}
        onSubmit={handleCreateOrUpdate}
        onCancel={resetForm}
      />

      <PermissionViewDialog
        isOpen={isViewDialogOpen}
        onOpenChange={setIsViewDialogOpen}
        permission={viewingPermission}
      />
      </div>
    </SpaPage>
  );
}

