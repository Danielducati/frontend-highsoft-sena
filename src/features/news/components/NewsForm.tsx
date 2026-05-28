// news/components/NewsForm.tsx
import { useState, useEffect } from "react";
import { Label } from "../../../shared/ui/label";
import { Textarea } from "../../../shared/ui/textarea";
import { Button } from "../../../shared/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../shared/ui/select";
import { Alert, AlertDescription } from "../../../shared/ui/alert";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "../../../shared/ui/accordion";
import {
  User, Calendar, Clock, FileText, Tag,
  AlertCircle, Info, CheckCircle2,
} from "lucide-react";

import { NEWS_TYPES, TIME_SLOTS } from "../constants";
import { Employee, EmployeeNews, NewsFormData } from "../types";
import { scheduleService } from "../services/scheduleService";

// ── Tipos que REQUIEREN horario registrado ────────────────────────────────────
const REQUIRES_SCHEDULE: Array<EmployeeNews["type"]> = ["retraso", "ausencia"];

// ── Tipos que muestran el selector de horas ───────────────────────────────────
// retraso: horas obligatorias | ausencia: horas opcionales
const REQUIRES_HOURS: Array<EmployeeNews["type"]> = ["retraso", "ausencia"];

// ── Tipos que solo permiten UN DÍA (fecha fin = fecha inicio) ─────────────────
const SINGLE_DAY_ONLY: Array<EmployeeNews["type"]> = ["retraso", "ausencia"];

// ── Tipos que permiten MÚLTIPLES DÍAS ─────────────────────────────────────────
const MULTIPLE_DAYS_ALLOWED: Array<EmployeeNews["type"]> = ["permiso", "incapacidad"];

interface NewsFormProps {
  formData:    NewsFormData;
  setFormData: React.Dispatch<React.SetStateAction<NewsFormData>>;
  employees:   Employee[];
  editingNews: EmployeeNews | null;
  onSubmit:    () => void;
  onCancel:    () => void;
  loggedEmployeeId?: string | null;
  userRole?: string;
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function getMonday(dateStr: string): string {
  const d = new Date(`${dateStr}T12:00:00Z`);
  const day = d.getUTCDay();
  const diff = day === 0 ? -6 : 1 - day;
  const monday = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate() + diff));
  return monday.toISOString().split("T")[0];
}

function getCurrentMonday(): string {
  const today = new Date();
  const day = today.getUTCDay();
  const diff = day === 0 ? -6 : 1 - day;
  const monday = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate() + diff));
  return monday.toISOString().split("T")[0];
}

function getDayIndexFromDate(dateStr: string): number {
  const d = new Date(`${dateStr}T12:00:00Z`);
  const jsDay = d.getUTCDay();
  return jsDay === 0 ? 6 : jsDay - 1;
}

const DAY_NAMES  = ["Lunes","Martes","Miércoles","Jueves","Viernes","Sábado","Domingo"];
const DAY_SHORTS = ["Lun","Mar","Mié","Jue","Vie","Sáb","Dom"];

// ─────────────────────────────────────────────────────────────────────────────

