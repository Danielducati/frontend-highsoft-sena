import { useState, useEffect, useRef } from "react";
import { toast } from "sonner";
import { Service, ServiceFormData } from "../types";
import { ITEMS_PER_PAGE, MAX_IMAGE_SIZE_MB, EMPTY_FORM } from "../constants";
import {
  fetchServicesApi, fetchCategoriesApi,
  createServiceApi, updateServiceApi, deleteServiceApi,
} from "../services/servicesService";

const NAME_MIN_LENGTH = 3;
const NAME_MAX_LENGTH = 100;
const DESCRIPTION_MAX_LENGTH = 600;
const DURATION_MIN = 5;
const DURATION_MAX = 600;
const PRICE_MIN = 1000;
const PRICE_MAX = 10000000;

export function useServices() {
  const [services,         setServices]         = useState<Service[]>([]);
  const [categories,       setCategories]       = useState<any[]>([]);
  const [loading,          setLoading]          = useState(true);
  const [searchTerm,       setSearchTerm]       = useState("");
  const [filterCategory,   setFilterCategory]   = useState("all");
  const [filterStatus,     setFilterStatus]     = useState("all");
  const [isDialogOpen,     setIsDialogOpen]     = useState(false);
  const [editingService,   setEditingService]   = useState<Service | null>(null);
  const [viewingService,   setViewingService]   = useState<Service | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [serviceToDelete,  setServiceToDelete]  = useState<number | null>(null);
  const [currentPage,      setCurrentPage]      = useState(1);
  const [formData,         setFormData]         = useState<ServiceFormData>({ ...EMPTY_FORM });
  const [imagePreview,     setImagePreview]     = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadServices();
    loadCategories();
  }, []);

  const loadServices = async () => {
    try {
      setLoading(true);
      setServices(await fetchServicesApi());
    } catch {
      toast.error("Error al cargar servicios");
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    try { setCategories(await fetchCategoriesApi()); }
    catch { toast.error("Error al cargar categorías"); }
  };

  // ── CRUD ──────────────────────────────────────────────────────────────────
  const validateServiceForm = () => {
    const name = formData.name.trim();
    const description = formData.description.trim();
    const duration = Number(formData.duration);
    const price = Number(formData.price);
    const categoryId = Number(formData.FK_categoria_servicios);

    if (!name || !formData.duration || !formData.price || !formData.FK_categoria_servicios) {
      toast.error("Por favor completa todos los campos obligatorios");
      return false;
    }

    if (name.length < NAME_MIN_LENGTH || name.length > NAME_MAX_LENGTH) {
      toast.error(`El nombre debe tener entre ${NAME_MIN_LENGTH} y ${NAME_MAX_LENGTH} caracteres`);
      return false;
    }

    if (description.length > DESCRIPTION_MAX_LENGTH) {
      toast.error(`La descripción no puede superar ${DESCRIPTION_MAX_LENGTH} caracteres`);
      return false;
    }

    if (!Number.isInteger(duration) || duration < DURATION_MIN || duration > DURATION_MAX) {
      toast.error(`La duración debe estar entre ${DURATION_MIN} y ${DURATION_MAX} minutos`);
      return false;
    }

    if (!Number.isFinite(price) || price < PRICE_MIN || price > PRICE_MAX) {
      toast.error(`El precio debe estar entre ${PRICE_MIN.toLocaleString("es-CO")} y ${PRICE_MAX.toLocaleString("es-CO")}`);
      return false;
    }

    if (!Number.isInteger(categoryId) || categoryId <= 0) {
      toast.error("Selecciona una categoría válida");
      return false;
    }

    const duplicated = services.find((s) => {
      if (editingService && s.id === editingService.id) return false;
      return s.name.trim().toLowerCase() === name.toLowerCase();
    });
    if (duplicated) {
      toast.error("Ya existe un servicio con ese nombre");
      return false;
    }

    return true;
  };

  const handleCreateOrUpdate = async () => {
    if (!validateServiceForm()) {
      return;
    }

    const duration = Number(formData.duration);
    const price = Number(formData.price);
    const name = formData.name.trim();
    const description = formData.description.trim();

    const body = {
      nombre:                 name,
      descripcion:            description,
      FK_categoria_servicios: parseInt(formData.FK_categoria_servicios),
      Duracion:               duration,
      Precio:                 price,
      imagen_servicio:        formData.image || null,
      Estado:                 "Activo",
    };
    try {
      if (editingService) {
        await updateServiceApi(editingService.id, body);
        toast.success("Servicio actualizado exitosamente");
      } else {
        await createServiceApi(body);
        toast.success("Servicio creado exitosamente");
      }
      await loadServices();
      handleCloseDialog();
    } catch (err: any) {
      toast.error(err.message || "Error al guardar el servicio");
    }
  };

  const handleDelete = async () => {
    if (!serviceToDelete) return;
    try {
      await deleteServiceApi(serviceToDelete);
      toast.success("Servicio eliminado exitosamente");
      await loadServices();
    } catch (err: any) {
      toast.error(err.message || "Error al eliminar el servicio");
    } finally {
      setDeleteDialogOpen(false);
      setServiceToDelete(null);
    }
  };

  const handleToggleStatus = async (service: Service) => {
    try {
      const nuevoEstado = service.isActive ? "Inactivo" : "Activo";
  
      await updateServiceApi(service.id, {
        nombre: service.name,
        descripcion: service.description,
        FK_categoria_servicios: service.categoryId,
        Duracion: service.duration,
        Precio: service.price,
        imagen_servicio: service.image,
        Estado: nuevoEstado,
      });
  
      toast.success(`Servicio ${nuevoEstado.toLowerCase()} correctamente`);
  
      await loadServices(); // recarga correcta
    } catch (error: any) {
      toast.error(error.message || "Error al cambiar el estado");
    }
  };

  const confirmDelete = (id: number) => {
    setServiceToDelete(id);
    setDeleteDialogOpen(true);
  };

  const handleEdit = (service: Service) => {
    setEditingService(service);
    const cat = categories.find(c => c.name === service.category);
    setFormData({
      name:                   service.name,
      description:            service.description || "",
      duration:               service.duration.toString(),
      price:                  service.price.toString(),
      category:               service.category,
      image:                  service.image,
      FK_categoria_servicios: cat?.id?.toString() || service.categoryId?.toString() || "",
    });
    setImagePreview(service.image);
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingService(null);
    setFormData({ ...EMPTY_FORM });
    setImagePreview("");
  };

  // ── Imagen ────────────────────────────────────────────────────────────────
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const allowedTypes = ["image/png", "image/jpeg", "image/jpg", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      toast.error("Formato inválido. Usa PNG, JPG o WEBP");
      return;
    }
    if (file.size > MAX_IMAGE_SIZE_MB * 1024 * 1024) {
      toast.error(`La imagen debe ser menor a ${MAX_IMAGE_SIZE_MB}MB`);
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      setImagePreview(result);
      setFormData(prev => ({ ...prev, image: result }));
    };
    reader.readAsDataURL(file);
  };

  const clearImage = () => {
    setImagePreview("");
    setFormData(prev => ({ ...prev, image: "" }));
  };

  // ── Filtros / paginación ───────────────────────────────────────────────────
  const filteredServices = services.filter(s => {
    const matchSearch   = s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          s.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchCategory = filterCategory === "all" || s.category === filterCategory;
    const matchStatus   = filterStatus === "all" ||
                          (filterStatus === "active"   &&  s.isActive) ||
                          (filterStatus === "inactive" && !s.isActive);
    return matchSearch && matchCategory && matchStatus;
  });

  const totalPages        = Math.ceil(filteredServices.length / ITEMS_PER_PAGE);
  const startIndex        = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex          = startIndex + ITEMS_PER_PAGE;
  const paginatedServices = filteredServices.slice(startIndex, endIndex);

  return {
    services, categories, loading,
    searchTerm, setSearchTerm,
    filterCategory, setFilterCategory,
    filterStatus, setFilterStatus,
    isDialogOpen, setIsDialogOpen,
    editingService, viewingService, setViewingService,
    deleteDialogOpen, setDeleteDialogOpen,
    formData, setFormData,
    imagePreview, fileInputRef,
    currentPage, setCurrentPage,
    filteredServices, paginatedServices, totalPages, startIndex, endIndex,
    handleCreateOrUpdate, handleDelete, handleToggleStatus,
    confirmDelete, handleEdit, handleCloseDialog,
    handleImageSelect, clearImage,
  };
}