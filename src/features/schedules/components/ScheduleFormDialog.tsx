import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "../../../shared/ui/dialog";
import { Button } from "../../../shared/ui/button";
import { Label } from "../../../shared/ui/label";
import { Card, CardContent } from "../../../shared/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../shared/ui/select";
import { Badge } from "../../../shared/ui/badge";
import { Checkbox } from "../../../shared/ui/checkbox";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Employee, WeeklySchedule, ScheduleFormData } from "../types";
import { TIME_SLOTS, WEEK_DAYS_LABELS } from "../constants";
import { formatWeekRange, getDayBadgeColor } from "../utils";

interface ScheduleFormDialogProps {
  isOpen: boolean;
  onOpenChange: (v: boolean) => void;
  editingSchedule: WeeklySchedule | null;
  formData: ScheduleFormData;
  setFormData: (d: ScheduleFormData) => void;
  formWeekStart: Date;
  formWeekDays: Date[];
  employees: Employee[];
  onSubmit: () => void;
  onCancel: () => void;
  onPreviousWeek: () => void;
  onNextWeek: () => void;
  onToggleDay: (dayIndex: number) => void;
  onUpdateDaySchedule: (dayIndex: number, field: "startTime" | "endTime", value: string) => void;
}

export function ScheduleFormDialog({
  isOpen, onOpenChange, editingSchedule, formData, setFormData,
  formWeekStart, formWeekDays, employees,
  onSubmit, onCancel, onPreviousWeek, onNextWeek,
  onToggleDay, onUpdateDaySchedule,
}: ScheduleFormDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onCancel(); onOpenChange(open); }}>
      <DialogContent className="hl-form-dialog max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{editingSchedule ? "Editar Horario" : "Nuevo Horario"}</DialogTitle>
          <DialogDescription>
            {editingSchedule ? "Actualiza la información del horario semanal" : "Define horarios personalizados para cada día de la semana"}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Empleado */}
          <div className="space-y-2">
            <Label>Empleado *</Label>
            <Select value={formData.employeeId} onValueChange={(v) => setFormData({ ...formData, employeeId: v })}>
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

          {/* Selector de semana */}
          <div className="space-y-2">
            <Label>Semana *</Label>
            <Card className="border-gray-200">
              <CardContent className="p-3">
                <div className="flex items-center justify-between">
                  <button type="button" onClick={onPreviousWeek} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                    <ChevronLeft className="w-5 h-5 text-gray-600" />
                  </button>
                  <p className="text-sm text-gray-900">{formatWeekRange(formWeekStart)}</p>
                  <button type="button" onClick={onNextWeek} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                    <ChevronRight className="w-5 h-5 text-gray-600" />
                  </button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Días y horarios */}
          <div className="space-y-2">
            <Label>Días y Horarios *</Label>
            <Card className="border-gray-200">
              <CardContent className="p-4">
                <div className="space-y-3">
                  {WEEK_DAYS_LABELS.map((day, index) => {
                    const dateOfDay  = formWeekDays[index];
                    const isSelected = formData.daySchedules.some(ds => ds.dayIndex === index);
                    const daySchedule = formData.daySchedules.find(ds => ds.dayIndex === index);

                    return (
                      <div key={day.id} className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Checkbox id={`day-${day.id}`} checked={isSelected} onCheckedChange={() => onToggleDay(index)} />
                          <label htmlFor={`day-${day.id}`} className="text-sm text-gray-900 cursor-pointer select-none flex items-center gap-2">
                            <Badge variant="secondary" className={`text-xs ${getDayBadgeColor(index)}`}>{day.label}</Badge>
                            <span className="text-xs text-gray-500">
                              {dateOfDay.getDate()}/{dateOfDay.getMonth() + 1}/{dateOfDay.getFullYear()}
                            </span>
                          </label>
                        </div>

                        {isSelected && daySchedule && (
                          <div className="ml-6 grid grid-cols-2 gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                            <div className="space-y-1.5">
                              <Label className="text-xs text-gray-600">Hora Inicio</Label>
                              <Select value={daySchedule.startTime} onValueChange={(v) => onUpdateDaySchedule(index, "startTime", v)}>
                                <SelectTrigger className="h-8"><SelectValue placeholder="--:--" /></SelectTrigger>
                                <SelectContent>
                                  {TIME_SLOTS.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="space-y-1.5">
                              <Label className="text-xs text-gray-600">Hora Fin</Label>
                              <Select value={daySchedule.endTime} onValueChange={(v) => onUpdateDaySchedule(index, "endTime", v)}>
                                <SelectTrigger className="h-8"><SelectValue placeholder="--:--" /></SelectTrigger>
                                <SelectContent>
                                  {TIME_SLOTS.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
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
            <div className="p-3 bg-[#78D1BD]/5 border border-[#78D1BD]/20 rounded-lg">
              <p className="text-xs text-gray-600 mb-2">Resumen:</p>
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
            <Button variant="default" onClick={onSubmit} 
            // className="bg-gradient-to-r from-[#78D1BD] to-[#5FBFAA] hover:from-[#6BCAB7] hover:to-[#4FB5A1] text-white"
            >
              {editingSchedule ? "Actualizar" : "Crear"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}