import { FileText, Search, Filter, Eye, Pencil, X, CheckCircle } from "lucide-react";
import { QuotationsModuleProps, QuotationStatus } from "../types";
import { ITEMS_PER_PAGE, STATUS_LABELS, STATUS_OPTIONS } from "../constants";
import { useQuotations } from "../hooks/useQuotations";
import { QuotationFormDialog } from "../components/QuotationFormDialog";
import { QuotationViewDialog } from "../components/QuotationViewDialog";
import { QuotationCancelDialog } from "../components/QuotationCancelDialog";
import { QuotationStatusChangeDialog } from "../components/QuotationStatusChangeDialog";
import { SpaPage } from "../../../shared/components/layout/SpaPage";
import { Card, CardContent } from "../../../shared/ui/card";

function StatusBadge({ status }: { status: QuotationStatus }) {
  const colors: Record<string, React.CSSProperties> = {
    pending:   { backgroundColor: "#fef9ec", color: "#b45309" },
    approved:  { backgroundColor: "#edf7f4", color: "#1a5c3a" },
    cancelled: { backgroundColor: "#fdf0ee", color: "#c0392b" },
    completed: { backgroundColor: "#edf7f4", color: "#1e40af" },
  };
  const style = colors[status] ?? { backgroundColor: "#f3f4f6", color: "#6b7280" };
  return (
    <span style={{
      display: "inline-flex", padding: "3px 12px", borderRadius: 999,
      fontSize: 11, fontWeight: 600,
      letterSpacing: "0.04em", fontFamily: "var(--font-body)", ...style,
    }}>
      {STATUS_LABELS[status] ?? status}
    </span>
  );
}

