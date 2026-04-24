import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "../../../shared/ui/dialog";
import { Calendar, Clock, User } from "lucide-react";
import { WeeklySchedule, Employee } from "../types";
import { formatWeekRange, getWeekDays, getDayBadgeColor, getDayLabel, calculateDuration } from "../utils";

interface ScheduleDetailDialogProps {
  isOpen: boolean;
  onOpenChange: (v: boolean) => void;
  schedule: WeeklySchedule | null;
  employees: Employee[];
}

const labelStyle: React.CSSProperties = {
  fontSize: 11, fontWeight: 600, letterSpacing: "0.08em",
  textTransform: "uppercase", color: "#6b7c6b",
  fontFamily: "var(--font-body)",
};

export function ScheduleDetailDialog({ isOpen, onOpenChange, schedule, employees }: ScheduleDetailDialogProps) {
  if (!schedule) return null;

  const weekDays = getWeekDays(new Date(schedule.weekStartDate + "T12:00:00"));
  const specialty = employees.find(e => e.id === schedule.employeeId)?.specialty;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent style={{
        backgroundColor: "#faf7f2", borderRadius: 16, border: "1px solid #ede8e0",
        padding: 32, maxWidth: 560, fontFamily: "var(--font-body)",
      }}>
        <DialogHeader>
          <DialogTitle style={{ fontFamily: "var(--font-body)", fontSize: 22, color: "#1a3a2a", fontWeight: 700 }}>
            Detalle del Horario
          </DialogTitle>
          <DialogDescription style={{ color: "#6b7c6b", fontSize: 13 }}>
            Información completa del horario semanal
          </DialogDescription>
        </DialogHeader>

        <div style={{ display: "flex", flexDirection: "column", gap: 20, marginTop: 12 }}>

          {/* Empleado */}
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
            <div>
              <p style={{ fontSize: 15, fontWeight: 600, color: "#1a3a2a", margin: 0 }}>
                {schedule.employeeName}
              </p>
              {specialty && (
                <p style={{ fontSize: 12, color: "#1a5c3a", margin: "2px 0 0" }}>{specialty}</p>
              )}
            </div>
          </div>

          {/* Semana y días */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div style={{ padding: "12px 16px", borderRadius: 10, backgroundColor: "#ffffff", border: "1px solid #ede8e0" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
                <Calendar style={{ width: 14, height: 14, color: "#6b7c6b" }} />
                <span style={labelStyle}>Semana</span>
              </div>
              <p style={{ fontSize: 13, color: "#1a3a2a", margin: 0 }}>{formatWeekRange(schedule.weekStartDate)}</p>
            </div>
            <div style={{ padding: "12px 16px", borderRadius: 10, backgroundColor: "#ffffff", border: "1px solid #ede8e0" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
                <Clock style={{ width: 14, height: 14, color: "#6b7c6b" }} />
                <span style={labelStyle}>Días trabajados</span>
              </div>
              <p style={{ fontSize: 13, color: "#1a3a2a", margin: 0 }}>
                {schedule.daySchedules.length} {schedule.daySchedules.length === 1 ? "día" : "días"}
              </p>
            </div>
          </div>

          {/* Horarios por día */}
          <div>
            <p style={{ ...labelStyle, marginBottom: 10 }}>Horarios por Día</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {schedule.daySchedules
                .sort((a, b) => a.dayIndex - b.dayIndex)
                .map(ds => {
                  const day  = getDayLabel(ds.dayIndex);
                  const date = weekDays[ds.dayIndex];
                  return (
                    <div key={ds.dayIndex} style={{
                      display: "flex", alignItems: "center", justifyContent: "space-between",
                      padding: "10px 14px", borderRadius: 10,
                      backgroundColor: "#ffffff", border: "1px solid #ede8e0",
                    }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <span style={{
                          fontSize: 11, fontWeight: 600, padding: "3px 10px",
                          borderRadius: 999, fontFamily: "var(--font-body)",
                          backgroundColor: "#f0ebe3", color: "#1a3a2a",
                        }}>
                          {day.label}
                        </span>
                        <div>
                          <p style={{ fontSize: 13, color: "#1a3a2a", margin: 0 }}>
                            {date.toLocaleDateString("es-ES", { day: "numeric", month: "long", timeZone: "UTC" })}
                          </p>
                          <p style={{ fontSize: 11, color: "#6b7c6b", margin: "1px 0 0" }}>
                            {calculateDuration(ds.startTime, ds.endTime)}
                          </p>
                        </div>
                      </div>
                      <div style={{
                        display: "flex", alignItems: "center", gap: 6,
                        padding: "5px 12px", borderRadius: 8,
                        backgroundColor: "#f5f0e8", border: "1px solid #d6cfc4",
                      }}>
                        <Clock style={{ width: 13, height: 13, color: "#6b7c6b" }} />
                        <span style={{ fontSize: 13, color: "#1a3a2a", fontWeight: 500 }}>{ds.startTime}</span>
                        <span style={{ color: "#9ca3af", fontSize: 12 }}>→</span>
                        <span style={{ fontSize: 13, color: "#1a3a2a", fontWeight: 500 }}>{ds.endTime}</span>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>

          {/* Botón cerrar */}
          <div style={{ display: "flex", justifyContent: "flex-end", paddingTop: 8, borderTop: "1px solid #ede8e0" }}>
            <button
              onClick={() => onOpenChange(false)}
              style={{
                padding: "9px 20px", borderRadius: 10, border: "1px solid #d6cfc4",
                backgroundColor: "transparent", color: "#1a3a2a", fontSize: 14,
                fontFamily: "var(--font-body)", cursor: "pointer",
              }}
              onMouseEnter={e => (e.currentTarget.style.backgroundColor = "#f0ebe3")}
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
