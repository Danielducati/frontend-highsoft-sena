import { useState } from "react";
import { Loader2, XCircle } from "lucide-react";
import { Appointment, SaleFormData, SaleItem } from "../types";
import { PAYMENT_METHODS } from "../constants";
import { calcSubtotal, calcTotal } from "../utils";
import { toast } from "sonner";

interface SaleFormProps {
  formData:            SaleFormData;
  setFormData:         React.Dispatch<React.SetStateAction<SaleFormData>>;
  saleType:            "appointment" | "direct";
  onSaleTypeChange:    (v: "appointment" | "direct") => void;
  appointments:        Appointment[];
  availableServices:   any[];
  clients:             any[];
  saving:              boolean;
  onSubmit:            () => void;
  onCancel:            () => void;
  onAppointmentSelect: (id: string) => void;
  onAddService:        (id: number) => void;
  onUpdateQuantity:    (id: number, qty: number) => void;
  onRemoveService:     (id: number) => void;
}

const inputStyle: React.CSSProperties = {
  width: "100%", padding: "9px 14px", borderRadius: 10,
  border: "1px solid #d6cfc4", backgroundColor: "#faf7f2",
  color: "#1a3a2a", fontSize: 14, fontFamily: "var(--font-body)",
  outline: "none", boxSizing: "border-box",
};

const inputErr: React.CSSProperties = {
  ...inputStyle, border: "1px solid #c0392b", backgroundColor: "#fdf8f7",
};

const labelStyle: React.CSSProperties = {
  display: "block", fontSize: 11, fontWeight: 600,
  letterSpacing: "0.08em", textTransform: "uppercase",
  color: "#6b7c6b", marginBottom: 5, fontFamily: "var(--font-body)",
};

const errorStyle: React.CSSProperties = {
  fontSize: 11, color: "#c0392b", marginTop: 3, fontFamily: "var(--font-body)",
};

type Errors = { client?: string; services?: string; payment?: string; appointment?: string };

function validateDirect(data: SaleFormData): Errors {
  const e: Errors = {};
  if (!data.clienteId)                     e.client   = "Selecciona un cliente.";
  if (data.selectedServices.length === 0)  e.services = "Agrega al menos un servicio.";
  if (!data.paymentMethod)                 e.payment  = "Selecciona un método de pago.";
  return e;
}

function validateAppointment(data: SaleFormData): Errors {
  const e: Errors = {};
  if (!data.appointmentId)  e.appointment = "Selecciona una cita.";
  if (!data.paymentMethod)  e.payment     = "Selecciona un método de pago.";
  return e;
}

