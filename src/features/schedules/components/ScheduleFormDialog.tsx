import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "../../../shared/ui/dialog";
import { Button } from "../../../shared/ui/button";
import { Label } from "../../../shared/ui/label";
import { Card, CardContent } from "../../../shared/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../shared/ui/select";
import { Badge } from "../../../shared/ui/badge";
import { Checkbox } from "../../../shared/ui/checkbox";
import { ChevronLeft, ChevronRight, CalendarDays } from "lucide-react";
import { Employee, WeeklySchedule, ScheduleFormData } from "../types";
import { TIME_SLOTS, WEEK_DAYS_LABELS } from "../constants";
import { getDayBadgeColor, formatWeekRange } from "../utils";
import { formatMonthLabel } from "../hooks/useSchedules";

interface ScheduleFormDialogProps {
  isOpen: boolean;
  onOpenChange: (v: boolean) => void;
  editingSchedule: WeeklySchedule | null;
  formData: ScheduleFormData;
  setFormData: (d: ScheduleFormData) => void;
  // Mes (solo para creación)
  selectedMonth: { year: number; month: number };
  weeksOfMonth: string[];
  onPreviousMonth: () => void;
  onNextMonth: () => void;
  // Semana (solo para edición)
  formWeekStart: Date;
  formWeekDays: Date[];
  employees: Employee[];
  onSubmit: () => void;
  onCancel: () => void;
  // Compatibilidad
  onPreviousWeek: () => void;
  onNextWeek: () => void;
  onToggleDay: (dayIndex: number) => void;
  onUpdateDaySchedule: (dayIndex: number, field: "startTime" | "endTime", value: string) => void;
}

