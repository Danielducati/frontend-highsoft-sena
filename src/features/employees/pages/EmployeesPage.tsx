import * as React from "react"; 
import { Card, CardContent } from "../../../shared/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../shared/ui/select";
import { Switch } from "../../../shared/ui/switch";
import { Plus, Search, Filter, Users, Eye, Pencil, Trash2 } from "lucide-react";
import { EmployeesModuleProps } from "../types";
import { ITEMS_PER_PAGE } from "../constants";
import { useEmployees } from "../hooks/useEmployees";
import { EmployeeFormDialog } from "../components/EmployeeFormDialog";
import { EmployeeViewDialog } from "../components/EmployeeViewDialog";
import { EmployeeDeleteDialog } from "../components/EmployeeDeleteDialog";
import { ImageWithFallback } from "../../guidelines/figma/ImageWithFallback";

export function EmployeesPage({ userRole }: EmployeesModuleProps) {
  const {
    employees, categories, loading, saving,
    searchTerm, setSearchTerm,
    filterSpecialty, setFilterSpecialty,
    filterStatus, setFilterStatus,
    isDialogOpen, setIsDialogOpen,
    viewingEmployee, setViewingEmployee,
    editingEmployee,
    deleteDialogOpen, setDeleteDialogOpen,
    formData, setFormData,
    imagePreview, setImagePreview,
    currentPage, setCurrentPage, totalPages,
    filteredEmployees, paginatedEmployees,
    specialties, activeEmployees,
    handleCreateOrUpdate, handleToggleStatus,
    handleDelete, handleEdit,
    confirmDelete, resetForm, handleResetPassword,
  } = useEmployees();


  return (
    <div
      className="min-h-screen p-8"
      style={{ backgroundColor: "#f5f0e8", fontFamily: "var(--font-body)" }}
    >
      {/* ── Header ── */}
      <div className="flex justify-between items-start mb-8">
        <div>
          <h1
            className="text-4xl font-bold mb-1"
            style={{ color: "#1a3a2a", fontFamily: "var(--font-body)" }}
          >
            Gestión de Empleados
          </h1>
          <p className="text-sm" style={{ color: "#6b7c6b", fontFamily: "var(--font-body)" }}>
            Administra el equipo de trabajo del spa
          </p>
        </div>

        {userRole === "admin" && (
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
              transition: "background 0.2s",
            }}
            onMouseEnter={e => (e.currentTarget.style.backgroundColor = "#2a5a40")}
            onMouseLeave={e => (e.currentTarget.style.backgroundColor = "#1a3a2a")}
          >
            <Plus className="w-4 h-4" />
            Nuevo Empleado
          </button>
        )}
      </div>

      {/* ── Stats ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {[
          { label: "Total Empleados",   value: employees.length },
          { label: "Empleados Activos", value: activeEmployees  },
          { label: "Especialidades",    value: specialties.length },
        ].map(({ label, value }) => (
          <div
            key={label}
            className="rounded-2xl shadow-sm p-5"
            style={{ backgroundColor: "#ffffff" }}
          >
            <p
              className="text-xs uppercase tracking-widest mb-1"
              style={{ color: "#6b7c6b", fontFamily: "var(--font-body)" }}
            >
              {label}
            </p>
            <p
              className="text-3xl font-semibold"
              style={{ color: "#1a3a2a", fontFamily: "var(--font-body)" }}
            >
              {value}
            </p>
          </div>
        ))}
      </div>

      {/* ── Filtros ── */}
      <div
        className="flex flex-col sm:flex-row gap-3 mb-6"
        style={{ fontFamily: "var(--font-body)" }}
      >
        {/* Búsqueda */}
        <div
          className="flex items-center gap-2 px-4 py-2 rounded-full border flex-1"
          style={{ backgroundColor: "#ffffff", borderColor: "#d6cfc4", maxWidth: 340 }}
        >
          <Search className="w-4 h-4 flex-shrink-0" style={{ color: "#6b7c6b" }} />
          <input
            placeholder="Buscar empleados..."
            value={searchTerm}
            onChange={e => { setSearchTerm(e.target.value); setCurrentPage(1); }}
            className="bg-transparent outline-none text-sm w-full"
            style={{ color: "#1a3a2a" }}
          />
        </div>

        {/* Filtros select */}
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4" style={{ color: "#6b7c6b" }} />
          <select
            value={filterSpecialty}
            onChange={e => { setFilterSpecialty(e.target.value); setCurrentPage(1); }}
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
            <option value="all">Todas las especialidades</option>
            {specialties.map(s => <option key={s} value={s}>{s}</option>)}
          </select>

          <select
            value={filterStatus}
            onChange={e => { setFilterStatus(e.target.value); setCurrentPage(1); }}
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

      {/* ── Tabla ── */}
      <div
        className="rounded-2xl overflow-hidden shadow-sm"
        style={{ backgroundColor: "#ffffff" }}
      >
        {loading ? (
          <p className="text-center py-12 text-sm" style={{ color: "#6b7c6b", fontFamily: "var(--font-body)" }}>
            Cargando empleados...
          </p>
        ) : paginatedEmployees.length === 0 ? (
          <div className="flex flex-col items-center py-16" style={{ fontFamily: "var(--font-body)" }}>
            <Users className="w-10 h-10 mb-3" style={{ color: "#d6cfc4" }} />
            <p className="font-medium" style={{ color: "#1a3a2a" }}>No se encontraron empleados</p>
            <p className="text-sm mt-1" style={{ color: "#6b7c6b" }}>Intenta ajustar los filtros de búsqueda</p>
          </div>
        ) : (
          <table className="w-full" style={{ fontFamily: "var(--font-body)" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid #ede8e0" }}>
                {["NOMBRE DEL EMPLEADO", "ESPECIALIDAD", "CONTACTO", "ESTADO", ...(userRole === "admin" ? ["ACCIONES"] : [])].map(col => (
                  <th
                    key={col}
                    className="px-6 py-4 text-left text-xs font-semibold tracking-widest"
                    style={{ color: "#6b7c6b" }}
                  >
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paginatedEmployees.map((employee, idx) => (
                <tr
                  key={employee.id}
                  style={{
                    borderBottom: idx < paginatedEmployees.length - 1 ? "1px solid #ede8e0" : "none",
                    transition: "background 0.15s",
                  }}
                  onMouseEnter={e => (e.currentTarget.style.backgroundColor = "#faf7f2")}
                  onMouseLeave={e => (e.currentTarget.style.backgroundColor = "transparent")}
                >
                  {/* Nombre */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div
                        style={{
                          width: 40,
                          height: 40,
                          borderRadius: "50%",
                          backgroundColor: "#edf7f4",
                          border: "2px solid #c8ead9",
                          overflow: "hidden",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                          color: "#1a5c3a",
                          fontWeight: 600,
                          fontSize: 16,
                        }}
                      >
                        {employee.image
                          ? <ImageWithFallback src={employee.image} alt={employee.name} className="w-full h-full object-cover" />
                          : employee.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium" style={{ color: "#1a3a2a" }}>{employee.name}</p>
                        <p className="text-xs mt-0.5" style={{ color: "#6b7c6b" }}>{employee.email}</p>
                      </div>
                    </div>
                  </td>

                  {/* Especialidad */}
                  <td className="px-6 py-4">
                    <span
                      className="inline-flex px-3 py-1 rounded-full text-xs font-medium"
                      style={{ backgroundColor: "#f0ebe3", color: "#1a3a2a" }}
                    >
                      {employee.specialty || "—"}
                    </span>
                  </td>

                  {/* Contacto */}
                  <td className="px-6 py-4">
                    <p className="text-sm" style={{ color: "#1a3a2a" }}>{employee.phone || "—"}</p>
                    <p className="text-xs mt-0.5" style={{ color: "#6b7c6b" }}>{employee.ciudad || "—"}</p>
                  </td>

                  {/* Estado */}
                  <td className="px-6 py-4">
                    {userRole === "admin" ? (
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={employee.isActive}
                          onCheckedChange={() => handleToggleStatus(employee)}
                          style={employee.isActive ? { backgroundColor: "#4caf82" } : { backgroundColor: "#9ca3af" }}
                        />
                        <span
                          className="text-xs font-semibold tracking-wide uppercase"
                          style={{ color: employee.isActive ? "#1a5c3a" : "#9ca3af" }}
                        >
                          {employee.isActive ? "Activo" : "Inactivo"}
                        </span>
                      </div>
                    ) : (
                      <span
                        className="inline-flex px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wide"
                        style={employee.isActive
                          ? { backgroundColor: "#edf7f4", color: "#1a5c3a" }
                          : { backgroundColor: "#f3f4f6", color: "#9ca3af" }}
                      >
                        {employee.isActive ? "Activo" : "Inactivo"}
                      </span>
                    )}
                  </td>

                  {/* Acciones */}
                  {userRole === "admin" && (
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => setViewingEmployee(employee)}
                          title="Ver detalles"
                          className="p-2 rounded-lg transition-colors"
                          style={{ color: "#6b7c6b" }}
                          onMouseEnter={e => (e.currentTarget.style.backgroundColor = "#f0ebe3")}
                          onMouseLeave={e => (e.currentTarget.style.backgroundColor = "transparent")}
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        <>
                          <button
                            onClick={() => employee.isActive && handleEdit(employee)}
                            title={employee.isActive ? "Editar" : "Activa el empleado para editar"}
                            disabled={!employee.isActive}
                            className="p-2 rounded-lg transition-colors"
                            style={{ color: employee.isActive ? "#6b7c6b" : "#d1d5db", cursor: employee.isActive ? "pointer" : "not-allowed" }}
                            onMouseEnter={e => { if (employee.isActive) e.currentTarget.style.backgroundColor = "#f0ebe3"; }}
                            onMouseLeave={e => (e.currentTarget.style.backgroundColor = "transparent")}
                          >
                            <Pencil className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => employee.isActive && confirmDelete(employee.id)}
                            title={employee.isActive ? "Eliminar" : "Activa el empleado para eliminar"}
                            disabled={!employee.isActive}
                            className="p-2 rounded-lg transition-colors"
                            style={{ color: employee.isActive ? "#c0392b" : "#d1d5db", cursor: employee.isActive ? "pointer" : "not-allowed" }}
                            onMouseEnter={e => { if (employee.isActive) e.currentTarget.style.backgroundColor = "#fdf0ee"; }}
                            onMouseLeave={e => (e.currentTarget.style.backgroundColor = "transparent")}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* ── Paginación ── */}
      {totalPages > 1 && (
        <div
          className="flex items-center justify-between mt-6 px-4"
          style={{ fontFamily: "var(--font-body)" }}
        >
          <p className="text-sm" style={{ color: "#6b7c6b" }}>
            Mostrando {(currentPage - 1) * ITEMS_PER_PAGE + 1}–{Math.min(currentPage * ITEMS_PER_PAGE, filteredEmployees.length)} de {filteredEmployees.length} empleados
          </p>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="w-8 h-8 flex items-center justify-center rounded-lg text-sm transition-colors disabled:opacity-30"
              style={{ color: "#1a3a2a" }}
              onMouseEnter={e => { if (!e.currentTarget.disabled) e.currentTarget.style.backgroundColor = "#ede8e0"; }}
              onMouseLeave={e => (e.currentTarget.style.backgroundColor = "transparent")}
            >
              ‹
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className="w-8 h-8 flex items-center justify-center rounded-lg text-sm font-medium transition-colors"
                style={page === currentPage
                  ? { backgroundColor: "#1a3a2a", color: "#ffffff" }
                  : { color: "#1a3a2a" }}
                onMouseEnter={e => { if (page !== currentPage) e.currentTarget.style.backgroundColor = "#ede8e0"; }}
                onMouseLeave={e => { if (page !== currentPage) e.currentTarget.style.backgroundColor = "transparent"; }}
              >
                {page}
              </button>
            ))}
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="w-8 h-8 flex items-center justify-center rounded-lg text-sm transition-colors disabled:opacity-30"
              style={{ color: "#1a3a2a" }}
              onMouseEnter={e => { if (!e.currentTarget.disabled) e.currentTarget.style.backgroundColor = "#ede8e0"; }}
              onMouseLeave={e => (e.currentTarget.style.backgroundColor = "transparent")}
            >
              ›
            </button>
          </div>
        </div>
      )}

      {/* ── Dialogs ── */}
      <EmployeeFormDialog
        isOpen={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        editingEmployee={editingEmployee}
        formData={formData}
        setFormData={setFormData}
        imagePreview={imagePreview}
        setImagePreview={setImagePreview}
        saving={saving}
        onSubmit={() => handleCreateOrUpdate(formData)}
        onCancel={resetForm}
        categories={categories}
        onResetPassword={handleResetPassword}
      />
      <EmployeeViewDialog employee={viewingEmployee} onClose={() => setViewingEmployee(null)} />
      <EmployeeDeleteDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen} onConfirm={handleDelete} />
    </div>
  );
}
