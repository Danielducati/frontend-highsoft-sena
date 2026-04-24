import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Quotation, QuotationFormData, QuotationItem, QuotationStatus } from "../types";
import { ITEMS_PER_PAGE, API_URL } from "../constants";
import {
  fetchQuotationsApi, fetchClientsApi, fetchServicesApi, fetchMyEmployeeServicesApi,
  createQuotationApi, updateQuotationApi, updateQuotationStatusApi,
  fetchMyProfileApi,
} from "../services/quotationsService";

const getToken = () => localStorage.getItem("token");

async function fetchMyEmployeeProfileApi(): Promise<{ id: string; name: string; specialty: string }> {
  const res = await fetch(`${API_URL}/employees/mi-perfil`, {
    headers: { Authorization: `Bearer ${getToken()}` },
  });
  if (!res.ok) throw new Error("Error al cargar perfil de empleado");
  const data = await res.json();
  return {
    id:        String(data.id),
    name:      data.name ?? `${data.nombre ?? ""} ${data.apellido ?? ""}`.trim(),
    specialty: data.specialty ?? data.especialidad ?? "",
  };
}

const EMPTY_FORM: QuotationFormData = {
  clientId: "",
  date: new Date().toISOString().split("T")[0],
  startTime: "",
  notes: "",
  selectedServices: [],
  discount: "0",
};

