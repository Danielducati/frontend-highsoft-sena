import { Card, CardContent } from "../../../shared/ui/card";
import { Input } from "../../../shared/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../shared/ui/select";
import { Search, Filter, Wrench, Clock3, Eye, Pencil, Trash2 } from "lucide-react";
import { ServicesModuleProps } from "../types";
import { useServices } from "../hooks/useServices";
import { ServiceFormDialog } from "../components/ServiceFormDialog";
import { ServiceViewDialog } from "../components/ServiceViewDialog";
import { ServiceDeleteDialog } from "../components/ServiceDeleteDialog";
import { Switch } from "../../../shared/ui/switch";
import { ImageWithFallback } from "../../guidelines/figma/ImageWithFallback";
import { SpaPage } from "../../../shared/components/layout/SpaPage";
import { usePermisos } from "../../../shared/hooks/usePermisos";

export function ServicesPage({ userRole }: ServicesModuleProps) {
  const { can } = usePermisos();
  const {
    categories, loading,
    searchTerm, setSearchTerm,
    filterCategory, setFilterCategory,
    filterStatus, setFilterStatus,
    isDialogOpen, setIsDialogOpen,
    editingService, viewingService, setViewingService,
    deleteDialogOpen, setDeleteDialogOpen,
    formData, setFormData,
    imagePreview, setImagePreview,
    currentPage, setCurrentPage,
    filteredServices, paginatedServices, totalPages, startIndex, endIndex,
    handleCreateOrUpdate, handleDelete, handleToggleStatus,
    confirmDelete, handleEdit, handleCloseDialog,
  } = useServices();

  const totalServices  = filteredServices.length;
  const activeServices = filteredServices.filter(s => s.isActive).length;

  const averageDuration = totalServices
    ? Math.round(filteredServices.reduce((sum, s) => sum + (s.duration || 0), 0) / totalServices)
    : 0;

  const formatDuration = (minutes: number) => {
    if (!minutes) return "—";
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return h ? `${h}h ${m}min` : `${m} min`;
  };

  return (
    <SpaPage
      title="Gestión de Servicios"
      subtitle="Administra el catálogo completo de servicios del spa"
      icon={<Wrench className="w-6 h-6" style={{ color: "#1a3a2a" }} />}
      action={
        <ServiceFormDialog
          isOpen={isDialogOpen}
          onOpenChange={setIsDialogOpen}
          editingService={editingService}
          formData={formData}
          setFormData={setFormData}
          imagePreview={imagePreview}
          setImagePreview={setImagePreview}
          categories={categories}
          onSubmit={handleCreateOrUpdate}
          onCancel={handleCloseDialog}
          onNewClick={handleCloseDialog}
          userRole={userRole}
        />
      }
    >
      <div className="space-y-4">

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { label: "Total Servicios",    value: totalServices },
            { label: "Servicios Activos",  value: activeServices },
            { label: "Duración Promedio",  value: formatDuration(averageDuration) },
          ].map(({ label, value }) => (
            <div key={label} className="rounded-2xl shadow-sm p-5 bg-white">
              <p className="text-xs font-medium mb-1" style={{ color: "#6b7c6b", fontFamily: "var(--font-body)" }}>{label}</p>
              <p className="text-3xl font-semibold" style={{ color: "#1a3a2a", fontFamily: "var(--font-body)" }}>{value}</p>
            </div>
          ))}
        </div>

        {/* Filtros */}
        <Card className="border-gray-200 shadow-sm rounded-2xl">
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Buscar por nombre o descripción..."
                  value={searchTerm}
                  onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                  className="pl-9 h-9 rounded-lg border-gray-200 w-full"
                />
              </div>
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-gray-400" />
                <Select value={filterCategory} onValueChange={v => { setFilterCategory(v); setCurrentPage(1); }}>
                  <SelectTrigger className="h-9 rounded-lg border-gray-200 w-52">
                    <SelectValue placeholder="Todas las categorías" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas las categorías</SelectItem>
                    {categories.map(cat => (
                      <SelectItem key={cat.id} value={cat.nombre}>{cat.nombre}</SelectItem>
                    ))}
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
                <p className="text-gray-500 text-sm">Cargando servicios...</p>
              </div>
            ) : filteredServices.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 px-4">
                <Wrench className="w-12 h-12 text-gray-300 mb-3" />
                <p className="text-gray-500 text-center">No se encontraron servicios</p>
                <p className="text-sm text-gray-400 mt-1">
                  {searchTerm ? "Intenta con otros términos de búsqueda" : "Comienza agregando tu primer servicio"}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200 bg-gray-50/50">
                      <th className="text-left px-4 py-3 text-sm text-gray-700">Nombre</th>
                      <th className="text-left px-4 py-3 text-sm text-gray-700">Categoría</th>
                      <th className="text-left px-4 py-3 text-sm text-gray-700">Precio</th>
                      <th className="text-left px-4 py-3 text-sm text-gray-700">Duración</th>
                      <th className="text-left px-4 py-3 text-sm text-gray-700">Estado</th>
                      <th className="text-center px-4 py-3 text-sm text-gray-700 w-32">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {paginatedServices.map((service) => (
                      <tr key={service.id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-4 py-3">
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
                              {service.image ? (
                                <ImageWithFallback src={service.image} alt={service.name} className="w-full h-full object-cover" />
                              ) : (
                                service.name.charAt(0).toUpperCase()
                              )}
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-900">{service.name}</p>
                              <p className="text-xs text-gray-500 mt-0.5">{service.description || "Sin descripción"}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span style={{ display: "inline-flex", padding: "3px 12px", borderRadius: 999, fontSize: 11, fontWeight: 600, letterSpacing: "0.04em", backgroundColor: "#edf7f4", color: "#1a5c3a" }}>
                            {service.category}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <p className="text-sm font-semibold text-gray-900">${Number(service.price || 0).toLocaleString("es-CO")}</p>
                        </td>
                        <td className="px-4 py-3">
                          <p className="text-sm flex items-center gap-1 text-gray-900">
                            <Clock3 className="w-3.5 h-3.5 text-gray-400" />
                            {service.duration ? `${service.duration} min` : "—"}
                          </p>
                        </td>
                        <td className="px-4 py-3">
                          {can("servicios.editar") ? (
                            <div className="flex items-center gap-2">
                              <Switch
                                checked={service.isActive}
                                onCheckedChange={() => handleToggleStatus(service)}
                                style={service.isActive ? { backgroundColor: "#4caf82" } : { backgroundColor: "#9ca3af" }}
                              />
                              <span className="text-xs font-semibold" style={{ color: service.isActive ? "#1a5c3a" : "#9ca3af" }}>
                                {service.isActive ? "Activo" : "Inactivo"}
                              </span>
                            </div>
                          ) : (
                            <span style={{ display: "inline-flex", padding: "3px 12px", borderRadius: 999, fontSize: 11, fontWeight: 600, letterSpacing: "0.04em", backgroundColor: service.isActive ? "#edf7f4" : "#f3f4f6", color: service.isActive ? "#1a5c3a" : "#6b7280" }}>
                              {service.isActive ? "Activo" : "Inactivo"}
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-center gap-1">
                            <button
                              onClick={() => setViewingService(service)}
                              title="Ver detalle"
                              className="p-2 rounded-lg transition-colors"
                              style={{ color: "#1a3a2a" }}
                              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#edf7f4")}
                              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            {can("servicios.editar") && (
                              <>
                                <button
                                  onClick={() => service.isActive && handleEdit(service)}
                                  title={service.isActive ? "Editar" : "Activa el servicio para editar"}
                                  disabled={!service.isActive}
                                  className="p-2 rounded-lg transition-colors"
                                  style={{ color: service.isActive ? "#1a5c3a" : "#d1d5db", cursor: service.isActive ? "pointer" : "not-allowed" }}
                                  onMouseEnter={(e) => { if (service.isActive) e.currentTarget.style.backgroundColor = "#edf7f4"; }}
                                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                                >
                                  <Pencil className="w-4 h-4" />
                                </button>
                                {can("servicios.eliminar") && (
                                  <button
                                    onClick={() => service.isActive && confirmDelete(service.id)}
                                    title={service.isActive ? "Eliminar" : "Activa el servicio para eliminar"}
                                    disabled={!service.isActive}
                                    className="p-2 rounded-lg transition-colors"
                                    style={{ color: service.isActive ? "#EF4444" : "#d1d5db", cursor: service.isActive ? "pointer" : "not-allowed" }}
                                    onMouseEnter={(e) => { if (service.isActive) e.currentTarget.style.backgroundColor = "#fef2f2"; }}
                                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                )}
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Paginación */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-2 px-1" style={{ fontFamily: "var(--font-body)" }}>
            <p className="text-sm" style={{ color: "#6b7c6b" }}>
              Mostrando {startIndex + 1}–{Math.min(endIndex, filteredServices.length)} de {filteredServices.length} servicios
            </p>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="w-8 h-8 flex items-center justify-center rounded-lg text-sm disabled:opacity-30"
                style={{ color: "#1a3a2a" }}
                onMouseEnter={(e) => { if (!e.currentTarget.disabled) e.currentTarget.style.backgroundColor = "#E5E7EB"; }}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
              >‹</button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className="w-8 h-8 flex items-center justify-center rounded-lg text-sm font-medium"
                  style={page === currentPage ? { backgroundColor: "#1a3a2a", color: "#ffffff" } : { color: "#1a3a2a" }}
                  onMouseEnter={(e) => { if (page !== currentPage) e.currentTarget.style.backgroundColor = "#E5E7EB"; }}
                  onMouseLeave={(e) => { if (page !== currentPage) e.currentTarget.style.backgroundColor = "transparent"; }}
                >
                  {page}
                </button>
              ))}
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="w-8 h-8 flex items-center justify-center rounded-lg text-sm disabled:opacity-30"
                style={{ color: "#1a3a2a" }}
                onMouseEnter={(e) => { if (!e.currentTarget.disabled) e.currentTarget.style.backgroundColor = "#E5E7EB"; }}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
              >›</button>
            </div>
          </div>
        )}

        {/* Dialogs */}
        <ServiceViewDialog service={viewingService} onClose={() => setViewingService(null)} />
        <ServiceDeleteDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen} onConfirm={handleDelete} />
      </div>
    </SpaPage>
  );
}
