// schedules/hooks/useSchedules.ts
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { WeeklySchedule, ScheduleFormData, Employee } from "../types";
import { getMondayOfWeek, getWeekDays, formatDateToISO } from "../utils";
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
  const [isDialogOpen,     setIsDialogOpen]     = useState(false);
  const [editingSchedule,  setEditingSchedule]  = useState<WeeklySchedule | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [scheduleToDelete, setScheduleToDelete] = useState<WeeklySchedule | null>(null);
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
      return { year: y, month: m };
    });
  };

  const goToNextMonth = () => {
    setSelectedMonth(prev => {
      const m = prev.month === 11 ? 0 : prev.month + 1;
      const y = prev.month === 11 ? prev.year + 1 : prev.year;
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

  const handleDelete = async () => {
    if (!scheduleToDelete) return;
    try {
      await schedulesApi.remove(scheduleToDelete.employeeId, scheduleToDelete.weekStartDate);
      toast.success("Horario eliminado");
      await reload();
    } catch {
      toast.error("Error al eliminar horario");
    } finally {
      setDeleteDialogOpen(false);
      setScheduleToDelete(null);
    }
  };

  const confirmDelete = (schedule: WeeklySchedule) => {
    setScheduleToDelete(schedule);
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
  const filteredSchedules = schedules
    .filter(s => s.isActive)
    .filter(s => filterEmployee === "all" || s.employeeId === filterEmployee)
    .filter(s => !searchTerm || s.employeeName.toLowerCase().includes(searchTerm.toLowerCase()))
    .sort((a, b) => b.weekStartDate.localeCompare(a.weekStartDate));

  return {
    schedules, filteredSchedules, employees, loading,
    isDialogOpen, setIsDialogOpen,
    editingSchedule,
    deleteDialogOpen, setDeleteDialogOpen,
    detailDialogOpen, setDetailDialogOpen,
    viewingSchedule,
    searchTerm, setSearchTerm,
    filterEmployee, setFilterEmployee,
    // Mes
    selectedMonth, setSelectedMonth, weeksOfMonth,
    goToPreviousMonth, goToNextMonth,
    // Compatibilidad con ScheduleFormDialog
    formWeekStart, setFormWeekStart, formData, setFormData,
    formWeekDays,
    selectedMonth, weeksOfSelectedMonth,
    goToPreviousWeek, goToNextWeek,
    goToPreviousMonth, goToNextMonth,
    toggleDay, updateDaySchedule,
    handleCreateOrUpdate, handleDelete, handleRenewWeek,
    confirmDelete, handleEdit, handleViewDetail,
    resetForm, clearFilters,
  };
}
