import { useState } from "react";
import { Button } from "../../../shared/ui/button";
import { Input } from "../../../shared/ui/input";
import { Label } from "../../../shared/ui/label";
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
  employees:           any[];
  saving:              boolean;
  onSubmit:            () => void;
  onCancel:            () => void;
  onAppointmentSelect: (id: string) => void;
  onAddService:        (id: number, employeeId?: number) => void;
  onUpdateQuantity:    (id: number, qty: number) => void;
  onRemoveService:     (id: number) => void;
}

type Errors = { client?: string; services?: string; payment?: string; appointment?: string };

function validateDirect(data: SaleFormData): Errors {
  const e: Errors = {};
  if (data.guestMode) {
    if (!data.guestFirstName?.trim()) e.client = "El nombre del cliente es obligatorio.";
  } else {
    if (!data.clienteId) e.client = "Selecciona un cliente.";
  }
  if (data.selectedServices.length === 0) e.services = "Agrega al menos un servicio.";
  if (!data.paymentMethod)                e.payment  = "Selecciona un método de pago.";
  return e;
}

function validateAppointment(data: SaleFormData): Errors {
  const e: Errors = {};
  if (!data.appointmentId) e.appointment = "Selecciona una cita.";
  if (!data.paymentMethod) e.payment     = "Selecciona un método de pago.";
  return e;
}

