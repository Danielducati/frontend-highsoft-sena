import { useState, useEffect, useRef, useCallback } from "react";
import { toast } from "sonner";
import { salesApi } from "../services/salesApi";
import { Appointment, Sale, SaleFormData } from "../types";
import { EMPTY_FORM } from "../constants";

export function useSales() {
  const [sales,             setSales]             = useState<Sale[]>([]);
  const [appointments,      setAppointments]      = useState<Appointment[]>([]);
  const [availableServices, setAvailableServices] = useState<any[]>([]);
  const [clients,           setClients]           = useState<any[]>([]);
  const [employees,         setEmployees]         = useState<any[]>([]);
  const [loading,           setLoading]           = useState(true);
  const [saving,            setSaving]            = useState(false);
  const [searchTerm, setSearchTerm]               = useState("");
  const [filterStatus, setFilterStatus]           = useState("all");
  const [filterClient, setFilterClient]           = useState("all");
  const [employeesForService, setEmployeesForService] = useState<any[]>([]);
  
  // Protección contra doble clic
  const isProcessing = useRef(false);

  useEffect(() => {
    async function fetchAll() {
      try {
        const [salesData, apptData, svcData, clientsData, empData] = await Promise.all([
          salesApi.getSales(),
          salesApi.getAppointments(),
          salesApi.getServices(),
          salesApi.getClients(),
          salesApi.getEmployees(),
        ]);
        setSales(salesData);
        setAppointments(apptData);
        setAvailableServices(svcData);
        setClients(clientsData);
        setEmployees(empData);
      } catch (err: any) {
        toast.error(err.message ?? "Error al cargar datos");
      } finally {
        setLoading(false);
      }
    }
    fetchAll();
  }, []);

  const reload = async () => {
    const [salesData, apptData] = await Promise.all([
      salesApi.getSales(),
      salesApi.getAppointments(),
    ]);
    setSales(salesData);
    setAppointments(apptData);
  };

  // Cargar empleados disponibles para un servicio específico (por especialidad)
  const loadEmployeesForService = useCallback((serviceId: number) => {
    if (!serviceId) {
      setEmployeesForService([]);
      return;
    }
    
    try {
      // Encontrar la categoría del servicio
      const service = availableServices.find(s => String(s.id) === String(serviceId));
      if (!service || !service.category) {
        console.log('[loadEmployeesForService] Servicio no encontrado o sin categoría:', serviceId);
        setEmployeesForService([]);
        return;
      }
      
      console.log('[loadEmployeesForService] Servicio:', service.name, '| Categoría:', service.category);
      
      // Normalizar string para comparación (quitar acentos, espacios, minúsculas)
      const normalize = (str: string) => 
        str.toLowerCase()
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "")
          .trim()
          .replace(/\s+/g, "");
      
      const serviceCategory = normalize(service.category);
      
      // Filtrar empleados activos por especialidad que coincida con la categoría del servicio
      const activeEmployees = employees.filter(e => 
        e.isActive !== false && e.estado !== "Inactivo"
      );
      
      const empsEspecialistas = activeEmployees.filter(e => {
        const empSpecialty = normalize(e.specialty ?? e.especialidad ?? "");
        const match = empSpecialty === serviceCategory;
        console.log(`[loadEmployeesForService] ${e.name}: "${empSpecialty}" === "${serviceCategory}" ? ${match}`);
        return match;
      });
      
      console.log('[loadEmployeesForService] Empleados filtrados:', empsEspecialistas.length);
      
      // Si no hay empleados con esa especialidad, mostrar todos los activos
      setEmployeesForService(empsEspecialistas.length > 0 ? empsEspecialistas : activeEmployees);
    } catch (err) {
      console.error("Error filtrando empleados para servicio:", err);
      setEmployeesForService(employees.filter(e => e.isActive !== false && e.estado !== "Inactivo"));
    }
  }, [availableServices, employees]);

  const registerSale = async (
    formData: SaleFormData,
    saleType: "appointment" | "direct"
  ): Promise<boolean> => {
    // Prevenir doble clic
    if (isProcessing.current) {
      console.log('⚠️ Venta en proceso, ignorando clic adicional');
      return false;
    }

    if (saleType === "appointment" && !formData.appointmentId) {
      toast.error("Debes seleccionar una cita");
      return false;
    }
    if (saleType === "direct" && !formData.clienteId && !formData.guestMode) {
      toast.error("Debes seleccionar un cliente");
      return false;
    }
    if (saleType === "direct" && formData.guestMode && !formData.guestFirstName?.trim()) {
      toast.error("El nombre del cliente es obligatorio");
      return false;
    }
    if (saleType === "direct" && formData.selectedServices.length === 0) {
      toast.error("Debes agregar al menos un servicio");
      return false;
    }

    isProcessing.current = true;
    setSaving(true);
    try {
      await salesApi.create(formData, saleType);
      toast.success("Venta registrada exitosamente");
      await reload();
      return true;
    } catch (err: any) {
      toast.error(err.message ?? "Error al registrar venta");
      return false;
    } finally {
      setSaving(false);
      // Liberar después de 1 segundo para evitar doble clic rápido
      setTimeout(() => {
        isProcessing.current = false;
      }, 1000);
    }
  };

  return { sales, appointments, availableServices, clients, employees, loading, saving, registerSale,
    filterClient, setFilterClient, employeesForService, loadEmployeesForService,
   };
}