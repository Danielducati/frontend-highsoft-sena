// src/features/clients/pages/ClientsPage.tsx
import React from "react";
import { User, Mail, Phone, Search, Filter, ShoppingBag, Eye, Pencil, Trash2 } from "lucide-react";
import { SpaPage } from "../../../shared/components/layout/SpaPage";
import { ClientsModuleProps } from "../types";
import { ITEMS_PER_PAGE } from "../constants";
import { useClients } from "../hooks/useClients";
import { ClientFormDialog } from "../components/ClientFormDialog";
import { ClientViewDialog } from "../components/ClientViewDialog";
import { ClientDeleteDialog } from "../components/ClientDeleteDialog";

export function ClientsPage({ userRole }: ClientsModuleProps) {
  const {
    clients, filteredClients, paginatedClients,
    searchTerm, handleSearchChange,
    filterStatus, handleFilterChange,
    isDialogOpen, setIsDialogOpen,
    editingClient, viewingClient, setViewingClient,
    deleteDialogOpen, setDeleteDialogOpen,
    formData, setFormData,
    imagePreview, setImagePreview,
    currentPage, setCurrentPage, totalPages,
    handleCreateOrUpdate, handleDelete,
    handleEdit, handleToggleStatus,
    confirmDelete, resetForm, handleNewClick,
  } = useClients();

  const activeClients = clients.filter(c => c.isActive).length;
  const startIndex    = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex      = Math.min(startIndex + ITEMS_PER_PAGE, filteredClients.length);

  return (
    <SpaPage
      title="Gestión de Clientes"
      subtitle={`${clients.length} clientes • ${activeClients} activos`}
      icon={<User className="w-6 h-6" style={{ color: "#1a3a2a" }} />}
      action={
        <ClientFormDialog
          isOpen={isDialogOpen}
          onOpenChange={setIsDialogOpen}
          editingClient={editingClient}
          formData={formData}
          setFormData={setFormData}
          imagePreview={imagePreview}
          setImagePreview={setImagePreview}
          onSubmit={handleCreateOrUpdate}
          onCancel={resetForm}
          onNewClick={handleNewClick}
        />
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
              onChange={(e) => handleSearchChange(e.target.value)}
              className="bg-transparent outline-none text-sm w-full"
              style={{ color: "#1a3a2a" }}
            />
          </div>
          <div className="flex items-center gap-2" style={{ fontFamily: "var(--font-body)" }}>
            <Filter className="w-4 h-4" style={{ color: "#6b7c6b" }} />
            <select
              value={filterStatus}
              onChange={(e) => handleFilterChange(e.target.value)}
              style={{ padding: "8px 14px", borderRadius: 10, border: "1px solid #d6cfc4", backgroundColor: "#ffffff", color: "#1a3a2a", fontSize: 13, fontFamily: "var(--font-body)", outline: "none" }}
            >
              <option value="all">Todos</option>
              <option value="active">Activos</option>
              <option value="inactive">Inactivos</option>
            </select>
          </div>
        </div>

        {/* Tabla */}
        {filteredClients.length === 0 ? (
          <div className="flex flex-col items-center py-16" style={{ fontFamily: "var(--font-body)" }}>
            <User className="w-10 h-10 mb-3" style={{ color: "#d6cfc4" }} />
            <p className="font-medium" style={{ color: "#1a3a2a" }}>No se encontraron clientes</p>
            <p className="text-sm mt-1" style={{ color: "#6b7c6b" }}>Intenta ajustar los filtros de búsqueda</p>
          </div>
        ) : (
          <div className="rounded-2xl overflow-hidden shadow-sm" style={{ backgroundColor: "#ffffff" }}>
            <table className="w-full" style={{ fontFamily: "var(--font-body)" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid #ede8e0" }}>
                  {["NOMBRE", "CONTACTO", "SERVICIOS", "ESTADO", "ACCIONES"].map((col) => (
                    <th key={col} className="px-6 py-4 text-left text-xs font-semibold tracking-widest" style={{ color: "#6b7c6b" }}>{col}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {paginatedClients.map((client, idx) => (
                  <tr
                    key={client.id}
                    style={{ borderBottom: idx < paginatedClients.length - 1 ? "1px solid #ede8e0" : "none", transition: "background 0.15s" }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#faf7f2")}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-9 h-9 rounded-full overflow-hidden flex-shrink-0" style={{ border: "2px solid #c8ead9" }}>
                          {client.image ? (
                            <img src={client.image} alt={client.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-white text-sm" style={{ background: "linear-gradient(135deg, #78D1BD, #5FBFAA)" }}>
                              {client.name.charAt(0)}
                            </div>
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-sm truncate" style={{ color: "#1a3a2a" }}>{client.name}</p>
                          {client.numero_documento && (
                            <p className="text-xs truncate" style={{ color: "#6b7c6b" }}>{client.tipo_documento ? `${client.tipo_documento}: ` : ""}{client.numero_documento}</p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <Mail className="w-3.5 h-3.5 flex-shrink-0" style={{ color: "#6b7c6b" }} />
                          <span className="text-xs truncate" style={{ color: "#1a3a2a" }}>{client.email}</span>
                        </div>
                        <div className="flex items-center gap-1.5 mt-1">
                          <Phone className="w-3.5 h-3.5 flex-shrink-0" style={{ color: "#6b7c6b" }} />
                          <span className="text-xs" style={{ color: "#1a3a2a" }}>{client.phone}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm flex items-center gap-1.5" style={{ color: "#1a3a2a" }}>
                        <ShoppingBag className="w-3.5 h-3.5" style={{ color: "#6b7c6b" }} />
                        {client.totalVisits} servicios
                      </p>
                    </td>

                    {/* ── SWITCH DE ESTADO ── */}
                    <td className="px-6 py-4">
                      {userRole === "admin" ? (
                        <button
                          onClick={() => handleToggleStatus(client.id)}
                          title={client.isActive ? "Desactivar cliente" : "Activar cliente"}
                          style={{
                            position: "relative",
                            display: "inline-flex",
                            alignItems: "center",
                            width: 44,
                            height: 24,
                            borderRadius: 999,
                            border: "none",
                            cursor: "pointer",
                            backgroundColor: client.isActive ? "#1a5c3a" : "#d1d5db",
                            transition: "background 0.2s",
                            padding: 0,
                          }}
                        >
                          <span
                            style={{
                              position: "absolute",
                              left: client.isActive ? 22 : 2,
                              width: 20,
                              height: 20,
                              borderRadius: "50%",
                              backgroundColor: "#ffffff",
                              boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
                              transition: "left 0.2s",
                            }}
                          />
                        </button>
                      ) : (
                        <span style={{ display: "inline-flex", padding: "3px 12px", borderRadius: 999, fontSize: 11, fontWeight: 600, backgroundColor: client.isActive ? "#edf7f4" : "#f3f4f6", color: client.isActive ? "#1a5c3a" : "#6b7280" }}>
                          {client.isActive ? "Activo" : "Inactivo"}
                        </span>
                      )}
                    </td>

                    {/* ── ACCIONES — deshabilitadas si inactivo ── */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => setViewingClient(client)}
                          title="Ver detalles"
                          className="p-2 rounded-lg transition-colors"
                          style={{ color: "#6b7c6b" }}
                          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#f0ebe3")}
                          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        {userRole === "admin" && (
                          <>
                            <button
                              onClick={() => client.isActive && handleEdit(client)}
                              title={client.isActive ? "Editar" : "Activa el cliente para editar"}
                              disabled={!client.isActive}
                              className="p-2 rounded-lg transition-colors"
                              style={{ color: client.isActive ? "#6b7c6b" : "#d1d5db", cursor: client.isActive ? "pointer" : "not-allowed" }}
                              onMouseEnter={(e) => { if (client.isActive) e.currentTarget.style.backgroundColor = "#f0ebe3"; }}
                              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                            >
                              <Pencil className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => client.isActive && confirmDelete(client.id)}
                              title={client.isActive ? "Eliminar" : "Activa el cliente para eliminar"}
                              disabled={!client.isActive}
                              className="p-2 rounded-lg transition-colors"
                              style={{ color: client.isActive ? "#c0392b" : "#d1d5db", cursor: client.isActive ? "pointer" : "not-allowed" }}
                              onMouseEnter={(e) => { if (client.isActive) e.currentTarget.style.backgroundColor = "#fdf2f2"; }}
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
            <p className="text-sm" style={{ color: "#6b7c6b" }}>Mostrando {startIndex + 1}–{endIndex} de {filteredClients.length} clientes</p>
            <div className="flex items-center gap-1">
              <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="w-8 h-8 flex items-center justify-center rounded-lg text-sm disabled:opacity-30" style={{ color: "#1a3a2a" }}>‹</button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <button key={page} onClick={() => setCurrentPage(page)} className="w-8 h-8 flex items-center justify-center rounded-lg text-sm font-medium" style={page === currentPage ? { backgroundColor: "#1a3a2a", color: "#ffffff" } : { color: "#1a3a2a" }}>
                  {page}
                </button>
              ))}
              <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="w-8 h-8 flex items-center justify-center rounded-lg text-sm disabled:opacity-30" style={{ color: "#1a3a2a" }}>›</button>
            </div>
          </div>
        )}

        <ClientViewDialog client={viewingClient} onClose={() => setViewingClient(null)} />
        <ClientDeleteDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen} onConfirm={handleDelete} />
      </div>
    </SpaPage>
  );
}
