// schedules/hooks/useSchedules.ts
import { useState, useEffect, useRef } from "react";
import { toast } from "sonner";
import { WeeklySchedule, ScheduleFormData, Employee } from "../types";
import { getMondayOfWeek, getWeekDays, formatDateToISO, formatWeekRange } from "../utils";
import { WEEK_DAYS_LABELS } from "../constants";
import { schedulesApi } from "../services/schedulesApi";

// ── Helpers de mes ────────────────────────────────────────────────────────────

/** Primer lunes del mes */
function getFirstMondayOfMonth(year: number, month: number): Date {
  const first = new Date(Date.UTC(year, month, 1));
  const dow   = first.getUTCDay(); // 0=Dom
  const diff  = dow === 0 ? 1 : dow === 1 ? 0 : 8 - dow;
  return new Date(Date.UTC(year, month, 1 + diff));
}

/** Todas las semanas (lunes) que caen dentro del mes */
function getWeeksOfMonth(year: number, month: number): string[] {
  const weeks: string[] = [];
  let monday = getFirstMondayOfMonth(year, month);
  while (monday.getUTCMonth() === month) {
    weeks.push(monday.toISOString().split("T")[0]);
    monday = new Date(Date.UTC(monday.getUTCFullYear(), monday.getUTCMonth(), monday.getUTCDate() + 7));
  }
  return weeks;
}

/** Nombre del mes en español */
export function formatMonthLabel(year: number, month: number): string {
  return new Date(year, month, 1).toLocaleDateString("es-ES", { month: "long", year: "numeric" });
}

const now = new Date();
const INITIAL_MONTH = { year: now.getFullYear(), month: now.getMonth() };
const EMPTY_FORM: ScheduleFormData = { employeeId: "", daySchedules: [] };