export function SaleForm({
  formData, setFormData, saleType, onSaleTypeChange,
  appointments, availableServices, clients, saving,
  onSubmit, onCancel, onAppointmentSelect,
  onAddService, onUpdateQuantity, onRemoveService,
}: SaleFormProps) {
  const [touched, setTouched] = useState<Partial<Record<keyof Errors, boolean>>>({});

  const validate = saleType === "direct" ? validateDirect : validateAppointment;
  const allErrs  = validate(formData);
  const liveErr: Errors = {};
  (Object.keys(touched) as Array<keyof Errors>).forEach(k => {
    if (touched[k] && (allErrs as any)[k]) (liveErr as any)[k] = (allErrs as any)[k];
  });

  const touch = (f: keyof Errors) => setTouched(t => ({ ...t, [f]: true }));

  const handleSubmit = () => {
    setTouched({ client: true, services: true, payment: true, appointment: true });
    if (Object.keys(validate(formData)).length > 0) {
      toast.error("Revisa los campos marcados antes de continuar.");
      return;
    }
    onSubmit();
  };

  // Tab style helper
  const tabBtn = (active: boolean): React.CSSProperties => ({
    flex: 1, padding: "8px 16px", borderRadius: 8, border: "none",
    fontSize: 13, fontWeight: 600, fontFamily: "var(--font-body)", cursor: "pointer",
    transition: "all 0.15s",
    ...(active
      ? { backgroundColor: "#1a3a2a", color: "#ffffff" }
      : { backgroundColor: "transparent", color: "#6b7c6b" }),
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18, marginTop: 12 }}>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 4, padding: 4, borderRadius: 12, backgroundColor: "#f0ebe3" }}>
        <button style={tabBtn(saleType === "direct")} onClick={() => onSaleTypeChange("direct")}>
          Venta Directa
        </button>
        <button style={tabBtn(saleType === "appointment")} onClick={() => onSaleTypeChange("appointment")}>
          Desde Cita
        </button>
      </div>

      {/* ── VENTA DIRECTA ── */}
      {saleType === "direct" && (
        <>
          {/* Cliente */}
          <div>
            <label style={labelStyle}>Cliente <span style={{ color: "#c0392b" }}>*</span></label>
            <select style={liveErr.client ? inputErr : inputStyle}
              value={formData.clienteId}
              onChange={e => setFormData(prev => ({ ...prev, clienteId: e.target.value }))}
              onBlur={() => touch("client")}>
              <option value="">Seleccionar cliente</option>
              {clients.map(c => <option key={c.id} value={c.id.toString()}>{c.name}</option>)}
            </select>
            {liveErr.client && <p style={errorStyle}>⚠ {liveErr.client}</p>}
          </div>

          {/* Agregar servicio */}
          <div>
            <label style={labelStyle}>Agregar Servicio <span style={{ color: "#c0392b" }}>*</span></label>
            <select style={liveErr.services ? inputErr : inputStyle}
              value="" onChange={e => { if (e.target.value) onAddService(parseInt(e.target.value)); }}
              onBlur={() => touch("services")}>
              <option value="">Seleccionar servicio...</option>
              {availableServices.map(s => (
                <option key={s.id} value={s.id.toString()}>{s.name} — ${s.price?.toLocaleString("es-CO")}</option>
              ))}
            </select>
            {liveErr.services && <p style={errorStyle}>⚠ {liveErr.services}</p>}
          </div>

          {/* Lista servicios */}
          {formData.selectedServices.length > 0 && (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {formData.selectedServices.map(item => (
                <div key={item.serviceId} style={{
                  padding: "12px 16px", borderRadius: 10, backgroundColor: "#ffffff",
                  border: "1px solid #ede8e0", display: "flex", alignItems: "center", justifyContent: "space-between",
                }}>
                  <div>
                    <p style={{ fontSize: 14, color: "#1a3a2a", fontWeight: 500 }}>{item.serviceName}</p>
                    <p style={{ fontSize: 12, color: "#6b7c6b" }}>${item.price?.toLocaleString("es-CO")} c/u</p>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <input type="number" min="1" value={item.quantity}
                      onChange={e => onUpdateQuantity(item.serviceId, parseInt(e.target.value))}
                      style={{ ...inputStyle, width: 60, padding: "4px 8px", textAlign: "center" }} />
                    <span style={{ fontSize: 14, fontWeight: 600, color: "#1a3a2a", minWidth: 70, textAlign: "right" }}>
                      ${(item.price * item.quantity).toLocaleString("es-CO")}
                    </span>
                    <button onClick={() => onRemoveService(item.serviceId)} style={{
                      width: 28, height: 28, borderRadius: 6, border: "none",
                      backgroundColor: "#fdf0ee", color: "#c0392b", cursor: "pointer",
                      display: "flex", alignItems: "center", justifyContent: "center",
                    }}>
                      <XCircle style={{ width: 14, height: 14 }} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          <PaymentFields formData={formData} setFormData={setFormData} error={liveErr.payment} onBlur={() => touch("payment")} />
          <Totals items={formData.selectedServices} discount={formData.discount} />
        </>
      )}

      {/* ── DESDE CITA ── */}
      {saleType === "appointment" && (
        <>
          <div>
            <label style={labelStyle}>Seleccionar Cita <span style={{ color: "#c0392b" }}>*</span></label>
            <select style={liveErr.appointment ? inputErr : inputStyle}
              value={formData.appointmentId?.toString() || ""}
              onChange={e => onAppointmentSelect(e.target.value)}
              onBlur={() => touch("appointment")}>
              <option value="">Buscar cita...</option>
              {appointments.length === 0
                ? <option disabled value="">No hay citas activas</option>
                : appointments.map(a => (
                  <option key={a.id} value={a.id.toString()}>
                    {a.clientName} — {a.service} ({a.date ? new Date(a.date).toLocaleDateString("es-ES") : ""} {a.time})
                  </option>
                ))}
            </select>
            {liveErr.appointment && <p style={errorStyle}>⚠ {liveErr.appointment}</p>}
          </div>

          {formData.appointmentId && formData.selectedServices.length > 0 && (
            <div style={{ padding: "12px 16px", borderRadius: 10, backgroundColor: "#ffffff", border: "1px solid #ede8e0" }}>
              {formData.selectedServices.map(item => (
                <div key={item.serviceId} style={{ display: "flex", justifyContent: "space-between", fontSize: 14 }}>
                  <span style={{ color: "#1a3a2a" }}>{item.serviceName}</span>
                  <span style={{ color: "#1a3a2a", fontWeight: 600 }}>${(item.price * item.quantity).toLocaleString("es-CO")}</span>
                </div>
              ))}
            </div>
          )}

          {formData.appointmentId && (
            <>
              <PaymentFields formData={formData} setFormData={setFormData} error={liveErr.payment} onBlur={() => touch("payment")} />
              <div style={{ padding: "12px 16px", borderRadius: 10, backgroundColor: "#edf7f4", border: "1px solid #c8ead9", display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "#1a3a2a", fontSize: 14 }}>Total estimado</span>
                <span style={{ color: "#1a5c3a", fontSize: 18, fontWeight: 700 }}>
                  ${calcTotal(formData.selectedServices, formData.discount).toLocaleString("es-CO")}
                </span>
              </div>
            </>
          )}
        </>
      )}

      {/* Botones */}
      <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, paddingTop: 8, borderTop: "1px solid #ede8e0" }}>
        <button onClick={onCancel} style={{
          padding: "9px 18px", borderRadius: 10, border: "1px solid #d6cfc4",
          backgroundColor: "transparent", color: "#1a3a2a", fontSize: 14,
          fontFamily: "var(--font-body)", cursor: "pointer",
        }}>Cancelar</button>
        <button onClick={handleSubmit} disabled={saving} style={{
          padding: "9px 20px", borderRadius: 10, border: "none",
          backgroundColor: saving ? "#9ca3af" : "#1a3a2a",
          color: "#ffffff", fontSize: 14, fontWeight: 600,
          fontFamily: "var(--font-body)", cursor: saving ? "not-allowed" : "pointer",
          display: "flex", alignItems: "center", gap: 8,
        }}
          onMouseEnter={e => { if (!saving) e.currentTarget.style.backgroundColor = "#2a5a40"; }}
          onMouseLeave={e => { if (!saving) e.currentTarget.style.backgroundColor = "#1a3a2a"; }}>
          {saving && <Loader2 style={{ width: 14, height: 14, animation: "spin 1s linear infinite" }} />}
          {saving ? "Registrando..." : "Registrar Venta"}
        </button>
      </div>
    </div>
  );
}

// ── Sub-componentes ──────────────────────────────────────────────────────────

function PaymentFields({ formData, setFormData, error, onBlur }: {
  formData: SaleFormData;
  setFormData: React.Dispatch<React.SetStateAction<SaleFormData>>;
  error?: string;
  onBlur?: () => void;
}) {
  const inputStyle: React.CSSProperties = {
    width: "100%", padding: "9px 14px", borderRadius: 10, border: "1px solid #d6cfc4",
    backgroundColor: "#faf7f2", color: "#1a3a2a", fontSize: 14,
    fontFamily: "var(--font-body)", outline: "none", boxSizing: "border-box",
  };
  const labelStyle: React.CSSProperties = {
    display: "block", fontSize: 11, fontWeight: 600, letterSpacing: "0.08em",
    textTransform: "uppercase", color: "#6b7c6b", marginBottom: 5, fontFamily: "var(--font-body)",
  };
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
      <div>
        <label style={labelStyle}>Descuento ($)</label>
        <input type="number" step="0.01" min="0" style={inputStyle}
          value={formData.discount} placeholder="0"
          onChange={e => setFormData(prev => ({ ...prev, discount: e.target.value }))} />
      </div>
      <div>
        <label style={labelStyle}>Método de Pago <span style={{ color: "#c0392b" }}>*</span></label>
        <select style={error ? { ...inputStyle, border: "1px solid #c0392b", backgroundColor: "#fdf8f7" } : inputStyle}
          value={formData.paymentMethod}
          onChange={e => setFormData(prev => ({ ...prev, paymentMethod: e.target.value }))}
          onBlur={onBlur}>
          <option value="">Seleccionar método</option>
          {PAYMENT_METHODS.map(m => <option key={m} value={m}>{m}</option>)}
        </select>
        {error && <p style={{ fontSize: 11, color: "#c0392b", marginTop: 3, fontFamily: "var(--font-body)" }}>⚠ {error}</p>}
      </div>
    </div>
  );
}

