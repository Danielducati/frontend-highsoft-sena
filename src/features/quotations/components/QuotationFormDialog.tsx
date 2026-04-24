import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "../../../shared/ui/dialog";
import { Button } from "../../../shared/ui/button";
import { Input } from "../../../shared/ui/input";
import { Label } from "../../../shared/ui/label";
import { Plus, X } from "lucide-react";
import { Quotation, QuotationFormData } from "../types";
import { toast } from "sonner";

const TIME_SLOTS = [
  "08:00","08:30","09:00","09:30","10:00","10:30",
  "11:00","11:30","12:00","12:30","13:00","13:30",
  "14:00","14:30","15:00","15:30","16:00","16:30",
  "17:00","17:30",
];

interface QuotationFormDialogProps {
  isOpen: boolean;
  onOpenChange: (v: boolean) => void;
  editingQuotation: Quotation | null;
  formData: QuotationFormData;
  setFormData: (d: QuotationFormData) => void;
  clients: any[];
  availableServices: any[];
  employees: any[];
  calculateSubtotal: () => number;
  calculateTotal: () => number;
  addService: (id: number) => void;
  removeService: (id: number) => void;
  updateQuantity: (id: number, qty: number) => void;
  updateServiceEmployee: (serviceId: number, empleadoId: number, empleadoName: string) => void;
  onSubmit: () => void;
  onCancel: () => void;
  onNewClick: () => void;
  userRole: string;
  myClientData?: { id: number; nombre: string; apellido: string } | null;
}

type Errors = { clientId?: string; date?: string; services?: string; discount?: string };

function validate(data: QuotationFormData): Errors {
  const e: Errors = {};
  if (!data.guestMode && !data.clientId)                       e.clientId = "Selecciona un cliente.";
  if (data.guestMode && !data.guestFirstName?.trim())          e.clientId = "El nombre del cliente es obligatorio.";
  if (!data.date)                                              e.date     = "La fecha es obligatoria.";
  if (data.selectedServices.length === 0)                      e.services = "Agrega al menos un servicio.";
  if (data.discount && isNaN(Number(data.discount)))           e.discount = "El descuento debe ser un número.";
  if (Number(data.discount) < 0)                               e.discount = "El descuento no puede ser negativo.";
  return e;
}