export function useQuotations(userRole?: string) {
  const [quotations,         setQuotations]         = useState<Quotation[]>([]);
  const [clients,            setClients]            = useState<any[]>([]);
  const [availableServices,  setAvailableServices]  = useState<any[]>([]);
  const [employees,          setEmployees]          = useState<any[]>([]);
  const [loading,            setLoading]            = useState(true);
  const [searchTerm,         setSearchTerm]         = useState("");
  const [filterStatus,       setFilterStatus]       = useState("all");
  const [isDialogOpen,       setIsDialogOpen]       = useState(false);
  const [viewingQuotation,   setViewingQuotation]   = useState<Quotation | null>(null);
  const [editingQuotation,   setEditingQuotation]   = useState<Quotation | null>(null);
  const [cancelDialogOpen,   setCancelDialogOpen]   = useState(false);
  const [quotationToCancel,  setQuotationToCancel]  = useState<number | null>(null);
  const [currentPage,        setCurrentPage]        = useState(1);
  const [formData,           setFormData]           = useState<QuotationFormData>(EMPTY_FORM);
  const [filterClient,       setFilterClient]       = useState("all");
  const [myClientData,       setMyClientData]       = useState<{ id: number; nombre: string; apellido: string } | null>(null);
  const [myEmployeeData,     setMyEmployeeData]     = useState<{ id: string; name: string; specialty: string } | null>(null);

  useEffect(() => {
    loadQuotations();
    if (userRole === "client") {
      loadServices();
      loadMyProfile();
    } else if (userRole === "employee") {
      loadClients();
      Promise.all([fetchMyEmployeeServicesApi(), fetchMyEmployeeProfileApi()])
        .then(async ([svcData, emp]) => {
          const list = Array.isArray(svcData) ? svcData : [];
          setAvailableServices(list.map((s: any) => ({
            id:       s.id,
            name:     s.name     ?? s.nombre    ?? "",
            category: s.category ?? s.categoria ?? "",
            price:    s.price    ?? s.precio    ?? 0,
          })));
          setMyEmployeeData(emp);
          setEmployees([{
            id:        emp.id,
            name:      emp.name,
            specialty: emp.specialty,
            isActive:  true,
            estado:    "Activo",
            color:     "#78D1BD",
          }]);
        })
        .catch(() => { loadServices(); loadEmployees(); });
    } else {
      loadServices();
      loadClients();
      loadEmployees();
    }
  }, []);

  const loadMyProfile = async () => {
    try {
      const profile = await fetchMyProfileApi();
      setMyClientData(profile);
      setFormData(prev => ({ ...prev, clientId: profile.id.toString() }));
    } catch {
      toast.error("Error al cargar tu perfil de cliente");
    }
  };

  const loadQuotations = async () => {
    try {
      setLoading(true);
      setQuotations(await fetchQuotationsApi());
    } catch {
      toast.error("Error al cargar cotizaciones");
    } finally {
      setLoading(false);
    }
  };

  const loadClients = async () => {
    try { setClients(await fetchClientsApi()); }
    catch { toast.error("Error al cargar clientes"); }
  };

  const loadServices = async () => {
    try {
      const data = await fetchServicesApi();
      const list = Array.isArray(data) ? data : [];
      setAvailableServices(list.map((s: any) => ({
        id:       s.id,
        name:     s.name     ?? s.nombre    ?? "",
        category: s.category ?? s.categoria ?? "",
        price:    s.price    ?? s.precio    ?? 0,
      })));
    } catch { toast.error("Error al cargar servicios"); }
  };

  const loadEmployees = async () => {
    try {
      const res  = await fetch(`${API_URL}/employees`, { headers: { Authorization: `Bearer ${getToken()}` } });
      if (!res.ok) throw new Error("Error al cargar empleados");
      const data = await res.json();
      const list = Array.isArray(data) ? data : [];
      setEmployees(list.map((e: any) => ({
        id:        e.id,
        name:      e.name ?? `${e.nombre ?? ""} ${e.apellido ?? ""}`.trim(),
        specialty: e.specialty ?? e.especialidad ?? "",
        isActive:  e.isActive !== undefined ? e.isActive : e.estado === "Activo",
        estado:    e.estado ?? "Activo",
        color:     e.color ?? "#78D1BD",
      })));
    } catch (error) {
      console.error("Error al cargar empleados:", error);
      toast.error("No se pudieron cargar los empleados");
    }
  };

  // ── CRUD ──────────────────────────────────────────────────────────────────
  const handleCreate = async () => {
    if (!formData.guestMode && !formData.clientId) {
      toast.error("Por favor selecciona un cliente o ingresa los datos del cliente ocasional");
      return;
    }
    if (formData.guestMode && !formData.guestFirstName?.trim()) {
      toast.error("El nombre del cliente es obligatorio");
      return;
    }
    if (formData.selectedServices.length === 0) {
      toast.error("Por favor agrega al menos un servicio");
      return;
    }
    const body: any = {
      id_cliente:  formData.guestMode ? null : parseInt(formData.clientId),
      fecha:       formData.date,
      hora_inicio: formData.startTime || null,
      notas:       formData.notes,
      descuento:   parseFloat(formData.discount) || 0,
      servicios:   formData.selectedServices.map(s => ({
        id_servicio:   s.serviceId,
        precio:        s.price,
        cantidad:      s.quantity,
        empleado_id:   s.empleadoId   ?? null,
        empleado_name: s.empleadoName ?? null,
      })),
    };
    if (formData.guestMode) {
      body.clienteOcasional = {
        firstName: formData.guestFirstName?.trim(),
        lastName:  formData.guestLastName?.trim()  || "",
        email:     formData.guestEmail?.trim()     || null,
        phone:     formData.guestPhone?.trim()     || null,
      };
    }
    try {
      if (editingQuotation) {
        await updateQuotationApi(editingQuotation.id, body);
        toast.success("Cotización actualizada exitosamente");
      } else {
        await createQuotationApi(body);
        toast.success("Cotización creada exitosamente");
      }
      await loadQuotations();
      resetForm();
    } catch {
      toast.error("Error al guardar la cotización");
    }
  };

  const handleStatusChange = async (id: number, newStatus: QuotationStatus) => {
    try {
      await updateQuotationStatusApi(id, newStatus);
      toast.success("Estado actualizado");
      await loadQuotations();
    } catch {
      toast.error("Error al actualizar estado");
    }
  };

  const handleCancel = async () => {
    if (!quotationToCancel) return;
    await handleStatusChange(quotationToCancel, "cancelled");
    setCancelDialogOpen(false);
    setQuotationToCancel(null);
  };

  const confirmCancel = (id: number) => {
    setQuotationToCancel(id);
    setCancelDialogOpen(true);
  };

  // ── Servicios en el formulario ─────────────────────────────────────────────
  const addService = (serviceId: number) => {
    const service = availableServices.find(s => String(s.id) === String(serviceId));
    if (!service) return;
    const existingIdx = formData.selectedServices.findIndex(s => String(s.serviceId) === String(serviceId));
    if (existingIdx >= 0) {
      const updated = [...formData.selectedServices];
      updated[existingIdx].quantity += 1;
      setFormData({ ...formData, selectedServices: updated });
      toast.success("Cantidad actualizada");
    } else {
      // Si es empleado, asignarlo automáticamente
      const newItem: QuotationItem = {
        serviceId:    service.id,
        serviceName:  service.name,
        price:        service.price,
        quantity:     1,
        empleadoId:   myEmployeeData ? Number(myEmployeeData.id) : undefined,
        empleadoName: myEmployeeData?.name ?? undefined,
      };
      setFormData({
        ...formData,
        selectedServices: [...formData.selectedServices, newItem],
      });
      toast.success("Servicio agregado");
    }
  };

  const removeService = (serviceId: number) =>
    setFormData({ ...formData, selectedServices: formData.selectedServices.filter(s => s.serviceId !== serviceId) });

  const updateQuantity = (serviceId: number, quantity: number) =>
    setFormData({
      ...formData,
      selectedServices: formData.selectedServices.map(s =>
        s.serviceId === serviceId ? { ...s, quantity: Math.max(1, quantity) } : s
      ),
    });

  const updateServiceEmployee = (serviceId: number, empleadoId: number, empleadoName: string) =>
    setFormData({
      ...formData,
      selectedServices: formData.selectedServices.map(s =>
        s.serviceId === serviceId ? { ...s, empleadoId, empleadoName } : s
      ),
    });

  const calculateSubtotal = () =>
    formData.selectedServices.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const calculateTotal = () => calculateSubtotal() - (parseFloat(formData.discount) || 0);

  const handleEdit = (quotation: Quotation) => {
    setEditingQuotation(quotation);
    const client = clients.find(c => `${c.nombre} ${c.apellido}` === quotation.clientName);
    setFormData({
      clientId:         client?.id?.toString() || quotation.FK_id_cliente?.toString() || "",
      date:             quotation.date?.split("T")[0] || new Date().toISOString().split("T")[0],
      startTime:        quotation.startTime || "",
      notes:            quotation.notes || "",
      selectedServices: quotation.items || [],
      discount:         quotation.discount?.toString() || "0",
    });
    setIsDialogOpen(true);
  };

  const resetForm = () => {
    setIsDialogOpen(false);
    setEditingQuotation(null);
    setFormData({ ...EMPTY_FORM, date: new Date().toISOString().split("T")[0], guestMode: false, guestFirstName: "", guestLastName: "", guestPhone: "", guestEmail: "" });
  };

  // ── Filtros / paginación ───────────────────────────────────────────────────
  const filteredQuotations = quotations.filter(q => {
    const matchesSearch =
      q.clientName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      filterStatus === "all" || q.status === filterStatus;
    const matchesClient =
    filterClient === "all" || q.FK_id_cliente?.toString() === filterClient;
    return matchesSearch && matchesStatus && matchesClient;
  });

  const totalPages          = Math.ceil(filteredQuotations.length / ITEMS_PER_PAGE);
  const startIndex          = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedQuotations = filteredQuotations.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  const totalAmount         = quotations.reduce((sum, q) => sum + (q.total || 0), 0);
  const pendingCount        = quotations.filter(q => q.status === "pending").length;
  const approvedCount       = quotations.filter(q => q.status === "approved").length;

  return {
    quotations, clients, availableServices, loading,
    searchTerm, setSearchTerm,
    filterStatus, setFilterStatus,
    isDialogOpen, setIsDialogOpen,
    viewingQuotation, setViewingQuotation,
    editingQuotation,
    cancelDialogOpen, setCancelDialogOpen,
    formData, setFormData,
    currentPage, setCurrentPage, totalPages, startIndex,
    filteredQuotations, paginatedQuotations,
    totalAmount, pendingCount, approvedCount,
    handleCreate, handleStatusChange, handleCancel,
    confirmCancel, handleEdit, resetForm,
    addService, removeService, updateQuantity, updateServiceEmployee,
    calculateSubtotal, calculateTotal,
    filterClient, setFilterClient,
    myClientData, employees,
  };
}