function Totals({ items, discount }: { items: SaleItem[]; discount: string }) {
  const subtotal = calcSubtotal(items);
  const desc = parseFloat(discount) || 0;
  return (
    <div style={{ padding: "14px 16px", borderRadius: 12, backgroundColor: "#f0ebe3", display: "flex", flexDirection: "column", gap: 8 }}>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <span style={{ color: "#6b7c6b", fontSize: 14, fontFamily: "var(--font-body)" }}>Subtotal</span>
        <span style={{ color: "#1a3a2a", fontSize: 14, fontFamily: "var(--font-body)" }}>${subtotal.toLocaleString("es-CO")}</span>
      </div>
      {desc > 0 && (
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <span style={{ color: "#1a5c3a", fontSize: 14, fontFamily: "var(--font-body)" }}>Descuento</span>
          <span style={{ color: "#1a5c3a", fontSize: 14, fontFamily: "var(--font-body)" }}>-${desc.toLocaleString("es-CO")}</span>
        </div>
      )}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid #d6cfc4", paddingTop: 10 }}>
        <span style={{ color: "#1a3a2a", fontSize: 15, fontFamily: "var(--font-display)" }}>Total</span>
        <span style={{ color: "#1a3a2a", fontSize: 20, fontWeight: 700, fontFamily: "var(--font-display)" }}>
          ${calcTotal(items, discount).toLocaleString("es-CO")}
        </span>
      </div>
    </div>
  );
}
