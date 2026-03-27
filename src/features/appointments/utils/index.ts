import { Appointment, AppointmentService } from "../types";
import { STATUS_COLORS, STATUS_LABELS } from "../constants";

export function getMonday(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function calculateEndTime(startTime: string, durationMinutes: number): string {
  const [h, m] = startTime.split(":").map(Number);
  const total = h * 60 + m + durationMinutes;
  return `${String(Math.floor(total / 60)).padStart(2, "0")}:${String(total % 60).padStart(2, "0")}`;
}

export function getStatusColor(status: string): string {
  return STATUS_COLORS[status] ?? "bg-amber-100 text-amber-700";
}

export function getStatusLabel(status: string): string {
  return STATUS_LABELS[status] ?? status;
}

export function mapApiToAppointment(item: any): Appointment {
  const startTime: string = (item.Horario ?? "00:00").slice(0, 5);

  const totalDuration: number =
    Array.isArray(item.servicios) && item.servicios.length > 0
      ? item.servicios.reduce((sum: number, s: any) => sum + (s.duration ?? 60), 0)
      : 60;

  const endTime = calculateEndTime(startTime, totalDuration);

  let cursor = startTime;
  const services: AppointmentService[] =
    Array.isArray(item.servicios) && item.servicios.length > 0
      ? item.servicios.map((s: any) => {
          const svc: AppointmentService = {
            serviceId:    String(s.serviceId   ?? ""),
            serviceName:  s.serviceName  ?? "Servicio",
            employeeId:   String(s.employeeId  ?? ""),
            employeeName: s.employeeName ?? "Empleado",
            duration:     s.duration     ?? 60,
            startTime:    cursor,
          };
          cursor = calculateEndTime(cursor, svc.duration);
          return svc;
        })
      : [{
          serviceId:    "",
          serviceName:  "Sin servicio",
          employeeId:   String(item.empleado_id ?? ""),
          employeeName: item.empleado_nombre ?? "Empleado",
          duration:     60,
          startTime,
        }];

  const estadoRaw = (item.Estado ?? "Pendiente").toLowerCase();
  const status: Appointment["status"] =
    estadoRaw === "cancelada"  || estadoRaw === "cancelled"  ? "cancelled"  :
    estadoRaw === "completada" || estadoRaw === "completed"  ? "completed"  :
    "pending";

  const [y, mo, d] = (item.Fecha ?? "2000-01-01").split("-").map(Number);
  const date = new Date(y, mo - 1, d);

  return {
    id:           item.PK_id_cita,
    clientName:   item.cliente_nombre   ?? "Sin cliente",
    clientPhone:  item.cliente_telefono ?? "",
    date,
    startTime,
    endTime,
    status,
    services,
    totalDuration,
    notes: item.Notas ?? "",
  };
}