// src/features/news/types/schedule.ts

export interface EmployeeSchedule {
  id: string;
  employeeId: string;
  employeeName: string;
  weekStartDate: string;
  daySchedules: DaySchedule[];
}

export interface DaySchedule {
  id: string;
  dayIndex: number; // 0=Lunes, 1=Martes, ..., 6=Domingo
  fecha: string;
  startTime: string;
  endTime: string;
}

export interface WeekDay {
  dayIndex: number;
  dayName: string;
  dayShort: string;
  date: string;
  schedule?: DaySchedule;
  available: boolean;
}

export interface NewsFormDataV2 {
  employeeId: string;
  employeeName: string;
  type: "incapacidad" | "retraso" | "permiso" | "percance" | "ausencia" | "otro";
  selectedWeekStart: string;
  selectedDays: number[]; // Índices de días seleccionados
  affectationType: "full_day" | "partial_hours" | "multiple_days";
  startTime?: string;
  endTime?: string;
  description: string;
  status: "pendiente" | "aprobada" | "rechazada" | "resuelta";
}

export interface ScheduleValidation {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}