import { useState, useEffect } from "react";
import { Card, CardContent } from "../../../shared/ui/card";
import { Button } from "../../../shared/ui/button";
import { Input } from "../../../shared/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../../shared/ui/table";
import { Switch } from "../../../shared/ui/switch";
import { Search, Eye, Pencil, Trash2, Tag, Filter } from "lucide-react";
import { CategoriesModuleProps } from "../types";
import { ITEMS_PER_PAGE } from "../constants";
import { useCategories } from "../hooks/useCategories";
import { CategoryFormDialog } from "../components/CategoryFormDialog";
import { CategoryDetailDialog } from "../components/CategoryDetailDialog";
import { CategoryDeleteDialog } from "../components/CategoryDeleteDialog";
import { Select,SelectTrigger,SelectValue,SelectContent,SelectItem,} from "../../../shared/ui/select";

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

  const totalPages      = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const startIndex      = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginated       = filtered.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  const totalServices   = categories.reduce((sum, c) => sum + c.servicesCount, 0);
  const activeCategories = categories.filter(c => c.isActive).length;

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
  Categorías de Servicios
</h1>
          <p className="text-sm" style={{ color: "#6b7c6b", fontFamily: "var(--font-body)" }}>
            Organiza y clasifica tus servicios
          </p>
        </div>

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
      </div>

      {/* ── Stats ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {[
          { label: "Total Categorías",   value: categories.length },
          { label: "Categorías Activas", value: activeCategories  },
          { label: "Total Servicios",    value: totalServices      },
        ].map(({ label, value }) => (
          <Card
            key={label}
            className="border-0 shadow-sm"
            style={{ backgroundColor: "#ffffff" }}
          >
            <CardContent className="p-6">
              <p
                className="text-xs uppercase tracking-widest mb-1"
                style={{ color: "#6b7c6b", fontFamily: "var(--font-body)" }}
              >
                {label}
              </p>
              <p className="text-3xl font-semibold" style={{ color: "#1a3a2a", fontFamily: "var(--font-body)" }}>
                {value}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* ── Search bar ── */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <div
          className="flex items-center gap-2 px-4 py-2 rounded-full border"
          style={{
            backgroundColor: "#ffffff",
            borderColor: "#d6cfc4",
            maxWidth: 320,
            flex: 1,
            fontFamily: "var(--font-body)",
          }}
        >
          <Search className="w-4 h-4" style={{ color: "#6b7c6b" }} />
          <input
            placeholder="Buscar categoría..."
            value={searchTerm}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="bg-transparent outline-none text-sm w-full"
            style={{ color: "#1a3a2a" }}
          />
        </div>
        <Filter className="w-4 h-4" style={{ color: "#6b7c6b" }} />
        {/* 🟢 Filtro Servicios */}
        <Select value={filterServices} onValueChange={setFilterServices}>
          <SelectTrigger
            className="w-[180px] rounded-lg border"
            style={{
              backgroundColor: "#ffffff",
              borderColor: "#d6cfc4",
              color: "#1a3a2a",
              fontFamily: "var(--font-body)"
            }}>
            <SelectValue placeholder="Servicios" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas las Categorias</SelectItem>
            <SelectItem value="with">Con servicios</SelectItem>
            <SelectItem value="without">Sin servicios</SelectItem>
          </SelectContent>
        </Select>

        {/* 🟢 Filtro Estado */}
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger
            className="w-[160px] rounded-lg border"
            style={{
              backgroundColor: "#ffffff",
              borderColor: "#d6cfc4",
              color: "#1a3a2a",
              fontFamily: "var(--font-body)"
            }}
          >
            <SelectValue placeholder="Estado" />
          </SelectTrigger>

          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="active">Activos</SelectItem>
            <SelectItem value="inactive">Inactivos</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* ── Table ── */}
      <div
        className="rounded-2xl overflow-hidden shadow-sm"
        style={{ backgroundColor: "#ffffff" }}
      >
        {loading ? (
          <p
            className="text-center py-12 text-sm"
            style={{ color: "#6b7c6b", fontFamily: "var(--font-body)" }}
          >
            Cargando categorías...
          </p>
        ) : paginated.length === 0 ? (
          <p
            className="text-center py-12 text-sm"
            style={{ color: "#6b7c6b", fontFamily: "var(--font-body)" }}
          >
            No hay categorías registradas
          </p>
        ) : (
          <table className="w-full" style={{ fontFamily: "var(--font-body)" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid #ede8e0" }}>
                {[
                  { label: "COLOR",     key: null             },
                  { label: "NOMBRE",    key: "name"           },
                  { label: "SERVICIOS", key: "servicesCount"  },
                  { label: "ESTADO",    key: null             },
                  ...(showActions ? [{ label: "ACCIONES", key: null }] : []),
                ].map(({ label, key }) => (
                  <th
                    key={label}
                    className="px-6 py-4 text-left text-xs font-semibold tracking-widest cursor-pointer select-none"
                    style={{ color: "#6b7c6b" }}
                    onClick={() => key && handleSort(key as "name" | "servicesCount")}
                  >
                    {label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paginated.map((category, idx) => (
                <tr
                  key={category.id}
                  style={{
                    borderBottom: idx < paginated.length - 1 ? "1px solid #ede8e0" : "none",
                    transition: "background 0.15s",
                  }}
                  onMouseEnter={e => (e.currentTarget.style.backgroundColor = "#faf7f2")}
                  onMouseLeave={e => (e.currentTarget.style.backgroundColor = "transparent")}
                >
                  {/* Color */}
                  <td className="px-6 py-4">
                    <div
                      className="w-9 h-9 rounded-full flex items-center justify-center shadow-sm"
                      style={{ backgroundColor: category.color + "22", border: `2px solid ${category.color}` }}
                    >
                      <div
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: category.color }}
                      />
                    </div>
                  </td>

                  {/* Nombre */}
                  <td className="px-6 py-4">
                    <p className="font-medium" style={{ color: "#1a3a2a" }}>{category.name}</p>
                    {category.description && (
                      <p className="text-xs mt-0.5" style={{ color: "#6b7c6b" }}>
                        {category.description}
                      </p>
                    )}
                  </td>

                  {/* Servicios */}
                  <td className="px-6 py-4">
                    <span
                      className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium"
                      style={{ backgroundColor: "#edf7f4", color: "#1a5c3a" }}
                    >
                      <Tag className="w-3 h-3" />
                      {category.servicesCount} servicios
                    </span>
                  </td>

                  {/* Estado */}
                  <td className="px-6 py-4">
                    {canToggle ? (
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={category.isActive}
                          onCheckedChange={() => handleToggleStatus(category)}
                          style={category.isActive ? { backgroundColor: "#4caf82" } : { backgroundColor: "#9ca3af" }}
                        />
                        <span className="text-xs font-semibold tracking-wide uppercase"
                          style={{ color: category.isActive ? "#1a5c3a" : "#9ca3af" }}>
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
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1">
                        <button onClick={() => handleViewDetail(category)} title="Ver detalle"
                          className="p-2 rounded-lg transition-colors" style={{ color: "#6b7c6b" }}
                          onMouseEnter={e => (e.currentTarget.style.backgroundColor = "#f0ebe3")}
                          onMouseLeave={e => (e.currentTarget.style.backgroundColor = "transparent")}>
                          <Eye className="w-4 h-4" />
                        </button>
                        {canEdit && (
                          <button onClick={() => category.isActive && handleEdit(category)}
                            title={category.isActive ? "Editar" : "Activa la categoría para editar"}
                            disabled={!category.isActive} className="p-2 rounded-lg transition-colors"
                            style={{ color: category.isActive ? "#6b7c6b" : "#d1d5db", cursor: category.isActive ? "pointer" : "not-allowed" }}
                            onMouseEnter={e => { if (category.isActive) e.currentTarget.style.backgroundColor = "#f0ebe3"; }}
                            onMouseLeave={e => (e.currentTarget.style.backgroundColor = "transparent")}>
                            <Pencil className="w-4 h-4" />
                          </button>
                        )}
                        {canDelete && (
                          <button onClick={() => category.isActive && handleDeleteClick(category.id)}
                            title={category.isActive ? "Eliminar" : "Activa la categoría para eliminar"}
                            disabled={!category.isActive} className="p-2 rounded-lg transition-colors"
                            style={{ color: category.isActive ? "#c0392b" : "#d1d5db", cursor: category.isActive ? "pointer" : "not-allowed" }}
                            onMouseEnter={e => { if (category.isActive) e.currentTarget.style.backgroundColor = "#fdf0ee"; }}
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
        )}
      </div>

      {/* ── Paginación ── */}
      {totalPages > 1 && (
        <div
          className="flex items-center justify-between mt-6 px-4"
          style={{ fontFamily: "var(--font-body)" }}
        >
          <p className="text-sm" style={{ color: "#6b7c6b" }}>
            Mostrando {startIndex + 1}–{Math.min(startIndex + ITEMS_PER_PAGE, filtered.length)} de{" "}
            {filtered.length} categorías
          </p>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="w-8 h-8 flex items-center justify-center rounded-lg text-sm transition-colors disabled:opacity-30"
              style={{ color: "#1a3a2a" }}
              onMouseEnter={e => !e.currentTarget.disabled && (e.currentTarget.style.backgroundColor = "#ede8e0")}
              onMouseLeave={e => (e.currentTarget.style.backgroundColor = "transparent")}
            >
              ‹
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className="w-8 h-8 flex items-center justify-center rounded-lg text-sm font-medium transition-colors"
                style={
                  page === currentPage
                    ? { backgroundColor: "#1a3a2a", color: "#ffffff" }
                    : { color: "#1a3a2a" }
                }
                onMouseEnter={e => {
                  if (page !== currentPage)
                    e.currentTarget.style.backgroundColor = "#ede8e0";
                }}
                onMouseLeave={e => {
                  if (page !== currentPage)
                    e.currentTarget.style.backgroundColor = "transparent";
                }}
              >
                {page}
              </button>
            ))}

            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="w-8 h-8 flex items-center justify-center rounded-lg text-sm transition-colors disabled:opacity-30"
              style={{ color: "#1a3a2a" }}
              onMouseEnter={e => !e.currentTarget.disabled && (e.currentTarget.style.backgroundColor = "#ede8e0")}
              onMouseLeave={e => (e.currentTarget.style.backgroundColor = "transparent")}
            >
              ›
            </button>
          </div>
        </div>
      )}

      {/* ── Dialogs ── */}
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
  );
}
