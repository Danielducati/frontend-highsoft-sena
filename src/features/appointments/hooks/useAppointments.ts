//frontend-highsoft-sena\src\features\appointments\hooks\useAppointments.ts
import { useState, useEffect, useRef } from "react";
import { toast } from "sonner";
import {
  Appointment, AppointmentService, Client, CurrentService, Employee, FormData, Service,} from "../types";
import { getMonday, calculateEndTime } from "../utils";
import {
  fetchAppointments, fetchMyAppointments, fetchMyEmployeeAppointments,
  fetchServices, fetchMyEmployeeServices, fetchEmployees, fetchEmployeesByDate, fetchClients,
  fetchClientsForAppointments,
  fetchMyClientProfile, fetchMyEmployeeProfile,
  createAppointment, updateAppointment, deleteAppointment,
  cancelAppointment, updateAppointmentStatus,
  fetchAvailableTimeSlots,
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
  const [availableSlots, setAvailableSlots] = useState<Map<string, { minTime: string; maxTime: string; hasSchedules: boolean }>>(new Map());
  const [employeesForService, setEmployeesForService] = useState<Employee[]>([]);

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
  const [myEmployeeProfile, setMyEmployeeProfile] = useState<{ id: string; name: string; phone: string; specialty: string } | null>(null);

  // Ref para capturar el startTime más reciente sin depender del closure del estado
  const startTimeRef = useRef<string>("");
  
  // Protección contra doble clic
  const isCreatingOrUpdating = useRef(false);

  useEffect(() => {
    async function loadAll() {
      try {
        const isClient   = userRole === "client";
        const isEmployee = userRole === "employee";

        const [sData, eData, aData] = await Promise.all([
          isEmployee ? fetchMyEmployeeServices() : fetchServices(),
          fetchEmployees(),
          isClient   ? fetchMyAppointments()         :
          isEmployee ? fetchMyEmployeeAppointments() :
                       fetchAppointments(),
        ]);

        // Si el empleado no tiene servicios asignados, no mostrar ninguno
        setServices(sData as Service[]);
        setEmployees(eData as Employee[]);
        setAppointments(aData);

        if (isClient) {
          const myProfile = await fetchMyClientProfile();
          setClients([{ id: Number(myProfile.id) || 0, name: myProfile.name, phone: myProfile.phone }]);
          setFormData(prev => ({
            ...prev,
            clientId:    myProfile.id,
            clientName:  myProfile.name || myProfile.id,
            clientPhone: myProfile.phone,
          }));
        } else if (isEmployee) {
          const [cData, myProfile] = await Promise.all([
            fetchClientsForAppointments(),
            fetchMyEmployeeProfile(),
          ]);
          setClients(cData as Client[]);
          setMyEmployeeProfile(myProfile);
        } else {
          const cData = await fetchClientsForAppointments();
          setClients(cData as Client[]);
        }
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Error al conectar con el servidor";
        toast.error(msg);
      } finally {
        setLoading(false);
      }
    }
    loadAll();

    // Escuchar evento de recarga (disparado al aprobar una cotización)
    const handleReload = () => reloadAppointments();
    window.addEventListener("appointments:reload", handleReload);
    return () => window.removeEventListener("appointments:reload", handleReload);
  }, []);

  // Cargar franjas horarias cuando cambia la semana
  useEffect(() => {
    loadAvailableSlots(currentWeekStart);
  }, [currentWeekStart]);

  // Cargar empleados disponibles cuando cambia la fecha del formulario o se abre el dialog
  useEffect(() => {
    if (!isDialogOpen) return;
    const date = formData.date ?? new Date();
    const fechaStr = date instanceof Date
      ? `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,"0")}-${String(date.getDate()).padStart(2,"0")}`
      : String(date).split("T")[0];
    fetchEmployeesByDate(fechaStr, formData.startTime)
      .then(data => setEmployees(data))
      .catch(() => setEmployees([]));
    
    // Si hay un servicio seleccionado, recargar empleados para ese servicio
    if (currentService.serviceId) {
      loadEmployeesForService(currentService.serviceId);
    }
  }, [formData.date, formData.startTime, isDialogOpen, currentService.serviceId]);

  const reloadAppointments = async () => {
    const data = userRole === "client"   ? await fetchMyAppointments()         :
                 userRole === "employee" ? await fetchMyEmployeeAppointments() :
                                          await fetchAppointments();
    setAppointments(data);
  };

  const loadAvailableSlots = async (weekStart: Date) => {
    try {
      const weekStartStr = `${weekStart.getFullYear()}-${String(weekStart.getMonth() + 1).padStart(2, "0")}-${String(weekStart.getDate()).padStart(2, "0")}`;
      const slots = await fetchAvailableTimeSlots(weekStartStr);
      
      const map = new Map<string, { minTime: string; maxTime: string; hasSchedules: boolean }>();
      slots.forEach(slot => {
        map.set(slot.date, {
          minTime: slot.minTime,
          maxTime: slot.maxTime,
          hasSchedules: slot.hasSchedules,
        });
      });
      
      setAvailableSlots(map);
    } catch (err) {
      console.error("Error cargando franjas horarias:", err);
      setAvailableSlots(new Map());
    }
  };

  // ── Sincronizar cliente logueado cuando carga su perfil ──────────────────
  useEffect(() => {
    if (userRole === "client" && clients.length > 0) {
      const myProfile = clients[0];
      setFormData(prev => ({
        ...prev,
        clientId:    prev.clientId    || String(myProfile.id),
        clientName:  prev.clientName  || myProfile.name,
        clientPhone: prev.clientPhone || myProfile.phone,
      }));
    }
  }, [clients, userRole]);

  // ── Inicializar primer cliente para empleados cuando se abre el diálogo ──
  useEffect(() => {
    const isEmployee = userRole && userRole !== "client" && userRole !== "Cliente";
    if (isEmployee && isDialogOpen && !editingAppointment && clients.length > 0) {
      const firstClient = clients[0];
      console.log("🔧 [useAppointments] Inicializando primer cliente para empleado:", firstClient);
      setFormData(prev => {
        // Solo establecer si está vacío
        if (!prev.clientId || prev.clientId === "" || prev.clientId === "0") {
          console.log("🔧 [useAppointments] Estableciendo clientId:", String(firstClient.id));
          return {
            ...prev,
            clientId:    String(firstClient.id),
            clientName:  firstClient.name,
            clientPhone: firstClient.phone,
          };
        }
        return prev;
      });
    }
  }, [isDialogOpen, clients, userRole, editingAppointment]);

  // ── Semana ──
  const getWeekDates = () =>
    Array.from({ length: 7 }, (_, i) => {
      const d = new Date(currentWeekStart);
      d.setDate(d.getDate() + i);
      return d;
    });

  const goToPreviousWeek = () => {
    const d = new Date(currentWeekStart); d.setDate(d.getDate() - 7); setCurrentWeekStart(d);
    loadAvailableSlots(d);
  };
  const goToNextWeek = () => {
    const d = new Date(currentWeekStart); d.setDate(d.getDate() + 7); setCurrentWeekStart(d);
    loadAvailableSlots(d);
  };
  const goToToday   = () => {
    const monday = getMonday(TODAY);
    setCurrentWeekStart(monday);
    loadAvailableSlots(monday);
  };
  const isToday     = (date: Date) => date.toDateString() === TODAY.toDateString();
  const isPastDate  = (date: Date) => {
    const hoy = new Date(); hoy.setHours(0, 0, 0, 0);
    const d   = new Date(date); d.setHours(0, 0, 0, 0);
    return d < hoy;
  };

  const isTimeSlotAvailable = (date: Date, time: string): boolean => {
    const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
    const slot = availableSlots.get(dateStr);
    
    if (!slot || !slot.hasSchedules) return false;
    
    return time >= slot.minTime && time < slot.maxTime;
  };

  const getDayScheduleInfo = (date: Date): { hasSchedules: boolean; minTime?: string; maxTime?: string } => {
    const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
    const slot = availableSlots.get(dateStr);
    
    if (!slot) return { hasSchedules: false };
    
    return {
      hasSchedules: slot.hasSchedules,
      minTime: slot.minTime,
      maxTime: slot.maxTime,
    };
  };

  const getEmployeesByCategory = (category: string) => {
    if (!category) return employees;
    const filtered = employees.filter(
      e => e.specialty?.toLowerCase().trim() === category.toLowerCase().trim()
    );
    return filtered.length > 0 ? filtered : employees;
  };

  // Cargar empleados asignados a un servicio específico (por especialidad)
  const loadEmployeesForService = async (serviceId: string) => {
    if (!serviceId) {
      setEmployeesForService([]);
      return;
    }
    
    try {
      // Encontrar la categoría del servicio
      const service = services.find(s => s.id === serviceId);
      if (!service || !service.category) {
        console.log('[loadEmployeesForService] Servicio no encontrado o sin categoría:', serviceId);
        setEmployeesForService([]);
        return;
      }
      
      console.log('[loadEmployeesForService] Servicio:', service.name, '| Categoría:', service.category);
      
      // Filtrar empleados por especialidad que coincida con la categoría del servicio
      const fechaStr = formData.date instanceof Date
        ? `${formData.date.getFullYear()}-${String(formData.date.getMonth()+1).padStart(2,"0")}-${String(formData.date.getDate()).padStart(2,"0")}`
        : String(formData.date).split("T")[0];
      
      console.log('[loadEmployeesForService] Fecha:', fechaStr);
      console.log('[loadEmployeesForService] Hora:', formData.startTime);
      
      // Obtener empleados disponibles en esa fecha y hora
      const empsDisponibles = await fetchEmployeesByDate(fechaStr, formData.startTime);
      console.log('[loadEmployeesForService] Empleados con horario en fecha:', empsDisponibles.map(e => `${e.name} (${e.specialty})`));
      
      // Filtrar por especialidad que coincida con la categoría del servicio (case-insensitive y trim)
      const empsEspecialistas = empsDisponibles.filter(e => {
        const empSpecialty = (e.specialty || '').toLowerCase().trim();
        const serviceCategory = (service.category || '').toLowerCase().trim();
        const match = empSpecialty === serviceCategory;
        console.log(`[loadEmployeesForService] ${e.name}: "${empSpecialty}" === "${serviceCategory}" ? ${match}`);
        return match;
      });
      
      console.log('[loadEmployeesForService] Empleados filtrados:', empsEspecialistas.length);
      
      // Solo actualizar si la lista cambió para evitar re-renders innecesarios
      setEmployeesForService(prev => {
        const prevIds = prev.map(e => e.id).sort().join(',');
        const newIds = empsEspecialistas.map(e => e.id).sort().join(',');
        if (prevIds === newIds) {
          console.log('[loadEmployeesForService] Lista sin cambios, no actualizar estado');
          return prev;
        }
        return empsEspecialistas;
      });
    } catch (err) {
      console.error("Error cargando empleados para servicio:", err);
      setEmployeesForService([]);
    }
  };

  // ── Servicios del formulario ──
  const handleAddService = () => {
    if (!currentService.serviceId) {
      toast.error("Selecciona un servicio"); return;
    }

    // Si es empleado, usar su propio perfil; si no, requerir selección de empleado
    const effectiveEmployeeId = userRole === "employee" && myEmployeeProfile
      ? myEmployeeProfile.id
      : currentService.employeeId;

    if (!effectiveEmployeeId) {
      toast.error("Selecciona un empleado"); return;
    }

    const service  = services.find(s => s.id === currentService.serviceId);
    // Para empleado logueado, usar su perfil directamente si no está en la lista
    const employee = employees.find(e => e.id === effectiveEmployeeId)
      ?? (userRole === "employee" && myEmployeeProfile && myEmployeeProfile.id === effectiveEmployeeId
          ? { id: myEmployeeProfile.id, name: myEmployeeProfile.name, specialty: myEmployeeProfile.specialty, color: "#1a5c3a" }
          : undefined);
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

  // Cuando cambia la hora de inicio, recalcular los startTime de todos los servicios
  const handleStartTimeChange = (newTime: string) => {
    startTimeRef.current = newTime;  // ← siempre actualizado, sin problema de closure
    setFormData(prev => ({ ...prev, startTime: newTime }));
    if (selectedServices.length > 0) {
      setSelectedServices(prev => prev.map((s, i, arr) => ({
        ...s,
        startTime: i === 0
          ? newTime
          : calculateEndTime(arr[i - 1].startTime, arr[i - 1].duration),
      })));
    }
  };

  // ── CRUD ──
  const handleCreateOrUpdate = async (overrideStartTime?: string) => {
    // Prevenir doble clic
    if (isCreatingOrUpdating.current) {
      console.log('⚠️ Cita en proceso, ignorando clic adicional');
      return;
    }

    // Ignorar si recibe un evento DOM en lugar de un string (llamada desde onSubmit del botón)
    const safeOverride = typeof overrideStartTime === "string" ? overrideStartTime : undefined;
    // Prioridad: parámetro explícito > ref (siempre actualizado) > estado
    const startTime = safeOverride ?? (startTimeRef.current || formData.startTime);

    if (!formData.clientId || !startTime || selectedServices.length === 0) {
      if (userRole === "client" && !formData.clientId) {
        toast.error("Tu perfil aún está cargando, espera un momento e intenta de nuevo"); return;
      }
      if (!formData.clientId) {
        toast.error("Por favor selecciona un cliente"); return;
      }
      if (!startTime) {
        toast.error("Por favor selecciona una hora de inicio"); return;
      }
      if (selectedServices.length === 0) {
        toast.error("Por favor agrega al menos un servicio"); return;
      }
      return;
    }
    
    // Validar que el clientId no sea 0 o NaN
    const clienteNumero = Number(formData.clientId);
    if (!clienteNumero || clienteNumero === 0 || isNaN(clienteNumero)) {
      toast.error("Por favor selecciona un cliente válido");
      return;
    }
    
    const hoy = new Date(); hoy.setHours(0, 0, 0, 0);
    const fechaCita = new Date(formData.date); fechaCita.setHours(0, 0, 0, 0);
    if (fechaCita < hoy) {
      toast.error("No puedes crear citas en fechas pasadas"); return;
    }

    const payload = {
      cliente:   clienteNumero,
      fecha:     formData.date.toISOString().split("T")[0],
      hora:      startTime,
      notas:     formData.notes || null,
      servicios: selectedServices.map(s => ({
        servicio:         Number(s.serviceId),
        empleado_usuario: Number(s.employeeId),
        precio:           null,
        detalle:          s.serviceName,
      })),
    };

    console.log("📤 [CREATE APPOINTMENT] Payload a enviar:", JSON.stringify(payload, null, 2));
    console.log("📤 [CREATE APPOINTMENT] formData.clientId:", formData.clientId);
    console.log("📤 [CREATE APPOINTMENT] Number(formData.clientId):", Number(formData.clientId));
    console.log("📤 [CREATE APPOINTMENT] clienteNumero:", clienteNumero);
    console.log("📤 [CREATE APPOINTMENT] formData completo:", formData);

    // VALIDACIÓN CRÍTICA: Si el cliente sigue siendo 0, abortar
    if (clienteNumero === 0) {
      console.error("❌ [CREATE APPOINTMENT] ERROR CRÍTICO: clienteNumero es 0");
      console.error("❌ [CREATE APPOINTMENT] formData.clientId:", formData.clientId);
      console.error("❌ [CREATE APPOINTMENT] clients disponibles:", clients);
      toast.error("Error: No se pudo establecer el cliente. Por favor selecciona un cliente manualmente.");
      return;
    }

    isCreatingOrUpdating.current = true;
    try {
      if (editingAppointment) {
        await updateAppointment(editingAppointment.id, payload, userRole === "client");
        toast.success("Cita actualizada");
      } else {
        await createAppointment(payload, userRole === "client", userRole === "employee");
        toast.success("Cita creada exitosamente");
      }
      await reloadAppointments();
      resetForm();
    } catch (err: any) {
      toast.error(err.message ?? "Error al guardar la cita");
    } finally {
      // Liberar después de 1 segundo para evitar doble clic rápido
      setTimeout(() => {
        isCreatingOrUpdating.current = false;
      }, 1000);
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
      await cancelAppointment(appointmentToCancel, userRole === "client");
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
    // Prevenir cambio de estado si la cita está completada
    const appointment = appointments.find(a => a.id === appointmentId);
    if (appointment?.status === "completed") {
      toast.error("No se puede cambiar el estado de una cita completada");
      return;
    }

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
    
    // Para clientes, preservar su clientId/Name/Phone
    // Para empleados, establecer el primer cliente disponible
    const isEmployee = userRole && userRole !== "client" && userRole !== "Cliente";
    
    if (isEmployee && clients.length > 0) {
      const firstClient = clients[0];
      console.log("🔧 [resetForm] Estableciendo primer cliente para empleado:", firstClient);
      setFormData({
        ...EMPTY_FORM,
        clientId:    String(firstClient.id),
        clientName:  firstClient.name,
        clientPhone: firstClient.phone,
      });
    } else {
      setFormData(prev => ({
        ...EMPTY_FORM,
        clientId:    userRole === "client" ? prev.clientId    : "",
        clientName:  userRole === "client" ? prev.clientName  : "",
        clientPhone: userRole === "client" ? prev.clientPhone : "",
      }));
    }
    
    setSelectedServices([]);
    setCurrentService({ serviceId: "", employeeId: "" });
  };

  const handleEdit = (appointment: Appointment) => {
    setEditingAppointment(appointment);
    const client = clients.find(c => c.name === appointment.clientName);
    startTimeRef.current = appointment.startTime;  // ← sincronizar ref al cargar
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
    isTimeSlotAvailable, getDayScheduleInfo,
    // handlers
    handleAddService, handleRemoveService,
    handleCreateOrUpdate, handleDelete, handleCancelAppointment,
    handleUpdateStatus, resetForm, handleEdit, handleClientChange,
    handleStartTimeChange,
    myEmployeeProfile,
    // employees for service
    employeesForService,
    loadEmployeesForService,
  };
}