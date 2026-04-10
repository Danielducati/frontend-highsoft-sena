import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Quotation, QuotationFormData, QuotationItem, QuotationStatus } from "../types";
import { ITEMS_PER_PAGE } from "../constants";
import {
  fetchQuotationsApi, fetchClientsApi, fetchServicesApi,
  createQuotationApi, updateQuotationApi, updateQuotationStatusApi,
  fetchMyProfileApi,
} from "../services/quotationsService";

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

  useEffect(() => {
    loadQuotations();
    loadServices();
    if (userRole === "client") {
      loadMyProfile();
    } else {
      loadClients();
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
    try { setAvailableServices(await fetchServicesApi()); }
    catch { toast.error("Error al cargar servicios"); }
  };

  // ── CRUD ──────────────────────────────────────────────────────────────────
  const handleCreate = async () => {
    if (!formData.clientId || formData.selectedServices.length === 0) {
      toast.error("Por favor selecciona un cliente y al menos un servicio");
      return;
    }
    const body = {
      id_cliente:  parseInt(formData.clientId),
      fecha:       formData.date,
      hora_inicio: formData.startTime || null,
      notas:       formData.notes,
      descuento:   parseFloat(formData.discount) || 0,
      servicios:   formData.selectedServices.map(s => ({
        id_servicio: s.serviceId,
        precio:      s.price,
        cantidad:    s.quantity,
      })),
    };
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
    const service = availableServices.find(s => s.id === serviceId);
    if (!service) return;
    const existingIdx = formData.selectedServices.findIndex(s => s.serviceId === serviceId);
    if (existingIdx >= 0) {
      const updated = [...formData.selectedServices];
      updated[existingIdx].quantity += 1;
      setFormData({ ...formData, selectedServices: updated });
      toast.success("Cantidad actualizada");
    } else {
      setFormData({
        ...formData,
        selectedServices: [...formData.selectedServices, {
          serviceId: service.id, serviceName: service.name, price: service.price, quantity: 1,
        }],
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
    setFormData({ ...EMPTY_FORM, date: new Date().toISOString().split("T")[0] });
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
    addService, removeService, updateQuantity,
    calculateSubtotal, calculateTotal,
    filterClient, setFilterClient,
    myClientData,
  };
}