export function NewsForm({ formData, setFormData, employees, editingNews, onSubmit, onCancel, loggedEmployeeId, userRole }: NewsFormProps) {
  const [employeeSchedules, setEmployeeSchedules] = useState<any[]>([]);
  const [loadingSchedule,   setLoadingSchedule]   = useState(false);
  const [viewWeekStart,     setViewWeekStart]      = useState(getCurrentMonday());

  // Determinar si el usuario es empleado (no admin)
  const isEmployee = userRole && userRole !== "admin" && userRole !== "administrador";

  // Auto-seleccionar empleado logueado si es empleado y no está editando
  useEffect(() => {
    if (isEmployee && loggedEmployeeId && !editingNews && !formData.employeeId) {
      const emp = employees.find(e => String(e.id) === String(loggedEmployeeId));
      if (emp) {
        setFormData(prev => ({
          ...prev,
          employeeId: String(emp.id),
          employeeName: emp.name,
        }));
      }
    }
  }, [isEmployee, loggedEmployeeId, editingNews, formData.employeeId, employees, setFormData]);

  // Cargar horarios reales cuando cambia el empleado
  useEffect(() => {
    if (!formData.employeeId) { setEmployeeSchedules([]); return; }
    setLoadingSchedule(true);
    scheduleService
      .getEmployeeSchedule(formData.employeeId)
      .then(data => setEmployeeSchedules(data ?? []))
      .catch(() => setEmployeeSchedules([]))
      .finally(() => setLoadingSchedule(false));
  }, [formData.employeeId]);

  // Centrar vista en la semana de la fecha seleccionada
  useEffect(() => {
    if (formData.date) setViewWeekStart(getMonday(formData.date));
  }, [formData.date]);

  // Al cambiar tipo: limpiar horas si no las necesita, sincronizar fecha fin
  useEffect(() => {
    if (!REQUIRES_HOURS.includes(formData.type)) {
      setFormData(prev => ({
        ...prev,
        startTime: "",
        endTime: "",
        // Si es de un solo día, sincronizar fecha fin con fecha inicio
        fechaFinal: SINGLE_DAY_ONLY.includes(prev.type) && prev.date
          ? prev.date
          : prev.fechaFinal,
      }));
    } else {
      // retraso/ausencia: fecha fin = fecha inicio (un solo día)
      setFormData(prev => ({ ...prev, fechaFinal: prev.date || prev.fechaFinal }));
    }
  }, [formData.type, setFormData]);

  // ── Derivados ─────────────────────────────────────────────────────────────
  const requiresSchedule = REQUIRES_SCHEDULE.includes(formData.type);
  const requiresHours    = REQUIRES_HOURS.includes(formData.type);
  const isSingleDayOnly  = SINGLE_DAY_ONLY.includes(formData.type);
  const allowsMultipleDays = MULTIPLE_DAYS_ALLOWED.includes(formData.type);

  // Fecha fin bloqueada para tipos de un solo día
  const lockEndDate = isSingleDayOnly;

  // Set de dayIndex disponibles del empleado
  const availableDayIndices: Set<number> = new Set(
    employeeSchedules.flatMap(week => (week.daySchedules ?? []).map((ds: any) => ds.dayIndex))
  );

  const getDayScheduleForDate = (dateStr: string) => {
    if (!dateStr || employeeSchedules.length === 0) return null;
    const dayIdx = getDayIndexFromDate(dateStr);
    for (const week of employeeSchedules) {
      const ds = (week.daySchedules ?? []).find((d: any) => d.dayIndex === dayIdx);
      if (ds) return ds;
    }
    return null;
  };

  const getViewWeekDays = () => {
    const week = employeeSchedules.find(w => w.weekStartDate === viewWeekStart);
    return Array.from({ length: 7 }, (_, i) => {
      const ds = week?.daySchedules?.find((d: any) => d.dayIndex === i) ?? null;
      return { dayIndex: i, name: DAY_NAMES[i], short: DAY_SHORTS[i], startTime: ds?.startTime ?? null, endTime: ds?.endTime ?? null, available: !!ds };
    });
  };

  const viewWeekDays = getViewWeekDays();

  const startDaySchedule   = formData.date      ? getDayScheduleForDate(formData.date)      : null;
  const startDateHasSchedule = !!startDaySchedule;
  const endDateInvalid     = !!formData.date && !!formData.fechaFinal && formData.fechaFinal < formData.date;
  const hoursInvalid       = requiresHours && !!formData.startTime && !!formData.endTime && formData.endTime <= formData.startTime;
  const startOutOfRange    = requiresHours && !!formData.startTime && !!startDaySchedule && formData.startTime < startDaySchedule.startTime;
  const endOutOfRange      = requiresHours && !!formData.endTime   && !!startDaySchedule && formData.endTime   > startDaySchedule.endTime;

  const canSubmit = (() => {
    if (!formData.employeeId || !formData.date || !formData.description.trim()) return false;
    if (endDateInvalid) return false;
    
    // Validar horario solo para tipos que lo requieren
    if (requiresSchedule && !startDateHasSchedule) return false;
    
    // Retraso requiere horas obligatorias
    if (formData.type === "retraso" && (!formData.startTime || !formData.endTime || hoursInvalid)) return false;
    
    // Ausencia con horas opcionales, pero si las pone deben ser válidas
    if (formData.type === "ausencia" && formData.startTime && formData.endTime && hoursInvalid) return false;
    
    return true;
  })();

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handleEmployeeChange = (empId: string) => {
    const emp = employees.find(e => String(e.id) === empId);
    if (emp) setFormData(prev => ({ ...prev, employeeId: String(emp.id), employeeName: emp.name }));
  };

  const prevViewWeek = () => {
    const d = new Date(`${viewWeekStart}T12:00:00Z`);
    d.setUTCDate(d.getUTCDate() - 7);
    setViewWeekStart(d.toISOString().split("T")[0]);
  };
  const nextViewWeek = () => {
    const d = new Date(`${viewWeekStart}T12:00:00Z`);
    d.setUTCDate(d.getUTCDate() + 7);
    setViewWeekStart(d.toISOString().split("T")[0]);
  };

  const viewWeekLabel = (() => {
    const s = new Date(`${viewWeekStart}T12:00:00Z`);
    const e = new Date(s); e.setUTCDate(s.getUTCDate() + 6);
    return `${s.toLocaleDateString("es-ES", { day: "2-digit", month: "short" })} – ${e.toLocaleDateString("es-ES", { day: "2-digit", month: "short", year: "numeric" })}`;
  })();

  // ── Mensajes por tipo ─────────────────────────────────────────────────────
  const typeInfo: Record<string, { msg: string; color: string; icon: React.ReactNode }> = {
    retraso:     { 
      msg: "⚠️ Solo un día. Requiere horario registrado. Debes indicar la franja horaria afectada.", 
      color: "text-yellow-700 bg-yellow-50 border-yellow-200", 
      icon: <Clock className="w-3.5 h-3.5 text-yellow-600" /> 
    },
    ausencia:    { 
      msg: "⚠️ Solo un día. Requiere horario registrado. Las horas son opcionales.", 
      color: "text-orange-700 bg-orange-50 border-orange-200", 
      icon: <AlertCircle className="w-3.5 h-3.5 text-orange-600" /> 
    },
    permiso:     { 
      msg: "✓ Puede ser varios días. No requiere horario registrado.", 
      color: "text-blue-700 bg-blue-50 border-blue-200", 
      icon: <FileText className="w-3.5 h-3.5 text-blue-600" /> 
    },
    incapacidad: { 
      msg: "✓ Puede abarcar varios días. No requiere horario registrado.", 
      color: "text-green-700 bg-green-50 border-green-200", 
      icon: <AlertCircle className="w-3.5 h-3.5 text-green-600" /> 
    },
    otro:        { 
      msg: "No requiere horario registrado.", 
      color: "text-gray-700 bg-gray-50 border-gray-200", 
      icon: <FileText className="w-3.5 h-3.5 text-gray-500" /> 
    },
  };
  const currentTypeInfo = typeInfo[formData.type as string];

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-5">

      {/* Empleado */}
      <div className="space-y-2">
        <Label className="flex items-center gap-2 text-sm font-medium">
          <User className="w-4 h-4 text-[#1a5c3a]" />
          Empleado *
        </Label>
        {isEmployee ? (
          // Empleado bloqueado para usuarios no-admin
          <div className="w-full h-10 px-3 border border-gray-200 bg-gray-50 rounded-md flex items-center text-sm text-gray-700">
            {formData.employeeName || "Cargando..."}
          </div>
        ) : (
          // Selector normal para administradores
          <Select
            value={formData.employeeId || "placeholder"}
            onValueChange={v => { if (v !== "placeholder") handleEmployeeChange(v); }}
          >
            <SelectTrigger className="border-gray-300">
              <SelectValue placeholder="Selecciona un empleado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="placeholder" disabled>Selecciona un empleado</SelectItem>
              {employees.map(emp => (
                <SelectItem key={emp.id} value={String(emp.id)}>
                  {emp.name}{emp.specialty ? ` — ${emp.specialty}` : ""}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
        {isEmployee && (
          <p className="text-xs text-gray-500 flex items-center gap-1">
            <Info className="w-3 h-3" />
            Solo puedes crear novedades para tu propio perfil
          </p>
        )}
      </div>

      {/* Tipo de Novedad */}
      <div className="space-y-2">
        <Label className="flex items-center gap-2 text-sm font-medium">
          <Tag className="w-4 h-4 text-[#1a5c3a]" />
          Tipo de Novedad *
        </Label>
        <Select
          value={formData.type}
          onValueChange={(v: any) => setFormData(prev => ({ ...prev, type: v }))}
        >
          <SelectTrigger className="border-gray-300">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {NEWS_TYPES.map(t => (
              <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        {currentTypeInfo && (
          <div className={`flex items-start gap-2 text-xs px-3 py-2 rounded-lg border ${currentTypeInfo.color}`}>
            {currentTypeInfo.icon}
            <span>{currentTypeInfo.msg}</span>
          </div>
        )}
      </div>

      {/* Fechas */}
      <div className="grid grid-cols-2 gap-4">
        {/* Fecha Inicio */}
        <div className="space-y-2">
          <Label className="flex items-center gap-2 text-sm font-medium">
            <Calendar className="w-4 h-4 text-[#1a5c3a]" />
            Fecha Inicio *
          </Label>
          <input
            type="date"
            min={new Date().toISOString().split("T")[0]}
            max={(() => { const d = new Date(); d.setMonth(d.getMonth() + 3); return d.toISOString().split("T")[0]; })()}
            className={`w-full h-10 px-3 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#1a5c3a] focus:border-transparent ${
              requiresSchedule && formData.date && !startDateHasSchedule
                ? "border-red-400 bg-red-50"
                : "border-gray-300"
            }`}
            value={formData.date}
            onChange={e => {
              const newDate = e.target.value;
              setFormData(prev => ({
                ...prev,
                date: newDate,
                // Sincronizar fecha fin si está bloqueada
                fechaFinal: lockEndDate ? newDate : (prev.fechaFinal === "" || prev.fechaFinal === prev.date ? newDate : prev.fechaFinal),
              }));
            }}
          />
          {requiresSchedule && formData.date && !loadingSchedule && !startDateHasSchedule && (
            <p className="text-xs text-red-600 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              El empleado no tiene horario registrado para este día. Selecciona un día con horario.
            </p>
          )}
          {requiresSchedule && formData.date && !loadingSchedule && startDateHasSchedule && (
            <p className="text-xs text-[#1a5c3a] flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" />
              Horario: {startDaySchedule!.startTime} – {startDaySchedule!.endTime}
            </p>
          )}
          {requiresSchedule && !loadingSchedule && availableDayIndices.size > 0 && (
            <p className="text-xs text-gray-400 flex items-center gap-1 flex-wrap">
              <span>Días con horario:</span>
              {[...availableDayIndices].sort().map(i => (
                <span key={i} className="px-1.5 py-0.5 rounded bg-[#edf7f4] text-[#1a5c3a] font-medium">
                  {DAY_SHORTS[i]}
                </span>
              ))}
            </p>
          )}
          {!requiresSchedule && formData.date && (
            <p className="text-xs text-blue-600 flex items-center gap-1">
              <Info className="w-3 h-3" />
              Este tipo no requiere horario registrado. Puedes seleccionar cualquier día.
            </p>
          )}
        </div>

        {/* Fecha Fin */}
        <div className="space-y-2">
          <Label className="flex items-center gap-2 text-sm font-medium">
            <Calendar className="w-4 h-4 text-[#1a5c3a]" />
            Fecha Fin
            {isSingleDayOnly && <span className="text-xs text-orange-600 font-normal">(mismo día)</span>}
            {allowsMultipleDays && <span className="text-xs text-green-600 font-normal">(puede ser varios días)</span>}
          </Label>
          <input
            type="date"
            min={formData.date || new Date().toISOString().split("T")[0]}
            max={(() => { const d = new Date(); d.setMonth(d.getMonth() + 3); return d.toISOString().split("T")[0]; })()}
            className={`w-full h-10 px-3 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#1a5c3a] focus:border-transparent ${
              endDateInvalid
                ? "border-red-400 bg-red-50"
                : lockEndDate
                ? "border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed"
                : "border-gray-300"
            }`}
            value={lockEndDate ? (formData.date || "") : (formData.fechaFinal || "")}
            readOnly={lockEndDate}
            onChange={e => { if (!lockEndDate) setFormData(prev => ({ ...prev, fechaFinal: e.target.value })); }}
          />
          {isSingleDayOnly && (
            <p className="text-xs text-orange-600 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              {formData.type === "retraso" ? "Retraso" : "Ausencia"} solo puede ser de un día.
            </p>
          )}
          {endDateInvalid && (
            <p className="text-xs text-red-600 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              La fecha fin no puede ser anterior a la fecha inicio.
            </p>
          )}
        </div>
      </div>

      {/* Horas (retraso obligatorio, ausencia opcional) */}
      {requiresHours && (
        <div className="rounded-xl border border-[#78D1BD]/40 bg-[#f0faf6] p-4 space-y-3">
          <Label className="flex items-center gap-2 text-sm font-semibold text-[#1a5c3a]">
            <Clock className="w-4 h-4" />
            Franja horaria afectada
            {formData.type === "retraso"  && <span className="text-red-500">*</span>}
            {formData.type === "ausencia" && <span className="text-xs font-normal text-gray-400">(opcional)</span>}
          </Label>

          {formData.date && !loadingSchedule && !startDateHasSchedule && (
            <Alert variant="destructive" className="py-2">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="text-xs">
                Selecciona una fecha en la que el empleado tenga horario registrado para poder indicar la franja afectada.
              </AlertDescription>
            </Alert>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-gray-600">
                Hora Inicio {formData.type === "retraso" && <span className="text-red-500">*</span>}
              </Label>
              <Select
                value={formData.startTime || "placeholder"}
                onValueChange={v => { if (v !== "placeholder") setFormData(prev => ({ ...prev, startTime: v })); }}
                disabled={requiresSchedule && !!formData.date && !startDateHasSchedule}
              >
                <SelectTrigger className={`bg-white h-10 ${startOutOfRange ? "border-yellow-400" : "border-[#78D1BD]/60"}`}>
                  <SelectValue placeholder="— Hora —" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="placeholder" disabled>— Hora —</SelectItem>
                  {TIME_SLOTS.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                </SelectContent>
              </Select>
              {startOutOfRange && (
                <p className="text-xs text-yellow-700 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  Antes del inicio del turno ({startDaySchedule!.startTime}).
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-gray-600">
                Hora Fin {formData.type === "retraso" && <span className="text-red-500">*</span>}
              </Label>
              <Select
                value={formData.endTime || "placeholder"}
                onValueChange={v => { if (v !== "placeholder") setFormData(prev => ({ ...prev, endTime: v })); }}
                disabled={requiresSchedule && !!formData.date && !startDateHasSchedule}
              >
                <SelectTrigger className={`bg-white h-10 ${hoursInvalid || endOutOfRange ? "border-red-400" : "border-[#78D1BD]/60"}`}>
                  <SelectValue placeholder="— Hora —" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="placeholder" disabled>— Hora —</SelectItem>
                  {TIME_SLOTS.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                </SelectContent>
              </Select>
              {hoursInvalid && (
                <p className="text-xs text-red-600 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  La hora fin debe ser mayor a la hora inicio.
                </p>
              )}
              {endOutOfRange && !hoursInvalid && (
                <p className="text-xs text-yellow-700 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  Después del fin del turno ({startDaySchedule!.endTime}).
                </p>
              )}
            </div>
          </div>

          {formData.startTime && formData.endTime && !hoursInvalid && (
            <div className="flex items-center gap-2 pt-2 border-t border-[#78D1BD]/30">
              <Clock className="w-3.5 h-3.5 text-[#1a5c3a]" />
              <span className="text-xs text-[#1a5c3a] font-medium">
                Franja: {formData.startTime} → {formData.endTime}
              </span>
            </div>
          )}
        </div>
      )}

      {/* Referencia visual del horario del empleado - ACORDEÓN */}
      {formData.employeeId && employeeSchedules.length > 0 && (
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="schedule" className="border border-gray-200 rounded-xl bg-gray-50">
            <AccordionTrigger className="px-4 py-3 hover:no-underline hover:bg-gray-100/50 rounded-t-xl">
              <div className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                <Clock className="w-4 h-4 text-[#1a5c3a]" />
                <span>Ver horario del empleado</span>
                <span className="text-xs font-normal text-gray-500">({viewWeekLabel})</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-4 pb-4 pt-2">
              <div className="space-y-3">
                <div className="flex items-center justify-center gap-1">
                  <button type="button" onClick={prevViewWeek} className="p-1.5 rounded hover:bg-gray-200 transition-colors">
                    <span className="text-gray-500 text-sm">‹</span>
                  </button>
                  <span className="text-xs text-gray-600 font-medium px-3">{viewWeekLabel}</span>
                  <button type="button" onClick={nextViewWeek} className="p-1.5 rounded hover:bg-gray-200 transition-colors">
                    <span className="text-gray-500 text-sm">›</span>
                  </button>
                </div>
                <div className="grid grid-cols-7 gap-1">
                  {viewWeekDays.map(day => (
                    <div key={day.dayIndex}
                      className={`rounded-lg p-2 text-center border ${day.available ? "bg-white border-[#78D1BD]/40" : "bg-gray-100 border-gray-200 opacity-50"}`}>
                      <p className="text-[10px] font-semibold text-gray-500">{day.short}</p>
                      {day.available ? (
                        <>
                          <p className="text-[9px] text-[#1a5c3a] font-medium mt-0.5">{day.startTime}</p>
                          <p className="text-[9px] text-[#1a5c3a]">{day.endTime}</p>
                        </>
                      ) : (
                        <p className="text-[9px] text-gray-400 mt-0.5">—</p>
                      )}
                    </div>
                  ))}
                </div>
                {viewWeekDays.every(d => !d.available) && (
                  <p className="text-xs text-gray-400 text-center">Sin horario registrado para esta semana.</p>
                )}
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      )}

      {/* Sin horario y tipo que lo requiere */}
      {formData.employeeId && !loadingSchedule && employeeSchedules.length === 0 && requiresSchedule && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Este empleado no tiene ningún horario registrado. Para registrar un{" "}
            <strong>{NEWS_TYPES.find(t => t.value === formData.type)?.label}</strong> es necesario que tenga horario en al menos un día.
          </AlertDescription>
        </Alert>
      )}

      {/* Sin horario pero tipo que NO lo requiere */}
      {formData.employeeId && !loadingSchedule && employeeSchedules.length === 0 && !requiresSchedule && (
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            El empleado no tiene horario registrado, pero el tipo{" "}
            <strong>{NEWS_TYPES.find(t => t.value === formData.type)?.label}</strong> no lo requiere. Puedes seleccionar cualquier día.
          </AlertDescription>
        </Alert>
      )}

      {/* Resumen */}
      {formData.date && (
        <div className="rounded-lg border border-gray-200 bg-white p-3 space-y-1 text-xs text-gray-600">
          <p className="font-semibold text-gray-800 flex items-center gap-1.5">
            <Info className="w-3.5 h-3.5 text-[#1a5c3a]" />
            Resumen de la novedad
          </p>
          <p><span className="font-medium">Tipo:</span> {NEWS_TYPES.find(t => t.value === formData.type)?.label}</p>
          <p>
            <span className="font-medium">Fecha:</span> {formData.date}
            {formData.fechaFinal && formData.fechaFinal !== formData.date ? ` al ${formData.fechaFinal}` : ""}
            {isSingleDayOnly && <span className="text-orange-600 ml-1">(un solo día)</span>}
          </p>
          {requiresHours && formData.startTime && formData.endTime && (
            <p><span className="font-medium">Franja:</span> {formData.startTime} – {formData.endTime}</p>
          )}
          {requiresSchedule && (
            <p className="text-orange-600">
              <span className="font-medium">⚠️ Requiere horario:</span> El empleado debe tener horario registrado
            </p>
          )}
          {!requiresSchedule && (
            <p className="text-blue-600">
              <span className="font-medium">✓ Sin restricción:</span> No requiere horario registrado
            </p>
          )}
        </div>
      )}

      {/* Descripción */}
      <div className="space-y-2">
        <Label className="flex items-center gap-2 text-sm font-medium">
          <FileText className="w-4 h-4 text-[#1a5c3a]" />
          Descripción *
        </Label>
        <Textarea
          rows={3}
          className="border-gray-300 resize-none text-sm"
          value={formData.description}
          onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
          placeholder="Describe la situación con el mayor detalle posible..."
        />
      </div>

      {/* Botones */}
      <div className="flex justify-end gap-3 pt-4 border-t">
        <Button variant="outline" onClick={onCancel}>Cancelar</Button>
        <Button
          variant="default"
          onClick={onSubmit}
          disabled={!canSubmit}
          style={{ backgroundColor: canSubmit ? "#1a3a2a" : undefined }}
        >
          {editingNews ? "Actualizar" : "Crear"} Novedad
        </Button>
      </div>
    </div>
  );
}