function formatQuotationDate(date?: string) {
  if (!date) return "—";
  const [y, m, d] = date.split("T")[0].split("-");
  return `${d}/${m}/${y}`;
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
    addService, removeService, updateQuantity, updateServiceEmployee,
    calculateSubtotal, calculateTotal,
    filterClient, setFilterClient,
    myClientData, employees, employeesForService, loadEmployeesForService,
    statusChangeDialogOpen, setStatusChangeDialogOpen,
    pendingStatusChange, confirmStatusChange,
  } = useQuotations(userRole);

  const renderActions = (q: typeof paginatedQuotations[0]) => (
    <div className="mod-card-actions">
      <button onClick={() => setViewingQuotation(q)} title="Ver detalles"
        className="p-1.5 rounded-lg" style={{ color: "#6b7c6b", border: "none", background: "transparent", cursor: "pointer" }}>
        <Eye className="w-4 h-4" />
      </button>
      {userRole === "client" && q.status === "pending" && (
        <button onClick={() => handleStatusChange(q.id, "approved")} title="Aprobar cotización"
          className="p-1.5 rounded-lg" style={{ color: "#1a5c3a", border: "none", background: "transparent", cursor: "pointer" }}>
          <CheckCircle className="w-4 h-4" />
        </button>
      )}
      {userRole !== "client" && (
        <>
          <button onClick={() => handleEdit(q)} title={q.status !== "pending" ? "Solo se pueden editar cotizaciones pendientes" : "Editar"}
            disabled={q.status !== "pending"}
            className="p-1.5 rounded-lg disabled:opacity-40" style={{ color: q.status === "pending" ? "#6b7c6b" : "#9ca3af", border: "none", background: "transparent", cursor: q.status === "pending" ? "pointer" : "not-allowed" }}>
            <Pencil className="w-4 h-4" />
          </button>
          {q.status === "pending" && (
            <button onClick={() => confirmCancel(q.id)} title="Cancelar cotización"
              className="p-1.5 rounded-lg" style={{ color: "#c0392b", border: "none", background: "transparent", cursor: "pointer" }}>
              <X className="w-4 h-4" />
            </button>
          )}
        </>
      )}
    </div>
  );

  return (
    <SpaPage
      title="Gestión de Cotizaciones"
      subtitle="Administra las cotizaciones personalizadas del spa"
      icon={<FileText className="w-6 h-6" style={{ color: "#1a3a2a" }} />}
      action={
        <QuotationFormDialog
          isOpen={isDialogOpen} onOpenChange={setIsDialogOpen}
          editingQuotation={editingQuotation}
          formData={formData} setFormData={setFormData}
          clients={clients} availableServices={availableServices}
          employees={employees}
          employeesForService={employeesForService}
          loadEmployeesForService={loadEmployeesForService}
          calculateSubtotal={calculateSubtotal} calculateTotal={calculateTotal}
          addService={addService} removeService={removeService}
          updateQuantity={updateQuantity} updateServiceEmployee={updateServiceEmployee}
          onSubmit={handleCreate} onCancel={resetForm} onNewClick={resetForm}
          userRole={userRole}
          myClientData={myClientData}
        />
      }
    >
      <div className="space-y-4">

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { label: "Pendientes",  value: pendingCount },
            { label: "Aprobadas",   value: approvedCount },
            { label: "Valor Total", value: `$${totalAmount.toLocaleString("es-CO")}` },
          ].map(({ label, value }) => (
            <div key={label} className="rounded-2xl shadow-sm p-5 bg-white">
              <p className="text-xs font-medium mb-1" style={{ color: "#6b7c6b", fontFamily: "var(--font-body)" }}>{label}</p>
              <p className="text-2xl sm:text-3xl font-semibold" style={{ color: "#1a3a2a", fontFamily: "var(--font-body)" }}>{value}</p>
            </div>
          ))}
        </div>

        {/* Filtros */}
        <Card className="border-gray-200 shadow-sm rounded-2xl">
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-3 filter-row">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  placeholder="Buscar por cliente..."
                  value={searchTerm}
                  onChange={e => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                  className="pl-9 h-9 rounded-lg border border-gray-200 w-full text-sm outline-none"
                  style={{ color: "#1a3a2a", fontFamily: "var(--font-body)", paddingLeft: 36 }}
                />
              </div>
              <div className="flex items-center gap-2 filter-selects">
                <Filter className="w-4 h-4 text-gray-400 flex-shrink-0" />
                <select
                  value={filterClient}
                  onChange={e => { setFilterClient(e.target.value); setCurrentPage(1); }}
                  className="h-9 rounded-lg border border-gray-200 px-3 text-sm flex-1 min-w-0"
                  style={{ color: "#1a3a2a", fontFamily: "var(--font-body)", backgroundColor: "#fff" }}
                >
                  <option value="all">Todos los clientes</option>
                  {clients.map(client => (
                    <option key={client.id} value={client.id}>{client.name}</option>
                  ))}
                </select>
                <select
                  value={filterStatus}
                  onChange={e => { setFilterStatus(e.target.value); setCurrentPage(1); }}
                  className="h-9 rounded-lg border border-gray-200 px-3 text-sm flex-1 min-w-0"
                  style={{ color: "#1a3a2a", fontFamily: "var(--font-body)", backgroundColor: "#fff" }}
                >
                  <option value="all">Todos los estados</option>
                  {STATUS_OPTIONS.map(({ value, label }) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabla / Tarjetas */}
        <Card className="border-gray-200 shadow-sm">
          <CardContent className="p-0">
            {loading ? (
              <p className="text-center py-12 text-sm" style={{ color: "#6b7c6b", fontFamily: "var(--font-body)" }}>
                Cargando cotizaciones...
              </p>
            ) : paginatedQuotations.length === 0 ? (
              <div className="flex flex-col items-center py-16" style={{ fontFamily: "var(--font-body)" }}>
                <FileText className="w-10 h-10 mb-3" style={{ color: "#E5E7EB" }} />
                <p className="font-medium" style={{ color: "#1a3a2a" }}>No se encontraron cotizaciones</p>
                <p className="text-sm mt-1" style={{ color: "#6b7c6b" }}>Intenta ajustar los filtros de búsqueda</p>
              </div>
            ) : (
              <>
                <div className="mod-table module-table-scroll overflow-x-auto">
                  <table className="w-full" style={{ fontFamily: "var(--font-body)", minWidth: 600 }}>
                    <thead>
                      <tr style={{ borderBottom: "1px solid #E5E7EB" }}>
                        {["N°", "Cliente", "Servicios", "Valor", "Estado", "Fecha", "Acciones"].map(col => (
                          <th key={col} className="px-4 sm:px-6 py-4 text-left text-xs font-semibold whitespace-nowrap" style={{ color: "#6b7c6b" }}>
                            {col}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedQuotations.map((q, idx) => (
                        <tr key={q.id}
                          style={{ borderBottom: idx < paginatedQuotations.length - 1 ? "1px solid #E5E7EB" : "none" }}>
                          <td className="px-4 sm:px-6 py-4">
                            <span className="text-sm font-mono" style={{ color: "#6b7c6b" }}>#{q.id.toString().padStart(4, "0")}</span>
                          </td>
                          <td className="px-4 sm:px-6 py-4">
                            <p className="font-medium text-sm" style={{ color: "#1a3a2a" }}>{q.clientName}</p>
                            <p className="text-xs mt-0.5" style={{ color: "#6b7c6b" }}>{q.clientEmail}</p>
                          </td>
                          <td className="px-4 sm:px-6 py-4">
                            <span className="inline-flex px-3 py-1 rounded-full text-xs font-medium" style={{ backgroundColor: "#edf7f4", color: "#1e40af" }}>
                              {q.items?.length || 0} servicio{(q.items?.length || 0) !== 1 ? "s" : ""}
                            </span>
                          </td>
                          <td className="px-4 sm:px-6 py-4">
                            <p className="font-semibold text-sm" style={{ color: "#1a3a2a" }}>${(q.total || 0).toLocaleString("es-CO")}</p>
                            {q.discount > 0 && (
                              <p className="text-xs mt-0.5" style={{ color: "#1a5c3a" }}>-{q.discount.toLocaleString("es-CO")} desc.</p>
                            )}
                          </td>
                          <td className="px-4 sm:px-6 py-4">
                            {userRole !== "client" ? (
                              <select value={q.status} onChange={e => handleStatusChange(q.id, e.target.value as QuotationStatus)}
                                className="text-xs rounded-lg border border-gray-200 px-2 py-1"
                                style={{ backgroundColor: "#fff", color: "#1a3a2a", fontFamily: "var(--font-body)" }}>
                                {STATUS_OPTIONS.map(({ value, label }) => (
                                  <option key={value} value={value}>{label}</option>
                                ))}
                              </select>
                            ) : (
                              <StatusBadge status={q.status} />
                            )}
                          </td>
                          <td className="px-4 sm:px-6 py-4">
                            <p className="text-sm" style={{ color: "#1a3a2a" }}>{formatQuotationDate(q.date)}</p>
                          </td>
                          <td className="px-4 sm:px-6 py-4">
                            <div className="flex items-center gap-1">{renderActions(q)}</div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Tarjetas móvil */}
                <div className="mod-cards">
                  {paginatedQuotations.map((q) => (
                    <div key={q.id} className="mod-card">
                      <div className="mod-card-header">
                        <div className="min-w-0">
                          <p className="text-xs font-mono text-gray-500">#{q.id.toString().padStart(4, "0")}</p>
                          <p className="text-sm font-semibold text-gray-900 truncate">{q.clientName}</p>
                          <p className="text-xs text-gray-500 truncate">{q.clientEmail}</p>
                        </div>
                        {renderActions(q)}
                      </div>
                      <div className="mod-card-grid">
                        <div>
                          <span className="mod-card-label">Servicios</span>
                          <div className="mod-card-value">{q.items?.length || 0} servicio{(q.items?.length || 0) !== 1 ? "s" : ""}</div>
                        </div>
                        <div>
                          <span className="mod-card-label">Valor</span>
                          <div className="mod-card-value font-semibold">${(q.total || 0).toLocaleString("es-CO")}</div>
                        </div>
                        <div>
                          <span className="mod-card-label">Fecha</span>
                          <div className="mod-card-value">{formatQuotationDate(q.date)}</div>
                        </div>
                        <div>
                          <span className="mod-card-label">Estado</span>
                          <div className="mod-card-value mt-1">
                            {userRole !== "client" ? (
                              <select value={q.status} onChange={e => handleStatusChange(q.id, e.target.value as QuotationStatus)}
                                className="text-xs rounded-lg border border-gray-200 px-2 py-1 w-full"
                                style={{ backgroundColor: "#fff", color: "#1a3a2a", fontFamily: "var(--font-body)" }}>
                                {STATUS_OPTIONS.map(({ value, label }) => (
                                  <option key={value} value={value}>{label}</option>
                                ))}
                              </select>
                            ) : (
                              <StatusBadge status={q.status} />
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
              Mostrando {startIndex + 1}–{Math.min(startIndex + ITEMS_PER_PAGE, filteredQuotations.length)} de {filteredQuotations.length} cotizaciones
            </p>
            <div className="flex items-center gap-1">
              <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}
                className="w-8 h-8 flex items-center justify-center rounded-lg text-sm disabled:opacity-30" style={{ color: "#1a3a2a" }}>‹</button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <button key={page} onClick={() => setCurrentPage(page)}
                  className="w-8 h-8 flex items-center justify-center rounded-lg text-sm font-medium"
                  style={page === currentPage ? { backgroundColor: "#1a3a2a", color: "#ffffff" } : { color: "#1a3a2a" }}>
                  {page}
                </button>
              ))}
              <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}
                className="w-8 h-8 flex items-center justify-center rounded-lg text-sm disabled:opacity-30" style={{ color: "#1a3a2a" }}>›</button>
            </div>
          </div>
        )}

        <QuotationViewDialog
          quotation={viewingQuotation}
          onClose={() => setViewingQuotation(null)}
          userRole={userRole}
          onApprove={async (id) => { await handleStatusChange(id, "approved"); }}
        />
        <QuotationCancelDialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen} onConfirm={handleCancel} />

        {pendingStatusChange && (
          <QuotationStatusChangeDialog
            open={statusChangeDialogOpen}
            onOpenChange={setStatusChangeDialogOpen}
            onConfirm={confirmStatusChange}
            currentStatus={pendingStatusChange.currentStatus}
            newStatus={pendingStatusChange.newStatus}
            quotationId={pendingStatusChange.quotationId}
          />
        )}
      </div>
    </SpaPage>
  );
}
