import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "../../../shared/ui/dialog";
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
  calculateSubtotal: () => number;
  calculateTotal: () => number;
  addService: (id: number) => void;
  removeService: (id: number) => void;
  updateQuantity: (id: number, qty: number) => void;
  onSubmit: () => void;
  onCancel: () => void;
  onNewClick: () => void;
  userRole: string;
  myClientData?: { id: number; nombre: string; apellido: string } | null;
}

const inputBase: React.CSSProperties = {
  width: "100%", padding: "9px 14px", borderRadius: 10,
  backgroundColor: "#faf7f2", color: "#1a3a2a", fontSize: 14,
  fontFamily: "var(--font-body)", outline: "none", boxSizing: "border-box",
};
const inputOk:  React.CSSProperties = { ...inputBase, border: "1px solid #d6cfc4" };
const inputErr: React.CSSProperties = { ...inputBase, border: "1px solid #c0392b", backgroundColor: "#fdf8f7" };

const labelStyle: React.CSSProperties = {
  display: "block", fontSize: 11, fontWeight: 600,
  letterSpacing: "0.08em", textTransform: "uppercase",
  color: "#6b7c6b", marginBottom: 5, fontFamily: "var(--font-body)",
};
const errorStyle: React.CSSProperties = { fontSize: 11, color: "#c0392b", marginTop: 3, fontFamily: "var(--font-body)" };

type Errors = { clientId?: string; date?: string; services?: string; discount?: string };

function validate(data: QuotationFormData): Errors {
  const e: Errors = {};
  if (!data.clientId)                         e.clientId  = "Selecciona un cliente.";
  if (!data.date)                             e.date      = "La fecha es obligatoria.";
  if (data.selectedServices.length === 0)     e.services  = "Agrega al menos un servicio.";
  if (data.discount && isNaN(Number(data.discount))) e.discount = "El descuento debe ser un número.";
  if (Number(data.discount) < 0)              e.discount  = "El descuento no puede ser negativo.";
  return e;
}

