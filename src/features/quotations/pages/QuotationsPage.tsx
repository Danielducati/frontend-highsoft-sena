import { FileText, Search, Filter, Eye, Edit, X } from "lucide-react";
import { QuotationsModuleProps, QuotationStatus } from "../types";
import { ITEMS_PER_PAGE, STATUS_COLORS, STATUS_LABELS, STATUS_OPTIONS } from "../constants";
import { useQuotations } from "../hooks/useQuotations";
import { QuotationFormDialog } from "../components/QuotationFormDialog";
import { QuotationViewDialog } from "../components/QuotationViewDialog";
import { QuotationCancelDialog } from "../components/QuotationCancelDialog";

// Badge de estado reutilizable
function StatusBadge({ status }: { status: QuotationStatus }) {
  const colors: Record<string, React.CSSProperties> = {
    pending:   { backgroundColor: "#fef9ec", color: "#b45309" },
    approved:  { backgroundColor: "#edf7f4", color: "#1a5c3a" },
    cancelled: { backgroundColor: "#fdf0ee", color: "#c0392b" },
    completed: { backgroundColor: "#eff6ff", color: "#1e40af" },
  };
  const style = colors[status] ?? { backgroundColor: "#f3f4f6", color: "#6b7280" };
  return (
    <span style={{
      display: "inline-flex", padding: "3px 12px", borderRadius: 999,
      fontSize: 11, fontWeight: 600, textTransform: "uppercase",
      letterSpacing: "0.06em", fontFamily: "var(--font-body)", ...style,
    }}>
      {STATUS_LABELS[status] ?? status}
    </span>
  );
}

