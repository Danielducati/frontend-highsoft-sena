export interface Employee {
id: string;
name: string;
specialty: string;
}

export interface EmployeeNews {
id: number;
employeeName: string;
employeeId: string;
type: "incapacidad" | "retraso" | "permiso" | "percance" | "ausencia" | "otro";
date: string;
fechaFinal?: string;
startTime?: string;
endTime?: string;
description: string;
status: "pendiente" | "aprobada" | "rechazada" | "resuelta";
createdAt: string;
}

export interface NewsFormData {
employeeId:   string;
employeeName: string;
type:         EmployeeNews["type"];
date:         string;
fechaFinal:   string;
startTime:    string;
endTime:      string;
description:  string;
status:       EmployeeNews["status"];
}

export interface NewsModuleProps {
userRole: "admin" | "employee" | "client";
}

// Re-export tipos del nuevo sistema
export type { NewsFormDataV2, EmployeeSchedule, DaySchedule, WeekDay } from "./schedule";