export function useSchedules() {
  const [schedules,        setSchedules]        = useState<WeeklySchedule[]>([]);
  const [employees,        setEmployees]        = useState<Employee[]>([]);
  const [loading,          setLoading]          = useState(true);
  
  // Protección contra doble clic
  const isProcessing = useRef(false);
  const [isDialogOpen,     setIsDialogOpen]     = useState(false);
  const [editingSchedule,  setEditingSchedule]  = useState<WeeklySchedule | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [scheduleToDelete, setScheduleToDelete] = useState<{ employeeId: string; monthKey: string; weeks: WeeklySchedule[] } | null>(null);
  const [searchTerm,       setSearchTerm]       = useState("");
  const [filterEmployee,   setFilterEmployee]   = useState("all");
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [viewingSchedule,  setViewingSchedule]  = useState<WeeklySchedule | null>(null);

  // ── Estado del formulario mensual ─────────────────────────────────────────
  const [selectedMonth, setSelectedMonth] = useState(INITIAL_MONTH);
  const [formData,      setFormData]      = useState<ScheduleFormData>(EMPTY_FORM);

  // Semanas del mes seleccionado
  const weeksOfMonth = getWeeksOfMonth(selectedMonth.year, selectedMonth.month);

  // Para compatibilidad con ScheduleFormDialog (edición de semana individual)
  const [formWeekStart, setFormWeekStart] = useState<Date>(
    new Date(weeksOfMonth[0] + "T12:00:00")
  );
  const formWeekDays = getWeekDays(formWeekStart);

  // ── Cargar datos al montar ─────────────────────────────────────────────────
  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    try {
      setLoading(true);
      const [schedulesData, employeesData] = await Promise.all([
        schedulesApi.getAll(),
        schedulesApi.getEmployees(),
      ]);
      setSchedules(schedulesData);
      setEmployees(employeesData);
    } catch {
      toast.error("Error al cargar horarios");
    } finally {
      setLoading(false);
    }
  };

  const reload = async () => {
    const data = await schedulesApi.getAll();
    setSchedules(data);
  };

  // ── Navegación de mes ──────────────────────────────────────────────────────
  const goToPreviousMonth = () => {
    setSelectedMonth(prev => {
      const m = prev.month === 0 ? 11 : prev.month - 1;
      const y = prev.month === 0 ? prev.year - 1 : prev.year;
      
      // No permitir meses pasados
      const now = new Date();
      const currentYear = now.getFullYear();
      const currentMonth = now.getMonth();
      
      if (y < currentYear || (y === currentYear && m < currentMonth)) {
        return prev; // No cambiar si es un mes pasado
      }
      
      return { year: y, month: m };
    });
  };

  const goToNextMonth = () => {
    setSelectedMonth(prev => {
      const m = prev.month === 11 ? 0 : prev.month + 1;
      const y = prev.month === 11 ? prev.year + 1 : prev.year;
      
      // No permitir más de 3 meses en el futuro
      const now = new Date();
      const maxDate = new Date(now.getFullYear(), now.getMonth() + 3, 1);
      const maxYear = maxDate.getFullYear();
      const maxMonth = maxDate.getMonth();
      
      if (y > maxYear || (y === maxYear && m > maxMonth)) {
        return prev; // No cambiar si excede 3 meses
      }
      
      return { year: y, month: m };
    });
  };

  // Alias para compatibilidad con ScheduleFormDialog
  const goToPreviousWeek = goToPreviousMonth;
  const goToNextWeek     = goToNextMonth;

  // ── Días en el formulario ──────────────────────────────────────────────────
  const toggleDay = (dayIndex: number) => {
    const exists = formData.daySchedules.some(ds => ds.dayIndex === dayIndex);
    setFormData(prev => ({
      ...prev,
      daySchedules: exists
        ? prev.daySchedules.filter(ds => ds.dayIndex !== dayIndex)
        : [...prev.daySchedules, { dayIndex, startTime: "", endTime: "" }],
    }));
  };

  const updateDaySchedule = (dayIndex: number, field: "startTime" | "endTime", value: string) => {
    setFormData(prev => ({
      ...prev,
      daySchedules: prev.daySchedules.map(ds =>
        ds.dayIndex === dayIndex ? { ...ds, [field]: value } : ds
      ),
    }));
  };

  // ── CRUD ───────────────────────────────────────────────────────────────────
  const handleCreateOrUpdate = async () => {
    // Prevenir doble clic
    if (isProcessing.current) {
      console.log('⚠️ Horario en proceso, ignorando clic adicional');
      return;
    }
    
    if (!formData.employeeId || formData.daySchedules.length === 0) {
      toast.error("Por favor completa todos los campos y selecciona al menos un día");
      return;
    }
    for (const ds of formData.daySchedules) {
      if (!ds.startTime || !ds.endTime) {
        toast.error("Por favor completa todos los horarios");
        return;
      }
      if (ds.startTime >= ds.endTime) {
        const dayLabel = WEEK_DAYS_LABELS[ds.dayIndex]?.label || "día";
        toast.error(`La hora de inicio debe ser menor a la hora de fin en ${dayLabel}`);
        return;
      }
    }

    isProcessing.current = true;
    try {
      if (editingSchedule) {
        // Edición: actualiza solo esa semana
        await schedulesApi.update(
          formData.employeeId,
          editingSchedule.weekStartDate,
          formData.daySchedules
        );
        toast.success("Horario actualizado exitosamente");
      } else {
        // Creación: aplica el patrón a TODAS las semanas del mes
        const weeks = getWeeksOfMonth(selectedMonth.year, selectedMonth.month);
        let created = 0;
        let skipped = 0;

        for (const weekStartDate of weeks) {
          // Verificar si ya existe horario para ese empleado en esa semana
          const yaExiste = schedules.some(
            s => s.employeeId === formData.employeeId && s.weekStartDate === weekStartDate
          );
          if (yaExiste) { skipped++; continue; }

          await schedulesApi.create({
            employeeId:   formData.employeeId,
            weekStartDate,
            daySchedules: formData.daySchedules,
          });
          created++;
        }

        if (created > 0 && skipped === 0) {
          toast.success(`Horario creado para ${created} semana${created !== 1 ? "s" : ""} del mes`);
        } else if (created > 0 && skipped > 0) {
          toast.success(`${created} semana${created !== 1 ? "s" : ""} creada${created !== 1 ? "s" : ""}. ${skipped} omitida${skipped !== 1 ? "s" : ""} (ya existían).`);
        } else {
          toast.error("Ya existen horarios para todas las semanas de este mes para este empleado.");
          return;
        }
      }

      await reload();
      resetForm();
    } catch (err: any) {
      toast.error(err.message ?? "Error al guardar horario");
    } finally {
      // Liberar después de 1 segundo
      setTimeout(() => {
        isProcessing.current = false;
      }, 1000);
    }
  };

  const handleRenewWeek = async (schedule: WeeklySchedule) => {
    const [y, m, d] = schedule.weekStartDate.split("-").map(Number);
    const nextMonday = new Date(Date.UTC(y, m - 1, d + 7));
    const nextWeekStartDate = nextMonday.toISOString().split("T")[0];

    const yaExiste = schedules.some(
      s => s.employeeId === schedule.employeeId && s.weekStartDate === nextWeekStartDate
    );
    if (yaExiste) {
      toast.error(`Ya existe un horario para ${schedule.employeeName} en la semana del ${nextWeekStartDate}.`);
      return;
    }

    try {
      await schedulesApi.remove(schedule.employeeId, schedule.weekStartDate);
      await schedulesApi.create({
        employeeId:    schedule.employeeId,
        weekStartDate: nextWeekStartDate,
        daySchedules:  schedule.daySchedules,
      });
      toast.success(`Semana actualizada al ${nextWeekStartDate}`);
      await reload();
    } catch (err: any) {
      toast.error(err.message ?? "Error al actualizar semana");
      await reload();
    }
  };

  // Copia todo el mes al mes siguiente
  const handleRenewMonth = async (employeeId: string, monthKey: string, weeksList: WeeklySchedule[]) => {
    const [y, m] = monthKey.split("-").map(Number);
    // Mes siguiente
    const nextMonth = m === 12 ? 1 : m + 1;
    const nextYear  = m === 12 ? y + 1 : y;

    // Semanas del mes siguiente
    const nextWeeks = getWeeksOfMonth(nextYear, nextMonth - 1);

    if (nextWeeks.length === 0) {
      toast.error("No se encontraron semanas para el mes siguiente");
      return;
    }

    // Verificar si ya existen horarios en el mes siguiente para este empleado
    const yaExisten = nextWeeks.filter(w =>
      schedules.some(s => s.employeeId === employeeId && s.weekStartDate === w)
    );
    if (yaExisten.length > 0) {
      toast.error(`Ya existen ${yaExisten.length} semana(s) en el mes siguiente para este empleado. Elimínalas primero.`);
      return;
    }

    // Patrón de días del mes actual (tomamos la primera semana)
    const dayPattern = weeksList[0]?.daySchedules ?? [];
    if (dayPattern.length === 0) {
      toast.error("No hay días configurados en este mes");
      return;
    }

    const nextMonthLabel = new Date(nextYear, nextMonth - 1, 1)
      .toLocaleDateString("es-ES", { month: "long", year: "numeric" });

    try {
      let created = 0;
      for (const weekStartDate of nextWeeks) {
        await schedulesApi.create({
          employeeId,
          weekStartDate,
          daySchedules: dayPattern,
        });
        created++;
      }
      toast.success(`Horario copiado a ${nextMonthLabel} (${created} semanas)`);
      await reload();
    } catch (err: any) {
      toast.error(err.message ?? "Error al copiar horario");
      await reload();
    }
  };

  const handleDelete = async () => {
    if (!scheduleToDelete) return;
    try {
      // Eliminar todas las semanas del mes para ese empleado
      for (const week of scheduleToDelete.weeks) {
        await schedulesApi.remove(week.employeeId, week.weekStartDate);
      }
      toast.success(`Horario eliminado (${scheduleToDelete.weeks.length} semana${scheduleToDelete.weeks.length !== 1 ? "s" : ""})`);
      await reload();
    } catch (err: any) {
      const errorMsg = err.message || "Error al eliminar horario";
      if (errorMsg.includes("Foreign key constraint") || errorMsg.includes("novedad") || errorMsg.includes("FK_id_horario")) {
        toast.error("No se puede eliminar porque hay novedades o registros asignados a este horario.");
      } else if (errorMsg.includes("cita")) {
        toast.error("No se puede eliminar porque hay citas asignadas.");
      } else {
        toast.error(`No se pudo eliminar: ${errorMsg}`);
      }
    } finally {
      setDeleteDialogOpen(false);
      setScheduleToDelete(null);
    }
  };

  // Elimina solo una semana específica (sin diálogo de confirmación del mes)
  const handleDeleteWeek = async (week: WeeklySchedule) => {
    try {
      await schedulesApi.remove(week.employeeId, week.weekStartDate);
      toast.success(`Semana ${formatWeekRange(week.weekStartDate)} eliminada`);
      await reload();
    } catch (err: any) {
      const errorMsg = err.message || "Error al eliminar la semana";
      if (errorMsg.includes("Foreign key constraint") || errorMsg.includes("novedad") || errorMsg.includes("FK_id_horario")) {
        toast.error("No se puede eliminar porque hay novedades o registros asignados a esta semana.");
      } else if (errorMsg.includes("cita")) {
        toast.error("No se puede eliminar porque hay citas asignadas en esta semana.");
      } else {
        toast.error(`No se pudo eliminar: ${errorMsg}`);
      }
    }
  };

  const confirmDelete = (employeeId: string, monthKey: string, weeks: WeeklySchedule[]) => {
    setScheduleToDelete({ employeeId, monthKey, weeks });
    setDeleteDialogOpen(true);
  };

  const handleEdit = (schedule: WeeklySchedule) => {
    setEditingSchedule(schedule);
    setFormWeekStart(new Date(schedule.weekStartDate + "T12:00:00"));
    setFormData({ employeeId: schedule.employeeId, daySchedules: [...schedule.daySchedules] });
    setIsDialogOpen(true);
  };

  const handleViewDetail = (schedule: WeeklySchedule) => {
    setViewingSchedule(schedule);
    setDetailDialogOpen(true);
  };

  const resetForm = () => {
    setIsDialogOpen(false);
    setEditingSchedule(null);
    setFormData(EMPTY_FORM);
    const n = new Date();
    setSelectedMonth({ year: n.getFullYear(), month: n.getMonth() });
  };

  const clearFilters = () => {
    setSearchTerm("");
    setFilterEmployee("all");
  };

  // ── Filtros ────────────────────────────────────────────────────────────────
  const todayStr = new Date().toISOString().split("T")[0];

  const filteredSchedules = schedules
    .filter(s => {
      // Una semana "activa" termina 6 días después del lunes de inicio
      const [y, m, d] = s.weekStartDate.split("-").map(Number);
      const weekEnd = new Date(Date.UTC(y, m - 1, d + 6)).toISOString().split("T")[0];
      return weekEnd >= todayStr; // la semana aún no ha terminado
    })
    .filter(s => filterEmployee === "all" || s.employeeId === filterEmployee)
    .filter(s => !searchTerm || s.employeeName.toLowerCase().includes(searchTerm.toLowerCase()))
    .sort((a, b) => b.weekStartDate.localeCompare(a.weekStartDate));

  // Horarios cuya semana ya venció (semana terminada antes de hoy)
  const pastFilteredSchedules = schedules
    .filter(s => {
      const [y, m, d] = s.weekStartDate.split("-").map(Number);
      const weekEnd = new Date(Date.UTC(y, m - 1, d + 6)).toISOString().split("T")[0];
      return weekEnd < todayStr;
    })
    .filter(s => filterEmployee === "all" || s.employeeId === filterEmployee)
    .filter(s => !searchTerm || s.employeeName.toLowerCase().includes(searchTerm.toLowerCase()))
    .sort((a, b) => b.weekStartDate.localeCompare(a.weekStartDate));

  return {
    schedules, filteredSchedules, pastFilteredSchedules, employees, loading,
    isDialogOpen, setIsDialogOpen,
    editingSchedule,
    deleteDialogOpen, setDeleteDialogOpen,
    detailDialogOpen, setDetailDialogOpen,
    viewingSchedule,
    searchTerm, setSearchTerm,
    filterEmployee, setFilterEmployee,
    selectedMonth, setSelectedMonth, weeksOfMonth,
    goToPreviousMonth, goToNextMonth,
    goToPreviousWeek, goToNextWeek,
    formWeekStart, setFormWeekStart, formData, setFormData,
    formWeekDays,
    toggleDay, updateDaySchedule,
    handleCreateOrUpdate, handleDelete, handleDeleteWeek, handleRenewWeek, handleRenewMonth,
    confirmDelete, handleEdit, handleViewDetail,
    resetForm, clearFilters,
  };
}