export function QuotationFormDialog({
  isOpen, onOpenChange, editingQuotation, formData, setFormData,
  clients, availableServices, calculateSubtotal, calculateTotal,
  addService, removeService, updateQuantity,
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
  const s = (f: keyof Errors) => (liveErrors as any)[f] ? inputErr : inputOk;

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
        <button onClick={onNewClick} style={{
          display: "inline-flex", alignItems: "center", gap: 8,
          padding: "10px 20px", borderRadius: 10, backgroundColor: "#1a3a2a",
          color: "#ffffff", fontSize: 14, fontWeight: 600, fontFamily: "var(--font-body)",
          border: "none", cursor: "pointer",
        }}
          onMouseEnter={e => (e.currentTarget.style.backgroundColor = "#2a5a40")}
          onMouseLeave={e => (e.currentTarget.style.backgroundColor = "#1a3a2a")}>
          <Plus className="w-4 h-4" /> Nueva Cotización
        </button>
      </DialogTrigger>

      <DialogContent className="hl-form-dialog" style={{
        backgroundColor: "#faf7f2", borderRadius: 16, border: "1px solid #ede8e0",
        padding: 32, maxWidth: 680, maxHeight: "90vh", overflowY: "auto", fontFamily: "var(--font-body)",
      }}>
        <DialogHeader>
          <DialogTitle style={{ fontFamily: "var(--font-body)", fontSize: 22, color: "#1a3a2a", fontWeight: 700 }}>
            {editingQuotation ? "Editar Cotización" : "Nueva Cotización"}
          </DialogTitle>
          <DialogDescription style={{ color: "#6b7c6b", fontSize: 13 }}>
            {editingQuotation ? "Modifica los datos de la cotización" : "Crea una cotización personalizada para el cliente"}
          </DialogDescription>
        </DialogHeader>

        <div style={{ display: "flex", flexDirection: "column", gap: 18, marginTop: 12 }}>

          {/* Cliente */}
          <div>
            <label style={labelStyle}>Cliente <span style={{ color: "#c0392b" }}>*</span></label>
            {userRole === "client" && myClientData ? (
              <div style={{ ...inputOk, backgroundColor: "#edf7f4", border: "1px solid #c8ead9", color: "#1a5c3a", fontWeight: 600 }}>
                {myClientData.nombre} {myClientData.apellido}
              </div>
            ) : (
              <select style={s("clientId")} value={formData.clientId}
                onChange={e => setFormData({ ...formData, clientId: e.target.value })}
                onBlur={() => touch("clientId")}>
                <option value="">Selecciona un cliente</option>
                {clients.filter(c => c.id != null).map(c => (
                  <option key={c.id} value={c.id.toString()}>
                    {c.name ?? `${c.nombre ?? ""} ${c.apellido ?? ""}`.trim()}
                  </option>
                ))}
              </select>
            )}
            {liveErrors.clientId && <p style={errorStyle}>⚠ {liveErrors.clientId}</p>}
          </div>

          {/* Fecha y Hora */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div>
              <label style={labelStyle}>Fecha <span style={{ color: "#c0392b" }}>*</span></label>
              <input type="date" style={s("date")} value={formData.date} min={today}
                onChange={e => setFormData({ ...formData, date: e.target.value })}
                onBlur={() => touch("date")} />
              {liveErrors.date && <p style={errorStyle}>⚠ {liveErrors.date}</p>}
            </div>
            <div>
              <label style={labelStyle}>Hora de Inicio</label>
              <select style={inputOk} value={formData.startTime}
                onChange={e => setFormData({ ...formData, startTime: e.target.value })}>
                <option value="">Selecciona una hora</option>
                {TIME_SLOTS.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
          </div>

          {/* Servicios */}
          <div style={{ padding: 16, borderRadius: 12, border: "1px solid #ede8e0", backgroundColor: "#f5f0e8" }}>
            <p style={{ fontFamily: "var(--font-body)", fontSize: 16, fontWeight: 600, color: "#1a3a2a", marginBottom: 12 }}>
              Servicios
            </p>
            <div>
              <label style={labelStyle}>Agregar Servicio</label>
              <select style={inputOk} value="" onChange={e => { if (e.target.value) addService(parseInt(e.target.value)); }}
                onBlur={() => touch("services")}>
                <option value="">Seleccionar servicio...</option>
                {availableServices.map(s => (
                  <option key={s.id} value={s.id.toString()}>{s.name} — ${s.price?.toLocaleString("es-CO")}</option>
                ))}
              </select>
              {liveErrors.services && <p style={errorStyle}>⚠ {liveErrors.services}</p>}
            </div>

            {formData.selectedServices.length > 0 && (
              <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 8 }}>
                <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "#6b7c6b" }}>
                  Servicios Agregados
                </p>
                {formData.selectedServices.map(item => (
                  <div key={item.serviceId} style={{
                    padding: "12px 16px", borderRadius: 10, backgroundColor: "#ffffff",
                    border: "1px solid #ede8e0", display: "flex", alignItems: "center", justifyContent: "space-between",
                  }}>
                    <div>
                      <p style={{ fontSize: 14, color: "#1a3a2a", fontWeight: 500 }}>{item.serviceName}</p>
                      <p style={{ fontSize: 12, color: "#6b7c6b" }}>${item.price?.toLocaleString("es-CO")} c/u</p>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <label style={{ ...labelStyle, marginBottom: 0, fontSize: 10 }}>Cant:</label>
                        <input type="number" min="1" value={item.quantity}
                          onChange={e => updateQuantity(item.serviceId, parseInt(e.target.value))}
                          style={{ ...inputOk, width: 60, padding: "4px 8px", textAlign: "center" }} />
                      </div>
                      <span style={{ fontSize: 14, color: "#1a3a2a", fontWeight: 600, minWidth: 80, textAlign: "right" }}>
                        ${(item.price * item.quantity).toLocaleString("es-CO")}
                      </span>
                      <button onClick={() => removeService(item.serviceId)} style={{
                        width: 28, height: 28, borderRadius: 6, border: "none",
                        backgroundColor: "#fdf0ee", color: "#c0392b", cursor: "pointer",
                        display: "flex", alignItems: "center", justifyContent: "center",
                      }}>
                        <X style={{ width: 14, height: 14 }} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Descuento y Total */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div>
              <label style={labelStyle}>Descuento ($)</label>
              <input type="number" step="0.01" min="0" style={s("discount")}
                value={formData.discount} placeholder="0"
                onChange={e => setFormData({ ...formData, discount: e.target.value })}
                onBlur={() => touch("discount")} />
              {liveErrors.discount && <p style={errorStyle}>⚠ {liveErrors.discount}</p>}
            </div>
            <div>
              <label style={labelStyle}>Total</label>
              <div style={{
                ...inputOk, display: "flex", alignItems: "center",
                backgroundColor: "#edf7f4", border: "1px solid #c8ead9",
              }}>
                <span style={{ fontSize: 18, fontWeight: 700, color: "#1a5c3a" }}>
                  ${calculateTotal().toLocaleString("es-CO")}
                </span>
              </div>
            </div>
          </div>

          {/* Notas */}
          <div>
            <label style={labelStyle}>Notas</label>
            <textarea value={formData.notes}
              onChange={e => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Notas adicionales para el cliente..."
              rows={3}
              style={{ ...inputOk, resize: "vertical", fontFamily: "var(--font-body)" }} />
          </div>

          {/* Botones */}
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, paddingTop: 8, borderTop: "1px solid #ede8e0" }}>
            <button onClick={handleCancel} style={{
              padding: "9px 18px", borderRadius: 10, border: "1px solid #d6cfc4",
              backgroundColor: "transparent", color: "#1a3a2a", fontSize: 14,
              fontFamily: "var(--font-body)", cursor: "pointer",
            }}>Cancelar</button>
            <button onClick={handleSubmit} style={{
              padding: "9px 20px", borderRadius: 10, border: "none",
              backgroundColor: "#1a3a2a", color: "#ffffff", fontSize: 14,
              fontWeight: 600, fontFamily: "var(--font-body)", cursor: "pointer",
            }}
              onMouseEnter={e => (e.currentTarget.style.backgroundColor = "#2a5a40")}
              onMouseLeave={e => (e.currentTarget.style.backgroundColor = "#1a3a2a")}>
              {editingQuotation ? "Guardar Cambios" : "Crear Cotización"}
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
