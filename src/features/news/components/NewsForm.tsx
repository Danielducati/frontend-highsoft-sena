// news/components/NewsForm.tsx
import { useState, useEffect } from "react";
import { Label } from "../../../shared/ui/label";
import { Textarea } from "../../../shared/ui/textarea";
import { Button } from "../../../shared/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../shared/ui/select";
import { Badge } from "../../../shared/ui/badge";
import { Alert, AlertDescription } from "../../../shared/ui/alert";
import {
  User, Calendar, Clock, FileText, Tag,
  AlertCircle, Info, CheckCircle2,
} from "lucide-react";

import { NEWS_TYPES, TIME_SLOTS } from "../constants";
import { Employee, EmployeeNews, NewsFormData } from "../types";
import { scheduleService } from "../services/scheduleService";

// ── Tipos que REQUIEREN horario registrado ────────────────────────────────────
// retraso, percance, ausencia → el empleado debe tener horario en la fecha
// permiso, incapacidad, otro  → no importa si tiene horario
const REQUIRES_SCHEDULE: Array<EmployeeNews["type"]> = ["retraso", "ausencia"];

// ── Tipos que REQUIEREN horas de inicio/fin ───────────────────────────────────
// retraso y percance afectan una franja horaria concreta
// ausencia, permiso, incapacidad, otro → día completo (horas opcionales)
const REQUIRES_HOURS: Array<EmployeeNews["type"]> = ["retraso", "ausencia"];

