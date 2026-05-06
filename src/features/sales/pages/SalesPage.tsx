import { useState } from "react";
import { Card, CardContent } from "../../../shared/ui/card";
import { Input } from "../../../shared/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../shared/ui/select";
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
import { SpaPage } from "../../../shared/components/layout/SpaPage";

export function SalesPage({ userRole }: SalesModuleProps) {
  const { sales, appointments, availableServices, clients, employees, loading, saving, registerSale } = useSales();

  const [searchTerm,     setSearchTerm]    = useState("");
  const [filterPayment,  setFilterPayment] = useState("all");
  const [currentPage,    setCurrentPage]   = useState(1);
  const itemsPerPage = 5;

  const [isDialogOpen,     setIsDialogOpen]     = useState(false);
  const [saleType,         setSaleType]         = useState<"appointment" | "direct">("direct");
  const [selectedSale,     setSelectedSale]     = useState<Sale | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [formData,         setFormData]         = useState<SaleFormData>(EMPTY_FORM);
  const [filterClient,     setFilterClient]     = useState("all");

  const filteredSales = sales.filter(s => {
    const clienteName = (s.Cliente ?? "").toLowerCase();
    const matchesSearch  = !searchTerm || clienteName.includes(searchTerm.toLowerCase());
    const matchesPayment = filterPayment === "all" || s.metodo_pago === filterPayment;
    const matchesClient  = filterClient  === "all" || s.Cliente === filterClient;
    return matchesSearch && matchesPayment && matchesClient;
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
    setFormData(prev => ({
      ...prev,
      appointmentId: appt.id,
      clienteId: appt.clienteId,
      clientName: appt.clientName,
      selectedServices: appt.items.map(item => ({
        serviceId: item.servicioId,
        serviceName: item.nombre,
        price: item.precio,
        quantity: item.cantidad
      }))
    }));
    toast.success(`Cita seleccionada: ${appt.clientName}`);
  };

  const handleAddService = (serviceId: number, employeeId?: number) => {
    const service  = availableServices.find(s => s.id === serviceId);
    if (!service) return;
    const employee = employees.find(e => Number(e.id) === employeeId);
    const existing = formData.selectedServices.findIndex(s => s.serviceId === serviceId);
    if (existing >= 0) {
      const updated = [...formData.selectedServices];
      updated[existing].quantity += 1;
      setFormData(prev => ({ ...prev, selectedServices: updated }));
    } else {
      setFormData(prev => ({
        ...prev,
        selectedServices: [...prev.selectedServices, {
          serviceId:    service.id,
          serviceName:  service.name,
          price:        service.price,
          quantity:     1,
          employeeId:   employeeId ?? null,
          employeeName: employee?.name ?? "",
        }],
      }));
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
    <SpaPage
      title="Gestión de Ventas"
      subtitle="Registra y administra las transacciones del spa"
      icon={<ShoppingCart className="w-6 h-6" style={{ color: "#1a3a2a" }} />}
      action={
        userRole !== "client" ? (
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <button
                style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "10px 20px", borderRadius: 10, backgroundColor: "#1a3a2a", color: "#ffffff", fontSize: 14, fontWeight: 600, fontFamily: "var(--font-body)", border: "none", cursor: "pointer" }}
                onMouseEnter={e => (e.currentTarget.style.backgroundColor = "#2a5a40")}
                onMouseLeave={e => (e.currentTarget.style.backgroundColor = "#1a3a2a")}
              >
                <Plus className="w-4 h-4" /> Registrar Venta
              </button>
            </DialogTrigger>
            <DialogContent style={{ backgroundColor: "#ffffff", borderRadius: 16, border: "1px solid #E5E7EB", padding: 32, maxWidth: 680, maxHeight: "90vh", overflowY: "auto" }}>
              <DialogHeader>
                <DialogTitle style={{ fontFamily: "var(--font-body)", fontSize: 22, color: "#1a3a2a", fontWeight: 700 }}>
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
                clients={clients} employees={employees} saving={saving}
                onSubmit={handleSubmit} onCancel={resetForm}
                onAppointmentSelect={handleAppointmentSelect}
                onAddService={handleAddService}
                onUpdateQuantity={handleUpdateQuantity}
                onRemoveService={handleRemoveService}
              />
            </DialogContent>
          </Dialog>
        ) : undefined
      }
    >
      <div className="space-y-4">

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { label: "Total Ventas",     value: sales.length },
            { label: "Ingresos Totales", value: `${totalRevenue.toLocaleString("es-CO")}` },
            { label: "Este mes",         value: `${sales.filter(s => {
              const d = new Date(s.Fecha);
              const now = new Date();
              return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
            }).reduce((sum, s) => sum + (s.Total || 0), 0).toLocaleString("es-CO")}` },
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
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Buscar por cliente..."
                  value={searchTerm}
                  onChange={e => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                  className="pl-9 h-9 rounded-lg border-gray-200 w-full"
                />
              </div>
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-gray-400" />
                <Select value={filterClient} onValueChange={v => { setFilterClient(v); setCurrentPage(1); }}>
                  <SelectTrigger className="h-9 rounded-lg border-gray-200 w-48">
                    <SelectValue placeholder="Todos los clientes" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos los clientes</SelectItem>
                    {clients.map(c => (
                      <SelectItem key={c.id} value={c.name}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={filterPayment} onValueChange={v => { setFilterPayment(v); setCurrentPage(1); }}>
                  <SelectTrigger className="h-9 rounded-lg border-gray-200 w-48">
                    <SelectValue placeholder="Todos los métodos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos los métodos</SelectItem>
                    {PAYMENT_METHODS.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabla */}
        <Card className="border-gray-200 shadow-sm">
          <CardContent className="p-0">
            <SalesTable sales={paginatedSales} loading={loading} onView={setSelectedSale} />
          </CardContent>
        </Card>

        {/* Paginación */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-2 px-1" style={{ fontFamily: "var(--font-body)" }}>
            <p className="text-sm" style={{ color: "#6b7c6b" }}>
              Mostrando {startIndex + 1}–{Math.min(startIndex + itemsPerPage, filteredSales.length)} de {filteredSales.length} ventas
            </p>
            <div className="flex items-center gap-1">
              <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}
                className="w-8 h-8 flex items-center justify-center rounded-lg text-sm disabled:opacity-30"
                style={{ color: "#1a3a2a" }}
                onMouseEnter={e => { if (!e.currentTarget.disabled) e.currentTarget.style.backgroundColor = "#E5E7EB"; }}
                onMouseLeave={e => (e.currentTarget.style.backgroundColor = "transparent")}>‹</button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <button key={page} onClick={() => setCurrentPage(page)}
                  className="w-8 h-8 flex items-center justify-center rounded-lg text-sm font-medium"
                  style={page === currentPage ? { backgroundColor: "#1a3a2a", color: "#ffffff" } : { color: "#1a3a2a" }}
                  onMouseEnter={e => { if (page !== currentPage) e.currentTarget.style.backgroundColor = "#E5E7EB"; }}
                  onMouseLeave={e => { if (page !== currentPage) e.currentTarget.style.backgroundColor = "transparent"; }}>
                  {page}
                </button>
              ))}
              <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}
                className="w-8 h-8 flex items-center justify-center rounded-lg text-sm disabled:opacity-30"
                style={{ color: "#1a3a2a" }}
                onMouseEnter={e => { if (!e.currentTarget.disabled) e.currentTarget.style.backgroundColor = "#E5E7EB"; }}
                onMouseLeave={e => (e.currentTarget.style.backgroundColor = "transparent")}>›</button>
            </div>
          </div>
        )}

        {/* Dialogs */}
        <SaleDetailDialog sale={selectedSale} onClose={() => setSelectedSale(null)} />

        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent style={{ backgroundColor: "#ffffff", borderRadius: 16, border: "1px solid #E5E7EB", padding: 32, maxWidth: 420, fontFamily: "var(--font-body)" }}>
            <AlertDialogHeader>
              <AlertDialogTitle style={{ display: "flex", alignItems: "center", gap: 10, fontFamily: "var(--font-body)", fontSize: 20, color: "#1a3a2a", fontWeight: 700 }}>
                <AlertCircle style={{ width: 20, height: 20, color: "#c0392b" }} />
                ¿Anular esta venta?
              </AlertDialogTitle>
              <AlertDialogDescription style={{ color: "#6b7c6b", fontSize: 14, marginTop: 8 }}>
                Esta acción no se puede deshacer.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter style={{ marginTop: 24, display: "flex", gap: 10, justifyContent: "flex-end" }}>
              <AlertDialogCancel style={{ padding: "9px 18px", borderRadius: 10, border: "1px solid #E5E7EB", backgroundColor: "transparent", color: "#1a3a2a", fontSize: 14, cursor: "pointer" }}>Cancelar</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => { setDeleteDialogOpen(false); toast.info("Función de anulación no implementada aún"); }}
                style={{ padding: "9px 18px", borderRadius: 10, border: "none", backgroundColor: "#c0392b", color: "#ffffff", fontSize: 14, fontWeight: 600, cursor: "pointer" }}>
                Anular Venta
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </SpaPage>
  );
}