export function ScheduleFormDialog({
  isOpen, onOpenChange, editingSchedule, formData, setFormData,
  selectedMonth, weeksOfMonth, onPreviousMonth, onNextMonth,
  formWeekStart, formWeekDays, employees,
  onSubmit, onCancel,
  onToggleDay, onUpdateDaySchedule,
}: ScheduleFormDialogProps) {

  const isEditing = !!editingSchedule;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onCancel(); onOpenChange(open); }}>
      <DialogContent className="hl-form-dialog max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Editar Horario Semanal" : "Nuevo Horario Mensual"}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? `Editando semana: ${formatWeekRange(editingSchedule.weekStartDate)}`
              : "Define los días y horarios — se aplicarán a todas las semanas del mes seleccionado"}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5">

          {/* Empleado */}
          <div className="space-y-2">
            <Label>Empleado *</Label>
            <Select
              value={formData.employeeId}
              onValueChange={(v) => setFormData({ ...formData, employeeId: v })}
              disabled={isEditing}
            >
              <SelectTrigger><SelectValue placeholder="Seleccionar empleado" /></SelectTrigger>
              <SelectContent>
                {employees.map(emp => (
                  <SelectItem key={emp.id} value={emp.id}>
                    <div className="flex flex-col">
                      <span>{emp.name}</span>
                      <span className="text-xs text-gray-500">{emp.specialty}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Selector de mes (solo creación) o semana (edición) */}
          {isEditing ? (
            <div className="p-3 rounded-lg border border-[#78D1BD]/40 bg-[#edf7f4]">
              <div className="flex items-center gap-2 text-sm text-[#1a5c3a]">
                <CalendarDays className="w-4 h-4" />
                <span className="font-medium">Semana: {formatWeekRange(editingSchedule.weekStartDate)}</span>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <Label>Mes *</Label>
              <Card className="border-gray-200">
                <CardContent className="p-3">
                  <div className="flex items-center justify-between">
                    <button
                      type="button"
                      onClick={onPreviousMonth}
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <ChevronLeft className="w-5 h-5 text-gray-600" />
                    </button>
                    <div className="text-center">
                      <p className="text-sm font-semibold text-gray-900 capitalize">
                        {formatMonthLabel(selectedMonth.year, selectedMonth.month)}
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {weeksOfMonth.length} semana{weeksOfMonth.length !== 1 ? "s" : ""}
                        {" "}({weeksOfMonth[0]?.slice(5)} → {weeksOfMonth[weeksOfMonth.length - 1]?.slice(5)})
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={onNextMonth}
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <ChevronRight className="w-5 h-5 text-gray-600" />
                    </button>
                  </div>
                </CardContent>
              </Card>
              <p className="text-xs text-gray-500">
                El patrón de días se repetirá en cada semana del mes automáticamente.
              </p>
            </div>
          )}

          {/* Días y horarios */}
          <div className="space-y-2">
            <Label>Días y Horarios *</Label>
            <Card className="border-gray-200">
              <CardContent className="p-4">
                <div className="space-y-3">
                  {WEEK_DAYS_LABELS.map((day, index) => {
                    const isSelected  = formData.daySchedules.some(ds => ds.dayIndex === index);
                    const daySchedule = formData.daySchedules.find(ds => ds.dayIndex === index);
                    // Para edición mostramos la fecha real; para creación solo el nombre del día
                    const dateLabel = isEditing
                      ? (() => {
                          const d = formWeekDays[index];
                          return `${d.getDate()}/${d.getMonth() + 1}`;
                        })()
                      : null;

                    return (
                      <div key={day.id} className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Checkbox
                            id={`day-${day.id}`}
                            checked={isSelected}
                            onCheckedChange={() => onToggleDay(index)}
                          />
                          <label
                            htmlFor={`day-${day.id}`}
                            className="text-sm text-gray-900 cursor-pointer select-none flex items-center gap-2"
                          >
                            <Badge
                              variant="secondary"
                              className={`text-xs ${getDayBadgeColor(index)}`}
                            >
                              {day.label}
                            </Badge>
                            {dateLabel && (
                              <span className="text-xs text-gray-500">{dateLabel}</span>
                            )}
                          </label>
                        </div>

                        {isSelected && daySchedule && (
                          <div className="ml-6 grid grid-cols-2 gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                            <div className="space-y-1.5">
                              <Label className="text-xs text-gray-600">Hora inicio</Label>
                              <Select
                                value={daySchedule.startTime}
                                onValueChange={(v) => onUpdateDaySchedule(index, "startTime", v)}
                              >
                                <SelectTrigger className="h-8">
                                  <SelectValue placeholder="--:--" />
                                </SelectTrigger>
                                <SelectContent>
                                  {TIME_SLOTS.map(t => (
                                    <SelectItem key={t} value={t}>{t}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="space-y-1.5">
                              <Label className="text-xs text-gray-600">Hora fin</Label>
                              <Select
                                value={daySchedule.endTime}
                                onValueChange={(v) => onUpdateDaySchedule(index, "endTime", v)}
                              >
                                <SelectTrigger className="h-8">
                                  <SelectValue placeholder="--:--" />
                                </SelectTrigger>
                                <SelectContent>
                                  {TIME_SLOTS.map(t => (
                                    <SelectItem key={t} value={t}>{t}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Resumen */}
          {formData.daySchedules.length > 0 && (
            <div className="p-3 bg-[#1a5c3a]/5 border border-[#1a5c3a]/20 rounded-lg">
              <p className="text-xs text-gray-600 mb-2">
                {isEditing ? "Resumen de la semana:" : `Patrón para ${weeksOfMonth.length} semana${weeksOfMonth.length !== 1 ? "s" : ""}:`}
              </p>
              <div className="flex flex-wrap gap-1.5">
                {formData.daySchedules
                  .sort((a, b) => a.dayIndex - b.dayIndex)
                  .map(ds => {
                    const day = WEEK_DAYS_LABELS[ds.dayIndex];
                    return (
                      <Badge key={ds.dayIndex} variant="secondary" className="text-xs bg-white">
                        {day.short}: {ds.startTime || "--:--"} - {ds.endTime || "--:--"}
                      </Badge>
                    );
                  })}
              </div>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <Button variant="outline" onClick={onCancel}>Cancelar</Button>
            <Button
              onClick={onSubmit}
              style={{ backgroundColor: "#1a3a2a", color: "#fff" }}
              onMouseEnter={e => (e.currentTarget.style.backgroundColor = "#2a5a40")}
              onMouseLeave={e => (e.currentTarget.style.backgroundColor = "#1a3a2a")}
            >
              {isEditing ? "Actualizar semana" : `Crear horario del mes`}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
