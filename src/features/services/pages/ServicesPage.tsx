import { useEffect, useState } from "react";
import { Search, Filter, Wrench, Clock3, Eye, Pencil, Trash2 } from "lucide-react";
import { ServicesModuleProps } from "../types";
import { useServices } from "../hooks/useServices";
import { ServiceFormDialog } from "../components/ServiceFormDialog";
import { ServiceViewDialog } from "../components/ServiceViewDialog";
import { ServiceDeleteDialog } from "../components/ServiceDeleteDialog";
import { Switch } from "../../../shared/ui/switch";
import { ImageWithFallback } from "../../guidelines/figma/ImageWithFallback";

export function ServicesPage({ userRole }: ServicesModuleProps) {
  const {
      categories, loading,
      searchTerm, setSearchTerm,
      filterCategory, setFilterCategory,
      filterStatus, setFilterStatus,
      isDialogOpen, setIsDialogOpen,
      editingService, viewingService, setViewingService,
      deleteDialogOpen, setDeleteDialogOpen,
      formData, setFormData,
      imagePreview, setImagePreview,  // ← agrega setImagePreview
      currentPage, setCurrentPage,
      filteredServices, paginatedServices, totalPages, startIndex, endIndex,
      handleCreateOrUpdate, handleDelete, handleToggleStatus,
      confirmDelete, handleEdit, handleCloseDialog,
    } = useServices();
  const totalServices = filteredServices.length;
  const [openCategory, setOpenCategory] = useState(false);
  const [openStatus, setOpenStatus] = useState(false);
  const activeServices = filteredServices.filter(s => s.isActive).length;

    useEffect(() => {
      const handleClickOutside = () => {
        setOpenCategory(false);
        setOpenStatus(false);
      };
  
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  const averageDuration = totalServices
    ? Math.round(
        filteredServices.reduce((sum, s) => sum + (s.duration || 0), 0) / totalServices
      )
    : 0;

//  Formato de duración: 90 → 1h 30min
  const formatDuration = (minutes: number) => {
    if (!minutes) return "—";
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return h ? `${h}h ${m}min` : `${m} min`;
  };

  return (
    <div className="min-h-screen p-8" style={{ backgroundColor: "#f5f0e8", fontFamily: "var(--font-display)" }}>
      {/* Header */}
      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-4xl font-normal mb-1" style={{ color: "#1a3a2a", fontFamily: "var(--font-display)" }}>
            Gestión de Servicios
          </h1>
          <p className="text-sm" style={{ color: "#6b7c6b", fontFamily: "var(--font-body)" }}>
            Administra el catálogo completo de servicios del spa
          </p>
        </div>

        <ServiceFormDialog
          isOpen={isDialogOpen}
          onOpenChange={setIsDialogOpen}
          editingService={editingService}
          formData={formData}
          setFormData={setFormData}
          imagePreview={imagePreview}
          setImagePreview={setImagePreview}  // ← agrega esto
          categories={categories}
          onSubmit={handleCreateOrUpdate}
          onCancel={handleCloseDialog}
          onNewClick={handleCloseDialog}
          userRole={userRole}
        />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {[
          { label: "Total Servicios", value: totalServices },
          { label: "Servicios Activos", value: activeServices },
          { label: "Duración Promedio", value: formatDuration(averageDuration) },
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
              style={{ color: "#1a3a2a", fontFamily: "var(--font-display)" }}
            >
              {value}
            </p>
          </div>
        ))}
      </div>

      {/* Filtros */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6" style={{ fontFamily: "var(--font-body)" }}>
        <div className="flex items-center gap-2 px-4 py-2 rounded-full border flex-1" style={{ backgroundColor: "#ffffff", borderColor: "#d6cfc4", maxWidth: 380 }}>
          <Search className="w-4 h-4 flex-shrink-0" style={{ color: "#6b7c6b" }} />
          <input
            placeholder="Buscar por nombre o descripción..."
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
            className="bg-transparent outline-none text-sm w-full"
            style={{ color: "#1a3a2a" }}
          />
        </div>
        <div className="flex items-center gap-2">
  <Filter className="w-4 h-4" style={{ color: "#6b7c6b" }} />

  {/* CATEGORÍA */}
  <div className="relative">
    <button
      onClick={(e) => {
        e.stopPropagation();
        setOpenCategory(!openCategory);
        setOpenStatus(false);
      }}
      className="px-4 py-2 rounded-lg border text-sm flex items-center gap-2"
      style={{
        borderColor: "#d6cfc4",
        backgroundColor: "#ffffff",
        color: "#1a3a2a",
        fontFamily: "var(--font-body)"
      }}
    >
      {filterCategory === "all" ? "Todas las categorías" : filterCategory}
      <span style={{ fontSize: 10, color: "#6b7c6b" }}>▼</span>
    </button>

    {openCategory && (
      <div
        className="absolute mt-2 w-56 rounded-xl shadow-md z-10"
        style={{
          backgroundColor: "#ffffff",
          border: "1px solid #ede8e0"
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className="px-4 py-2 text-sm cursor-pointer hover:bg-[#faf7f2]"
          onClick={() => {
            setFilterCategory("all");
            setOpenCategory(false);
            setCurrentPage(1);
          }}
        >
          Todas las categorías
        </div>

        {categories.map((cat) => (
          <div
            key={cat.id}
            className="px-4 py-2 text-sm cursor-pointer hover:bg-[#faf7f2]"
            onClick={() => {
              setFilterCategory(cat.nombre);
              setOpenCategory(false);
              setCurrentPage(1);
            }}
          >
            {cat.nombre}
          </div>
        ))}
      </div>
    )}
  </div>

  {/* ESTADO */}
  <div className="relative">
    <button
      onClick={(e) => {
        e.stopPropagation();
        setOpenStatus(!openStatus);
        setOpenCategory(false);
      }}
      className="px-4 py-2 rounded-lg border text-sm flex items-center gap-2"
      style={{
        borderColor: "#d6cfc4",
        backgroundColor: "#ffffff",
        color: "#1a3a2a",
        fontFamily: "var(--font-body)"
      }}
    >
      {filterStatus === "all"
        ? "Todos"
        : filterStatus === "active"
        ? "Activos"
        : "Inactivos"}
      <span style={{ fontSize: 10, color: "#6b7c6b" }}>▼</span>
    </button>

    {openStatus && (
      <div
        className="absolute mt-2 w-40 rounded-xl shadow-md z-10"
        style={{
          backgroundColor: "#ffffff",
          border: "1px solid #ede8e0"
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className="px-4 py-2 text-sm cursor-pointer hover:bg-[#faf7f2]"
          onClick={() => {
            setFilterStatus("all");
            setOpenStatus(false);
            setCurrentPage(1);
          }}
        >
          Todos
        </div>

        <div
          className="px-4 py-2 text-sm cursor-pointer hover:bg-[#faf7f2]"
          onClick={() => {
            setFilterStatus("active");
            setOpenStatus(false);
            setCurrentPage(1);
          }}
        >
          Activos
        </div>

        <div
          className="px-4 py-2 text-sm cursor-pointer hover:bg-[#faf7f2]"
          onClick={() => {
            setFilterStatus("inactive");
            setOpenStatus(false);
            setCurrentPage(1);
          }}
        >
          Inactivos
        </div>
      </div>
    )}
  </div>
</div>
      </div>

      {/* Lista */}
      {loading ? (
        <p className="text-center py-12 text-sm" style={{ color: "#6b7c6b", fontFamily: "var(--font-body)" }}>
          Cargando servicios...
        </p>
      ) : filteredServices.length === 0 ? (
        <div className="flex flex-col items-center py-16" style={{ fontFamily: "var(--font-body)" }}>
          <Wrench className="w-10 h-10 mb-3" style={{ color: "#d6cfc4" }} />
          <p className="font-medium" style={{ color: "#1a3a2a" }}>No se encontraron servicios</p>
          <p className="text-sm mt-1" style={{ color: "#6b7c6b" }}>
            {searchTerm ? "Intenta con otros términos de búsqueda" : "Comienza agregando tu primer servicio"}
          </p>
        </div>
      ) : (
        <div className="rounded-2xl overflow-hidden shadow-sm" style={{ backgroundColor: "#ffffff" }}>
          <table className="w-full" style={{ fontFamily: "var(--font-body)" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid #ede8e0" }}>
                {["NOMBRE", "CATEGORÍA", "PRECIO", "DURACIÓN", "ESTADO", "ACCIONES"].map((col) => (
                  <th key={col} className="px-6 py-4 text-left text-xs font-semibold tracking-widest" style={{ color: "#6b7c6b" }}>
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paginatedServices.map((service, idx) => (
                <tr
                  key={service.id}
                  style={{ borderBottom: idx < paginatedServices.length - 1 ? "1px solid #ede8e0" : "none", transition: "background 0.15s" }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#faf7f2")}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                >
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
                      {service.image ? (
                        <ImageWithFallback
                          src={service.image}
                          alt={service.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        service.name.charAt(0).toUpperCase()
                      )}
                    </div>

                    <div>
                      <p className="font-medium text-sm" style={{ color: "#1a3a2a" }}>
                        {service.name}
                      </p>
                      <p className="text-xs mt-0.5" style={{ color: "#6b7c6b" }}>
                        {service.description || "Sin descripción"}
                      </p>
                    </div>
                  </div>
                </td>
                  <td className="px-6 py-4">
                    <span style={{ display: "inline-flex", padding: "3px 12px", borderRadius: 999, fontSize: 11, fontWeight: 600, letterSpacing: "0.04em", backgroundColor: "#edf7f4", color: "#1a5c3a" }}>
                      {service.category}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <p className="font-semibold text-sm" style={{ color: "#1a3a2a" }}>${Number(service.price || 0).toLocaleString("es-CO")}</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm flex items-center gap-1" style={{ color: "#1a3a2a" }}>
                      <Clock3 className="w-3.5 h-3.5" style={{ color: "#6b7c6b" }} />
                      {service.duration ? `${service.duration} min` : "—"}
                    </p>
                  </td>
                  <td className="px-6 py-4">
                    {userRole === "admin" ? (
                      <div className="flex items-center gap-2">
                      <Switch
                        checked={service.isActive}
                        onCheckedChange={() => handleToggleStatus(service)}
                        style={
                          service.isActive
                            ? { backgroundColor: "#4caf82" }
                            : { backgroundColor: "#9ca3af" }
                        }
                      />
                      <span
                        className="text-xs font-semibold tracking-wide uppercase"
                        style={{
                          color: service.isActive ? "#1a5c3a" : "#9ca3af"
                        }}
                      >
                        {service.isActive ? "Activo" : "Inactivo"}
                      </span>
                    </div>
                    ) : (
                      <span style={{ display: "inline-flex", padding: "3px 12px", borderRadius: 999, fontSize: 11, fontWeight: 600, letterSpacing: "0.04em", backgroundColor: service.isActive ? "#edf7f4" : "#f3f4f6", color: service.isActive ? "#1a5c3a" : "#6b7280" }}>
                        {service.isActive ? "Activo" : "Inactivo"}
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => setViewingService(service)}
                        title="Ver detalle"
                        className="p-2 rounded-lg transition-colors"
                        style={{ color: "#6b7c6b" }}
                        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#f0ebe3")}
                        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      {userRole === "admin" && service.isActive && (
                        <>
                          <button
                            onClick={() => handleEdit(service)}
                            title="Editar"
                            className="p-2 rounded-lg transition-colors"
                            style={{ color: "#6b7c6b" }}
                            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#f0ebe3")}
                            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => confirmDelete(service.id)}
                            title="Eliminar"
                            className="p-2 rounded-lg transition-colors"
                            style={{ color: "#c0392b" }}
                            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#fdf2f2")}
                            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
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

      {/* Paginación */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-6 px-4" style={{ fontFamily: "var(--font-body)" }}>
          <p className="text-sm" style={{ color: "#6b7c6b" }}>
            Mostrando {startIndex + 1}–{Math.min(endIndex, filteredServices.length)} de {filteredServices.length} servicios
          </p>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="w-8 h-8 flex items-center justify-center rounded-lg text-sm disabled:opacity-30"
              style={{ color: "#1a3a2a" }}
              onMouseEnter={(e) => { if (!e.currentTarget.disabled) e.currentTarget.style.backgroundColor = "#ede8e0"; }}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
            >
              ‹
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
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
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
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
      <ServiceViewDialog service={viewingService} onClose={() => setViewingService(null)} />
      <ServiceDeleteDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen} onConfirm={handleDelete} />
    </div>
  );
}
