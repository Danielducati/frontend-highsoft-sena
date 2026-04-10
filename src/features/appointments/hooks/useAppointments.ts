//frontend-highsoft-sena\src\features\appointments\hooks\useAppointments.ts
import { useState, useEffect } from "react";
import { toast } from "sonner";
import {
  Appointment, AppointmentService, Client, CurrentService, Employee, FormData, Service,} from "../types";
import { getMonday, calculateEndTime } from "../utils";
import {
  fetchAppointments, fetchMyAppointments, fetchServices, fetchEmployees, fetchClients,
  fetchMyClientProfile, createAppointment, updateAppointment, deleteAppointment,
  cancelAppointment, updateAppointmentStatus,
} from "../services/appointmentsService";

const TODAY = new Date();

const EMPTY_FORM: FormData = {
  clientId: "", clientName: "", clientPhone: "",
  date: TODAY, startTime: "", notes: "",
};

export function useAppointments(userRole?: string) {
  const [services,     setServices]     = useState<Service[]>([]);
  const [employees,    setEmployees]    = useState<Employee[]>([]);
  const [clients,      setClients]      = useState<Client[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading,      setLoading]      = useState(true);

  const [currentWeekStart,   setCurrentWeekStart]   = useState(() => getMonday(TODAY));
  const [viewMode,           setViewMode]            = useState<"calendar" | "list">("calendar");
  const [searchTerm,         setSearchTerm]          = useState("");
  const [filterStatus,       setFilterStatus]        = useState("all");
  const [isDialogOpen,       setIsDialogOpen]        = useState(false);
  const [editingAppointment, setEditingAppointment]  = useState<Appointment | null>(null);
  const [viewingAppointment, setViewingAppointment]  = useState<Appointment | null>(null);
  const [deleteDialogOpen,     setDeleteDialogOpen]     = useState(false);
  const [appointmentToDelete,  setAppointmentToDelete]  = useState<number | null>(null);
  const [cancelDialogOpen,     setCancelDialogOpen]     = useState(false);
  const [appointmentToCancel,  setAppointmentToCancel]  = useState<number | null>(null);
  const [formData,         setFormData]         = useState<FormData>(EMPTY_FORM);
  const [selectedServices, setSelectedServices] = useState<AppointmentService[]>([]);
  const [currentService,   setCurrentService]   = useState<CurrentService>({ serviceId: "", employeeId: "" });

  useEffect(() => {
    async function loadAll() {
      try {
        const isClient = userRole === "client";

        const [sData, eData, aData] = await Promise.all([
          fetchServices(),
          fetchEmployees(),
          isClient ? fetchMyAppointments() : fetchAppointments(),
        ]);

        setServices(sData);
        setEmployees(eData);
        setAppointments(aData);

        if (isClient) {
          // Pre-cargar el cliente logueado
          const myProfile = await fetchMyClientProfile();
          setClients([myProfile]);
          setFormData(prev => ({
            ...prev,
            clientId:    myProfile.id,
            clientName:  myProfile.name || myProfile.id,
            clientPhone: myProfile.phone,
          }));
        } else {
          const cData = await fetchClients();
          setClients(cData);
        }
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Error al conectar con el servidor";
        toast.error(msg);
      } finally {
        setLoading(false);
      }
    }
    loadAll();
  }, []);

  const reloadAppointments = async () => {
    const data = userRole === "client" ? await fetchMyAppointments() : await fetchAppointments();
    setAppointments(data);
  };

  // ── Sincronizar cliente logueado cuando carga su perfil ──────────────────
  useEffect(() => {
    if (userRole === "client" && clients.length > 0) {
      const myProfile = clients[0];
      setFormData(prev => ({
        ...prev,
        clientId:    prev.clientId    || myProfile.id,
        clientName:  prev.clientName  || myProfile.name,
        clientPhone: prev.clientPhone || myProfile.phone,
      }));
    }
  }, [clients, userRole]);

  // ── Semana ──
  const getWeekDates = () =>
    Array.from({ length: 7 }, (_, i) => {
      const d = new Date(currentWeekStart);
      d.setDate(d.getDate() + i);
      return d;
    });

  const goToPreviousWeek = () => {
    const d = new Date(currentWeekStart); d.setDate(d.getDate() - 7); setCurrentWeekStart(d);
  };
  const goToNextWeek = () => {
    const d = new Date(currentWeekStart); d.setDate(d.getDate() + 7); setCurrentWeekStart(d);
  };
  const goToToday   = () => setCurrentWeekStart(getMonday(TODAY));
  const isToday     = (date: Date) => date.toDateString() === TODAY.toDateString();
  const isPastDate  = (date: Date) => {
    const hoy = new Date(); hoy.setHours(0, 0, 0, 0);
    const d   = new Date(date); d.setHours(0, 0, 0, 0);
    return d < hoy;
  };

  const getEmployeesByCategory = (_category: string) => employees;

  // ── Servicios del formulario ──
  const handleAddService = () => {
    if (!currentService.serviceId || !currentService.employeeId) {
      toast.error("Selecciona un servicio y un empleado"); return;
    }
    const service  = services.find(s => s.id  === currentService.serviceId);
    const employee = employees.find(e => e.id === currentService.employeeId);
    if (!service || !employee) return;

    const serviceStartTime = selectedServices.length > 0
      ? calculateEndTime(
          selectedServices[selectedServices.length - 1].startTime,
          selectedServices[selectedServices.length - 1].duration
        )
      : formData.startTime;

    setSelectedServices(prev => [...prev, {
      serviceId:    service.id,
      serviceName:  service.name,
      employeeId:   employee.id,
      employeeName: employee.name,
      duration:     service.duration,
      startTime:    serviceStartTime,
    }]);
    setCurrentService({ serviceId: "", employeeId: "" });
    toast.success("Servicio agregado");
  };

  const handleRemoveService = (index: number) => {
    const next = selectedServices.filter((_, i) => i !== index).map((s, i, arr) => ({
      ...s,
      startTime: i === 0
        ? formData.startTime
        : calculateEndTime(arr[i - 1].startTime, arr[i - 1].duration),
    }));
    setSelectedServices(next);
  };

  // ── CRUD ──
  const handleCreateOrUpdate = async () => {
    if (!formData.clientId || !formData.startTime || selectedServices.length === 0) {
      toast.error("Selecciona un cliente, hora y al menos un servicio"); return;
    }
    const hoy = new Date(); hoy.setHours(0, 0, 0, 0);
    const fechaCita = new Date(formData.date); fechaCita.setHours(0, 0, 0, 0);
    if (fechaCita < hoy) {
      toast.error("No puedes crear citas en fechas pasadas"); return;
    }

    const payload = {
      cliente:   Number(formData.clientId),
      fecha:     formData.date.toISOString().split("T")[0],
      hora:      formData.startTime,
      notas:     formData.notes || null,
      servicios: selectedServices.map(s => ({
        servicio:         Number(s.serviceId),
        empleado_usuario: Number(s.employeeId),
        precio:           null,
        detalle:          s.serviceName,
      })),
    };

    try {
      if (editingAppointment) {
        await updateAppointment(editingAppointment.id, payload);
        toast.success("Cita actualizada");
      } else {
        await createAppointment(payload, userRole === "client");
        toast.success("Cita creada exitosamente");
      }
      await reloadAppointments();
      resetForm();
    } catch (err: any) {
      toast.error(err.message ?? "Error al guardar la cita");
    }
  };

  const handleDelete = async () => {
    if (!appointmentToDelete) return;
    try {
      await deleteAppointment(appointmentToDelete);
      setAppointments(prev => prev.filter(a => a.id !== appointmentToDelete));
      toast.success("Cita eliminada");
    } catch (err: any) {
      toast.error(err.message ?? "Error al eliminar la cita");
    } finally {
      setDeleteDialogOpen(false);
      setAppointmentToDelete(null);
    }
  };

  const handleCancelAppointment = async () => {
    if (!appointmentToCancel) return;
    try {
      await cancelAppointment(appointmentToCancel);
      setAppointments(prev =>
        prev.map(a => a.id === appointmentToCancel ? { ...a, status: "cancelled" as const } : a)
      );
      toast.success("Cita cancelada");
    } catch {
      toast.error("Error al cancelar la cita");
    } finally {
      setCancelDialogOpen(false);
      setAppointmentToCancel(null);
    }
  };

  const handleUpdateStatus = async (appointmentId: number, status: Appointment["status"]) => {
    try {
      await updateAppointmentStatus(appointmentId, status);
      setAppointments(prev => prev.map(a => a.id === appointmentId ? { ...a, status } : a));
      if (viewingAppointment?.id === appointmentId) {
        setViewingAppointment(prev => prev ? { ...prev, status } : prev);
      }
      toast.success("Estado actualizado");
    } catch {
      toast.error("Error al actualizar el estado");
    }
  };

  const resetForm = () => {
    setIsDialogOpen(false);
    setEditingAppointment(null);
    setFormData(EMPTY_FORM);
    setSelectedServices([]);
    setCurrentService({ serviceId: "", employeeId: "" });
  };

  const handleEdit = (appointment: Appointment) => {
    setEditingAppointment(appointment);
    const client = clients.find(c => c.name === appointment.clientName);
    setFormData({
      clientId:    client ? String(client.id) : "",
      clientName:  appointment.clientName,
      clientPhone: appointment.clientPhone,
      date:        appointment.date,
      startTime:   appointment.startTime,
      notes:       appointment.notes ?? "",
    });
    setSelectedServices(appointment.services);
    setIsDialogOpen(true);
  };

  const handleClientChange = (clientId: string) => {
    const client = clients.find(c => String(c.id) === clientId);
    if (client) {
      setFormData(prev => ({ ...prev, clientId, clientName: client.name, clientPhone: client.phone }));
    }
  };

  // ── Calendario ──

  // Retorna las citas que ocupan una celda (fecha + franja horaria)
  const getAppointmentsForCell = (date: Date, time: string) =>
    appointments.filter(apt => {
      if (apt.date.toDateString() !== date.toDateString()) return false;
      const [aH, aM] = apt.startTime.split(":").map(Number);
      const [eH, eM] = apt.endTime.split(":").map(Number);
      const [cH, cM] = time.split(":").map(Number);
      return (cH * 60 + cM) >= (aH * 60 + aM) && (cH * 60 + cM) < (eH * 60 + eM);
    });

  // Devuelve el conjunto de employeeIds ocupados en una celda concreta.
  // Una celda solo se considera "completamente bloqueada" si TODOS los
  // empleados activos están ocupados en esa franja.
  const getOccupiedEmployeeIds = (date: Date, time: string): Set<string> => {
    const cellApts = getAppointmentsForCell(date, time).filter(
      a => a.status !== "cancelled"
    );
    const occupied = new Set<string>();
    cellApts.forEach(apt => {
      apt.services.forEach(s => occupied.add(s.employeeId));
    });
    return occupied;
  };

  const isCellFullyBlocked = (date: Date, time: string): boolean => {
    if (employees.length === 0) return false;
    const occupied = getOccupiedEmployeeIds(date, time);
    return employees.every(e => occupied.has(e.id));
  };

  const getAppointmentCellSpan = (apt: Appointment) => {
    const [sH, sM] = apt.startTime.split(":").map(Number);
    const [eH, eM] = apt.endTime.split(":").map(Number);
    return Math.ceil(((eH * 60 + eM) - (sH * 60 + sM)) / 30);
  };

  const filteredAppointments = appointments.filter(apt => {
    const matchSearch = apt.clientName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = filterStatus === "all" || apt.status === filterStatus;
    return matchSearch && matchStatus;
  });

  return {
    // data
    services, employees, clients, appointments, loading,
    // ui state
    currentWeekStart, viewMode, setViewMode,
    searchTerm, setSearchTerm, filterStatus, setFilterStatus,
    isDialogOpen, setIsDialogOpen,
    editingAppointment, viewingAppointment, setViewingAppointment,
    deleteDialogOpen, setDeleteDialogOpen,
    appointmentToDelete, setAppointmentToDelete,
    cancelDialogOpen, setCancelDialogOpen,
    appointmentToCancel, setAppointmentToCancel,
    // form
    formData, setFormData,
    selectedServices, currentService, setCurrentService,
    // computed
    filteredAppointments,
    // calendar helpers
    getWeekDates, goToPreviousWeek, goToNextWeek, goToToday,
    isToday, isPastDate, getEmployeesByCategory,
    getAppointmentsForCell, getAppointmentCellSpan,
    getOccupiedEmployeeIds, isCellFullyBlocked,
    // handlers
    handleAddService, handleRemoveService,
    handleCreateOrUpdate, handleDelete, handleCancelAppointment,
    handleUpdateStatus, resetForm, handleEdit, handleClientChange,
  };
}