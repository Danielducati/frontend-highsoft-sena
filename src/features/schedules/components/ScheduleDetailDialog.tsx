import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "../../../shared/ui/dialog";
import { Button } from "../../../shared/ui/button";
import { Label } from "../../../shared/ui/label";
import { Card, CardContent } from "../../../shared/ui/card";
import { Badge } from "../../../shared/ui/badge";
import { Calendar, Clock, User } from "lucide-react";
import { WeeklySchedule, Employee } from "../types";
import { formatWeekRange, getWeekDays, getDayBadgeColor, getDayLabel, calculateDuration } from "../utils";

interface ScheduleDetailDialogProps {
  isOpen: boolean;
  onOpenChange: (v: boolean) => void;
  schedule: WeeklySchedule | null;
  employees: Employee[];
}

export function ScheduleDetailDialog({ isOpen, onOpenChange, schedule, employees }: ScheduleDetailDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-[#78D1BD]" />
            Detalle del Horario
          </DialogTitle>
          <DialogDescription>Información completa del horario semanal</DialogDescription>
        </DialogHeader>
        {schedule && (
          <div className="space-y-4">
            {/* Empleado */}
            <Card className="border-gray-200 bg-gradient-to-br from-[#78D1BD]/5 via-white to-[#60A5FA]/5">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#78D1BD] to-[#60A5FA] flex items-center justify-center">
                    <User className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-gray-900">{schedule.employeeName}</p>
                    <p className="text-sm text-gray-500">
                      {employees.find(e => e.id === schedule.employeeId)?.specialty}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Info semana */}
            <div className="grid grid-cols-2 gap-4">
              <Card className="border-gray-200">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar className="w-4 h-4 text-[#60A5FA]" />
                    <p className="text-xs text-gray-600">Semana</p>
                  </div>
                  <p className="text-sm text-gray-900">{formatWeekRange(schedule.weekStartDate)}</p>
                </CardContent>
              </Card>
              <Card className="border-gray-200">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="w-4 h-4 text-[#FBBF24]" />
                    <p className="text-xs text-gray-600">Total de días</p>
                  </div>
                  <p className="text-sm text-gray-900">
                    {schedule.daySchedules.length} {schedule.daySchedules.length === 1 ? "día" : "días"}
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Horarios por día */}
            <div className="space-y-2">
              <Label>Horarios por Día</Label>
              <Card className="border-gray-200">
                <CardContent className="p-4">
                  <div className="space-y-3">
                    {schedule.daySchedules
                      .sort((a, b) => a.dayIndex - b.dayIndex)
                      .map(ds => {
                        const day  = getDayLabel(ds.dayIndex);
                        const date = getWeekDays(schedule.weekStartDate)[ds.dayIndex];
                        return (
                          <div key={ds.dayIndex} className="flex items-center justify-between p-3 rounded-lg bg-gray-50 border border-gray-200">
                            <div className="flex items-center gap-3">
                              <Badge variant="secondary" className={getDayBadgeColor(ds.dayIndex)}>{day.label}</Badge>
                              <div>
                                <p className="text-sm text-gray-900">
                                  {date.toLocaleDateString("es-ES", { weekday: "long", day: "numeric", month: "long" })}
                                </p>
                                <p className="text-xs text-gray-500">{calculateDuration(ds.startTime, ds.endTime)}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white rounded-md border border-gray-200">
                              <Clock className="w-3.5 h-3.5 text-[#60A5FA]" />
                              <span className="text-sm text-gray-900">{ds.startTime}</span>
                              <span className="text-gray-400">→</span>
                              <span className="text-sm text-gray-900">{ds.endTime}</span>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="flex justify-end pt-4 border-t border-gray-200">
              <Button variant="outline" onClick={() => onOpenChange(false)}>Cerrar</Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}