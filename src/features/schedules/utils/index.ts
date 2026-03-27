import { WEEK_DAYS_LABELS, DAY_BADGE_COLORS } from "../constants";

/** Retorna el lunes de la semana a la que pertenece `date` */
export function getMondayOfWeek(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  return new Date(d.setDate(diff));
}

/** Retorna los 7 días de la semana empezando en `monday` */
export function getWeekDays(monday: Date): Date[] {
  return Array.from({ length: 7 }, (_, i) => {
    const day = new Date(monday);
    day.setDate(monday.getDate() + i);
    return day;
  });
}

/** Formatea el rango de una semana: "3 nov - 9 nov 2025" */
export function formatWeekRange(weekStart: Date | string): string {
  const date = typeof weekStart === "string" ? new Date(weekStart + "T00:00:00") : weekStart;
  const days  = getWeekDays(date);
  const start = days[0];
  const end   = days[6];
  const fmt   = (d: Date, opts: Intl.DateTimeFormatOptions) =>
    d.toLocaleDateString("es-ES", opts);
  return `${start.getDate()} ${fmt(start, { month: "short" })} - ${end.getDate()} ${fmt(end, { month: "short", year: "numeric" })}`;
}

/** Calcula la duración entre dos horas "HH:MM" */
export function calculateDuration(startTime: string, endTime: string): string {
  const [sh, sm] = startTime.split(":").map(Number);
  const [eh, em] = endTime.split(":").map(Number);
  const start = new Date(0, 0, 0, sh, sm);
  const end   = new Date(0, 0, 0, eh, em);
  const hours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
  return `${hours} hora${hours !== 1 ? "s" : ""}`;
}

export function getDayBadgeColor(dayIndex: number): string {
  return DAY_BADGE_COLORS[dayIndex] ?? "bg-gray-200 text-gray-700";
}

export function getDayLabel(dayIndex: number) {
  return WEEK_DAYS_LABELS[dayIndex] ?? { label: "Día", short: "Día" };
}

/** Convierte un Date a string "YYYY-MM-DD" para enviar al backend */
export function formatDateToISO(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}