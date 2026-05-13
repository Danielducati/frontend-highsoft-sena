import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "../../../shared/ui/dialog";
import { Calendar, Clock, User, ChevronDown, ChevronUp } from "lucide-react";
import { WeeklySchedule, Employee } from "../types";
import { formatWeekRange, getWeekDays, getDayLabel, calculateDuration } from "../utils";

interface ScheduleDetailDialogProps {
  isOpen: boolean;
  onOpenChange: (v: boolean) => void;
  schedule: WeeklySchedule | null;
  employees: Employee[];
  allWeeks?: WeeklySchedule[];
}

const labelStyle: React.CSSProperties = {
  fontSize: 11, fontWeight: 600, letterSpacing: "0.04em",
  color: "#6b7c6b", fontFamily: "var(--font-body)",
  textTransform: "uppercase",
};

export function ScheduleDetailDialog({ isOpen, onOpenChange, schedule, employees, allWeeks }: ScheduleDetailDialogProps) {
  const [expandedWeek, setExpandedWeek] = useState<string | null>(null);

  if (!schedule) return null;

  const specialty = employees.find(e => e.id === schedule.employeeId)?.specialty;
  const weeks     = allWeeks?.length
    ? allWeeks.sort((a, b) => a.weekStartDate.localeCompare(b.weekStartDate))
    : [schedule];

  const [y, m] = schedule.weekStartDate.slice(0, 7).split("-").map(Number);
  const monthLabel = new Date(y, m - 1, 1).toLocaleDateString("es-ES", { month: "long", year: "numeric" });

  const totalDias = weeks[0]?.daySchedules.length ?? 0;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent style={{
        backgroundColor: "#ffffff", borderRadius: 16, border: "1px solid #E5E7EB",
        padding: 32, maxWidth: 580, maxHeight: "90vh", overflowY: "auto",
        fontFamily: "var(--font-body)",
      }}>
        <DialogHeader>
          <DialogTitle style={{ fontFamily: "var(--font-body)", fontSize: 20, color: "#1a3a2a", fontWeight: 700 }}>
            Detalle del Horario
          </DialogTitle>
          <DialogDescription style={{ color: "#6b7c6b", fontSize: 13 }}>
            Haz click en una semana para ver sus días y horarios exactos
          </DialogDescription>
        </DialogHeader>

        <div style={{ display: "flex", flexDirection: "column", gap: 20, marginTop: 12 }}>

          {/* Empleado + mes */}
          <div style={{
            display: "flex", alignItems: "center", gap: 14,
            padding: "14px 18px", borderRadius: 12,
            backgroundColor: "#edf7f4", border: "1px solid #c8ead9",
          }}>
            <div style={{
              width: 44, height: 44, borderRadius: "50%",
              backgroundColor: "#1a3a2a", display: "flex",
              alignItems: "center", justifyContent: "center", flexShrink: 0,
            }}>
              <User style={{ width: 20, height: 20, color: "#ffffff" }} />
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: 15, fontWeight: 600, color: "#1a3a2a", margin: 0 }}>
                {schedule.employeeName}
              </p>
              {specialty && (
                <p style={{ fontSize: 12, color: "#1a5c3a", margin: "2px 0 0" }}>{specialty}</p>
              )}
            </div>
            <div style={{ textAlign: "right" }}>
              <p style={{ fontSize: 13, fontWeight: 600, color: "#1a3a2a", margin: 0, textTransform: "capitalize" }}>
                {monthLabel}
              </p>
              <p style={{ fontSize: 11, color: "#6b7c6b", margin: "2px 0 0" }}>
                {weeks.length} semana{weeks.length !== 1 ? "s" : ""} · {totalDias} días activos
              </p>
            </div>
          </div>

          {/* Semanas clickeables */}
          <div>
            <p style={{ ...labelStyle, marginBottom: 8 }}>Semanas del mes</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {weeks.map((w, i) => {
                const isOpen   = expandedWeek === w.weekStartDate;
                const weekDays = getWeekDays(new Date(w.weekStartDate + "T12:00:00"));

                return (
                  <div key={w.id} style={{
                    borderRadius: 10, border: `1px solid ${isOpen ? "#78D1BD" : "#E5E7EB"}`,
                    overflow: "hidden",
                    backgroundColor: isOpen ? "#f8fffe" : "#ffffff",
                    transition: "border-color 0.15s",
                  }}>
                    {/* Cabecera de semana — clickeable */}
                    <button
                      onClick={() => setExpandedWeek(isOpen ? null : w.weekStartDate)}
                      style={{
                        width: "100%", padding: "10px 14px", border: "none",
                        backgroundColor: "transparent", cursor: "pointer",
                        display: "flex", alignItems: "center", gap: 10,
                        textAlign: "left",
                      }}
                    >
                      <span style={{
                        fontSize: 11, fontWeight: 700, color: "#1a5c3a",
                        backgroundColor: "#edf7f4", padding: "2px 8px", borderRadius: 999,
                        flexShrink: 0,
                      }}>
                        Sem. {i + 1}
                      </span>
                      <div style={{ display: "flex", alignItems: "center", gap: 6, flex: 1 }}>
                        <Calendar style={{ width: 13, height: 13, color: "#9ca3af" }} />
                        <span style={{ fontSize: 12, color: "#6b7c6b" }}>{formatWeekRange(w.weekStartDate)}</span>
                      </div>
                      <span style={{ fontSize: 11, color: "#9ca3af" }}>
                        {w.daySchedules.length} días
                      </span>
                      {isOpen
                        ? <ChevronUp style={{ width: 14, height: 14, color: "#1a5c3a", flexShrink: 0 }} />
                        : <ChevronDown style={{ width: 14, height: 14, color: "#9ca3af", flexShrink: 0 }} />}
                    </button>

                    {/* Días de la semana expandidos */}
                    {isOpen && (
                      <div style={{ padding: "0 14px 12px", display: "flex", flexDirection: "column", gap: 6 }}>
                        {w.daySchedules
                          .sort((a, b) => a.dayIndex - b.dayIndex)
                          .map(ds => {
                            const day  = getDayLabel(ds.dayIndex);
                            const date = weekDays[ds.dayIndex];
                            return (
                              <div key={ds.dayIndex} style={{
                                display: "flex", alignItems: "center", justifyContent: "space-between",
                                padding: "8px 12px", borderRadius: 8,
                                backgroundColor: "#ffffff", border: "1px solid #E5E7EB",
                              }}>
                                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                  <span style={{
                                    fontSize: 11, fontWeight: 600, padding: "2px 8px",
                                    borderRadius: 999, backgroundColor: "#F3F4F6", color: "#1a3a2a",
                                  }}>
                                    {day.label}
                                  </span>
                                  <span style={{ fontSize: 12, color: "#9ca3af" }}>
                                    {date.toLocaleDateString("es-ES", { day: "numeric", month: "short", timeZone: "UTC" })}
                                  </span>
                                  <span style={{ fontSize: 11, color: "#6b7c6b" }}>
                                    {calculateDuration(ds.startTime, ds.endTime)}
                                  </span>
                                </div>
                                <div style={{
                                  display: "flex", alignItems: "center", gap: 5,
                                  padding: "4px 10px", borderRadius: 7,
                                  backgroundColor: "#F7F9FC", border: "1px solid #E5E7EB",
                                }}>
                                  <Clock style={{ width: 12, height: 12, color: "#6b7c6b" }} />
                                  <span style={{ fontSize: 12, color: "#1a3a2a", fontWeight: 500 }}>{ds.startTime}</span>
                                  <span style={{ color: "#9ca3af", fontSize: 11 }}>→</span>
                                  <span style={{ fontSize: 12, color: "#1a3a2a", fontWeight: 500 }}>{ds.endTime}</span>
                                </div>
                              </div>
                            );
                          })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Cerrar */}
          <div style={{ display: "flex", justifyContent: "flex-end", paddingTop: 8, borderTop: "1px solid #E5E7EB" }}>
            <button
              onClick={() => onOpenChange(false)}
              style={{
                padding: "9px 20px", borderRadius: 10, border: "1px solid #E5E7EB",
                backgroundColor: "transparent", color: "#1a3a2a", fontSize: 14,
                fontFamily: "var(--font-body)", cursor: "pointer",
              }}
              onMouseEnter={e => (e.currentTarget.style.backgroundColor = "#F3F4F6")}
              onMouseLeave={e => (e.currentTarget.style.backgroundColor = "transparent")}
            >
              Cerrar
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
