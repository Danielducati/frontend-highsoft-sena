// src/features/news/services/scheduleService.ts
import { EmployeeSchedule, WeekDay } from "../types/schedule";
import { mockScheduleService } from "./mockScheduleService";

const API_BASE = import.meta.env.VITE_API_URL || "https://backend-highsoft-sena-production.up.railway.app";

const authHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${localStorage.getItem("token") ?? ""}`,
});

export const scheduleService = {
  /**
   * Obtiene el horario semanal de un empleado
   */
  async getEmployeeSchedule(employeeId: string): Promise<EmployeeSchedule[]> {
    try {
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('[scheduleService] 🔍 Fetching schedules for employee:', employeeId);
      console.log('[scheduleService] 🔍 employeeId type:', typeof employeeId);
      console.log('[scheduleService] 🔍 API URL:', `${API_BASE}/schedules`);
      
      const response = await fetch(`${API_BASE}/schedules`, {
        headers: authHeaders(),
      });
      
      if (!response.ok) {
        console.error('[scheduleService] ❌ HTTP error:', response.status, response.statusText);
        throw new Error("Error al obtener horarios");
      }
      
      const allSchedules: any[] = await response.json();
      console.log('[scheduleService] 📊 Total schedules received:', allSchedules.length);
      
      if (allSchedules.length === 0) {
        console.warn('[scheduleService] ⚠️ No schedules found in system');
        return [];
      }
      
      console.log('[scheduleService] 📋 First schedule structure:', JSON.stringify(allSchedules[0], null, 2));
      console.log('[scheduleService] 👥 All employee IDs in system:', allSchedules.map(s => `${s.employeeId} (${typeof s.employeeId})`));
      
      // Comparar como string en ambos lados para evitar fallos por tipo number vs string
      const filtered = allSchedules.filter(s => {
        const schedEmpId = String(s.employeeId);
        const targetEmpId = String(employeeId);
        const matches = schedEmpId === targetEmpId;
        console.log(`[scheduleService] 🔎 Comparing: "${schedEmpId}" === "${targetEmpId}" => ${matches}`);
        return matches;
      });
      
      console.log('[scheduleService] ✅ Filtered schedules count:', filtered.length);
      
      if (filtered.length > 0) {
        console.log('[scheduleService] 📅 Schedule details:', JSON.stringify(filtered, null, 2));
      } else {
        console.error('[scheduleService] ❌❌❌ NO SCHEDULES FOUND FOR EMPLOYEE:', employeeId);
        console.error('[scheduleService] Available employee IDs:', allSchedules.map(s => s.employeeId));
        console.error('[scheduleService] Comparison failed - check if IDs match!');
      }
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      
      return filtered;
    } catch (error) {
      console.error("[scheduleService] ❌ Error fetching employee schedule:", error);
      throw error;
    }
  },

  /**
   * Obtiene el horario efectivo de un empleado para una semana específica
   */
  async getWeekSchedule(employeeId: string, weekStartDate: string): Promise<EmployeeSchedule | null> {
    try {
      const schedules = await this.getEmployeeSchedule(employeeId);
      return schedules.find(s => s.weekStartDate === weekStartDate) || null;
    } catch (error) {
      console.error("Error fetching week schedule:", error);
      return null;
    }
  },

  /**
   * Genera los días de la semana con información de horarios
   */
  generateWeekDays(weekStartDate: string, schedule?: EmployeeSchedule): WeekDay[] {
    return this._generateWeekDaysReal(weekStartDate, schedule);
  },

  _generateWeekDaysReal(weekStartDate: string, schedule?: EmployeeSchedule): WeekDay[] {
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
    const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek; // Si es domingo (0), retroceder 6 días
    
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

    // Validar que se hayan seleccionado días
    if (selectedDays.length === 0) {
      errors.push("Debe seleccionar al menos un día");
    }

    // Validar que los días seleccionados tengan horario
    for (const dayIndex of selectedDays) {
      const weekDay = weekDays[dayIndex];
      if (!weekDay?.available) {
        errors.push(`${weekDay?.dayName} no está disponible en el horario del empleado`);
      }
    }

    // Validar horarios parciales
    if (startTime && endTime) {
      if (startTime >= endTime) {
        errors.push("La hora de inicio debe ser menor que la hora de fin");
      }

      // Validar que esté dentro del horario laboral
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