interface NewsFormProps {
  formData:    NewsFormData;
  setFormData: React.Dispatch<React.SetStateAction<NewsFormData>>;
  employees:   Employee[];
  editingNews: EmployeeNews | null;
  onSubmit:    () => void;
  onCancel:    () => void;
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function getMonday(dateStr: string): string {
  const d = new Date(`${dateStr}T12:00:00Z`);
  const day = d.getUTCDay(); // 0=Dom
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

// dayIndex: 0=Lun … 6=Dom (igual que el backend)
function getDayIndexFromDate(dateStr: string): number {
  // Usar UTC para evitar desfase por zona horaria local
  const d = new Date(`${dateStr}T12:00:00Z`); // mediodía UTC → siempre el día correcto
  const jsDay = d.getUTCDay(); // 0=Dom, 1=Lun … 6=Sáb
  return jsDay === 0 ? 6 : jsDay - 1; // Lun=0 … Dom=6
}

const DAY_NAMES  = ["Lunes","Martes","Miércoles","Jueves","Viernes","Sábado","Domingo"];
const DAY_SHORTS = ["Lun","Mar","Mié","Jue","Vie","Sáb","Dom"];

// ─────────────────────────────────────────────────────────────────────────────

export function NewsForm({ formData, setFormData, employees, editingNews, onSubmit, onCancel }: NewsFormProps) {
  // Horarios reales del empleado (array de semanas)
  const [employeeSchedules, setEmployeeSchedules] = useState<any[]>([]);
  const [loadingSchedule,   setLoadingSchedule]   = useState(false);

  // Semana que se muestra en la referencia visual
  const [viewWeekStart, setViewWeekStart] = useState(getCurrentMonday());

  // ── Cargar horarios reales cuando cambia el empleado ─────────────────────
  useEffect(() => {
    if (!formData.employeeId) {
      setEmployeeSchedules([]);
      return;
    }
    setLoadingSchedule(true);
    scheduleService
      .getEmployeeSchedule(formData.employeeId)
      .then(data => setEmployeeSchedules(data ?? []))
      .catch(() => setEmployeeSchedules([]))
      .finally(() => setLoadingSchedule(false));
  }, [formData.employeeId]);

  // Cuando cambia la fecha de inicio, centrar la vista en esa semana
  useEffect(() => {
    if (formData.date) setViewWeekStart(getMonday(formData.date));
  }, [formData.date]);

  // Limpiar horas si el tipo cambia a uno que no las requiere
  // Y sincronizar fecha fin con fecha inicio si es día completo (excepto incapacidad)
  useEffect(() => {
    if (!REQUIRES_HOURS.includes(formData.type)) {
      setFormData(prev => ({
        ...prev,
        startTime: "",
        endTime: "",
        // Igualar fecha fin solo si NO es incapacidad
        fechaFinal: prev.type !== "incapacidad" && prev.fechaFinal === "" && prev.date
          ? prev.date
          : prev.fechaFinal,
      }));
    } else {
      // retraso: siempre igualar fecha fin a fecha inicio
      setFormData(prev => ({
        ...prev,
        fechaFinal: prev.date || prev.fechaFinal,
      }));
    }
  }, [formData.type, setFormData]);

  // ── Helpers de horario ────────────────────────────────────────────────────
  const requiresSchedule = REQUIRES_SCHEDULE.includes(formData.type);
  const requiresHours    = REQUIRES_HOURS.includes(formData.type);

  /** Set de dayIndex (0=Lun…6=Dom) que el empleado tiene horario en ALGUNA semana */
  const availableDayIndices: Set<number> = new Set(
    employeeSchedules.flatMap(week =>
      (week.daySchedules ?? []).map((ds: any) => ds.dayIndex)
    )
  );

  /** Devuelve true si el empleado trabaja ese día de la semana (en cualquier semana) */
  const isWorkingDay = (dateStr: string): boolean => {
    if (!dateStr || employeeSchedules.length === 0) return false;
    return availableDayIndices.has(getDayIndexFromDate(dateStr));
  };

  /** Devuelve el daySchedule del empleado para una fecha concreta (o null) */
  const getDayScheduleForDate = (dateStr: string) => {
    if (!dateStr || employeeSchedules.length === 0) return null;
    const dayIdx = getDayIndexFromDate(dateStr);
    // Buscar en todas las semanas del empleado
    for (const week of employeeSchedules) {
      const ds = (week.daySchedules ?? []).find((d: any) => d.dayIndex === dayIdx);
      if (ds) return ds;
    }
    return null;
  };

  /** Devuelve los daySchedules de la semana visible (para la referencia visual) */
  const getViewWeekDays = () => {
    const week = employeeSchedules.find(w => w.weekStartDate === viewWeekStart);
    const result = [];
    for (let i = 0; i < 7; i++) {
      const ds = week?.daySchedules?.find((d: any) => d.dayIndex === i) ?? null;
      result.push({
        dayIndex: i,
        name:  DAY_NAMES[i],
        short: DAY_SHORTS[i],
        startTime: ds?.startTime ?? null,
        endTime:   ds?.endTime   ?? null,
        available: !!ds,
      });
    }
    return result;
  };

  const viewWeekDays = getViewWeekDays();

  // Tipos de día completo donde la fecha fin se bloquea (= fecha inicio)
  // Incapacidad queda fuera porque puede abarcar varios días
  // Retraso también bloquea fecha fin (es siempre un solo día)
  const lockEndDate = !requiresHours && formData.type !== "incapacidad" || formData.type === "retraso";
  const startDaySchedule = formData.date ? getDayScheduleForDate(formData.date) : null;
  const endDaySchedule   = formData.fechaFinal ? getDayScheduleForDate(formData.fechaFinal) : null;

  // ¿El empleado labora en la fecha de inicio?
  const startDateHasSchedule = !!startDaySchedule;
  // ¿El empleado labora en la fecha fin?
  const endDateHasSchedule   = !formData.fechaFinal || !!endDaySchedule;

  // Fecha fin anterior a fecha inicio
  const endDateInvalid = !!formData.date && !!formData.fechaFinal && formData.fechaFinal < formData.date;

  // Horas: fin <= inicio
  const hoursInvalid = requiresHours && !!formData.startTime && !!formData.endTime && formData.endTime <= formData.startTime;

  // Hora fuera del horario laboral
  const startOutOfRange = requiresHours && !!formData.startTime && !!startDaySchedule &&
    formData.startTime < startDaySchedule.startTime;
  const endOutOfRange   = requiresHours && !!formData.endTime && !!startDaySchedule &&
    formData.endTime > startDaySchedule.endTime;

  // ¿Puede guardar?
  const canSubmit = (() => {
    if (!formData.employeeId || !formData.date || !formData.description.trim()) return false;
    if (endDateInvalid) return false;
    if (requiresSchedule && !startDateHasSchedule) return false;
    // Retraso: horas obligatorias. Ausencia: horas opcionales pero si se ponen deben ser válidas
    if (formData.type === "retraso" && (!formData.startTime || !formData.endTime || hoursInvalid)) return false;
    if (formData.type === "ausencia" && formData.startTime && formData.endTime && hoursInvalid) return false;
    return true;
  })();

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handleEmployeeChange = (empId: string) => {
    const emp = employees.find(e => String(e.id) === empId);
    if (emp) setFormData(prev => ({ ...prev, employeeId: String(emp.id), employeeName: emp.name }));
  };

  const prevViewWeek = () => {
    const d = new Date(`${viewWeekStart}T00:00:00`);
    d.setDate(d.getDate() - 7);
    setViewWeekStart(d.toISOString().split("T")[0]);
  };
  const nextViewWeek = () => {
    const d = new Date(`${viewWeekStart}T00:00:00`);
    d.setDate(d.getDate() + 7);
    setViewWeekStart(d.toISOString().split("T")[0]);
  };

  const viewWeekLabel = (() => {
    const s = new Date(`${viewWeekStart}T00:00:00`);
    const e = new Date(s); e.setDate(s.getDate() + 6);
    return `${s.toLocaleDateString("es-ES", { day: "2-digit", month: "short" })} – ${e.toLocaleDateString("es-ES", { day: "2-digit", month: "short", year: "numeric" })}`;
  })();

  // ── Descripción del tipo seleccionado ─────────────────────────────────────
  const typeInfo: Record<string, { msg: string; color: string; icon: React.ReactNode }> = {
    retraso:     { msg: "Requiere horario registrado. Debes indicar la franja horaria afectada.", color: "text-yellow-700 bg-yellow-50 border-yellow-200", icon: <Clock className="w-3.5 h-3.5 text-yellow-600" /> },
    ausencia:    { msg: "Requiere horario registrado. Un solo día. Las horas son opcionales.", color: "text-green-800 bg-[#edf7f4] border-[#78D1BD]", icon: <AlertCircle className="w-3.5 h-3.5 text-[#1a5c3a]" /> },
    permiso:     { msg: "No requiere horario registrado. Puede ser cualquier día.", color: "text-blue-700 bg-blue-50 border-blue-200", icon: <FileText className="w-3.5 h-3.5 text-blue-600" /> },
    incapacidad: { msg: "No requiere horario registrado. Puede abarcar varios días.", color: "text-yellow-700 bg-yellow-50 border-yellow-200", icon: <AlertCircle className="w-3.5 h-3.5 text-yellow-600" /> },
    otro:        { msg: "No requiere horario registrado.", color: "text-gray-700 bg-gray-50 border-gray-200", icon: <FileText className="w-3.5 h-3.5 text-gray-500" /> },
  };
  const currentTypeInfo = typeInfo[formData.type];

  return (
    <div className="space-y-5">

      {/* ── Empleado ── */}
      <div className="space-y-2">
        <Label className="flex items-center gap-2 text-sm font-medium">
          <User className="w-4 h-4 text-[#1a5c3a]" />
          Empleado *
        </Label>
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
      </div>

      {/* ── Tipo de Novedad ── */}
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

        {/* Descripción del tipo */}
        {currentTypeInfo && (
          <div className={`flex items-start gap-2 text-xs px-3 py-2 rounded-lg border ${currentTypeInfo.color}`}>
            {currentTypeInfo.icon}
            <span>{currentTypeInfo.msg}</span>
          </div>
        )}
      </div>

      {/* ── Fechas ── */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label className="flex items-center gap-2 text-sm font-medium">
            <Calendar className="w-4 h-4 text-[#1a5c3a]" />
            Fecha Inicio *
          </Label>
          <input
            type="date"
            className={`w-full h-10 px-3 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#1a5c3a] focus:border-transparent ${
              requiresSchedule && formData.date && !startDateHasSchedule
                ? "border-red-400 bg-red-50"
                : "border-gray-300"
            }`}
            value={formData.date}
            onChange={e => {
              const newDate = e.target.value;
              // Si el tipo requiere horario y el día seleccionado no tiene → limpiar
              if (requiresSchedule && newDate && employeeSchedules.length > 0 && !isWorkingDay(newDate)) {
                setFormData(prev => ({ ...prev, date: newDate, fechaFinal: !requiresHours ? newDate : prev.fechaFinal }));
                // El error se muestra via startDateHasSchedule
                return;
              }
              setFormData(prev => ({
                ...prev,
                date: newDate,
                fechaFinal: !requiresHours
                  ? (prev.fechaFinal === "" || prev.fechaFinal === prev.date ? newDate : prev.fechaFinal)
                  : prev.fechaFinal,
              }));
            }}
          />
          {/* Validación: requiere horario y no tiene */}
          {requiresSchedule && formData.date && !loadingSchedule && !startDateHasSchedule && (
            <p className="text-xs text-red-600 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              El empleado no tiene horario registrado para este día.
            </p>
          )}
          {/* OK: tiene horario */}
          {requiresSchedule && formData.date && !loadingSchedule && startDateHasSchedule && (
            <p className="text-xs text-[#1a5c3a] flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" />
              Horario: {startDaySchedule!.startTime} – {startDaySchedule!.endTime}
            </p>
          )}
          {/* Hint: días disponibles del empleado */}
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
          {/* Permiso/incapacidad/otro: no requiere horario */}
          {!requiresSchedule && formData.date && (
            <p className="text-xs text-blue-600 flex items-center gap-1">
              <Info className="w-3 h-3" />
              Este tipo no requiere horario registrado.
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label className="flex items-center gap-2 text-sm font-medium">
            <Calendar className="w-4 h-4 text-[#1a5c3a]" />
            Fecha Fin
            {lockEndDate && (
              <span className="text-xs text-gray-400 font-normal">(igual al inicio)</span>
            )}
            {formData.type === "incapacidad" && (
              <span className="text-xs text-yellow-600 font-normal">(puede ser varios días)</span>
            )}          </Label>
          <input
            type="date"
            className={`w-full h-10 px-3 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#1a5c3a] focus:border-transparent ${
              endDateInvalid
                ? "border-red-400 bg-red-50"
                : lockEndDate
                ? "border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed"
                : "border-gray-300"
            }`}
            value={lockEndDate ? (formData.date || "") : (formData.fechaFinal || "")}
            min={formData.date || undefined}
            readOnly={lockEndDate}
            onChange={e => {
              if (!lockEndDate) setFormData(prev => ({ ...prev, fechaFinal: e.target.value }));
            }}
          />
          {endDateInvalid && (
            <p className="text-xs text-red-600 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              La fecha fin no puede ser anterior a la fecha inicio.
            </p>
          )}
          {requiresSchedule && formData.fechaFinal && !loadingSchedule && !endDateHasSchedule && (
            <p className="text-xs text-yellow-700 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              El empleado no tiene horario en la fecha fin.
            </p>
          )}
        </div>
      </div>

      {/* ── Horas (solo retraso / percance) ── */}
      {requiresHours && (
        <div className="rounded-xl border border-[#78D1BD]/40 bg-[#f0faf6] p-4 space-y-3">
          <Label className="flex items-center gap-2 text-sm font-semibold text-[#1a5c3a]">
            <Clock className="w-4 h-4" />
            Franja horaria afectada
            {formData.type === "retraso" && <span className="text-red-500">*</span>}
            {formData.type === "ausencia" && <span className="text-xs font-normal text-gray-400">(opcional)</span>}
          </Label>

          {/* Aviso si no hay horario en la fecha */}
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
                  {TIME_SLOTS.map(t => (
                    <SelectItem key={t} value={t}>{t}</SelectItem>
                  ))}
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
                  {TIME_SLOTS.map(t => (
                    <SelectItem key={t} value={t}>{t}</SelectItem>
                  ))}
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

          {/* Resumen de franja */}
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

      {/* ── Referencia visual del horario del empleado ── */}
      {formData.employeeId && employeeSchedules.length > 0 && (
        <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
              Horario del empleado
            </Label>
            <div className="flex items-center gap-1">
              <button type="button" onClick={prevViewWeek}
                className="p-1 rounded hover:bg-gray-200 transition-colors">
                <span className="text-gray-500 text-xs">‹</span>
              </button>
              <span className="text-xs text-gray-600 font-medium px-2">{viewWeekLabel}</span>
              <button type="button" onClick={nextViewWeek}
                className="p-1 rounded hover:bg-gray-200 transition-colors">
                <span className="text-gray-500 text-xs">›</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-1">
            {viewWeekDays.map(day => (
              <div key={day.dayIndex}
                className={`rounded-lg p-2 text-center border ${
                  day.available
                    ? "bg-white border-[#78D1BD]/40"
                    : "bg-gray-100 border-gray-200 opacity-50"
                }`}>
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

          {/* Si la semana visible no tiene horario registrado */}
          {viewWeekDays.every(d => !d.available) && (
            <p className="text-xs text-gray-400 text-center">
              Sin horario registrado para esta semana.
            </p>
          )}
        </div>
      )}

      {/* Sin horario en absoluto y tipo que lo requiere */}
      {formData.employeeId && !loadingSchedule && employeeSchedules.length === 0 && requiresSchedule && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Este empleado no tiene ningún horario registrado. Para registrar un <strong>{NEWS_TYPES.find(t => t.value === formData.type)?.label}</strong> es necesario que tenga horario.
          </AlertDescription>
        </Alert>
      )}

      {/* Sin horario pero tipo que NO lo requiere */}
      {formData.employeeId && !loadingSchedule && employeeSchedules.length === 0 && !requiresSchedule && (
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            El empleado no tiene horario registrado, pero el tipo <strong>{NEWS_TYPES.find(t => t.value === formData.type)?.label}</strong> no lo requiere.
          </AlertDescription>
        </Alert>
      )}

      {/* ── Resumen ── */}
      {formData.date && (
        <div className="rounded-lg border border-gray-200 bg-white p-3 space-y-1 text-xs text-gray-600">
          <p className="font-semibold text-gray-800 flex items-center gap-1.5">
            <Info className="w-3.5 h-3.5 text-[#1a5c3a]" />
            Resumen de la novedad
          </p>
          <p><span className="font-medium">Tipo:</span> {NEWS_TYPES.find(t => t.value === formData.type)?.label}</p>
          <p><span className="font-medium">Fecha:</span> {formData.date}{formData.fechaFinal ? ` al ${formData.fechaFinal}` : ""}</p>
          {requiresHours && formData.startTime && formData.endTime && (
            <p><span className="font-medium">Franja:</span> {formData.startTime} – {formData.endTime}</p>
          )}
        </div>
      )}

      {/* ── Descripción ── */}
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

      {/* ── Botones ── */}
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
