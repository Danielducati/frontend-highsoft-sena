import * as React from "react";
import { Card, CardContent } from "../../../shared/ui/card";
import { Input } from "../../../shared/ui/input";
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
import { SpaPage } from "../../../shared/components/layout/SpaPage";

import { usePermisos } from "../../../shared/hooks/usePermisos";

export function EmployeesPage({ userRole }: EmployeesModuleProps) {
  const { can } = usePermisos();
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
    <SpaPage
      title="Gestión de Empleados"
      subtitle={`${employees.length} empleados • ${activeEmployees} activos`}
      icon={<Users className="w-6 h-6" style={{ color: "#1a3a2a" }} />}
      action={
        can("empleados.crear") ? (
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
            onMouseEnter={e => (e.currentTarget.style.backgroundColor = "#2a5a40")}
            onMouseLeave={e => (e.currentTarget.style.backgroundColor = "#1a3a2a")}
          >
            <Plus className="w-4 h-4" />
            Nuevo Empleado
          </button>
        ) : undefined
      }
    >
      <div className="space-y-4">

        {/* Filtros */}
        <Card className="border-gray-200 shadow-sm rounded-2xl">
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-3">
              {/* Búsqueda */}
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Buscar empleados..."
                  value={searchTerm}
                  onChange={e => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                  className="pl-9 h-9 rounded-lg border-gray-200 w-full"
                />
              </div>

              {/* Filtros select */}
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-gray-400" />
                <Select value={filterSpecialty} onValueChange={v => { setFilterSpecialty(v); setCurrentPage(1); }}>
                  <SelectTrigger className="h-9 rounded-lg border-gray-200 w-52">
                    <SelectValue placeholder="Todas las especialidades" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas las especialidades</SelectItem>
                    {specialties.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                  </SelectContent>
                </Select>

                <Select value={filterStatus} onValueChange={v => { setFilterStatus(v); setCurrentPage(1); }}>
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
                <p className="text-gray-500 text-sm">Cargando empleados...</p>
              </div>
            ) : paginatedEmployees.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 px-4">
                <Users className="w-12 h-12 text-gray-300 mb-3" />
                <p className="text-gray-500 text-center">No se encontraron empleados</p>
                <p className="text-sm text-gray-400 mt-1">Intenta ajustar los filtros de búsqueda</p>
              </div>
            ) : (
              <>
                <style>{`
                  .emp-table { display: block; }
                  .emp-cards { display: none; }
                  @media (max-width: 640px) {
                    .emp-table { display: none; }
                    .emp-cards { display: flex; flex-direction: column; gap: 10px; padding: 12px; }
                  }
                `}</style>

                {/* ── Tabla desktop ── */}
                <div className="emp-table module-table-scroll overflow-x-auto">
                  <table className="w-full" style={{ minWidth: 580 }}>
                    <thead>
                      <tr className="border-b border-gray-200 bg-gray-50/50">
                        <th className="text-left px-4 py-3 text-sm text-gray-700 whitespace-nowrap">Empleado</th>
                        <th className="text-left px-4 py-3 text-sm text-gray-700 whitespace-nowrap">Especialidad</th>
                        <th className="text-left px-4 py-3 text-sm text-gray-700 whitespace-nowrap">Contacto</th>
                        <th className="text-left px-4 py-3 text-sm text-gray-700 whitespace-nowrap">Estado</th>
                        {(can("empleados.editar") || can("empleados.eliminar")) && (
                          <th className="text-center px-4 py-3 text-sm text-gray-700 w-32 whitespace-nowrap">Acciones</th>
                        )}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {paginatedEmployees.map((employee) => (
                        <tr key={employee.id} className="hover:bg-gray-50/50 transition-colors">
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3">
                              <div style={{ width: 40, height: 40, borderRadius: "50%", backgroundColor: "#edf7f4", border: "2px solid #c8ead9", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, color: "#1a5c3a", fontWeight: 600, fontSize: 16 }}>
                                {employee.image ? <ImageWithFallback src={employee.image} alt={employee.name} className="w-full h-full object-cover" /> : employee.name.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <p className="text-sm font-medium text-gray-900">{employee.name}</p>
                                <p className="text-xs text-gray-500 mt-0.5">{employee.email}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <span className="inline-flex px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">{employee.specialty || "—"}</span>
                          </td>
                          <td className="px-4 py-3">
                            <p className="text-sm text-gray-900">{employee.phone || "—"}</p>
                            <p className="text-xs text-gray-500 mt-0.5">{employee.ciudad || "—"}</p>
                          </td>
                          <td className="px-4 py-3">
                            {can("empleados.editar") ? (
                              <div className="flex items-center gap-2">
                                <Switch checked={employee.isActive} onCheckedChange={() => handleToggleStatus(employee)} style={employee.isActive ? { backgroundColor: "#4caf82" } : { backgroundColor: "#9ca3af" }} />
                                <span className="text-xs font-semibold" style={{ color: employee.isActive ? "#1a5c3a" : "#9ca3af" }}>{employee.isActive ? "Activo" : "Inactivo"}</span>
                              </div>
                            ) : (
                              <span className="inline-flex px-3 py-1 rounded-full text-xs font-semibold" style={employee.isActive ? { backgroundColor: "#edf7f4", color: "#1a5c3a" } : { backgroundColor: "#f3f4f6", color: "#9ca3af" }}>
                                {employee.isActive ? "Activo" : "Inactivo"}
                              </span>
                            )}
                          </td>
                          {(can("empleados.editar") || can("empleados.eliminar")) && (
                            <td className="px-4 py-3">
                              <div className="flex items-center justify-center gap-1">
                                <button onClick={() => setViewingEmployee(employee)} title="Ver detalles" className="p-2 rounded-lg transition-colors" style={{ color: "#1a3a2a" }} onMouseEnter={e => (e.currentTarget.style.backgroundColor = "#edf7f4")} onMouseLeave={e => (e.currentTarget.style.backgroundColor = "transparent")}><Eye className="w-4 h-4" /></button>
                                {can("empleados.editar") && (
                                  <button onClick={() => employee.isActive && handleEdit(employee)} disabled={!employee.isActive} title={employee.isActive ? "Editar" : "Activa el empleado para editar"} className="p-2 rounded-lg transition-colors" style={{ color: employee.isActive ? "#1a5c3a" : "#d1d5db", cursor: employee.isActive ? "pointer" : "not-allowed" }} onMouseEnter={e => { if (employee.isActive) e.currentTarget.style.backgroundColor = "#edf7f4"; }} onMouseLeave={e => (e.currentTarget.style.backgroundColor = "transparent")}><Pencil className="w-4 h-4" /></button>
                                )}
                                {can("empleados.eliminar") && (
                                  <button onClick={() => employee.isActive && confirmDelete(employee.id)} disabled={!employee.isActive} title={employee.isActive ? "Eliminar" : "Activa el empleado para eliminar"} className="p-2 rounded-lg transition-colors" style={{ color: employee.isActive ? "#EF4444" : "#d1d5db", cursor: employee.isActive ? "pointer" : "not-allowed" }} onMouseEnter={e => { if (employee.isActive) e.currentTarget.style.backgroundColor = "#fef2f2"; }} onMouseLeave={e => (e.currentTarget.style.backgroundColor = "transparent")}><Trash2 className="w-4 h-4" /></button>
                                )}
                              </div>
                            </td>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* ── Tarjetas móvil ── */}
                <div className="emp-cards">
                  {paginatedEmployees.map(employee => (
                    <div key={employee.id} style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 12, padding: "14px 16px", boxShadow: "0 1px 4px rgba(0,0,0,0.05)" }}>
                      {/* Header */}
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          <div style={{ width: 40, height: 40, borderRadius: "50%", backgroundColor: "#edf7f4", border: "2px solid #c8ead9", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, color: "#1a5c3a", fontWeight: 600, fontSize: 16 }}>
                            {employee.image ? <ImageWithFallback src={employee.image} alt={employee.name} className="w-full h-full object-cover" /> : employee.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p style={{ fontSize: 14, fontWeight: 600, color: "#111827", margin: 0 }}>{employee.name}</p>
                            <p style={{ fontSize: 12, color: "#6b7280", margin: 0 }}>{employee.email}</p>
                          </div>
                        </div>
                        {/* Acciones */}
                        {(can("empleados.editar") || can("empleados.eliminar")) && (
                          <div style={{ display: "flex", gap: 4 }}>
                            <button onClick={() => setViewingEmployee(employee)} style={{ padding: 6, borderRadius: 8, border: "none", background: "transparent", cursor: "pointer", color: "#1a3a2a" }} onMouseEnter={e => (e.currentTarget.style.backgroundColor = "#edf7f4")} onMouseLeave={e => (e.currentTarget.style.backgroundColor = "transparent")}><Eye style={{ width: 15, height: 15 }} /></button>
                            {can("empleados.editar") && <button onClick={() => employee.isActive && handleEdit(employee)} disabled={!employee.isActive} style={{ padding: 6, borderRadius: 8, border: "none", background: "transparent", cursor: employee.isActive ? "pointer" : "not-allowed", color: employee.isActive ? "#1a5c3a" : "#d1d5db", opacity: employee.isActive ? 1 : 0.4 }} onMouseEnter={e => { if (employee.isActive) e.currentTarget.style.backgroundColor = "#edf7f4"; }} onMouseLeave={e => (e.currentTarget.style.backgroundColor = "transparent")}><Pencil style={{ width: 15, height: 15 }} /></button>}
                            {can("empleados.eliminar") && <button onClick={() => employee.isActive && confirmDelete(employee.id)} disabled={!employee.isActive} style={{ padding: 6, borderRadius: 8, border: "none", background: "transparent", cursor: employee.isActive ? "pointer" : "not-allowed", color: employee.isActive ? "#EF4444" : "#d1d5db", opacity: employee.isActive ? 1 : 0.4 }} onMouseEnter={e => { if (employee.isActive) e.currentTarget.style.backgroundColor = "#fef2f2"; }} onMouseLeave={e => (e.currentTarget.style.backgroundColor = "transparent")}><Trash2 style={{ width: 15, height: 15 }} /></button>}
                          </div>
                        )}
                      </div>

                      {/* Info */}
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px 16px", fontSize: 12 }}>
                        <div>
                          <span style={{ color: "#9ca3af", fontSize: 10, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em" }}>Especialidad</span>
                          <div><span style={{ display: "inline-flex", padding: "2px 10px", borderRadius: 999, fontSize: 11, fontWeight: 600, background: "#f3f4f6", color: "#374151", marginTop: 2 }}>{employee.specialty || "—"}</span></div>
                        </div>
                        <div>
                          <span style={{ color: "#9ca3af", fontSize: 10, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em" }}>Teléfono</span>
                          <div style={{ color: "#374151", marginTop: 2 }}>{employee.phone || "—"}</div>
                        </div>
                        <div>
                          <span style={{ color: "#9ca3af", fontSize: 10, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em" }}>Ciudad</span>
                          <div style={{ color: "#374151", marginTop: 2 }}>{employee.ciudad || "—"}</div>
                        </div>
                        <div>
                          <span style={{ color: "#9ca3af", fontSize: 10, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em" }}>Estado</span>
                          <div style={{ marginTop: 4 }}>
                            {can("empleados.editar") ? (
                              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                                <Switch checked={employee.isActive} onCheckedChange={() => handleToggleStatus(employee)} style={employee.isActive ? { backgroundColor: "#4caf82" } : { backgroundColor: "#9ca3af" }} />
                                <span style={{ fontSize: 11, fontWeight: 600, color: employee.isActive ? "#1a5c3a" : "#9ca3af" }}>{employee.isActive ? "Activo" : "Inactivo"}</span>
                              </div>
                            ) : (
                              <span style={{ display: "inline-flex", padding: "2px 10px", borderRadius: 999, fontSize: 11, fontWeight: 600, background: employee.isActive ? "#edf7f4" : "#f3f4f6", color: employee.isActive ? "#1a5c3a" : "#9ca3af" }}>{employee.isActive ? "Activo" : "Inactivo"}</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Paginación */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-2 px-1 table-pagination" style={{ fontFamily: "var(--font-body)" }}>
            <p className="text-sm" style={{ color: "#6b7c6b" }}>
              Mostrando {(currentPage - 1) * ITEMS_PER_PAGE + 1}–{Math.min(currentPage * ITEMS_PER_PAGE, filteredEmployees.length)} de {filteredEmployees.length} empleados
            </p>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="w-8 h-8 flex items-center justify-center rounded-lg text-sm transition-colors disabled:opacity-30"
                style={{ color: "#1a3a2a" }}
                onMouseEnter={e => { if (!e.currentTarget.disabled) e.currentTarget.style.backgroundColor = "#E5E7EB"; }}
                onMouseLeave={e => (e.currentTarget.style.backgroundColor = "transparent")}
              >‹</button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className="w-8 h-8 flex items-center justify-center rounded-lg text-sm font-medium transition-colors"
                  style={page === currentPage ? { backgroundColor: "#1a3a2a", color: "#ffffff" } : { color: "#1a3a2a" }}
                  onMouseEnter={e => { if (page !== currentPage) e.currentTarget.style.backgroundColor = "#E5E7EB"; }}
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
                onMouseEnter={e => { if (!e.currentTarget.disabled) e.currentTarget.style.backgroundColor = "#E5E7EB"; }}
                onMouseLeave={e => (e.currentTarget.style.backgroundColor = "transparent")}
              >›</button>
            </div>
          </div>
        )}

        {/* Dialogs */}
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
    </SpaPage>
  );
}