export function SaleForm({
  formData, setFormData, saleType, onSaleTypeChange,
  appointments, availableServices, clients, employees, saving,
  onSubmit, onCancel, onAppointmentSelect,
  onAddService, onUpdateQuantity, onRemoveService,
}: SaleFormProps) {
  const [touched, setTouched] = useState<Partial<Record<keyof Errors, boolean>>>({});
  const [pendingServiceId,  setPendingServiceId]  = useState<string>("");
  const [pendingEmployeeId, setPendingEmployeeId] = useState<string>("");

  const filteredEmployees = (() => {
    if (!pendingServiceId) return employees;
    const service = availableServices.find(s => s.id === parseInt(pendingServiceId));
    if (!service?.category) return employees;
    const matches = employees.filter(
      e => e.specialty?.toLowerCase() === service.category.toLowerCase()
    );
    return matches.length > 0 ? matches : employees;
  })();

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

  const selectCls = (hasError?: boolean) =>
    `w-full rounded-lg border px-3 py-2 text-sm bg-white text-gray-900 outline-none ${hasError ? "border-red-500 bg-red-50" : "border-gray-200"}`;

  return (
    <div className="space-y-5 mt-4">

      {/* Tabs */}
      <div className="flex rounded-lg border border-gray-200 overflow-hidden">
        <button
          className={`flex-1 py-2 px-4 text-sm font-semibold transition-all border-r border-gray-200 ${saleType === "direct" ? "bg-gray-100 text-gray-900" : "bg-white text-gray-500 hover:bg-gray-50"}`}
          onClick={() => onSaleTypeChange("direct")}
        >
          Venta Directa
        </button>
        <button
          className={`flex-1 py-2 px-4 text-sm font-semibold transition-all ${saleType === "appointment" ? "bg-gray-100 text-gray-900" : "bg-white text-gray-500 hover:bg-gray-50"}`}
          onClick={() => onSaleTypeChange("appointment")}
        >
          Desde Cita
        </button>
      </div>

      {/* ── VENTA DIRECTA ── */}
      {saleType === "direct" && (
        <>
          {/* Toggle cliente no registrado */}
          <div className="flex items-center justify-between rounded-lg border border-gray-200 bg-gray-50 px-4 py-3">
            <span className="text-sm font-medium text-gray-900">Cliente no registrado</span>
            <button
              type="button"
              onClick={() => setFormData(prev => ({
                ...prev,
                guestMode: !prev.guestMode,
                clienteId: "",
                guestDocType: "", guestDoc: "", guestFirstName: "",
                guestLastName: "", guestEmail: "", guestPhone: "",
              }))}
              className="relative inline-flex items-center w-10 h-6 rounded-full border-0 cursor-pointer transition-colors"
              style={{ backgroundColor: formData.guestMode ? "#1a3a2a" : "#9ca3af", padding: 0 }}
            >
              <span
                className="absolute w-4 h-4 rounded-full bg-white shadow transition-all"
                style={{ left: formData.guestMode ? "22px" : "2px" }}
              />
            </button>
          </div>

          {/* Cliente registrado */}
          {!formData.guestMode && (
            <div className="space-y-2">
              <Label className="text-gray-900">Cliente *</Label>
              <select
                className={selectCls(!!liveErr.client)}
                value={formData.clienteId}
                onChange={e => setFormData(prev => ({ ...prev, clienteId: e.target.value }))}
                onBlur={() => touch("client")}
              >
                <option value="">Seleccionar cliente</option>
                {clients.map(c => <option key={c.id} value={c.id.toString()}>{c.name}</option>)}
              </select>
              {liveErr.client && <p className="text-xs text-red-500">⚠ {liveErr.client}</p>}
            </div>
          )}

          {/* Cliente ocasional */}
          {formData.guestMode && (
            <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 space-y-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Datos del cliente ocasional</p>

              {/* Tipo doc + Número */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-gray-900">Tipo de Documento</Label>
                  <select
                    className={selectCls()}
                    value={formData.guestDocType ?? ""}
                    onChange={e => setFormData(prev => ({
                      ...prev, guestDocType: e.target.value,
                      guestDoc: "", guestFirstName: "", guestLastName: "",
                    }))}
                  >
                    <option value="">Seleccionar</option>
                    {["CC","CE","TI","PP","NIT"].map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label className="text-gray-900">
                    {formData.guestDocType === "NIT" ? "NIT" : "Número de Documento"}
                  </Label>
                  <div className="flex gap-2">
                    <Input
                      className="rounded-lg border-gray-200 flex-1"
                      value={formData.guestDoc ?? ""}
                      onChange={e => setFormData(prev => ({ ...prev, guestDoc: e.target.value.replace(/\D/g,"") }))}
                      placeholder={formData.guestDocType === "NIT" ? "900123456" : "1234567890"}
                      maxLength={20}
                    />
                    {formData.guestDocType === "NIT" && (
                      <Input
                        className="rounded-lg border-gray-200 w-16 text-center"
                        value={formData.guestDV ?? ""}
                        onChange={e => setFormData(prev => ({ ...prev, guestDV: e.target.value.replace(/\D/g,"") }))}
                        placeholder="DV"
                        maxLength={1}
                        title="Dígito de verificación"
                      />
                    )}
                  </div>
                  {formData.guestDocType === "NIT" && (
                    <p className="text-xs text-gray-400">NIT + dígito de verificación</p>
                  )}
                </div>
              </div>

              {/* Razón Social / Nombre */}
              {formData.guestDocType === "NIT" ? (
                <>
                  <div className="space-y-2">
                    <Label className="text-gray-900">Razón Social *</Label>
                    <Input
                      className={`rounded-lg ${liveErr.client ? "border-red-500 bg-red-50" : "border-gray-200"}`}
                      value={formData.guestFirstName ?? ""}
                      onChange={e => setFormData(prev => ({ ...prev, guestFirstName: e.target.value }))}
                      placeholder="Empresa S.A.S."
                      onBlur={() => touch("client")}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-gray-900">Representante Legal</Label>
                    <Input
                      className="rounded-lg border-gray-200"
                      value={formData.guestLastName ?? ""}
                      onChange={e => setFormData(prev => ({ ...prev, guestLastName: e.target.value }))}
                      placeholder="Nombre completo del representante"
                    />
                  </div>
                </>
              ) : (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-gray-900">Nombre *</Label>
                    <Input
                      className={`rounded-lg ${liveErr.client ? "border-red-500 bg-red-50" : "border-gray-200"}`}
                      value={formData.guestFirstName ?? ""}
                      onChange={e => setFormData(prev => ({ ...prev, guestFirstName: e.target.value }))}
                      placeholder="Juan"
                      onBlur={() => touch("client")}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-gray-900">Apellido</Label>
                    <Input
                      className="rounded-lg border-gray-200"
                      value={formData.guestLastName ?? ""}
                      onChange={e => setFormData(prev => ({ ...prev, guestLastName: e.target.value }))}
                      placeholder="Pérez"
                    />
                  </div>
                </div>
              )}

              {/* Email + Teléfono */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-gray-900">Correo</Label>
                  <Input
                    type="email"
                    className="rounded-lg border-gray-200"
                    value={formData.guestEmail ?? ""}
                    onChange={e => setFormData(prev => ({ ...prev, guestEmail: e.target.value }))}
                    placeholder="correo@ejemplo.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-gray-900">Teléfono</Label>
                  <Input
                    className="rounded-lg border-gray-200"
                    value={formData.guestPhone ?? ""}
                    onChange={e => setFormData(prev => ({ ...prev, guestPhone: e.target.value.replace(/\D/g,"") }))}
                    placeholder="3001234567"
                    maxLength={10}
                  />
                </div>
              </div>
              {liveErr.client && <p className="text-xs text-red-500">⚠ {liveErr.client}</p>}
            </div>
          )}

          {/* Agregar servicio + empleado */}
          <div className="space-y-2">
            <Label className="text-gray-900">Agregar Servicio *</Label>
            <div className="grid grid-cols-2 gap-4">
              <select
                className={selectCls(!!liveErr.services)}
                value={pendingServiceId}
                onChange={e => { setPendingServiceId(e.target.value); setPendingEmployeeId(""); }}
                onBlur={() => touch("services")}
              >
                <option value="">Seleccionar servicio...</option>
                {availableServices.map(s => (
                  <option key={s.id} value={s.id.toString()}>{s.name} — ${s.price?.toLocaleString("es-CO")}</option>
                ))}
              </select>
              <select
                className={selectCls()}
                value={pendingEmployeeId}
                onChange={e => setPendingEmployeeId(e.target.value)}
                disabled={!pendingServiceId}
              >
                <option value="">
                  {!pendingServiceId
                    ? "Primero selecciona un servicio"
                    : filteredEmployees.length === 0
                      ? "Sin especialistas disponibles"
                      : "Empleado (opcional)"}
                </option>
                {filteredEmployees.map(e => (
                  <option key={e.id} value={e.id.toString()}>
                    {e.name}{e.specialty ? ` — ${e.specialty}` : ""}
                  </option>
                ))}
              </select>
            </div>
            <Button
              type="button"
              disabled={!pendingServiceId}
              onClick={() => {
                if (!pendingServiceId) return;
                onAddService(parseInt(pendingServiceId), pendingEmployeeId ? parseInt(pendingEmployeeId) : undefined);
                setPendingServiceId("");
                setPendingEmployeeId("");
              }}
              className="w-full rounded-lg"
              style={{ backgroundColor: pendingServiceId ? "#1a3a2a" : undefined, color: pendingServiceId ? "#ffffff" : undefined }}
            >
              + Agregar servicio
            </Button>
            {liveErr.services && <p className="text-xs text-red-500">⚠ {liveErr.services}</p>}
          </div>

          {/* Lista servicios */}
          {formData.selectedServices.length > 0 && (
            <div className="space-y-2">
              {formData.selectedServices.map(item => (
                <div key={item.serviceId} className="rounded-lg border border-gray-200 bg-white px-4 py-3 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{item.serviceName}</p>
                    <p className="text-xs text-gray-500">
                      ${item.price?.toLocaleString("es-CO")} c/u
                      {item.employeeName && ` • ${item.employeeName}`}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={e => onUpdateQuantity(item.serviceId, parseInt(e.target.value))}
                      className="w-16 text-center rounded-lg border-gray-200 px-2 py-1 text-sm"
                    />
                    <span className="text-sm font-semibold text-gray-900 min-w-[70px] text-right">
                      ${(item.price * item.quantity).toLocaleString("es-CO")}
                    </span>
                    <button
                      onClick={() => onRemoveService(item.serviceId)}
                      className="w-7 h-7 rounded-md flex items-center justify-center bg-red-50 text-red-500 hover:bg-red-100 transition-colors border-0"
                    >
                      <XCircle className="w-3.5 h-3.5" />
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
          <div className="space-y-2">
            <Label className="text-gray-900">Seleccionar Cita *</Label>
            <select
              className={selectCls(!!liveErr.appointment)}
              value={formData.appointmentId?.toString() || ""}
              onChange={e => onAppointmentSelect(e.target.value)}
              onBlur={() => touch("appointment")}
            >
              <option value="">Buscar cita...</option>
              {appointments.length === 0
                ? <option disabled value="">No hay citas activas</option>
                : appointments.map(a => (
                  <option key={a.id} value={a.id.toString()}>
                    {a.clientName} — {a.service} ({a.date ? new Date(a.date).toLocaleDateString("es-ES") : ""} {a.time})
                  </option>
                ))}
            </select>
            {liveErr.appointment && <p className="text-xs text-red-500">⚠ {liveErr.appointment}</p>}
          </div>

          {formData.appointmentId && formData.selectedServices.length > 0 && (
            <div className="rounded-lg border border-gray-200 bg-white px-4 py-3 space-y-1">
              {formData.selectedServices.map(item => (
                <div key={item.serviceId} className="flex justify-between text-sm">
                  <span className="text-gray-900">{item.serviceName}</span>
                  <span className="font-semibold text-gray-900">${(item.price * item.quantity).toLocaleString("es-CO")}</span>
                </div>
              ))}
            </div>
          )}

          {formData.appointmentId && (
            <>
              <PaymentFields formData={formData} setFormData={setFormData} error={liveErr.payment} onBlur={() => touch("payment")} />
              <div className="rounded-lg border border-gray-200 bg-white px-4 py-3 flex justify-between items-center">
                <span className="text-sm text-gray-900">Total estimado</span>
                <span className="text-lg font-bold text-gray-900">
                  ${calcTotal(formData.selectedServices, formData.discount).toLocaleString("es-CO")}
                </span>
              </div>
            </>
          )}
        </>
      )}

      {/* Botones */}
      <div className="flex justify-end gap-3 pt-4 border-t">
        <Button variant="outline" onClick={onCancel} className="rounded-lg border-gray-300">
          Cancelar
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={saving}
          style={{ backgroundColor: saving ? undefined : "#1a3a2a", color: saving ? undefined : "#ffffff" }}
          onMouseEnter={e => { if (!saving) e.currentTarget.style.backgroundColor = "#2a5a40"; }}
          onMouseLeave={e => { if (!saving) e.currentTarget.style.backgroundColor = "#1a3a2a"; }}
          className="rounded-lg"
        >
          {saving && <Loader2 className="w-3.5 h-3.5 mr-2 animate-spin" />}
          {saving ? "Registrando..." : "Registrar Venta"}
        </Button>
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
  return (
    <div className="grid grid-cols-2 gap-4">
      <div className="space-y-2">
        <Label className="text-gray-900">Descuento ($)</Label>
        <Input
          type="number"
          step="0.01"
          min="0"
          value={formData.discount}
          placeholder="0"
          onChange={e => setFormData(prev => ({ ...prev, discount: e.target.value }))}
          className="rounded-lg border-gray-200"
        />
      </div>
      <div className="space-y-2">
        <Label className="text-gray-900">Método de Pago *</Label>
        <select
          className={`w-full rounded-lg border px-3 py-2 text-sm bg-white text-gray-900 outline-none ${error ? "border-red-500 bg-red-50" : "border-gray-200"}`}
          value={formData.paymentMethod}
          onChange={e => setFormData(prev => ({ ...prev, paymentMethod: e.target.value }))}
          onBlur={onBlur}
        >
          <option value="">Seleccionar método</option>
          {PAYMENT_METHODS.map(m => <option key={m} value={m}>{m}</option>)}
        </select>
        {error && <p className="text-xs text-red-500">⚠ {error}</p>}
      </div>
    </div>
  );
}

function Totals({ items, discount }: { items: SaleItem[]; discount: string }) {
  const subtotal = calcSubtotal(items);
  const desc = parseFloat(discount) || 0;
  return (
    <div className="rounded-lg bg-gray-100 px-4 py-3 space-y-2">
      <div className="flex justify-between text-sm text-gray-600">
        <span>Subtotal</span>
        <span>${subtotal.toLocaleString("es-CO")}</span>
      </div>
      {desc > 0 && (
        <div className="flex justify-between text-sm text-emerald-700">
          <span>Descuento</span>
          <span>-${desc.toLocaleString("es-CO")}</span>
        </div>
      )}
      <div className="flex justify-between items-center border-t border-gray-200 pt-2">
        <span className="text-sm font-semibold text-gray-900">Total</span>
        <span className="text-xl font-bold text-gray-900">
          ${calcTotal(items, discount).toLocaleString("es-CO")}
        </span>
      </div>
    </div>
  );
}
