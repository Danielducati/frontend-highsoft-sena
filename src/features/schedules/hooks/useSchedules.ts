// schedules/hooks/useSchedules.ts
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { WeeklySchedule, ScheduleFormData, Employee } from "../types";
import { getMondayOfWeek, getWeekDays, formatDateToISO } from "../utils";
import { WEEK_DAYS_LABELS } from "../constants";
import { schedulesApi } from "../services/schedulesApi";

const DEFAULT_WEEK = getMondayOfWeek(new Date());
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
  const [formWeekStart,    setFormWeekStart]    = useState<Date>(DEFAULT_WEEK);
  const [formData,         setFormData]         = useState<ScheduleFormData>(EMPTY_FORM);

  // ── Cargar datos al montar ─────────────────────────────────────────────────
  useEffect(() => {
    fetchAll();
  }, []);

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

  // ── Semana en el formulario ────────────────────────────────────────────────
  const goToPreviousWeek = () => {
    const d = new Date(formWeekStart);
    d.setDate(d.getDate() - 7);
    setFormWeekStart(d);
  };

  const goToNextWeek = () => {
    const d = new Date(formWeekStart);
    d.setDate(d.getDate() + 7);
    setFormWeekStart(d);
  };

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

    const weekStartDate = formatDateToISO(formWeekStart);

    try {
      if (editingSchedule) {
        // Siempre usar la weekStartDate ORIGINAL del horario que se edita
        await schedulesApi.update(formData.employeeId, editingSchedule.weekStartDate, formData.daySchedules);
        toast.success("Horario actualizado exitosamente");
      } else {
        await schedulesApi.create({
          employeeId:    formData.employeeId,
          weekStartDate,
          daySchedules:  formData.daySchedules,
        });
        toast.success("Horario creado exitosamente");
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

    // Verificar si ya existe un horario para ese empleado en la semana siguiente
    const yaExiste = schedules.some(
      s => s.employeeId === schedule.employeeId && s.weekStartDate === nextWeekStartDate
    );
    if (yaExiste) {
      toast.error(`Ya existe un horario para ${schedule.employeeName} en la semana del ${nextWeekStartDate}. Elimínalo primero.`);
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
      // Recargar para reflejar el estado real (por si el delete sí se ejecutó)
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
    // Usar T12:00:00 para evitar que el offset local desplace el día
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
    setFormWeekStart(DEFAULT_WEEK);
    setFormData(EMPTY_FORM);
  };

  const clearFilters = () => {
    setSearchTerm("");
    setFilterEmployee("all");
  };

  // ── Filtros ────────────────────────────────────────────────────────────────
  const filteredSchedules = schedules
    .filter(s => s.isActive)
    .filter(s => filterEmployee === "all" || s.employeeId === filterEmployee)
    .filter(s => !searchTerm || s.employeeName.toLowerCase().includes(searchTerm.toLowerCase()));

  const formWeekDays = getWeekDays(formWeekStart);

  return {
    schedules, filteredSchedules, employees, loading,
    isDialogOpen, setIsDialogOpen,
    editingSchedule,
    deleteDialogOpen, setDeleteDialogOpen,
    detailDialogOpen, setDetailDialogOpen,
    viewingSchedule,
    searchTerm, setSearchTerm,
    filterEmployee, setFilterEmployee,
    formWeekStart, formData, setFormData,
    formWeekDays,
    goToPreviousWeek, goToNextWeek,
    toggleDay, updateDaySchedule,
    handleCreateOrUpdate, handleDelete, handleRenewWeek,
    confirmDelete, handleEdit, handleViewDetail,
    resetForm, clearFilters,
  };
}