import { useState, useEffect } from "react";
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

  const registerSale = async (
    formData: SaleFormData,
    saleType: "appointment" | "direct"
  ): Promise<boolean> => {
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
    }
  };

  return { sales, appointments, availableServices, clients, employees, loading, saving, registerSale,
    filterClient, setFilterClient
   };
}