function QuotClientSearch({ clients, selectedId, onSelect, error, onBlur }: {
  clients: any[];
  selectedId: string;
  onSelect: (id: string) => void;
  error?: string;
  onBlur?: () => void;
}) {
  const [search, setSearch] = React.useState("");
  const [open,   setOpen]   = React.useState(false);

  const filtered = clients.filter(c => {
    const name = c.name ?? `${c.nombre ?? ""} ${c.apellido ?? ""}`.trim();
    return name.toLowerCase().includes(search.toLowerCase());
  });

  const selected = clients.find(c => String(c.id) === selectedId);
  const selectedName = selected ? (selected.name ?? `${selected.nombre ?? ""} ${selected.apellido ?? ""}`.trim()) : "";

  return (
    <div className="space-y-2">
      <Label className="text-gray-900">Cliente *</Label>
      <div className="relative">
        <input
          type="text"
          placeholder={selectedName || "Buscar cliente por nombre..."}
          value={search}
          onChange={e => { setSearch(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          onBlur={() => { setTimeout(() => setOpen(false), 150); onBlur?.(); }}
          className={`w-full rounded-lg border px-3 py-2 text-sm bg-white text-gray-900 outline-none ${
            error ? "border-red-500 bg-red-50" : selected ? "border-[#78D1BD] bg-[#edf7f4]" : "border-gray-200"
          }`}
        />
        {open && (
          <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-56 overflow-y-auto">
            {filtered.length === 0 ? (
              <div className="px-3 py-2 text-sm text-gray-400">
                {clients.length === 0 ? "No hay clientes" : "Sin resultados"}
              </div>
            ) : filtered.map(c => {
              const name = c.name ?? `${c.nombre ?? ""} ${c.apellido ?? ""}`.trim();
              return (
                <button
                  key={c.id}
                  type="button"
                  onMouseDown={() => { onSelect(String(c.id)); setSearch(""); setOpen(false); }}
                  className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-50 transition-colors ${
                    String(c.id) === selectedId ? "bg-[#edf7f4] text-[#1a5c3a] font-medium" : "text-gray-900"
                  }`}
                >
                  {name}
                </button>
              );
            })}
          </div>
        )}
      </div>
      {error && <p className="text-xs text-red-500">⚠ {error}</p>}
    </div>
  );
}

export function QuotationFormDialog({
  isOpen, onOpenChange, editingQuotation, formData, setFormData,
  clients, availableServices, employees, calculateSubtotal, calculateTotal,
  addService, removeService, updateQuantity, updateServiceEmployee,
  onSubmit, onCancel, onNewClick, userRole, myClientData,
}: QuotationFormDialogProps) {
  const [touched, setTouched] = useState<Partial<Record<keyof Errors, boolean>>>({});

  if (userRole === "client") return null;

  const allErrs = validate(formData);
  const liveErrors: Errors = {};
  (Object.keys(touched) as Array<keyof Errors>).forEach(k => {
    if (touched[k] && allErrs[k]) (liveErrors as any)[k] = (allErrs as any)[k];
  });

  const touch = (f: keyof Errors) => setTouched(t => ({ ...t, [f]: true }));

  const handleSubmit = () => {
    const errs = validate(formData);
    setTouched({ clientId: true, date: true, services: true, discount: true });
    if (Object.keys(errs).length > 0) { toast.error("Revisa los campos marcados antes de continuar."); return; }
    onSubmit();
  };

  const handleCancel = () => { setTouched({}); onCancel(); };

  const today = new Date().toISOString().split("T")[0];

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <button
          onClick={onNewClick}
          style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "10px 20px", borderRadius: 10, backgroundColor: "#1a3a2a", color: "#ffffff", fontSize: 14, fontWeight: 600, fontFamily: "var(--font-body)", border: "none", cursor: "pointer" }}
          onMouseEnter={e => (e.currentTarget.style.backgroundColor = "#2a5a40")}
          onMouseLeave={e => (e.currentTarget.style.backgroundColor = "#1a3a2a")}
        >
          <Plus className="w-4 h-4" /> Nueva Cotización
        </button>
      </DialogTrigger>

      <DialogContent className="hl-form-dialog rounded-xl max-w-2xl max-h-[90vh] overflow-y-auto border-gray-200 shadow-lg">
        <DialogHeader>
          <DialogTitle className="text-gray-900">
            {editingQuotation ? "Editar Cotización" : "Nueva Cotización"}
          </DialogTitle>
          <DialogDescription className="text-gray-600">
            {editingQuotation ? "Modifica los datos de la cotización" : "Crea una cotización personalizada para el cliente"}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 mt-4">

          {/* Cliente */}
          <div className="space-y-2">
            {userRole === "client" && myClientData ? (
              <div>
                <Label className="text-gray-900">Cliente</Label>
                <div className="rounded-lg border border-gray-200 px-3 py-2 text-sm bg-emerald-50 text-emerald-800 font-medium mt-1">
                  {myClientData.nombre} {myClientData.apellido}
                </div>
              </div>
            ) : (
              <>
                {/* Toggle cliente no registrado */}
                <div className="flex items-center justify-between rounded-lg border border-gray-200 bg-gray-50 px-4 py-3">
                  <span className="text-sm font-medium text-gray-900">Cliente no registrado</span>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, guestMode: !formData.guestMode, clientId: "" })}
                    className="relative inline-flex items-center w-10 h-6 rounded-full border-0 cursor-pointer transition-colors"
                    style={{ backgroundColor: formData.guestMode ? "#1a3a2a" : "#9ca3af", padding: 0 }}
                  >
                    <span className="absolute w-4 h-4 rounded-full bg-white shadow transition-all"
                      style={{ left: formData.guestMode ? "22px" : "2px" }} />
                  </button>
                </div>

                {!formData.guestMode ? (
                  <QuotClientSearch
                    clients={clients}
                    selectedId={formData.clientId}
                    onSelect={id => setFormData({ ...formData, clientId: id })}
                    error={liveErrors.clientId}
                    onBlur={() => touch("clientId")}
                  />
                ) : (
                  <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 space-y-3">
                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Datos del cliente ocasional</p>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <Label className="text-gray-900">Nombre *</Label>
                        <input
                          className={`w-full rounded-lg border px-3 py-2 text-sm bg-white text-gray-900 outline-none ${liveErrors.clientId ? "border-red-500" : "border-gray-200"}`}
                          value={formData.guestFirstName ?? ""}
                          onChange={e => setFormData({ ...formData, guestFirstName: e.target.value })}
                          placeholder="Juan"
                          onBlur={() => touch("clientId")}
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-gray-900">Apellido</Label>
                        <input
                          className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm bg-white text-gray-900 outline-none"
                          value={formData.guestLastName ?? ""}
                          onChange={e => setFormData({ ...formData, guestLastName: e.target.value })}
                          placeholder="Pérez"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <Label className="text-gray-900">Teléfono</Label>
                        <input
                          className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm bg-white text-gray-900 outline-none"
                          value={formData.guestPhone ?? ""}
                          onChange={e => setFormData({ ...formData, guestPhone: e.target.value.replace(/\D/g, "") })}
                          placeholder="3001234567"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-gray-900">Correo</Label>
                        <input
                          type="email"
                          className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm bg-white text-gray-900 outline-none"
                          value={formData.guestEmail ?? ""}
                          onChange={e => setFormData({ ...formData, guestEmail: e.target.value })}
                          placeholder="correo@ejemplo.com"
                        />
                      </div>
                    </div>
                    {liveErrors.clientId && <p className="text-xs text-red-500">⚠ {liveErrors.clientId}</p>}
                  </div>
                )}
              </>
            )}
          </div>

          {/* Fecha y Hora */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="quot-date" className="text-gray-900">Fecha *</Label>
              <Input
                id="quot-date"
                type="date"
                value={formData.date}
                min={today}
                onChange={e => setFormData({ ...formData, date: e.target.value })}
                onBlur={() => touch("date")}
                className={`rounded-lg ${liveErrors.date ? "border-red-500 bg-red-50" : "border-gray-200"}`}
              />
              {liveErrors.date && <p className="text-xs text-red-500">⚠ {liveErrors.date}</p>}
            </div>
            <div className="space-y-2">
              <Label className="text-gray-900">Hora de Inicio</Label>
              <select
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm bg-white text-gray-900 outline-none"
                value={formData.startTime}
                onChange={e => setFormData({ ...formData, startTime: e.target.value })}
              >
                <option value="">Selecciona una hora</option>
                {TIME_SLOTS.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
          </div>

          {/* Servicios */}
          <div className="rounded-lg border border-gray-200 p-4 space-y-3 bg-gray-50">
            <p className="text-sm font-semibold text-gray-900">Servicios</p>

            <div className="space-y-2">
              <Label className="text-gray-900">Agregar Servicio</Label>
              <select
                className={`w-full rounded-lg border px-3 py-2 text-sm bg-white text-gray-900 outline-none ${liveErrors.services ? "border-red-500 bg-red-50" : "border-gray-200"}`}
                value=""
                onChange={e => { if (e.target.value) addService(parseInt(e.target.value)); }}
                onBlur={() => touch("services")}
              >
                <option value="">Seleccionar servicio...</option>
                {availableServices.map(s => (
                  <option key={s.id} value={s.id.toString()}>{s.name} — ${s.price?.toLocaleString("es-CO")}</option>
                ))}
              </select>
              {liveErrors.services && <p className="text-xs text-red-500">⚠ {liveErrors.services}</p>}
            </div>

            {formData.selectedServices.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Servicios Agregados</p>
                {formData.selectedServices.map(item => (
                  <div key={item.serviceId} className="rounded-lg border border-gray-200 bg-white p-3 space-y-2">
                    {/* Nombre + cantidad + precio + eliminar */}
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900">{item.serviceName}</p>
                        <p className="text-xs text-gray-500">${item.price?.toLocaleString("es-CO")} c/u</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1">
                          <Label className="text-xs text-gray-600">Cant:</Label>
                          <Input
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={e => updateQuantity(item.serviceId, parseInt(e.target.value))}
                            className="w-16 text-center rounded-lg border-gray-200 px-2 py-1 text-sm"
                          />
                        </div>
                        <span className="text-sm font-semibold text-gray-900 min-w-[80px] text-right">
                          ${(item.price * item.quantity).toLocaleString("es-CO")}
                        </span>
                        <button
                          onClick={() => removeService(item.serviceId)}
                          className="w-7 h-7 rounded-md flex items-center justify-center bg-red-50 text-red-500 hover:bg-red-100 transition-colors border-0"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                    {/* Empleado asignado — filtrado por categoría del servicio */}
                    <div className="space-y-1">
                      <Label className="text-xs text-gray-600">Empleado asignado</Label>
                      {(() => {
                        // Normalizar string para comparación (quitar acentos, espacios, minúsculas)
                        const normalize = (str: string) => 
                          str.toLowerCase()
                            .normalize("NFD")
                            .replace(/[\u0300-\u036f]/g, "")
                            .trim()
                            .replace(/\s+/g, "");

                        const active = employees.filter(
                          em => em.isActive !== false && em.estado !== "Inactivo"
                        );
                        
                        // Si solo hay un empleado (rol employee), mostrarlo siempre sin filtrar
                        const empList = active.length === 1 ? active : (() => {
                          const svc = availableServices.find(s => String(s.id) === String(item.serviceId));
                          const cat = normalize(svc?.category ?? "");
                          
                          if (!cat) return active;
                          
                          // Filtrar empleados cuya especialidad coincida con la categoría del servicio
                          const filtered = active.filter(em => {
                            const empSpec = normalize(em.specialty ?? em.especialidad ?? "");
                            return empSpec === cat;
                          });
                          
                          // Si no hay empleados con esa especialidad, mostrar todos los activos
                          return filtered.length > 0 ? filtered : active;
                        })();
                        
                        return (
                          <select
                            className="w-full rounded-lg border border-gray-200 px-3 py-1.5 text-sm bg-white text-gray-900 outline-none"
                            value={item.empleadoId?.toString() ?? ""}
                            onChange={e => {
                              const emp = employees.find(em => em.id.toString() === e.target.value);
                              if (emp) updateServiceEmployee(item.serviceId, Number(emp.id), emp.name ?? `${emp.nombre} ${emp.apellido}`);
                              else updateServiceEmployee(item.serviceId, 0, "");
                            }}
                          >
                            <option value="">Sin asignar</option>
                            {empList.map(em => (
                              <option key={em.id} value={em.id.toString()}>
                                {em.name ?? `${em.nombre ?? ""} ${em.apellido ?? ""}`.trim()}
                                {em.specialty || em.especialidad ? ` — ${em.specialty ?? em.especialidad}` : ""}
                              </option>
                            ))}
                          </select>
                        );
                      })()}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Descuento y Total */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="quot-discount" className="text-gray-900">Descuento ($)</Label>
              <Input
                id="quot-discount"
                type="number"
                step="0.01"
                min="0"
                value={formData.discount}
                placeholder="0"
                onChange={e => setFormData({ ...formData, discount: e.target.value })}
                onBlur={() => touch("discount")}
                className={`rounded-lg ${liveErrors.discount ? "border-red-500 bg-red-50" : "border-gray-200"}`}
              />
              {liveErrors.discount && <p className="text-xs text-red-500">⚠ {liveErrors.discount}</p>}
            </div>
            <div className="space-y-2">
              <Label className="text-gray-900">Total</Label>
              <div className="rounded-lg border border-gray-200 bg-white px-3 py-2 flex items-center">
                <span className="text-lg font-bold text-gray-900">
                  ${calculateTotal().toLocaleString("es-CO")}
                </span>
              </div>
            </div>
          </div>

          {/* Notas */}
          <div className="space-y-2">
            <Label htmlFor="quot-notes" className="text-gray-900">Notas</Label>
            <textarea
              id="quot-notes"
              value={formData.notes}
              onChange={e => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Notas adicionales para el cliente..."
              rows={3}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900 bg-white outline-none resize-vertical focus:ring-2 focus:ring-offset-0"
            />
          </div>

          {/* Botones */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button variant="outline" onClick={handleCancel} className="rounded-lg border-gray-300">
              Cancelar
            </Button>
            <Button
              onClick={handleSubmit}
              style={{ backgroundColor: "#1a3a2a", color: "#ffffff" }}
              onMouseEnter={e => (e.currentTarget.style.backgroundColor = "#2a5a40")}
              onMouseLeave={e => (e.currentTarget.style.backgroundColor = "#1a3a2a")}
              className="rounded-lg"
            >
              {editingQuotation ? "Guardar Cambios" : "Crear Cotización"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
