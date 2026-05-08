import { Card, CardContent } from "../../../shared/ui/card";
import { Input } from "../../../shared/ui/input";
import { Switch } from "../../../shared/ui/switch";
import { Search, Eye, Pencil, Trash2, Tag, Filter } from "lucide-react";
import { CategoriesModuleProps } from "../types";
import { ITEMS_PER_PAGE } from "../constants";
import { useCategories } from "../hooks/useCategories";
import { CategoryFormDialog } from "../components/CategoryFormDialog";
import { CategoryDetailDialog } from "../components/CategoryDetailDialog";
import { CategoryDeleteDialog } from "../components/CategoryDeleteDialog";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "../../../shared/ui/select";
import { SpaPage } from "../../../shared/components/layout/SpaPage";

export function CategoriesPage({ userRole }: CategoriesModuleProps) {
  // Determinar permisos reales desde localStorage
  const permisos: string[] = (() => {
    try { return JSON.parse(localStorage.getItem("permisos") ?? "[]"); } catch { return []; }
  })();
  const isAdmin      = userRole === "admin";
  const canCreate    = isAdmin || permisos.some(p => p.startsWith("categorias.crear") || p === "categorias.crear");
  const canEdit      = isAdmin || permisos.some(p => p === "categorias.editar");
  const canDelete    = isAdmin || permisos.some(p => p === "categorias.eliminar");
  const canToggle    = isAdmin || permisos.some(p => p === "categorias.editar");
  const showActions  = canCreate || canEdit || canDelete;

  const {
    categories, loading,
    searchTerm, handleSearchChange,
    isDialogOpen, setIsDialogOpen,
    isDetailDialogOpen, setIsDetailDialogOpen,
    isDeleteDialogOpen, setIsDeleteDialogOpen,
    editingCategory, viewingCategory,
    formData, setFormData,
    sortField, sortOrder,
    currentPage, setCurrentPage,
    handleCreateOrUpdate, handleDeleteConfirm,
    handleToggleStatus, handleEdit,
    handleViewDetail, handleDeleteClick,
    handleSort, handleNewClick,
    filterStatus, setFilterStatus,
    filterServices, setFilterServices,
  } = useCategories();

  const filtered = categories
    .filter(c => {
      const matchSearch =
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchStatus =
        filterStatus === "all" ||
        (filterStatus === "active" && c.isActive) ||
        (filterStatus === "inactive" && !c.isActive);
      const matchServices =
        filterServices === "all" ||
        (filterServices === "with" && c.servicesCount > 0) ||
        (filterServices === "without" && c.servicesCount === 0);
      return matchSearch && matchStatus && matchServices;
    })
    .sort((a, b) => {
      const order = sortOrder === "asc" ? 1 : -1;
      return sortField === "name"
        ? a.name.localeCompare(b.name) * order
        : (a.servicesCount - b.servicesCount) * order;
    });

  const totalPages       = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const startIndex       = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginated        = filtered.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  const totalServices    = categories.reduce((sum, c) => sum + c.servicesCount, 0);
  const activeCategories = categories.filter(c => c.isActive).length;

  return (
    <SpaPage
      title="Categorías de Servicios"
      subtitle={`${categories.length} categorías • ${activeCategories} activas`}
      icon={<Tag className="w-6 h-6" style={{ color: "#1a3a2a" }} />}
      action={
        <CategoryFormDialog
          isOpen={isDialogOpen}
          onOpenChange={setIsDialogOpen}
          editingCategory={editingCategory}
          formData={formData}
          setFormData={setFormData}
          onSubmit={handleCreateOrUpdate}
          onNewClick={handleNewClick}
          userRole={userRole}
          canCreate={canCreate}
        />
      }
    >
      <div className="space-y-4">

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { label: "Total Categorías",   value: categories.length },
            { label: "Categorías Activas", value: activeCategories  },
            { label: "Total Servicios",    value: totalServices      },
          ].map(({ label, value }) => (
            <div key={label} className="rounded-2xl shadow-sm p-5 bg-white">
              <p className="text-xs uppercase tracking-widest mb-1" style={{ color: "#6b7c6b", fontFamily: "var(--font-body)" }}>{label}</p>
              <p className="text-3xl font-semibold" style={{ color: "#1a3a2a", fontFamily: "var(--font-body)" }}>{value}</p>
            </div>
          ))}
        </div>

        {/* Filtros */}
        <Card className="border-gray-200 shadow-sm rounded-2xl">
          <CardContent className="p-4">
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex-1 relative" style={{ minWidth: 200 }}>
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Buscar categoría..."
                  value={searchTerm}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  className="pl-9 h-9 rounded-lg border-gray-200 w-full"
                />
              </div>
              <Filter className="w-4 h-4 text-gray-400" />
              <Select value={filterServices} onValueChange={setFilterServices}>
                <SelectTrigger className="h-9 rounded-lg border-gray-200 w-48">
                  <SelectValue placeholder="Servicios" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas las Categorías</SelectItem>
                  <SelectItem value="with">Con servicios</SelectItem>
                  <SelectItem value="without">Sin servicios</SelectItem>
                </SelectContent>
              </Select>

              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="h-9 rounded-lg border-gray-200 w-36">
                  <SelectValue placeholder="Estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="active">Activos</SelectItem>
                  <SelectItem value="inactive">Inactivos</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Tabla */}
        <Card className="border-gray-200 shadow-sm">
          <CardContent className="p-0">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-12 px-4">
                <p className="text-gray-500 text-sm">Cargando categorías...</p>
              </div>
            ) : paginated.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 px-4">
                <Tag className="w-12 h-12 text-gray-300 mb-3" />
                <p className="text-gray-500 text-center">No hay categorías registradas</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200 bg-gray-50/50">
                      <th className="text-left px-4 py-3 text-sm text-gray-700 cursor-pointer select-none" onClick={() => handleSort("name")}>Color</th>
                      <th className="text-left px-4 py-3 text-sm text-gray-700 cursor-pointer select-none" onClick={() => handleSort("name")}>Nombre</th>
                      <th className="text-left px-4 py-3 text-sm text-gray-700 cursor-pointer select-none" onClick={() => handleSort("servicesCount")}>Servicios</th>
                      <th className="text-left px-4 py-3 text-sm text-gray-700">Estado</th>
                      {showActions && <th className="text-center px-4 py-3 text-sm text-gray-700 w-32">Acciones</th>}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {paginated.map((category) => (
                      <tr key={category.id} className="hover:bg-gray-50/50 transition-colors">
                        {/* Color */}
                        <td className="px-4 py-3">
                          <div
                            className="w-9 h-9 rounded-full flex items-center justify-center shadow-sm"
                            style={{ backgroundColor: category.color + "22", border: `2px solid ${category.color}` }}
                          >
                            <div className="w-4 h-4 rounded-full" style={{ backgroundColor: category.color }} />
                          </div>
                        </td>

                        {/* Nombre */}
                        <td className="px-4 py-3">
                          <p className="text-sm font-medium text-gray-900">{category.name}</p>
                          {category.description && (
                            <p className="text-xs text-gray-500 mt-0.5">{category.description}</p>
                          )}
                        </td>

                        {/* Servicios */}
                        <td className="px-4 py-3">
                          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium" style={{ backgroundColor: "#edf7f4", color: "#1a5c3a" }}>
                            <Tag className="w-3 h-3" />
                            {category.servicesCount} servicios
                          </span>
                        </td>

                        {/* Estado */}
                        <td className="px-4 py-3">
                          {canToggle ? (
                            <div className="flex items-center gap-2">
                              <Switch
                                checked={category.isActive}
                                onCheckedChange={() => handleToggleStatus(category)}
                                style={category.isActive ? { backgroundColor: "#4caf82" } : { backgroundColor: "#9ca3af" }}
                              />
                              <span className="text-xs font-semibold tracking-wide uppercase" style={{ color: category.isActive ? "#1a5c3a" : "#9ca3af" }}>
                                {category.isActive ? "Activo" : "Inactivo"}
                              </span>
                            </div>
                          ) : (
                            <span className="inline-flex px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wide"
                              style={category.isActive
                                ? { backgroundColor: "#edf7f4", color: "#1a5c3a" }
                                : { backgroundColor: "#f3f4f6", color: "#9ca3af" }}>
                              {category.isActive ? "Activo" : "Inactivo"}
                            </span>
                          )}
                        </td>

                        {/* Acciones */}
                        {showActions && (
                          <td className="px-4 py-3">
                            <div className="flex items-center justify-center gap-1">
                              <button onClick={() => handleViewDetail(category)} title="Ver detalle"
                                className="p-2 rounded-lg transition-colors"
                                style={{ color: "#1a3a2a" }}
                                onMouseEnter={e => (e.currentTarget.style.backgroundColor = "#edf7f4")}
                                onMouseLeave={e => (e.currentTarget.style.backgroundColor = "transparent")}>
                                <Eye className="w-4 h-4" />
                              </button>
                              {canEdit && (
                                <button onClick={() => category.isActive && handleEdit(category)}
                                  title={category.isActive ? "Editar" : "Activa la categoría para editar"}
                                  disabled={!category.isActive} className="p-2 rounded-lg transition-colors"
                                  style={{ color: category.isActive ? "#1a5c3a" : "#d1d5db", cursor: category.isActive ? "pointer" : "not-allowed" }}
                                  onMouseEnter={e => { if (category.isActive) e.currentTarget.style.backgroundColor = "#edf7f4"; }}
                                  onMouseLeave={e => (e.currentTarget.style.backgroundColor = "transparent")}>
                                  <Pencil className="w-4 h-4" />
                                </button>
                              )}
                              {canDelete && (
                                <button onClick={() => category.isActive && handleDeleteClick(category.id)}
                                  title={category.isActive ? "Eliminar" : "Activa la categoría para eliminar"}
                                  disabled={!category.isActive} className="p-2 rounded-lg transition-colors"
                                  style={{ color: category.isActive ? "#EF4444" : "#d1d5db", cursor: category.isActive ? "pointer" : "not-allowed" }}
                                  onMouseEnter={e => { if (category.isActive) e.currentTarget.style.backgroundColor = "#fef2f2"; }}
                                  onMouseLeave={e => (e.currentTarget.style.backgroundColor = "transparent")}>
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                          </td>
                        )}
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
              Mostrando {startIndex + 1}–{Math.min(startIndex + ITEMS_PER_PAGE, filtered.length)} de {filtered.length} categorías
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
        <CategoryDetailDialog
          isOpen={isDetailDialogOpen}
          onOpenChange={setIsDetailDialogOpen}
          category={viewingCategory}
        />
        <CategoryDeleteDialog
          isOpen={isDeleteDialogOpen}
          onOpenChange={setIsDeleteDialogOpen}
          onConfirm={handleDeleteConfirm}
        />
      </div>
    </SpaPage>
  );
}
