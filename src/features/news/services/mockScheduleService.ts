// src/features/news/services/mockScheduleService.ts
// Servicio mock para demostrar la funcionalidad sin backend
import { EmployeeSchedule, WeekDay } from "../types/schedule";

const mockSchedules: EmployeeSchedule[] = [
  {
    id: "1_2024-01-15",
    employeeId: "1",
    employeeName: "Juan Pérez",
    weekStartDate: "2024-01-15",
    daySchedules: [
      { id: "1", dayIndex: 0, fecha: "2024-01-15", startTime: "08:00", endTime: "17:00" }, // Lunes
      { id: "2", dayIndex: 1, fecha: "2024-01-16", startTime: "08:00", endTime: "17:00" }, // Martes
      { id: "3", dayIndex: 2, fecha: "2024-01-17", startTime: "08:00", endTime: "17:00" }, // Miércoles
      { id: "4", dayIndex: 3, fecha: "2024-01-18", startTime: "08:00", endTime: "17:00" }, // Jueves
      { id: "5", dayIndex: 4, fecha: "2024-01-19", startTime: "08:00", endTime: "17:00" }, // Viernes
    ]
  },
  {
    id: "2_2024-01-15",
    employeeId: "2",
    employeeName: "María García",
    weekStartDate: "2024-01-15",
    daySchedules: [
      { id: "6", dayIndex: 0, fecha: "2024-01-15", startTime: "09:00", endTime: "18:00" }, // Lunes
      { id: "7", dayIndex: 1, fecha: "2024-01-16", startTime: "09:00", endTime: "18:00" }, // Martes
      { id: "8", dayIndex: 2, fecha: "2024-01-17", startTime: "09:00", endTime: "18:00" }, // Miércoles
      { id: "9", dayIndex: 3, fecha: "2024-01-18", startTime: "09:00", endTime: "18:00" }, // Jueves
      { id: "10", dayIndex: 4, fecha: "2024-01-19", startTime: "09:00", endTime: "18:00" }, // Viernes
      { id: "11", dayIndex: 5, fecha: "2024-01-20", startTime: "08:00", endTime: "14:00" }, // Sábado
    ]
  },
  {
    id: "3_2024-01-15",
    employeeId: "3",
    employeeName: "Carlos López",
    weekStartDate: "2024-01-15",
    daySchedules: [
      { id: "12", dayIndex: 1, fecha: "2024-01-16", startTime: "14:00", endTime: "22:00" }, // Martes
      { id: "13", dayIndex: 2, fecha: "2024-01-17", startTime: "14:00", endTime: "22:00" }, // Miércoles
      { id: "14", dayIndex: 3, fecha: "2024-01-18", startTime: "14:00", endTime: "22:00" }, // Jueves
      { id: "15", dayIndex: 4, fecha: "2024-01-19", startTime: "14:00", endTime: "22:00" }, // Viernes
      { id: "16", dayIndex: 5, fecha: "2024-01-20", startTime: "14:00", endTime: "22:00" }, // Sábado
      { id: "17", dayIndex: 6, fecha: "2024-01-21", startTime: "14:00", endTime: "22:00" }, // Domingo
    ]
  }
];

export const mockScheduleService = {
  /**
   * Obtiene el horario semanal de un empleado (versión mock)
   */
  async getEmployeeSchedule(employeeId: string): Promise<EmployeeSchedule[]> {
    // Simular delay de red
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return mockSchedules.filter(s => s.employeeId === employeeId);
  },

  /**
   * Obtiene el horario efectivo de un empleado para una semana específica (versión mock)
   */
  async getWeekSchedule(employeeId: string, weekStartDate: string): Promise<EmployeeSchedule | null> {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // Por simplicidad, devolvemos el horario base independientemente de la semana
    const baseSchedule = mockSchedules.find(s => s.employeeId === employeeId);
    
    if (!baseSchedule) return null;
    
    // Ajustar las fechas para la semana solicitada
    const startDate = new Date(weekStartDate);
    const adjustedSchedule: EmployeeSchedule = {
      ...baseSchedule,
      id: `${employeeId}_${weekStartDate}`,
      weekStartDate,
      daySchedules: baseSchedule.daySchedules.map(ds => {
        const dayDate = new Date(startDate);
        dayDate.setDate(startDate.getDate() + ds.dayIndex);
        
        return {
          ...ds,
          fecha: dayDate.toISOString().split('T')[0]
        };
      })
    };
    
    return adjustedSchedule;
  },

  /**
   * Genera los días de la semana con información de horarios
   */
  generateWeekDays(weekStartDate: string, schedule?: EmployeeSchedule): WeekDay[] {
    const startDate = new Date(weekStartDate);
    const weekDays: WeekDay[] = [];
    
    const dayNames = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];
    const dayShorts = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];

    for (let i = 0; i < 7; i++) {
      const currentDate = new Date(startDate);
      currentDate.setDate(startDate.getDate() + i);
      
      const daySchedule = schedule?.daySchedules.find(ds => ds.dayIndex === i);
      
      weekDays.push({
        dayIndex: i,
        dayName: dayNames[i],
        dayShort: dayShorts[i],
        date: currentDate.toISOString().split('T')[0],
        schedule: daySchedule,
        available: !!daySchedule
      });
    }

    return weekDays;
  },

  /**
   * Obtiene el lunes de la semana actual
   */
  getCurrentWeekStart(): string {
    const today = new Date();
    const dayOfWeek = today.getDay();
    const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    
    const monday = new Date(today);
    monday.setDate(today.getDate() + mondayOffset);
    
    return monday.toISOString().split('T')[0];
  },

  /**
   * Navega a la semana anterior
   */
  getPreviousWeek(currentWeekStart: string): string {
    const date = new Date(currentWeekStart);
    date.setDate(date.getDate() - 7);
    return date.toISOString().split('T')[0];
  },

  /**
   * Navega a la semana siguiente
   */
  getNextWeek(currentWeekStart: string): string {
    const date = new Date(currentWeekStart);
    date.setDate(date.getDate() + 7);
    return date.toISOString().split('T')[0];
  },

  /**
   * Valida que los horarios seleccionados sean válidos
   */
  validateScheduleSelection(
    selectedDays: number[], 
    weekDays: WeekDay[], 
    startTime?: string, 
    endTime?: string
  ): { isValid: boolean; errors: string[]; warnings: string[] } {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (selectedDays.length === 0) {
      errors.push("Debe seleccionar al menos un día");
    }

    for (const dayIndex of selectedDays) {
      const weekDay = weekDays[dayIndex];
      if (!weekDay?.available) {
        errors.push(`${weekDay?.dayName} no está disponible en el horario del empleado`);
      }
    }

    if (startTime && endTime) {
      if (startTime >= endTime) {
        errors.push("La hora de inicio debe ser menor que la hora de fin");
      }

      for (const dayIndex of selectedDays) {
        const weekDay = weekDays[dayIndex];
        if (weekDay?.schedule) {
          if (startTime < weekDay.schedule.startTime || endTime > weekDay.schedule.endTime) {
            warnings.push(
              `El horario seleccionado (${startTime}-${endTime}) está fuera del horario laboral de ${weekDay.dayName} (${weekDay.schedule.startTime}-${weekDay.schedule.endTime})`
            );
          }
        }
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }
};