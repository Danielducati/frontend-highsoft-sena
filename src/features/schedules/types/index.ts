export interface Employee {
  id: string;
  name: string;
  specialty: string;
}

export interface DaySchedule {
  dayIndex: number;
  startTime: string;
  endTime: string;
}

export interface WeeklySchedule {
  id: string;
  employeeId: string;
  employeeName: string;
  employeeSpecialty: string;
  weekStartDate: string;       // "YYYY-MM-DD" — el backend siempre devuelve string
  daySchedules: DaySchedule[];
  isActive: boolean;
}

export interface ScheduleFormData {
  employeeId: string;
  daySchedules: DaySchedule[];
}

export interface SchedulesModuleProps {
  userRole: "admin" | "employee" | "client";
}