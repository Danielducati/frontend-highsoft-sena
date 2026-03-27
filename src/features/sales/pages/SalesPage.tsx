import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "../../../shared/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "../../../shared/ui/alert-dialog";
import { Plus, Search, Filter, ShoppingCart, AlertCircle } from "lucide-react";
import { useSales } from "../hooks/useSales";
import { SaleForm } from "../components/SaleForm";
import { SalesTable } from "../components/SalesTable";
import { SaleDetailDialog } from "../components/SaleDetailDialog";
import { EMPTY_FORM, PAYMENT_METHODS } from "../constants";
import { Sale, SaleFormData, SalesModuleProps } from "../types";
import { toast } from "sonner";

export function SalesPage({ userRole }: SalesModuleProps) {
  const { sales, appointments, availableServices, clients, loading, saving, registerSale } = useSales();

  const [searchTerm,     setSearchTerm]    = useState("");
  const [filterPayment,  setFilterPayment] = useState("all");
  const [currentPage,    setCurrentPage]   = useState(1);
  const itemsPerPage = 5;

  const [isDialogOpen,     setIsDialogOpen]     = useState(false);
  const [saleType,         setSaleType]         = useState<"appointment" | "direct">("direct");
  const [selectedSale,     setSelectedSale]     = useState<Sale | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [formData,         setFormData]         = useState<SaleFormData>(EMPTY_FORM);

  const filteredSales = sales.filter(sale => {
    const matchSearch  = (sale.Cliente || "").toLowerCase().includes(searchTerm.toLowerCase());
    const matchPayment = filterPayment === "all" || sale.metodo_pago === filterPayment;
    return matchSearch && matchPayment;
  });

  const totalPages     = Math.ceil(filteredSales.length / itemsPerPage);
  const startIndex     = (currentPage - 1) * itemsPerPage;
  const paginatedSales = filteredSales.slice(startIndex, startIndex + itemsPerPage);
  const totalRevenue   = sales.reduce((sum, s) => sum + (s.Total || 0), 0);

  const resetForm = () => { setIsDialogOpen(false); setFormData(EMPTY_FORM); setSaleType("direct"); };

  const handleSaleTypeChange = (value: "appointment" | "direct") => { setSaleType(value); setFormData(EMPTY_FORM); };

  const handleAppointmentSelect = (appointmentId: string) => {
    const appt = appointments.find(a => a.id === parseInt(appointmentId));
    if (!appt) return;
    const service = availableServices.find(s =>
      s.name === appt.service || appt.service?.includes(s.name) || s.name?.includes(appt.service)
    );
    setFormData(prev => ({
      ...prev,
      appointmentId: appt.id,
      clientName: appt.clientName,
      selectedServices: service ? [{ serviceId: service.id, serviceName: service.name, price: appt.precio || service.price, quantity: 1 }] : [],
    }));
    toast.success(`Cita seleccionada: ${appt.clientName}`);
  };

  const handleAddService = (serviceId: number) => {
    const service = availableServices.find(s => s.id === serviceId);
    if (!service) return;
    const existing = formData.selectedServices.findIndex(s => s.serviceId === serviceId);
    if (existing >= 0) {
      const updated = [...formData.selectedServices];
      updated[existing].quantity += 1;
      setFormData(prev => ({ ...prev, selectedServices: updated }));
    } else {
      setFormData(prev => ({ ...prev, selectedServices: [...prev.selectedServices, { serviceId: service.id, serviceName: service.name, price: service.price, quantity: 1 }] }));
    }
  };

  const handleUpdateQuantity = (serviceId: number, quantity: number) => {
    setFormData(prev => ({ ...prev, selectedServices: prev.selectedServices.map(s => s.serviceId === serviceId ? { ...s, quantity: Math.max(1, quantity) } : s) }));
  };

  const handleRemoveService = (serviceId: number) => {
    setFormData(prev => ({ ...prev, selectedServices: prev.selectedServices.filter(s => s.serviceId !== serviceId) }));
  };

  const handleSubmit = async () => { const ok = await registerSale(formData, saleType); if (ok) resetForm(); };

  return (
    <div className="min-h-screen p-8" style={{ backgroundColor: "#f5f0e8", fontFamily: "var(--font-display)" }}>

      {/* ── Header ── */}
      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-4xl font-normal mb-1" style={{ color: "#1a3a2a", fontFamily: "var(--font-display)" }}>
            Gestión de Ventas
          </h1>
          <p className="text-sm" style={{ color: "#6b7c6b", fontFamily: "var(--font-body)" }}>
            Registra y administra las transacciones del spa
          </p>
        </div>

        {userRole !== "client" && (
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <button style={{
                display: "inline-flex", alignItems: "center", gap: 8,
                padding: "10px 20px", borderRadius: 10, backgroundColor: "#1a3a2a",
                color: "#ffffff", fontSize: 14, fontWeight: 600, fontFamily: "var(--font-body)",
                border: "none", cursor: "pointer",
              }}
                onMouseEnter={e => (e.currentTarget.style.backgroundColor = "#2a5a40")}
                onMouseLeave={e => (e.currentTarget.style.backgroundColor = "#1a3a2a")}>
                <Plus className="w-4 h-4" /> Registrar Venta
              </button>
            </DialogTrigger>
            <DialogContent style={{
              backgroundColor: "#faf7f2", borderRadius: 16, border: "1px solid #ede8e0",
              padding: 32, maxWidth: 680, maxHeight: "90vh", overflowY: "auto",
            }}>
              <DialogHeader>
                <DialogTitle style={{ fontFamily: "var(--font-display)", fontSize: 22, color: "#1a3a2a", fontWeight: "normal" }}>
                  Registrar Nueva Venta
                </DialogTitle>
                <DialogDescription style={{ color: "#6b7c6b", fontSize: 13 }}>
                  Completa la información de la venta
                </DialogDescription>
              </DialogHeader>
              <SaleForm
                formData={formData} setFormData={setFormData}
                saleType={saleType} onSaleTypeChange={handleSaleTypeChange}
                appointments={appointments} availableServices={availableServices}
                clients={clients} saving={saving}
                onSubmit={handleSubmit} onCancel={resetForm}
                onAppointmentSelect={handleAppointmentSelect}
                onAddService={handleAddService}
                onUpdateQuantity={handleUpdateQuantity}
                onRemoveService={handleRemoveService}
              />
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* ── Stats ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {[
          { label: "Total Ventas",   value: sales.length },
          { label: "Ingresos Totales", value: `$${totalRevenue.toLocaleString("es-CO")}` },
          { label: "Este mes",       value: `$${sales.filter(s => {
            const d = new Date(s.Fecha);
            const now = new Date();
            return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
          }).reduce((sum, s) => sum + (s.Total || 0), 0).toLocaleString("es-CO")}` },
        ].map(({ label, value }) => (
          <div key={label} className="rounded-2xl shadow-sm p-5" style={{ backgroundColor: "#ffffff" }}>
            <p className="text-xs uppercase tracking-widest mb-1" style={{ color: "#6b7c6b", fontFamily: "sans-serif" }}>{label}</p>
            <p className="text-3xl font-semibold" style={{ color: "#1a3a2a", fontFamily: "'Georgia', serif" }}>{value}</p>
          </div>
        ))}
      </div>

      {/* ── Filtros ── */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6" style={{ fontFamily: "var(--font-body)" }}>
        <div className="flex items-center gap-2 px-4 py-2 rounded-full border flex-1"
          style={{ backgroundColor: "#ffffff", borderColor: "#d6cfc4", maxWidth: 340 }}>
          <Search className="w-4 h-4 flex-shrink-0" style={{ color: "#6b7c6b" }} />
          <input placeholder="Buscar por cliente..." value={searchTerm}
            onChange={e => { setSearchTerm(e.target.value); setCurrentPage(1); }}
            className="bg-transparent outline-none text-sm w-full" style={{ color: "#1a3a2a" }} />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4" style={{ color: "#6b7c6b" }} />
          <select value={filterPayment} onChange={e => { setFilterPayment(e.target.value); setCurrentPage(1); }}
            style={{
              padding: "8px 14px", borderRadius: 10, border: "1px solid #d6cfc4",
              backgroundColor: "#ffffff", color: "#1a3a2a", fontSize: 13,
              fontFamily: "sans-serif", outline: "none",
            }}>
            <option value="all">Todos los métodos</option>
            {PAYMENT_METHODS.map(m => <option key={m} value={m}>{m}</option>)}
          </select>
        </div>
      </div>

      {/* ── Tabla ── */}
      <SalesTable sales={paginatedSales} loading={loading} onView={setSelectedSale} />

      {/* ── Paginación ── */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-6 px-4" style={{ fontFamily: "var(--font-body)" }}>
          <p className="text-sm" style={{ color: "#6b7c6b" }}>
            Mostrando {startIndex + 1}–{Math.min(startIndex + itemsPerPage, filteredSales.length)} de {filteredSales.length} ventas
          </p>
          <div className="flex items-center gap-1">
            <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}
              className="w-8 h-8 flex items-center justify-center rounded-lg text-sm disabled:opacity-30"
              style={{ color: "#1a3a2a" }}
              onMouseEnter={e => { if (!e.currentTarget.disabled) e.currentTarget.style.backgroundColor = "#ede8e0"; }}
              onMouseLeave={e => (e.currentTarget.style.backgroundColor = "transparent")}>‹</button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
              <button key={page} onClick={() => setCurrentPage(page)}
                className="w-8 h-8 flex items-center justify-center rounded-lg text-sm font-medium"
                style={page === currentPage ? { backgroundColor: "#1a3a2a", color: "#ffffff" } : { color: "#1a3a2a" }}
                onMouseEnter={e => { if (page !== currentPage) e.currentTarget.style.backgroundColor = "#ede8e0"; }}
                onMouseLeave={e => { if (page !== currentPage) e.currentTarget.style.backgroundColor = "transparent"; }}>
                {page}
              </button>
            ))}
            <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}
              className="w-8 h-8 flex items-center justify-center rounded-lg text-sm disabled:opacity-30"
              style={{ color: "#1a3a2a" }}
              onMouseEnter={e => { if (!e.currentTarget.disabled) e.currentTarget.style.backgroundColor = "#ede8e0"; }}
              onMouseLeave={e => (e.currentTarget.style.backgroundColor = "transparent")}>›</button>
          </div>
        </div>
      )}

      {/* ── Dialogs ── */}
      <SaleDetailDialog sale={selectedSale} onClose={() => setSelectedSale(null)} />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent style={{
          backgroundColor: "#faf7f2", borderRadius: 16, border: "1px solid #ede8e0",
          padding: 32, maxWidth: 420, fontFamily: "var(--font-body)",
        }}>
          <AlertDialogHeader>
            <AlertDialogTitle style={{
              display: "flex", alignItems: "center", gap: 10,
              fontFamily: "var(--font-display)", fontSize: 20, color: "#1a3a2a", fontWeight: "normal",
            }}>
              <AlertCircle style={{ width: 20, height: 20, color: "#c0392b" }} />
              ¿Anular esta venta?
            </AlertDialogTitle>
            <AlertDialogDescription style={{ color: "#6b7c6b", fontSize: 14, marginTop: 8 }}>
              Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter style={{ marginTop: 24, display: "flex", gap: 10, justifyContent: "flex-end" }}>
            <AlertDialogCancel style={{
              padding: "9px 18px", borderRadius: 10, border: "1px solid #d6cfc4",
              backgroundColor: "transparent", color: "#1a3a2a", fontSize: 14, cursor: "pointer",
            }}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => { setDeleteDialogOpen(false); toast.info("Función de anulación no implementada aún"); }}
              style={{
                padding: "9px 18px", borderRadius: 10, border: "none",
                backgroundColor: "#c0392b", color: "#ffffff", fontSize: 14, fontWeight: 600, cursor: "pointer",
              }}>
              Anular Venta
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}