export function QuotationsPage({ userRole }: QuotationsModuleProps) {
  const {
    loading,
    searchTerm, setSearchTerm,
    filterStatus, setFilterStatus,
    isDialogOpen, setIsDialogOpen,
    viewingQuotation, setViewingQuotation,
    editingQuotation,
    cancelDialogOpen, setCancelDialogOpen,
    formData, setFormData,
    clients, availableServices,
    currentPage, setCurrentPage, totalPages, startIndex,
    filteredQuotations, paginatedQuotations,
    totalAmount, pendingCount, approvedCount,
    handleCreate, handleStatusChange, handleCancel,
    confirmCancel, handleEdit, resetForm,
    addService, removeService, updateQuantity,
    calculateSubtotal, calculateTotal,
    filterClient, setFilterClient
  } = useQuotations();

  return (
    <div className="min-h-screen p-8" style={{ backgroundColor: "#f5f0e8", fontFamily: "var(--font-display)" }}>

      {/* ── Header ── */}
      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-4xl font-normal mb-1" style={{ color: "#1a3a2a", fontFamily: "var(--font-display)" }}>
            Gestión de Cotizaciones
          </h1>
          <p className="text-sm" style={{ color: "#6b7c6b", fontFamily: "var(--font-body)" }}>
            Administra las cotizaciones personalizadas del spa
          </p>
        </div>
        <QuotationFormDialog
          isOpen={isDialogOpen} onOpenChange={setIsDialogOpen}
          editingQuotation={editingQuotation}
          formData={formData} setFormData={setFormData}
          clients={clients} availableServices={availableServices}
          calculateSubtotal={calculateSubtotal} calculateTotal={calculateTotal}
          addService={addService} removeService={removeService} updateQuantity={updateQuantity}
          onSubmit={handleCreate} onCancel={resetForm} onNewClick={resetForm}
          userRole={userRole}
        />
      </div>

      {/* ── Stats ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {[
          { label: "Pendientes",  value: pendingCount },
          { label: "Aprobadas",   value: approvedCount },
          { label: "Valor Total", value: `$${totalAmount.toLocaleString("es-CO")}` },
        ].map(({ label, value }) => (
          <div key={label} className="rounded-2xl shadow-sm p-5" style={{ backgroundColor: "#ffffff" }}>
            <p className="text-xs uppercase tracking-widest mb-1" style={{ color: "#6b7c6b", fontFamily: "var(--font-body)" }}>
              {label}
            </p>
            <p className="text-3xl font-semibold" style={{ color: "#1a3a2a", fontFamily: "var(--font-display)" }}>
              {value}
            </p>
          </div>
        ))}
      </div>

      {/* ── Filtros ── */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6" style={{ fontFamily: "var(--font-body)" }}>
        {/* BUSCADOR */}
        <div className="flex items-center gap-2 px-4 py-2 rounded-full border flex-1"
          style={{ backgroundColor: "#ffffff", borderColor: "#d6cfc4", maxWidth: 340 }}>
          <Search className="w-4 h-4 flex-shrink-0" style={{ color: "#6b7c6b" }} />
          <input
            placeholder="Buscar por cliente..."
            value={searchTerm}
            onChange={e => { setSearchTerm(e.target.value); setCurrentPage(1); }}
            className="bg-transparent outline-none text-sm w-full"
            style={{ color: "#1a3a2a" }}
          />
        </div>

        {/* FILTRO CLIENTE */}
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4" style={{ color: "#6b7c6b" }} />
          <select
            value={filterClient}
            onChange={e => { setFilterClient(e.target.value); setCurrentPage(1); }}
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
            <option value="all">Todos los clientes</option>
            {clients.map(client => (
              <option key={client.id} value={client.id}>
                {client.name}
              </option>
            ))}
          </select>
        </div>

        {/* FILTRO ESTADO */}
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4" style={{ color: "#6b7c6b" }} />
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
            <option value="all">Todos los estados</option>
            {STATUS_OPTIONS.map(({ value, label }) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </div>
      </div>
      {/* ── Tabla ── */}
      <div className="rounded-2xl overflow-hidden shadow-sm" style={{ backgroundColor: "#ffffff" }}>
        {loading ? (
          <p className="text-center py-12 text-sm" style={{ color: "#6b7c6b", fontFamily: "var(--font-body)" }}>
            Cargando cotizaciones...
          </p>
        ) : paginatedQuotations.length === 0 ? (
          <div className="flex flex-col items-center py-16" style={{ fontFamily: "var(--font-body)" }}>
            <FileText className="w-10 h-10 mb-3" style={{ color: "#d6cfc4" }} />
            <p className="font-medium" style={{ color: "#1a3a2a" }}>No se encontraron cotizaciones</p>
            <p className="text-sm mt-1" style={{ color: "#6b7c6b" }}>Intenta ajustar los filtros de búsqueda</p>
          </div>
        ) : (
          <table className="w-full" style={{ fontFamily: "var(--font-body)" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid #ede8e0" }}>
                {["N°", "CLIENTE", "SERVICIOS", "VALOR", "ESTADO", "FECHA", "ACCIONES"].map(col => (
                  <th key={col} className="px-6 py-4 text-left text-xs font-semibold tracking-widest" style={{ color: "#6b7c6b" }}>
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paginatedQuotations.map((q, idx) => (
                <tr
                  key={q.id}
                  style={{ borderBottom: idx < paginatedQuotations.length - 1 ? "1px solid #ede8e0" : "none", transition: "background 0.15s" }}
                  onMouseEnter={e => (e.currentTarget.style.backgroundColor = "#faf7f2")}
                  onMouseLeave={e => (e.currentTarget.style.backgroundColor = "transparent")}
                >
                  {/* N° */}
                  <td className="px-6 py-4">
                    <span className="text-sm font-mono" style={{ color: "#6b7c6b" }}>
                      #{q.id.toString().padStart(4, "0")}
                    </span>
                  </td>

                  {/* Cliente */}
                  <td className="px-6 py-4">
                    <p className="font-medium text-sm" style={{ color: "#1a3a2a" }}>{q.clientName}</p>
                    <p className="text-xs mt-0.5" style={{ color: "#6b7c6b" }}>{q.clientEmail}</p>
                  </td>

                  {/* Servicios */}
                  <td className="px-6 py-4">
                    <span className="inline-flex px-3 py-1 rounded-full text-xs font-medium"
                      style={{ backgroundColor: "#eff6ff", color: "#1e40af" }}>
                      {q.items?.length || 0} servicio{(q.items?.length || 0) !== 1 ? "s" : ""}
                    </span>
                  </td>

                  {/* Valor */}
                  <td className="px-6 py-4">
                    <p className="font-semibold text-sm" style={{ color: "#1a3a2a" }}>
                      ${(q.total || 0).toLocaleString("es-CO")}
                    </p>
                    {q.discount > 0 && (
                      <p className="text-xs mt-0.5" style={{ color: "#1a5c3a" }}>
                        -{q.discount.toLocaleString("es-CO")} desc.
                      </p>
                    )}
                  </td>

                  {/* Estado */}
                  <td className="px-6 py-4">
                    {userRole !== "client" ? (
                      <select
                        value={q.status}
                        onChange={e => handleStatusChange(q.id, e.target.value as any)}
                        style={{
                          padding: "4px 10px", borderRadius: 8, border: "1px solid #d6cfc4",
                          backgroundColor: "#faf7f2", color: "#1a3a2a",
                          fontSize: 12, fontFamily: "var(--font-body)", outline: "none", cursor: "pointer",
                        }}
                      >
                        {STATUS_OPTIONS.map(({ value, label }) => (
                          <option key={value} value={value}>{label}</option>
                        ))}
                      </select>
                    ) : (
                      <StatusBadge status={q.status} />
                    )}
                  </td>

                  {/* Fecha */}
                  <td className="px-6 py-4">
                    <p className="text-sm" style={{ color: "#1a3a2a" }}>
                      {q.date
                        ? new Date(q.date).toLocaleDateString("es-ES", { day: "2-digit", month: "2-digit", year: "numeric" })
                        : "—"}
                    </p>
                  </td>

                  {/* Acciones */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1">
                      <button onClick={() => setViewingQuotation(q)} title="Ver detalles"
                        className="p-2 rounded-lg transition-colors" style={{ color: "#6b7c6b" }}
                        onMouseEnter={e => (e.currentTarget.style.backgroundColor = "#f0ebe3")}
                        onMouseLeave={e => (e.currentTarget.style.backgroundColor = "transparent")}>
                        <Eye className="w-4 h-4" />
                      </button>
                      {userRole !== "client" && (
                        <>
                          <button onClick={() => handleEdit(q)} title="Editar"
                            className="p-2 rounded-lg transition-colors" style={{ color: "#6b7c6b" }}
                            onMouseEnter={e => (e.currentTarget.style.backgroundColor = "#f0ebe3")}
                            onMouseLeave={e => (e.currentTarget.style.backgroundColor = "transparent")}>
                            <Edit className="w-4 h-4" />
                          </button>
                          {q.status !== "cancelled" && (
                            <button onClick={() => confirmCancel(q.id)} title="Cancelar cotización"
                              className="p-2 rounded-lg transition-colors" style={{ color: "#c0392b" }}
                              onMouseEnter={e => (e.currentTarget.style.backgroundColor = "#fdf0ee")}
                              onMouseLeave={e => (e.currentTarget.style.backgroundColor = "transparent")}>
                              <X className="w-4 h-4" />
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
        )}
      </div>

      {/* ── Paginación ── */}
      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row gap-3 mb-6" style={{ fontFamily: "var(--font-body)" }}>

        {/* BUSCADOR */}
        <div className="flex items-center gap-2 px-4 py-2 rounded-full border flex-1"
          style={{ backgroundColor: "#ffffff", borderColor: "#d6cfc4", maxWidth: 340 }}>
          <Search className="w-4 h-4 flex-shrink-0" style={{ color: "#6b7c6b" }} />
          <input
            placeholder="Buscar por cliente..."
            value={searchTerm}
            onChange={e => { setSearchTerm(e.target.value); setCurrentPage(1); }}
            className="bg-transparent outline-none text-sm w-full"
            style={{ color: "#1a3a2a" }}
          />
        </div>
      
        {/* FILTRO CLIENTE */}
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4" style={{ color: "#6b7c6b" }} />
          <select
            value={filterClient}
            onChange={e => { setFilterClient(e.target.value); setCurrentPage(1); }}
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
            <option value="all">Todos los clientes</option>
            {clients.map(client => (
              <option key={client.id} value={client.id}>
                {client.name}
              </option>
            ))}
          </select>
        </div>
      
        {/* FILTRO ESTADO */}
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4" style={{ color: "#6b7c6b" }} />
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
            <option value="all">Todos los estados</option>
            {STATUS_OPTIONS.map(({ value, label }) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </div>
      
      </div>
      )}

      {/* ── Dialogs ── */}
      <QuotationViewDialog quotation={viewingQuotation} onClose={() => setViewingQuotation(null)} />
      <QuotationCancelDialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen} onConfirm={handleCancel} />
    </div>
  );
}
