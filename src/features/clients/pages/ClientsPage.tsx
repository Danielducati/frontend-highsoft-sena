// src/features/clients/pages/ClientsPage.tsx
import React from "react";
import { Card, CardContent } from "../../../shared/ui/card";
import { Input } from "../../../shared/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../shared/ui/select";
import { User, Mail, Phone, Search, Filter, ShoppingBag, Eye, Pencil, Trash2 } from "lucide-react";
import { SpaPage } from "../../../shared/components/layout/SpaPage";
import { ClientsModuleProps } from "../types";
import { ITEMS_PER_PAGE } from "../constants";
import { useClients } from "../hooks/useClients";
import { ClientFormDialog } from "../components/ClientFormDialog";
import { ClientViewDialog } from "../components/ClientViewDialog";
import { ClientDeleteDialog } from "../components/ClientDeleteDialog";
import { usePermisos } from "../../../shared/hooks/usePermisos";

export function ClientsPage({ userRole }: ClientsModuleProps) {
  const { can } = usePermisos();
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
        can("clientes.crear") ? (
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
        ) : undefined
      }
    >
      <div className="space-y-4">

        {/* Filtros */}
        <Card className="border-gray-200 shadow-sm rounded-2xl">
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Buscar por nombre, correo o teléfono..."
                  value={searchTerm}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  className="pl-9 h-9 rounded-lg border-gray-200 w-full"
                />
              </div>
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-gray-400" />
                <Select value={filterStatus} onValueChange={handleFilterChange}>
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
            {filteredClients.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 px-4">
                <User className="w-12 h-12 text-gray-300 mb-3" />
                <p className="text-gray-500 text-center">No se encontraron clientes</p>
                <p className="text-sm text-gray-400 mt-1">Intenta ajustar los filtros de búsqueda</p>
              </div>
            ) : (
              <div className="overflow-x-auto -mx-4 sm:mx-0">
                <div className="inline-block min-w-full align-middle px-4 sm:px-0">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200 bg-gray-50/50">
                        <th className="text-left px-4 py-3 text-sm text-gray-700 whitespace-nowrap">Nombre</th>
                        <th className="text-left px-4 py-3 text-sm text-gray-700 whitespace-nowrap">Contacto</th>
                        <th className="text-left px-4 py-3 text-sm text-gray-700 whitespace-nowrap">Servicios</th>
                        <th className="text-left px-4 py-3 text-sm text-gray-700 whitespace-nowrap">Estado</th>
                        <th className="text-center px-4 py-3 text-sm text-gray-700 w-32 whitespace-nowrap">Acciones</th>
                      </tr>
                    </thead>
                  <tbody className="divide-y divide-gray-200">
                    {paginatedClients.map((client) => (
                      <tr key={client.id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-4 py-3">
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
                              <p className="text-sm font-medium text-gray-900 truncate">{client.name}</p>
                              {client.numero_documento && (
                                <p className="text-xs text-gray-500 truncate">{client.tipo_documento ? `${client.tipo_documento}: ` : ""}{client.numero_documento}</p>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                              <Mail className="w-3.5 h-3.5 flex-shrink-0 text-gray-400" />
                              <span className="text-xs text-gray-900 truncate">{client.email}</span>
                            </div>
                            <div className="flex items-center gap-1.5 mt-1">
                              <Phone className="w-3.5 h-3.5 flex-shrink-0 text-gray-400" />
                              <span className="text-xs text-gray-900">{client.phone}</span>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <p className="text-sm flex items-center gap-1.5 text-gray-900">
                            <ShoppingBag className="w-3.5 h-3.5 text-gray-400" />
                            {client.totalVisits} servicios
                          </p>
                        </td>

                        {/* SWITCH DE ESTADO */}
                        <td className="px-4 py-3">
                          {can("clientes.editar") ? (
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

                        {/* ACCIONES */}
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-center gap-1">
                            <button
                              onClick={() => setViewingClient(client)}
                              title="Ver detalles"
                              className="p-2 rounded-lg transition-colors"
                              style={{ color: "#1a3a2a" }}
                              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#edf7f4")}
                              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            {can("clientes.editar") && (
                              <button
                                onClick={() => client.isActive && handleEdit(client)}
                                title={client.isActive ? "Editar" : "Activa el cliente para editar"}
                                disabled={!client.isActive}
                                className="p-2 rounded-lg transition-colors"
                                style={{ color: client.isActive ? "#1a5c3a" : "#d1d5db", cursor: client.isActive ? "pointer" : "not-allowed" }}
                                onMouseEnter={(e) => { if (client.isActive) e.currentTarget.style.backgroundColor = "#edf7f4"; }}
                                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                              >
                                <Pencil className="w-4 h-4" />
                              </button>
                            )}
                            {can("clientes.eliminar") && (
                              <button
                                onClick={() => client.isActive && confirmDelete(client.id)}
                                title={client.isActive ? "Eliminar" : "Activa el cliente para eliminar"}
                                disabled={!client.isActive}
                                className="p-2 rounded-lg transition-colors"
                                style={{ color: client.isActive ? "#EF4444" : "#d1d5db", cursor: client.isActive ? "pointer" : "not-allowed" }}
                                onMouseEnter={(e) => { if (client.isActive) e.currentTarget.style.backgroundColor = "#fef2f2"; }}
                                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Paginación */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-2 px-1" style={{ fontFamily: "var(--font-body)" }}>
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
